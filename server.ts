import 'dotenv/config'; // loads a local .env into process.env — GEMINI_API_KEY, etc.
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './src/server/db';
import { lookupUsernameDirectory, fetchStoreFromCloud } from './src/server/firestore';
import { getMysqlPool, ensureMysqlSchema } from './src/server/mysql';
import { UserRole, User } from './src/types';

async function startServer() {
  const app = express();
  // Managed Node hosts (Hostinger, Render, Railway, etc.) assign a port via env var
  // and expect the app to bind to it — a hardcoded port breaks deployment there.
  const PORT = Number(process.env.PORT) || 3000;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  // 20mb accommodates scanned PDF bills and spreadsheet uploads, not just photos
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // --- MULTI-TENANT & AUTH MIDDLEWARE ---
  app.use((req, res, next) => {
    const storeIdHeader = (req.headers['x-store-id'] as string) || 'store-demo';
    const roleHeader = (req.headers['x-user-role'] as UserRole) || 'owner';
    req.storeId = storeIdHeader;
    req.user = {
      id: 'user-current',
      name: roleHeader === 'admin' ? 'System Administrator' : roleHeader === 'owner' ? 'Shop Owner' : 'Shop Staff',
      role: roleHeader,
      storeId: storeIdHeader
    };
    next();
  });

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'KiranaMate', timestamp: new Date().toISOString() });
  });

  // Register New Store Account (Zero Demo Data!)
  app.post('/api/auth/register', (req, res) => {
    const { username, password, shopName, ownerName, mobile, sector, country } = req.body;
    if (!username || !shopName || !ownerName) {
      return res.status(400).json({ error: 'Username, Shop Name, and Owner Name are required' });
    }

    try {
      const result = db.registerStore({
        username,
        password,
        shopName,
        ownerName,
        mobile: mobile || '9876543210',
        sector,
        country,
        acceptLanguage: req.headers['accept-language'] as string
      });
      const token = `token-owner-${Date.now()}`;
      res.status(201).json({
        success: true,
        user: { ...result.user, token },
        storeId: result.storeId
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    const { username, password, sector } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const cleanUser = username.trim().toLowerCase();
    if (cleanUser === 'apex7tech@gmail.com' || cleanUser === 'admin') {
      const adminUser: User = {
        id: 'user-admin',
        name: 'System Administrator',
        username: 'apex7tech@gmail.com',
        role: 'admin',
        mobile: '9876543210',
        storeId: 'store-demo',
        storeName: 'TradeMate Central Admin',
        permissions: {
          canViewReports: true,
          canEditProducts: true,
          canDeleteRecords: true,
          canCollectPayments: true,
          canCreateOrders: true,
          canManageSettings: true
        }
      };
      return res.json({
        success: true,
        user: { ...adminUser, token: `token-admin-${Date.now()}` },
        storeId: 'store-demo'
      });
    }

    let found = db.getUserByUsername(username);

    // Not in this server process's current in-memory map — before assuming
    // the account genuinely doesn't exist, check the durable cloud directory.
    // This is the fix for a real data-loss bug: a server restart (any
    // redeploy) used to wipe the in-memory map, and the OLD code here would
    // silently register a brand-new, empty store under a fresh random ID the
    // moment a known user like Deshna Global logged back in — orphaning all
    // their real purchase/stock data in the process. Now it looks the
    // username up in Firestore first and re-hydrates the SAME store instead.
    if (!found) {
      try {
        const directoryHit = await lookupUsernameDirectory(username);
        if (directoryHit?.storeId) {
          const cloudData = await fetchStoreFromCloud(directoryHit.storeId);
          if (cloudData && (cloudData as any).users) {
            db.hydrateStoreFromData(directoryHit.storeId, cloudData as any);
            const cleanUser = username.trim().toLowerCase();
            const matchedUser = (cloudData as any).users.find((u: User) => u.username.toLowerCase() === cleanUser) || (cloudData as any).users[0];
            if (matchedUser) {
              found = { user: matchedUser, storeId: directoryHit.storeId };
            }
          }
        }
      } catch (err) {
        console.error('Cloud directory lookup failed during login:', err);
      }
    }

    if (!found) {
      if (username.includes('@') || username.trim().length >= 3) {
        const cleanName = username.trim().toLowerCase();
        let shopName = 'Commercial Enterprise';
        if (cleanName.includes('deshna')) shopName = 'Deshna Global';
        else if (cleanName.includes('arun')) shopName = 'Deinrim Solutionss (P) Ltd.';
        else shopName = `${username.split('@')[0].toUpperCase()} Enterprise`;

        const ownerName = username.split('@')[0];
        try {
          const regResult = db.registerStore({
            username: username.trim(),
            password: password || '123456',
            shopName,
            ownerName,
            mobile: '9836130393',
            sector: sector || (cleanName.includes('arun') || cleanName.includes('deshna') ? 'METALS_STEEL' : 'KIRANA_FMCG'),
            acceptLanguage: req.headers['accept-language'] as string
          });
          found = { user: regResult.user, storeId: regResult.storeId };
        } catch (err) {
          return res.status(401).json({ error: 'Account not found. Please check username or register a new store.' });
        }
      } else {
        return res.status(401).json({ error: 'Account not found. Please check username or register a new store.' });
      }
    }

    if (sector) {
      db.updateSettings(found.storeId, { sector });
    }

    const token = `token-${found.user.role}-${Date.now()}`;
    return res.json({
      success: true,
      user: { ...found.user, token },
      storeId: found.storeId
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const users = db.getUsers(req.storeId);
    res.json({ users });
  });

  app.put('/api/auth/permissions/:userId', (req, res) => {
    const { userId } = req.params;
    const { permissions } = req.body;
    const updated = db.updateUserPermissions(req.storeId, userId, permissions);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: updated });
  });

  // System Admin Stores Overview
  app.get('/api/admin/stores', (req, res) => {
    const stores = db.getAllStoresSummary();
    res.json({ stores });
  });

  // Store Settings
  app.get('/api/settings', (req, res) => {
    res.json(db.getSettings(req.storeId));
  });

  app.put('/api/settings', (req, res) => {
    const updated = db.updateSettings(req.storeId, req.body);
    res.json(updated);
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', (req, res) => {
    res.json(db.getDailyStats(req.storeId));
  });

  // Customers & Udhaar
  app.get('/api/customers', (req, res) => {
    const search = req.query.search as string;
    const area = req.query.area as string;
    res.json(db.getCustomers(req.storeId, search, area));
  });

  app.get('/api/customers/:id', (req, res) => {
    const customer = db.getCustomerById(req.storeId, req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const ledger = db.getCustomerLedger(req.storeId, req.params.id);
    res.json({ customer, ledger });
  });

  app.post('/api/customers', (req, res) => {
    try {
      const newCust = db.createCustomer(req.storeId, req.body);
      res.status(201).json(newCust);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create customer' });
    }
  });

  app.put('/api/customers/:id', (req, res) => {
    const updated = db.updateCustomer(req.storeId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Customer not found' });
    res.json(updated);
  });

  app.delete('/api/customers/:id', (req, res) => {
    const success = db.deleteCustomer(req.storeId, req.params.id);
    if (!success) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true });
  });

  app.post('/api/customers/:id/payments', (req, res) => {
    const { amount, paymentMethod, notes, recordedBy } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid payment amount required' });
    const tx = db.recordCustomerPayment(req.storeId, req.params.id, Number(amount), paymentMethod || 'CASH', notes, recordedBy);
    if (!tx) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true, transaction: tx });
  });

  // Products & Stock
  app.get('/api/products', (req, res) => {
    const search = req.query.search as string;
    const category = req.query.category as string;
    const stockFilter = req.query.stockFilter as string;
    res.json(db.getProducts(req.storeId, search, category, stockFilter));
  });

  app.get('/api/products/barcode/:code', (req, res) => {
    const prod = db.getProductByBarcode(req.storeId, req.params.code);
    if (!prod) return res.status(404).json({ error: 'Product not found with this barcode' });
    res.json(prod);
  });

  app.get('/api/products/:id', (req, res) => {
    const prod = db.getProductById(req.storeId, req.params.id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    res.json(prod);
  });

  app.post('/api/products', (req, res) => {
    try {
      const prod = db.createProduct(req.storeId, req.body);
      res.status(201).json(prod);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create product' });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    const updated = db.updateProduct(req.storeId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  });

  app.delete('/api/products/:id', (req, res) => {
    const success = db.deleteProduct(req.storeId, req.params.id);
    if (!success) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  });

  app.post('/api/products/:id/add-stock', (req, res) => {
    const { qtyToAdd, notes } = req.body;
    if (!qtyToAdd || Number(qtyToAdd) <= 0) {
      return res.status(400).json({ error: 'Quantity must be positive' });
    }
    const updated = db.addStockToProduct(req.storeId, req.params.id, Number(qtyToAdd), notes);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product: updated });
  });

  app.post('/api/products/bulk-import', (req, res) => {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products array provided for import' });
    }
    const result = db.bulkImportProducts(req.storeId, products);
    res.json(result);
  });

  // Sales (30-Sec Express Sale)
  app.get('/api/sales', (req, res) => {
    const search = req.query.search as string;
    res.json(db.getSales(req.storeId, search));
  });

  app.post('/api/sales', (req, res) => {
    try {
      const sale = db.createSale(req.storeId, req.body);
      res.status(201).json(sale);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to record sale' });
    }
  });

  app.put('/api/sales/:id', (req, res) => {
    const updated = db.updateSale(req.storeId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Sale not found' });
    res.json(updated);
  });

  app.delete('/api/sales/:id', (req, res) => {
    const success = db.deleteSale(req.storeId, req.params.id);
    if (!success) return res.status(404).json({ error: 'Sale not found' });
    res.json({ success: true });
  });

  app.post('/api/sales/:id/void', (req, res) => {
    const reason = (req.body?.reason || '').trim();
    if (!reason) return res.status(400).json({ error: 'A reason is required to void a sale.' });
    const voided = db.voidSale(req.storeId, req.params.id, reason);
    if (!voided) return res.status(404).json({ error: 'Sale not found' });
    res.json(voided);
  });

  // Orders
  app.get('/api/orders', (req, res) => {
    const search = req.query.search as string;
    const status = req.query.status as string;
    res.json(db.getOrders(req.storeId, search, status));
  });

  app.post('/api/orders', (req, res) => {
    try {
      const order = db.createOrder(req.storeId, req.body);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create order' });
    }
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { orderStatus, paymentStatus } = req.body;
    const updated = db.updateOrderStatus(req.storeId, req.params.id, orderStatus, paymentStatus);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  });

  app.put('/api/orders/:id', (req, res) => {
    const updated = db.updateOrder(req.storeId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  });

  app.delete('/api/orders/:id', (req, res) => {
    const success = db.deleteOrder(req.storeId, req.params.id);
    if (!success) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  });

  // Expenses
  app.get('/api/expenses', (req, res) => {
    res.json(db.getExpenses(req.storeId));
  });

  app.post('/api/expenses', (req, res) => {
    try {
      const exp = db.createExpense(req.storeId, req.body);
      res.status(201).json(exp);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create expense' });
    }
  });

  app.put('/api/expenses/:id', (req, res) => {
    const updated = db.updateExpense(req.storeId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Expense not found' });
    res.json(updated);
  });

  app.delete('/api/expenses/:id', (req, res) => {
    const success = db.deleteExpense(req.storeId, req.params.id);
    if (!success) return res.status(404).json({ error: 'Expense not found' });
    res.json({ success: true });
  });

  // Suppliers & Purchases
  app.get('/api/suppliers', (req, res) => {
    res.json(db.getSuppliers(req.storeId));
  });

  app.post('/api/suppliers', (req, res) => {
    const sup = db.createSupplier(req.storeId, req.body);
    res.status(201).json(sup);
  });

  app.put('/api/suppliers/:id', (req, res) => {
    const updated = db.updateSupplier(req.storeId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Supplier not found' });
    res.json(updated);
  });

  app.delete('/api/suppliers/:id', (req, res) => {
    const success = db.deleteSupplier(req.storeId, req.params.id);
    if (!success) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ success: true });
  });

  app.get('/api/purchases', (req, res) => {
    res.json(db.getPurchases(req.storeId));
  });

  app.post('/api/purchases', (req, res) => {
    const pur = db.createPurchase(req.storeId, req.body);
    res.status(201).json(pur);
  });

  app.put('/api/purchases/:id', (req, res) => {
    const updated = db.updatePurchase(req.storeId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Purchase not found' });
    res.json(updated);
  });

  app.delete('/api/purchases/:id', (req, res) => {
    const success = db.deletePurchase(req.storeId, req.params.id);
    if (!success) return res.status(404).json({ error: 'Purchase not found' });
    res.json({ success: true });
  });

  // AI Scan Purchase Bill — photo, PDF (both via inlineData/multimodal) or a spreadsheet
  // (Excel/CSV, pre-converted to CSV text client-side since Gemini has no native XLSX
  // ingestion — sent as plain text instead of inlineData).
  // Supports Hindi, Bengali, Gujarati, Marathi, Tamil, English.
  app.post('/api/ai/scan-bill', async (req, res) => {
    const { imageBase64, textContent, sourceFileName } = req.body;
    if (!imageBase64 && !textContent) {
      return res.status(400).json({ error: 'Either image/PDF data or spreadsheet text content is required for bill scanning' });
    }

    try {
      let mimeType = 'image/jpeg';
      let cleanBase64 = imageBase64;
      if (imageBase64 && imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        mimeType = parts[0].replace('data:', '') || 'image/jpeg';
        cleanBase64 = parts[1];
      }

      const promptText = `You are an expert Indian Wholesale, Retail, Hardware & Kirana Bill OCR system. Analyze this purchase bill / supplier invoice${textContent ? ` (supplied below as spreadsheet data from "${sourceFileName || 'uploaded file'}", already extracted from Excel/CSV — read its rows/columns directly, no OCR needed)` : ' image or PDF'}.
The bill text may be printed or handwritten in Hindi, Bengali, Gujarati, Marathi, Tamil, Telugu, Kannada, English, or any Indian script.

RULES:
1. TRANSLATE all Supplier/Vendor/Client Names and Product Names into clean, precise English (e.g., "चना दाल" or "ছোলার ডাল" to "Chana Dal", "TMT Rod 8mm" to "TMT Rod 8mm").
2. Extract Supplier/Vendor Name (e.g., "ABC Iron & Steel Traders", "M/s Laxmi Wholesale Traders"). If not found, provide a realistic English business name from header.
3. Extract Supplier Phone/Mobile if visible.
4. Extract Invoice/Bill Number and Date (YYYY-MM-DD).
5. Extract EVERY line item listed without skipping any row (even if there are 30+ items):
   - name: Precise English item name / description
   - productName: Same clean English item name as name
   - category: Select best from ['Rice & Grains', 'Atta & Flours', 'Dals & Pulses', 'Edible Oils & Ghee', 'Spices & Masalas', 'Dairy & Bakery', 'Biscuits & Cookies', 'Personal Care', 'Cleaning & Household', 'Beverages', 'Snacks', 'Building Materials & Hardware', 'General Kirana']
   - brand: Brand name or 'Generic'
   - unit: Select best from ['kg', 'g', 'liter', 'ml', 'pkt', 'pc', 'box', 'bottle', 'pouch', 'bag', 'tin', 'jar', 'meter', 'ft', 'set']
   - quantity: Purchased quantity as a number
   - purchasePrice: Cost price per unit / rate in INR
   - mrp: MRP per unit in INR (estimate purchasePrice * 1.25 if omitted)
   - sellingPrice: Shop selling price per unit in INR (estimate purchasePrice * 1.15 if omitted)
   - totalPrice: Total line item price in INR (quantity * purchasePrice)
6. Extract total bill amount, paid amount, and payment status.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          supplierName: { type: Type.STRING, description: 'Supplier / Wholesale vendor name in English' },
          supplierMobile: { type: Type.STRING, description: 'Supplier phone or mobile' },
          invoiceNumber: { type: Type.STRING, description: 'Bill or invoice number' },
          invoiceDate: { type: Type.STRING, description: 'Invoice date YYYY-MM-DD' },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Item name translated to English' },
                productName: { type: Type.STRING, description: 'Same item name for compatibility' },
                category: { type: Type.STRING, description: 'Item category' },
                brand: { type: Type.STRING, description: 'Brand or Generic' },
                unit: { type: Type.STRING, description: 'Unit of measure e.g. kg, pkt, pc' },
                quantity: { type: Type.NUMBER, description: 'Purchased quantity' },
                purchasePrice: { type: Type.NUMBER, description: 'Purchase price / rate per unit in INR' },
                mrp: { type: Type.NUMBER, description: 'MRP per unit in INR' },
                sellingPrice: { type: Type.NUMBER, description: 'Selling price per unit in INR' },
                totalPrice: { type: Type.NUMBER, description: 'Total line price in INR' }
              },
              required: ['name', 'quantity', 'purchasePrice']
            }
          },
          totalAmount: { type: Type.NUMBER, description: 'Total bill amount in INR' },
          paidAmount: { type: Type.NUMBER, description: 'Amount paid towards this bill' },
          detectedLanguage: { type: Type.STRING, description: 'Language detected on the physical bill' }
        },
        required: ['supplierName', 'items', 'totalAmount']
      };

      // Image/PDF go in as inlineData (Gemini's native multimodal path). A spreadsheet
      // has already been converted to CSV client-side (Gemini has no raw XLSX ingestion),
      // so it rides along as plain text appended to the prompt instead.
      const contentParts = textContent
        ? [{ text: `${promptText}\n\nSPREADSHEET DATA (CSV):\n${textContent}` }]
        : [{ inlineData: { mimeType, data: cleanBase64 } }, { text: promptText }];

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: { parts: contentParts },
          config: { responseMimeType: 'application/json', responseSchema }
        });
      } catch (firstErr) {
        console.warn('gemini-3.6-flash failed, falling back to gemini-2.5-flash:', firstErr);
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: contentParts
          },
          config: { responseMimeType: 'application/json', responseSchema }
        });
      }

      const text = response.text;
      let data: any = {};
      if (text) {
        data = JSON.parse(text);
        // Ensure every item has both name and productName
        if (data.items && Array.isArray(data.items)) {
          data.items = data.items.map((it: any) => ({
            ...it,
            name: it.name || it.productName || 'Item',
            productName: it.productName || it.name || 'Item'
          }));
        }
      }
      return res.json({ success: true, data });
    } catch (err: any) {
      console.error('AI Bill Scanner Error:', err);
      return res.status(500).json({
        error: 'Failed to scan purchase bill with AI',
        details: err.message
      });
    }
  });

  // AI Camera Scan Expense Bill / Receipt (Electricity, Rent, Freight, Repairs, Snacks, etc.)
  app.post('/api/ai/scan-expense-bill', async (req, res) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required for expense receipt scanning' });
    }

    try {
      let mimeType = 'image/jpeg';
      let cleanBase64 = imageBase64;
      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        mimeType = parts[0].replace('data:', '') || 'image/jpeg';
        cleanBase64 = parts[1];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            },
            {
              text: `You are an expert Indian Retail & Kirana Store Expense Receipt OCR system.
Analyze this expense bill, voucher, receipt, utility invoice, rent slip, or handwritten payment slip.
Text may be printed or handwritten in Hindi, Gujarati, Bengali, Marathi, Tamil, Telugu, or English.

RULES:
1. Extract or determine:
   - title: Payee / Vendor / Bill Name translated to English (e.g., "Torrent Power Electricity", "Mandi Auto Transport Driver", "Shop Premises Rent", "Chaiwala Daily Snacks")
   - category: Select the SINGLE BEST fit from ['Rent', 'Electricity', 'Delivery/Transport', 'Staff Salary', 'Packaging', 'Maintenance', 'Tea & Snacks', 'Wi-Fi & Telecom', 'Taxes & Licenses', 'Pest Control & Cleaning', 'Marketing & Signboard', 'Other']
   - amount: Net amount paid in INR as a positive number
   - date: Date of expense (YYYY-MM-DD). If missing, return today's date.
   - paymentMethod: 'CASH', 'UPI', or 'BANK'
   - payeeName: Specific person, utility board, or vendor paid
   - receiptNo: Receipt number, invoice ID, or consumer number if available
   - description: Brief description in English summarizing the reason for payment
   - isRecurring: true if this is typically a recurring monthly/daily cost (Rent, Electricity, Internet, Salary, Chai)
   - gstAmount: Any GST / tax amount shown separately on receipt (or 0)
   - detectedLanguage: Language of the original physical receipt`
            }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Short summary title in English' },
              category: { type: Type.STRING, description: 'Expense category' },
              amount: { type: Type.NUMBER, description: 'Total amount paid in INR' },
              date: { type: Type.STRING, description: 'Expense date YYYY-MM-DD' },
              paymentMethod: { type: Type.STRING, description: 'CASH, UPI, or BANK' },
              payeeName: { type: Type.STRING, description: 'Vendor, person or agency name' },
              receiptNo: { type: Type.STRING, description: 'Bill / slip / receipt reference number' },
              description: { type: Type.STRING, description: 'Reason or notes for expense' },
              isRecurring: { type: Type.BOOLEAN, description: 'Whether this is a recurring shop expense' },
              gstAmount: { type: Type.NUMBER, description: 'Tax or GST component if any' },
              detectedLanguage: { type: Type.STRING, description: 'Language detected on physical receipt' }
            },
            required: ['title', 'category', 'amount']
          }
        }
      });

      const text = response.text;
      let data = {};
      if (text) {
        data = JSON.parse(text);
      }
      return res.json({ success: true, data });
    } catch (err: any) {
      console.error('AI Expense Scanner Error:', err);
      return res.status(500).json({
        error: 'Failed to scan expense receipt with AI',
        details: err.message
      });
    }
  });

  // Process & Commit Scanned Purchase Bill to DB & Stock
  app.post('/api/purchases/process-scanned', (req, res) => {
    try {
      const result = db.processScannedPurchaseBill(req.storeId, req.body);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to process scanned purchase bill' });
    }
  });

  // Inventory logs
  app.get('/api/inventory/transactions', (req, res) => {
    res.json(db.getInventoryTransactions(req.storeId));
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    res.json(db.getNotifications(req.storeId));
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    db.markNotificationAsRead(req.storeId, req.params.id);
    res.json({ success: true });
  });

  // Database Backup & Restore
  app.get('/api/backup/export', (req, res) => {
    const jsonStr = db.exportDatabaseJSON(req.storeId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="kiranamate_backup_${Date.now()}.json"`);
    res.send(jsonStr);
  });

  app.post('/api/backup/restore', (req, res) => {
    const { jsonContent } = req.body;
    if (!jsonContent) return res.status(400).json({ error: 'No JSON content provided' });
    const success = db.importDatabaseJSON(req.storeId, jsonContent);
    if (!success) return res.status(400).json({ error: 'Invalid backup JSON file structure' });
    res.json({ success: true, message: 'Database restored successfully' });
  });

  app.post('/api/backup/reset-demo', (req, res) => {
    db.initSeedData();
    res.json({ success: true, message: 'Database reset to fresh demo state with 100+ items and 50 customers!' });
  });

  // One-off verification route for the MySQL migration — hits a real query,
  // not just "is the pool object truthy", so it actually proves connectivity
  // (this can only be checked once deployed; Hostinger's DB_HOST=localhost
  // means "the Hostinger server itself", unreachable from local dev).
  app.get('/api/admin/mysql-status', async (req, res) => {
    const pool = getMysqlPool();
    if (!pool) {
      return res.json({ configured: false, connected: false, message: 'DB_HOST/DB_NAME/DB_USER/DB_PASSWORD not set in the environment.' });
    }
    try {
      const [rows] = await pool.query('SELECT 1 AS ok');
      const [tables] = await pool.query("SHOW TABLES LIKE 'sales'");
      const [purchaseTables] = await pool.query("SHOW TABLES LIKE 'purchases'");
      const [ledgerTables] = await pool.query("SHOW TABLES LIKE 'stock_ledger'");
      res.json({
        configured: true,
        connected: true,
        salesTableExists: (tables as any[]).length > 0,
        purchasesTableExists: (purchaseTables as any[]).length > 0,
        stockLedgerTableExists: (ledgerTables as any[]).length > 0
      });
    } catch (err: any) {
      res.status(500).json({ configured: true, connected: false, error: err.message });
    }
  });

  // One-time backfill of an existing store's history into MySQL — run per
  // account, not automatically for everyone. Safe to call more than once
  // for the same store (sales/purchases upsert; stock_ledger is replaced,
  // not duplicated). :storeId identifies which account to migrate.
  app.post('/api/admin/migrate-to-mysql/:storeId', async (req, res) => {
    try {
      const result = await db.migrateStoreToMysql(req.params.storeId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to the port FIRST, unconditionally — the host's health check needs
  // this to happen fast (well under a second), and MySQL connecting slowly
  // or hanging (e.g. connection-limit pressure on shared hosting) must never
  // be able to delay that, or the platform's own supervisor kills the process
  // for "not starting" before our own MySQL timeout logic ever gets a chance
  // to run. Schema init now happens in the background, after listen().
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KiranaMate Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });

  Promise.race([
    ensureMysqlSchema(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('MySQL schema init timed out after 8s')), 8000))
  ]).catch((err) => {
    console.error('⚠️ MySQL schema init failed or timed out — continuing without it (Firestore-backed features are unaffected):', err);
  });
}

// Extend Express Request interface for dev user and storeId
declare global {
  namespace Express {
    interface Request {
      storeId: string;
      user?: {
        id: string;
        name: string;
        role: UserRole;
        storeId?: string;
      };
    }
  }
}

startServer();
