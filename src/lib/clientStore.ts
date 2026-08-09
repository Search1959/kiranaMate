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
  UserRole,
  AdminAccountItem,
  CustomerTransaction,
  InventoryTransaction,
  TradingSector,
  PaymentStatus
} from '../types';
import { generateSectorSeedData } from '../server/seedData';
import { TRADING_SECTORS, getSectorConfig } from './sectorConfig';
import { detectCurrencyFromLocale, getCurrencyByCountry } from './currency';
import { cloudFetchStore, cloudSaveStore, cloudLookupUsername, cloudRegisterUsername, cloudListAllTradingAccounts, cloudDeleteStore, cloudDeleteUsername } from './tradingCloud';

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

const LOCAL_STORAGE_PREFIX = 'trademate_store_';
const LEGACY_LOCAL_STORAGE_PREFIX = 'kiranamate_store_';

const PREDEFINED_ACCOUNTS: { [username: string]: { storeId: string; user: User; storeData: StoreData } } = {
  'deshna@gmail.com': {
    storeId: 'store-1786022260040',
    user: {
      id: 'user-1786022260040',
      name: 'Deshna',
      username: 'deshna@gmail.com',
      role: 'owner',
      mobile: '9836130393',
      storeId: 'store-1786022260040',
      storeName: 'Deshna Global',
      storeSector: 'METALS_STEEL',
      isDemoUser: false,
      permissions: {
        canViewReports: true,
        canEditProducts: true,
        canDeleteRecords: true,
        canCollectPayments: true,
        canCreateOrders: true,
        canManageSettings: true
      }
    },
    storeData: {
      settings: {
        storeName: 'Deshna Global',
        tagline: 'Authorized Distributor • Quality Steel & Metals Trading',
        ownerName: 'Deshna',
        phone: '9836130393',
        address: 'Shop No. 1, Main Bazaar Commercial Complex',
        city: 'Commercial Market Area',
        pincode: '400001',
        currencySymbol: '₹',
        invoicePrefix: 'DESH-',
        invoiceFooterNote: 'Thank you for doing business with Deshna Global! GST Tax Invoice.',
        lowStockThresholdDefault: 5,
        defaultLanguage: 'en',
        sector: 'METALS_STEEL'
      },
      users: [
        {
          id: 'user-1786022260040',
          name: 'Deshna',
          username: 'deshna@gmail.com',
          role: 'owner',
          mobile: '9836130393',
          storeId: 'store-1786022260040',
          storeName: 'Deshna Global',
          storeSector: 'METALS_STEEL',
          isDemoUser: false,
          permissions: {
            canViewReports: true,
            canEditProducts: true,
            canDeleteRecords: true,
            canCollectPayments: true,
            canCreateOrders: true,
            canManageSettings: true
          }
        }
      ],
      customers: [],
      customerTransactions: [],
      products: [],
      sales: [],
      orders: [],
      expenses: [],
      suppliers: [],
      purchases: [],
      inventoryTransactions: [],
      notifications: []
    }
  },
  'arun@gmail.com': {
    storeId: 'store-1786022309027',
    user: {
      id: 'user-1786022309027',
      name: 'Arun Kumar',
      username: 'arun@gmail.com',
      role: 'owner',
      mobile: '9836130393',
      storeId: 'store-1786022309027',
      storeName: 'Deinrim Solutionss (P) Ltd.',
      storeSector: 'METALS_STEEL',
      isDemoUser: false,
      permissions: {
        canViewReports: true,
        canEditProducts: true,
        canDeleteRecords: true,
        canCollectPayments: true,
        canCreateOrders: true,
        canManageSettings: true
      }
    },
    storeData: {
      settings: {
        storeName: 'Deinrim Solutionss (P) Ltd.',
        tagline: 'Authorized Distributor • TMT Fe500D, Steel Coils, Structural Beams & Pipes',
        ownerName: 'Arun Kumar',
        phone: '9836130393',
        address: 'Shop No. 1, Main Bazaar Commercial Complex',
        city: 'Commercial Market Area',
        pincode: '400001',
        currencySymbol: '₹',
        invoicePrefix: 'STL-2026-',
        invoiceFooterNote: 'Thank you for doing business with Deinrim Solutionss (P) Ltd.! GST Tax Invoice.',
        lowStockThresholdDefault: 5,
        defaultLanguage: 'en',
        sector: 'METALS_STEEL'
      },
      users: [
        {
          id: 'user-1786022309027',
          name: 'Arun Kumar',
          username: 'arun@gmail.com',
          role: 'owner',
          mobile: '9836130393',
          storeId: 'store-1786022309027',
          storeName: 'Deinrim Solutionss (P) Ltd.',
          storeSector: 'METALS_STEEL',
          isDemoUser: false,
          permissions: {
            canViewReports: true,
            canEditProducts: true,
            canDeleteRecords: true,
            canCollectPayments: true,
            canCreateOrders: true,
            canManageSettings: true
          }
        }
      ],
      customers: [],
      customerTransactions: [],
      products: [],
      sales: [],
      orders: [],
      expenses: [],
      suppliers: [],
      purchases: [],
      inventoryTransactions: [],
      notifications: []
    }
  }
};

async function findUserAcrossAllStores(username: string): Promise<{ user: User; storeId: string; storeData: StoreData } | null> {
  const clean = username.trim().toLowerCase();

  // 1. Check predefined accounts first (e.g., deshna@gmail.com, arun@gmail.com) —
  //    their storeId is fixed/known on every origin, so always try the cloud's
  //    latest copy before falling back to the hardcoded empty default.
  if (PREDEFINED_ACCOUNTS[clean]) {
    const pre = PREDEFINED_ACCOUNTS[clean];
    await hydrateStoreFromCloud(pre.storeId);
    const key = `${LOCAL_STORAGE_PREFIX}${pre.storeId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const storeData: StoreData = JSON.parse(raw);
        const u = storeData.users?.find(usr => usr.username.toLowerCase() === clean) || pre.user;
        return { user: u, storeId: pre.storeId, storeData };
      } catch {
        // fall through to the hardcoded default below
      }
    }
    localStorage.setItem(key, JSON.stringify(pre.storeData));
    return pre;
  }

  // 2. Check the cloud directory for a self-registered account (works from
  //    any browser/hosting, not just the one that originally registered it).
  const cloudMatch = await cloudLookupUsername(clean);
  if (cloudMatch?.storeId) {
    await hydrateStoreFromCloud(cloudMatch.storeId);
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${cloudMatch.storeId}`);
    if (raw) {
      try {
        const storeData: StoreData = JSON.parse(raw);
        const u = storeData.users?.find(usr => usr.username.toLowerCase() === clean);
        if (u) return { user: u, storeId: cloudMatch.storeId, storeData };
      } catch {
        // ignore and fall through to local scan
      }
    }
  }

  // 3. Check browser localStorage (accounts only ever used locally, or as a
  //    fallback when the cloud is unreachable)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(LOCAL_STORAGE_PREFIX) || key.startsWith(LEGACY_LOCAL_STORAGE_PREFIX))) {
      const sid = key.startsWith(LOCAL_STORAGE_PREFIX)
        ? key.replace(LOCAL_STORAGE_PREFIX, '')
        : key.replace(LEGACY_LOCAL_STORAGE_PREFIX, '');
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
  const sectorDef = TRADING_SECTORS.find(s => s.demoStoreId === storeId || s.id === storeId);
  if (sectorDef) {
    sectorKey = sectorDef.id;
  } else if (storeId === 'store-demo-steel' || storeId.includes('steel')) sectorKey = 'METALS_STEEL';
  else if (storeId === 'store-demo-footwear' || storeId.includes('footwear')) sectorKey = 'FOOTWEAR_GARMENTS';
  else if (storeId === 'store-demo-pharma' || storeId.includes('pharma')) sectorKey = 'PHARMACY';
  else if (storeId === 'store-demo-electrical' || storeId.includes('electrical')) sectorKey = 'ELECTRICAL_ELECTRONICS';
  else if (storeId === 'store-demo-agri' || storeId.includes('agri')) sectorKey = 'AGRICULTURE';
  else if (storeId === 'store-demo-textile' || storeId.includes('textile')) sectorKey = 'TEXTILES';
  else if (storeId === 'store-demo-chemical' || storeId.includes('chemical')) sectorKey = 'CHEMICALS';
  else if (storeId === 'store-demo-energy' || storeId.includes('energy')) sectorKey = 'ENERGY';
  else if (storeId === 'store-demo-jewellery' || storeId.includes('jewel')) sectorKey = 'JEWELLERY';
  else if (storeId === 'store-demo-stationery' || storeId.includes('stationery')) sectorKey = 'STATIONERY';
  else if (storeId === 'store-demo-hardware' || storeId.includes('hardware')) sectorKey = 'BUILDING_HARDWARE';
  else if (storeId === 'store-demo-kirana' || storeId.includes('kirana')) sectorKey = 'KIRANA_FMCG';

  const key = `${LOCAL_STORAGE_PREFIX}${storeId}`;
  const legacyKey = `${LEGACY_LOCAL_STORAGE_PREFIX}${storeId}`;
  const raw = localStorage.getItem(key) || localStorage.getItem(legacyKey);
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
  // Best-effort background push so this store's data reaches every other
  // hosting/browser too — fire-and-forget, never blocks the caller.
  cloudSaveStore(storeId, data);
}

/**
 * Pulls this store's latest data down from Firestore (if any) and caches it
 * locally, so a fresh login/demo-launch on this origin sees whatever was
 * last saved anywhere else — not just what this browser already knew about.
 * Safe no-op if the cloud is unreachable or has nothing for this store yet.
 */
async function hydrateStoreFromCloud(storeId: string): Promise<void> {
  const cloudData = await cloudFetchStore(storeId);
  if (cloudData && cloudData.users) {
    const key = `${LOCAL_STORAGE_PREFIX}${storeId}`;
    localStorage.setItem(key, JSON.stringify(cloudData));
  }
}

export const clientStore = {
  getDailyStats(storeId: string = 'store-demo'): DailyStats {
    const data = getStoreData(storeId);
    const todayStr = new Date().toISOString().split('T')[0];

    let todaySales = data.sales.filter(s => s.createdAt.startsWith(todayStr));
    if (todaySales.length === 0 && data.sales.length > 0) {
      todaySales = data.sales;
    }
    // Voided sales stay in the record for the audit trail but must never count toward revenue.
    todaySales = todaySales.filter(s => s.status !== 'CANCELLED');
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
    if (newSettings.storeName) {
      if (data.users && Array.isArray(data.users)) {
        data.users.forEach(u => {
          u.storeName = newSettings.storeName;
        });
      }
    }
    if (newSettings.ownerName) {
      if (data.users && Array.isArray(data.users)) {
        const ownerUser = data.users.find(u => u.role === 'owner');
        if (ownerUser) ownerUser.name = newSettings.ownerName;
      }
    }
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
    const storesMap = new Map<string, { id: string; storeName: string; ownerName: string; isDemo: boolean; productCount: number; salesCount: number }>();

    // 1. Add default sector demo stores
    TRADING_SECTORS.forEach(sec => {
      const seed = generateSectorSeedData(sec.id);
      storesMap.set(sec.demoStoreId, {
        id: sec.demoStoreId,
        storeName: seed.settings.storeName,
        ownerName: 'Demo Manager',
        isDemo: true,
        productCount: seed.products.length,
        salesCount: seed.sales.length
      });
    });

    // 2. Scan custom registered stores in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(LOCAL_STORAGE_PREFIX) || key.startsWith(LEGACY_LOCAL_STORAGE_PREFIX))) {
        const sid = key.startsWith(LOCAL_STORAGE_PREFIX)
          ? key.replace(LOCAL_STORAGE_PREFIX, '')
          : key.replace(LEGACY_LOCAL_STORAGE_PREFIX, '');
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data: StoreData = JSON.parse(raw);
            storesMap.set(sid, {
              id: sid,
              storeName: data.settings?.storeName || 'Registered Store',
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

    return { stores: Array.from(storesMap.values()) };
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

  /** Mirrors src/server/db.ts voidSale() — keeps the sale record but marks it
   * CANCELLED and reverses stock + Udhaar balance, instead of deleting it. */
  voidSale(storeId: string = 'store-demo', id: string, reason: string): Sale {
    const data = getStoreData(storeId);
    const sale = data.sales.find(s => s.id === id);
    if (!sale) throw new Error('Sale not found');
    if (sale.status === 'CANCELLED') return sale;

    for (const item of sale.items) {
      const prod = data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock = prod.currentStock + item.quantity;
        prod.updatedAt = new Date().toISOString();

        data.inventoryTransactions.unshift({
          id: `inv-void-${Date.now()}`,
          productId: prod.id,
          productName: prod.name,
          type: 'SALE_CANCELLED',
          quantityChange: item.quantity,
          stockAfter: prod.currentStock,
          referenceId: sale.saleNumber,
          notes: `Sale #${sale.saleNumber} voided: ${reason}`,
          createdBy: 'Owner',
          createdAt: new Date().toISOString()
        });
      }
    }

    if (sale.paymentMethod === 'CREDIT' && sale.customerId) {
      const cust = data.customers.find(c => c.id === sale.customerId);
      if (cust) {
        const prevBal = cust.currentBalance || cust.outstandingBalance || 0;
        const newBal = Math.max(0, prevBal - sale.grandTotal);
        cust.currentBalance = newBal;
        cust.outstandingBalance = newBal;
        cust.updatedAt = new Date().toISOString();

        data.customerTransactions.unshift({
          id: `tx-void-${Date.now()}`,
          customerId: cust.id,
          type: 'RETURN_CREDIT',
          amount: sale.grandTotal,
          balanceAfter: newBal,
          referenceId: sale.saleNumber,
          notes: `Sale #${sale.saleNumber} voided: ${reason}`,
          createdBy: 'Owner',
          createdAt: new Date().toISOString()
        });
      }
    }

    sale.status = 'CANCELLED';
    sale.cancelReason = reason;
    sale.cancelledAt = new Date().toISOString();

    saveStoreData(storeId, data);
    return sale;
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

  scanPurchaseBill(_imageBase64: string): never {
    // There is no safe way to call Gemini directly from the browser (it needs a secret
    // API key, unlike the public Firestore config other clientStore fallbacks use), so
    // when the real /api/ai/scan-bill server isn't reachable (static hosting, offline,
    // dev server down) we can't actually perform AI OCR. Throwing here — instead of
    // returning fabricated "extracted" data dressed up as a real scan result — lets
    // ScanPurchaseBillModal show an honest "AI unavailable, retry or enter manually"
    // state. Deliberately-chosen sample bills (the "Try a sample bill" cards) still
    // work for exploring the feature; they never call this function.
    throw new Error("AI bill scanning needs a live server connection, which isn't available right now.");
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

  async register(payload: { username: string; password?: string; shopName: string; ownerName: string; mobile: string; sector?: TradingSector; country?: string; allowExisting?: boolean }): Promise<{ success: boolean; user: User; storeId: string }> {
    const rawUsername = payload.username || 'user';
    let cleanUsername = rawUsername.trim().toLowerCase();

    // Check if user already exists
    const existing = await findUserAcrossAllStores(cleanUsername);
    if (existing) {
      if (payload.allowExisting !== false) {
        // Log in directly to the existing account and store
        return { success: true, user: existing.user, storeId: existing.storeId };
      }
      // Generate a unique username if requested
      cleanUsername = `${cleanUsername}_${Date.now().toString().slice(-4)}`;
    }

    const newStoreId = `store-${Date.now()}`;
    const sectorKey = payload.sector || 'KIRANA_FMCG';
    const sectorConfig = getSectorConfig(sectorKey);

    // An explicit country from the signup form is authoritative; fall back to
    // a locale guess only when the user didn't pick one (e.g. quick sign-up).
    const detectedCurrency = payload.country ? getCurrencyByCountry(payload.country) : detectCurrencyFromLocale();

    const newSettings: StoreSettings = {
      storeName: payload.shopName,
      tagline: sectorConfig.defaultSettings?.tagline || sectorConfig.tagline || 'Quality Commercial Trading',
      ownerName: payload.ownerName,
      phone: payload.mobile || '9876543210',
      address: 'Shop No. 1, Main Market Commercial Complex',
      city: 'Commercial Area',
      pincode: '400001',
      currencySymbol: detectedCurrency.symbol,
      currencyCode: detectedCurrency.code,
      country: payload.country,
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
          title: '🎉 Welcome to TradeMate!',
          message: `Your new store '${payload.shopName}' is ready for ${sectorConfig.name}. Add your first product to start!`,
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ]
    };

    saveStoreData(newStoreId, newStoreData); // also pushes the store to the cloud
    cloudRegisterUsername(cleanUsername, newStoreId); // best-effort — makes this username findable from any browser/hosting
    return { success: true, user: newUser, storeId: newStoreId };
  },

  async getAdminAccounts(): Promise<{ accounts: AdminAccountItem[] }> {
    const list: AdminAccountItem[] = [];
    const seenUsernames = new Set<string>();

    // 1. Scan custom registered stores in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(LOCAL_STORAGE_PREFIX) || key.startsWith(LEGACY_LOCAL_STORAGE_PREFIX))) {
        const sid = key.startsWith(LOCAL_STORAGE_PREFIX)
          ? key.replace(LOCAL_STORAGE_PREFIX, '')
          : key.replace(LEGACY_LOCAL_STORAGE_PREFIX, '');
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data: StoreData = JSON.parse(raw);
            const users = data.users || [];
            users.forEach(u => {
              if (u.username && !seenUsernames.has(u.username.toLowerCase())) {
                seenUsernames.add(u.username.toLowerCase());
                list.push({
                  id: u.id,
                  userId: u.id,
                  name: u.name || 'Store Manager',
                  username: u.username,
                  password: u.password || '123456',
                  role: u.role || 'owner',
                  mobile: u.mobile || '9876543210',
                  storeId: sid,
                  storeName: data.settings?.storeName || u.storeName || 'Registered Store',
                  storeSector: data.settings?.sector || u.storeSector || 'GENERAL_TRADING',
                  productCount: data.products ? data.products.length : 0,
                  salesCount: data.sales ? data.sales.length : 0,
                  customerCount: data.customers ? data.customers.length : 0,
                  createdAt: u.createdAt || new Date().toISOString(),
                  isDemo: sid.startsWith('store-demo')
                });
              }
            });
          }
        } catch {
          // ignore
        }
      }
    }

    // 1.5. Cloud directory — accounts self-registered on ANY hosting/browser,
    //      not just this one. This is what makes the registry "auto sync" a
    //      brand-new signup regardless of where it happened.
    try {
      const cloudAccounts = await cloudListAllTradingAccounts();
      for (const { username: cloudUsername, storeId: cloudStoreId } of cloudAccounts) {
        if (seenUsernames.has(cloudUsername.toLowerCase()) || !cloudStoreId) continue;
        const data = await cloudFetchStore(cloudStoreId);
        if (!data || !data.users) continue;
        const u = data.users.find((usr: User) => usr.username.toLowerCase() === cloudUsername.toLowerCase()) || data.users[0];
        if (!u) continue;
        seenUsernames.add(cloudUsername.toLowerCase());
        list.push({
          id: u.id,
          userId: u.id,
          name: u.name || 'Store Manager',
          username: u.username,
          password: u.password || '123456',
          role: u.role || 'owner',
          mobile: u.mobile || '9876543210',
          storeId: cloudStoreId,
          storeName: data.settings?.storeName || 'Registered Store',
          storeSector: data.settings?.sector || 'GENERAL_TRADING',
          productCount: data.products ? data.products.length : 0,
          salesCount: data.sales ? data.sales.length : 0,
          customerCount: data.customers ? data.customers.length : 0,
          createdAt: u.createdAt || new Date().toISOString(),
          isDemo: false
        });
      }
    } catch (err) {
      console.error('Failed to merge cloud trading accounts into admin registry:', err);
    }

    // 2. Pre-defined accounts if not seen yet
    Object.keys(PREDEFINED_ACCOUNTS).forEach(uname => {
      if (!seenUsernames.has(uname.toLowerCase())) {
        const item = PREDEFINED_ACCOUNTS[uname];
        seenUsernames.add(uname.toLowerCase());
        list.push({
          id: item.user.id,
          userId: item.user.id,
          name: item.user.name,
          username: item.user.username,
          password: item.user.password || '123456',
          role: item.user.role,
          mobile: item.user.mobile || '9876543210',
          storeId: item.storeId,
          storeName: item.storeData.settings.storeName,
          storeSector: item.storeData.settings.sector,
          productCount: item.storeData.products.length,
          salesCount: item.storeData.sales.length,
          customerCount: item.storeData.customers.length,
          createdAt: new Date().toISOString(),
          isDemo: true
        });
      }
    });

    // 3. Always include System Admin account
    if (!seenUsernames.has('apex7tech@gmail.com')) {
      list.unshift({
        id: 'user-admin',
        userId: 'user-admin',
        name: 'System Administrator',
        username: 'apex7tech@gmail.com',
        password: 'Search@1959',
        role: 'admin',
        mobile: '9876543210',
        storeId: 'store-demo',
        storeName: 'TradeMate Central Admin',
        storeSector: 'GENERAL_TRADING',
        productCount: 0,
        salesCount: 0,
        customerCount: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        isDemo: true
      });
    }

    return { accounts: list };
  },

  async updateAdminAccount(payload: {
    userId: string;
    storeId: string;
    name: string;
    username: string;
    password?: string;
    mobile: string;
    role: UserRole;
    storeName: string;
    storeSector?: TradingSector;
  }): Promise<{ success: boolean; account: AdminAccountItem }> {
    // The admin viewing this may be on a browser that's never touched this
    // store before — pull the real cloud copy first so an edit can't
    // silently overwrite real data with a blank local seed.
    await hydrateStoreFromCloud(payload.storeId);
    const data = getStoreData(payload.storeId);
    let user = data.users.find(u => u.id === payload.userId || u.username.toLowerCase() === payload.username.toLowerCase());

    if (!user) {
      user = {
        id: payload.userId || `u-${Date.now()}`,
        name: payload.name,
        username: payload.username,
        role: payload.role,
        mobile: payload.mobile,
        storeId: payload.storeId,
        permissions: {
          canViewReports: true,
          canEditProducts: true,
          canDeleteRecords: true,
          canCollectPayments: true,
          canCreateOrders: true,
          canManageSettings: true
        }
      };
      data.users.push(user);
    }

    user.name = payload.name;
    user.username = payload.username;
    if (payload.password) user.password = payload.password;
    user.mobile = payload.mobile;
    user.role = payload.role;
    user.storeName = payload.storeName;
    if (payload.storeSector) user.storeSector = payload.storeSector;

    if (data.settings) {
      data.settings.storeName = payload.storeName;
      data.settings.ownerName = payload.name;
      if (payload.storeSector) data.settings.sector = payload.storeSector;
      data.settings.phone = payload.mobile;
    }

    saveStoreData(payload.storeId, data);

    return {
      success: true,
      account: {
        id: user.id,
        userId: user.id,
        name: user.name,
        username: user.username,
        password: user.password || '123456',
        role: user.role,
        mobile: user.mobile,
        storeId: payload.storeId,
        storeName: payload.storeName,
        storeSector: payload.storeSector || 'GENERAL_TRADING',
        productCount: data.products ? data.products.length : 0,
        salesCount: data.sales ? data.sales.length : 0,
        customerCount: data.customers ? data.customers.length : 0,
        createdAt: user.createdAt || new Date().toISOString()
      }
    };
  },

  async deleteAdminAccount(storeId: string, userId: string): Promise<{ success: boolean }> {
    // Same reasoning as updateAdminAccount: hydrate the real cloud copy
    // first, so deleting/pruning a user can't act on a blank local seed.
    await hydrateStoreFromCloud(storeId);
    const data = getStoreData(storeId);
    const removedUser = data.users.find(u => u.id === userId || u.username === userId);
    data.users = data.users.filter(u => u.id !== userId && u.username !== userId);

    if (data.users.length === 0 && !storeId.startsWith('store-demo')) {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${storeId}`);
      localStorage.removeItem(`${LEGACY_LOCAL_STORAGE_PREFIX}${storeId}`);
      cloudDeleteStore(storeId); // best-effort, fire-and-forget
      if (removedUser?.username) cloudDeleteUsername(removedUser.username.trim().toLowerCase());
    } else {
      saveStoreData(storeId, data);
    }

    return { success: true };
  },

  async login(storeId: string = 'store-demo', username: string, password?: string, selectedSector?: TradingSector): Promise<{ success: boolean; user: User; storeId: string }> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // SPECIAL CHECK FOR SYSTEM ADMIN
    if (cleanUsername === 'apex7tech@gmail.com' || cleanUsername === 'admin') {
      const adminUser: User = {
        id: 'user-admin',
        name: 'System Administrator',
        username: 'apex7tech@gmail.com',
        password: 'Search@1959',
        role: 'admin',
        mobile: '9876543210',
        storeId: 'store-demo',
        storeName: 'TradeMate Central Admin',
        storeSector: 'GENERAL_TRADING',
        permissions: {
          canViewReports: true,
          canEditProducts: true,
          canDeleteRecords: true,
          canCollectPayments: true,
          canCreateOrders: true,
          canManageSettings: true
        }
      };
      return { success: true, user: adminUser, storeId: 'store-demo' };
    }

    // 1. Search if account exists in any registered store
    const found = await findUserAcrossAllStores(cleanUsername);
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
      await hydrateStoreFromCloud(targetStoreId); // pull the latest demo data from any other hosting/session first
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

    // 3. Auto-provision account if user enters email or custom username on Login
    if (cleanUsername.includes('@') || cleanUsername.length >= 3) {
      const parts = cleanUsername.split('@');
      let shopName = `${parts[0].toUpperCase()} Store`;
      if (cleanUsername.includes('deshna')) shopName = 'Deshna Global';
      else if (cleanUsername.includes('arun')) shopName = 'Deinrim Solutionss (P) Ltd.';

      const reg = await this.register({
        username: cleanUsername,
        shopName,
        ownerName: parts[0],
        mobile: '9836130393',
        sector: selectedSector || (cleanUsername.includes('arun') || cleanUsername.includes('deshna') ? 'METALS_STEEL' : 'KIRANA_FMCG')
      });
      return { success: true, user: reg.user, storeId: reg.storeId };
    }

    // 4. Fallback error if completely invalid
    throw new Error(`Account '${username}' not found. Please check your username/email or register a new store.`);
  },

  exportBackup(storeId: string = 'store-demo') {
    const data = getStoreData(storeId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeMate_Backup_${storeId}_${new Date().toISOString().split('T')[0]}.json`;
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
