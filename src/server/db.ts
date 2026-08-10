import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { saveStoreToCloud, fetchStoreFromCloud, saveUsernameDirectory, lookupUsernameDirectory, listAllUsernameDirectoryEntries } from './firestore';
import { upsertSaleToMysql, upsertPurchaseToMysql, insertStockLedgerEntriesToMysql, migrateStoreHistoryToMysql, getMysqlRowCounts } from './mysql';
import {
  User,
  Customer,
  CustomerTransaction,
  Product,
  ProductUnit,
  Supplier,
  Purchase,
  PurchaseItem,
  Order,
  Sale,
  Expense,
  InventoryTransaction,
  NotificationAlert,
  StoreSettings,
  DailyStats,
  PaymentMethod,
  PaymentStatus,
  TradingSector
} from '../types';
import { generateSeedData, generateSectorSeedData } from './seedData';
import { getSectorConfig, TRADING_SECTORS } from '../lib/sectorConfig';
import { detectCurrencyFromAcceptLanguage, getCurrencyByCountry, formatMoney } from '../lib/currency';

const DB_FILE = path.join(process.cwd(), 'data_kiranamate_db.json');

export interface DatabaseSchema {
  users: User[];
  customers: Customer[];
  customerTransactions: CustomerTransaction[];
  products: Product[];
  suppliers: Supplier[];
  purchases: Purchase[];
  orders: Order[];
  sales: Sale[];
  expenses: Expense[];
  inventoryTransactions: InventoryTransaction[];
  notifications: NotificationAlert[];
  settings: StoreSettings;
}

export interface MultiStoreData {
  stores: {
    [storeId: string]: DatabaseSchema;
  };
}

class Database {
  private storeMap: { [storeId: string]: DatabaseSchema } = {};

  constructor() {
    this.loadData();
    this.hydrateFromCloud();
  }

  private loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.stores) {
          this.storeMap = parsed.stores;
        } else if (parsed.products && parsed.settings) {
          // Migration from single store format
          this.storeMap = {
            'store-demo': parsed
          };
        } else {
          this.initSeedData();
        }
      } else {
        this.initSeedData();
      }
    } catch (err) {
      console.error('Error loading DB, reinitializing seed data:', err);
      this.initSeedData();
    }

    // Ensure demo store always exists
    if (!this.storeMap['store-demo']) {
      this.initSeedData();
    }
  }

  private async hydrateFromCloud() {
    try {
      // Don't just re-sync stores a (possibly stale, git-reset) local snapshot
      // already happens to know about — pull the full list of every real
      // account from the durable Firestore directory too, so a fresh deploy
      // recovers everyone's real data immediately, not just whichever stores
      // happened to be in the last commit of the local file.
      const storesToSync = new Set(Object.keys(this.storeMap));
      storesToSync.add('store-demo');
      try {
        const directory = await listAllUsernameDirectoryEntries();
        directory.forEach(entry => { if (entry.storeId) storesToSync.add(entry.storeId); });
      } catch (err) {
        console.error('Failed to list username directory during hydrate:', err);
      }

      for (const sId of storesToSync) {
        const cloudStore = await fetchStoreFromCloud(sId);
        if (cloudStore && cloudStore.products) {
          this.storeMap[sId] = cloudStore as DatabaseSchema;
        } else if (this.storeMap[sId]) {
          saveStoreToCloud(sId, this.storeMap[sId]);
        }
      }
      fs.writeFileSync(DB_FILE, JSON.stringify({ stores: this.storeMap }, null, 2), 'utf-8');
      console.log(`☁️ Database hydrated with live data from Cloud Firestore! (${storesToSync.size} stores)`);
    } catch (err) {
      console.error('Failed to hydrate from Cloud Firestore:', err);
    }
  }

  /** Injects freshly cloud-fetched data for a store directly into the live
   * in-memory map (and persists it locally too) — used when a login resolves
   * a username to an existing storeId that wasn't already loaded. */
  public hydrateStoreFromData(storeId: string, data: DatabaseSchema) {
    this.storeMap[storeId] = data;
    this.saveData(storeId);
  }

  /**
   * @param changedStoreId When the caller knows exactly which store just
   * changed, pass it here so only that one store gets re-synced to Firestore
   * — not every store this process happens to have loaded. Without this,
   * a single sale in Store A was pushing Store A, B, C, and D's ENTIRE
   * history to Firestore on every mutation, anywhere in the app: O(numStores)
   * redundant writes per change, and every write's payload size grows with
   * each store's total accumulated history, not just what actually changed.
   * That multiplies badly as both store count and per-store history grow —
   * real scaling risk, not theoretical. Omit it only for genuinely
   * store-agnostic saves (e.g. bulk hydration) where syncing everything is
   * actually the intent.
   */
  public saveData(changedStoreId?: string) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify({ stores: this.storeMap }, null, 2), 'utf-8');

      const storeIds = changedStoreId ? [changedStoreId] : Object.keys(this.storeMap);
      storeIds.forEach(storeId => {
        if (!this.storeMap[storeId]) return;
        saveStoreToCloud(storeId, this.storeMap[storeId]).catch(err => {
          console.error(`Error saving store [${storeId}] to Cloud Firestore:`, err);
        });
      });
    } catch (err) {
      console.error('Failed to write DB file:', err);
    }
  }

  public initSeedData() {
    const seed = generateSeedData();
    const defaultUsers: User[] = [
      {
        id: 'user-admin',
        name: 'System Administrator',
        username: 'admin',
        role: 'admin',
        mobile: '9999999999',
        storeId: 'store-demo',
        storeName: 'Demo Kirana Supermarket',
        isDemoUser: true,
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
        id: 'user-1',
        name: 'Shop Owner',
        username: 'owner',
        role: 'owner',
        mobile: '9876543210',
        storeId: 'store-demo',
        storeName: 'TradeMate General Store',
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
      {
        id: 'user-2',
        name: 'Suresh Kumar (Demo Staff)',
        username: 'staff',
        role: 'staff',
        mobile: '9811223344',
        storeId: 'store-demo',
        storeName: 'Gupta Kirana & General Store',
        isDemoUser: true,
        permissions: {
          canViewReports: false,
          canEditProducts: true,
          canDeleteRecords: false,
          canCollectPayments: true,
          canCreateOrders: true,
          canManageSettings: false
        }
      }
    ];

    const initialNotifications: NotificationAlert[] = [];

    this.storeMap['store-demo'] = {
      users: defaultUsers,
      customers: seed.customers,
      customerTransactions: seed.customerTransactions,
      products: seed.products,
      suppliers: seed.suppliers,
      purchases: [],
      orders: seed.orders,
      sales: seed.sales,
      expenses: seed.expenses,
      inventoryTransactions: seed.inventoryTransactions,
      notifications: initialNotifications,
      settings: seed.settings
    };

    this.saveData('store-demo');
  }

  private getStore(storeId: string = 'store-demo'): DatabaseSchema {
    let targetSectorId: TradingSector | undefined;
    const matchedSector = TRADING_SECTORS.find(s => s.demoStoreId === storeId || s.id === storeId);
    if (matchedSector) {
      targetSectorId = matchedSector.id;
    } else if (storeId.includes('footwear') || storeId.includes('garment')) {
      targetSectorId = 'FOOTWEAR_GARMENTS';
    } else if (storeId.includes('pharma') || storeId.includes('chemist')) {
      targetSectorId = 'PHARMACY';
    } else if (storeId.includes('electric')) {
      targetSectorId = 'ELECTRICAL_ELECTRONICS';
    } else if (storeId.includes('steel') || storeId.includes('metal')) {
      targetSectorId = 'METALS_STEEL';
    } else if (storeId.includes('agri')) {
      targetSectorId = 'AGRICULTURE';
    } else if (storeId.includes('textile')) {
      targetSectorId = 'TEXTILES';
    } else if (storeId.includes('chemical')) {
      targetSectorId = 'CHEMICALS';
    } else if (storeId.includes('energy')) {
      targetSectorId = 'ENERGY';
    } else if (storeId.includes('jewel')) {
      targetSectorId = 'JEWELLERY';
    } else if (storeId.includes('stationery')) {
      targetSectorId = 'STATIONERY';
    } else if (storeId.includes('hardware')) {
      targetSectorId = 'BUILDING_HARDWARE';
    } else if (storeId.includes('auto')) {
      targetSectorId = 'AUTO_PARTS';
    } else if (storeId.includes('cosmetic')) {
      targetSectorId = 'COSMETICS';
    } else if (storeId.includes('fruit') || storeId.includes('veg')) {
      targetSectorId = 'FRUITS_VEGETABLES';
    } else if (storeId.includes('bakery')) {
      targetSectorId = 'BAKERY';
    } else if (storeId.includes('dairy')) {
      targetSectorId = 'DAIRY_BEVERAGE';
    } else if (storeId.includes('seed')) {
      targetSectorId = 'SEEDS_FERTILIZERS';
    } else if (storeId.includes('water') || storeId.includes('ro')) {
      targetSectorId = 'WATER_RO';
    } else if (storeId.includes('mobile') || storeId.includes('computer')) {
      targetSectorId = 'MOBILE_COMPUTERS';
    } else if (storeId.includes('plastic') || storeId.includes('package')) {
      targetSectorId = 'PLASTICS_PACKAGING';
    } else if (storeId.includes('furniture') || storeId.includes('wood')) {
      targetSectorId = 'FURNITURE_WOOD';
    }

    // Purge cached demo store if its stored sector does not match expected targetSectorId
    if (this.storeMap[storeId] && storeId.startsWith('store-demo-') && targetSectorId) {
      if (this.storeMap[storeId].settings?.sector !== targetSectorId) {
        delete this.storeMap[storeId];
      }
    }

    if (!this.storeMap[storeId]) {
      if (storeId.startsWith('store-demo-') || storeId === 'store-demo') {
        const sectorKey: TradingSector = targetSectorId || 'KIRANA_FMCG';

        const seed = generateSectorSeedData(sectorKey);
        const defaultUsers: User[] = [
          {
            id: `user-owner-${storeId}`,
            name: `Demo Manager (${seed.settings.storeName})`,
            username: `owner-${storeId}`,
            role: 'owner',
            mobile: '9876543210',
            storeId,
            storeName: seed.settings.storeName,
            storeSector: sectorKey,
            isDemoUser: true,
            permissions: {
              canViewReports: true,
              canEditProducts: true,
              canDeleteRecords: true,
              canCollectPayments: true,
              canCreateOrders: true,
              canManageSettings: true
            }
          }
        ];

        this.storeMap[storeId] = {
          users: defaultUsers,
          customers: seed.customers,
          customerTransactions: seed.customerTransactions,
          products: seed.products,
          suppliers: seed.suppliers,
          purchases: [],
          orders: seed.orders,
          sales: seed.sales,
          expenses: seed.expenses,
          inventoryTransactions: seed.inventoryTransactions,
          notifications: [],
          settings: seed.settings
        };
        this.saveData(storeId);
      } else {
        // Fallback or initialize empty store for new user
        this.storeMap[storeId] = {
          users: [],
          customers: [],
          customerTransactions: [],
          products: [],
          suppliers: [],
          purchases: [],
          orders: [],
          sales: [],
          expenses: [],
          inventoryTransactions: [],
          notifications: [],
          settings: {
            storeName: 'My Trading Store',
            tagline: 'Quality Commercial & Wholesale Trading',
            ownerName: 'Shop Owner',
            phone: '9876543210',
            address: 'Main Commercial Market',
            city: 'Market',
            pincode: '400001',
            currencySymbol: '₹',
            invoicePrefix: 'INV-',
            invoiceFooterNote: 'Thank you for doing business with us!',
            lowStockThresholdDefault: 5,
            defaultLanguage: 'en',
            sector: 'GENERAL_TRADING'
          }
        };
        this.saveData(storeId);
      }
    }
    return this.storeMap[storeId];
  }

  // --- MULTI-TENANCY & STORE MANAGEMENT ---

  public registerStore(data: {
    username: string;
    password?: string;
    shopName: string;
    ownerName: string;
    mobile: string;
    sector?: TradingSector;
    country?: string;
    acceptLanguage?: string;
  }): { user: User; storeId: string } {
    const cleanUsername = data.username.trim().toLowerCase();

    // Check if username exists across any store
    for (const sid of Object.keys(this.storeMap)) {
      const existing = this.storeMap[sid].users.find(u => u.username.toLowerCase() === cleanUsername);
      if (existing) {
        throw new Error('Username is already taken. Please choose another username.');
      }
    }

    const sectorKey = data.sector || 'KIRANA_FMCG';
    const sectorConfig = getSectorConfig(sectorKey);

    const newStoreId = `store-${Date.now()}`;
    const newUserId = `user-${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      name: data.ownerName,
      username: cleanUsername,
      // password kept in plaintext deliberately (System Admin panel still
      // shows/copies it) alongside passwordHash, which is what login actually
      // verifies against. A password is now required for every registration —
      // server.ts's /api/auth/register defaults to '123456' if none is given.
      password: data.password!,
      passwordHash: bcrypt.hashSync(data.password!, 10),
      role: 'owner',
      mobile: data.mobile || '9876543210',
      storeId: newStoreId,
      storeName: data.shopName,
      storeSector: sectorKey,
      isDemoUser: false,
      permissions: {
        canViewReports: true,
        canEditProducts: true,
        canDeleteRecords: true,
        canCollectPayments: true,
        canCreateOrders: true,
        canManageSettings: true
      }
    };

    // An explicit country from the signup form is authoritative; fall back to
    // a locale guess (via Accept-Language) only when the user didn't pick one.
    // This is set once at registration and won't drift with wherever the
    // owner happens to be on a later login — overridable in Settings.
    const detectedCurrency = data.country
      ? getCurrencyByCountry(data.country)
      : detectCurrencyFromAcceptLanguage(data.acceptLanguage);

    const newSettings: StoreSettings = {
      storeName: data.shopName,
      tagline: sectorConfig.defaultSettings?.tagline || sectorConfig.tagline || 'Quality Commercial Trading',
      ownerName: data.ownerName,
      phone: data.mobile || '9876543210',
      address: 'Shop No. 1, Main Bazaar Commercial Complex',
      city: 'Commercial Market Area',
      pincode: '400001',
      currencySymbol: detectedCurrency.symbol,
      currencyCode: detectedCurrency.code,
      country: data.country,
      invoicePrefix: sectorConfig.defaultSettings?.invoicePrefix || 'INV-',
      invoiceFooterNote: `Thank you for doing business with ${data.shopName}! GST Tax Invoice.`,
      lowStockThresholdDefault: 5,
      defaultLanguage: 'en',
      sector: sectorKey
    };

    const welcomeNotification: NotificationAlert = {
      id: `notif-${Date.now()}`,
      type: 'NEW_ORDER',
      title: '🎉 Welcome to TradeMate!',
      message: `Your new store '${data.shopName}' is ready with clean zero data. Add your first product or customer to get started!`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Initialize with ZERO demo data!
    this.storeMap[newStoreId] = {
      users: [newUser],
      customers: [],
      customerTransactions: [],
      products: [],
      suppliers: [],
      purchases: [],
      orders: [],
      sales: [],
      expenses: [],
      inventoryTransactions: [],
      notifications: [welcomeNotification],
      settings: newSettings
    };

    this.saveData(newStoreId);
    // Register this username's storeId in the durable cloud directory so a
    // later login — even after this server process restarts — finds THIS
    // store again instead of silently creating a new empty one.
    saveUsernameDirectory(cleanUsername, newStoreId);
    return { user: newUser, storeId: newStoreId };
  }

  public getAllStoresSummary(): { id: string; storeName: string; ownerName: string; isDemo: boolean; productCount: number; salesCount: number }[] {
    return Object.keys(this.storeMap).map(sid => {
      const st = this.storeMap[sid];
      return {
        id: sid,
        storeName: st.settings?.storeName || 'Kirana Store',
        ownerName: st.settings?.ownerName || 'Owner',
        isDemo: sid === 'store-demo',
        productCount: st.products ? st.products.length : 0,
        salesCount: st.sales ? st.sales.length : 0
      };
    });
  }

  public getUserByUsername(username: string): { user: User; storeId: string } | null {
    const clean = username.trim().toLowerCase();

    // Check system admin
    if (clean === 'admin') {
      const demoStore = this.getStore('store-demo');
      const adminUser = demoStore.users.find(u => u.username === 'admin');
      if (adminUser) return { user: adminUser, storeId: 'store-demo' };
    }

    for (const sid of Object.keys(this.storeMap)) {
      const u = this.storeMap[sid].users.find(usr => usr.username.toLowerCase() === clean);
      if (u) return { user: u, storeId: sid };
    }

    return null;
  }

  // --- SETTINGS ---
  public getSettings(storeId: string = 'store-demo'): StoreSettings {
    return this.getStore(storeId).settings;
  }

  public updateSettings(storeId: string = 'store-demo', newSettings: Partial<StoreSettings>): StoreSettings {
    const store = this.getStore(storeId);
    store.settings = { ...store.settings, ...newSettings };
    this.saveData(storeId);
    return store.settings;
  }

  // --- USERS & AUTH ---
  public getUsers(storeId: string = 'store-demo'): User[] {
    // This powers /api/auth/me and general user lists — never the System
    // Admin credentials registry (that reads Firestore directly client-side
    // and is meant to show the plaintext password). Strip both fields here.
    return this.getStore(storeId).users.map(u => {
      const { password: _pw, passwordHash: _ph, ...safeUser } = u;
      return safeUser as User;
    });
  }

  public updateUserPermissions(storeId: string = 'store-demo', userId: string, permissions: User['permissions']): User | null {
    const store = this.getStore(storeId);
    const user = store.users.find(u => u.id === userId);
    if (!user) return null;
    user.permissions = { ...permissions };
    this.saveData(storeId);
    return user;
  }

  // --- CUSTOMERS & UDHAAR LEDGER ---
  public getCustomers(storeId: string = 'store-demo', search?: string, area?: string): Customer[] {
    const store = this.getStore(storeId);
    let list = [...store.customers];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.area.toLowerCase().includes(q)
      );
    }
    if (area && area !== 'ALL') {
      list = list.filter(c => c.area === area);
    }
    return list.sort((a, b) => b.currentBalance - a.currentBalance);
  }

  public getCustomerById(storeId: string = 'store-demo', id: string): Customer | undefined {
    return this.getStore(storeId).customers.find(c => c.id === id);
  }

  public createCustomer(storeId: string = 'store-demo', cust: Omit<Customer, 'id' | 'currentBalance' | 'createdAt' | 'updatedAt'>): Customer {
    const store = this.getStore(storeId);
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      currentBalance: cust.openingBalance || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.customers.push(newCust);

    if (newCust.openingBalance !== 0) {
      store.customerTransactions.push({
        id: `tx-opn-${Date.now()}`,
        customerId: newCust.id,
        type: 'OPENING_BALANCE',
        amount: newCust.openingBalance,
        balanceAfter: newCust.openingBalance,
        notes: 'Initial opening balance',
        createdBy: 'Shop Owner',
        createdAt: new Date().toISOString()
      });
    }

    this.saveData(storeId);
    return newCust;
  }

  public updateCustomer(storeId: string = 'store-demo', id: string, updates: Partial<Customer>): Customer | null {
    const store = this.getStore(storeId);
    const cust = store.customers.find(c => c.id === id);
    if (!cust) return null;
    Object.assign(cust, updates, { updatedAt: new Date().toISOString() });
    this.saveData(storeId);
    return cust;
  }

  public deleteCustomer(storeId: string = 'store-demo', id: string): boolean {
    const store = this.getStore(storeId);
    const idx = store.customers.findIndex(c => c.id === id);
    if (idx === -1) return false;
    store.customers.splice(idx, 1);
    store.customerTransactions = store.customerTransactions.filter(t => t.customerId !== id);
    this.saveData(storeId);
    return true;
  }

  public getCustomerLedger(storeId: string = 'store-demo', customerId: string): CustomerTransaction[] {
    const store = this.getStore(storeId);
    return store.customerTransactions
      .filter(t => t.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public recordCustomerPayment(
    storeId: string = 'store-demo',
    customerId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    notes?: string,
    recordedBy: string = 'Shop Owner'
  ): CustomerTransaction | null {
    const store = this.getStore(storeId);
    const cust = store.customers.find(c => c.id === customerId);
    if (!cust) return null;

    const newBalance = cust.currentBalance - amount;
    cust.currentBalance = newBalance;
    cust.updatedAt = new Date().toISOString();

    const tx: CustomerTransaction = {
      id: `tx-pay-${Date.now()}`,
      customerId,
      type: 'PAYMENT_RECEIVED',
      amount,
      balanceAfter: newBalance,
      paymentMethod,
      referenceId: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: notes || `Payment received via ${paymentMethod}`,
      createdBy: recordedBy,
      createdAt: new Date().toISOString()
    };

    store.customerTransactions.push(tx);
    this.saveData(storeId);
    return tx;
  }

  // --- PRODUCTS & INVENTORY ---
  public getProducts(storeId: string = 'store-demo', search?: string, category?: string, stockFilter?: string): Product[] {
    const store = this.getStore(storeId);
    let list = [...store.products];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    if (category && category !== 'ALL') {
      list = list.filter(p => p.category === category);
    }
    if (stockFilter === 'LOW_STOCK') {
      list = list.filter(p => p.currentStock <= p.minStock && p.currentStock > 0);
    } else if (stockFilter === 'OUT_OF_STOCK') {
      list = list.filter(p => p.currentStock === 0);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  public getProductByBarcode(storeId: string = 'store-demo', code: string): Product | undefined {
    return this.getStore(storeId).products.find(p => p.barcode === code);
  }

  public getProductById(storeId: string = 'store-demo', id: string): Product | undefined {
    return this.getStore(storeId).products.find(p => p.id === id);
  }

  public createProduct(storeId: string = 'store-demo', prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const store = this.getStore(storeId);
    const newProd: Product = {
      ...prod,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.products.push(newProd);

    if (newProd.currentStock > 0) {
      store.inventoryTransactions.push({
        id: `inv-${Date.now()}`,
        productId: newProd.id,
        productName: newProd.name,
        type: 'INITIAL_STOCK',
        quantityChange: newProd.currentStock,
        stockAfter: newProd.currentStock,
        notes: 'Initial product creation stock',
        createdBy: 'Shop Owner',
        createdAt: new Date().toISOString()
      });
    }

    this.saveData(storeId);
    return newProd;
  }

  public updateProduct(storeId: string = 'store-demo', id: string, updates: Partial<Product>): Product | null {
    const store = this.getStore(storeId);
    const p = store.products.find(prod => prod.id === id);
    if (!p) return null;
    Object.assign(p, updates, { updatedAt: new Date().toISOString() });
    this.saveData(storeId);
    return p;
  }

  public deleteProduct(storeId: string = 'store-demo', id: string): boolean {
    const store = this.getStore(storeId);
    const targetId = String(id).trim();
    const idx = store.products.findIndex(p => String(p.id).trim() === targetId);
    if (idx === -1) return false;
    store.products.splice(idx, 1);
    this.saveData(storeId);
    return true;
  }

  public addStockToProduct(storeId: string = 'store-demo', id: string, qtyToAdd: number, notes?: string): Product | null {
    const store = this.getStore(storeId);
    const p = store.products.find(prod => prod.id === id);
    if (!p) return null;

    const newStock = p.currentStock + qtyToAdd;
    p.currentStock = newStock;
    p.updatedAt = new Date().toISOString();

    store.inventoryTransactions.push({
      id: `inv-${Date.now()}`,
      productId: p.id,
      productName: p.name,
      type: 'MANUAL_ADD',
      quantityChange: qtyToAdd,
      stockAfter: newStock,
      notes: notes || `Restocked ${qtyToAdd} ${p.unit}`,
      createdBy: 'Shop Owner',
      createdAt: new Date().toISOString()
    });

    this.saveData(storeId);
    return p;
  }

  public bulkImportProducts(storeId: string = 'store-demo', products: Partial<Product>[]): { addedCount: number; errors: string[] } {
    const store = this.getStore(storeId);
    let count = 0;
    const errors: string[] = [];

    products.forEach((p, index) => {
      if (!p.name || !p.sellingPrice) {
        errors.push(`Item ${index + 1}: Name and selling price are required.`);
        return;
      }
      const newP: Product = {
        id: `p-imp-${Date.now()}-${index}`,
        name: p.name,
        sku: p.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: p.barcode || `${8900000000000 + count}`,
        category: p.category || 'Other',
        brand: p.brand || 'General',
        unit: p.unit || 'pcs',
        purchasePrice: Number(p.purchasePrice || p.sellingPrice * 0.85),
        sellingPrice: Number(p.sellingPrice),
        mrp: Number(p.mrp || p.sellingPrice),
        currentStock: Number(p.currentStock || 0),
        minStock: Number(p.minStock || 5),
        gstPercent: Number(p.gstPercent || 0),
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.products.push(newP);
      count++;
    });

    this.saveData(storeId);
    return { addedCount: count, errors };
  }

  // --- SALES (POS) ---
  public getSales(storeId: string = 'store-demo', search?: string): Sale[] {
    const store = this.getStore(storeId);
    let list = [...store.sales];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s =>
        s.saleNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createSale(storeId: string = 'store-demo', saleData: Omit<Sale, 'id' | 'saleNumber' | 'createdAt'>): Sale {
    const store = this.getStore(storeId);
    const saleNum = `SL-${Date.now().toString().slice(-6)}`;
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      saleNumber: saleNum,
      createdAt: new Date().toISOString()
    };

    store.sales.push(newSale);

    // Reduce product stock automatically
    const newLedgerEntries: InventoryTransaction[] = [];
    newSale.items.forEach(item => {
      const p = store.products.find(prod => prod.id === item.productId);
      if (p) {
        const newStock = Math.max(0, p.currentStock - item.quantity);
        p.currentStock = newStock;
        p.updatedAt = new Date().toISOString();

        const entry: InventoryTransaction = {
          id: `inv-sale-${Date.now()}`,
          productId: p.id,
          productName: p.name,
          type: 'STOCK_OUT_SALE',
          quantityChange: -item.quantity,
          stockAfter: newStock,
          referenceId: saleNum,
          createdBy: newSale.createdByName || 'Shop Owner',
          createdAt: new Date().toISOString()
        };
        store.inventoryTransactions.push(entry);
        newLedgerEntries.push(entry);
      }
    });

    // If sale is on Credit/Udhaar, add to customer balance and ledger
    if (newSale.paymentMethod === 'CREDIT' && newSale.customerId) {
      const cust = store.customers.find(c => c.id === newSale.customerId);
      if (cust) {
        const newBal = cust.currentBalance + newSale.grandTotal;
        cust.currentBalance = newBal;
        cust.updatedAt = new Date().toISOString();

        store.customerTransactions.push({
          id: `tx-sale-${Date.now()}`,
          customerId: cust.id,
          type: 'CREDIT_SALE',
          amount: newSale.grandTotal,
          balanceAfter: newBal,
          referenceId: saleNum,
          notes: `Express Sale #${saleNum} on Udhaar`,
          createdBy: newSale.createdByName || 'Shop Owner',
          createdAt: new Date().toISOString()
        });
      }
    }

    this.saveData(storeId);
    // Fire-and-forget dual-write — see mysql.ts's comment for why this never
    // blocks or can fail the actual sale, which has already succeeded above.
    upsertSaleToMysql(storeId, newSale);
    insertStockLedgerEntriesToMysql(storeId, newLedgerEntries);
    return newSale;
  }

  public updateSale(storeId: string = 'store-demo', id: string, updates: Partial<Sale>): Sale | null {
    const store = this.getStore(storeId);
    const sale = store.sales.find(s => s.id === id);
    if (!sale) return null;
    Object.assign(sale, updates);
    this.saveData(storeId);
    upsertSaleToMysql(storeId, sale);
    return sale;
  }

  public deleteSale(storeId: string = 'store-demo', id: string): boolean {
    const store = this.getStore(storeId);
    const idx = store.sales.findIndex(s => s.id === id);
    if (idx === -1) return false;
    store.sales.splice(idx, 1);
    this.saveData(storeId);
    return true;
  }

  /**
   * Voids a sale — the GST-correct way to fix a wrong entry. The sale record
   * is KEPT (never deleted, so it stays in the audit trail and can never
   * silently vanish from tax records) but marked CANCELLED, and its effects
   * are reversed: stock is restored, and Udhaar balance is credited back if
   * the sale was on Credit. getDailyStats() excludes CANCELLED sales from
   * revenue, so cancelling here actually corrects the numbers, not just the
   * label.
   */
  public voidSale(storeId: string = 'store-demo', id: string, reason: string): Sale | null {
    const store = this.getStore(storeId);
    const sale = store.sales.find(s => s.id === id);
    if (!sale || sale.status === 'CANCELLED') return sale || null;

    const voidLedgerEntries: InventoryTransaction[] = [];
    sale.items.forEach(item => {
      const p = store.products.find(prod => prod.id === item.productId);
      if (p) {
        const newStock = p.currentStock + item.quantity;
        p.currentStock = newStock;
        p.updatedAt = new Date().toISOString();

        const entry: InventoryTransaction = {
          id: `inv-void-${Date.now()}`,
          productId: p.id,
          productName: p.name,
          type: 'SALE_CANCELLED',
          quantityChange: item.quantity,
          stockAfter: newStock,
          referenceId: sale.saleNumber,
          createdBy: 'Shop Owner',
          createdAt: new Date().toISOString()
        };
        store.inventoryTransactions.push(entry);
        voidLedgerEntries.push(entry);
      }
    });

    if (sale.paymentMethod === 'CREDIT' && sale.customerId) {
      const cust = store.customers.find(c => c.id === sale.customerId);
      if (cust) {
        const newBal = Math.max(0, cust.currentBalance - sale.grandTotal);
        cust.currentBalance = newBal;
        cust.updatedAt = new Date().toISOString();

        store.customerTransactions.push({
          id: `tx-void-${Date.now()}`,
          customerId: cust.id,
          type: 'RETURN_CREDIT',
          amount: sale.grandTotal,
          balanceAfter: newBal,
          referenceId: sale.saleNumber,
          notes: `Sale #${sale.saleNumber} voided: ${reason}`,
          createdBy: 'Shop Owner',
          createdAt: new Date().toISOString()
        });
      }
    }

    sale.status = 'CANCELLED';
    sale.cancelReason = reason;
    sale.cancelledAt = new Date().toISOString();

    this.saveData(storeId);
    upsertSaleToMysql(storeId, sale);
    insertStockLedgerEntriesToMysql(storeId, voidLedgerEntries);
    return sale;
  }

  // --- ORDERS ---
  public getOrders(storeId: string = 'store-demo', search?: string, status?: string): Order[] {
    const store = this.getStore(storeId);
    let list = [...store.orders];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerMobile.includes(q)
      );
    }
    if (status && status !== 'ALL') {
      list = list.filter(o => o.orderStatus === status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createOrder(storeId: string = 'store-demo', orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const store = this.getStore(storeId);
    const ordNum = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: ordNum,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.orders.push(newOrder);

    // New order notification
    store.notifications.push({
      id: `notif-${Date.now()}`,
      type: 'NEW_ORDER',
      title: 'New Customer Order Received',
      message: `${newOrder.customerName} placed order #${ordNum} worth ${formatMoney(newOrder.total, store.settings.currencySymbol, store.settings.currencyCode)}.`,
      referenceId: newOrder.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    this.saveData(storeId);
    return newOrder;
  }

  public updateOrderStatus(storeId: string = 'store-demo', id: string, orderStatus: string, paymentStatus?: string): Order | null {
    const store = this.getStore(storeId);
    const order = store.orders.find(o => o.id === id);
    if (!order) return null;

    order.orderStatus = orderStatus as any;
    if (paymentStatus) order.paymentStatus = paymentStatus as any;
    order.updatedAt = new Date().toISOString();

    this.saveData(storeId);
    return order;
  }

  public updateOrder(storeId: string = 'store-demo', id: string, updates: Partial<Order>): Order | null {
    const store = this.getStore(storeId);
    const order = store.orders.find(o => o.id === id);
    if (!order) return null;
    Object.assign(order, updates, { updatedAt: new Date().toISOString() });
    this.saveData(storeId);
    return order;
  }

  public deleteOrder(storeId: string = 'store-demo', id: string): boolean {
    const store = this.getStore(storeId);
    const idx = store.orders.findIndex(o => o.id === id);
    if (idx === -1) return false;
    store.orders.splice(idx, 1);
    this.saveData(storeId);
    return true;
  }

  // --- EXPENSES ---
  public getExpenses(storeId: string = 'store-demo'): Expense[] {
    return [...this.getStore(storeId).expenses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createExpense(storeId: string = 'store-demo', expData: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const store = this.getStore(storeId);
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    store.expenses.push(newExp);
    this.saveData(storeId);
    return newExp;
  }

  public updateExpense(storeId: string = 'store-demo', id: string, updates: Partial<Expense>): Expense | null {
    const store = this.getStore(storeId);
    const exp = store.expenses.find(e => e.id === id);
    if (!exp) return null;
    Object.assign(exp, updates);
    this.saveData(storeId);
    return exp;
  }

  public deleteExpense(storeId: string = 'store-demo', id: string): boolean {
    const store = this.getStore(storeId);
    const idx = store.expenses.findIndex(e => e.id === id);
    if (idx === -1) return false;
    store.expenses.splice(idx, 1);
    this.saveData(storeId);
    return true;
  }

  // --- SUPPLIERS & PURCHASES ---
  public getSuppliers(storeId: string = 'store-demo'): Supplier[] {
    return [...this.getStore(storeId).suppliers];
  }

  public createSupplier(storeId: string = 'store-demo', supData: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
    const store = this.getStore(storeId);
    const sup: Supplier = {
      ...supData,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    store.suppliers.push(sup);
    this.saveData(storeId);
    return sup;
  }

  public updateSupplier(storeId: string = 'store-demo', id: string, updates: Partial<Supplier>): Supplier | null {
    const store = this.getStore(storeId);
    const sup = store.suppliers.find(s => s.id === id);
    if (!sup) return null;
    Object.assign(sup, updates);
    this.saveData(storeId);
    return sup;
  }

  public deleteSupplier(storeId: string = 'store-demo', id: string): boolean {
    const store = this.getStore(storeId);
    const idx = store.suppliers.findIndex(s => s.id === id);
    if (idx === -1) return false;
    store.suppliers.splice(idx, 1);
    this.saveData(storeId);
    return true;
  }

  public updatePurchase(storeId: string = 'store-demo', id: string, updates: Partial<Purchase>): Purchase | null {
    const store = this.getStore(storeId);
    const pur = store.purchases.find(p => p.id === id);
    if (!pur) return null;
    Object.assign(pur, updates);
    this.saveData(storeId);
    upsertPurchaseToMysql(storeId, pur);
    return pur;
  }

  public deletePurchase(storeId: string = 'store-demo', id: string): boolean {
    const store = this.getStore(storeId);
    const targetId = String(id).trim();
    const idx = store.purchases.findIndex(p => String(p.id).trim() === targetId);
    if (idx === -1) return false;
    store.purchases.splice(idx, 1);
    this.saveData(storeId);
    return true;
  }

  public getPurchases(storeId: string = 'store-demo'): Purchase[] {
    return [...this.getStore(storeId).purchases].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createPurchase(storeId: string = 'store-demo', purData: Omit<Purchase, 'id' | 'purchaseNumber' | 'createdAt'>): Purchase {
    const store = this.getStore(storeId);
    const purNum = `PUR-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newPur: Purchase = {
      ...purData,
      id: `pur-${Date.now()}`,
      purchaseNumber: purNum,
      createdAt: now
    };

    store.purchases.push(newPur);

    // Increase product stock & update pricing
    const purLedgerEntries: InventoryTransaction[] = [];
    newPur.items.forEach((item, idx) => {
      const p = store.products.find(prod => prod.id === item.productId);
      if (p) {
        const newStock = p.currentStock + Number(item.quantity);
        p.currentStock = newStock;
        p.purchasePrice = Number(item.purchasePrice);
        if (item.sellingPrice && item.sellingPrice > 0) p.sellingPrice = Number(item.sellingPrice);
        if (item.mrp && item.mrp > 0) p.mrp = Number(item.mrp);
        if (item.gstPercent !== undefined) p.gstPercent = Number(item.gstPercent);
        p.updatedAt = now;

        const entry: InventoryTransaction = {
          id: `inv-pur-${Date.now()}-${idx}`,
          productId: p.id,
          productName: p.name,
          type: 'STOCK_IN_PURCHASE',
          quantityChange: Number(item.quantity),
          stockAfter: newStock,
          referenceId: purNum,
          createdBy: 'Shop Owner',
          createdAt: now
        };
        store.inventoryTransactions.push(entry);
        purLedgerEntries.push(entry);
      }
    });

    // Update supplier outstanding balance if unpaid portion exists
    const totalVal = newPur.grandTotal || newPur.totalAmount || 0;
    const paidVal = newPur.paidAmount || 0;
    const unpaidBal = totalVal - paidVal;
    if (unpaidBal > 0 && newPur.supplierId) {
      const supplier = store.suppliers.find(s => s.id === newPur.supplierId);
      if (supplier) {
        supplier.outstandingBalance = (supplier.outstandingBalance || 0) + unpaidBal;
      }
    }

    this.saveData(storeId);
    upsertPurchaseToMysql(storeId, newPur);
    insertStockLedgerEntriesToMysql(storeId, purLedgerEntries);
    return newPur;
  }

  public processScannedPurchaseBill(
    storeId: string = 'store-demo',
    payload: {
      supplierName: string;
      supplierMobile?: string;
      invoiceNumber?: string;
      invoiceDate?: string;
      paidAmount: number;
      paymentMethod?: PaymentMethod;
      notes?: string;
      items: Array<{
        productId?: string;
        name: string;
        category?: string;
        brand?: string;
        barcode?: string;
        unit?: ProductUnit;
        quantity: number;
        purchasePrice: number;
        mrp?: number;
        sellingPrice?: number;
      }>;
    }
  ) {
    const store = this.getStore(storeId);

    // 1. Find or create supplier
    const supNameClean = (payload.supplierName || 'Wholesale Supplier').trim();
    let supplier = store.suppliers.find(
      s => s.name.toLowerCase().trim() === supNameClean.toLowerCase() ||
           (payload.supplierMobile && s.mobile === payload.supplierMobile)
    );

    let isNewSupplierCreated = false;
    if (!supplier) {
      supplier = {
        id: `sup-${Date.now()}`,
        name: supNameClean,
        contactPerson: supNameClean,
        mobile: payload.supplierMobile || '9876543210',
        companyName: supNameClean,
        category: 'Scanned Bill Supplier',
        address: 'Local Wholesale Market',
        city: 'Local Area',
        outstandingBalance: 0,
        createdAt: new Date().toISOString()
      };
      store.suppliers.push(supplier);
      isNewSupplierCreated = true;
    }

    // 2. Process Items (stock update or new product creation)
    let newProductsCount = 0;
    let updatedProductsCount = 0;
    const purchaseItems: PurchaseItem[] = [];
    const now = new Date().toISOString();
    const scanLedgerEntries: InventoryTransaction[] = [];

    payload.items.forEach((item, idx) => {
      let product: Product | undefined;

      if (item.productId) {
        product = store.products.find(p => p.id === item.productId);
      }
      if (!product && item.barcode) {
        product = store.products.find(p => p.barcode === item.barcode);
      }
      if (!product) {
        product = store.products.find(
          p => p.name.toLowerCase().trim() === item.name.toLowerCase().trim()
        );
      }

      if (product) {
        // Update existing product
        const newStock = product.currentStock + Number(item.quantity);
        product.currentStock = newStock;
        product.purchasePrice = Number(item.purchasePrice);
        if (item.mrp && item.mrp > 0) product.mrp = Number(item.mrp);
        if (item.sellingPrice && item.sellingPrice > 0) product.sellingPrice = Number(item.sellingPrice);
        product.updatedAt = now;

        {
          const entry: InventoryTransaction = {
            id: `inv-pur-${Date.now()}-${idx}`,
            productId: product.id,
            productName: product.name,
            type: 'STOCK_IN_PURCHASE',
            quantityChange: Number(item.quantity),
            stockAfter: newStock,
            referenceId: payload.invoiceNumber || 'AI-SCAN',
            createdBy: 'Shop Owner',
            createdAt: now
          };
          store.inventoryTransactions.push(entry);
          scanLedgerEntries.push(entry);
        }

        updatedProductsCount++;
        purchaseItems.push({
          productId: product.id,
          productName: product.name,
          quantity: Number(item.quantity),
          purchasePrice: Number(item.purchasePrice),
          totalPrice: Number(item.quantity) * Number(item.purchasePrice)
        });
      } else {
        // Create new product
        const newProdId = `prod-${Date.now()}-${idx}`;
        const newCost = Number(item.purchasePrice) || 0;
        const newSelling = Number(item.sellingPrice) || Math.round(newCost * 1.15);
        const newMrp = Number(item.mrp) || Math.round(newCost * 1.25);

        const newProd: Product = {
          id: newProdId,
          name: item.name,
          sku: `SKU-${Date.now().toString().slice(-6)}${idx}`,
          category: item.category || 'General Kirana',
          brand: item.brand || 'Generic',
          barcode: item.barcode || `BC${Date.now().toString().slice(-6)}${idx}`,
          unit: item.unit || 'pkt',
          purchasePrice: newCost,
          sellingPrice: newSelling,
          mrp: newMrp,
          currentStock: Number(item.quantity),
          minStock: 5,
          gstPercent: 0,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now
        };

        store.products.push(newProd);

        {
          const entry: InventoryTransaction = {
            id: `inv-init-${Date.now()}-${idx}`,
            productId: newProd.id,
            productName: newProd.name,
            type: 'STOCK_IN_PURCHASE',
            quantityChange: Number(item.quantity),
            stockAfter: Number(item.quantity),
            referenceId: payload.invoiceNumber || 'AI-SCAN',
            createdBy: 'Shop Owner',
            createdAt: now
          };
          store.inventoryTransactions.push(entry);
          scanLedgerEntries.push(entry);
        }

        newProductsCount++;
        purchaseItems.push({
          productId: newProd.id,
          productName: newProd.name,
          quantity: Number(item.quantity),
          purchasePrice: newCost,
          totalPrice: Number(item.quantity) * newCost
        });
      }
    });

    const totalAmount = purchaseItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const paidAmt = Number(payload.paidAmount) || 0;
    const paymentStatus: PaymentStatus = paidAmt >= totalAmount ? 'PAID' : paidAmt > 0 ? 'PARTIAL' : 'PENDING';

    const purNum = `PUR-${Date.now().toString().slice(-6)}`;
    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNumber: purNum,
      supplierId: supplier.id,
      supplierName: supplier.name,
      invoiceNumber: payload.invoiceNumber || `BILL-${Date.now().toString().slice(-6)}`,
      items: purchaseItems,
      totalAmount,
      paidAmount: paidAmt,
      paymentStatus,
      paymentMethod: payload.paymentMethod || 'CASH',
      notes: payload.notes || 'Scanned Bill via AI Camera (Multi-language OCR)',
      createdAt: payload.invoiceDate || now
    };

    store.purchases.push(newPurchase);

    // If unpaid amount, update supplier outstanding balance
    const unpaidBal = totalAmount - paidAmt;
    if (unpaidBal > 0) {
      supplier.outstandingBalance = (supplier.outstandingBalance || 0) + unpaidBal;
    }

    this.saveData(storeId);
    upsertPurchaseToMysql(storeId, newPurchase);
    insertStockLedgerEntriesToMysql(storeId, scanLedgerEntries);

    return {
      success: true,
      purchase: newPurchase,
      supplier,
      isNewSupplierCreated,
      newProductsCount,
      updatedProductsCount
    };
  }

  // --- INVENTORY LOGS ---
  public getInventoryTransactions(storeId: string = 'store-demo'): InventoryTransaction[] {
    return [...this.getStore(storeId).inventoryTransactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * One-time migration of an existing store's full sales/purchases/stock
   * ledger history into MySQL — Phase 3 of the plan, run per account with
   * explicit verification, not an automatic bulk operation. Returns both
   * what was attempted (from the source, the current in-memory store — which
   * on server startup is hydrated from Firestore, so this covers real
   * historical data, not just whatever happened after this server booted)
   * and what MySQL actually reports afterward, so a mismatch is visible
   * immediately rather than assumed away.
   */
  public async migrateStoreToMysql(storeId: string) {
    const store = this.getStore(storeId);
    const attempted = await migrateStoreHistoryToMysql(
      storeId,
      store.sales,
      store.purchases,
      store.inventoryTransactions
    );
    const actual = await getMysqlRowCounts(storeId);
    return {
      storeId,
      sourceCounts: {
        sales: store.sales.length,
        purchases: store.purchases.length,
        stockLedger: store.inventoryTransactions.length
      },
      attempted,
      mysqlCountsAfter: actual
    };
  }

  // --- NOTIFICATIONS ---
  public getNotifications(storeId: string = 'store-demo'): NotificationAlert[] {
    return [...this.getStore(storeId).notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationAsRead(storeId: string = 'store-demo', id: string): boolean {
    const store = this.getStore(storeId);
    const notif = store.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.isRead = true;
    this.saveData(storeId);
    return true;
  }

  // --- DASHBOARD STATS ---
  public getDailyStats(storeId: string = 'store-demo'): DailyStats {
    const store = this.getStore(storeId);
    const todayStr = new Date().toISOString().split('T')[0];

    let todaySalesList = store.sales.filter(s => s.createdAt.startsWith(todayStr));
    if (todaySalesList.length === 0 && store.sales.length > 0) {
      todaySalesList = store.sales;
    }
    // Voided sales stay in the record for the audit trail but must never count toward revenue.
    todaySalesList = todaySalesList.filter(s => s.status !== 'CANCELLED');
    const todayOrdersList = store.orders.filter(o => o.createdAt.startsWith(todayStr) && o.orderStatus !== 'CANCELLED');

    let totalSalesVal = 0;
    let cashSales = 0;
    let upiSales = 0;
    let creditSales = 0;
    let costOfGoodsSold = 0;

    todaySalesList.forEach(s => {
      totalSalesVal += s.grandTotal;
      if (s.paymentMethod === 'CASH') cashSales += s.grandTotal;
      else if (s.paymentMethod === 'UPI') upiSales += s.grandTotal;
      else if (s.paymentMethod === 'CREDIT') creditSales += s.grandTotal;

      s.items.forEach(item => {
        const prod = store.products.find(p => p.id === item.productId);
        const purchaseCost = prod ? prod.purchasePrice : item.unitPrice * 0.8;
        costOfGoodsSold += purchaseCost * item.quantity;
      });
    });

    todayOrdersList.forEach(o => {
      totalSalesVal += o.total;
      if (o.paymentMethod === 'CASH' && o.paymentStatus === 'PAID') cashSales += o.total;
      else if (o.paymentMethod === 'UPI' && o.paymentStatus === 'PAID') upiSales += o.total;
      else if (o.paymentStatus === 'PENDING') creditSales += o.total;

      o.items.forEach(item => {
        const prod = store.products.find(p => p.id === item.productId);
        const purchaseCost = prod ? prod.purchasePrice : item.price * 0.8;
        costOfGoodsSold += purchaseCost * item.quantity;
      });
    });

    const todayExpensesList = store.expenses.filter(e => e.date === todayStr);
    const todayExpenses = todayExpensesList.reduce((sum, e) => sum + e.amount, 0);

    const grossProfit = Math.max(0, totalSalesVal - costOfGoodsSold);
    const estimatedProfitToday = Math.max(0, grossProfit - todayExpenses);

    const totalPendingUdhaar = store.customers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
    const overdueUdhaar = store.customers
      .filter(c => c.currentBalance > 1000)
      .reduce((sum, c) => sum + c.currentBalance, 0);

    const todayCollection = store.customerTransactions
      .filter(t => t.type === 'PAYMENT_RECEIVED' && t.createdAt.startsWith(todayStr))
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingOrdersCount = store.orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED').length;
    const newOrdersCount = store.orders.filter(o => o.orderStatus === 'NEW').length;
    const preparingOrdersCount = store.orders.filter(o => o.orderStatus === 'PREPARING').length;
    const outForDeliveryCount = store.orders.filter(o => o.orderStatus === 'OUT_FOR_DELIVERY').length;
    const deliveredOrdersToday = store.orders.filter(o => o.orderStatus === 'DELIVERED' && o.updatedAt.startsWith(todayStr)).length;

    const lowStockCount = store.products.filter(p => p.currentStock <= p.minStock && p.currentStock > 0).length;
    const outOfStockCount = store.products.filter(p => p.currentStock === 0).length;

    return {
      todaySalesTotal: totalSalesVal,
      cashSales,
      upiSales,
      creditSales,
      todayExpenses,
      estimatedProfitToday,
      totalPendingUdhaar,
      dueTodayUdhaar: Math.round(totalPendingUdhaar * 0.15),
      overdueUdhaar,
      todayCollection,
      pendingOrdersCount,
      newOrdersCount,
      preparingOrdersCount,
      outForDeliveryCount,
      deliveredOrdersToday,
      lowStockCount,
      outOfStockCount
    };
  }

  // Backup & Restore
  public exportDatabaseJSON(storeId: string = 'store-demo'): string {
    return JSON.stringify(this.getStore(storeId), null, 2);
  }

  public importDatabaseJSON(storeId: string = 'store-demo', jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.customers && parsed.products && parsed.settings) {
        this.storeMap[storeId] = parsed;
        this.saveData(storeId);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const db = new Database();
