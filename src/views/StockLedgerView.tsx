import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  PackageCheck,
  TrendingUp,
  Printer,
  Download,
  Clock,
  FileText,
  AlertCircle,
  Plus,
  RefreshCw,
  Layers,
  ChevronRight,
  X,
  History
} from 'lucide-react';
import { Product, InventoryTransaction, Sale, Purchase, KiranaCategory, StoreSettings } from '../types';
import { formatMoney } from '../lib/currency';

interface StockLedgerViewProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  inventoryTransactions: InventoryTransaction[];
  settings: StoreSettings;
  onRefreshData: () => void;
  onOpenAddStock: () => void;
  onOpenScanBill: () => void;
}

type PeriodPreset = 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'custom';

export const StockLedgerView: React.FC<StockLedgerViewProps> = ({
  products,
  sales,
  purchases,
  inventoryTransactions,
  settings,
  onRefreshData,
  onOpenAddStock,
  onOpenScanBill
}) => {
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);
  // Period filter states
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('month');
  
  // Custom date range state
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(firstDayOfMonthStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  // Active view mode tab
  const [activeTab, setActiveTab] = useState<'item_summary' | 'movement_timeline'>('item_summary');

  // Handle Preset Changes
  const handlePresetChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    const now = new Date();
    
    if (preset === 'today') {
      const dateStr = now.toISOString().split('T')[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const dateStr = y.toISOString().split('T')[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (preset === 'week') {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      setStartDate(w.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(mStart.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'last_month') {
      const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(lmStart.toISOString().split('T')[0]);
      setEndDate(lmEnd.toISOString().split('T')[0]);
    }
  };

  // Convert dates to timestamp ranges
  const startTimestamp = useMemo(() => {
    return new Date(`${startDate}T00:00:00`).getTime();
  }, [startDate]);

  const endTimestamp = useMemo(() => {
    return new Date(`${endDate}T23:59:59.999`).getTime();
  }, [endDate]);

  // Categories list
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Calculate Product-Wise Stock Ledger for the selected period
  const itemLedgerSummaries = useMemo(() => {
    return filteredProducts.map(prod => {
      // Find all inventory transactions for this product sorted chronologically
      const prodTx = inventoryTransactions
        .filter(t => t.productId === prod.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Transactions strictly before period start date
      const txBeforePeriod = prodTx.filter(t => new Date(t.createdAt).getTime() < startTimestamp);

      // Transactions during period
      const txInPeriod = prodTx.filter(t => {
        const time = new Date(t.createdAt).getTime();
        return time >= startTimestamp && time <= endTimestamp;
      });

      // Transactions after period end date
      const txAfterPeriod = prodTx.filter(t => new Date(t.createdAt).getTime() > endTimestamp);

      // Current stock is currentStock property
      let currentStock = prod.currentStock;

      // Calculate Closing Stock at end of period:
      // Subtract all net quantity changes that happened AFTER period end date
      let closingStock = currentStock;
      txAfterPeriod.forEach(t => {
        closingStock -= t.quantityChange;
      });

      // Calculate Stock In during period (+)
      let stockInQty = 0;
      let stockInValue = 0;

      // Calculate Stock Out during period (-)
      let stockOutQty = 0;
      let stockOutValue = 0;

      // Adjustments (Manual or damage)
      let adjustmentQty = 0;

      txInPeriod.forEach(t => {
        if (t.quantityChange > 0) {
          if (t.type === 'STOCK_IN_PURCHASE' || t.type === 'INITIAL_STOCK' || t.type === 'MANUAL_ADD') {
            stockInQty += t.quantityChange;
            stockInValue += t.quantityChange * (prod.purchasePrice || 0);
          } else {
            adjustmentQty += t.quantityChange;
          }
        } else if (t.quantityChange < 0) {
          const absQty = Math.abs(t.quantityChange);
          if (t.type === 'STOCK_OUT_SALE') {
            stockOutQty += absQty;
            stockOutValue += absQty * (prod.sellingPrice || prod.purchasePrice || 0);
          } else if (t.type === 'DAMAGE_EXPIRED' || t.type === 'MANUAL_REDUCE') {
            adjustmentQty += t.quantityChange;
          } else {
            stockOutQty += absQty;
          }
        }
      });

      // Also parse Sales items directly if inventoryTransactions were not generated for old sales
      if (prodTx.length === 0) {
        // Fallback: check sales in period
        sales.forEach(s => {
          const sTime = new Date(s.createdAt).getTime();
          if (sTime >= startTimestamp && sTime <= endTimestamp) {
            s.items.forEach(item => {
              if (item.productId === prod.id) {
                stockOutQty += item.quantity;
                stockOutValue += item.totalPrice || (item.quantity * item.unitPrice);
              }
            });
          }
        });

        // Check purchases in period
        purchases.forEach(p => {
          const pTime = new Date(p.createdAt || p.purchaseDate).getTime();
          if (pTime >= startTimestamp && pTime <= endTimestamp) {
            p.items.forEach(item => {
              if (item.productId === prod.id) {
                stockInQty += item.quantity;
                stockInValue += item.totalPrice || (item.quantity * item.purchasePrice);
              }
            });
          }
        });
      }

      // Calculate Opening Stock: Opening = Closing - Stock In + Stock Out - Adjustments
      const openingStock = closingStock - stockInQty + stockOutQty - adjustmentQty;

      const openingValue = Math.max(0, openingStock) * prod.purchasePrice;
      const closingValue = Math.max(0, closingStock) * prod.purchasePrice;

      return {
        product: prod,
        openingStock,
        openingValue,
        stockInQty,
        stockInValue,
        stockOutQty,
        stockOutValue,
        adjustmentQty,
        closingStock,
        closingValue,
        purchasePrice: prod.purchasePrice,
        mrp: prod.mrp,
        sellingPrice: prod.sellingPrice
      };
    });
  }, [filteredProducts, inventoryTransactions, sales, purchases, startTimestamp, endTimestamp]);

  // Overall Totals for Period
  const periodTotals = useMemo(() => {
    let openingVal = 0;
    let closingVal = 0;
    let totalStockInQty = 0;
    let totalStockOutQty = 0;
    let totalStockInVal = 0;
    let totalStockOutVal = 0;

    itemLedgerSummaries.forEach(item => {
      openingVal += item.openingValue;
      closingVal += item.closingValue;
      totalStockInQty += item.stockInQty;
      totalStockOutQty += item.stockOutQty;
      totalStockInVal += item.stockInValue;
      totalStockOutVal += item.stockOutValue;
    });

    return {
      openingVal,
      closingVal,
      totalStockInQty,
      totalStockOutQty,
      totalStockInVal,
      totalStockOutVal,
      netStockChangeQty: totalStockInQty - totalStockOutQty,
      netValuationChange: closingVal - openingVal
    };
  }, [itemLedgerSummaries]);

  // Movement Timeline Transactions
  const periodTransactions = useMemo(() => {
    return inventoryTransactions
      .filter(t => {
        const time = new Date(t.createdAt).getTime();
        const matchesDate = time >= startTimestamp && time <= endTimestamp;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || (
          t.productName.toLowerCase().includes(q) ||
          (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q))
        );
        return matchesDate && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [inventoryTransactions, startTimestamp, endTimestamp, searchQuery]);

  // Handle CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Product Name',
      'Category',
      'Barcode',
      'Unit',
      `Purchase Price (${settings.currencySymbol})`,
      'Opening Stock Qty',
      `Opening Value (${settings.currencySymbol})`,
      'Stock In Qty (+)',
      'Stock Out Qty (-)',
      'Closing Stock Qty',
      `Closing Valuation (${settings.currencySymbol})`
    ];

    const rows = itemLedgerSummaries.map(item => [
      `"${item.product.name.replace(/"/g, '""')}"`,
      `"${item.product.category || 'General'}"`,
      `"${item.product.barcode || ''}"`,
      `"${item.product.unit || 'unit'}"`,
      item.purchasePrice,
      item.openingStock,
      item.openingValue.toFixed(2),
      item.stockInQty,
      item.stockOutQty,
      item.closingStock,
      item.closingValue.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kirana_Stock_Ledger_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Kirana Stock Ledger & Audit Movement</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit stock balances with exact opening stock, inward purchases, sales quantity, and closing stock valuation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefreshData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Ledger
          </button>

          <button
            onClick={onOpenAddStock}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Restock Item
          </button>
        </div>
      </div>

      {/* Date Period Filter Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="font-extrabold text-xs sm:text-sm text-slate-100">Select Audit Period:</span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'Last 7 Days' },
              { id: 'month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'custom', label: 'Custom Range' },
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id as PeriodPreset)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  periodPreset === preset.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Start / End Date inputs */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex-1 sm:flex-none">
              <span className="text-slate-400 font-semibold">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setPeriodPreset('custom');
                  setStartDate(e.target.value);
                }}
                className="bg-transparent text-white font-extrabold text-xs focus:outline-none"
              />
            </div>

            <span className="text-slate-500 font-bold">to</span>

            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex-1 sm:flex-none">
              <span className="text-slate-400 font-semibold">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setPeriodPreset('custom');
                  setEndDate(e.target.value);
                }}
                className="bg-transparent text-white font-extrabold text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="text-[11px] text-indigo-300 font-semibold bg-indigo-950/50 px-3 py-1 rounded-lg border border-indigo-800/50">
            Showing Stock Ledger for: <span className="font-extrabold text-white">{startDate}</span> to <span className="font-extrabold text-white">{endDate}</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards for Selected Period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Opening Stock Valuation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Opening Stock Value</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {money(periodTotals?.openingVal)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">As of start date ({startDate})</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Stock In (Purchases) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Stock In (+)</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">
              +{periodTotals?.totalStockInQty ?? 0} <span className="text-xs font-normal text-slate-500">units</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
              Cost: {money(periodTotals?.totalStockInVal)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        {/* Stock Out (Sales) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Stock Out (-)</span>
            <span className="text-xl font-black text-rose-600 mt-1 block">
              -{periodTotals?.totalStockOutQty ?? 0} <span className="text-xs font-normal text-slate-500">units</span>
            </span>
            <span className="text-[10px] text-rose-700 font-bold block mt-0.5">
              Sales: {money(periodTotals?.totalStockOutVal)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Closing Stock Valuation */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">Closing Stock Value</span>
            <span className="text-xl font-black text-indigo-700 mt-1 block">
              {money(periodTotals?.closingVal)}
            </span>
            <span className="text-[10px] text-indigo-600 font-extrabold block mt-0.5">
              As of end date ({endDate})
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('item_summary')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'item_summary'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Item Stock Balance Summary ({itemLedgerSummaries.length})
            </button>

            <button
              onClick={() => setActiveTab('movement_timeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'movement_timeline'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Audit Log ({periodTransactions.length})
            </button>
          </div>

          {/* Search & Category dropdown */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product, barcode or ref..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab 1: Item Stock Balance Summary Table */}
        {activeTab === 'item_summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Product / Item</th>
                  <th className="py-3 px-4 text-center">Category</th>
                  <th className="py-3 px-4 text-right">Purchase Price</th>
                  <th className="py-3 px-4 text-right bg-slate-50">Opening Stock</th>
                  <th className="py-3 px-4 text-right text-emerald-700 bg-emerald-50/50">+ Stock In</th>
                  <th className="py-3 px-4 text-right text-rose-700 bg-rose-50/50">- Stock Out</th>
                  <th className="py-3 px-4 text-right bg-indigo-50/50 text-indigo-900 font-black">Closing Stock</th>
                  <th className="py-3 px-4 text-right font-black">Closing Value ({settings.currencySymbol})</th>
                  <th className="py-3 px-4 text-center">Audit</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {itemLedgerSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold">No products found matching your filters.</p>
                    </td>
                  </tr>
                ) : (
                  itemLedgerSummaries.map(item => (
                    <tr key={item.product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{item.product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.product.barcode ? `BC: ${item.product.barcode}` : `SKU: ${item.product.sku}`}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                          {item.product.category || 'General'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-700">
                        {money(item.purchasePrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-extrabold text-slate-700 bg-slate-50">
                        {item.openingStock} <span className="text-[10px] font-normal text-slate-400">{item.product.unit}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-black text-emerald-600 bg-emerald-50/30">
                        {item.stockInQty > 0 ? `+${item.stockInQty}` : '0'}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-rose-600 bg-rose-50/30">
                        {item.stockOutQty > 0 ? `-${item.stockOutQty}` : '0'}
                      </td>

                      <td className="py-3 px-4 text-right bg-indigo-50/30">
                        <span className={`text-sm font-black ${
                          item.closingStock <= 0
                            ? 'text-red-600 bg-red-100 px-2 py-0.5 rounded-md'
                            : item.closingStock <= (item.product.minStock || 5)
                            ? 'text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md'
                            : 'text-indigo-900'
                        }`}>
                          {item.closingStock}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 block">{item.product.unit}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                        {money(item.closingValue)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedProductDetail(item.product)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Ledger</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Movement Timeline Audit Log Table */}
        {activeTab === 'movement_timeline' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Ref / Bill No</th>
                  <th className="py-3 px-4 text-right">Qty Change</th>
                  <th className="py-3 px-4 text-right">Stock After</th>
                  <th className="py-3 px-4">Notes / User</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {periodTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No stock movement transactions logged during this date period.
                    </td>
                  </tr>
                ) : (
                  periodTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {tx.productName}
                      </td>

                      <td className="py-3 px-4">
                        {tx.type === 'STOCK_IN_PURCHASE' && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            + Purchase Stock In
                          </span>
                        )}
                        {tx.type === 'STOCK_OUT_SALE' && (
                          <span className="bg-blue-100 text-blue-800 border border-blue-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            - POS Sale Out
                          </span>
                        )}
                        {tx.type === 'MANUAL_ADD' && (
                          <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            + Manual Restock
                          </span>
                        )}
                        {tx.type === 'MANUAL_REDUCE' && (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            - Manual Reduction
                          </span>
                        )}
                        {tx.type === 'DAMAGE_EXPIRED' && (
                          <span className="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            - Damage / Expired
                          </span>
                        )}
                        {tx.type === 'INITIAL_STOCK' && (
                          <span className="bg-slate-100 text-slate-800 border border-slate-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            Initial Opening Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {tx.referenceId || 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-right font-black">
                        {tx.quantityChange > 0 ? (
                          <span className="text-emerald-600">+{tx.quantityChange}</span>
                        ) : (
                          <span className="text-rose-600">{tx.quantityChange}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {tx.stockAfter}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-500">
                        {tx.notes || tx.createdBy || 'Store Log'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Single Item Detailed Audit Timeline */}
      {selectedProductDetail && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">{selectedProductDetail.name}</h2>
                  <p className="text-xs text-slate-500">
                    Category: {selectedProductDetail.category} | Current Stock: {selectedProductDetail.currentStock} {selectedProductDetail.unit}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProductDetail(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                Individual Audit History Log:
              </h3>

              <div className="space-y-2">
                {inventoryTransactions
                  .filter(t => t.productId === selectedProductDetail.id)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((t) => (
                    <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{t.type.replace(/_/g, ' ')}</span>
                          {t.referenceId && (
                            <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-md text-slate-700 font-semibold">
                              Ref: {t.referenceId}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(t.createdAt).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-black ${t.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange} {selectedProductDetail.unit}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Balance Stock: {t.stockAfter}</span>
                      </div>
                    </div>
                  ))}

                {inventoryTransactions.filter(t => t.productId === selectedProductDetail.id).length === 0 && (
                  <p className="text-center py-6 text-slate-400 text-xs font-semibold">
                    No individual audit transactions found for this item yet.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
