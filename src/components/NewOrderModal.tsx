import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Search,
  Plus,
  Trash2,
  Scan,
  UserCheck,
  Building2,
  Package,
  Printer,
  CheckCircle2,
  Truck,
  DollarSign,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Product, Customer, Order, PaymentMethod, PaymentStatus, OrderItem, StoreSettings } from '../types';
import { api } from '../lib/api';
import { formatMoney } from '../lib/currency';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  selectedCustomerForOrder?: Customer | null;
  onOpenBarcodeScanner: () => void;
  onOrderSuccess: () => void;
  onOpenInvoicePrint: (order: Order) => void;
}

interface OrderItemRow {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  price: number; // Unit selling rate
  mrp: number;
  gstPercent: number;
  discount: number; // Discount in ₹ per unit or line
  total: number;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  settings,
  selectedCustomerForOrder,
  onOpenBarcodeScanner,
  onOrderSuccess,
  onOpenInvoicePrint
}) => {
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);
  // Customer Selection & Quick Add Mode
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustArea, setNewCustArea] = useState('');

  // Order Details
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'HOME_DELIVERY' | 'STORE_PICKUP' | 'PARCEL'>('HOME_DELIVERY');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('Immediate / As soon as possible');
  const [orderNotes, setOrderNotes] = useState('');

  // Item list state
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Financial Charges & Payment
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [advancePaidAmount, setAdvancePaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setIsAddingNewCustomer(false);
      setNewCustName('');
      setNewCustMobile('');
      setNewCustAddress('');
      setNewCustArea('');
      setDeliveryCharge(0);
      setOrderDiscount(0);
      setAdvancePaidAmount(0);
      setOrderNotes('');

      if (selectedCustomerForOrder) {
        setSelectedCustomerId(selectedCustomerForOrder.id);
        setDeliveryAddress(selectedCustomerForOrder.address || '');
      } else {
        setSelectedCustomerId(customers[0]?.id || '');
        setDeliveryAddress(customers[0]?.address || '');
      }

      // Add 1 default product row if available
      if (products.length > 0) {
        const firstP = products[0];
        setItems([
          {
            id: `row-1`,
            productId: firstP.id,
            productName: firstP.name,
            unit: firstP.unit || 'pcs',
            quantity: 1,
            price: firstP.sellingPrice || 0,
            mrp: firstP.mrp || 0,
            gstPercent: firstP.gstPercent || 0,
            discount: 0,
            total: firstP.sellingPrice || 0
          }
        ]);
      } else {
        setItems([]);
      }
    }
  }, [isOpen, selectedCustomerForOrder, products, customers]);

  if (!isOpen) return null;

  // Filtered products for quick add search
  const filteredProducts = products.filter(p => {
    if (!productSearch.trim()) return false;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.brand.toLowerCase().includes(q);
  });

  const handleAddProductFromSearch = (p: Product) => {
    setItems(prev => {
      const existingIdx = prev.findIndex(i => i.productId === p.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const cur = updated[existingIdx];
        const newQty = cur.quantity + 1;
        const lineVal = (cur.price - cur.discount) * newQty;
        const taxAmt = (lineVal * cur.gstPercent) / 100;
        updated[existingIdx] = {
          ...cur,
          quantity: newQty,
          total: Math.round((lineVal + taxAmt) * 100) / 100
        };
        return updated;
      }

      const rate = p.sellingPrice || 0;
      const gst = p.gstPercent || 0;
      const taxAmt = (rate * gst) / 100;

      return [
        ...prev,
        {
          id: `row-${Date.now()}`,
          productId: p.id,
          productName: p.name,
          unit: p.unit || 'pcs',
          quantity: 1,
          price: rate,
          mrp: p.mrp || 0,
          gstPercent: gst,
          discount: 0,
          total: Math.round((rate + taxAmt) * 100) / 100
        }
      ];
    });
    setProductSearch('');
  };

  const handleRowChange = (index: number, field: keyof OrderItemRow, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const cur = { ...updated[index], [field]: value };

      const qty = Number(cur.quantity) || 0;
      const rate = Number(cur.price) || 0;
      const disc = Number(cur.discount) || 0;
      const gst = Number(cur.gstPercent) || 0;

      const netRate = Math.max(0, rate - disc);
      const lineSubtotal = qty * netRate;
      const taxAmt = (lineSubtotal * gst) / 100;
      cur.total = Math.round((lineSubtotal + taxAmt) * 100) / 100;

      updated[index] = cur;
      return updated;
    });
  };

  const handleSelectProductInRow = (index: number, productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    setItems(prev => {
      const updated = [...prev];
      const qty = updated[index]?.quantity || 1;
      const rate = p.sellingPrice || 0;
      const gst = p.gstPercent || 0;
      const lineSubtotal = qty * rate;
      const taxAmt = (lineSubtotal * gst) / 100;

      updated[index] = {
        ...updated[index],
        productId: p.id,
        productName: p.name,
        unit: p.unit || 'pcs',
        price: rate,
        mrp: p.mrp || 0,
        gstPercent: gst,
        discount: 0,
        total: Math.round((lineSubtotal + taxAmt) * 100) / 100
      };
      return updated;
    });
  };

  const handleAddEmptyRow = () => {
    const defaultP = products[0];
    const rate = defaultP?.sellingPrice || 0;
    const gst = defaultP?.gstPercent || 0;

    setItems(prev => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        productId: defaultP?.id || '',
        productName: defaultP?.name || 'Item',
        unit: defaultP?.unit || 'pcs',
        quantity: 1,
        price: rate,
        mrp: defaultP?.mrp || 0,
        gstPercent: gst,
        discount: 0,
        total: Math.round((rate + (rate * gst) / 100) * 100) / 100
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Financial Calculations
  const rawSubtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
  const totalItemDiscounts = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.discount || 0)), 0);
  const totalTaxAmount = items.reduce((sum, item) => {
    const netRate = Math.max(0, Number(item.price) - Number(item.discount || 0));
    const sub = Number(item.quantity) * netRate;
    return sum + ((sub * (Number(item.gstPercent) || 0)) / 100);
  }, 0);

  const grandTotal = Math.max(0, Math.round((rawSubtotal - totalItemDiscounts + totalTaxAmount + Number(deliveryCharge) - Number(orderDiscount)) * 100) / 100);
  const balanceDue = Math.max(0, grandTotal - Number(advancePaidAmount));

  // Submit Order logic
  const handleSaveOrder = async (shouldPrintAfterSave: boolean) => {
    if (items.length === 0) {
      setErrorMsg('Please add at least one product item to the order.');
      return;
    }

    let finalCustId = selectedCustomerId;
    let finalCustName = customers.find(c => c.id === selectedCustomerId)?.name || 'Customer';
    let finalCustMobile = customers.find(c => c.id === selectedCustomerId)?.mobile || '';

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. If user typed a new customer, save them
      if (isAddingNewCustomer) {
        if (!newCustName.trim()) {
          setErrorMsg('Please enter Customer Name.');
          setIsSubmitting(false);
          return;
        }
        const createdCust = await api.createCustomer({
          name: newCustName.trim(),
          mobile: newCustMobile.trim() || '9876543210',
          address: newCustAddress.trim() || 'Local Area',
          area: newCustArea.trim() || 'City'
        });
        finalCustId = createdCust.id;
        finalCustName = createdCust.name;
        finalCustMobile = createdCust.mobile;
      }

      const advPaid = Number(advancePaidAmount) || 0;
      let paymentStatus: PaymentStatus = 'PAID';
      if (advPaid === 0) {
        paymentStatus = 'PENDING';
      } else if (advPaid < grandTotal) {
        paymentStatus = 'PARTIAL';
      }

      const orderPayload = {
        customerId: finalCustId,
        customerName: finalCustName,
        customerMobile: finalCustMobile,
        customerAddress: deliveryAddress || 'Store Pickup',
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          unit: i.unit,
          mrp: Number(i.mrp),
          quantity: Number(i.quantity),
          price: Number(i.price),
          total: Number(i.total)
        })),
        subtotal: rawSubtotal,
        deliveryCharge: Number(deliveryCharge),
        discount: Number(orderDiscount) + totalItemDiscounts,
        total: grandTotal,
        orderStatus: 'NEW' as const,
        paymentStatus,
        paymentMethod,
        notes: `${deliveryType} | Slot: ${deliveryTimeSlot} | ${orderNotes}`
      };

      const createdOrder = await api.createOrder(orderPayload);
      onOrderSuccess();
      onClose();

      if (shouldPrintAfterSave) {
        onOpenInvoicePrint(createdOrder);
      }
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setErrorMsg(err.message || 'Failed to save customer order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-900 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-blue-700 text-white p-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>New Customer Order & Delivery Invoice</span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Print & Estimate Slip
                </span>
              </h2>
              <p className="text-[11px] text-blue-100">
                Record delivery orders with full product breakdown, delivery slots, rates & print receipt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-blue-100 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
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

          {/* 1. Customer Selection / Quick Add */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-blue-600" /> 1. Customer Details
              </span>

              <button
                type="button"
                onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
                className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {isAddingNewCustomer ? '← Pick Existing Customer' : '+ Quick Add New Customer'}
              </button>
            </div>

            {isAddingNewCustomer ? (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={newCustMobile}
                    onChange={(e) => setNewCustMobile(e.target.value)}
                    placeholder="e.g. 9826012345"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Area / Colony</label>
                  <input
                    type="text"
                    value={newCustArea}
                    onChange={(e) => setNewCustArea(e.target.value)}
                    placeholder="e.g. Main Market, Sector 4"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={newCustAddress}
                    onChange={(e) => {
                      setNewCustAddress(e.target.value);
                      setDeliveryAddress(e.target.value);
                    }}
                    placeholder="House No / Landmark"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      const c = customers.find(cust => cust.id === e.target.value);
                      if (c) setDeliveryAddress(c.address || '');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.mobile || 'No Mobile'}) - {c.area || 'Local'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Address / Landmark</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter complete house address / landmark for delivery boy"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Order Metadata & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" /> Fulfillment Method
              </label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none"
              >
                <option value="HOME_DELIVERY">Home Delivery</option>
                <option value="STORE_PICKUP">Store Pickup</option>
                <option value="PARCEL">Parcel / Courier Dispatch</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Delivery Time Slot
              </label>
              <select
                value={deliveryTimeSlot}
                onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none"
              >
                <option value="Immediate / As soon as possible">Immediate / ASAP</option>
                <option value="Morning (9:00 AM - 12:00 PM)">Morning (9 AM - 12 PM)</option>
                <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12 PM - 4 PM)</option>
                <option value="Evening (4:00 PM - 8:00 PM)">Evening (4 PM - 8 PM)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Packing / Delivery Notes</label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Call customer before delivery"
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* 3. Itemization & Product Search Section */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Package className="w-4 h-4 text-blue-600" /> 2. Product Items ({items.length})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenBarcodeScanner}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Scan className="w-3.5 h-3.5" /> Barcode Scan
                </button>

                <button
                  type="button"
                  onClick={handleAddEmptyRow}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center gap-1 border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product Row
                </button>
              </div>
            </div>

            {/* Quick Product Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search product by name, brand or barcode to add to order..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />

              {productSearch.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-20 divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <div className="p-3 text-center text-slate-400">No matching products found.</div>
                  ) : (
                    filteredProducts.slice(0, 8).map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProductFromSearch(p)}
                        className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {p.brand} | Stock: {p.currentStock} {p.unit}
                          </span>
                        </div>
                        <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {money(p.sellingPrice)} (+ Add)
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Product Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                      <th className="py-2.5 px-3 min-w-[170px]">Product</th>
                      <th className="py-2.5 px-3 w-16">Unit</th>
                      <th className="py-2.5 px-3 w-20">Qty</th>
                      <th className="py-2.5 px-3 w-24">Rate ({settings.currencySymbol})</th>
                      <th className="py-2.5 px-3 w-20">Disc ({settings.currencySymbol})</th>
                      <th className="py-2.5 px-3 w-20">GST %</th>
                      <th className="py-2.5 px-3 w-24 text-right">Line Total ({settings.currencySymbol})</th>
                      <th className="py-2.5 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-400">
                          No items added yet. Search above or click "+ Add Product Row".
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="p-2">
                            <select
                              value={item.productId}
                              onChange={(e) => handleSelectProductInRow(idx, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({money(p.sellingPrice)})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleRowChange(idx, 'unit', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 font-semibold text-center text-slate-700 focus:outline-none"
                            />
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
                              value={item.price}
                              onChange={(e) => handleRowChange(idx, 'price', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.discount}
                              onChange={(e) => handleRowChange(idx, 'discount', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 font-semibold text-emerald-700 focus:outline-none"
                            />
                          </td>

                          <td className="p-2">
                            <select
                              value={item.gstPercent}
                              onChange={(e) => handleRowChange(idx, 'gstPercent', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 font-semibold text-slate-800 focus:outline-none"
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                            </select>
                          </td>

                          <td className="p-2 text-right font-extrabold text-slate-900">
                            {money(item.total)}
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

          {/* 4. Totals, Delivery Charge & Payment Footer */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 shadow-lg">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Subtotal</span>
                <span className="font-extrabold text-white text-sm">{money(rawSubtotal)}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">GST Tax</span>
                <span className="font-extrabold text-amber-300 text-sm">{money(totalTaxAmount)}</span>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Delivery Charge ({settings.currencySymbol})</label>
                <input
                  type="number"
                  min={0}
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Special Discount ({settings.currencySymbol})</label>
                <input
                  type="number"
                  min={0}
                  value={orderDiscount}
                  onChange={(e) => setOrderDiscount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-emerald-300 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Grand Total Bill</span>
                <span className="font-black text-amber-400 text-base">{money(grandTotal)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-slate-300 font-bold block mb-1 text-xs">Advance Paid ({settings.currencySymbol})</label>
                <input
                  type="number"
                  min={0}
                  value={advancePaidAmount}
                  onChange={(e) => setAdvancePaidAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1 text-xs">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="CREDIT">Udhaar / Unpaid</option>
                </select>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Balance Pending (Udhaar)</span>
                <span className={`text-base font-black ${balanceDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {money(balanceDue)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400">
                * Generates official delivery memo & updates customer account balance.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSaveOrder(false)}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Order Only'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveOrder(true)}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all text-xs"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>{isSubmitting ? 'Processing...' : 'CREATE & PRINT ORDER BILL'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
