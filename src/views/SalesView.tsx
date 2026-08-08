import React, { useState } from 'react';
import { ShoppingCart, Search, Receipt, Plus } from 'lucide-react';
import { Sale, StoreSettings } from '../types';
import { formatMoney } from '../lib/currency';

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
  onOpenInvoicePrint
}) => {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);

  const filteredSales = sales.filter(s => {
    const matchesSearch = !search.trim() || (
      s.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase())
    );
    const matchesPayment = paymentFilter === 'ALL' || s.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const totalAmount = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);

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
        {filteredSales.map(s => (
          <div key={s.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
            <div>
              <span className="font-bold text-slate-900 block">Bill #{s.saleNumber}</span>
              <span className="text-slate-600 font-medium">{s.customerName}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {(s.createdAt ? new Date(s.createdAt) : new Date()).toLocaleString('en-IN')} • {(s.items || []).length} Items
              </p>
            </div>

            <div className="text-right flex items-center gap-3">
              <div>
                <span className="text-base font-black text-slate-900 block">{money(s.grandTotal)}</span>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
