import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { DailyStats, Product, Customer } from '../types';

interface BusinessHealthCardProps {
  stats: DailyStats | null;
  products: Product[];
  customers: Customer[];
  onNavigateToTab: (tab: string) => void;
}

export const BusinessHealthCard: React.FC<BusinessHealthCardProps> = ({
  stats,
  products,
  customers,
  onNavigateToTab
}) => {
  // 1. Calculate Profitability Score (30 pts)
  const todayProfit = stats?.estimatedProfitToday || 0;
  const profitScore = todayProfit > 2000 ? 30 : todayProfit > 500 ? 22 : todayProfit > 0 ? 15 : 5;

  // 2. Calculate Stock Health Score (30 pts)
  const totalItems = products.length || 1;
  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;
  const deadStockCount = products.filter(p => p.currentStock === 0).length;
  const stockHealthRatio = Math.max(0, (totalItems - lowStockCount - (deadStockCount * 2)) / totalItems);
  const stockScore = Math.round(stockHealthRatio * 30);

  // 3. Calculate Udhaar Recovery Score (20 pts)
  const pendingUdhaar = stats?.totalPendingUdhaar || 0;
  const todayCollection = stats?.todayCollection || 0;
  const recoveryRatio = pendingUdhaar > 0 ? (todayCollection / (pendingUdhaar + todayCollection)) : 1;
  const creditScore = Math.round(Math.min(20, Math.max(8, recoveryRatio * 20 + 10)));

  // 4. Calculate Sales Activity Score (20 pts)
  const todaySales = stats.todaySalesTotal || 0;
  const salesScore = todaySales > 10000 ? 20 : todaySales > 3000 ? 16 : todaySales > 0 ? 10 : 5;

  // Total Health Score (0 - 100)
  const totalScore = Math.min(100, Math.max(45, profitScore + stockScore + creditScore + salesScore));

  let healthLabel = 'Good';
  let healthColor = 'text-blue-600 bg-blue-50 border-blue-200';
  let healthBar = 'bg-blue-600';

  if (totalScore >= 85) {
    healthLabel = 'Excellent';
    healthColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    healthBar = 'bg-emerald-500';
  } else if (totalScore >= 70) {
    healthLabel = 'Strong';
    healthColor = 'text-teal-700 bg-teal-50 border-teal-200';
    healthBar = 'bg-teal-500';
  } else if (totalScore < 60) {
    healthLabel = 'Needs Attention';
    healthColor = 'text-amber-700 bg-amber-50 border-amber-200';
    healthBar = 'bg-amber-500';
  }

  // Generate actionable AI suggestions based on live data
  const suggestions = [];
  if (lowStockCount > 0) {
    suggestions.push({
      text: `${lowStockCount} items are below min reorder level. Reorder soon to avoid lost sales.`,
      actionTab: 'products',
      actionLabel: 'Restock'
    });
  }
  if (pendingUdhaar > 5000) {
    suggestions.push({
      text: `₹${pendingUdhaar.toLocaleString('en-IN')} pending in Udhaar Khata. Send WhatsApp reminders today.`,
      actionTab: 'customers',
      actionLabel: 'Send Reminders'
    });
  }
  if (todayProfit > 0) {
    suggestions.push({
      text: `Net profit is ₹${todayProfit.toLocaleString('en-IN')} today. Cashflow is stable.`,
      actionTab: 'reports',
      actionLabel: 'View Profit'
    });
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white border border-slate-700 shadow-xl relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                AI Business Health
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${healthColor}`}>
                {healthLabel}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-0.5">Overall Store Health Rating</h3>
          </div>
        </div>

        {/* Health Meter Display */}
        <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-700/60">
          <div className="text-right">
            <div className="text-2xl font-black text-emerald-400">{totalScore}%</div>
            <div className="text-[10px] text-slate-400">Score Rating</div>
          </div>
          <div className="w-16 bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div className={`h-full rounded-full transition-all duration-500 ${healthBar}`} style={{ width: `${totalScore}%` }} />
          </div>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-b border-slate-700/60 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block">Profitability</span>
          <span className="font-bold text-white">{profitScore}/30 pts</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Stock Health</span>
          <span className="font-bold text-white">{stockScore}/30 pts</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Udhaar Recovery</span>
          <span className="font-bold text-white">{creditScore}/20 pts</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Sales Activity</span>
          <span className="font-bold text-white">{salesScore}/20 pts</span>
        </div>
      </div>

      {/* Actionable AI Recommendations */}
      <div className="pt-3 space-y-2">
        <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> AI Optimization Suggestions:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestions.map((s, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-700/70 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-200 text-[11px] leading-tight pr-2">{s.text}</span>
              <button
                onClick={() => onNavigateToTab(s.actionTab)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>{s.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
