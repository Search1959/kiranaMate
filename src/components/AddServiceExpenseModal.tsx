import React, { useState } from 'react';
import {
  X,
  TrendingDown,
  Check,
  RefreshCw,
  Users,
  Building2,
  Laptop,
  Megaphone,
  Car,
  Wrench,
  Wifi,
  ShieldCheck,
  Landmark,
  Receipt,
  Tag,
  DollarSign
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { serviceStore } from '../lib/serviceStore';

interface AddServiceExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  recordedBy?: string;
  /** Pass an existing expense to edit it instead of creating a new one. */
  editingExpense?: Expense | null;
}

const SERVICE_EXPENSE_CATEGORY_META: { label: ExpenseCategory | string; icon: any; color: string }[] = [
  { label: 'Staff Salary', icon: Users, color: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' },
  { label: 'Office/Shop Rent', icon: Building2, color: 'bg-purple-500/10 border-purple-500/40 text-purple-300' },
  { label: 'Software & Subscriptions', icon: Laptop, color: 'bg-sky-500/10 border-sky-500/40 text-sky-300' },
  { label: 'Marketing & Advertising', icon: Megaphone, color: 'bg-pink-500/10 border-pink-500/40 text-pink-300' },
  { label: 'Travel & Conveyance', icon: Car, color: 'bg-blue-500/10 border-blue-500/40 text-blue-300' },
  { label: 'Equipment & Supplies', icon: Wrench, color: 'bg-rose-500/10 border-rose-500/40 text-rose-300' },
  { label: 'Internet & Phone', icon: Wifi, color: 'bg-teal-500/10 border-teal-500/40 text-teal-300' },
  { label: 'Insurance', icon: ShieldCheck, color: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' },
  { label: 'Bank & Payment Gateway Fees', icon: Landmark, color: 'bg-amber-500/10 border-amber-500/40 text-amber-300' },
  { label: 'Taxes & Licenses', icon: Receipt, color: 'bg-slate-500/10 border-slate-500/40 text-slate-300' },
  { label: 'Other', icon: Tag, color: 'bg-gray-500/10 border-gray-500/40 text-gray-300' }
];

export const AddServiceExpenseModal: React.FC<AddServiceExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  recordedBy = 'Owner',
  editingExpense
}) => {
  const isEditing = !!editingExpense;
  const [category, setCategory] = useState<ExpenseCategory | string>('Staff Salary');
  const [payeeName, setPayeeName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    if (editingExpense) {
      setCategory(editingExpense.category);
      setPayeeName(editingExpense.payeeName || '');
      setAmount(editingExpense.amount);
      setDate(editingExpense.date);
      setDescription(editingExpense.description || '');
      setPaymentMethod(editingExpense.paymentMethod);
      setIsRecurring(!!editingExpense.isRecurring);
    } else {
      setCategory('Staff Salary');
      setPayeeName('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setPaymentMethod('UPI');
      setIsRecurring(false);
    }
  }, [isOpen, editingExpense]);

  if (!isOpen) return null;

  const handleQuickAddAmount = (addVal: number) => {
    const current = typeof amount === 'number' ? amount : 0;
    setAmount(current + addVal);
  };

  const resetForm = () => {
    setCategory('Staff Salary');
    setPayeeName('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setPaymentMethod('UPI');
    setIsRecurring(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid expense amount!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editingExpense) {
        serviceStore.updateExpense(editingExpense.id, {
          category,
          amount: Number(amount),
          date,
          description: description || `Business expense: ${category}`,
          paymentMethod,
          payeeName: payeeName || undefined,
          isRecurring
        });
      } else {
        const fullDescription = [
          payeeName ? `Paid To: ${payeeName}` : null,
          description || `Business expense: ${category}`,
          isRecurring ? '[Monthly Recurring]' : null
        ].filter(Boolean).join(' • ');

        serviceStore.addExpense({
          category,
          amount: Number(amount),
          date,
          description: fullDescription,
          paymentMethod,
          payeeName: payeeName || undefined,
          isRecurring,
          recordedBy
        });
      }

      resetForm();
      onSaved();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-rose-200 border border-white/20">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <span>{isEditing ? 'Edit Service Expense' : 'Record Service Expense'}</span>
              </h2>
              <p className="text-xs text-rose-100/80">{isEditing ? 'Fix a wrongly entered amount, category, or note' : 'Log salary, rent, subscriptions & operating costs'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-rose-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs text-white">
          {/* Category Selection */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Expense Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SERVICE_EXPENSE_CATEGORY_META.map(cat => {
                const IconComp = cat.icon;
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`p-2.5 rounded-xl border font-bold text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected ? `${cat.color} ring-2 ring-rose-500/40 shadow-xs` : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? '' : 'text-slate-500'}`} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount */}
          <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-rose-400" />
                <span>Amount Spent (₹) *</span>
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Add:</span>
                {[500, 1000, 5000, 10000].map(addVal => (
                  <button
                    key={addVal}
                    type="button"
                    onClick={() => handleQuickAddAmount(addVal)}
                    className="px-2 py-0.5 bg-slate-800 border border-rose-500/30 text-rose-300 font-bold text-[10px] rounded-lg hover:bg-rose-500/10 cursor-pointer"
                  >
                    +{addVal}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter amount e.g. 5000"
              className="w-full bg-slate-800 border border-rose-500/30 rounded-xl px-4 py-2.5 text-lg font-black text-rose-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          {/* Payee & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Paid To (Vendor / Person)</label>
              <input
                type="text"
                value={payeeName}
                onChange={e => setPayeeName(e.target.value)}
                placeholder="e.g. Google Ads, Landlord, Staff Name"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-medium text-white placeholder:text-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Expense Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-medium text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-bold text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer / NEFT</option>
                <option value="OTHER">Card / Cheque</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 border-slate-600"
                />
                <span className="font-bold text-slate-200">Recurring Fixed Expense</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Notes / Reason / Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Meta Ads campaign spend for August"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Save Expense'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
