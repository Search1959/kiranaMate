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
  InventoryTransaction
} from '../types';
import { generateSectorSeedData } from '../server/seedData';

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

function getStoreData(storeId: string = 'store-demo'): StoreData {
  const key = `${LOCAL_STORAGE_PREFIX}${storeId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback to seed
    }
  }

  const seed = generateSectorSeedData('KIRANA_FMCG');
  const initialData: StoreData = {
    settings: seed.settings,
    users: [
      {
        id: 'u-1',
        name: 'Ramesh Gupta',
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
    purchases: seed.purchases,
    inventoryTransactions: seed.inventoryTransactions,
    notifications: [
      {
        id: 'n-1',
        title: 'Stock Alert: Fortune Refined Oil',
        message: 'Current stock is 5 pouches. Minimum threshold is 10.',
        type: 'STOCK_LOW',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]
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

    const todaySales = data.sales.filter(s => s.createdAt.startsWith(todayStr));
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

    const totalUdhaar = data.customers.reduce((acc, c) => acc + (c.currentBalance || c.outstandingBalance || 0), 0);
    const lowStockCount = data.products.filter(p => p.currentStock <= p.minStock).length;
    const pendingOrdersCount = data.orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PACKED').length;

    return {
      todaySalesTotal,
      todaySalesCount: todaySales.length,
      todayProfit,
      todayExpenses,
      totalUdhaarOutstanding: totalUdhaar,
      lowStockProductsCount: lowStockCount,
      pendingOrdersCount,
      deliveredOrdersTodayCount: data.orders.filter(o => o.orderStatus === 'DELIVERED' && o.updatedAt?.startsWith(todayStr)).length
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

  getAdminStores() {
    const seed = generateSectorSeedData('KIRANA_FMCG');
    return {
      stores: [
        {
          id: 'store-demo',
          storeName: seed.settings.storeName,
          ownerName: seed.settings.ownerName,
          isDemo: true,
          productCount: seed.products.length,
          salesCount: seed.sales.length
        }
      ]
    };
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
    const idx = data.products.findIndex(p => p.id === id);
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

    // Handle Udhaar
    if (saleData.paymentMethod === 'UDHAAR' && saleData.customerId) {
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
      deliveryAddress: orderData.deliveryAddress || 'Store Pickup',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      deliveryCharge: orderData.deliveryCharge || 0,
      grandTotal: orderData.grandTotal || 0,
      orderStatus: 'PENDING',
      paymentStatus: orderData.paymentStatus || 'UNPAID',
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
    const idx = data.purchases.findIndex(p => p.id === id);
    if (idx !== -1) {
      data.purchases.splice(idx, 1);
      saveStoreData(storeId, data);
    }
    return { success: true };
  },

  scanPurchaseBill(_imageBase64: string) {
    return {
      success: true,
      data: {
        supplierName: 'Agrawal Wholesale Traders',
        supplierMobile: '9829012345',
        supplierGstin: '08AABC10011Z1',
        supplierAddress: 'Ghee Walon Ka Rasta, Wholesale Mandi',
        billNumber: `BILL-${Math.floor(100000 + Math.random() * 900000)}`,
        billDate: new Date().toISOString().split('T')[0],
        items: [
          {
            productName: 'Fortune Refined Soyabean Oil 1L Pouch',
            quantity: 20,
            unit: 'pouch',
            purchasePrice: 110,
            sellingPrice: 125,
            mrp: 135,
            totalPrice: 2200
          },
          {
            productName: 'Aashirvaad Shuddh Chakki Atta 10kg',
            quantity: 10,
            unit: 'pkt',
            purchasePrice: 380,
            sellingPrice: 420,
            mrp: 450,
            totalPrice: 3800
          },
          {
            productName: 'Tata Salt Vacuum Evaporated 1kg',
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
        grandTotal: 6993,
        paidAmount: 6993,
        paymentStatus: 'PAID',
        rawText: 'Extracted sample purchase bill data'
      }
    };
  },

  processScannedPurchaseBill(storeId: string = 'store-demo', payload: any) {
    const data = getStoreData(storeId);

    // Find or create supplier
    let sup = data.suppliers.find(s => s.name.toLowerCase() === payload.supplierName.toLowerCase());
    let isNewSupplierCreated = false;
    if (!sup) {
      sup = {
        id: `sup-${Date.now()}`,
        name: payload.supplierName || 'New Supplier',
        contactPerson: 'Sales Executive',
        mobile: payload.supplierMobile || '9829000000',
        gstin: payload.supplierGstin || '',
        address: payload.supplierAddress || '',
        city: 'Jaipur',
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
      let prod = data.products.find(p => p.name.toLowerCase().trim() === item.productName.toLowerCase().trim());
      if (prod) {
        prod.currentStock += Number(item.quantity) || 0;
        if (item.purchasePrice) prod.purchasePrice = Number(item.purchasePrice);
        if (item.sellingPrice) prod.sellingPrice = Number(item.sellingPrice);
        if (item.mrp) prod.mrp = Number(item.mrp);
        prod.updatedAt = new Date().toISOString();
        updatedProductsCount++;
      } else {
        prod = {
          id: `p-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          name: item.productName,
          sku: `SKU-${Date.now().toString().slice(-5)}`,
          barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          category: 'Edible Oils & Ghee',
          brand: 'Generic',
          unit: item.unit || 'pcs',
          purchasePrice: Number(item.purchasePrice) || 0,
          sellingPrice: Number(item.sellingPrice) || 0,
          mrp: Number(item.mrp) || Number(item.sellingPrice) || 0,
          currentStock: Number(item.quantity) || 0,
          minStock: 10,
          supplierId: sup.id,
          gstPercent: 5,
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

    const pur: Purchase = {
      id: `pur-${Date.now()}`,
      supplierId: sup.id,
      supplierName: sup.name,
      invoiceNumber: payload.billNumber || `BILL-${Date.now().toString().slice(-6)}`,
      items: purchaseItems,
      totalAmount: Number(payload.grandTotal) || 0,
      paidAmount: Number(payload.paidAmount) || 0,
      paymentMethod: payload.paymentStatus === 'PAID' ? 'BANK' : 'CREDIT',
      paymentStatus: payload.paymentStatus || 'PAID',
      purchaseDate: payload.billDate || new Date().toISOString().split('T')[0],
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

  login(storeId: string = 'store-demo', username: string): { success: boolean; user: User; storeId: string } {
    const data = getStoreData(storeId);
    let u = data.users.find(usr => usr.username.toLowerCase() === username.toLowerCase());
    if (!u) {
      u = {
        id: `u-${Date.now()}`,
        name: username,
        username,
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
      };
      data.users.push(u);
      saveStoreData(storeId, data);
    }
    return { success: true, user: u, storeId };
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
