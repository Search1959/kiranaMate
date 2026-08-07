/**
 * TradeMate Shared Data Types & Interfaces
 */

export type UserRole = 'owner' | 'staff' | 'admin';

export interface UserPermissions {
  canViewReports: boolean;
  canEditProducts: boolean;
  canDeleteRecords: boolean;
  canCollectPayments: boolean;
  canCreateOrders: boolean;
  canManageSettings: boolean;
}

export type TradingSector =
  | 'KIRANA_FMCG'
  | 'METALS_STEEL'
  | 'AGRICULTURE'
  | 'TEXTILES'
  | 'CHEMICALS'
  | 'ENERGY'
  | 'JEWELLERY'
  | 'STATIONERY'
  | 'BUILDING_HARDWARE'
  | 'GENERAL_TRADING'
  | 'PHARMACY'
  | 'ELECTRICAL_ELECTRONICS'
  | 'AUTO_PARTS'
  | 'DAIRY_BEVERAGE'
  | 'FRUITS_VEGETABLES'
  | 'BAKERY'
  | 'FURNITURE_WOOD'
  | 'PLASTICS_PACKAGING'
  | 'MOBILE_COMPUTERS'
  | 'FOOTWEAR_GARMENTS'
  | 'COSMETICS'
  | 'SEEDS_FERTILIZERS'
  | 'WATER_RO';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  createdAt?: string;
  role: UserRole;
  mobile: string;
  permissions: UserPermissions;
  storeId?: string;
  storeName?: string;
  storeSector?: TradingSector;
  isDemoUser?: boolean;
  token?: string;
}

export interface AdminAccountItem {
  id: string;
  userId: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  mobile: string;
  storeId: string;
  storeName: string;
  storeSector?: TradingSector;
  productCount: number;
  salesCount: number;
  customerCount: number;
  createdAt?: string;
  isDemo?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  area?: string;
  email?: string;
  openingBalance?: number; // positive = credit/udhaar, negative = advance
  currentBalance?: number; // calculated total outstanding
  outstandingBalance?: number; // legacy/alias field
  creditLimit?: number;
  trustRating?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType = 'CREDIT_SALE' | 'PAYMENT_RECEIVED' | 'OPENING_BALANCE' | 'RETURN_CREDIT' | 'DISCOUNT_ADJUSTMENT';
export type PaymentMethod = 'CASH' | 'UPI' | 'BANK' | 'OTHER';

export interface CustomerTransaction {
  id: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  paymentMethod?: PaymentMethod;
  referenceId?: string; // Order ID or Sale ID or Payment Receipt No
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export type KiranaCategory =
  | 'Rice & Grains'
  | 'Atta & Flours'
  | 'Dals & Pulses'
  | 'Edible Oils & Ghee'
  | 'Spices & Masalas'
  | 'Biscuits & Cookies'
  | 'Snacks & Namkeen'
  | 'Beverages & Tea/Coffee'
  | 'Dairy & Bakery'
  | 'Personal Care & Soap'
  | 'Cleaning & Household'
  | 'Chocolates & Sweets'
  | 'Pooja Essentials'
  | 'Other';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: KiranaCategory | string;
  brand: string;
  unit: string; // kg, g, l, ml, pcs, pkt, box, bottle, pouch, jar
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  currentStock: number;
  minStock: number;
  supplierId?: string;
  gstPercent: number; // 0, 5, 12, 18, 28
  image?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  // Sector-Specific Attributes
  batchNumber?: string;
  expiryDate?: string;
  manufacturingDate?: string;
  scheduleCategory?: string;
  grade?: string;
  thickness?: string;
  width?: string;
  length?: string;
  heatNumber?: string;
  millName?: string;
  imei?: string;
  serialNumber?: string;
  warrantyMonths?: number;
  purity?: string;
  makingCharge?: number;
  stoneWeightGrams?: number;
  gsm?: number;
  color?: string;
  fabricType?: string;
  size?: string;
  cropSeason?: string;
  vehicleModel?: string;
  oemNumber?: string;
  shade?: string;
  amcCost?: number;
  nextServiceDueDate?: string;
  hazardClass?: string;
  density?: string;
}

export type ProductUnit = 'kg' | 'g' | 'liter' | 'ml' | 'pcs' | 'pkt' | 'box' | 'bottle' | 'pouch' | 'bag' | 'tin' | 'jar' | string;

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  mobile: string;
  companyName?: string;
  category?: string;
  gstin?: string;
  address: string;
  city: string;
  outstandingBalance: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  unit?: string;
  quantity: number;
  purchasePrice: number; // Unit Cost / Rate
  gstPercent?: number; // GST Rate e.g. 5, 12, 18
  gstAmount?: number;
  discount?: number; // Discount amount or %
  sellingPrice?: number;
  mrp?: number;
  unitPrice?: number;
  totalPrice?: number;
  total?: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  supplierInvoiceNo?: string;
  purchaseDate?: string;
  invoiceDate?: string;
  items: PurchaseItem[];
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  freightCharges?: number;
  totalAmount?: number;
  grandTotal?: number;
  paidAmount?: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL';

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  price: number;
  mrp: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAmount: number;
  orderStatus: OrderStatus;
  notes?: string;
  isSaleDirect?: boolean; // true if created via 30-sec express sale POS
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  totalPrice: number;
  gstRate?: number;
  gstAmount?: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId?: string;
  customerName: string;
  customerMobile?: string;
  customerGstin?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  taxType?: 'INCLUSIVE' | 'EXCLUSIVE' | 'EXEMPT';
  gstRate?: number;
  taxableAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalTaxAmount?: number;
  grandTotal: number;
  paymentMethod: PaymentMethod | 'CREDIT';
  paymentStatus: PaymentStatus;
  receivedAmount?: number;
  changeAmount?: number;
  createdByName?: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Delivery/Transport'
  | 'Staff Salary'
  | 'Packaging'
  | 'Maintenance'
  | 'Tea & Snacks'
  | 'Wi-Fi & Telecom'
  | 'Taxes & Licenses'
  | 'Pest Control & Cleaning'
  | 'Marketing & Signboard'
  | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory | string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: PaymentMethod;
  payeeName?: string;
  receiptNo?: string;
  isRecurring?: boolean;
  gstAmount?: number;
  recordedBy: string;
  createdAt: string;
}

export type InventoryTransactionType = 'STOCK_IN_PURCHASE' | 'STOCK_OUT_SALE' | 'MANUAL_ADD' | 'MANUAL_REDUCE' | 'DAMAGE_EXPIRED' | 'INITIAL_STOCK';

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: InventoryTransactionType;
  quantityChange: number; // positive or negative
  stockAfter: number;
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface NotificationAlert {
  id: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERDUE_PAYMENT' | 'NEW_ORDER' | 'DELIVERY_PENDING';
  title: string;
  message: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  pincode: string;
  gstin?: string;
  upiId?: string; // for generating QR codes for payment
  currencySymbol: string;
  invoicePrefix: string;
  invoiceFooterNote: string;
  lowStockThresholdDefault: number;
  defaultLanguage: 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'bn';
  sector?: TradingSector;
}

export interface DailyStats {
  todaySalesTotal: number;
  cashSales: number;
  upiSales: number;
  creditSales: number;
  todayExpenses: number;
  estimatedProfitToday: number;
  totalPendingUdhaar: number;
  dueTodayUdhaar: number;
  overdueUdhaar: number;
  todayCollection: number;
  pendingOrdersCount: number;
  newOrdersCount: number;
  preparingOrdersCount: number;
  outForDeliveryCount: number;
  deliveredOrdersToday: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'bn';
