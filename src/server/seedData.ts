import {
  Customer,
  Product,
  Supplier,
  Order,
  Sale,
  SaleItem,
  Expense,
  StoreSettings,
  CustomerTransaction,
  InventoryTransaction,
  TradingSector,
  PaymentMethod
} from '../types';

import { TRADING_SECTORS, getSectorConfig } from '../lib/sectorConfig';

const DEMO_CUSTOMER_NAMES: { name: string; mobile: string; area: string }[] = [
  { name: 'Rahul Sharma', mobile: '9811022334', area: 'Model Town' },
  { name: 'Priya Verma', mobile: '9822033445', area: 'Civil Lines' },
  { name: 'Amit Traders', mobile: '9833044556', area: 'Industrial Area' },
  { name: 'Sunita Devi', mobile: '9844055667', area: 'Station Road' },
  { name: 'Mohd. Irfan', mobile: '9855066778', area: 'Old Bazaar' }
];

function daysAgoISO(days: number, hour = 11): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Builds a fully pre-loaded demo store for a given trading sector, using the
 * curated sampleProducts/sampleSuppliers already defined in sectorConfig.ts.
 *
 * Previously this returned empty arrays for everything except `settings`, so
 * every "Launch Demo" / sector-demo store opened as a blank "Clean Slate
 * Account" regardless of what the landing page promised. This reuses the
 * sector's own sample catalogue instead of inventing new data.
 */
export function generateSectorSeedData(sectorId: TradingSector = 'KIRANA_FMCG') {
  const config = getSectorConfig(sectorId);
  const gstDefault = config.defaultGstPercent ?? 5;

  const settings: StoreSettings = {
    storeName: config.defaultSettings.storeName || `${config.shortLabel} Traders`,
    tagline: config.defaultSettings.tagline || config.tagline,
    ownerName: "Shop Owner",
    phone: "9876543210",
    alternatePhone: "9812345678",
    address: "Shop No. 12, Main Market Commercial Complex",
    city: "Jaipur, Rajasthan",
    pincode: "302016",
    gstin: "08ABCDE1234F1ZH",
    upiId: "guptatraders@upi",
    currencySymbol: "₹",
    invoicePrefix: config.defaultSettings.invoicePrefix || "INV-2026-",
    invoiceFooterNote: `Thank you for doing business with ${config.defaultSettings.storeName || 'us'}! GST Tax Invoice.`,
    lowStockThresholdDefault: 10,
    defaultLanguage: "en",
    sector: sectorId
  };

  // ---- Suppliers ----
  const suppliers: Supplier[] = (config.sampleSuppliers || []).map((s, i) => ({
    id: `sup-${i + 1}`,
    name: s.name || `${config.shortLabel} Supplier ${i + 1}`,
    contactPerson: s.contactPerson || 'Purchase Desk',
    mobile: s.mobile || '9800000000',
    companyName: s.companyName,
    category: s.category,
    gstin: s.gstin,
    address: s.address || `${s.city || settings.city} Trade Hub`,
    city: s.city || settings.city,
    outstandingBalance: s.outstandingBalance ?? 0,
    notes: s.notes,
    createdAt: daysAgoISO(60)
  }));

  // ---- Products (from sector sample catalogue) ----
  const products: Product[] = (config.sampleProducts || []).map((p, i) => ({
    id: `p-${i + 1}`,
    name: p.name || `${config.shortLabel} Item ${i + 1}`,
    sku: `${sectorId.slice(0, 3)}-${100 + i}`,
    barcode: `890${sectorId.length}00000${(1000 + i).toString().slice(-4)}`,
    category: p.category || config.categories[0],
    brand: p.brand || 'Generic',
    unit: p.unit || config.primaryUnits[0],
    purchasePrice: p.purchasePrice ?? 100,
    sellingPrice: p.sellingPrice ?? 130,
    mrp: p.mrp ?? p.sellingPrice ?? 140,
    currentStock: p.currentStock ?? 50,
    minStock: p.minStock ?? 10,
    supplierId: suppliers[i % Math.max(suppliers.length, 1)]?.id,
    gstPercent: p.gstPercent ?? gstDefault,
    status: 'ACTIVE' as const,
    createdAt: daysAgoISO(45),
    updatedAt: daysAgoISO(1),
    // carry through any sector-specific attributes (batchNumber, expiryDate, size, purity, etc.)
    ...p
  }));

  // ---- Customers with a mix of clean and Udhaar (credit) balances ----
  const customers: Customer[] = DEMO_CUSTOMER_NAMES.map((c, i) => {
    const creditLimit = [5000, 8000, 15000, 3000, 6000][i];
    const outstanding = [1200, 0, 4200, 850, 0][i];
    return {
      id: `cust-${i + 1}`,
      name: c.name,
      mobile: c.mobile,
      area: c.area,
      address: `${c.area}, ${settings.city}`,
      openingBalance: outstanding,
      currentBalance: outstanding,
      outstandingBalance: outstanding,
      creditLimit,
      trustRating: outstanding > creditLimit * 0.5 ? 'Watch' : 'Good',
      createdAt: daysAgoISO(50),
      updatedAt: daysAgoISO(2)
    };
  });

  const customerTransactions: CustomerTransaction[] = customers
    .filter(c => (c.openingBalance || 0) > 0)
    .map((c, i) => ({
      id: `ctxn-${i + 1}`,
      customerId: c.id,
      type: 'OPENING_BALANCE',
      amount: c.openingBalance || 0,
      balanceAfter: c.openingBalance || 0,
      notes: 'Udhaar carried forward',
      createdBy: 'Shop Owner',
      createdAt: daysAgoISO(20)
    }));

  // ---- Sales history: a spread of past-week sales plus a couple of today's sales ----
  const paymentCycle: (PaymentMethod | 'CREDIT')[] = ['CASH', 'UPI', 'CASH', 'CREDIT', 'UPI'];
  const sales: Sale[] = [];
  if (products.length > 0) {
    const saleDayOffsets = [6, 5, 4, 3, 2, 1, 1, 0, 0];
    saleDayOffsets.forEach((daysAgo, i) => {
      const product = products[i % products.length];
      const qty = 1 + (i % 3);
      const unitPrice = product.sellingPrice;
      const totalPrice = +(unitPrice * qty).toFixed(2);
      const method = paymentCycle[i % paymentCycle.length];
      const customer = method === 'CREDIT' ? customers[i % customers.length] : undefined;
      const item: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPrice,
        mrp: product.mrp,
        totalPrice,
        gstRate: product.gstPercent
      };
      sales.push({
        id: `sale-${i + 1}`,
        saleNumber: `${settings.invoicePrefix}${1000 + i}`,
        customerId: customer?.id,
        customerName: customer?.name || 'Walk-in Customer',
        customerMobile: customer?.mobile,
        items: [item],
        subtotal: totalPrice,
        discount: 0,
        grandTotal: totalPrice,
        paymentMethod: method,
        paymentStatus: method === 'CREDIT' ? 'PENDING' : 'PAID',
        receivedAmount: method === 'CREDIT' ? 0 : totalPrice,
        createdByName: 'Shop Owner',
        createdAt: daysAgoISO(daysAgo)
      });
    });
  }

  // ---- Orders: a couple of open delivery orders in flight ----
  const orders: Order[] = products.length > 0 ? [
    {
      id: 'order-1',
      orderNumber: `${settings.invoicePrefix}ORD-1`,
      customerId: customers[0].id,
      customerName: customers[0].name,
      customerMobile: customers[0].mobile,
      customerAddress: customers[0].address,
      items: [{
        productId: products[0].id,
        productName: products[0].name,
        unit: products[0].unit,
        quantity: 2,
        price: products[0].sellingPrice,
        mrp: products[0].mrp,
        total: +(products[0].sellingPrice * 2).toFixed(2)
      }],
      subtotal: +(products[0].sellingPrice * 2).toFixed(2),
      discount: 0,
      tax: 0,
      deliveryCharge: 0,
      total: +(products[0].sellingPrice * 2).toFixed(2),
      paymentStatus: 'PENDING',
      paidAmount: 0,
      orderStatus: 'OUT_FOR_DELIVERY',
      createdAt: daysAgoISO(0, 9),
      updatedAt: daysAgoISO(0, 10)
    }
  ] : [];

  // ---- Expenses: recurring shop overheads for the last month ----
  const expenses: Expense[] = [
    {
      id: 'exp-1',
      category: 'Rent',
      amount: 12000,
      date: dateOnly(daysAgoISO(15)),
      description: 'Monthly shop rent',
      paymentMethod: 'BANK',
      recordedBy: 'Shop Owner',
      createdAt: daysAgoISO(15)
    },
    {
      id: 'exp-2',
      category: 'Electricity',
      amount: 2400,
      date: dateOnly(daysAgoISO(8)),
      description: 'Electricity bill',
      paymentMethod: 'UPI',
      recordedBy: 'Shop Owner',
      createdAt: daysAgoISO(8)
    }
  ];

  // ---- Inventory ledger: opening stock entry per product ----
  const inventoryTransactions: InventoryTransaction[] = products.map((p, i) => ({
    id: `inv-${i + 1}`,
    productId: p.id,
    productName: p.name,
    type: 'INITIAL_STOCK',
    quantityChange: p.currentStock,
    stockAfter: p.currentStock,
    notes: 'Opening stock at store setup',
    createdBy: 'Shop Owner',
    createdAt: p.createdAt
  }));

  return {
    settings,
    suppliers,
    products,
    customers,
    customerTransactions,
    orders,
    sales,
    expenses,
    inventoryTransactions
  };
}

export function generateSeedData() {
  return generateSectorSeedData('KIRANA_FMCG');
}
