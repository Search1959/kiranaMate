import React, { useState } from 'react';
import { TrendingDown, Plus, Search, Receipt, Calendar, CreditCard, Repeat } from 'lucide-react';
import { serviceStore, SERVICE_EXPENSE_CATEGORIES } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { AddServiceExpenseModal } from '../../components/AddServiceExpenseModal';

export const ServiceExpensesView: React.FC = () => {
  const activeSector = serviceStore.getActiveSector();
  const cfg = getServiceSectorConfig(activeSector);
  const expenses = serviceStore.getExpenses();
  const stats = serviceStore.getStats();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const recurringTotal = expenses.filter(e => e.isRecurring).reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesSearch =
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.payeeName && e.payeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categoriesInUse = Array.from(new Set(expenses.map(e => e.category)));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-400" />
            <span>Service Business Expenses</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track staff salary, rent, subscriptions & operating costs for {cfg.name}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Expense</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Expenses</p>
          <p className="text-xl font-black text-rose-400 mt-1">₹{stats.totalExpenses.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{expenses.length} entries logged</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Today's Expense</p>
          <p className="text-xl font-black text-amber-400 mt-1">₹{stats.todayExpenses.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Logged today</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Recurring Fixed Costs</p>
          <p className="text-xl font-black text-indigo-400 mt-1">₹{recurringTotal.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Salary, rent, subscriptions</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Net Profit (Income − Exp.)</p>
          <p className={`text-xl font-black mt-1 ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{stats.netProfit.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Revenue vs. operating cost</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by payee, category or notes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="sm:w-56">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="ALL">All Categories ({expenses.length})</option>
              {categoriesInUse.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'ALL' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {SERVICE_EXPENSE_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat ? 'bg-rose-600 text-white shadow-xs font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-700" />
            <p className="font-bold text-sm text-slate-300">No expenses found</p>
            <p className="text-xs text-slate-500">Try clearing your search filter or record a new expense.</p>
          </div>
        ) : (
          filteredExpenses.map(exp => (
            <div key={exp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-white text-sm">{exp.payeeName || exp.category}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30">
                    {exp.category}
                  </span>
                  {exp.isRecurring && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <Repeat className="w-3 h-3" /> Recurring
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{exp.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {exp.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <CreditCard className="w-3 h-3" /> Paid via {exp.paymentMethod}
                  </span>
                  <span>•</span>
                  <span>Logged by {exp.recordedBy}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-black text-rose-400">₹{exp.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <AddServiceExpenseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={() => setShowModal(false)}
      />
    </div>
  );
};
