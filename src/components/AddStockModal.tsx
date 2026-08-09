import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Plus,
  Trash2,
  Building2,
  Package,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  Zap,
  DollarSign,
  AlertCircle,
  Camera
} from 'lucide-react';
import { Product, Supplier, PaymentMethod, PaymentStatus, ProductUnit, StoreSettings } from '../types';
import { api } from '../lib/api';
import { formatMoney } from '../lib/currency';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers?: Supplier[];
  settings: StoreSettings;
  selectedProductForStock?: Product | null;
  onStockAdded: () => void;
  /** Switches to the AI camera-scan flow instead of typing the bill in by hand. */
  onOpenScanBill?: () => void;
}

interface PurchaseItemRow {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  purchasePrice: number; // Rate per unit
  gstPercent: number; // e.g. 5, 12, 18
  sellingPrice: number;
  mrp: number;
  totalPrice: number;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  products,
  suppliers = [],
  settings,
  selectedProductForStock,
  onStockAdded,
  onOpenScanBill
}) => {
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);
  const [activeTab, setActiveTab] = useState<'invoice' | 'quick'>('invoice');

  // Supplier & Invoice details
  const [supplierId, setSupplierId] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierMobile, setNewSupplierMobile] = useState('');
  const [newSupplierGstin, setNewSupplierGstin] = useState('');
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  // Line items
  const [items, setItems] = useState<PurchaseItemRow[]>([]);
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState('');

  // Quick Restock Mode state
  const [quickProductId, setQuickProductId] = useState('');
  const [quickQty, setQuickQty] = useState<number>(10);
  const [quickCostPrice, setQuickCostPrice] = useState<number>(0);
  const [quickNotes, setQuickNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setInvoiceNumber(`BILL-${Date.now().toString().slice(-6)}`);
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setFreightCharges(0);
      setPaidAmount(0);
      setNotes('');
      setIsAddingNewSupplier(false);

      if (suppliers.length > 0) {
        setSupplierId(suppliers[0].id);
      } else {
        setSupplierId('');
      }

      if (selectedProductForStock) {
        setActiveTab('quick');
        setQuickProductId(selectedProductForStock.id);
        setQuickCostPrice(selectedProductForStock.purchasePrice || 0);
        
        // Also populate default row for invoice tab
        setItems([
          {
            id: `row-1`,
            productId: selectedProductForStock.id,
            productName: selectedProductForStock.name,
            unit: selectedProductForStock.unit || 'pkt',
            quantity: 10,
            purchasePrice: selectedProductForStock.purchasePrice || 0,
            gstPercent: selectedProductForStock.gstPercent || 0,
            sellingPrice: selectedProductForStock.sellingPrice || 0,
            mrp: selectedProductForStock.mrp || 0,
            totalPrice: 10 * (selectedProductForStock.purchasePrice || 0)
          }
        ]);
      } else {
        setActiveTab('invoice');
        setQuickProductId(products[0]?.id || '');
        setQuickCostPrice(products[0]?.purchasePrice || 0);

        // Add 1 default row if products exist
        if (products.length > 0) {
          const firstP = products[0];
          setItems([
            {
              id: `row-1`,
              productId: firstP.id,
              productName: firstP.name,
              unit: firstP.unit || 'pkt',
              quantity: 10,
              purchasePrice: firstP.purchasePrice || 0,
              gstPercent: firstP.gstPercent || 0,
              sellingPrice: firstP.sellingPrice || 0,
              mrp: firstP.mrp || 0,
              totalPrice: 10 * (firstP.purchasePrice || 0)
            }
          ]);
        } else {
          setItems([]);
        }
      }
    }
  }, [isOpen, selectedProductForStock, products, suppliers]);

  if (!isOpen) return null;

  // Handle product selection inside an invoice item row
  const handleProductSelect = (index: number, selectedId: string) => {
    const prod = products.find(p => p.id === selectedId);
    if (!prod) return;

    setItems(prev => {
      const updated = [...prev];
      const rate = prod.purchasePrice || 0;
      const qty = updated[index].quantity || 1;
      const gst = prod.gstPercent || 0;
      const itemSubtotal = qty * rate;
      const taxAmt = (itemSubtotal * gst) / 100;

      updated[index] = {
        ...updated[index],
        productId: prod.id,
        productName: prod.name,
        unit: prod.unit || 'pkt',
        purchasePrice: rate,
        gstPercent: gst,
        sellingPrice: prod.sellingPrice || 0,
        mrp: prod.mrp || 0,
        totalPrice: itemSubtotal + taxAmt
      };
      return updated;
    });
  };

  // Item row change handler
  const handleRowChange = (index: number, field: keyof PurchaseItemRow, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const cur = { ...updated[index], [field]: value };

      const qty = Number(cur.quantity) || 0;
      const rate = Number(cur.purchasePrice) || 0;
      const gst = Number(cur.gstPercent) || 0;

      const subtotal = qty * rate;
      const taxAmt = (subtotal * gst) / 100;
      cur.totalPrice = Math.round((subtotal + taxAmt) * 100) / 100;

      updated[index] = cur;
      return updated;
    });
  };

  const handleAddRow = () => {
    const defaultProd = products[0];
    const rate = defaultProd?.purchasePrice || 0;
    const gst = defaultProd?.gstPercent || 0;

    setItems(prev => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        productId: defaultProd?.id || '',
        productName: defaultProd?.name || 'Item',
        unit: defaultProd?.unit || 'pkt',
        quantity: 1,
        purchasePrice: rate,
        gstPercent: gst,
        sellingPrice: defaultProd?.sellingPrice || 0,
        mrp: defaultProd?.mrp || 0,
        totalPrice: rate + (rate * gst) / 100
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Financial Calculations
  const rawSubtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.purchasePrice)), 0);
  const totalTaxAmount = items.reduce((sum, item) => {
    const sub = Number(item.quantity) * Number(item.purchasePrice);
    return sum + ((sub * (Number(item.gstPercent) || 0)) / 100);
  }, 0);

  const grandTotal = Math.round((rawSubtotal + totalTaxAmount + Number(freightCharges)) * 100) / 100;
  const balanceDue = Math.max(0, grandTotal - Number(paidAmount));

  // Handle Full Purchase Submit
  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Please add at least one product row to the purchase bill.');
      return;
    }

    let finalSupplierId = supplierId;
    let finalSupplierName = suppliers.find(s => s.id === supplierId)?.name || 'Wholesale Supplier';

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create Supplier if user typed a new supplier
      if (isAddingNewSupplier) {
        if (!newSupplierName.trim()) {
          setErrorMsg('Please enter New Supplier Name.');
          setIsSubmitting(false);
          return;
        }
        const createdSup = await api.createSupplier({
          name: newSupplierName.trim(),
          contactPerson: newSupplierName.trim(),
          mobile: newSupplierMobile.trim() || '9876543210',
          gstin: newSupplierGstin.trim(),
          address: 'Local Wholesale Market',
          city: 'Local',
          outstandingBalance: 0
        });
        finalSupplierId = createdSup.id;
        finalSupplierName = createdSup.name;
      }

      // 2. Compute Payment Status
      const paidNum = Number(paidAmount) || 0;
      let paymentStatus: PaymentStatus = 'PAID';
      if (paidNum === 0) {
        paymentStatus = 'PENDING';
      } else if (paidNum < grandTotal) {
        paymentStatus = 'PARTIAL';
      }

      // 3. Create Purchase Invoice payload
      const purchasePayload = {
        supplierId: finalSupplierId,
        supplierName: finalSupplierName,
        invoiceNumber: invoiceNumber.trim() || `BILL-${Date.now().toString().slice(-6)}`,
        invoiceDate,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          unit: i.unit,
          quantity: Number(i.quantity),
          purchasePrice: Number(i.purchasePrice),
          gstPercent: Number(i.gstPercent),
          gstAmount: ((Number(i.quantity) * Number(i.purchasePrice)) * Number(i.gstPercent)) / 100,
          sellingPrice: Number(i.sellingPrice),
          mrp: Number(i.mrp),
          totalPrice: Number(i.totalPrice)
        })),
        subtotal: rawSubtotal,
        taxAmount: totalTaxAmount,
        freightCharges: Number(freightCharges),
        totalAmount: rawSubtotal + totalTaxAmount,
        grandTotal,
        paidAmount: paidNum,
        paymentStatus,
        paymentMethod,
        notes: notes || 'Manual Wholesale Purchase Invoice Entry'
      };

      await api.createPurchase(purchasePayload);
      onStockAdded();
      onClose();
    } catch (err: any) {
      console.error('Failed to create purchase bill:', err);
      setErrorMsg(err.message || 'Failed to save purchase bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Restock Submit
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProductId || !quickQty || Number(quickQty) <= 0) {
      setErrorMsg('Please select product and enter valid stock quantity.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.addStock(quickProductId, Number(quickQty), quickNotes || 'Quick Stock Increment');
      onStockAdded();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-900 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>Purchase Bill Entry & Restock Inventory</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Rates, Tax & Amounts
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Record supplier invoices with cost price, GST tax, selling price & payment balances
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-2 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'invoice'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Full Purchase Invoice Entry (Rate, GST & Supplier)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Quick Stock Increment</span>
          </button>
        </div>

        {/* Scan-instead banner — typing a whole bill by hand is slow; this is
            the fast path, especially on a phone at the counter. */}
        {onOpenScanBill && (
          <div className="px-3 sm:px-4 pt-3 shrink-0">
            <button
              type="button"
              onClick={onOpenScanBill}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Bill with Camera Instead (AI Auto-Fill)</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)} className="font-bold text-red-500 hover:text-red-800">×</button>
            </div>
          )}

          {/* TAB 1: FULL PURCHASE INVOICE ENTRY */}
          {activeTab === 'invoice' && (
            <form onSubmit={handleInvoiceSubmit} className="space-y-4 text-xs">
              {/* 1. Supplier & Invoice Metadata Section */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-blue-600" /> 1. Supplier / Vendor Details
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsAddingNewSupplier(!isAddingNewSupplier)}
                    className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {isAddingNewSupplier ? '← Pick Existing Supplier' : '+ Add New Supplier'}
                  </button>
                </div>

                {isAddingNewSupplier ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Supplier Name *</label>
                      <input
                        type="text"
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        placeholder="e.g. Mahavir Agency"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        value={newSupplierMobile}
                        onChange={(e) => setNewSupplierMobile(e.target.value)}
                        placeholder="e.g. 9826012345"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">GSTIN (Optional)</label>
                      <input
                        type="text"
                        value={newSupplierGstin}
                        onChange={(e) => setNewSupplierGstin(e.target.value)}
                        placeholder="e.g. 23AAAAA0000A1Z5"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-semibold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-1">
                      <label className="block font-bold text-slate-700 mb-1">Select Supplier</label>
                      <select
                        value={supplierId}
                        onChange={(e) => setSupplierId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.mobile || 'No Mobile'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bill / Invoice Number</label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        placeholder="e.g. INV-9874"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Invoice Date</label>
                      <input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Itemized Purchase Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Package className="w-4 h-4 text-blue-600" /> 2. Items & Pricing Breakdown ({items.length})
                  </span>

                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center gap-1 border border-blue-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product Row
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                          <th className="py-2.5 px-3 min-w-[170px]">Product Name</th>
                          <th className="py-2.5 px-3 w-16">Unit</th>
                          <th className="py-2.5 px-3 w-20">Qty</th>
                          <th className="py-2.5 px-3 w-24">Buy Rate ({settings.currencySymbol})</th>
                          <th className="py-2.5 px-3 w-20">GST %</th>
                          <th className="py-2.5 px-3 w-24">Sell Price ({settings.currencySymbol})</th>
                          <th className="py-2.5 px-3 w-24 text-right">Total ({settings.currencySymbol})</th>
                          <th className="py-2.5 px-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-4 text-center text-slate-400">
                              No products added yet. Click "+ Add Product Row".
                            </td>
                          </tr>
                        ) : (
                          items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50/80">
                              <td className="p-2">
                                <select
                                  value={item.productId}
                                  onChange={(e) => handleProductSelect(idx, e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {products.map(p => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} (Stock: {p.currentStock})
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="p-2">
                                <span className="text-[11px] font-semibold text-slate-600 block text-center">
                                  {item.unit}
                                </span>
                              </td>

                              <td className="p-2">
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-extrabold text-center text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>

                              <td className="p-2">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={item.purchasePrice}
                                  onChange={(e) => handleRowChange(idx, 'purchasePrice', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>

                              <td className="p-2">
                                <select
                                  value={item.gstPercent}
                                  onChange={(e) => handleRowChange(idx, 'gstPercent', Number(e.target.value))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value={0}>0%</option>
                                  <option value={5}>5%</option>
                                  <option value={12}>12%</option>
                                  <option value={18}>18%</option>
                                  <option value={28}>28%</option>
                                </select>
                              </td>

                              <td className="p-2">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={item.sellingPrice}
                                  onChange={(e) => handleRowChange(idx, 'sellingPrice', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>

                              <td className="p-2 text-right font-extrabold text-slate-900">
                                {money(item.totalPrice)}
                              </td>

                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(idx)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 3. Summary & Payment Footer */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 shadow-lg">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Item Subtotal</span>
                    <span className="font-extrabold text-white text-sm">{money(rawSubtotal)}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Total GST Tax</span>
                    <span className="font-extrabold text-amber-300 text-sm">{money(totalTaxAmount)}</span>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">Freight Charges ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      min={0}
                      value={freightCharges}
                      onChange={(e) => setFreightCharges(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Grand Total Bill</span>
                    <span className="font-black text-amber-400 text-base">{money(grandTotal)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Amount Paid Now ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      min={0}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CREDIT">Udhaar / Unpaid</option>
                    </select>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Balance Due (Added to Udhaar)</span>
                    <span className={`text-base font-black ${balanceDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {money(balanceDue)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    * Inventory stock, purchase rates & supplier balances will automatically sync.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving Invoice...' : 'CONFIRM & SAVE PURCHASE BILL'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: QUICK STOCK INCREMENT */}
          {activeTab === 'quick' && (
            <form onSubmit={handleQuickSubmit} className="space-y-4 text-xs max-w-lg mx-auto py-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 space-y-2">
                <div className="font-bold text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Quick Stock Adjustment Mode</span>
                </div>
                <p className="text-xs text-blue-800">
                  Use this if you just want to quickly add stock items without entering a complete wholesale bill invoice or tax breakdown.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Product to Restock</label>
                <select
                  value={quickProductId}
                  onChange={(e) => {
                    setQuickProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) setQuickCostPrice(p.purchasePrice || 0);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantity to Add (+)</label>
                <input
                  type="number"
                  min={1}
                  value={quickQty}
                  onChange={(e) => setQuickQty(Number(e.target.value))}
                  placeholder="e.g. 20"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-extrabold text-blue-900 focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Supplier Ref / Notes (Optional)</label>
                <input
                  type="text"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="e.g. Received 2 cartons from local agency"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{isSubmitting ? 'Updating Stock...' : 'CONFIRM & INCREASE STOCK'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
