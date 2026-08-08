import React from 'react';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Award, Calendar } from 'lucide-react';
import { DailyStats, Product, Sale, StoreSettings } from '../types';
import { formatMoney } from '../lib/currency';

interface ReportsViewProps {
  stats: DailyStats;
  products: Product[];
  sales: Sale[];
  settings: StoreSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  stats,
  products,
  sales,
  settings
}) => {
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);
  const topSellingProducts = [...products]
    .sort((a, b) => ((b as any).salesCount || 0) - ((a as any).salesCount || 0))
    .slice(0, 5);

  const exportReportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Report Metric,Value\n" +
      `Today Sales Total,${money(stats.todaySalesTotal)}\n` +
      `Cash Sales,${money(stats.cashSales)}\n` +
      `UPI Sales,${money(stats.upiSales)}\n` +
      `Total Outstanding Udhaar,${money(stats.totalPendingUdhaar)}\n` +
      `Today Udhaar Collection,${money(stats.todayCollection)}\n` +
      `Today Expenses,${money(stats.todayExpenses)}\n` +
      `Estimated Net Profit,${money(stats.estimatedProfitToday)}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trademate_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12 sm:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" /> Financial Reports & P&L Statement
          </h2>
          <p className="text-xs text-slate-500">
            Real-time Kirana store profit & loss breakdown
          </p>
        </div>

        <button
          onClick={exportReportCSV}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Report (CSV)
        </button>
      </div>

      {/* P&L Statement Card */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-amber-400 border-b border-slate-800 pb-2">
          Today's Profit & Loss Statement (P&L)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
            <span className="text-slate-400 text-[10px] block">Gross Sales</span>
            <span className="text-lg font-black text-emerald-400">{money(stats.todaySalesTotal)}</span>
          </div>

          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
            <span className="text-slate-400 text-[10px] block">Expenses Logged</span>
            <span className="text-lg font-black text-rose-400">{money(stats.todayExpenses)}</span>
          </div>

          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
            <span className="text-slate-400 text-[10px] block">Margin Ratio</span>
            <span className="text-lg font-black text-blue-400">~15.5%</span>
          </div>

          <div className="bg-amber-400 text-slate-950 p-3 rounded-2xl font-bold">
            <span className="text-slate-900 text-[10px] uppercase font-bold block">Net Estimated Profit</span>
            <span className="text-xl font-black text-emerald-950">{money(stats.estimatedProfitToday)}</span>
          </div>
        </div>
      </div>

      {/* Top 5 Best Selling Items */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" /> Top Fast-Moving Kirana Items
        </h3>

        <div className="divide-y divide-slate-100">
          {topSellingProducts.map((p, idx) => (
            <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 font-extrabold text-slate-700 flex items-center justify-center text-[11px]">
                  #{idx + 1}
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">{p.name}</span>
                  <span className="text-[10px] text-slate-400">{p.category}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-emerald-700 block">{(p as any).salesCount || 0} sold</span>
                <span className="text-[10px] text-slate-500">{money(p.sellingPrice)} each</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
