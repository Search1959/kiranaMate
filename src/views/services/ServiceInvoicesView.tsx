import React, { useState } from 'react';
import { FileText, Search, Printer, Share2, IndianRupee } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { ServiceInvoice } from '../../types';

export const ServiceInvoicesView: React.FC = () => {
  const activeSector = serviceStore.getActiveSector();
  const cfg = getServiceSectorConfig(activeSector);
  const invoices = serviceStore.getInvoices();

  const [search, setSearch] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<ServiceInvoice | null>(null);

  const filtered = invoices.filter(inv =>
    inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
    inv.mobile.includes(search)
  );

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
        {filtered.map(inv => (
          <div key={inv.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-400">{inv.invoiceNo}</span>
                <span className="text-[10px] text-slate-400">{inv.date}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {inv.paymentMethod}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mt-1">{inv.customerName} ({inv.mobile})</h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">Grand Total</p>
                <p className="text-sm font-black text-emerald-400">₹{inv.grandTotal}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => {
                    const msg = `Hi ${inv.customerName}, your service invoice ${inv.invoiceNo} for ₹${inv.grandTotal} from ${cfg.name} is ready. Thank you!`;
                    window.open(`https://wa.me/91${inv.mobile}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-sm font-bold">Invoice Details ({selectedInvoice.invoiceNo})</h3>

            <div className="bg-slate-800/80 p-3 rounded-xl space-y-2 text-xs border border-slate-700">
              <p><strong>Client:</strong> {selectedInvoice.customerName} ({selectedInvoice.mobile})</p>
              <p><strong>Date:</strong> {selectedInvoice.date}</p>
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
    </div>
  );
};
