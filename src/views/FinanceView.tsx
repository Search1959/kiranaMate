import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Download,
  Printer,
  FileText,
  CreditCard,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Percent,
  RefreshCw,
  Wallet,
  Receipt
} from 'lucide-react';
import { Sale, Purchase, Expense, Customer, Supplier, Product, DailyStats, StoreSettings } from '../types';
import { formatMoney } from '../lib/currency';

interface FinanceViewProps {
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  stats: DailyStats | null;
  settings: StoreSettings;
  onRefreshData: () => void;
}

type PeriodPreset = 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'custom';

export const FinanceView: React.FC<FinanceViewProps> = ({
  sales,
  purchases,
  expenses,
  customers,
  suppliers,
  products,
  stats,
  settings,
  onRefreshData
}) => {
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);
  // Date period filtering states
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('month');

  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(firstDayOfMonthStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const [activeTab, setActiveTab] = useState<'pnl_statement' | 'income_breakdown' | 'expense_breakdown' | 'working_capital'>('pnl_statement');

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

  // Convert dates to timestamps
  const startTimestamp = useMemo(() => {
    return new Date(`${startDate}T00:00:00`).getTime();
  }, [startDate]);

  const endTimestamp = useMemo(() => {
    return new Date(`${endDate}T23:59:59.999`).getTime();
  }, [endDate]);

  // Financial Computations for Selected Period
  const financialSummary = useMemo(() => {
    // 1. Sales / Income in period
    const filteredSales = sales.filter(s => {
      const t = new Date(s.createdAt).getTime();
      return t >= startTimestamp && t <= endTimestamp;
    });

    let grossIncome = 0;
    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;
    let creditSales = 0;
    let totalDiscountAllowed = 0;

    // Cost of Goods Sold (COGS) estimation from items sold
    let estimatedCOGS = 0;

    filteredSales.forEach(s => {
      const saleVal = s.grandTotal || s.subtotal || 0;
      grossIncome += saleVal;
      totalDiscountAllowed += s.discount || 0;

      const method = (s.paymentMethod || 'CASH').toUpperCase();
      if (method === 'CASH') cashSales += saleVal;
      else if (method === 'UPI') upiSales += saleVal;
      else if (method === 'CARD' || method === 'BANK') cardSales += saleVal;
      else if (method === 'CREDIT' || s.paymentStatus === 'PENDING') creditSales += saleVal;

      // Calculate item purchase price cost if available
      s.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const costPerUnit = prod ? prod.purchasePrice : (item.unitPrice * 0.8); // fallback 80% cost
        estimatedCOGS += costPerUnit * item.quantity;
      });
    });

    // 2. Stock Purchases in period
    const filteredPurchases = purchases.filter(p => {
      const t = new Date(p.createdAt || p.purchaseDate).getTime();
      return t >= startTimestamp && t <= endTimestamp;
    });

    let totalPurchasesVal = 0;
    filteredPurchases.forEach(p => {
      totalPurchasesVal += p.grandTotal || p.totalAmount || 0;
    });

    // 3. Operating Expenses in period
    const filteredExpenses = expenses.filter(e => {
      const t = new Date(e.createdAt || e.date).getTime();
      return t >= startTimestamp && t <= endTimestamp;
    });

    let totalOpExpenses = 0;
    const expensesByCategory: Record<string, number> = {};

    filteredExpenses.forEach(e => {
      totalOpExpenses += e.amount || 0;
      const cat = e.category || 'Other';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.amount || 0);
    });

    // Gross Profit = Gross Income - Cost of Goods Sold
    const grossProfit = grossIncome - estimatedCOGS;
    const grossProfitMarginPct = grossIncome > 0 ? (grossProfit / grossIncome) * 100 : 0;

    // Net Profit = Gross Profit - Operating Expenses
    const netProfit = grossProfit - totalOpExpenses;
    const netProfitMarginPct = grossIncome > 0 ? (netProfit / grossIncome) * 100 : 0;

    // Working Capital Balances (Current Store State)
    const customerUdhaarReceivables = customers.reduce((sum, c) => sum + (c.currentBalance || c.openingBalance || 0), 0);
    const supplierUdhaarPayables = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
    const netWorkingCapital = customerUdhaarReceivables - supplierUdhaarPayables;

    return {
      salesCount: filteredSales.length,
      purchasesCount: filteredPurchases.length,
      expensesCount: filteredExpenses.length,
      grossIncome,
      cashSales,
      upiSales,
      cardSales,
      creditSales,
      totalDiscountAllowed,
      estimatedCOGS,
      totalPurchasesVal,
      totalOpExpenses,
      expensesByCategory,
      grossProfit,
      grossProfitMarginPct,
      netProfit,
      netProfitMarginPct,
      customerUdhaarReceivables,
      supplierUdhaarPayables,
      netWorkingCapital
    };
  }, [sales, purchases, expenses, customers, suppliers, products, startTimestamp, endTimestamp]);

  // CSV Export
  const handleExportPnLCSV = () => {
    const rows = [
      ['KIRANA STORE PROFIT & LOSS FINANCIAL STATEMENT'],
      [`Period: ${startDate} to ${endDate}`],
      [''],
      ['INCOME & REVENUE'],
      ['Total Sales Invoices Count', financialSummary.salesCount],
      [`Express POS Cash Sales (${settings.currencySymbol})`, financialSummary.cashSales.toFixed(2)],
      [`UPI / Digital Payments (${settings.currencySymbol})`, financialSummary.upiSales.toFixed(2)],
      [`Card / Bank Payments (${settings.currencySymbol})`, financialSummary.cardSales.toFixed(2)],
      [`Udhaar Credit Sales (${settings.currencySymbol})`, financialSummary.creditSales.toFixed(2)],
      [`GROSS REVENUE (${settings.currencySymbol})`, financialSummary.grossIncome.toFixed(2)],
      [''],
      ['COST OF GOODS SOLD & PURCHASES'],
      [`Estimated Cost of Goods Sold (COGS) (${settings.currencySymbol})`, financialSummary.estimatedCOGS.toFixed(2)],
      [`Stock Purchase Bills (${settings.currencySymbol})`, financialSummary.totalPurchasesVal.toFixed(2)],
      [`GROSS PROFIT (${settings.currencySymbol})`, financialSummary.grossProfit.toFixed(2)],
      ['GROSS PROFIT MARGIN (%)', `${financialSummary.grossProfitMarginPct.toFixed(2)}%`],
      [''],
      ['OPERATING EXPENSES'],
      ...Object.entries(financialSummary.expensesByCategory).map(([cat, val]) => [`Expense: ${cat} (${settings.currencySymbol})`, (val as number).toFixed(2)]),
      [`TOTAL OPERATING EXPENSES (${settings.currencySymbol})`, financialSummary.totalOpExpenses.toFixed(2)],
      [''],
      ['NET PROFIT & MARGIN SUMMARY'],
      [`NET PROFIT (${settings.currencySymbol})`, financialSummary.netProfit.toFixed(2)],
      ['NET PROFIT MARGIN (%)', `${financialSummary.netProfitMarginPct.toFixed(2)}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kirana_P&L_Financial_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Store Finance & Profit Analysis</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Profit & Loss (P&L) statement, operating expenses breakdown, gross margin %, and working capital
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            title="Refresh Financial Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportPnLCSV}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export P&L CSV
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Statement
          </button>
        </div>
      </div>

      {/* Date Period Filter Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-extrabold text-xs sm:text-sm text-slate-100">Financial Audit Period:</span>
          </div>

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
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

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

          <div className="text-[11px] text-emerald-300 font-semibold bg-emerald-950/50 px-3 py-1 rounded-lg border border-emerald-800/50">
            P&L Audit Range: <span className="font-extrabold text-white">{startDate}</span> to <span className="font-extrabold text-white">{endDate}</span>
          </div>
        </div>
      </div>

      {/* 4 Financial Key Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Gross Revenue / Income */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Gross Income (Revenue)</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {money(financialSummary?.grossIncome)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {financialSummary?.salesCount ?? 0} Sales Invoices
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Cost & Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Expenditure</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {money((financialSummary?.estimatedCOGS ?? 0) + (financialSummary?.totalOpExpenses ?? 0))}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              COGS: {money(financialSummary?.estimatedCOGS)} | OpEx: {money(financialSummary?.totalOpExpenses)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">Net Profit</span>
            <span className={`text-2xl font-black mt-1 block ${(financialSummary?.netProfit ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {money(financialSummary?.netProfit)}
            </span>
            <span className="text-[10px] font-bold text-emerald-800 block mt-0.5">
              Net Margin: {(financialSummary?.netProfitMarginPct ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
            (financialSummary?.netProfit ?? 0) >= 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Working Capital Udhaar Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Customer Udhaar Pending</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {money(financialSummary?.customerUdhaarReceivables)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Owed to store by customers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Main Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center gap-1.5 bg-slate-50">
          <button
            onClick={() => setActiveTab('pnl_statement')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'pnl_statement'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Profit & Loss (P&L) Statement
          </button>

          <button
            onClick={() => setActiveTab('income_breakdown')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'income_breakdown'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Income Breakdown (Cash / UPI / Udhaar)
          </button>

          <button
            onClick={() => setActiveTab('expense_breakdown')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'expense_breakdown'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Operating Expense Categories ({Object.keys(financialSummary.expensesByCategory).length})
          </button>

          <button
            onClick={() => setActiveTab('working_capital')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'working_capital'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Working Capital & Credit Ledger
          </button>
        </div>

        {/* Tab 1: Profit & Loss Statement */}
        {activeTab === 'pnl_statement' && (
          <div className="p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Store Profit & Loss (P&L) Summary</h2>
                <p className="text-xs text-slate-500">
                  Comprehensive audit for period {startDate} to {endDate}
                </p>
              </div>

              {financialSummary.netProfit >= 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Healthy Profit Margin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-extrabold">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Net Loss Operating Warning
                </span>
              )}
            </div>

            {/* P&L Detailed Financial Statement Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  {/* SECTION 1: REVENUE / INCOME */}
                  <tr className="bg-slate-100 font-extrabold text-slate-800 text-xs">
                    <td className="py-2.5 px-4" colSpan={2}>1. REVENUE & GROSS INCOME</td>
                    <td className="py-2.5 px-4 text-right">AMOUNT ({settings.currencySymbol})</td>
                  </tr>

                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-700 pl-8">Express POS Cash Sales</td>
                    <td className="py-2.5 px-4 text-slate-400">Direct cash register payments</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {money(financialSummary?.cashSales)}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-700 pl-8">UPI / Digital QR Code Collections</td>
                    <td className="py-2.5 px-4 text-slate-400">GPay, PhonePe, Paytm, BHIM</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {money(financialSummary?.upiSales)}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-700 pl-8">Card & Bank Transfers</td>
                    <td className="py-2.5 px-4 text-slate-400">POS machine payments</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {money(financialSummary?.cardSales)}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-700 pl-8">Customer Udhaar Credit Sales</td>
                    <td className="py-2.5 px-4 text-slate-400">Billed on customer Khata</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {money(financialSummary?.creditSales)}
                    </td>
                  </tr>

                  <tr className="bg-emerald-50/50 font-black text-emerald-950 border-b-2 border-emerald-200">
                    <td className="py-3 px-4 pl-8">TOTAL GROSS REVENUE (A)</td>
                    <td className="py-3 px-4 text-emerald-800 text-[11px]">{financialSummary?.salesCount ?? 0} Completed Receipts</td>
                    <td className="py-3 px-4 text-right text-sm text-emerald-700">
                      {money(financialSummary?.grossIncome)}
                    </td>
                  </tr>

                  {/* SECTION 2: COST OF GOODS SOLD */}
                  <tr className="bg-slate-100 font-extrabold text-slate-800 text-xs">
                    <td className="py-2.5 px-4" colSpan={2}>2. DIRECT COST OF GOODS SOLD (COGS)</td>
                    <td className="py-2.5 px-4 text-right">AMOUNT ({settings.currencySymbol})</td>
                  </tr>

                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-700 pl-8">Cost of Items Sold (Purchase Rates)</td>
                    <td className="py-2.5 px-4 text-slate-400">Wholesale cost of goods sold</td>
                    <td className="py-2.5 px-4 text-right font-bold text-rose-600">
                      - {money(financialSummary?.estimatedCOGS)}
                    </td>
                  </tr>

                  <tr className="bg-slate-50 font-black text-slate-900 border-b-2 border-slate-200">
                    <td className="py-3 px-4 pl-8">GROSS PROFIT (A - Direct Cost)</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">Gross Profit Margin: {(financialSummary?.grossProfitMarginPct ?? 0).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right text-sm font-black text-slate-900">
                      {money(financialSummary?.grossProfit)}
                    </td>
                  </tr>

                  {/* SECTION 3: OPERATING EXPENSES */}
                  <tr className="bg-slate-100 font-extrabold text-slate-800 text-xs">
                    <td className="py-2.5 px-4" colSpan={2}>3. STORE OPERATING EXPENSES (OpEx)</td>
                    <td className="py-2.5 px-4 text-right">AMOUNT ({settings.currencySymbol})</td>
                  </tr>

                  {Object.entries(financialSummary?.expensesByCategory || {}).map(([cat, amount]) => (
                    <tr key={cat} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold text-slate-700 pl-8">{cat} Expenses</td>
                      <td className="py-2.5 px-4 text-slate-400">Recorded store expense log</td>
                      <td className="py-2.5 px-4 text-right font-bold text-rose-600">
                        - {money(amount as number)}
                      </td>
                    </tr>
                  ))}

                  {Object.keys(financialSummary?.expensesByCategory || {}).length === 0 && (
                    <tr className="border-b border-slate-100">
                      <td className="py-2.5 px-4 text-slate-400 pl-8" colSpan={3}>No operating expenses recorded in this date period.</td>
                    </tr>
                  )}

                  <tr className="bg-rose-50/50 font-black text-rose-950 border-b-2 border-rose-200">
                    <td className="py-3 px-4 pl-8">TOTAL OPERATING EXPENSES (B)</td>
                    <td className="py-3 px-4 text-rose-800 text-[11px]">{financialSummary?.expensesCount ?? 0} Expense Entries</td>
                    <td className="py-3 px-4 text-right text-sm text-rose-700">
                      - {money(financialSummary?.totalOpExpenses)}
                    </td>
                  </tr>

                  {/* FINAL NET PROFIT ROW */}
                  <tr className="bg-slate-900 text-white font-black text-sm">
                    <td className="py-4 px-4 pl-8">NET STORE PROFIT (Gross Profit - OpEx)</td>
                    <td className="py-4 px-4 text-emerald-300 text-xs font-bold">
                      Net Profit Margin: {(financialSummary?.netProfitMarginPct ?? 0).toFixed(2)}%
                    </td>
                    <td className="py-4 px-4 text-right text-base text-emerald-400">
                      {money(financialSummary?.netProfit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Income Breakdown */}
        {activeTab === 'income_breakdown' && (
          <div className="p-5 space-y-5">
            <h2 className="text-base font-extrabold text-slate-900">Revenue & Payment Mode Breakdown</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">POS Cash Collections</span>
                <span className="text-xl font-black text-slate-900 block mt-1">
                  {money(financialSummary?.cashSales)}
                </span>
                <span className="text-[11px] text-slate-500">
                  {(financialSummary?.grossIncome ?? 0) > 0 ? (((financialSummary?.cashSales ?? 0) / (financialSummary?.grossIncome ?? 1)) * 100).toFixed(1) : 0}% of revenue
                </span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">UPI / QR Code Digital</span>
                <span className="text-xl font-black text-emerald-700 block mt-1">
                  {money(financialSummary?.upiSales)}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {(financialSummary?.grossIncome ?? 0) > 0 ? (((financialSummary?.upiSales ?? 0) / (financialSummary?.grossIncome ?? 1)) * 100).toFixed(1) : 0}% of revenue
                </span>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase">Card & Bank POS</span>
                <span className="text-xl font-black text-blue-700 block mt-1">
                  {money(financialSummary?.cardSales)}
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">
                  {(financialSummary?.grossIncome ?? 0) > 0 ? (((financialSummary?.cardSales ?? 0) / (financialSummary?.grossIncome ?? 1)) * 100).toFixed(1) : 0}% of revenue
                </span>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Udhaar Credit Billed</span>
                <span className="text-xl font-black text-amber-700 block mt-1">
                  {money(financialSummary?.creditSales)}
                </span>
                <span className="text-[11px] text-amber-700 font-semibold">
                  {(financialSummary?.grossIncome ?? 0) > 0 ? (((financialSummary?.creditSales ?? 0) / (financialSummary?.grossIncome ?? 1)) * 100).toFixed(1) : 0}% of revenue
                </span>
              </div>
            </div>

            {/* Sales Table */}
            <div className="pt-2">
              <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-2">
                Recent Sales Receipts in Selected Period ({sales.length} total):
              </h3>
              <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Sale No</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Payment Mode</th>
                      <th className="py-2.5 px-3 text-right">Amount ({settings.currencySymbol})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sales.slice(0, 30).map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{s.saleNumber}</td>
                        <td className="py-2 px-3 text-slate-500">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{s.customerName}</td>
                        <td className="py-2 px-3 font-bold text-xs">{s.paymentMethod}</td>
                        <td className="py-2 px-3 text-right font-black text-emerald-700">{money(s.grandTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Operating Expense Breakdown */}
        {activeTab === 'expense_breakdown' && (
          <div className="p-5 space-y-5">
            <h2 className="text-base font-extrabold text-slate-900">Operating Expenses by Category</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(financialSummary.expensesByCategory).map(([cat, val]) => {
                const amount = val as number;
                const pct = financialSummary.totalOpExpenses > 0 ? (amount / financialSummary.totalOpExpenses) * 100 : 0;
                return (
                  <div key={cat} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{cat}</span>
                      <span className="text-xs font-black text-rose-600">{money(amount)}</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${Math.min(100, pct)}%` }}></div>
                    </div>

                    <span className="text-[11px] text-slate-500 block text-right font-semibold">
                      {pct.toFixed(1)}% of total expenses
                    </span>
                  </div>
                );
              })}

              {Object.keys(financialSummary.expensesByCategory).length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 font-semibold">
                  No expenses recorded in this period.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Working Capital & Credit Ledger */}
        {activeTab === 'working_capital' && (
          <div className="p-5 space-y-5">
            <h2 className="text-base font-extrabold text-slate-900">Working Capital & Credit Ledger Health</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-800 block">Total Customer Udhaar Billed</span>
                <span className="text-2xl font-black text-amber-900 block">
                  {money(financialSummary?.customerUdhaarReceivables)}
                </span>
                <span className="text-[11px] text-amber-700 font-medium">Money to be collected from customers</span>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-1">
                <span className="text-xs font-bold text-rose-800 block">Total Wholesale Supplier Payable</span>
                <span className="text-2xl font-black text-rose-900 block">
                  {money(financialSummary?.supplierUdhaarPayables)}
                </span>
                <span className="text-[11px] text-rose-700 font-medium">Money shop owes to vendors</span>
              </div>

              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 space-y-1">
                <span className="text-xs font-bold text-indigo-800 block">Net Working Capital Balance</span>
                <span className={`text-2xl font-black block ${
                  (financialSummary?.netWorkingCapital ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {money(financialSummary?.netWorkingCapital)}
                </span>
                <span className="text-[11px] text-indigo-700 font-medium">Receivables minus Payables</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
