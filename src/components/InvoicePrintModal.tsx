import React, { useRef } from 'react';
import { X, Printer, Share2, Store, CheckCircle2, QrCode } from 'lucide-react';
import { Sale, Order, StoreSettings } from '../types';
import { getWhatsAppWebLink, generateInvoiceWhatsAppText } from '../lib/whatsapp';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Sale | Order | null;
  settings: StoreSettings;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  data,
  settings
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const isSale = 'saleNumber' in data;
  const invNumber = isSale ? (data as Sale).saleNumber : (data as Order).orderNumber;
  const customerName = isSale ? (data as Sale).customerName : (data as Order).customerName;
  const customerMobile = isSale ? (data as Sale).customerMobile : (data as Order).customerMobile;
  const items = isSale ? (data as Sale).items : (data as Order).items;
  const grandTotal = isSale ? (data as Sale).grandTotal : (data as Order).total;
  const subtotal = isSale ? (data as Sale).subtotal : (data as Order).subtotal;
  const discount = isSale ? (data as Sale).discount : (data as Order).discount;
  const paymentMethod = isSale ? (data as Sale).paymentMethod : ((data as Order).paymentMethod || 'CASH');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-auto">
        {/* Actions Bar */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between print:hidden">
          <div className="font-bold text-xs flex items-center gap-1.5">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Store Invoice Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Print Bill
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div ref={printRef} className="p-6 text-slate-900 bg-white font-sans text-xs print:p-0 print:m-0">
          {/* Store Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">{settings.storeName}</h2>
            <p className="text-[11px] font-medium text-slate-600 leading-snug mt-0.5">{settings.tagline}</p>
            <p className="text-[10px] text-slate-600 mt-1">{settings.address}, {settings.city} - {settings.pincode}</p>
            <p className="text-[10px] font-bold text-slate-800">Phone / WhatsApp: +91 {settings.phone} {settings.gstin ? `| GSTIN: ${settings.gstin}` : ''}</p>
          </div>

          {/* Invoice Meta */}
          <div className="py-3 border-b border-slate-200 flex justify-between text-[11px]">
            <div>
              <p><strong>Invoice No:</strong> {invNumber}</p>
              <p><strong>Date:</strong> {new Date(data.createdAt).toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p><strong>Customer:</strong> {customerName}</p>
              {customerMobile && <p><strong>Mobile:</strong> +91 {customerMobile}</p>}
            </div>
          </div>

          {/* Table Items */}
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
                {items.map((item: any, idx: number) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1.5 font-semibold text-slate-900">
                      {item.productName}
                    </td>
                    <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                    <td className="py-1.5 text-right text-slate-600">₹{item.unitPrice || item.price}</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">₹{item.totalPrice || item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Totals */}
          <div className="pt-2 border-t-2 border-slate-800 space-y-1 text-right text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Saved:</span>
                <span>- ₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Grand Total:</span>
              <span>₹{grandTotal}</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1">
              Payment Mode: <strong className="text-slate-800 uppercase">{paymentMethod}</strong>
            </div>
          </div>

          {/* Footer Note & UPI QR */}
          <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">{settings.invoiceFooterNote}</p>
            <p className="text-[9px] text-slate-400">Computer Generated Cash/Credit Memo • KiranaMate Digital POS</p>
          </div>
        </div>

        {/* Footer Actions (Print/Share) */}
        {customerMobile && isSale && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-center print:hidden">
            <a
              href={getWhatsAppWebLink(customerMobile, generateInvoiceWhatsAppText(data as Sale, settings))}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Share Bill on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
