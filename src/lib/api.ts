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
  UserRole,
  TradingSector,
  AdminAccountItem
} from '../types';
import { clientStore } from './clientStore';

let currentUserRole: UserRole = 'owner';
let currentStoreId: string = 'store-demo';

export function setUserRoleHeader(role: UserRole) {
  currentUserRole = role;
}

export function setStoreIdHeader(storeId: string) {
  currentStoreId = storeId;
}

export function getCurrentStoreId(): string {
  return currentStoreId;
}

async function handleClientFallback<T>(url: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const body = options?.body ? JSON.parse(options.body as string) : {};
  const urlObj = new URL(url, 'http://localhost');
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // 1. Stats & Settings
  if (pathname === '/api/dashboard/stats') {
    return clientStore.getDailyStats(currentStoreId) as unknown as T;
  }
  if (pathname === '/api/settings') {
    if (method === 'PUT') return clientStore.updateSettings(currentStoreId, body) as unknown as T;
    return clientStore.getSettings(currentStoreId) as unknown as T;
  }

  // 2. Auth
  if (pathname === '/api/auth/login') {
    return clientStore.login(currentStoreId, body.username, body.password, body.sector) as unknown as T;
  }
  if (pathname === '/api/auth/register') {
    return clientStore.register(body) as unknown as T;
  }
  if (pathname === '/api/auth/me') {
    return clientStore.getUsers(currentStoreId) as unknown as T;
  }
  if (pathname.startsWith('/api/auth/permissions/')) {
    const userId = pathname.split('/').pop()!;
    return clientStore.updateUserPermissions(currentStoreId, userId, body.permissions) as unknown as T;
  }
  if (pathname === '/api/admin/stores') {
    return clientStore.getAdminStores() as unknown as T;
  }
  if (pathname === '/api/admin/accounts' && method === 'GET') {
    return clientStore.getAdminAccounts() as unknown as T;
  }
  if (pathname === '/api/admin/accounts/update' && method === 'POST') {
    return clientStore.updateAdminAccount(body) as unknown as T;
  }
  if (pathname === '/api/admin/accounts/delete' && method === 'POST') {
    return clientStore.deleteAdminAccount(body.storeId, body.userId) as unknown as T;
  }
  if (pathname === '/api/admin/accounts/create' && method === 'POST') {
    return clientStore.register(body) as unknown as T;
  }

  // 3. Customers
  if (pathname === '/api/customers' && method === 'GET') {
    return clientStore.getCustomers(currentStoreId, searchParams.get('search') || undefined, searchParams.get('area') || undefined) as unknown as T;
  }
  if (pathname === '/api/customers' && method === 'POST') {
    return clientStore.createCustomer(currentStoreId, body) as unknown as T;
  }
  if (pathname.startsWith('/api/customers/') && pathname.endsWith('/payments') && method === 'POST') {
    const id = pathname.split('/')[3];
    return clientStore.recordCustomerPayment(currentStoreId, id, body.amount, body.paymentMethod, body.notes, body.recordedBy) as unknown as T;
  }
  if (pathname.startsWith('/api/customers/') && method === 'GET') {
    const id = pathname.split('/')[3];
    return clientStore.getCustomerById(currentStoreId, id) as unknown as T;
  }
  if (pathname.startsWith('/api/customers/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    return clientStore.updateCustomer(currentStoreId, id, body) as unknown as T;
  }
  if (pathname.startsWith('/api/customers/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    return clientStore.deleteCustomer(currentStoreId, id) as unknown as T;
  }

  // 4. Products
  if (pathname === '/api/products/bulk-import' && method === 'POST') {
    return clientStore.bulkImportProducts(currentStoreId, body.products) as unknown as T;
  }
  if (pathname.startsWith('/api/products/barcode/')) {
    const code = decodeURIComponent(pathname.split('/').pop()!);
    return clientStore.getProductByBarcode(currentStoreId, code) as unknown as T;
  }
  if (pathname.startsWith('/api/products/') && pathname.endsWith('/add-stock') && method === 'POST') {
    const id = pathname.split('/')[3];
    return clientStore.addStock(currentStoreId, id, body.qtyToAdd, body.notes) as unknown as T;
  }
  if (pathname === '/api/products' && method === 'GET') {
    return clientStore.getProducts(currentStoreId, searchParams.get('search') || undefined, searchParams.get('category') || undefined, searchParams.get('stockFilter') || undefined) as unknown as T;
  }
  if (pathname === '/api/products' && method === 'POST') {
    return clientStore.createProduct(currentStoreId, body) as unknown as T;
  }
  if (pathname.startsWith('/api/products/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    return clientStore.updateProduct(currentStoreId, id, body) as unknown as T;
  }
  if (pathname.startsWith('/api/products/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    return clientStore.deleteProduct(currentStoreId, id) as unknown as T;
  }

  // 5. Sales
  if (pathname === '/api/sales' && method === 'GET') {
    return clientStore.getSales(currentStoreId, searchParams.get('search') || undefined) as unknown as T;
  }
  if (pathname === '/api/sales' && method === 'POST') {
    return clientStore.createSale(currentStoreId, body) as unknown as T;
  }
  if (pathname.startsWith('/api/sales/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    return clientStore.updateSale(currentStoreId, id, body) as unknown as T;
  }
  if (pathname.startsWith('/api/sales/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    return clientStore.deleteSale(currentStoreId, id) as unknown as T;
  }

  // 6. Orders
  if (pathname === '/api/orders' && method === 'GET') {
    return clientStore.getOrders(currentStoreId, searchParams.get('search') || undefined, searchParams.get('status') || undefined) as unknown as T;
  }
  if (pathname === '/api/orders' && method === 'POST') {
    return clientStore.createOrder(currentStoreId, body) as unknown as T;
  }
  if (pathname.startsWith('/api/orders/') && pathname.endsWith('/status') && method === 'PUT') {
    const id = pathname.split('/')[3];
    return clientStore.updateOrderStatus(currentStoreId, id, body.orderStatus, body.paymentStatus) as unknown as T;
  }
  if (pathname.startsWith('/api/orders/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    return clientStore.updateOrder(currentStoreId, id, body) as unknown as T;
  }
  if (pathname.startsWith('/api/orders/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    return clientStore.deleteOrder(currentStoreId, id) as unknown as T;
  }

  // 7. Expenses
  if (pathname === '/api/expenses' && method === 'GET') {
    return clientStore.getExpenses(currentStoreId) as unknown as T;
  }
  if (pathname === '/api/expenses' && method === 'POST') {
    return clientStore.createExpense(currentStoreId, body) as unknown as T;
  }
  if (pathname.startsWith('/api/expenses/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    return clientStore.updateExpense(currentStoreId, id, body) as unknown as T;
  }
  if (pathname.startsWith('/api/expenses/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    return clientStore.deleteExpense(currentStoreId, id) as unknown as T;
  }
  if (pathname === '/api/ai/scan-expense-bill') {
    return clientStore.scanExpenseBill(body.imageBase64) as unknown as T;
  }

  // 8. Suppliers & Purchases
  if (pathname === '/api/suppliers' && method === 'GET') {
    return clientStore.getSuppliers(currentStoreId) as unknown as T;
  }
  if (pathname === '/api/suppliers' && method === 'POST') {
    return clientStore.createSupplier(currentStoreId, body) as unknown as T;
  }
  if (pathname.startsWith('/api/suppliers/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    return clientStore.updateSupplier(currentStoreId, id, body) as unknown as T;
  }
  if (pathname.startsWith('/api/suppliers/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    return clientStore.deleteSupplier(currentStoreId, id) as unknown as T;
  }

  if (pathname === '/api/purchases' && method === 'GET') {
    return clientStore.getPurchases(currentStoreId) as unknown as T;
  }
  if (pathname === '/api/purchases' && method === 'POST') {
    return clientStore.createPurchase(currentStoreId, body) as unknown as T;
  }
  if (pathname.startsWith('/api/purchases/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    return clientStore.updatePurchase(currentStoreId, id, body) as unknown as T;
  }
  if (pathname.startsWith('/api/purchases/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    return clientStore.deletePurchase(currentStoreId, id) as unknown as T;
  }
  if (pathname === '/api/ai/scan-bill') {
    return clientStore.scanPurchaseBill(body.imageBase64) as unknown as T;
  }
  if (pathname === '/api/purchases/process-scanned') {
    return clientStore.processScannedPurchaseBill(currentStoreId, body) as unknown as T;
  }

  // 9. Logs & Backup
  if (pathname === '/api/inventory/transactions') {
    return clientStore.getInventoryTransactions(currentStoreId) as unknown as T;
  }
  if (pathname === '/api/notifications' && method === 'GET') {
    return clientStore.getNotifications(currentStoreId) as unknown as T;
  }
  if (pathname.startsWith('/api/notifications/') && pathname.endsWith('/read')) {
    const id = pathname.split('/')[3];
    return clientStore.markNotificationRead(currentStoreId, id) as unknown as T;
  }
  if (pathname === '/api/backup/restore') {
    return clientStore.restoreBackup(currentStoreId, body.jsonContent) as unknown as T;
  }
  if (pathname === '/api/backup/reset-demo') {
    localStorage.removeItem(`trademate_store_${currentStoreId}`);
    localStorage.removeItem(`kiranamate_store_${currentStoreId}`);
    return { success: true, message: 'Demo data reset successfully!' } as unknown as T;
  }

  throw new Error(`Endpoint ${pathname} not found`);
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-role': currentUserRole,
    'x-store-id': currentStoreId,
    ...(options?.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';

    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }

    if (contentType.includes('application/json')) {
      const errData = await res.json().catch(() => null);
      if (errData && errData.error) {
        throw new Error(errData.error);
      }
    }

    // If response is not ok or not JSON (e.g., 404 HTML on Netlify static hosting)
    return await handleClientFallback<T>(url, options);
  } catch (err: any) {
    if (err && err.message && !err.message.includes('Failed to fetch')) {
      throw err;
    }
    // Network error or offline mode
    return await handleClientFallback<T>(url, options);
  }
}

export const api = {
  setUserRole: (role: UserRole) => setUserRoleHeader(role),
  setStoreId: (storeId: string) => setStoreIdHeader(storeId),

  // Stats & Settings
  getDailyStats: () => apiFetch<DailyStats>('/api/dashboard/stats'),
  getSettings: () => apiFetch<StoreSettings>('/api/settings'),
  updateSettings: (data: Partial<StoreSettings>) => apiFetch<StoreSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Auth & Multi-Tenancy
  login: (username: string, password?: string, sector?: TradingSector) =>
    apiFetch<{ success: boolean; user: User; storeId: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, sector })
    }),

  register: (data: { username: string; password?: string; shopName: string; ownerName: string; mobile: string; sector?: TradingSector }) =>
    apiFetch<{ success: boolean; user: User; storeId: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getUsers: () => apiFetch<{ users: User[] }>('/api/auth/me'),
  updateUserPermissions: (userId: string, permissions: User['permissions']) => apiFetch<{ success: boolean; user: User }>(`/api/auth/permissions/${userId}`, { method: 'PUT', body: JSON.stringify({ permissions }) }),
  getAdminStores: () => apiFetch<{ stores: { id: string; storeName: string; ownerName: string; isDemo: boolean; productCount: number; salesCount: number }[] }>('/api/admin/stores'),
  getAdminAccounts: () => apiFetch<{ accounts: AdminAccountItem[] }>('/api/admin/accounts'),
  updateAdminAccount: (data: { userId: string; storeId: string; name: string; username: string; password?: string; mobile: string; role: UserRole; storeName: string; storeSector?: TradingSector }) =>
    apiFetch<{ success: boolean; account: AdminAccountItem }>('/api/admin/accounts/update', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminAccount: (storeId: string, userId: string) =>
    apiFetch<{ success: boolean }>('/api/admin/accounts/delete', { method: 'POST', body: JSON.stringify({ storeId, userId }) }),
  createAdminAccount: (data: { username: string; password?: string; shopName: string; ownerName: string; mobile: string; sector?: TradingSector }) =>
    apiFetch<{ success: boolean; user: User; storeId: string }>('/api/admin/accounts/create', { method: 'POST', body: JSON.stringify(data) }),

  // Customers & Udhaar
  getCustomers: (search?: string, area?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (area) params.append('area', area);
    return apiFetch<Customer[]>(`/api/customers?${params.toString()}`);
  },
  getCustomerById: (id: string) => apiFetch<{ customer: Customer; ledger: CustomerTransaction[] }>(`/api/customers/${id}`),
  createCustomer: (data: Partial<Customer>) => apiFetch<Customer>('/api/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: Partial<Customer>) => apiFetch<Customer>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) => apiFetch<{ success: boolean }>(`/api/customers/${id}`, { method: 'DELETE' }),
  recordCustomerPayment: (id: string, amount: number, paymentMethod: string, notes?: string, recordedBy?: string) =>
    apiFetch<{ success: boolean; transaction: CustomerTransaction }>(`/api/customers/${id}/payments`, { method: 'POST', body: JSON.stringify({ amount, paymentMethod, notes, recordedBy }) }),

  // Products
  getProducts: (search?: string, category?: string, stockFilter?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (stockFilter) params.append('stockFilter', stockFilter);
    return apiFetch<Product[]>(`/api/products?${params.toString()}`);
  },
  getProductByBarcode: (code: string) => apiFetch<Product>(`/api/products/barcode/${encodeURIComponent(code)}`),
  createProduct: (data: Partial<Product>) => apiFetch<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Partial<Product>) => apiFetch<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => apiFetch<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),
  addStock: (id: string, qtyToAdd: number, notes?: string) => apiFetch<{ success: boolean; product: Product }>(`/api/products/${id}/add-stock`, { method: 'POST', body: JSON.stringify({ qtyToAdd, notes }) }),
  bulkImportProducts: (products: Partial<Product>[]) => apiFetch<{ addedCount: number; errors: string[] }>('/api/products/bulk-import', { method: 'POST', body: JSON.stringify({ products }) }),

  // Sales
  getSales: (search?: string) => apiFetch<Sale[]>(`/api/sales?search=${encodeURIComponent(search || '')}`),
  createSale: (data: Partial<Sale>) => apiFetch<Sale>('/api/sales', { method: 'POST', body: JSON.stringify(data) }),
  updateSale: (id: string, data: Partial<Sale>) => apiFetch<Sale>(`/api/sales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSale: (id: string) => apiFetch<{ success: boolean }>(`/api/sales/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return apiFetch<Order[]>(`/api/orders?${params.toString()}`);
  },
  createOrder: (data: Partial<Order>) => apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, orderStatus: string, paymentStatus?: string) => apiFetch<Order>(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ orderStatus, paymentStatus }) }),
  updateOrder: (id: string, data: Partial<Order>) => apiFetch<Order>(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrder: (id: string) => apiFetch<{ success: boolean }>(`/api/orders/${id}`, { method: 'DELETE' }),

  // Expenses
  getExpenses: () => apiFetch<Expense[]>('/api/expenses'),
  createExpense: (data: Partial<Expense>) => apiFetch<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id: string, data: Partial<Expense>) => apiFetch<Expense>(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id: string) => apiFetch<{ success: boolean }>(`/api/expenses/${id}`, { method: 'DELETE' }),
  scanExpenseBill: (imageBase64: string) => apiFetch<{ success: boolean; data: any }>('/api/ai/scan-expense-bill', { method: 'POST', body: JSON.stringify({ imageBase64 }) }),

  // Suppliers & Purchases
  getSuppliers: () => apiFetch<Supplier[]>('/api/suppliers'),
  createSupplier: (data: Partial<Supplier>) => apiFetch<Supplier>('/api/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id: string, data: Partial<Supplier>) => apiFetch<Supplier>(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id: string) => apiFetch<{ success: boolean }>(`/api/suppliers/${id}`, { method: 'DELETE' }),
  getPurchases: () => apiFetch<Purchase[]>('/api/purchases'),
  createPurchase: (data: Partial<Purchase>) => apiFetch<Purchase>('/api/purchases', { method: 'POST', body: JSON.stringify(data) }),
  updatePurchase: (id: string, data: Partial<Purchase>) => apiFetch<Purchase>(`/api/purchases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePurchase: (id: string) => apiFetch<{ success: boolean }>(`/api/purchases/${id}`, { method: 'DELETE' }),
  scanPurchaseBill: (imageBase64: string) => apiFetch<{ success: boolean; data: any }>('/api/ai/scan-bill', { method: 'POST', body: JSON.stringify({ imageBase64 }) }),
  processScannedPurchaseBill: (payload: any) => apiFetch<{ success: boolean; purchase: Purchase; supplier: Supplier; isNewSupplierCreated: boolean; newProductsCount: number; updatedProductsCount: number }>('/api/purchases/process-scanned', { method: 'POST', body: JSON.stringify(payload) }),

  // Inventory logs
  getInventoryTransactions: () => apiFetch<InventoryTransaction[]>('/api/inventory/transactions'),

  // Notifications
  getNotifications: () => apiFetch<NotificationAlert[]>('/api/notifications'),
  markNotificationRead: (id: string) => apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' }),

  // Backup & Restore
  exportBackup: () => clientStore.exportBackup(currentStoreId),
  restoreBackup: (jsonContent: string) => apiFetch<{ success: boolean; message: string }>('/api/backup/restore', { method: 'POST', body: JSON.stringify({ jsonContent }) }),
  resetDemoData: () => apiFetch<{ success: boolean; message: string }>('/api/backup/reset-demo', { method: 'POST' })
};
