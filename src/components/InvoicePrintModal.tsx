import React, { useRef, useState } from 'react';
import { X, Printer, Share2, Store, MessageSquare, Copy, Check } from 'lucide-react';
import { Sale, Order, StoreSettings } from '../types';
import { getWhatsAppWebLink, getSmsLink, generateInvoiceWhatsAppText, copyToClipboard } from '../lib/whatsapp';
import { formatMoney } from '../lib/currency';
import { amountToWordsINR } from '../lib/numberToWords';

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
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const money = (v?: number | null) => formatMoney(v, settings?.currencySymbol, settings?.currencyCode);

  const isSale = 'saleNumber' in data;
  const invNumber = isSale ? (data as Sale).saleNumber : (data as Order).orderNumber;
  const customerName = isSale ? (data as Sale).customerName : (data as Order).customerName;
  const customerMobile = isSale ? (data as Sale).customerMobile : (data as Order).customerMobile;
  const items = isSale ? (data as Sale).items : (data as Order).items;
  const grandTotal = isSale ? (data as Sale).grandTotal : (data as Order).total;
  const subtotal = isSale ? (data as Sale).subtotal : (data as Order).subtotal;
  const discount = isSale ? (data as Sale).discount : (data as Order).discount;
  const paymentMethod = isSale ? (data as Sale).paymentMethod : ((data as Order).paymentMethod || 'CASH');
  const isGstRegistered = !!settings.gstin;

  // Which optional item columns actually have data on this bill — a plain kirana
  // sale shows a short, simple table; a pharma/compliance-heavy bill shows the
  // extra columns automatically, never a column of blanks.
  const anyHsn = items.some((i: any) => i.hsn);
  const anyBatch = items.some((i: any) => i.batchNumber);
  const anyExpiry = items.some((i: any) => i.expiryDate);
  const anyMrp = items.some((i: any) => (i.mrp || 0) > 0);
  const anyGst = isSale && items.some((i: any) => (i.gstRate || 0) > 0);

  const hasSupplyBox = isGstRegistered && !!settings.state;
  // "Amount in Words" is an Indian-GST-invoice convention — only meaningful when
  // the currency actually is Rupees (or unset, which defaults to INR elsewhere).
  const showAmountInWords = !settings.currencyCode || settings.currencyCode === 'INR';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-auto">
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
        <div ref={printRef} className="p-5 sm:p-7 text-slate-900 bg-white font-sans text-xs print:p-0 print:m-0 overflow-x-auto">
          {/* Header: shop identity (left) + invoice badge & meta (right) */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{settings.storeName}</h2>
              {settings.tagline && <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">{settings.tagline}</p>}
              <p className="text-[10px] text-slate-600 mt-1">{settings.address}{settings.address ? ', ' : ''}{settings.city} {settings.pincode ? `- ${settings.pincode}` : ''}</p>
              <p className="text-[10px] text-slate-700 mt-0.5">
                {settings.phone && <>Phone / WhatsApp: <strong>+91 {settings.phone}</strong></>}
                {settings.gstin && <> {settings.phone ? '| ' : ''}GSTIN: <strong>{settings.gstin}</strong></>}
              </p>
              {settings.licenseNo && <p className="text-[10px] text-slate-700">Licence / Reg. No: <strong>{settings.licenseNo}</strong></p>}
            </div>

            <div className="shrink-0 text-right">
              <span className="inline-block bg-emerald-700 text-white text-[11px] font-black tracking-wide px-3 py-1 rounded-lg uppercase">
                {isGstRegistered ? 'Tax Invoice' : 'Sales Invoice'}
              </span>
              <div className="mt-2 text-[10px] space-y-0.5">
                <p><span className="text-slate-500">Invoice No: </span><strong className="text-slate-900">{invNumber}</strong></p>
                <p><span className="text-slate-500">Date &amp; Time: </span><strong className="text-slate-900">{new Date(data.createdAt).toLocaleString('en-IN')}</strong></p>
                <p><span className="text-slate-500">Payment Mode: </span><strong className="text-slate-900 uppercase">{paymentMethod}</strong></p>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-emerald-700" />

          {/* Billed-to / supply-details boxes */}
          <div className={`grid gap-3 py-4 ${hasSupplyBox ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wide mb-1.5">Billed To</p>
              <p><span className="text-slate-500">Name: </span><strong>{customerName}</strong></p>
              {customerMobile && <p><span className="text-slate-500">Phone: </span><strong>+91 {customerMobile}</strong></p>}
              {isSale && (data as Sale).customerGstin && (
                <p><span className="text-slate-500">Customer GSTIN: </span><strong>{(data as Sale).customerGstin}</strong></p>
              )}
            </div>
            {hasSupplyBox && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wide mb-1.5">Tax &amp; Supply Details</p>
                <p><span className="text-slate-500">Place of Supply: </span><strong>{settings.state}</strong></p>
              </div>
            )}
          </div>

          {/* Item Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-600 uppercase text-[9px]">
                  <th className="py-1.5 pr-2 w-6">#</th>
                  <th className="py-1.5 pr-2">Item Description</th>
                  {anyHsn && <th className="py-1.5 pr-2">HSN</th>}
                  {anyBatch && <th className="py-1.5 pr-2">Batch</th>}
                  {anyExpiry && <th className="py-1.5 pr-2">Expiry</th>}
                  <th className="py-1.5 pr-2 text-center">Qty</th>
                  {anyMrp && <th className="py-1.5 pr-2 text-right">MRP</th>}
                  <th className="py-1.5 pr-2 text-right">Rate</th>
                  {anyGst && <th className="py-1.5 pr-2 text-right">GST</th>}
                  <th className="py-1.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1.5 pr-2 text-slate-500">{idx + 1}</td>
                    <td className="py-1.5 pr-2 font-semibold text-slate-900">{item.productName}</td>
                    {anyHsn && <td className="py-1.5 pr-2 text-slate-600">{item.hsn || '—'}</td>}
                    {anyBatch && <td className="py-1.5 pr-2 text-slate-600">{item.batchNumber || '—'}</td>}
                    {anyExpiry && <td className="py-1.5 pr-2 text-slate-600">{item.expiryDate || '—'}</td>}
                    <td className="py-1.5 pr-2 text-center font-bold">{item.quantity}</td>
                    {anyMrp && <td className="py-1.5 pr-2 text-right text-slate-500">{item.mrp ? money(item.mrp) : '—'}</td>}
                    <td className="py-1.5 pr-2 text-right text-slate-600">{money(item.unitPrice ?? item.price)}</td>
                    {anyGst && <td className="py-1.5 pr-2 text-right text-slate-600">{item.gstRate ? `${item.gstRate}%` : '—'}</td>}
                    <td className="py-1.5 text-right font-bold text-slate-900">{money(item.totalPrice ?? item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes/Terms (left) + Totals (right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-3">
              {settings.invoiceFooterNote && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-[10px] text-slate-600">{settings.invoiceFooterNote}</p>
                </div>
              )}
              {showAmountInWords && (
                <div className="border-l-4 border-emerald-600 pl-2.5 py-0.5 text-[10px] text-slate-600">
                  <span className="font-bold text-slate-700">Amount in Words: </span>
                  {amountToWordsINR(grandTotal)}
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{money(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount Saved:</span>
                  <span>- {money(discount)}</span>
                </div>
              )}

              {isSale && (data as Sale).totalTaxAmount && (data as Sale).totalTaxAmount! > 0 ? (
                <>
                  {(data as Sale).taxableAmount ? (
                    <div className="flex justify-between text-slate-600">
                      <span>Taxable Amount:</span>
                      <span>{money((data as Sale).taxableAmount)}</span>
                    </div>
                  ) : null}
                  {(data as Sale).cgstAmount && (data as Sale).cgstAmount! > 0 ? (
                    <div className="flex justify-between text-slate-600">
                      <span>CGST:</span>
                      <span>{money((data as Sale).cgstAmount)}</span>
                    </div>
                  ) : null}
                  {(data as Sale).sgstAmount && (data as Sale).sgstAmount! > 0 ? (
                    <div className="flex justify-between text-slate-600">
                      <span>SGST:</span>
                      <span>{money((data as Sale).sgstAmount)}</span>
                    </div>
                  ) : null}
                  {(data as Sale).igstAmount && (data as Sale).igstAmount! > 0 ? (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST:</span>
                      <span>{money((data as Sale).igstAmount)}</span>
                    </div>
                  ) : null}
                </>
              ) : null}

              <div className="flex justify-between items-center text-sm font-black text-emerald-800 bg-emerald-50 -mx-3.5 px-3.5 py-2 mt-1.5 border-t-2 border-emerald-700">
                <span>Grand Total:</span>
                <span>{money(grandTotal)}</span>
              </div>

              {isSale && (data as Sale).receivedAmount && (data as Sale).receivedAmount! > 0 ? (
                <div className="flex justify-between text-slate-700 font-bold pt-1">
                  <span>Amount Received:</span>
                  <span>{money((data as Sale).receivedAmount)}</span>
                </div>
              ) : null}
              {isSale && (data as Sale).changeAmount && (data as Sale).changeAmount! > 0 ? (
                <div className="flex justify-between text-emerald-700 font-extrabold">
                  <span>Change Returned:</span>
                  <span>{money((data as Sale).changeAmount)}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-10 text-center text-[10px] text-slate-500">
            <div className="border-t border-slate-400 pt-1.5">Customer's Signature</div>
            <div className="border-t border-slate-400 pt-1.5">
              For {settings.storeName}
              <br />
              <span className="text-slate-400">Authorised Signatory</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-center text-[9px] text-slate-400">
            Computer Generated {isGstRegistered ? 'Tax Invoice' : 'Invoice'} • TradeMate Universal POS
          </div>
        </div>

        {/* Footer Actions (Print/Share) */}
        {customerMobile && isSale && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 justify-center print:hidden">
            <a
              href={getWhatsAppWebLink(customerMobile, generateInvoiceWhatsAppText(data as Sale, settings))}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" /> WhatsApp
            </a>

            <a
              href={getSmsLink(customerMobile, generateInvoiceWhatsAppText(data as Sale, settings))}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5"
              title="Send via standard mobile SMS Text"
            >
              <MessageSquare className="w-4 h-4" /> SMS Text
            </a>

            <button
              onClick={() => {
                copyToClipboard(generateInvoiceWhatsAppText(data as Sale, settings));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
