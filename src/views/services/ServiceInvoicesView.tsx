import React, { useState } from 'react';
import { FileText, Search, Printer, Share2, Pencil, Ban } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { ServiceInvoice, PaymentMethod } from '../../types';

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'UPI', 'BANK', 'OTHER'];

export const ServiceInvoicesView: React.FC = () => {
  const activeSector = serviceStore.getActiveSector();
  const cfg = getServiceSectorConfig(activeSector);
  const [refreshTick, setRefreshTick] = useState(0);
  const invoices = serviceStore.getInvoices();

  const [search, setSearch] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<ServiceInvoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<ServiceInvoice | null>(null);
  const [editForm, setEditForm] = useState({ customerName: '', mobile: '', paymentMethod: 'CASH' as PaymentMethod, notes: '' });
  const [voidingInvoice, setVoidingInvoice] = useState<ServiceInvoice | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const filtered = invoices.filter(inv =>
    inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
    inv.mobile.includes(search)
  );

  const openEdit = (inv: ServiceInvoice) => {
    setEditingInvoice(inv);
    setEditForm({ customerName: inv.customerName, mobile: inv.mobile, paymentMethod: inv.paymentMethod, notes: inv.notes || '' });
  };

  const saveEdit = () => {
    if (!editingInvoice) return;
    serviceStore.updateInvoice(editingInvoice.id, editForm);
    setEditingInvoice(null);
    setRefreshTick(t => t + 1);
  };

  const confirmVoid = () => {
    if (!voidingInvoice) return;
    serviceStore.voidInvoice(voidingInvoice.id, voidReason.trim() || 'No reason given');
    setVoidingInvoice(null);
    setVoidReason('');
    setRefreshTick(t => t + 1);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Service GST Invoices</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">View, print & share GST compliant service invoices for {cfg.name}</p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice # or client name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center text-xs text-slate-500 py-10">No invoices yet — they're created automatically from Service POS billing or by converting a quotation.</div>
        )}
        {filtered.map(inv => {
          const isCancelled = inv.status === 'CANCELLED';
          return (
          <div key={inv.id} className={`bg-slate-900 border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isCancelled ? 'border-rose-800/60 opacity-70' : 'border-slate-800'}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-400">{inv.invoiceNo}</span>
                <span className="text-[10px] text-slate-400">{inv.date}</span>
                {isCancelled ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase">
                    Cancelled
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {inv.paymentMethod}
                  </span>
                )}
              </div>
              <h3 className={`text-xs font-bold mt-1 ${isCancelled ? 'text-slate-400 line-through' : 'text-white'}`}>{inv.customerName} ({inv.mobile})</h3>
              {isCancelled && inv.cancelReason && (
                <p className="text-[10px] text-rose-400 mt-0.5">Voided: {inv.cancelReason}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">Grand Total</p>
                <p className={`text-sm font-black ${isCancelled ? 'text-slate-500 line-through' : 'text-emerald-400'}`}>₹{inv.grandTotal}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 cursor-pointer"
                  title="View & Print"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => {
                    const msg = `Hi ${inv.customerName}, your service invoice ${inv.invoiceNo} for ₹${inv.grandTotal} from ${cfg.name} is ready. Thank you!`;
                    window.open(`https://wa.me/91${inv.mobile}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                </button>
                {!isCancelled && (
                  <>
                    <button
                      onClick={() => openEdit(inv)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 cursor-pointer"
                      title="Edit Client / Payment / Notes"
                    >
                      <Pencil className="w-4 h-4 text-amber-400" />
                    </button>
                    <button
                      onClick={() => { setVoidingInvoice(inv); setVoidReason(''); }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 cursor-pointer"
                      title="Void Invoice"
                    >
                      <Ban className="w-4 h-4 text-rose-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-sm font-bold">Invoice Details ({selectedInvoice.invoiceNo})</h3>

            <div className="bg-slate-800/80 p-3 rounded-xl space-y-2 text-xs border border-slate-700">
              <p><strong>Client:</strong> {selectedInvoice.customerName} ({selectedInvoice.mobile})</p>
              <p><strong>Date:</strong> {selectedInvoice.date}</p>
              {selectedInvoice.status === 'CANCELLED' && (
                <p className="text-rose-400"><strong>Cancelled:</strong> {selectedInvoice.cancelReason}</p>
              )}
              <div className="pt-2 border-t border-slate-700 space-y-1">
                {selectedInvoice.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300">
                    <span>{it.name} x{it.quantity}</span>
                    <span>₹{it.total}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-emerald-400">
                <span>Total Amount:</span>
                <span>₹{selectedInvoice.grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {editingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-sm font-bold">Edit Invoice ({editingInvoice.invoiceNo})</h3>
            <p className="text-[11px] text-slate-400 -mt-2">
              Only client details, payment method & notes can be changed — line items and amounts stay fixed once issued, to keep GST records accurate. To fix an amount, void this invoice and create a new one.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Client Name</label>
                <input
                  type="text"
                  value={editForm.customerName}
                  onChange={e => setEditForm(f => ({ ...f, customerName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Mobile</label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={e => setEditForm(f => ({ ...f, mobile: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={editForm.paymentMethod}
                  onChange={e => setEditForm(f => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                >
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditingInvoice(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {voidingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/60 rounded-2xl max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-400" />
              Void Invoice ({voidingInvoice.invoiceNo})?
            </h3>
            <p className="text-[11px] text-slate-400">
              The invoice stays in your records marked as cancelled (required for GST audit trail) — it won't be deleted, just excluded from active billing.
            </p>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Reason (optional)</label>
              <textarea
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                rows={2}
                placeholder="e.g. Duplicate entry, wrong client, billing error..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setVoidingInvoice(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Keep Invoice
              </button>
              <button
                onClick={confirmVoid}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Void It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
