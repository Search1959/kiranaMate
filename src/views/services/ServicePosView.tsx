import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Phone,
  CreditCard,
  Printer,
  Sparkles,
  CheckCircle2,
  Clock,
  IndianRupee,
  Share2,
  Wrench,
  X
} from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { ServiceItem, ServiceStaff, PaymentMethod, ServiceInvoice, ServiceInvoiceItem } from '../../types';

import { ServiceWorkspaceHeader } from '../../components/ServiceWorkspaceHeader';

interface CartItem {
  service: ServiceItem;
  quantity: number;
  assignedStaffId?: string;
  assignedStaffName?: string;
  customPrice?: number;
}

interface ServicePosViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const ServicePosView: React.FC<ServicePosViewProps> = ({ onNavigateTab }) => {
  const [sector, setSector] = useState(serviceStore.getActiveSector());
  const cfg = getServiceSectorConfig(sector);
  const services = serviceStore.getServices();
  const staffList = serviceStore.getStaff();
  const customers = serviceStore.getCustomers();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer details
  const [customerName, setCustomerName] = useState<string>('Walk-in Client');
  const [customerMobile, setCustomerMobile] = useState<string>('9876543210');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Additional billing adjustments
  const [labourCharges, setLabourCharges] = useState<number>(0);
  const [materialCharges, setMaterialCharges] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  // Completed Invoice Modal state
  const [completedInvoice, setCompletedInvoice] = useState<ServiceInvoice | null>(null);

  const categories = ['ALL', ...cfg.categories];

  const filteredServices = services.filter(srv => {
    const matchesCat = selectedCategory === 'ALL' || srv.category === selectedCategory;
    const matchesQuery = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.description && srv.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleAddToCart = (service: ServiceItem) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.service.id === service.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          service,
          quantity: 1,
          assignedStaffId: staffList[0]?.id,
          assignedStaffName: staffList[0]?.name
        }
      ];
    });
  };

  const handleUpdateQuantity = (serviceId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.service.id === serviceId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleAssignStaff = (serviceId: string, staffId: string) => {
    const staffObj = staffList.find(s => s.id === staffId);
    setCart(prev =>
      prev.map(item =>
        item.service.id === serviceId
          ? { ...item, assignedStaffId: staffId, assignedStaffName: staffObj?.name }
          : item
      )
    );
  };

  const handleRemoveFromCart = (serviceId: string) => {
    setCart(prev => prev.filter(item => item.service.id !== serviceId));
  };

  // Calculations
  const servicesSubtotal = cart.reduce((acc, item) => acc + (item.customPrice || item.service.price) * item.quantity, 0);
  const grossSubtotal = servicesSubtotal + labourCharges + materialCharges;
  const afterDiscount = Math.max(0, grossSubtotal - discountAmount);

  // Average GST 18% calculation
  const gstAmount = Math.round(afterDiscount * 0.18);
  const grandTotal = Math.round(afterDiscount + gstAmount);

  const handleSelectExistingCustomer = (custMobile: string) => {
    const found = customers.find(c => c.mobile === custMobile);
    if (found) {
      setCustomerName(found.name);
      setCustomerMobile(found.mobile);
      setSelectedCustomerId(found.id);
    }
  };

  const handleCompleteBilling = () => {
    if (cart.length === 0) {
      alert("Please add at least one service to cart");
      return;
    }

    const invoiceItems: ServiceInvoiceItem[] = cart.map((item, idx) => ({
      id: `ii-${idx + 1}`,
      serviceId: item.service.id,
      name: item.assignedStaffName ? `${item.service.name} (${item.assignedStaffName})` : item.service.name,
      type: 'SERVICE' as const,
      price: item.customPrice || item.service.price,
      quantity: item.quantity,
      total: (item.customPrice || item.service.price) * item.quantity
    }));

    if (labourCharges > 0) {
      invoiceItems.push({
        id: `ii-labour`,
        name: 'Labour & Workmanship Charges',
        type: 'LABOUR' as const,
        price: labourCharges,
        quantity: 1,
        total: labourCharges
      });
    }

    if (materialCharges > 0) {
      invoiceItems.push({
        id: `ii-mat`,
        name: 'Material & Replacement Parts',
        type: 'MATERIAL' as const,
        price: materialCharges,
        quantity: 1,
        total: materialCharges
      });
    }

    const created = serviceStore.createInvoice({
      customerId: selectedCustomerId || `cust-${Date.now()}`,
      customerName: customerName || 'Walk-in Client',
      mobile: customerMobile || '9876543210',
      date: new Date().toISOString().split('T')[0],
      items: invoiceItems,
      labourCharges,
      materialCharges,
      discount: discountAmount,
      gstAmount,
      grandTotal,
      paidAmount: grandTotal,
      balanceAmount: 0,
      paymentMethod,
      status: 'PAID',
      notes: `Service POS Billing • ${cfg.name}`
    });

    setCompletedInvoice(created);
    setCart([]);
    setLabourCharges(0);
    setMaterialCharges(0);
    setDiscountAmount(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {onNavigateTab && (
        <ServiceWorkspaceHeader
          activeTab="service_pos"
          onNavigateTab={onNavigateTab}
          onSectorChange={(s) => setSector(s)}
        />
      )}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>Service POS Billing</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                {cfg.name}
              </span>
            </h1>
            <p className="text-xs text-slate-400">Add services, assign staff, adjust charges & generate GST bill</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Catalog & Service Selector */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Categories */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={`Search ${cfg.name} services...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredServices.map(srv => {
              const inCart = cart.find(c => c.service.id === srv.id);
              return (
                <div
                  key={srv.id}
                  onClick={() => handleAddToCart(srv)}
                  className={`bg-slate-900 border p-3.5 rounded-2xl cursor-pointer transition-all hover:border-blue-500/50 space-y-2 relative ${
                    inCart ? 'border-blue-500 bg-blue-950/20' : 'border-slate-800'
                  }`}
                >
                  {srv.isPopular && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-extrabold border border-amber-500/30">
                      Popular
                    </span>
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-white pr-12">{srv.name}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{srv.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{srv.durationMinutes} mins</span>
                    </div>
                    <div className="font-black text-emerald-400 text-sm">
                      ₹{srv.price}
                    </div>
                  </div>

                  {inCart && (
                    <div className="flex items-center justify-between pt-1.5 text-[10px] font-extrabold text-blue-400">
                      <span>In Cart: {inCart.quantity}</span>
                      <span>Click to Add More</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Billing Cart Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                <span>Service Cart ({cart.length})</span>
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Customer Inputs */}
            <div className="bg-slate-800/60 p-3 rounded-xl space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Client Details</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={customerMobile}
                    onChange={e => setCustomerMobile(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Cart is empty. Select services from left panel.
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.service.id} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-white truncate">{item.service.name}</p>
                        <p className="text-[10px] font-bold text-emerald-400">₹{item.service.price} x {item.quantity}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleUpdateQuantity(item.service.id, -1)}
                          className="p-1 bg-slate-700 text-white rounded hover:bg-slate-600 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.service.id, 1)}
                          className="p-1 bg-slate-700 text-white rounded hover:bg-slate-600 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.service.id)}
                          className="p-1 text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Staff Assignment per Service Item */}
                    <div className="flex items-center gap-2 pt-1.5 border-t border-slate-700/50">
                      <span className="text-[10px] text-slate-400 font-semibold">{cfg.staffTerm.split('/')[0]}:</span>
                      <select
                        value={item.assignedStaffId || ''}
                        onChange={e => handleAssignStaff(item.service.id, e.target.value)}
                        className="bg-slate-900 text-white text-[10px] rounded px-2 py-1 border border-slate-700 focus:outline-none"
                      >
                        {staffList.map(st => (
                          <option key={st.id} value={st.id}>{st.name} ({st.specialty})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Additional Charges & Discounts */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Labour & Material Adjustments</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Labour (₹)</label>
                  <input
                    type="number"
                    value={labourCharges || ''}
                    onChange={e => setLabourCharges(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Parts (₹)</label>
                  <input
                    type="number"
                    value={materialCharges || ''}
                    onChange={e => setMaterialCharges(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Discount (₹)</label>
                  <input
                    type="number"
                    value={discountAmount || ''}
                    onChange={e => setDiscountAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method & Total Summary */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Services Subtotal:</span>
              <span className="font-bold text-white">₹{servicesSubtotal}</span>
            </div>
            {labourCharges > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Labour Charges:</span>
                <span className="font-bold text-white">+ ₹{labourCharges}</span>
              </div>
            )}
            {materialCharges > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Parts & Material:</span>
                <span className="font-bold text-white">+ ₹{materialCharges}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>GST (18%):</span>
              <span className="font-bold text-white">+ ₹{gstAmount}</span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-800">
              <span className="font-black text-white">Grand Total:</span>
              <span className="text-lg font-black text-emerald-400">₹{grandTotal}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-1.5">
              {(['UPI', 'CASH', 'BANK', 'OTHER'] as PaymentMethod[]).map(pm => (
                <button
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    paymentMethod === pm
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>

            <button
              onClick={handleCompleteBilling}
              disabled={cart.length === 0}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Complete & Print GST Bill (₹{grandTotal})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Completed Invoice Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl relative">
            <button
              onClick={() => setCompletedInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black">Invoice Generated Successfully!</h3>
              <p className="text-xs text-slate-400">{completedInvoice.invoiceNo} • {completedInvoice.date}</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl space-y-2 border border-slate-700/60 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Client:</span>
                <span className="font-bold text-white">{completedInvoice.customerName} ({completedInvoice.mobile})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method:</span>
                <span className="font-bold text-emerald-400">{completedInvoice.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-slate-700/60 space-y-1">
                {completedInvoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-bold">₹{item.total}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-700 text-emerald-400">
                <span>Grand Total Paid:</span>
                <span>₹{completedInvoice.grandTotal}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => {
                  const msg = `Hello ${completedInvoice.customerName}, your service invoice ${completedInvoice.invoiceNo} for ₹${completedInvoice.grandTotal} is paid. Thank you!`;
                  window.open(`https://wa.me/91${completedInvoice.mobile}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
