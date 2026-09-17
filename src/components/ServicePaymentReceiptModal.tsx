import React from 'react';
import { X, Printer, Receipt as ReceiptIcon } from 'lucide-react';
import { serviceStore } from '../lib/serviceStore';
import { getServiceSectorConfig } from '../lib/serviceSectorConfig';
import { ServicePayment } from '../types';
import { formatMoney, COUNTRIES } from '../lib/currency';

interface ServicePaymentReceiptModalProps {
  payment: ServicePayment | null;
  onClose: () => void;
}

export const ServicePaymentReceiptModal: React.FC<ServicePaymentReceiptModalProps> = ({ payment, onClose }) => {
  if (!payment) return null;

  const company = serviceStore.getCompanyMeta();
  const displayName = company.businessName || getServiceSectorConfig(serviceStore.getActiveSector()).name;
  const money = (v: number) => formatMoney(v, company.currencySymbol, company.currencyCode);
  const countryName = company.country === 'IN'
    ? undefined // domestic business — address/city already say enough, skip the redundant country line
    : COUNTRIES.find(c => c.code === company.country)?.name;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 my-auto">
        {/* Actions Bar */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between print:hidden">
          <div className="font-bold text-xs flex items-center gap-1.5">
            <ReceiptIcon className="w-4 h-4 text-emerald-400" />
            <span>Payment Receipt Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-300 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt */}
        <div className="print-area p-6 text-slate-900 bg-white font-sans text-xs print:p-6">
          {/* Company Letterhead */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
              {displayName}
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

          {/* Receipt Title */}
          <div className="text-center py-3">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-[11px] uppercase tracking-wide">
              Payment Receipt
            </span>
          </div>

          {/* Receipt Meta */}
          <div className="py-3 border-b border-slate-200 flex justify-between text-[11px]">
            <div>
              <p><strong>Receipt No:</strong> {payment.receiptNo}</p>
              <p><strong>Date:</strong> {new Date(payment.date).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p><strong>Received From:</strong> {payment.customerName}</p>
              <p><strong>Mode:</strong> {payment.method}</p>
            </div>
          </div>

          {/* Amount */}
          <div className="py-5 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">Amount Received</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{money(payment.amount)}</p>
          </div>

          {(payment.referenceNo || payment.notes) && (
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
              {payment.referenceNo && <p><strong>Reference / Txn ID:</strong> {payment.referenceNo}</p>}
              {payment.notes && <p><strong>Notes:</strong> {payment.notes}</p>}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Thank you for your business!</p>
            <p className="text-[9px] text-slate-400">Computer Generated Receipt • TradeMate Service ERP</p>
          </div>
        </div>
      </div>
    </div>
  );
};
