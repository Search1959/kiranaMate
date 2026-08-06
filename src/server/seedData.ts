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

  const suppliers: Supplier[] = [];
  const products: Product[] = [];
  const customers: Customer[] = [];
  const customerTransactions: CustomerTransaction[] = [];
  const orders: Order[] = [];
  const sales: Sale[] = [];
  const expenses: Expense[] = [];
  const inventoryTransactions: InventoryTransaction[] = [];

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
