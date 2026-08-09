import React, { useState } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Scan,
  CheckCircle2,
  Printer,
  Share2,
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Product, Customer, PaymentMethod, PaymentStatus, Sale, StoreSettings } from '../types';
import { api } from '../lib/api';
import { getWhatsAppWebLink, getSmsLink, generateInvoiceWhatsAppText, copyToClipboard } from '../lib/whatsapp';
import { formatMoney } from '../lib/currency';

interface MobilePosViewProps {
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  onOpenBarcodeScanner: () => void;
  onSaleSuccess: () => void;
  onOpenInvoicePrint: (sale: Sale) => void;
  onClose: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  mrp: number;
}

const PAYMENT_OPTIONS: { value: PaymentMethod | 'CREDIT'; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK', label: 'Bank' },
  { value: 'OTHER', label: 'Card/Other' },
  { value: 'CREDIT', label: 'Udhaar' }
];

/**
 * Dedicated full-screen mobile POS — billing only, nothing else reachable from here.
 * Same cart/GST/payment math as NewSaleModal (kept identical for consistent invoices),
 * but laid out as a 2-step flow (Browse -> Checkout) instead of one long scrolling
 * dialog, since a capped-width popup wastes too much of a phone screen for fast counter billing.
 */
export const MobilePosView: React.FC<MobilePosViewProps> = ({
  products,
  customers,
  settings,
  onOpenBarcodeScanner,
  onSaleSuccess,
  onOpenInvoicePrint,
  onClose
}) => {
  const money = (v?: number | null) => formatMoney(v, settings?.currencySymbol, settings?.currencyCode);
  const [step, setStep] = useState<'browse' | 'checkout'>('browse');
  const [search, setSearch] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [manualCustomerName, setManualCustomerName] = useState('Walk-in Customer');
  const [manualCustomerMobile, setManualCustomerMobile] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'CREDIT'>('CASH');
  const [applyGst, setApplyGst] = useState(false);
  const [gstRateOption, setGstRateOption] = useState(5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedSale, setLastCreatedSale] = useState<Sale | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const filteredProducts = products.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: Math.round((item.quantity + 1) * 1000) / 1000 } : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.sellingPrice, mrp: product.mrp }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = Math.max(0, Math.round((item.quantity + delta) * 1000) / 1000);
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Direct manual entry — for bulk quantities (e.g. 100kg of TMT rod) tapping
  // + a hundred times isn't practical. Doesn't remove the row at 0 (the user
  // is often mid-typing, e.g. clearing "1" to type "150") — the trash icon
  // handles actually removing a line item.
  const setItemQuantity = (productId: string, rawValue: string) => {
    const newQty = Math.max(0, Number(rawValue) || 0);
    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartCount = cart.reduce((sum, i) => sum + 1, 0);
  const rawSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const netBeforeTax = Math.max(0, rawSubtotal - discount);

  let totalTaxAmount = 0;
  let taxableAmount = netBeforeTax;
  let grandTotal = netBeforeTax;
  if (applyGst && gstRateOption > 0) {
    taxableAmount = netBeforeTax;
    totalTaxAmount = Math.round((netBeforeTax * gstRateOption) / 100 * 100) / 100;
    grandTotal = Math.round((taxableAmount + totalTaxAmount) * 100) / 100;
  }
  const cgstAmount = totalTaxAmount > 0 ? Math.round((totalTaxAmount / 2) * 100) / 100 : 0;
  const sgstAmount = cgstAmount;

  const numReceived = typeof receivedAmount === 'number' ? receivedAmount : 0;
  const changeAmount = numReceived > grandTotal ? Math.round((numReceived - grandTotal) * 100) / 100 : 0;

  const resetForNewSale = () => {
    setCart([]);
    setSelectedCustomerId('');
    setManualCustomerName('Walk-in Customer');
    setManualCustomerMobile('');
    setDiscount(0);
    setPaymentMethod('CASH');
    setApplyGst(false);
    setGstRateOption(5);
    setReceivedAmount('');
    setLastCreatedSale(null);
    setStep('browse');
  };

  const handleSubmitSale = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      alert('Please select a registered customer for Udhaar (Credit) sale!');
      return;
    }

    setIsSubmitting(true);
    try {
      const saleData = {
        customerId: selectedCustomerId || undefined,
        customerName: manualCustomerName || 'Walk-in Customer',
        customerMobile: manualCustomerMobile || undefined,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          mrp: item.mrp,
          totalPrice: Math.round(item.unitPrice * item.quantity * 100) / 100,
          gstRate: applyGst ? gstRateOption : 0
        })),
        subtotal: Math.round(rawSubtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        taxType: (applyGst ? 'EXCLUSIVE' : 'EXEMPT') as 'INCLUSIVE' | 'EXCLUSIVE' | 'EXEMPT',
        gstRate: applyGst ? gstRateOption : 0,
        taxableAmount: Math.round(taxableAmount * 100) / 100,
        cgstAmount: Math.round(cgstAmount * 100) / 100,
        sgstAmount: Math.round(sgstAmount * 100) / 100,
        igstAmount: 0,
        totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100,
        paymentMethod,
        paymentStatus: (paymentMethod === 'CREDIT' ? 'PENDING' : 'PAID') as PaymentStatus,
        receivedAmount: numReceived > 0 ? numReceived : undefined,
        changeAmount: changeAmount > 0 ? changeAmount : undefined
      };

      const created = await api.createSale(saleData);
      setLastCreatedSale(created);
      onSaleSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to complete sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[45] bg-slate-50 flex flex-col md:hidden">
      {/* ===== Success Screen ===== */}
      {lastCreatedSale ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner mt-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Sale Completed!</h3>
          <p className="text-sm font-semibold text-emerald-700">Bill No: #{lastCreatedSale.saleNumber}</p>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5 shadow-sm">
            <p><strong>Customer:</strong> {lastCreatedSale.customerName}</p>
            {lastCreatedSale.totalTaxAmount ? (
              <p><strong>GST @ {lastCreatedSale.gstRate}%:</strong> {money(lastCreatedSale.totalTaxAmount)}</p>
            ) : null}
            <p className="text-base font-bold text-slate-900 pt-1.5 border-t border-slate-200 flex justify-between">
              <span>Grand Total:</span>
              <span className="text-emerald-700">{money(lastCreatedSale.grandTotal)}</span>
            </p>
            {lastCreatedSale.changeAmount ? (
              <p className="text-xs text-emerald-700 font-bold flex justify-between pt-0.5">
                <span>Change Returned:</span>
                <span>{money(lastCreatedSale.changeAmount)}</span>
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => onOpenInvoicePrint(lastCreatedSale)}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>

            {lastCreatedSale.customerMobile ? (
              <a
                href={getWhatsAppWebLink(lastCreatedSale.customerMobile, generateInvoiceWhatsAppText(lastCreatedSale, settings))}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" /> WhatsApp
              </a>
            ) : (
              <button
                onClick={() => {
                  copyToClipboard(generateInvoiceWhatsAppText(lastCreatedSale, settings));
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-300"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Copied!' : 'Copy Bill Text'}
              </button>
            )}
          </div>

          {lastCreatedSale.customerMobile && (
            <a
              href={getSmsLink(lastCreatedSale.customerMobile, generateInvoiceWhatsAppText(lastCreatedSale, settings))}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> Send SMS Text
            </a>
          )}

          <div className="grid grid-cols-2 gap-2 pt-3">
            <button
              onClick={resetForNewSale}
              className="py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Start Another Sale
            </button>
            <button
              onClick={onClose}
              className="py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs"
            >
              Done — Exit POS
            </button>
          </div>
        </div>
      ) : step === 'browse' ? (
        <>
          {/* ===== Browse Products ===== */}
          <div className="bg-emerald-800 text-white p-3 flex items-center gap-2 shrink-0 shadow-md">
            <button onClick={onClose} className="p-1.5 -ml-1 rounded-full hover:bg-emerald-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm leading-tight truncate">Mobile POS Billing</h2>
              <p className="text-[10px] text-emerald-200 truncate">{settings.storeName || 'Your Shop'}</p>
            </div>
          </div>

          <div className="p-3 flex gap-2 shrink-0 bg-white border-b border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search item, brand, barcode..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <button
              onClick={onOpenBarcodeScanner}
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3.5 rounded-xl flex items-center gap-1.5 shrink-0"
            >
              <Scan className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 pb-40">
            {filteredProducts.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-400 text-xs">No matching products found.</div>
            ) : (
              filteredProducts.map(p => {
                const inCart = cart.find(i => i.product.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={`text-left p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                      inCart ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-xs text-slate-800 line-clamp-2 leading-tight">{p.name}</span>
                      {inCart && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {inCart.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Stock: {p.currentStock} {p.unit}</p>
                    <p className="font-extrabold text-emerald-700 text-sm mt-1">{money(p.sellingPrice)}</p>
                  </button>
                );
              })
            )}
          </div>

          {cart.length > 0 && (
            <button
              onClick={() => setStep('checkout')}
              className="fixed bottom-20 left-3 right-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-2xl shadow-2xl flex items-center justify-between px-5 text-sm active:scale-98 transition-transform md:hidden z-30"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                {cartCount} item{cartCount !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                {money(rawSubtotal - discount)}
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </span>
            </button>
          )}
        </>
      ) : (
        <>
          {/* ===== Checkout ===== */}
          <div className="bg-emerald-800 text-white p-3 flex items-center gap-2 shrink-0 shadow-md">
            <button onClick={() => setStep('browse')} className="p-1.5 -ml-1 rounded-full hover:bg-emerald-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-sm">Checkout</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-48">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {cart.map(item => (
                <div key={item.product.id} className="p-2.5 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-800 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-slate-500">{money(item.unitPrice)} / {item.product.unit}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 rounded bg-white shadow-xs shrink-0">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => setItemQuantity(item.product.id, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="text-xs font-bold w-11 text-center bg-white rounded px-0.5 py-1 border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 rounded bg-white shadow-xs shrink-0">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 w-14 text-right">{money(item.unitPrice * item.quantity)}</span>
                  <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Customer (optional) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
              <select
                value={selectedCustomerId}
                onChange={e => {
                  const id = e.target.value;
                  setSelectedCustomerId(id);
                  const cust = customers.find(c => c.id === id);
                  setManualCustomerName(cust ? cust.name : 'Walk-in Customer');
                  setManualCustomerMobile(cust ? cust.mobile : '');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                ))}
              </select>
              {!selectedCustomerId && (
                <input
                  type="text"
                  value={manualCustomerMobile}
                  onChange={e => setManualCustomerMobile(e.target.value)}
                  placeholder="Customer mobile (optional, for WhatsApp receipt)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-[11px] font-bold text-slate-600 block">Payment Method</label>
              <div className="grid grid-cols-5 gap-1.5">
                {PAYMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`py-2 rounded-xl text-[11px] font-bold border-2 ${
                      paymentMethod === opt.value ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {paymentMethod === 'CASH' && (
                <input
                  type="number"
                  value={receivedAmount}
                  onChange={e => setReceivedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Cash received (optional, for change calc)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                />
              )}
              {paymentMethod === 'CREDIT' && !selectedCustomerId && (
                <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                  Select a registered customer above for Udhaar sales.
                </p>
              )}
            </div>

            {/* Advanced: Discount + GST (collapsed by default) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-600"
              >
                <span>Discount & GST (optional)</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showAdvanced && (
                <div className="p-3 pt-0 space-y-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Discount ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={e => setDiscount(Number(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <input type="checkbox" checked={applyGst} onChange={e => setApplyGst(e.target.checked)} className="w-4 h-4" />
                    Apply GST
                  </label>
                  {applyGst && (
                    <div className="grid grid-cols-5 gap-1.5">
                      {[0, 5, 12, 18, 28].map(rate => (
                        <button
                          key={rate}
                          onClick={() => setGstRateOption(rate)}
                          className={`py-1.5 rounded-lg text-[11px] font-bold border ${
                            gstRateOption === rate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Totals Summary */}
            <div className="bg-emerald-900 text-white p-3.5 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between text-emerald-200">
                <span>Subtotal</span><span>{money(rawSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-200">
                  <span>Discount</span><span>- {money(discount)}</span>
                </div>
              )}
              {totalTaxAmount > 0 && (
                <div className="flex justify-between text-emerald-200">
                  <span>GST @ {gstRateOption}%</span><span>+ {money(totalTaxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black pt-1.5 border-t border-emerald-700">
                <span>Grand Total</span><span>{money(grandTotal)}</span>
              </div>
              {changeAmount > 0 && (
                <div className="flex justify-between text-amber-300 font-bold">
                  <span>Change to Return</span><span>{money(changeAmount)}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmitSale}
            disabled={isSubmitting || cart.length === 0}
            className="fixed bottom-20 left-3 right-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-2 text-sm active:scale-98 transition-transform md:hidden z-30"
          >
            <CheckCircle2 className="w-5 h-5" />
            {isSubmitting ? 'Processing...' : `Complete Sale — ${money(grandTotal)}`}
          </button>
        </>
      )}
    </div>
  );
};
