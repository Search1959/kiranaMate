import React from 'react';
import { X, Printer, Share2 } from 'lucide-react';
import { serviceStore } from '../lib/serviceStore';
import { ServiceInvoice } from '../types';
import { formatMoney, COUNTRIES } from '../lib/currency';

interface ServiceInvoicePrintModalProps {
  invoice: ServiceInvoice | null;
  onClose: () => void;
}

export const ServiceInvoicePrintModal: React.FC<ServiceInvoicePrintModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const company = serviceStore.getCompanyMeta();
  const money = (v: number) => formatMoney(v, company.currencySymbol, company.currencyCode);
  const countryName = company.country === 'IN'
    ? undefined // domestic business — address/city already say enough, skip the redundant country line
    : COUNTRIES.find(c => c.code === company.country)?.name;
  const isCancelled = invoice.status === 'CANCELLED';

  const handlePrint = () => window.print();
  const handleWhatsApp = () => {
    const msg = `Hello ${invoice.customerName}, your service invoice ${invoice.invoiceNo} for ${money(invoice.grandTotal)} from ${company.businessName || 'us'} is ready. Thank you!`;
    window.open(`https://wa.me/91${invoice.mobile}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-auto">
        {/* Actions Bar */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between print:hidden">
          <div className="font-bold text-xs flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Service Invoice Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-300 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice */}
        <div className="print-area p-6 text-slate-900 bg-white font-sans text-xs print:p-6">
          {/* Company Letterhead */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
              {company.businessName || 'Your Business'}
            </h2>
            {company.tagline && (
              <p className="text-[11px] font-medium text-slate-600 leading-snug mt-0.5">{company.tagline}</p>
            )}
            {(company.address || company.city || countryName) && (
              <p className="text-[10px] text-slate-600 mt-1">
                {[company.address, company.city, countryName].filter(Boolean).join(', ')}
              </p>
            )}
            <p className="text-[10px] font-bold text-slate-800">
              {company.phone ? `Phone / WhatsApp: +91 ${company.phone}` : ''}
              {company.phone && company.gstin ? ' | ' : ''}
              {company.gstin ? `GSTIN: ${company.gstin}` : ''}
            </p>
          </div>

          {/* Invoice Title */}
          <div className="text-center py-3">
            <span className={`inline-block px-4 py-1 rounded-full border font-black text-[11px] uppercase tracking-wide ${
              isCancelled ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              {isCancelled ? 'Cancelled Invoice' : 'Service Invoice'}
            </span>
          </div>

          {/* Invoice Meta */}
          <div className="py-3 border-b border-slate-200 flex justify-between text-[11px]">
            <div>
              <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
              <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p><strong>Client:</strong> {invoice.customerName}</p>
              <p><strong>Mobile:</strong> +91 {invoice.mobile}</p>
            </div>
          </div>

          {isCancelled && invoice.cancelReason && (
            <p className="pt-2 text-[11px] text-rose-600"><strong>Voided:</strong> {invoice.cancelReason}</p>
          )}

          {/* Items Table */}
          <div className="py-3">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-700 uppercase text-[10px]">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Rate</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                    <td className="py-1.5 text-right text-slate-600">{money(item.price)}</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">{money(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="pt-2 border-t-2 border-slate-800 space-y-1 text-right text-[11px]">
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount:</span>
                <span>- {money(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST:</span>
              <span>{money(invoice.gstAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Grand Total:</span>
              <span>{money(invoice.grandTotal)}</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1">
              Payment Mode: <strong className="text-slate-800 uppercase">{invoice.paymentMethod}</strong>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Thank you for your business!</p>
            <p className="text-[9px] text-slate-400">Computer Generated Invoice • TradeMate Service ERP</p>
          </div>
        </div>
      </div>
    </div>
  );
};
