import React, { useEffect, useState } from 'react';
import {
  Wallet,
  MessageCircle,
  Edit2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Receipt,
  Trash2
} from 'lucide-react';
import { AdminAccountItem } from '../types';
import {
  SubscriptionLedgerEntry,
  cloudListAllLedgerEntries,
  cloudSaveLedgerEntry
} from '../lib/subscriptionCloud';
import { generateSubscriptionBillText, getWhatsAppWebLink } from '../lib/whatsapp';

interface SubscriptionLedgerTabProps {
  accounts: AdminAccountItem[];
}

const DEFAULT_MONTHLY_FEE = 500;

/** Arun's own accounts (predefined test accounts + his real Deinrim Solutionss
 * signups) never appear on his own billing ledger — see feedback from the
 * session this was built in. Demo accounts (isDemo) are excluded separately. */
const OWN_USERNAMES = ['arun@gmail.com', 'apex7tech@gmail.com'];

function isBillable(acc: AdminAccountItem): boolean {
  if (acc.isDemo) return false;
  if (acc.role === 'admin') return false;
  if (OWN_USERNAMES.includes(acc.username.toLowerCase())) return false;
  return true;
}

/** Calendar months between billingStartDate and today, inclusive of the
 * starting month — i.e. billing begins immediately in the month an account's
 * ledger is first opened, then ticks up on each new calendar month. */
function monthsElapsedInclusive(startDateIso: string, now: Date = new Date()): number {
  const start = new Date(startDateIso);
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
  return Math.max(1, months);
}

const todayIso = () => new Date().toISOString().split('T')[0];

export const SubscriptionLedgerTab: React.FC<SubscriptionLedgerTabProps> = ({ accounts }) => {
  const [ledgers, setLedgers] = useState<Record<string, SubscriptionLedgerEntry>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Fee editing
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [feeDraft, setFeeDraft] = useState<number>(DEFAULT_MONTHLY_FEE);

  // Payment recording
  const [payingAccount, setPayingAccount] = useState<AdminAccountItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentNote, setPaymentNote] = useState('');

  const billableAccounts = accounts.filter(isBillable);

  const loadLedgers = async () => {
    setLoading(true);
    try {
      const existing = await cloudListAllLedgerEntries();
      const map: Record<string, SubscriptionLedgerEntry> = {};
      existing.forEach(entry => { map[entry.accountId] = entry; });

      // First time we've ever seen a billable account: start its billing
      // clock today and persist that immediately, so it doesn't silently
      // reset to "today" again on the next visit.
      const toInitialize = billableAccounts.filter(acc => !map[acc.storeId]);
      for (const acc of toInitialize) {
        const fresh: SubscriptionLedgerEntry = {
          accountId: acc.storeId,
          workspaceType: acc.workspaceType === 'service' ? 'service' : 'trading',
          storeName: acc.storeName,
          monthlyFee: DEFAULT_MONTHLY_FEE,
          billingStartDate: todayIso(),
          payments: []
        };
        map[acc.storeId] = fresh;
        cloudSaveLedgerEntry(fresh); // fire-and-forget
      }

      setLedgers(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.length]);

  const handleSaveFee = async (acc: AdminAccountItem) => {
    const entry = ledgers[acc.storeId];
    if (!entry) return;
    setSavingId(acc.storeId);
    const updated = { ...entry, monthlyFee: Math.max(0, feeDraft) };
    setLedgers(prev => ({ ...prev, [acc.storeId]: updated }));
    await cloudSaveLedgerEntry(updated);
    setSavingId(null);
    setEditingFeeId(null);
  };

  const handleRecordPayment = async () => {
    if (!payingAccount) return;
    const entry = ledgers[payingAccount.storeId];
    if (!entry || !paymentAmount || Number(paymentAmount) <= 0) return;

    setSavingId(payingAccount.storeId);
    const updated: SubscriptionLedgerEntry = {
      ...entry,
      payments: [
        ...entry.payments,
        { id: `pay-${Date.now()}`, amount: Number(paymentAmount), date: todayIso(), note: paymentNote || undefined }
      ]
    };
    setLedgers(prev => ({ ...prev, [payingAccount.storeId]: updated }));
    await cloudSaveLedgerEntry(updated);
    setSavingId(null);
    setPayingAccount(null);
    setPaymentAmount('');
    setPaymentNote('');
  };

  const handleRemovePayment = async (acc: AdminAccountItem, paymentId: string) => {
    const entry = ledgers[acc.storeId];
    if (!entry) return;
    setSavingId(acc.storeId);
    const updated = { ...entry, payments: entry.payments.filter(p => p.id !== paymentId) };
    setLedgers(prev => ({ ...prev, [acc.storeId]: updated }));
    await cloudSaveLedgerEntry(updated);
    setSavingId(null);
  };

  const handleSendWhatsAppBill = (acc: AdminAccountItem) => {
    const entry = ledgers[acc.storeId];
    if (!entry) return;
    const monthsBilled = monthsElapsedInclusive(entry.billingStartDate);
    const totalDue = monthsBilled * entry.monthlyFee;
    const totalPaid = entry.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalDue - totalPaid;

    const text = generateSubscriptionBillText({
      ownerName: acc.name,
      storeName: acc.storeName,
      monthlyFee: entry.monthlyFee,
      monthsBilled,
      totalDue,
      totalPaid,
      balance
    });
    window.open(getWhatsAppWebLink(acc.mobile, text), '_blank');
  };

  // Aggregate totals across every billable account
  let grandTotalDue = 0;
  let grandTotalPaid = 0;
  billableAccounts.forEach(acc => {
    const entry = ledgers[acc.storeId];
    if (!entry) return;
    const monthsBilled = monthsElapsedInclusive(entry.billingStartDate);
    grandTotalDue += monthsBilled * entry.monthlyFee;
    grandTotalPaid += entry.payments.reduce((sum, p) => sum + p.amount, 0);
  });
  const grandOutstanding = grandTotalDue - grandTotalPaid;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Billable Accounts</div>
          <div className="text-lg font-black text-white mt-0.5">{billableAccounts.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Billed</div>
          <div className="text-lg font-black text-blue-400 mt-0.5">₹{grandTotalDue.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Collected</div>
          <div className="text-lg font-black text-emerald-400 mt-0.5">₹{grandTotalPaid.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Outstanding</div>
          <div className={`text-lg font-black mt-0.5 ${grandOutstanding > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            ₹{grandOutstanding.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>Subscription Billing Ledger ({billableAccounts.length})</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            ₹500/month default • Demo &amp; own accounts auto-excluded
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
            Loading billing ledger...
          </div>
        ) : billableAccounts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            No billable accounts yet — real client signups will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4 text-right">Monthly Fee</th>
                  <th className="py-3 px-4 text-center">Months Billed</th>
                  <th className="py-3 px-4 text-right">Total Due</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
                {billableAccounts.map(acc => {
                  const entry = ledgers[acc.storeId];
                  if (!entry) return null;
                  const monthsBilled = monthsElapsedInclusive(entry.billingStartDate);
                  const totalDue = monthsBilled * entry.monthlyFee;
                  const totalPaid = entry.payments.reduce((sum, p) => sum + p.amount, 0);
                  const balance = totalDue - totalPaid;
                  const isEditingFee = editingFeeId === acc.storeId;
                  const isSaving = savingId === acc.storeId;

                  return (
                    <tr key={acc.storeId} className="hover:bg-slate-800/50 transition-colors align-top">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{acc.storeName}</div>
                        <div className="text-[10px] text-slate-400">{acc.name} • {acc.mobile}</div>
                        <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded border font-bold uppercase mt-1 ${
                          acc.workspaceType === 'service'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {acc.workspaceType === 'service' ? 'Service ERP' : 'Trading ERP'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isEditingFee ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min="0"
                              autoFocus
                              value={feeDraft}
                              onChange={e => setFeeDraft(Number(e.target.value))}
                              className="w-20 bg-slate-950 border border-amber-500/50 rounded-lg px-2 py-1 text-right text-white text-xs focus:outline-none"
                            />
                            <button onClick={() => handleSaveFee(acc)} className="p-1 text-emerald-400 hover:bg-slate-800 rounded cursor-pointer">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingFeeId(null)} className="p-1 text-slate-400 hover:bg-slate-800 rounded cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingFeeId(acc.storeId); setFeeDraft(entry.monthlyFee); }}
                            className="font-bold text-white hover:text-amber-400 flex items-center gap-1 ml-auto cursor-pointer"
                            title="Edit monthly fee"
                          >
                            ₹{entry.monthlyFee.toLocaleString('en-IN')}
                            <Edit2 className="w-3 h-3 text-slate-500" />
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold">{monthsBilled}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-blue-300">₹{totalDue.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-400">₹{totalPaid.toLocaleString('en-IN')}</td>
                      <td className={`py-3.5 px-4 text-right font-black ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ₹{balance.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                          <button
                            onClick={() => { setPayingAccount(acc); setPaymentAmount(balance > 0 ? balance : entry.monthlyFee); }}
                            className="p-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Record Payment"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSendWhatsAppBill(acc)}
                            className="p-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Send Bill via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {entry.payments.length > 0 && (
                          <div className="mt-2 space-y-1 text-right">
                            {entry.payments.slice(-2).map(p => (
                              <div key={p.id} className="text-[9px] text-slate-500 flex items-center justify-end gap-1">
                                <span>{p.date}: ₹{p.amount.toLocaleString('en-IN')}</span>
                                <button
                                  onClick={() => handleRemovePayment(acc, p.id)}
                                  className="text-slate-600 hover:text-rose-400 cursor-pointer"
                                  title="Remove this payment entry"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {payingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 text-white">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Record Payment — {payingAccount.storeName}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Amount Received (₹)</label>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Note (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI, Cash, cheque #..."
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setPayingAccount(null); setPaymentAmount(''); setPaymentNote(''); }}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={!paymentAmount || Number(paymentAmount) <= 0}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
