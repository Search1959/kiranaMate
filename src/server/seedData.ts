import {
  Customer,
  Product,
  Supplier,
  Order,
  Sale,
  Expense,
  StoreSettings,
  CustomerTransaction,
  InventoryTransaction,
  TradingSector
} from '../types';

import { TRADING_SECTORS, getSectorConfig } from '../lib/sectorConfig';

export function generateSectorSeedData(sectorId: TradingSector = 'KIRANA_FMCG') {
  const config = getSectorConfig(sectorId);

  const settings: StoreSettings = {
    storeName: config.defaultSettings.storeName || `${config.shortLabel} Traders`,
    tagline: config.defaultSettings.tagline || config.tagline,
    ownerName: "Ramesh Gupta",
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

  const suppliers: Supplier[] = config.sampleSuppliers.map((s, idx) => ({
    id: `sup-${idx + 1}`,
    name: s.name || `Supplier ${idx + 1}`,
    contactPerson: s.contactPerson || 'Contact Person',
    mobile: s.mobile || '9829000000',
    gstin: `08AABC${1000 + idx}1Z${idx}`,
    address: 'Industrial Transport Area',
    city: s.city || 'Jaipur',
    outstandingBalance: s.outstandingBalance || 0,
    createdAt: '2026-01-10'
  }));

  const products: Product[] = config.sampleProducts.map((p, idx) => ({
    id: `p-${idx + 101}`,
    name: p.name || `Product ${idx + 1}`,
    sku: `${sectorId.substring(0, 3)}-${idx + 101}`,
    barcode: `890${1000000000 + idx}`,
    category: p.category || config.categories[0],
    brand: p.brand || 'Generic',
    unit: p.unit || config.primaryUnits[0],
    purchasePrice: p.purchasePrice || 100,
    sellingPrice: p.sellingPrice || 120,
    mrp: p.mrp || 130,
    currentStock: p.currentStock !== undefined ? p.currentStock : 50,
    minStock: p.minStock || 10,
    supplierId: `sup-${(idx % config.sampleSuppliers.length) + 1}`,
    gstPercent: config.defaultGstPercent,
    status: 'ACTIVE',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01'
  }));

  const customers: Customer[] = [
    {
      id: "cust-1",
      name: "Sharma Traders",
      mobile: "9829111222",
      address: "House No. 42, Civil Lines",
      area: "Civil Lines",
      openingBalance: 0,
      currentBalance: 3450,
      outstandingBalance: 3450,
      creditLimit: 15000,
      trustRating: "A",
      notes: "Regular buyer on credit ledger",
      createdAt: "2026-01-15",
      updatedAt: "2026-08-01"
    },
    {
      id: "cust-2",
      name: "Verma Enterprises",
      mobile: "9829222333",
      address: "Block B, Officers Colony",
      area: "Officers Colony",
      openingBalance: 0,
      currentBalance: 0,
      outstandingBalance: 0,
      creditLimit: 10000,
      trustRating: "A",
      notes: "Clear payment via UPI",
      createdAt: "2026-01-20",
      updatedAt: "2026-08-01"
    },
    {
      id: "cust-3",
      name: "Singhal & Sons",
      mobile: "9829333444",
      address: "Flat 102, Shanti Heights",
      area: "Shanti Heights",
      openingBalance: 0,
      currentBalance: 1250,
      outstandingBalance: 1250,
      creditLimit: 8000,
      trustRating: "B",
      notes: "Pays weekly",
      createdAt: "2026-02-01",
      updatedAt: "2026-08-01"
    }
  ];

  const customerTransactions: CustomerTransaction[] = [
    {
      id: "tx-1",
      customerId: "cust-1",
      type: "CREDIT_SALE",
      amount: 3450,
      balanceAfter: 3450,
      notes: "Credit purchase bill #101",
      createdBy: "Ramesh Gupta",
      createdAt: "2026-08-01 11:30:00"
    }
  ];

  const orders: Order[] = [];

  const sales: Sale[] = [
    {
      id: "sal-1",
      saleNumber: `${config.defaultSettings.invoicePrefix || 'INV-'}0001`,
      customerName: "Sharma Traders",
      customerMobile: "9829111222",
      items: [
        {
          productId: "p-101",
          productName: products[0]?.name || "Sample Item",
          quantity: 2,
          unitPrice: products[0]?.sellingPrice || 100,
          mrp: products[0]?.mrp || 120,
          totalPrice: (products[0]?.sellingPrice || 100) * 2
        }
      ],
      subtotal: (products[0]?.sellingPrice || 100) * 2,
      discount: 0,
      grandTotal: (products[0]?.sellingPrice || 100) * 2,
      paymentMethod: "UPI",
      paymentStatus: "PAID",
      notes: "Express Counter POS Sale",
      createdAt: "2026-08-05 10:15:00"
    }
  ];

  const expenses: Expense[] = [
    {
      id: "exp-1",
      category: "Shop Rent",
      amount: 12000,
      date: "2026-08-01",
      description: "Monthly shop rent",
      paymentMethod: "BANK",
      recordedBy: "Ramesh Gupta",
      createdAt: "2026-08-01 10:00:00"
    }
  ];

  const inventoryTransactions: InventoryTransaction[] = [
    {
      id: "inv-1",
      productId: "p-101",
      productName: products[0]?.name || "Sample Item",
      type: "STOCK_IN_PURCHASE",
      quantityChange: 50,
      stockAfter: 50,
      referenceId: "PUR-2026-01",
      notes: "Initial inventory setup",
      createdBy: "Ramesh Gupta",
      createdAt: "2026-08-01 14:00:00"
    }
  ];

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
