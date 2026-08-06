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
  UserRole
} from '../types';

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

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-role': currentUserRole,
    'x-store-id': currentStoreId,
    ...(options?.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error(errorBody.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  setUserRole: (role: UserRole) => setUserRoleHeader(role),
  setStoreId: (storeId: string) => setStoreIdHeader(storeId),

  // Stats & Settings
  getDailyStats: () => apiFetch<DailyStats>('/api/dashboard/stats'),
  getSettings: () => apiFetch<StoreSettings>('/api/settings'),
  updateSettings: (data: Partial<StoreSettings>) => apiFetch<StoreSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Auth & Multi-Tenancy
  login: (username: string, password?: string) =>
    apiFetch<{ success: boolean; user: User; storeId: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  register: (data: { username: string; password?: string; shopName: string; ownerName: string; mobile: string }) =>
    apiFetch<{ success: boolean; user: User; storeId: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getUsers: () => apiFetch<{ users: User[] }>('/api/auth/me'),
  updateUserPermissions: (userId: string, permissions: User['permissions']) => apiFetch<{ success: boolean; user: User }>(`/api/auth/permissions/${userId}`, { method: 'PUT', body: JSON.stringify({ permissions }) }),
  getAdminStores: () => apiFetch<{ stores: { id: string; storeName: string; ownerName: string; isDemo: boolean; productCount: number; salesCount: number }[] }>('/api/admin/stores'),

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

  // Orders
  getOrders: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return apiFetch<Order[]>(`/api/orders?${params.toString()}`);
  },
  createOrder: (data: Partial<Order>) => apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, orderStatus: string, paymentStatus?: string) => apiFetch<Order>(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ orderStatus, paymentStatus }) }),

  // Expenses
  getExpenses: () => apiFetch<Expense[]>('/api/expenses'),
  createExpense: (data: Partial<Expense>) => apiFetch<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
  scanExpenseBill: (imageBase64: string) => apiFetch<{ success: boolean; data: any }>('/api/ai/scan-expense-bill', { method: 'POST', body: JSON.stringify({ imageBase64 }) }),

  // Suppliers & Purchases
  getSuppliers: () => apiFetch<Supplier[]>('/api/suppliers'),
  createSupplier: (data: Partial<Supplier>) => apiFetch<Supplier>('/api/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  getPurchases: () => apiFetch<Purchase[]>('/api/purchases'),
  createPurchase: (data: Partial<Purchase>) => apiFetch<Purchase>('/api/purchases', { method: 'POST', body: JSON.stringify(data) }),
  scanPurchaseBill: (imageBase64: string) => apiFetch<{ success: boolean; data: any }>('/api/ai/scan-bill', { method: 'POST', body: JSON.stringify({ imageBase64 }) }),
  processScannedPurchaseBill: (payload: any) => apiFetch<{ success: boolean; purchase: Purchase; supplier: Supplier; isNewSupplierCreated: boolean; newProductsCount: number; updatedProductsCount: number }>('/api/purchases/process-scanned', { method: 'POST', body: JSON.stringify(payload) }),

  // Inventory logs
  getInventoryTransactions: () => apiFetch<InventoryTransaction[]>('/api/inventory/transactions'),

  // Notifications
  getNotifications: () => apiFetch<NotificationAlert[]>('/api/notifications'),
  markNotificationRead: (id: string) => apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' }),

  // Backup & Restore
  exportBackup: () => window.open(`/api/backup/export?storeId=${currentStoreId}`, '_blank'),
  restoreBackup: (jsonContent: string) => apiFetch<{ success: boolean; message: string }>('/api/backup/restore', { method: 'POST', body: JSON.stringify({ jsonContent }) }),
  resetDemoData: () => apiFetch<{ success: boolean; message: string }>('/api/backup/reset-demo', { method: 'POST' })
};
