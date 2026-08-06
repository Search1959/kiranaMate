import {
  Customer,
  Product,
  Order,
  Sale,
  Expense,
  Supplier,
  Purchase,
  DailyStats,
  StoreSettings,
  NotificationAlert,
  User,
  CustomerTransaction,
  InventoryTransaction,
  TradingSector,
  PaymentStatus
} from '../types';
import { generateSectorSeedData } from '../server/seedData';
import { TRADING_SECTORS, getSectorConfig } from './sectorConfig';

interface StoreData {
  settings: StoreSettings;
  users: User[];
  customers: Customer[];
  customerTransactions: CustomerTransaction[];
  products: Product[];
  sales: Sale[];
  orders: Order[];
  expenses: Expense[];
  suppliers: Supplier[];
  purchases: Purchase[];
  inventoryTransactions: InventoryTransaction[];
  notifications: NotificationAlert[];
}

const LOCAL_STORAGE_PREFIX = 'kiranamate_store_';

function findUserAcrossAllStores(username: string): { user: User; storeId: string; storeData: StoreData } | null {
  const clean = username.trim().toLowerCase();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOCAL_STORAGE_PREFIX)) {
      const sid = key.replace(LOCAL_STORAGE_PREFIX, '');
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const storeData: StoreData = JSON.parse(raw);
          if (storeData.users && Array.isArray(storeData.users)) {
            const u = storeData.users.find(usr => usr.username.toLowerCase() === clean);
            if (u) {
              return { user: u, storeId: sid, storeData };
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }
  return null;
}

function getStoreData(storeId: string = 'store-demo'): StoreData {
  let sectorKey: TradingSector = 'KIRANA_FMCG';
  if (storeId === 'store-demo-steel' || storeId.includes('steel')) sectorKey = 'METALS_STEEL';
  else if (storeId === 'store-demo-agri' || storeId.includes('agri')) sectorKey = 'AGRICULTURE';
  else if (storeId === 'store-demo-textile' || storeId.includes('textile')) sectorKey = 'TEXTILES';
  else if (storeId === 'store-demo-chemical' || storeId.includes('chemical')) sectorKey = 'CHEMICALS';
  else if (storeId === 'store-demo-energy' || storeId.includes('energy')) sectorKey = 'ENERGY';
  else if (storeId === 'store-demo-jewellery' || storeId.includes('jewel')) sectorKey = 'JEWELLERY';
  else if (storeId === 'store-demo-stationery' || storeId.includes('stationery')) sectorKey = 'STATIONERY';
  else if (storeId === 'store-demo-hardware' || storeId.includes('hardware')) sectorKey = 'BUILDING_HARDWARE';
  else if (storeId === 'store-demo-kirana' || storeId.includes('kirana')) sectorKey = 'KIRANA_FMCG';
  else {
    const sectorDef = TRADING_SECTORS.find(s => s.demoStoreId === storeId || s.id === storeId);
    if (sectorDef) sectorKey = sectorDef.id;
  }

  const key = `${LOCAL_STORAGE_PREFIX}${storeId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed: StoreData = JSON.parse(raw);
      if (storeId.startsWith('store-demo') && parsed.settings && parsed.settings.sector !== sectorKey) {
        localStorage.removeItem(key);
      } else {
        return parsed;
      }
    } catch {
      // fallback to seed
    }
  }

  const seed = generateSectorSeedData(sectorKey);
  const initialData: StoreData = {
    settings: seed.settings,
    users: [
      {
        id: 'u-1',
        name: 'Shop Owner',
        username: 'owner',
        role: 'owner',
        mobile: '9876543210',
        permissions: {
          canViewReports: true,
          canEditProducts: true,
          canDeleteRecords: true,
          canCollectPayments: true,
          canCreateOrders: true,
          canManageSettings: true
        }
      },
      {
        id: 'u-2',
        name: 'Suresh Kumar (Counter Staff)',
        username: 'staff',
        role: 'staff',
        mobile: '9812345678',
        permissions: {
          canViewReports: false,
          canEditProducts: false,
          canDeleteRecords: false,
          canCollectPayments: true,
          canCreateOrders: true,
          canManageSettings: false
        }
      }
    ],
    customers: seed.customers,
    customerTransactions: seed.customerTransactions,
    products: seed.products,
    sales: seed.sales,
    orders: seed.orders,
    expenses: seed.expenses,
    suppliers: seed.suppliers,
    purchases: (seed as any).purchases || [],
    inventoryTransactions: seed.inventoryTransactions,
    notifications: []
  };

  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
}

function saveStoreData(storeId: string, data: StoreData) {
  const key = `${LOCAL_STORAGE_PREFIX}${storeId}`;
  localStorage.setItem(key, JSON.stringify(data));
}

export const clientStore = {
  getDailyStats(storeId: string = 'store-demo'): DailyStats {
    const data = getStoreData(storeId);
    const todayStr = new Date().toISOString().split('T')[0];

    let todaySales = data.sales.filter(s => s.createdAt.startsWith(todayStr));
    if (todaySales.length === 0 && data.sales.length > 0) {
      todaySales = data.sales;
    }
    const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);
    const todayProfit = todaySales.reduce((acc, s) => {
      const itemsProfit = s.items.reduce((pAcc, item) => {
        const prod = data.products.find(p => p.id === item.productId);
        const cost = prod ? prod.purchasePrice : item.unitPrice * 0.85;
        return pAcc + (item.unitPrice - cost) * item.quantity;
      }, 0);
      return acc + itemsProfit;
    }, 0);

    const todayExpenses = data.expenses
      .filter(e => e.date === todayStr)
      .reduce((acc, e) => acc + e.amount, 0);

    const cashSales = todaySales.filter(s => s.paymentMethod === 'CASH').reduce((acc, s) => acc + s.grandTotal, 0);
    const upiSales = todaySales.filter(s => s.paymentMethod === 'UPI').reduce((acc, s) => acc + s.grandTotal, 0);
    const creditSales = todaySales.filter(s => s.paymentMethod === 'CREDIT').reduce((acc, s) => acc + s.grandTotal, 0);

    const totalUdhaar = data.customers.reduce((acc, c) => acc + (c.currentBalance || c.outstandingBalance || 0), 0);
    const lowStockCount = data.products.filter(p => p.currentStock <= p.minStock).length;
    const pendingOrdersCount = data.orders.filter(o => o.orderStatus === 'NEW' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING').length;

    return {
      todaySalesTotal,
      cashSales,
      upiSales,
      creditSales,
      todayExpenses,
      estimatedProfitToday: todayProfit,
      totalPendingUdhaar: totalUdhaar,
      dueTodayUdhaar: Math.round(totalUdhaar * 0.15),
      overdueUdhaar: Math.round(totalUdhaar * 0.25),
      todayCollection: cashSales + upiSales,
      pendingOrdersCount,
      newOrdersCount: data.orders.filter(o => o.orderStatus === 'NEW').length,
      preparingOrdersCount: data.orders.filter(o => o.orderStatus === 'PREPARING').length,
      outForDeliveryCount: data.orders.filter(o => o.orderStatus === 'OUT_FOR_DELIVERY').length,
      deliveredOrdersToday: data.orders.filter(o => o.orderStatus === 'DELIVERED' && o.updatedAt?.startsWith(todayStr)).length,
      lowStockCount,
      outOfStockCount: data.products.filter(p => p.currentStock === 0).length
    };
  },

  getSettings(storeId: string = 'store-demo'): StoreSettings {
    return getStoreData(storeId).settings;
  },

  updateSettings(storeId: string = 'store-demo', newSettings: Partial<StoreSettings>): StoreSettings {
    const data = getStoreData(storeId);
    data.settings = { ...data.settings, ...newSettings };
    saveStoreData(storeId, data);
    return data.settings;
  },

  getUsers(storeId: string = 'store-demo'): { users: User[] } {
    return { users: getStoreData(storeId).users };
  },

  updateUserPermissions(storeId: string = 'store-demo', userId: string, permissions: User['permissions']): { success: boolean; user: User } {
    const data = getStoreData(storeId);
    const u = data.users.find(usr => usr.id === userId);
    if (!u) throw new Error('User not found');
    u.permissions = permissions;
    saveStoreData(storeId, data);
    return { success: true, user: u };
  },

  getAdminStores(): { stores: { id: string; storeName: string; ownerName: string; isDemo: boolean; productCount: number; salesCount: number }[] } {
    const list: { id: string; storeName: string; ownerName: string; isDemo: boolean; productCount: number; salesCount: number }[] = [];
    
    // 1. Add all registered custom stores from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LOCAL_STORAGE_PREFIX)) {
        const sid = key.replace(LOCAL_STORAGE_PREFIX, '');
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data: StoreData = JSON.parse(raw);
            list.push({
              id: sid,
              storeName: data.settings?.storeName || 'Store',
              ownerName: data.settings?.ownerName || 'Owner',
              isDemo: sid.startsWith('store-demo'),
              productCount: data.products ? data.products.length : 0,
              salesCount: data.sales ? data.sales.length : 0
            });
          }
        } catch {
          // ignore
        }
      }
    }

    // 2. If no stores in list yet, include default demo sectors
    if (list.length === 0) {
      TRADING_SECTORS.forEach(sec => {
        const seed = generateSectorSeedData(sec.id);
        list.push({
          id: sec.demoStoreId,
          storeName: seed.settings.storeName,
          ownerName: 'Demo Manager',
          isDemo: true,
          productCount: seed.products.length,
          salesCount: seed.sales.length
        });
      });
    }

    return { stores: list };
  },

  // Customers
  getCustomers(storeId: string = 'store-demo', search?: string, area?: string): Customer[] {
    let custs = getStoreData(storeId).customers;
    if (search) {
      const q = search.toLowerCase();
      custs = custs.filter(c => c.name.toLowerCase().includes(q) || c.mobile.includes(q));
    }
    if (area && area !== 'ALL') {
      custs = custs.filter(c => c.area === area);
    }
    return custs;
  },

  getCustomerById(storeId: string = 'store-demo', id: string): { customer: Customer; ledger: CustomerTransaction[] } {
    const data = getStoreData(storeId);
    const cust = data.customers.find(c => c.id === id);
    if (!cust) throw new Error('Customer not found');
    const ledger = data.customerTransactions.filter(t => t.customerId === id);
    return { customer: cust, ledger };
  },

  createCustomer(storeId: string = 'store-demo', custData: Partial<Customer>): Customer {
    const data = getStoreData(storeId);
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: custData.name || 'New Customer',
      mobile: custData.mobile || '',
      address: custData.address || '',
      area: custData.area || 'Subhash Nagar',
      openingBalance: custData.openingBalance || 0,
      currentBalance: custData.openingBalance || 0,
      outstandingBalance: custData.openingBalance || 0,
      creditLimit: custData.creditLimit || 5000,
      trustRating: custData.trustRating || 'A',
      notes: custData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.customers.unshift(newCust);

    if (newCust.openingBalance && newCust.openingBalance > 0) {
      data.customerTransactions.unshift({
        id: `tx-${Date.now()}`,
        customerId: newCust.id,
        type: 'OPENING_BALANCE',
        amount: newCust.openingBalance,
        balanceAfter: newCust.openingBalance,
        notes: 'Initial opening balance',
        createdBy: 'System',
        createdAt: new Date().toISOString()
      });
    }

    saveStoreData(storeId, data);
    return newCust;
  },

  updateCustomer(storeId: string = 'store-demo', id: string, updates: Partial<Customer>): Customer {
    const data = getStoreData(storeId);
    const cust = data.customers.find(c => c.id === id);
    if (!cust) throw new Error('Customer not found');
    Object.assign(cust, updates, { updatedAt: new Date().toISOString() });
    saveStoreData(storeId, data);
    return cust;
  },

  deleteCustomer(storeId: string = 'store-demo', id: string): { success: boolean } {
    const data = getStoreData(storeId);
    const idx = data.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.customers.splice(idx, 1);
      saveStoreData(storeId, data);
    }
    return { success: true };
  },

  recordCustomerPayment(
    storeId: string = 'store-demo',
    id: string,
    amount: number,
    paymentMethod: string,
    notes?: string,
    recordedBy: string = 'Owner'
  ): { success: boolean; transaction: CustomerTransaction } {
    const data = getStoreData(storeId);
    const cust = data.customers.find(c => c.id === id);
    if (!cust) throw new Error('Customer not found');

    const prevBal = cust.currentBalance || cust.outstandingBalance || 0;
    const newBal = Math.max(0, prevBal - amount);
    cust.currentBalance = newBal;
    cust.outstandingBalance = newBal;
    cust.updatedAt = new Date().toISOString();

    const tx: CustomerTransaction = {
      id: `tx-${Date.now()}`,
      customerId: id,
      type: 'PAYMENT_RECEIVED',
      amount,
      balanceAfter: newBal,
      paymentMethod: (paymentMethod as any) || 'CASH',
      notes: notes || `Payment received via ${paymentMethod}`,
      createdBy: recordedBy,
      createdAt: new Date().toISOString()
    };
    data.customerTransactions.unshift(tx);
    saveStoreData(storeId, data);
    return { success: true, transaction: tx };
  },

  // Products
  getProducts(storeId: string = 'store-demo', search?: string, category?: string, stockFilter?: string): Product[] {
    let prods = getStoreData(storeId).products;
    if (search) {
      const q = search.toLowerCase();
      prods = prods.filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (category && category !== 'ALL') {
      prods = prods.filter(p => p.category === category);
    }
    if (stockFilter === 'LOW') {
      prods = prods.filter(p => p.currentStock <= p.minStock);
    } else if (stockFilter === 'OUT') {
      prods = prods.filter(p => p.currentStock <= 0);
    }
    return prods;
  },

  getProductByBarcode(storeId: string = 'store-demo', code: string): Product {
    const prods = getStoreData(storeId).products;
    const prod = prods.find(p => p.barcode === code || p.sku === code);
    if (!prod) throw new Error(`Product with barcode ${code} not found`);
    return prod;
  },

  createProduct(storeId: string = 'store-demo', prodData: Partial<Product>): Product {
    const data = getStoreData(storeId);
    const newProd: Product = {
      id: `p-${Date.now()}`,
      name: prodData.name || 'New Item',
      sku: prodData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: prodData.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      category: prodData.category || 'Rice & Grains',
      brand: prodData.brand || 'Generic',
      unit: prodData.unit || 'kg',
      purchasePrice: Number(prodData.purchasePrice) || 0,
      sellingPrice: Number(prodData.sellingPrice) || 0,
      mrp: Number(prodData.mrp) || Number(prodData.sellingPrice) || 0,
      currentStock: Number(prodData.currentStock) || 0,
      minStock: Number(prodData.minStock) || 10,
      supplierId: prodData.supplierId || 'sup-1',
      gstPercent: Number(prodData.gstPercent) || 5,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.products.unshift(newProd);

    if (newProd.currentStock > 0) {
      data.inventoryTransactions.unshift({
        id: `inv-${Date.now()}`,
        productId: newProd.id,
        productName: newProd.name,
        type: 'STOCK_IN_PURCHASE',
        quantityChange: newProd.currentStock,
        stockAfter: newProd.currentStock,
        notes: 'Initial product stock created',
        createdBy: 'Owner',
        createdAt: new Date().toISOString()
      });
    }

    saveStoreData(storeId, data);
    return newProd;
  },

  updateProduct(storeId: string = 'store-demo', id: string, updates: Partial<Product>): Product {
    const data = getStoreData(storeId);
    const prod = data.products.find(p => p.id === id);
    if (!prod) throw new Error('Product not found');
    Object.assign(prod, updates, { updatedAt: new Date().toISOString() });
    saveStoreData(storeId, data);
    return prod;
  },

  deleteProduct(storeId: string = 'store-demo', id: string): { success: boolean } {
    const data = getStoreData(storeId);
    const targetId = String(id).trim();
    const idx = data.products.findIndex(p => String(p.id).trim() === targetId);
    if (idx !== -1) {
      data.products.splice(idx, 1);
      saveStoreData(storeId, data);
    }
    return { success: true };
  },

  addStock(storeId: string = 'store-demo', id: string, qtyToAdd: number, notes?: string): { success: boolean; product: Product } {
    const data = getStoreData(storeId);
    const prod = data.products.find(p => p.id === id);
    if (!prod) throw new Error('Product not found');

    prod.currentStock += qtyToAdd;
    prod.updatedAt = new Date().toISOString();

    data.inventoryTransactions.unshift({
      id: `inv-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      type: 'STOCK_IN_PURCHASE',
      quantityChange: qtyToAdd,
      stockAfter: prod.currentStock,
      notes: notes || 'Manual stock update',
      createdBy: 'Owner',
      createdAt: new Date().toISOString()
    });

    saveStoreData(storeId, data);
    return { success: true, product: prod };
  },

  bulkImportProducts(storeId: string = 'store-demo', productsList: Partial<Product>[]): { addedCount: number; errors: string[] } {
    const data = getStoreData(storeId);
    let addedCount = 0;
    const errors: string[] = [];

    for (const item of productsList) {
      if (!item.name) {
        errors.push('Skipped item with missing name');
        continue;
      }

      // Check existing by name or barcode
      const existing = data.products.find(
        p => p.name.toLowerCase().trim() === item.name?.toLowerCase().trim() ||
             (item.barcode && p.barcode === item.barcode)
      );

      if (existing) {
        // Update stock and prices
        existing.currentStock += Number(item.currentStock) || 0;
        if (item.sellingPrice) existing.sellingPrice = Number(item.sellingPrice);
        if (item.purchasePrice) existing.purchasePrice = Number(item.purchasePrice);
        if (item.mrp) existing.mrp = Number(item.mrp);
        existing.updatedAt = new Date().toISOString();
        addedCount++;
      } else {
        const newProd: Product = {
          id: `p-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          name: item.name,
          sku: item.sku || `SKU-${Date.now().toString().slice(-5)}`,
          barcode: item.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          category: item.category || 'Rice & Grains',
          brand: item.brand || 'Generic',
          unit: item.unit || 'kg',
          purchasePrice: Number(item.purchasePrice) || 0,
          sellingPrice: Number(item.sellingPrice) || 0,
          mrp: Number(item.mrp) || Number(item.sellingPrice) || 0,
          currentStock: Number(item.currentStock) || 0,
          minStock: Number(item.minStock) || 10,
          supplierId: item.supplierId || 'sup-1',
          gstPercent: Number(item.gstPercent) || 5,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        data.products.unshift(newProd);
        addedCount++;
      }
    }

    saveStoreData(storeId, data);
    return { addedCount, errors };
  },

  // Sales
  getSales(storeId: string = 'store-demo', search?: string): Sale[] {
    let salesList = getStoreData(storeId).sales;
    if (search) {
      const q = search.toLowerCase();
      salesList = salesList.filter(s => s.saleNumber.toLowerCase().includes(q) || s.customerName?.toLowerCase().includes(q));
    }
    return salesList;
  },

  createSale(storeId: string = 'store-demo', saleData: Partial<Sale>): Sale {
    const data = getStoreData(storeId);
    const saleNum = `${data.settings.invoicePrefix || 'INV-'}${String(data.sales.length + 1001).padStart(4, '0')}`;

    const newSale: Sale = {
      id: `sal-${Date.now()}`,
      saleNumber: saleNum,
      customerId: saleData.customerId,
      customerName: saleData.customerName || 'Walk-in Customer',
      customerMobile: saleData.customerMobile || '',
      items: saleData.items || [],
      subtotal: saleData.subtotal || 0,
      discount: saleData.discount || 0,
      grandTotal: saleData.grandTotal || 0,
      paymentMethod: saleData.paymentMethod || 'CASH',
      paymentStatus: saleData.paymentStatus || 'PAID',
      notes: saleData.notes || '',
      createdAt: new Date().toISOString()
    };

    data.sales.unshift(newSale);

    // Deduct Stock
    for (const item of newSale.items) {
      const prod = data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
        prod.updatedAt = new Date().toISOString();

        data.inventoryTransactions.unshift({
          id: `inv-${Date.now()}`,
          productId: prod.id,
          productName: prod.name,
          type: 'STOCK_OUT_SALE',
          quantityChange: -item.quantity,
          stockAfter: prod.currentStock,
          referenceId: newSale.saleNumber,
          notes: `Counter Sale #${newSale.saleNumber}`,
          createdBy: 'Owner',
          createdAt: new Date().toISOString()
        });
      }
    }

    // Handle Udhaar / Credit
    if (saleData.paymentMethod === 'CREDIT' && saleData.customerId) {
      const cust = data.customers.find(c => c.id === saleData.customerId);
      if (cust) {
        const prevBal = cust.currentBalance || cust.outstandingBalance || 0;
        const newBal = prevBal + newSale.grandTotal;
        cust.currentBalance = newBal;
        cust.outstandingBalance = newBal;
        cust.updatedAt = new Date().toISOString();

        data.customerTransactions.unshift({
          id: `tx-${Date.now()}`,
          customerId: cust.id,
          type: 'CREDIT_SALE',
          amount: newSale.grandTotal,
          balanceAfter: newBal,
          referenceId: newSale.saleNumber,
          notes: `Credit purchase bill #${newSale.saleNumber}`,
          createdBy: 'Owner',
          createdAt: new Date().toISOString()
        });
      }
    }

    saveStoreData(storeId, data);
    return newSale;
  },

  updateSale(storeId: string = 'store-demo', id: string, updates: Partial<Sale>): Sale {
    const data = getStoreData(storeId);
    const sale = data.sales.find(s => s.id === id);
    if (!sale) throw new Error('Sale not found');
    Object.assign(sale, updates);
    saveStoreData(storeId, data);
    return sale;
  },

  deleteSale(storeId: string = 'store-demo', id: string): { success: boolean } {
    const data = getStoreData(storeId);
    const idx = data.sales.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.sales.splice(idx, 1);
      saveStoreData(storeId, data);
    }
    return { success: true };
  },

  // Orders
  getOrders(storeId: string = 'store-demo', search?: string, status?: string): Order[] {
    let list = getStoreData(storeId).orders;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
    }
    if (status && status !== 'ALL') {
      list = list.filter(o => o.orderStatus === status);
    }
    return list;
  },

  createOrder(storeId: string = 'store-demo', orderData: Partial<Order>): Order {
    const data = getStoreData(storeId);
    const ordNum = `ORD-${String(data.orders.length + 501).padStart(4, '0')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: ordNum,
      customerId: orderData.customerId || 'cust-1',
      customerName: orderData.customerName || 'Customer',
      customerMobile: orderData.customerMobile || '9800000000',
      customerAddress: orderData.customerAddress || 'Store Pickup',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      tax: orderData.tax || 0,
      deliveryCharge: orderData.deliveryCharge || 0,
      total: orderData.total || 0,
      orderStatus: 'NEW',
      paymentStatus: orderData.paymentStatus || 'PENDING',
      paidAmount: orderData.paidAmount || 0,
      paymentMethod: orderData.paymentMethod || 'CASH',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.orders.unshift(newOrder);
    saveStoreData(storeId, data);
    return newOrder;
  },

  updateOrderStatus(storeId: string = 'store-demo', id: string, orderStatus: string, paymentStatus?: string): Order {
    const data = getStoreData(storeId);
    const order = data.orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');

    order.orderStatus = orderStatus as any;
    if (paymentStatus) order.paymentStatus = paymentStatus as any;
    order.updatedAt = new Date().toISOString();

    saveStoreData(storeId, data);
    return order;
  },

  updateOrder(storeId: string = 'store-demo', id: string, updates: Partial<Order>): Order {
    const data = getStoreData(storeId);
    const order = data.orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    Object.assign(order, updates, { updatedAt: new Date().toISOString() });
    saveStoreData(storeId, data);
    return order;
  },

  deleteOrder(storeId: string = 'store-demo', id: string): { success: boolean } {
    const data = getStoreData(storeId);
    const idx = data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      data.orders.splice(idx, 1);
      saveStoreData(storeId, data);
    }
    return { success: true };
  },

  // Expenses
  getExpenses(storeId: string = 'store-demo'): Expense[] {
    return getStoreData(storeId).expenses;
  },

  createExpense(storeId: string = 'store-demo', expData: Partial<Expense>): Expense {
    const data = getStoreData(storeId);
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      category: expData.category || 'Shop Rent',
      amount: Number(expData.amount) || 0,
      date: expData.date || new Date().toISOString().split('T')[0],
      description: expData.description || '',
      paymentMethod: expData.paymentMethod || 'CASH',
      recordedBy: expData.recordedBy || 'Owner',
      createdAt: new Date().toISOString()
    };
    data.expenses.unshift(newExp);
    saveStoreData(storeId, data);
    return newExp;
  },

  updateExpense(storeId: string = 'store-demo', id: string, updates: Partial<Expense>): Expense {
    const data = getStoreData(storeId);
    const exp = data.expenses.find(e => e.id === id);
    if (!exp) throw new Error('Expense not found');
    Object.assign(exp, updates);
    saveStoreData(storeId, data);
    return exp;
  },

  deleteExpense(storeId: string = 'store-demo', id: string): { success: boolean } {
    const data = getStoreData(storeId);
    const idx = data.expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      data.expenses.splice(idx, 1);
      saveStoreData(storeId, data);
    }
    return { success: true };
  },

  scanExpenseBill(_imageBase64: string) {
    return {
      success: true,
      data: {
        category: 'Electricity Bill',
        amount: 3420,
        date: new Date().toISOString().split('T')[0],
        description: 'State Electricity Board Monthly Bill Scan',
        paymentMethod: 'UPI'
      }
    };
  },

  // Suppliers & Purchases
  getSuppliers(storeId: string = 'store-demo'): Supplier[] {
    return getStoreData(storeId).suppliers;
  },

  createSupplier(storeId: string = 'store-demo', supData: Partial<Supplier>): Supplier {
    const data = getStoreData(storeId);
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: supData.name || 'New Supplier',
      contactPerson: supData.contactPerson || 'Manager',
      mobile: supData.mobile || '9800000000',
      gstin: supData.gstin || '',
      address: supData.address || '',
      city: supData.city || 'Jaipur',
      outstandingBalance: supData.outstandingBalance || 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    data.suppliers.unshift(newSup);
    saveStoreData(storeId, data);
    return newSup;
  },

  updateSupplier(storeId: string = 'store-demo', id: string, updates: Partial<Supplier>): Supplier {
    const data = getStoreData(storeId);
    const sup = data.suppliers.find(s => s.id === id);
    if (!sup) throw new Error('Supplier not found');
    Object.assign(sup, updates);
    saveStoreData(storeId, data);
    return sup;
  },

  deleteSupplier(storeId: string = 'store-demo', id: string): { success: boolean } {
    const data = getStoreData(storeId);
    const idx = data.suppliers.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.suppliers.splice(idx, 1);
      saveStoreData(storeId, data);
    }
    return { success: true };
  },

  getPurchases(storeId: string = 'store-demo'): Purchase[] {
    return getStoreData(storeId).purchases;
  },

  createPurchase(storeId: string = 'store-demo', purData: Partial<Purchase>): Purchase {
    const data = getStoreData(storeId);
    const newPur: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNumber: purData.purchaseNumber || purData.invoiceNumber || `PUR-${Date.now().toString().slice(-6)}`,
      supplierId: purData.supplierId || 'sup-1',
      supplierName: purData.supplierName || 'Agrawal Wholesale Traders',
      invoiceNumber: purData.invoiceNumber || `BILL-${Date.now().toString().slice(-6)}`,
      items: purData.items || [],
      totalAmount: purData.totalAmount || 0,
      paidAmount: purData.paidAmount || 0,
      paymentMethod: purData.paymentMethod || 'BANK',
      paymentStatus: purData.paymentStatus || 'PAID',
      purchaseDate: purData.purchaseDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    data.purchases.unshift(newPur);

    // Update product stocks
    for (const item of newPur.items) {
      const prod = data.products.find(p => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase());
      if (prod) {
        prod.currentStock += item.quantity;
        if (item.purchasePrice) prod.purchasePrice = item.purchasePrice;
        prod.updatedAt = new Date().toISOString();
      }
    }

    saveStoreData(storeId, data);
    return newPur;
  },

  updatePurchase(storeId: string = 'store-demo', id: string, updates: Partial<Purchase>): Purchase {
    const data = getStoreData(storeId);
    const pur = data.purchases.find(p => p.id === id);
    if (!pur) throw new Error('Purchase not found');
    Object.assign(pur, updates);
    saveStoreData(storeId, data);
    return pur;
  },

  deletePurchase(storeId: string = 'store-demo', id: string): { success: boolean } {
    const data = getStoreData(storeId);
    const targetId = String(id).trim();
    const idx = data.purchases.findIndex(p => String(p.id).trim() === targetId);
    if (idx !== -1) {
      data.purchases.splice(idx, 1);
      saveStoreData(storeId, data);
    }
    return { success: true };
  },

  scanPurchaseBill(imageBase64: string) {
    const isSteelBill = imageBase64.includes('DEMO-2026-001') || imageBase64.includes('TMT') || imageBase64.length > 50000;

    if (isSteelBill) {
      const items = [
        { name: 'TMT Rod 8mm', productName: 'TMT Rod 8mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg', quantity: 51, purchasePrice: 61, mrp: 76, sellingPrice: 70, totalPrice: 3111.00 },
        { name: 'TMT Rod 10mm', productName: 'TMT Rod 10mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg', quantity: 52, purchasePrice: 62, mrp: 78, sellingPrice: 72, totalPrice: 3224.00 },
        { name: 'TMT Rod 12mm', productName: 'TMT Rod 12mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg', quantity: 53, purchasePrice: 63, mrp: 79, sellingPrice: 73, totalPrice: 3339.00 },
        { name: 'TMT Rod 16mm', productName: 'TMT Rod 16mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg', quantity: 54, purchasePrice: 64, mrp: 80, sellingPrice: 74, totalPrice: 3456.00 },
        { name: 'TMT Rod 20mm', productName: 'TMT Rod 20mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg', quantity: 55, purchasePrice: 65, mrp: 82, sellingPrice: 75, totalPrice: 3575.00 },
        { name: 'TMT Rod 25mm', productName: 'TMT Rod 25mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg', quantity: 56, purchasePrice: 66, mrp: 83, sellingPrice: 76, totalPrice: 3696.00 },
        { name: 'MS Angle 25x25x3', productName: 'MS Angle 25x25x3', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 57, purchasePrice: 67, mrp: 84, sellingPrice: 77, totalPrice: 3819.00 },
        { name: 'MS Angle 40x40x5', productName: 'MS Angle 40x40x5', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 58, purchasePrice: 68, mrp: 85, sellingPrice: 78, totalPrice: 3944.00 },
        { name: 'MS Angle 50x50x6', productName: 'MS Angle 50x50x6', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 59, purchasePrice: 69, mrp: 86, sellingPrice: 79, totalPrice: 4071.00 },
        { name: 'MS Angle 65x65x6', productName: 'MS Angle 65x65x6', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 60, purchasePrice: 70, mrp: 88, sellingPrice: 80, totalPrice: 4200.00 },
        { name: 'MS Flat 25x6', productName: 'MS Flat 25x6', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 61, purchasePrice: 71, mrp: 89, sellingPrice: 81, totalPrice: 4331.00 },
        { name: 'MS Flat 40x6', productName: 'MS Flat 40x6', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 62, purchasePrice: 72, mrp: 90, sellingPrice: 82, totalPrice: 4464.00 },
        { name: 'MS Flat 50x8', productName: 'MS Flat 50x8', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 63, purchasePrice: 73, mrp: 91, sellingPrice: 83, totalPrice: 4599.00 },
        { name: 'MS Flat 75x10', productName: 'MS Flat 75x10', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 64, purchasePrice: 74, mrp: 92, sellingPrice: 84, totalPrice: 4736.00 },
        { name: 'MS Round Bar 10', productName: 'MS Round Bar 10', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 65, purchasePrice: 75, mrp: 94, sellingPrice: 85, totalPrice: 4875.00 },
        { name: 'MS Round Bar 12', productName: 'MS Round Bar 12', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 66, purchasePrice: 76, mrp: 95, sellingPrice: 86, totalPrice: 5016.00 },
        { name: 'MS Round Bar 16', productName: 'MS Round Bar 16', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 67, purchasePrice: 77, mrp: 96, sellingPrice: 87, totalPrice: 5159.00 },
        { name: 'MS Round Bar 20', productName: 'MS Round Bar 20', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 68, purchasePrice: 78, mrp: 98, sellingPrice: 88, totalPrice: 5258.72 },
        { name: 'MS Square Bar 12', productName: 'MS Square Bar 12', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 69, purchasePrice: 79, mrp: 99, sellingPrice: 89, totalPrice: 5451.00 },
        { name: 'MS Square Bar 16', productName: 'MS Square Bar 16', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 70, purchasePrice: 80, mrp: 100, sellingPrice: 90, totalPrice: 5600.00 },
        { name: 'MS Channel75', productName: 'MS Channel75', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 71, purchasePrice: 81, mrp: 101, sellingPrice: 91, totalPrice: 5751.00 },
        { name: 'MS Channel100', productName: 'MS Channel100', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 72, purchasePrice: 82, mrp: 102, sellingPrice: 92, totalPrice: 5904.00 },
        { name: 'MS Channel125', productName: 'MS Channel125', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 73, purchasePrice: 83, mrp: 104, sellingPrice: 93, totalPrice: 6059.00 },
        { name: 'MS Channel150', productName: 'MS Channel150', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 74, purchasePrice: 84, mrp: 105, sellingPrice: 94, totalPrice: 6216.00 },
        { name: 'MS Beam100', productName: 'MS Beam100', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 75, purchasePrice: 85, mrp: 106, sellingPrice: 95, totalPrice: 6375.00 },
        { name: 'MS Beam150', productName: 'MS Beam150', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 76, purchasePrice: 86, mrp: 108, sellingPrice: 96, totalPrice: 6536.00 },
        { name: 'MS Beam200', productName: 'MS Beam200', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 77, purchasePrice: 87, mrp: 109, sellingPrice: 97, totalPrice: 6699.00 },
        { name: 'GI Pipe1/2', productName: 'GI Pipe1/2', category: 'Building Materials & Hardware', brand: 'Jindal', unit: 'kg', quantity: 78, purchasePrice: 88, mrp: 110, sellingPrice: 98, totalPrice: 6864.00 },
        { name: 'GI Pipe1', productName: 'GI Pipe1', category: 'Building Materials & Hardware', brand: 'Jindal', unit: 'kg', quantity: 79, purchasePrice: 89, mrp: 111, sellingPrice: 99, totalPrice: 7031.00 },
        { name: 'GI Pipe2', productName: 'GI Pipe2', category: 'Building Materials & Hardware', brand: 'Jindal', unit: 'kg', quantity: 80, purchasePrice: 90, mrp: 112, sellingPrice: 100, totalPrice: 7200.00 },
        { name: 'MS Pipe1', productName: 'MS Pipe1', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 81, purchasePrice: 91, mrp: 114, sellingPrice: 101, totalPrice: 7371.00 },
        { name: 'MS Pipe2', productName: 'MS Pipe2', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg', quantity: 82, purchasePrice: 92, mrp: 115, sellingPrice: 102, totalPrice: 7544.00 }
      ];

      const totalAmount = items.reduce((s, i) => s + i.totalPrice, 0);

      return {
        success: true,
        data: {
          supplierName: 'ABC Iron & Steel Traders (Sample)',
          supplierMobile: '9829012345',
          supplierGstin: '19AABCA1234M1Z5',
          supplierAddress: 'M.M. Feeder Road, Kolkata',
          invoiceNumber: 'DEMO-2026-001',
          billNumber: 'DEMO-2026-001',
          invoiceDate: new Date().toISOString().split('T')[0],
          billDate: new Date().toISOString().split('T')[0],
          detectedLanguage: 'English (Demo Steel & Hardware Invoice)',
          items,
          subtotal: totalAmount,
          totalAmount,
          grandTotal: totalAmount,
          paidAmount: totalAmount,
          paymentStatus: 'PAID'
        }
      };
    }

    return {
      success: true,
      data: {
        supplierName: 'Laxmi Wholesale Kirana Traders',
        supplierMobile: '9829012345',
        supplierGstin: '08AABC10011Z1',
        supplierAddress: 'Ghee Walon Ka Rasta, Wholesale Mandi',
        invoiceNumber: `BILL-${Math.floor(100000 + Math.random() * 900000)}`,
        billNumber: `BILL-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        billDate: new Date().toISOString().split('T')[0],
        detectedLanguage: 'English / Hindi OCR',
        items: [
          {
            name: 'Fortune Refined Soyabean Oil 1L Pouch',
            productName: 'Fortune Refined Soyabean Oil 1L Pouch',
            category: 'Edible Oils & Ghee',
            quantity: 20,
            unit: 'pouch',
            purchasePrice: 110,
            sellingPrice: 125,
            mrp: 135,
            totalPrice: 2200
          },
          {
            name: 'Aashirvaad Shuddh Chakki Atta 10kg',
            productName: 'Aashirvaad Shuddh Chakki Atta 10kg',
            category: 'Atta & Flours',
            quantity: 10,
            unit: 'pkt',
            purchasePrice: 380,
            sellingPrice: 420,
            mrp: 450,
            totalPrice: 3800
          },
          {
            name: 'Tata Salt Vacuum Evaporated 1kg',
            productName: 'Tata Salt Vacuum Evaporated 1kg',
            category: 'Spices & Masalas',
            quantity: 30,
            unit: 'pkt',
            purchasePrice: 22,
            sellingPrice: 28,
            mrp: 28,
            totalPrice: 660
          }
        ],
        subtotal: 6660,
        gstTotal: 333,
        totalAmount: 6993,
        grandTotal: 6993,
        paidAmount: 6993,
        paymentStatus: 'PAID',
        rawText: 'Extracted sample purchase bill data'
      }
    };
  },

  processScannedPurchaseBill(storeId: string = 'store-demo', payload: any) {
    const data = getStoreData(storeId);

    const supName = (payload.supplierName || payload.supplier || 'Wholesale Supplier').trim();
    // Find or create supplier
    let sup = data.suppliers.find(s => s.name.toLowerCase().trim() === supName.toLowerCase());
    let isNewSupplierCreated = false;
    if (!sup) {
      sup = {
        id: `sup-${Date.now()}`,
        name: supName,
        contactPerson: supName,
        mobile: payload.supplierMobile || '9829000000',
        gstin: payload.supplierGstin || '',
        address: payload.supplierAddress || 'Local Wholesale Market',
        city: 'Local Area',
        outstandingBalance: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      data.suppliers.unshift(sup);
      isNewSupplierCreated = true;
    }

    let newProductsCount = 0;
    let updatedProductsCount = 0;
    const purchaseItems: any[] = [];

    for (const item of payload.items || []) {
      const itemName = (item.name || item.productName || item.description || 'Scanned Item').trim();
      let prod = data.products.find(p => p.name.toLowerCase().trim() === itemName.toLowerCase());

      if (prod) {
        prod.currentStock += Number(item.quantity) || 0;
        if (item.purchasePrice) prod.purchasePrice = Number(item.purchasePrice);
        if (item.sellingPrice) prod.sellingPrice = Number(item.sellingPrice);
        if (item.mrp) prod.mrp = Number(item.mrp);
        prod.updatedAt = new Date().toISOString();
        updatedProductsCount++;
      } else {
        const cost = Number(item.purchasePrice) || 0;
        const sell = Number(item.sellingPrice) || Math.round(cost * 1.15);
        const mrpVal = Number(item.mrp) || Math.round(cost * 1.25);

        prod = {
          id: `p-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          name: itemName,
          sku: `SKU-${Date.now().toString().slice(-5)}`,
          barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          category: item.category || 'Building Materials & Hardware',
          brand: item.brand || 'Generic',
          unit: item.unit || 'kg',
          purchasePrice: cost,
          sellingPrice: sell,
          mrp: mrpVal,
          currentStock: Number(item.quantity) || 0,
          minStock: 5,
          supplierId: sup.id,
          gstPercent: 0,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        data.products.unshift(prod);
        newProductsCount++;
      }

      purchaseItems.push({
        productId: prod.id,
        productName: prod.name,
        quantity: Number(item.quantity) || 1,
        purchasePrice: Number(item.purchasePrice) || 0,
        totalPrice: Number(item.totalPrice) || (Number(item.quantity) * Number(item.purchasePrice))
      });
    }

    const calculatedTotal = purchaseItems.reduce((sum, i) => sum + (Number(i.totalPrice) || 0), 0);
    const totalAmt = Number(payload.grandTotal) || Number(payload.totalAmount) || calculatedTotal;
    const paidAmt = payload.paidAmount !== undefined && !isNaN(Number(payload.paidAmount)) ? Number(payload.paidAmount) : totalAmt;
    const paymentStatus: PaymentStatus = paidAmt >= totalAmt ? 'PAID' : paidAmt > 0 ? 'PARTIAL' : 'PENDING';

    const pur: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNumber: payload.invoiceNumber || payload.billNumber || `PUR-${Date.now().toString().slice(-6)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      invoiceNumber: payload.invoiceNumber || payload.billNumber || `BILL-${Date.now().toString().slice(-6)}`,
      items: purchaseItems,
      totalAmount: totalAmt,
      grandTotal: totalAmt,
      paidAmount: paidAmt,
      paymentMethod: payload.paymentMethod || 'BANK',
      paymentStatus,
      purchaseDate: payload.invoiceDate || payload.billDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    data.purchases.unshift(pur);

    saveStoreData(storeId, data);

    return {
      success: true,
      purchase: pur,
      supplier: sup,
      isNewSupplierCreated,
      newProductsCount,
      updatedProductsCount
    };
  },

  getInventoryTransactions(storeId: string = 'store-demo'): InventoryTransaction[] {
    return getStoreData(storeId).inventoryTransactions;
  },

  getNotifications(storeId: string = 'store-demo'): NotificationAlert[] {
    return getStoreData(storeId).notifications;
  },

  markNotificationRead(storeId: string = 'store-demo', id: string): { success: boolean } {
    const data = getStoreData(storeId);
    const n = data.notifications.find(notif => notif.id === id);
    if (n) {
      n.isRead = true;
      saveStoreData(storeId, data);
    }
    return { success: true };
  },

  register(payload: { username: string; password?: string; shopName: string; ownerName: string; mobile: string; sector?: TradingSector }): { success: boolean; user: User; storeId: string } {
    const cleanUsername = payload.username.trim().toLowerCase();

    // Check if user already exists
    const existing = findUserAcrossAllStores(cleanUsername);
    if (existing) {
      throw new Error(`Username/Email '${payload.username}' is already registered. Please login or use a different username.`);
    }

    const newStoreId = `store-${Date.now()}`;
    const sectorKey = payload.sector || 'KIRANA_FMCG';
    const sectorConfig = getSectorConfig(sectorKey);

    const newSettings: StoreSettings = {
      storeName: payload.shopName,
      tagline: sectorConfig.defaultSettings?.tagline || sectorConfig.tagline || 'Quality Commercial Trading',
      ownerName: payload.ownerName,
      phone: payload.mobile || '9876543210',
      address: 'Shop No. 1, Main Market Commercial Complex',
      city: 'Commercial Area',
      pincode: '400001',
      currencySymbol: '₹',
      invoicePrefix: sectorConfig.defaultSettings?.invoicePrefix || 'INV-',
      invoiceFooterNote: `Thank you for doing business with ${payload.shopName}! GST Tax Invoice.`,
      lowStockThresholdDefault: 5,
      defaultLanguage: 'en',
      sector: sectorKey
    };

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: payload.ownerName,
      username: cleanUsername,
      role: 'owner',
      mobile: payload.mobile || '9876543210',
      storeId: newStoreId,
      storeName: payload.shopName,
      storeSector: sectorKey,
      permissions: {
        canViewReports: true,
        canEditProducts: true,
        canDeleteRecords: true,
        canCollectPayments: true,
        canCreateOrders: true,
        canManageSettings: true
      }
    };

    const newStoreData: StoreData = {
      settings: newSettings,
      users: [newUser],
      customers: [],
      customerTransactions: [],
      products: [],
      sales: [],
      orders: [],
      expenses: [],
      suppliers: [],
      purchases: [],
      inventoryTransactions: [],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          type: 'NEW_ORDER',
          title: '🎉 Welcome to KiranaMate!',
          message: `Your new store '${payload.shopName}' is ready for ${sectorConfig.name}. Add your first product to start!`,
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ]
    };

    saveStoreData(newStoreId, newStoreData);
    return { success: true, user: newUser, storeId: newStoreId };
  },

  login(storeId: string = 'store-demo', username: string, selectedSector?: TradingSector): { success: boolean; user: User; storeId: string } {
    const cleanUsername = username.trim().toLowerCase();

    // 1. Search if account exists in any registered store
    const found = findUserAcrossAllStores(cleanUsername);
    if (found) {
      if (selectedSector && found.storeData.settings) {
        found.storeData.settings.sector = selectedSector;
        saveStoreData(found.storeId, found.storeData);
      }
      return { success: true, user: found.user, storeId: found.storeId };
    }

    // 2. Handle standard demo accounts
    if (['admin', 'owner', 'staff'].includes(cleanUsername)) {
      let targetStoreId = storeId.startsWith('store-demo') ? storeId : 'store-demo';
      if (selectedSector) {
        const matchedSec = TRADING_SECTORS.find(s => s.id === selectedSector);
        if (matchedSec) targetStoreId = matchedSec.demoStoreId;
      }
      const demoData = getStoreData(targetStoreId);
      let u = demoData.users.find(usr => usr.username.toLowerCase() === cleanUsername);
      if (!u) {
        u = {
          id: `u-${cleanUsername}`,
          name: cleanUsername === 'admin' ? 'System Administrator' : cleanUsername === 'staff' ? 'Shop Staff' : 'Shop Owner',
          username: cleanUsername,
          role: cleanUsername === 'admin' ? 'admin' : cleanUsername === 'staff' ? 'staff' : 'owner',
          mobile: '9876543210',
          storeId: targetStoreId,
          storeName: demoData.settings?.storeName || 'Demo Store',
          storeSector: demoData.settings?.sector || 'KIRANA_FMCG',
          permissions: {
            canViewReports: true,
            canEditProducts: true,
            canDeleteRecords: true,
            canCollectPayments: true,
            canCreateOrders: true,
            canManageSettings: true
          }
        };
        demoData.users.push(u);
        saveStoreData(targetStoreId, demoData);
      }
      return { success: true, user: u, storeId: targetStoreId };
    }

    // 3. For any non-demo username not found, throw Error
    throw new Error(`Account '${username}' not found. Please check your username/email or register a new store.`);
  },

  exportBackup(storeId: string = 'store-demo') {
    const data = getStoreData(storeId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KiranaMate_Backup_${storeId}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  },

  restoreBackup(storeId: string = 'store-demo', jsonContent: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonContent);
      saveStoreData(storeId, parsed);
      return { success: true, message: 'Store database successfully restored from backup!' };
    } catch {
      throw new Error('Invalid JSON backup file');
    }
  }
};
