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
  Share2,
  Receipt,
  Percent,
  Banknote,
  FileText,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { Product, Customer, PaymentMethod, PaymentStatus, Sale, StoreSettings } from '../types';
import { api } from '../lib/api';
import { getWhatsAppWebLink, getSmsLink, generateInvoiceWhatsAppText, copyToClipboard } from '../lib/whatsapp';
import { formatMoney } from '../lib/currency';
import { BarcodeScannerModal } from './BarcodeScannerModal';

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
  unitPrice: number;
  mrp: number;
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
  const money = (v?: number | null) => formatMoney(v, settings?.currencySymbol, settings?.currencyCode);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(''); // empty = Walk-in
  const [manualCustomerName, setManualCustomerName] = useState<string>('Walk-in Customer');
  const [manualCustomerMobile, setManualCustomerMobile] = useState<string>('');
  const [customerGstin, setCustomerGstin] = useState<string>('');
  
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'CREDIT'>('CASH');
  
  // GST Tax States
  const [applyGst, setApplyGst] = useState<boolean>(false);
  const [gstRateOption, setGstRateOption] = useState<number>(5); // 0, 5, 12, 18, 28, or custom
  const [customGstRate, setCustomGstRate] = useState<number>(18);
  const [taxType, setTaxType] = useState<'INCLUSIVE' | 'EXCLUSIVE'>('EXCLUSIVE');
  const [taxRegion, setTaxRegion] = useState<'INTRA' | 'INTER'>('INTRA'); // INTRA = CGST+SGST, INTER = IGST

  // Cash Received & Change Calculator State
  const [receivedAmount, setReceivedAmount] = useState<number | ''>('');

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedSale, setLastCreatedSale] = useState<Sale | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCart([]);
      setSelectedCustomerId('');
      setManualCustomerName('Walk-in Customer');
      setManualCustomerMobile('');
      setCustomerGstin('');
      setDiscount(0);
      setPaymentMethod('CASH');
      setApplyGst(false);
      setGstRateOption(5);
      setCustomGstRate(18);
      setTaxType('EXCLUSIVE');
      setTaxRegion('INTRA');
      setReceivedAmount('');
      setNotes('');
      setLastCreatedSale(null);
    }
  }, [isOpen]);

  // Handle Customer Selection Dropdown change
  useEffect(() => {
    if (selectedCustomerId) {
      const cust = customers.find(c => c.id === selectedCustomerId);
      if (cust) {
        setManualCustomerName(cust.name);
        setManualCustomerMobile(cust.mobile);
      }
    } else {
      setManualCustomerName('Walk-in Customer');
      setManualCustomerMobile('');
    }
  }, [selectedCustomerId, customers]);

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
          item.product.id === product.id ? { ...item, quantity: Math.round((item.quantity + 1) * 1000) / 1000 } : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice: product.sellingPrice,
          mrp: product.mrp
        }
      ];
    });
  };

  // Real-time barcode scan while the sale is open — adds straight to cart
  // and, since the scanner runs in continuousMode, keeps the camera live
  // so the next item can be scanned right after (a real checkout flow,
  // not one scan-then-close per item). An unrecognized barcode is just
  // surfaced by the scanner itself (nothing to add) — the cashier can add
  // it as a new product afterward from the regular Add Product screen.
  const handleScanDetected = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
    }
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

  const setQuantityDirect = (productId: string, qty: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const validQty = isNaN(qty) ? 0 : qty;
            return validQty >= 0 ? { ...item, quantity: validQty } : item;
          }
          return item;
        })
    );
  };

  const setUnitPriceDirect = (productId: string, price: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const validPrice = isNaN(price) ? 0 : price;
          return { ...item, unitPrice: validPrice };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Tax & Totals Calculation
  const activeGstRate = gstRateOption === -1 ? customGstRate : gstRateOption;
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const netBeforeTax = Math.max(0, rawSubtotal - discount);

  let taxableAmount = netBeforeTax;
  let totalTaxAmount = 0;
  let grandTotal = netBeforeTax;

  if (applyGst && activeGstRate > 0) {
    if (taxType === 'EXCLUSIVE') {
      taxableAmount = netBeforeTax;
      totalTaxAmount = Math.round((netBeforeTax * activeGstRate / 100) * 100) / 100;
      grandTotal = Math.round((taxableAmount + totalTaxAmount) * 100) / 100;
    } else {
      // INCLUSIVE
      grandTotal = netBeforeTax;
      totalTaxAmount = Math.round((netBeforeTax * activeGstRate / (100 + activeGstRate)) * 100) / 100;
      taxableAmount = Math.round((netBeforeTax - totalTaxAmount) * 100) / 100;
    }
  } else {
    grandTotal = netBeforeTax;
    taxableAmount = netBeforeTax;
    totalTaxAmount = 0;
  }

  const cgstAmount = taxRegion === 'INTRA' && totalTaxAmount > 0 ? Math.round((totalTaxAmount / 2) * 100) / 100 : 0;
  const sgstAmount = taxRegion === 'INTRA' && totalTaxAmount > 0 ? Math.round((totalTaxAmount / 2) * 100) / 100 : 0;
  const igstAmount = taxRegion === 'INTER' && totalTaxAmount > 0 ? totalTaxAmount : 0;

  const numReceived = typeof receivedAmount === 'number' ? receivedAmount : 0;
  const changeAmount = numReceived > grandTotal ? Math.round((numReceived - grandTotal) * 100) / 100 : 0;

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
        customerName: manualCustomerName || 'Walk-in Customer',
        customerMobile: manualCustomerMobile || undefined,
        customerGstin: customerGstin.trim() || undefined,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          mrp: item.mrp,
          totalPrice: Math.round((item.unitPrice * item.quantity) * 100) / 100,
          gstRate: applyGst ? activeGstRate : 0
        })),
        subtotal: Math.round(rawSubtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        taxType: (applyGst ? taxType : 'EXEMPT') as 'INCLUSIVE' | 'EXCLUSIVE' | 'EXEMPT',
        gstRate: applyGst ? activeGstRate : 0,
        taxableAmount: Math.round(taxableAmount * 100) / 100,
        cgstAmount: Math.round(cgstAmount * 100) / 100,
        sgstAmount: Math.round(sgstAmount * 100) / 100,
        igstAmount: Math.round(igstAmount * 100) / 100,
        totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100,
        paymentMethod,
        paymentStatus: (paymentMethod === 'CREDIT' ? 'PENDING' : 'PAID') as PaymentStatus,
        receivedAmount: numReceived > 0 ? numReceived : undefined,
        changeAmount: changeAmount > 0 ? changeAmount : undefined,
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
    <>
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
              <p className="text-[11px] text-emerald-200">Complete sale with custom quantity, prices & GST options</p>
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
              {lastCreatedSale.customerMobile && <p><strong>Mobile:</strong> {lastCreatedSale.customerMobile}</p>}
              {lastCreatedSale.customerGstin && <p><strong>GSTIN:</strong> {lastCreatedSale.customerGstin}</p>}
              <p><strong>Payment Mode:</strong> {lastCreatedSale.paymentMethod}</p>
              {lastCreatedSale.totalTaxAmount ? (
                <p><strong>Total Tax (GST @ {lastCreatedSale.gstRate}%):</strong> {money(lastCreatedSale.totalTaxAmount)}</p>
              ) : null}
              <p className="text-base font-bold text-slate-900 pt-1.5 border-t border-slate-200 flex justify-between">
                <span>Grand Total:</span>
                <span className="text-emerald-700">{money(lastCreatedSale.grandTotal)}</span>
              </p>
              {lastCreatedSale.receivedAmount && (
                <p className="text-xs text-slate-600 flex justify-between pt-0.5">
                  <span>Amount Received:</span>
                  <span>{money(lastCreatedSale.receivedAmount)}</span>
                </p>
              )}
              {lastCreatedSale.changeAmount && (
                <p className="text-xs text-emerald-700 font-bold flex justify-between pt-0.5">
                  <span>Change Returned:</span>
                  <span>{money(lastCreatedSale.changeAmount)}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center pt-2 max-w-md mx-auto">
              <button
                onClick={() => onOpenInvoicePrint(lastCreatedSale)}
                className="flex-1 min-w-[120px] bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>

              {lastCreatedSale.customerMobile && (
                <>
                  <a
                    href={getWhatsAppWebLink(lastCreatedSale.customerMobile, generateInvoiceWhatsAppText(lastCreatedSale, settings))}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" /> WhatsApp
                  </a>

                  <a
                    href={getSmsLink(lastCreatedSale.customerMobile, generateInvoiceWhatsAppText(lastCreatedSale, settings))}
                    className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                    title="Send via standard mobile SMS (if no WhatsApp)"
                  >
                    <MessageSquare className="w-4 h-4" /> SMS Text
                  </a>
                </>
              )}

              <button
                onClick={() => {
                  copyToClipboard(generateInvoiceWhatsAppText(lastCreatedSale, settings));
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="flex-1 min-w-[110px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-300"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Copied!' : 'Copy Text'}
              </button>
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
            {/* 1. Customer Selection & Customer Info Box */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> Customer Information
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">Select registered or enter manual</span>
              </div>

              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="">Walk-in Customer (Manual Name/Phone)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile}) - Udhaar: {money(c.currentBalance)}
                  </option>
                ))}
              </select>

              {/* Manual Name, Mobile, GSTIN Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Customer Name</label>
                  <input
                    type="text"
                    value={manualCustomerName}
                    onChange={(e) => setManualCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Mobile Number</label>
                  <input
                    type="tel"
                    value={manualCustomerMobile}
                    onChange={(e) => setManualCustomerMobile(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Customer GSTIN (B2B)</label>
                  <input
                    type="text"
                    value={customerGstin}
                    onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-emerald-600 focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            {/* 2. Product Search & Barcode Scanner */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search item name, brand, category, barcode..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
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
                        <span className="text-[10px] text-slate-500">Stock: {p.currentStock} {p.unit} | MRP: {money(p.mrp)}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-700 block">{money(p.sellingPrice)}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">+ Add Item</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. Cart Items Table & Manual Quantity / Unit Price Inputs */}
            <div>
              <h3 className="font-bold text-slate-800 text-xs mb-2 flex items-center justify-between">
                <span>Selected Items ({cart.length})</span>
                <span className="text-emerald-700 font-extrabold">Raw Subtotal: {money(rawSubtotal)}</span>
              </h3>

              {cart.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  Search product or scan barcode above to add items to cart.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs"
                    >
                      {/* Product Name & Unit */}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-[10px] text-slate-500">
                          MRP: {money(item.mrp)} | Unit: {item.product.unit}
                        </p>
                      </div>

                      {/* Custom Unit Price Input */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-slate-500 font-medium">Rate: {settings?.currencySymbol || '₹'}</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => setUnitPriceDirect(item.product.id, parseFloat(e.target.value))}
                          className="w-16 text-right font-bold text-slate-900 text-xs py-1 px-1 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          title="Click to edit selling price per unit"
                        />
                      </div>

                      {/* Editable Quantity Input with + and - buttons */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0"
                          title="Decrease by 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        
                        {/* MANUAL QUANTITY INPUT BOX */}
                        <input
                          type="number"
                          step="any"
                          min="0.001"
                          value={item.quantity}
                          onChange={(e) => setQuantityDirect(item.product.id, parseFloat(e.target.value))}
                          className="w-16 text-center font-extrabold text-slate-900 text-xs py-0.5 px-1 border border-slate-200 rounded focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          placeholder="Qty"
                          title="Type quantity manually (e.g. 5, 2.5, 100)"
                        />

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0"
                          title="Increase by 1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total Item Price & Remove Button */}
                      <div className="text-right min-w-[70px] shrink-0">
                        <span className="font-extrabold text-slate-900 block">
                          {money(Math.round((item.unitPrice * item.quantity) * 100) / 100)}
                        </span>
                        <button
                          type="button"
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

            {/* 4. GST Tax & Discount Section */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                {/* GST Options Panel */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={applyGst}
                        onChange={(e) => setApplyGst(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-blue-600" /> Apply GST Tax Invoice
                      </span>
                    </label>
                    {applyGst && (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        GST Total: {money(totalTaxAmount)}
                      </span>
                    )}
                  </div>

                  {applyGst && (
                    <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                      {/* GST Rate Selection */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">Select GST Rate Rate (%)</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[0, 5, 12, 18, 28].map(rate => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => setGstRateOption(rate)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                gstRateOption === rate
                                  ? 'bg-emerald-700 text-white border-emerald-700'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {rate === 0 ? '0% (Exempt)' : `${rate}%`}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setGstRateOption(-1)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                              gstRateOption === -1
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            Custom %
                          </button>
                          {gstRateOption === -1 && (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={customGstRate}
                              onChange={(e) => setCustomGstRate(parseFloat(e.target.value) || 0)}
                              className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-right"
                              placeholder="%"
                            />
                          )}
                        </div>
                      </div>

                      {/* Tax Type & Tax Region */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block mb-1">Tax Inclusion</span>
                          <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-slate-300">
                            <button
                              type="button"
                              onClick={() => setTaxType('EXCLUSIVE')}
                              className={`py-1 text-[11px] font-bold rounded-lg ${
                                taxType === 'EXCLUSIVE' ? 'bg-slate-800 text-white' : 'text-slate-600'
                              }`}
                            >
                              Exclusive (+Tax)
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaxType('INCLUSIVE')}
                              className={`py-1 text-[11px] font-bold rounded-lg ${
                                taxType === 'INCLUSIVE' ? 'bg-slate-800 text-white' : 'text-slate-600'
                              }`}
                            >
                              Inclusive (Built-in)
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block mb-1">State Tax Split</span>
                          <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-slate-300">
                            <button
                              type="button"
                              onClick={() => setTaxRegion('INTRA')}
                              className={`py-1 text-[11px] font-bold rounded-lg ${
                                taxRegion === 'INTRA' ? 'bg-slate-800 text-white' : 'text-slate-600'
                              }`}
                            >
                              CGST + SGST
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaxRegion('INTER')}
                              className={`py-1 text-[11px] font-bold rounded-lg ${
                                taxRegion === 'INTER' ? 'bg-slate-800 text-white' : 'text-slate-600'
                              }`}
                            >
                              IGST (Inter-state)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Tax Live Breakdown Summary */}
                      {totalTaxAmount > 0 && (
                        <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-[11px] space-y-1">
                          <div className="flex justify-between text-slate-600">
                            <span>Taxable Value:</span>
                            <span>{money(taxableAmount)}</span>
                          </div>
                          {taxRegion === 'INTRA' ? (
                            <>
                              <div className="flex justify-between text-slate-600">
                                <span>CGST ({activeGstRate / 2}%):</span>
                                <span>{money(cgstAmount)}</span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span>SGST ({activeGstRate / 2}%):</span>
                                <span>{money(sgstAmount)}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between text-slate-600">
                              <span>IGST ({activeGstRate}%):</span>
                              <span>{money(igstAmount)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Discount Row */}
                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Special Discount ({settings?.currencySymbol || '₹'}):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-28 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-right font-bold text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Payment Method */}
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

                {/* Cash Received & Change Calculator */}
                {paymentMethod === 'CASH' && (
                  <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <Banknote className="w-4 h-4 text-amber-600" /> Cash Received ({settings?.currencySymbol || '₹'})
                      </label>
                      {changeAmount > 0 && (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          Return Change: {money(changeAmount)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder={`e.g. ${money(Math.ceil(grandTotal))}`}
                        className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      
                      {/* Cash Preset Shortcuts */}
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setReceivedAmount(grandTotal)}
                          className="bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold px-2 py-1 rounded-lg text-[10px]"
                        >
                          Exact
                        </button>
                        {[50, 100, 500, 2000].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setReceivedAmount(amt)}
                            className="bg-white border border-amber-300 hover:bg-amber-100 text-slate-800 font-bold px-2 py-1 rounded-lg text-[10px]"
                          >
                            {money(amt)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Input */}
                <div>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add bill notes / reference (optional)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Grand Total Bar */}
                <div className="bg-emerald-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold block">Grand Total</span>
                    <span className="text-2xl font-black text-amber-300">{money(grandTotal)}</span>
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

    <BarcodeScannerModal
      isOpen={isScannerOpen}
      onClose={() => setIsScannerOpen(false)}
      onBarcodeDetected={handleScanDetected}
      products={products}
      settings={settings}
      continuousMode
    />
    </>
  );
};
