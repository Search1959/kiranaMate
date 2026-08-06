import React, { useState } from 'react';
import {
  TrendingDown,
  Plus,
  DollarSign,
  Search,
  Filter,
  Sparkles,
  Zap,
  Coffee,
  Truck,
  Building2,
  Package,
  Users,
  Wrench,
  Wifi,
  Receipt,
  Calendar,
  CreditCard,
  Repeat
} from 'lucide-react';
import { Expense } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  onOpenAddExpense: () => void;
  onRefreshData?: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onOpenAddExpense
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const todayStr = new Date().toISOString().split('T')[0];

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const todayExpense = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);
  const recurringExpenseTotal = expenses
    .filter(e => e.isRecurring)
    .reduce((sum, e) => sum + e.amount, 0);

  // Filtered List
  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesSearch =
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.payeeName && e.payeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.receiptNo && e.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(expenses.map(e => e.category)));

  return (
    <div className="space-y-4 pb-12 sm:pb-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span>Daily Shop Expenses & Operational Cost Tracker</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track rent, EB power, transport freight, staff wages & daily chai expenses
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="bg-rose-700 hover:bg-rose-800 text-white font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>RECORD NEW EXPENSE</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Expenses Logged</div>
          <div className="text-xl font-black text-rose-700 mt-1">₹{(totalExpense ?? 0).toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{expenses.length} total entries</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Expense</div>
          <div className="text-xl font-black text-amber-600 mt-1">₹{(todayExpense ?? 0).toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Logged today</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recurring Fixed Costs</div>
          <div className="text-xl font-black text-purple-700 mt-1">₹{(recurringExpenseTotal ?? 0).toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Rent, EB, Wi-Fi, Wages</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average / Entry</div>
          <div className="text-xl font-black text-slate-800 mt-1">
            ₹{expenses.length > 0 ? Math.round((totalExpense ?? 0) / expenses.length).toLocaleString('en-IN') : 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Per expense transaction</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by payee, category, receipt # or notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="ALL">All Categories ({expenses.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {['Rent', 'Electricity', 'Delivery/Transport', 'Staff Salary', 'Packaging', 'Tea & Snacks', 'Maintenance', 'Wi-Fi & Telecom'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-700 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-sm text-slate-600">No shop expenses found</p>
            <p className="text-xs text-slate-400">Try clearing your search filter or record a new expense.</p>
          </div>
        ) : (
          filteredExpenses.map(exp => (
            <div key={exp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-900 text-sm">
                    {exp.payeeName || exp.category}
                  </span>

                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                    {exp.category}
                  </span>

                  {exp.isRecurring && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <Repeat className="w-3 h-3" /> Recurring
                    </span>
                  )}

                  {exp.receiptNo && (
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Ref: {exp.receiptNo}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium">{exp.description}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> {exp.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <CreditCard className="w-3 h-3 text-slate-400" /> Paid via {exp.paymentMethod}
                  </span>
                  <span>•</span>
                  <span>Logged by {exp.recordedBy}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-black text-rose-700">
                  ₹{(exp.amount ?? 0).toLocaleString('en-IN')}
                </span>
                {exp.gstAmount && exp.gstAmount > 0 ? (
                  <div className="text-[10px] font-semibold text-emerald-700">
                    Includes ₹{exp.gstAmount} Tax/GST
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
