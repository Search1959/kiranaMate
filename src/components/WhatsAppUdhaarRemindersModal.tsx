import React, { useState } from 'react';
import { X, MessageCircle, Search, CreditCard, MessageSquare } from 'lucide-react';
import { Customer, StoreSettings, LanguageCode } from '../types';
import { formatMoney } from '../lib/currency';
import { getWhatsAppWebLink, getSmsLink, generateUdhaarReminderText } from '../lib/whatsapp';

interface WhatsAppUdhaarRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  settings: StoreSettings;
  lang: LanguageCode;
  onOpenCollectPayment: (customer: Customer) => void;
}

export const WhatsAppUdhaarRemindersModal: React.FC<WhatsAppUdhaarRemindersModalProps> = ({
  isOpen,
  onClose,
  customers,
  settings,
  lang,
  onOpenCollectPayment
}) => {
  const [search, setSearch] = useState('');
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);

  if (!isOpen) return null;

  const withUdhaar = customers
    .filter(c => (c.currentBalance ?? c.outstandingBalance ?? 0) > 0)
    .sort((a, b) => (b.currentBalance ?? b.outstandingBalance ?? 0) - (a.currentBalance ?? a.outstandingBalance ?? 0));

  const filtered = withUdhaar.filter(c =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  );

  const totalPending = withUdhaar.reduce((sum, c) => sum + (c.currentBalance ?? c.outstandingBalance ?? 0), 0);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-[70] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-200 text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white p-4 sm:p-5 rounded-t-3xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/25">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base">WhatsApp Udhaar Reminders</h2>
              <p className="text-xs text-emerald-100/90">
                {withUdhaar.length} customer{withUdhaar.length === 1 ? '' : 's'} owe {money(totalPending)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-emerald-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        {withUdhaar.length > 4 && (
          <div className="p-3 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search customer name or phone..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs space-y-1">
              <p className="font-bold text-sm text-slate-600">
                {withUdhaar.length === 0 ? 'No pending Udhaar — every account is clear!' : 'No customer matches your search.'}
              </p>
            </div>
          ) : (
            filtered.map(cust => (
              <div key={cust.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">{cust.name}</div>
                  <div className="text-[11px] text-slate-400">{cust.area ? `${cust.area} • ` : ''}+91 {cust.mobile}</div>
                  <div className="text-sm font-black text-red-600 mt-0.5">{money(cust.currentBalance ?? cust.outstandingBalance)}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onOpenCollectPayment(cust)}
                    className="px-2.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold"
                  >
                    Collect
                  </button>
                  <a
                    href={getWhatsAppWebLink(cust.mobile, generateUdhaarReminderText(cust, settings, lang))}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a
                    href={getSmsLink(cust.mobile, generateUdhaarReminderText(cust, settings, lang))}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl"
                    title="Send SMS Reminder"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
