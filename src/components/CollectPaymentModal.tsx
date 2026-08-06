import React, { useState, useEffect } from 'react';
import { X, Receipt, CheckCircle2, Share2, Copy, DollarSign } from 'lucide-react';
import { Customer, PaymentMethod, StoreSettings } from '../types';
import { api } from '../lib/api';
import { getWhatsAppWebLink, copyToClipboard } from '../lib/whatsapp';

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomerForPayment?: Customer | null;
  settings: StoreSettings;
  onPaymentSuccess: () => void;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomerForPayment,
  settings,
  onPaymentSuccess
}) => {
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordedTx, setRecordedTx] = useState<{ amount: number; balanceAfter: number; referenceId?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (selectedCustomerForPayment) {
        setCustomerId(selectedCustomerForPayment.id);
        const bal = selectedCustomerForPayment.currentBalance ?? selectedCustomerForPayment.outstandingBalance ?? 0;
        setAmount(bal > 0 ? bal : '');
      } else {
        setCustomerId('');
        setAmount('');
      }
      setPaymentMethod('UPI');
      setNotes('');
      setRecordedTx(null);
      setCopied(false);
    }
  }, [isOpen, selectedCustomerForPayment]);

  if (!isOpen) return null;

  const currentCustomer = customers.find(c => c.id === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !amount || Number(amount) <= 0) {
      alert("Please select customer and enter valid payment amount!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.recordCustomerPayment(customerId, Number(amount), paymentMethod, notes);
      if (res.success && res.transaction) {
        setRecordedTx(res.transaction);
        onPaymentSuccess();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const receiptMsg = currentCustomer && recordedTx
    ? `Hello ${currentCustomer.name},\n\nPayment Received! Thank you for paying ₹${(recordedTx.amount ?? 0).toLocaleString('en-IN')} via ${paymentMethod}.\n\nReceipt No: ${recordedTx.referenceId || 'RCP-1001'}\nYour remaining outstanding balance with ${settings?.storeName || 'Store'} is ₹${(recordedTx.balanceAfter ?? 0).toLocaleString('en-IN')}.\n\nThank you!\n${settings?.storeName || 'Store'}`
    : '';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="bg-amber-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <Receipt className="w-5 h-5 text-amber-200" />
            <span>Collect Udhaar Payment</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-amber-700 text-amber-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {recordedTx && currentCustomer ? (
          /* Success Receipt View */
          <div className="p-5 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Payment Recorded!</h3>
            <p className="text-xs text-slate-600">
              ₹{recordedTx.amount} collected from <strong>{currentCustomer.name}</strong>
            </p>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-left space-y-1">
              <p><strong>Receipt Ref:</strong> {recordedTx.referenceId}</p>
              <p><strong>Payment Method:</strong> {paymentMethod}</p>
              <p><strong>Remaining Udhaar:</strong> <span className="font-bold text-emerald-700">₹{recordedTx.balanceAfter}</span></p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={getWhatsAppWebLink(currentCustomer.mobile, receiptMsg)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Send WhatsApp Receipt
              </a>
              <button
                onClick={() => {
                  copyToClipboard(receiptMsg);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" /> {copied ? 'Copied to Clipboard!' : 'Copy Receipt Text'}
              </button>
            </div>

            <button onClick={onClose} className="text-xs text-slate-500 font-bold underline pt-2 block mx-auto">
              Close Window
            </button>
          </div>
        ) : (
          /* Entry Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Customer</label>
              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  const cust = customers.find(c => c.id === e.target.value);
                  if (cust) {
                    const cBal = cust.currentBalance ?? cust.outstandingBalance ?? 0;
                    setAmount(cBal > 0 ? cBal : '');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => {
                  const bal = c.currentBalance ?? c.outstandingBalance ?? 0;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.area || c.address || 'Colony'}) - Pending: ₹{bal.toLocaleString('en-IN')}
                    </option>
                  );
                })}
              </select>
            </div>

            {currentCustomer && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
                <span>Current Total Udhaar:</span>
                <span className="text-sm font-extrabold text-amber-950">₹{(currentCustomer.currentBalance ?? currentCustomer.outstandingBalance ?? 0).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Amount Received (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="e.g. 500"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'CASH', 'BANK'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m as PaymentMethod)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      paymentMethod === m ? 'border-amber-600 bg-amber-50 text-amber-950' : 'border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Transaction Ref (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. PhonePe UTR #3892..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition-transform active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording Payment...' : 'RECORD PAYMENT & GET RECEIPT'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
