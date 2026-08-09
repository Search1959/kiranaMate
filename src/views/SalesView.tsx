import React, { useState } from 'react';
import { ShoppingCart, Search, Receipt, Plus, Ban, X, AlertTriangle } from 'lucide-react';
import { Sale, StoreSettings } from '../types';
import { formatMoney } from '../lib/currency';
import { api } from '../lib/api';

interface SalesViewProps {
  sales: Sale[];
  settings: StoreSettings;
  onOpenNewSale: () => void;
  onOpenInvoicePrint: (sale: Sale) => void;
  onRefreshData?: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  settings,
  onOpenNewSale,
  onOpenInvoicePrint,
  onRefreshData
}) => {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [voidingSale, setVoidingSale] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);

  const filteredSales = sales.filter(s => {
    const matchesSearch = !search.trim() || (
      s.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase())
    );
    const matchesPayment = paymentFilter === 'ALL' || s.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  // Voided sales stay visible in the log (audit trail) but never count toward the total shown.
  const totalAmount = filteredSales.filter(s => s.status !== 'CANCELLED').reduce((sum, s) => sum + s.grandTotal, 0);

  const handleConfirmVoid = async () => {
    if (!voidingSale) return;
    if (!voidReason.trim()) {
      alert('Please enter a reason for voiding this sale.');
      return;
    }
    setIsVoiding(true);
    try {
      await api.voidSale(voidingSale.id, voidReason.trim());
      setVoidingSale(null);
      setVoidReason('');
      onRefreshData?.();
    } catch (err: any) {
      alert(err.message || 'Failed to void sale');
    } finally {
      setIsVoiding(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 sm:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" /> Daily Counter Sales Log
          </h2>
          <p className="text-xs text-slate-500">
            Total Sales: <strong className="text-emerald-700">{money(totalAmount)}</strong> ({filteredSales.length} bills)
          </p>
        </div>

        <button
          onClick={onOpenNewSale}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> + Express 30s Sale POS
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bill number or customer name..."
            className="w-full bg-white border border-slate-300 rounded-2xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex gap-1.5">
          {['ALL', 'CASH', 'UPI', 'CREDIT'].map(p => (
            <button
              key={p}
              onClick={() => setPaymentFilter(p)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-colors ${
                paymentFilter === p ? 'bg-emerald-700 text-white' : 'bg-white border text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredSales.map(s => {
          const isVoid = s.status === 'CANCELLED';
          return (
            <div key={s.id} className={`p-4 flex items-center justify-between text-xs hover:bg-slate-50 ${isVoid ? 'opacity-60' : ''}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-slate-900 block ${isVoid ? 'line-through' : ''}`}>Bill #{s.saleNumber}</span>
                  {isVoid && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 uppercase">
                      Voided
                    </span>
                  )}
                </div>
                <span className="text-slate-600 font-medium">{s.customerName}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {(s.createdAt ? new Date(s.createdAt) : new Date()).toLocaleString('en-IN')} • {(s.items || []).length} Items
                </p>
                {isVoid && s.cancelReason && (
                  <p className="text-[10px] text-red-600 mt-0.5">Reason: {s.cancelReason}</p>
                )}
              </div>

              <div className="text-right flex items-center gap-3">
                <div>
                  <span className={`text-base font-black text-slate-900 block ${isVoid ? 'line-through' : ''}`}>{money(s.grandTotal)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    s.paymentMethod === 'CREDIT' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {s.paymentMethod}
                  </span>
                </div>

                <button
                  onClick={() => onOpenInvoicePrint(s)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                  title="Print Receipt"
                >
                  <Receipt className="w-4 h-4" />
                </button>

                {!isVoid && (
                  <button
                    onClick={() => { setVoidingSale(s); setVoidReason(''); }}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                    title="Void this sale"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Void Sale Confirmation Modal */}
      {voidingSale && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-extrabold text-base flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span>Void Sale #{voidingSale.saleNumber}</span>
              </h2>
              <button
                onClick={() => { setVoidingSale(null); setVoidReason(''); }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-800">
              This bill stays in your records (marked Voided) but its total, GST, and any Udhaar it added will be removed from your revenue and stock. Items sold ({(voidingSale.items || []).length}) will be added back to stock. This can't be undone.
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">Reason for voiding *</label>
              <textarea
                rows={2}
                required
                autoFocus
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Billed by mistake, wrong customer, duplicate entry"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => { setVoidingSale(null); setVoidReason(''); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVoid}
                disabled={isVoiding}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-md text-xs disabled:opacity-50"
              >
                {isVoiding ? 'Voiding...' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
