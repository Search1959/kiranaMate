import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Scan,
  UserCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Printer,
  Share2
} from 'lucide-react';
import { Product, Customer, PaymentMethod, PaymentStatus, Sale, StoreSettings } from '../types';
import { api } from '../lib/api';
import { getWhatsAppWebLink, generateInvoiceWhatsAppText } from '../lib/whatsapp';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  onOpenBarcodeScanner: () => void;
  onSaleSuccess: () => void;
  onOpenInvoicePrint: (sale: Sale) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  settings,
  onOpenBarcodeScanner,
  onSaleSuccess,
  onOpenInvoicePrint
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(''); // empty = Walk-in
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'CREDIT'>('CASH');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedSale, setLastCreatedSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCart([]);
      setSelectedCustomerId('');
      setDiscount(0);
      setPaymentMethod('CASH');
      setNotes('');
      setLastCreatedSale(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
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
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleSubmitSale = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      alert("Please select a customer for Udhaar (Credit) sale!");
      return;
    }

    setIsSubmitting(true);
    try {
      const saleData = {
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
        customerMobile: selectedCustomer ? selectedCustomer.mobile : undefined,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.sellingPrice,
          mrp: item.product.mrp,
          totalPrice: item.product.sellingPrice * item.quantity
        })),
        subtotal,
        discount,
        grandTotal,
        paymentMethod,
        paymentStatus: (paymentMethod === 'CREDIT' ? 'PENDING' : 'PAID') as PaymentStatus,
        notes: notes || undefined
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
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-emerald-950 font-extrabold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">Express Counter Sale POS</h2>
              <p className="text-[11px] text-emerald-200">Complete sale in under 30 seconds</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-emerald-700 text-emerald-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {lastCreatedSale ? (
          /* Sale Success Receipt View */
          <div className="p-6 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Sale Completed Successfully!</h3>
            <p className="text-sm font-semibold text-emerald-700">Bill No: #{lastCreatedSale.saleNumber}</p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-1">
              <p><strong>Customer:</strong> {lastCreatedSale.customerName}</p>
              <p><strong>Payment:</strong> {lastCreatedSale.paymentMethod} ({lastCreatedSale.paymentStatus})</p>
              <p className="text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                Amount Paid: ₹{lastCreatedSale.grandTotal}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-sm mx-auto">
              <button
                onClick={() => onOpenInvoicePrint(lastCreatedSale)}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              {lastCreatedSale.customerMobile && (
                <a
                  href={getWhatsAppWebLink(lastCreatedSale.customerMobile, generateInvoiceWhatsAppText(lastCreatedSale, settings))}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> WhatsApp Bill
                </a>
              )}
            </div>

            <button
              onClick={() => {
                setLastCreatedSale(null);
                setCart([]);
              }}
              className="mt-4 text-emerald-700 font-bold text-xs underline"
            >
              Start Another Sale
            </button>
          </div>
        ) : (
          /* Main Sale Entry Form */
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
            {/* 1. Customer Selection */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" /> Select Customer (Optional for Walk-in)
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="">Walk-in Customer (Cash / UPI)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile}) - Udhaar: ₹{c.currentBalance}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Search Product & Scanner */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search item name, brand, category..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={onOpenBarcodeScanner}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
              >
                <Scan className="w-4 h-4" /> Scan
              </button>
            </div>

            {/* Product Quick Picker Cards */}
            {productSearch.trim() && (
              <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-inner">
                {filteredProducts.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">No matching products found.</div>
                ) : (
                  filteredProducts.slice(0, 8).map(p => (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="p-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{p.name}</span>
                        <span className="text-[10px] text-slate-500">Stock: {p.currentStock} {p.unit} | MRP: ₹{p.mrp}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-700 block">₹{p.sellingPrice}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">+ Add Item</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Cart Items List */}
            <div>
              <h3 className="font-bold text-slate-800 text-xs mb-2 flex items-center justify-between">
                <span>Selected Items ({cart.length})</span>
                <span className="text-emerald-700 font-extrabold">Subtotal: ₹{subtotal}</span>
              </h3>

              {cart.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  Search product or scan barcode above to add items to cart.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-[10px] text-slate-500">
                          ₹{item.product.sellingPrice} / {item.product.unit}
                        </p>
                      </div>

                      {/* Quantity Touch Buttons */}
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-extrabold text-slate-900 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center text-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[65px] pl-2">
                        <span className="font-bold text-slate-900 block">
                          ₹{item.product.sellingPrice * item.quantity}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discount & Payment Method */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Special Discount (₹):</span>
                  <input
                    type="number"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-right font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'CASH', label: 'Cash', color: 'border-emerald-500 text-emerald-800 bg-emerald-50' },
                      { id: 'UPI', label: 'UPI QR', color: 'border-blue-500 text-blue-800 bg-blue-50' },
                      { id: 'CREDIT', label: 'Udhaar (Credit)', color: 'border-amber-500 text-amber-800 bg-amber-50' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          paymentMethod === m.id ? m.color : 'border-slate-200 text-slate-600 bg-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grand Total Bar */}
                <div className="bg-emerald-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold block">Grand Total</span>
                    <span className="text-2xl font-black text-amber-300">₹{grandTotal}</span>
                  </div>
                  <button
                    onClick={handleSubmitSale}
                    disabled={isSubmitting}
                    className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-5 py-2.5 rounded-xl text-sm transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'SAVE & PRINT BILL'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
