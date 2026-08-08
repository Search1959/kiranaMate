import React, { useState } from 'react';
import {
  Users,
  Building2,
  Phone,
  MapPin,
  Plus,
  Search,
  DollarSign,
  Truck,
  Receipt,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Scan,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { Supplier, Purchase, StoreSettings } from '../types';
import { api } from '../lib/api';
import { formatMoney } from '../lib/currency';

interface SuppliersViewProps {
  suppliers: Supplier[];
  purchases: Purchase[];
  settings: StoreSettings;
  onRefreshData: () => void;
  onOpenAddStock: () => void;
  onOpenScanBill: () => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  purchases,
  settings,
  onRefreshData,
  onOpenAddStock,
  onOpenScanBill
}) => {
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplierForPay, setSelectedSupplierForPay] = useState<Supplier | null>(null);

  // New Supplier Form
  const [newSupName, setNewSupName] = useState('');
  const [newSupCompany, setNewSupCompany] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupMobile, setNewSupMobile] = useState('');
  const [newSupGstin, setNewSupGstin] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('');
  const [newSupCity, setNewSupCity] = useState('');
  const [newSupBalance, setNewSupBalance] = useState<number>(0);
  const [newSupNotes, setNewSupNotes] = useState('');

  // Settle Payment Form
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'CASH' | 'UPI' | 'BANK'>('CASH');
  const [payNotes, setPayNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtered suppliers list
  const filteredSuppliers = suppliers.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.companyName && s.companyName.toLowerCase().includes(q)) ||
      s.mobile.includes(q) ||
      (s.gstin && s.gstin.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q))
    );
  });

  // Calculate Summary Metrics
  const totalSuppliersCount = suppliers.length;
  const totalOutstandingPayable = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
  const totalPurchasesVal = purchases.reduce((sum, p) => sum + (p.grandTotal || p.totalAmount || 0), 0);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim() || !newSupMobile.trim()) {
      setErrorMsg('Please enter Supplier Name and Mobile number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.createSupplier({
        name: newSupName.trim(),
        companyName: newSupCompany.trim() || newSupName.trim(),
        contactPerson: newSupContact.trim() || newSupName.trim(),
        mobile: newSupMobile.trim(),
        gstin: newSupGstin.trim() || undefined,
        address: newSupAddress.trim() || 'Wholesale Market',
        city: newSupCity.trim() || 'City',
        outstandingBalance: Number(newSupBalance) || 0,
        notes: newSupNotes.trim() || undefined
      });

      setSuccessMsg(`Supplier "${newSupName}" added successfully!`);
      setIsAddSupplierModalOpen(false);
      resetAddForm();
      onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setNewSupName('');
    setNewSupCompany('');
    setNewSupContact('');
    setNewSupMobile('');
    setNewSupGstin('');
    setNewSupAddress('');
    setNewSupCity('');
    setNewSupBalance(0);
    setNewSupNotes('');
  };

  const handleOpenPayModal = (sup: Supplier) => {
    setSelectedSupplierForPay(sup);
    setPayAmount(sup.outstandingBalance || 0);
    setPayMethod('CASH');
    setPayNotes('');
    setIsPayModalOpen(true);
  };

  const handleSettleSupplierPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPay) return;
    if (payAmount <= 0) {
      setErrorMsg('Payment amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Record payment against supplier khata balance by creating a paid purchase/adjustment
      const newBal = Math.max(0, (selectedSupplierForPay.outstandingBalance || 0) - payAmount);
      
      // Update supplier balance via API or purchase record
      await api.createPurchase({
        supplierId: selectedSupplierForPay.id,
        supplierName: selectedSupplierForPay.name,
        invoiceNumber: `PAY-${Date.now().toString().slice(-6)}`,
        purchaseDate: new Date().toISOString().split('T')[0],
        items: [],
        subtotal: 0,
        taxAmount: 0,
        grandTotal: -payAmount, // Negative amount to reduce balance
        paidAmount: payAmount,
        paymentStatus: 'PAID',
        notes: `Vendor Khata Payment (${payMethod}): ${payNotes || 'Payment to wholesale vendor'}`
      });

      setSuccessMsg(`Payment of ${money(payAmount)} recorded for ${selectedSupplierForPay.name}. New Balance: ${money(newBal)}`);
      setIsPayModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record supplier payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Wholesale Suppliers & Vendor Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage distributor contacts, purchase invoices, and vendor outstanding balance (Udhaar Khata)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanBill}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Scan className="w-4 h-4" /> AI Scan Bill
          </button>

          <button
            onClick={() => {
              setErrorMsg(null);
              resetAddForm();
              setIsAddSupplierModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Wholesale Supplier
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="font-bold text-emerald-600">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="font-bold text-red-600">×</button>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Suppliers</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalSuppliersCount}</span>
            <span className="text-[11px] text-slate-400">Registered distributors</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Payable Khata Balance</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{money(totalOutstandingPayable)}</span>
            <span className="text-[11px] text-slate-400">Total amount shop owes to vendors</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Purchases</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{money(totalPurchasesVal)}</span>
            <span className="text-[11px] text-slate-400">{purchases.length} Purchase Invoices</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search supplier by name, company, phone, GSTIN..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            Showing {filteredSuppliers.length} suppliers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase">
                <th className="py-3 px-4">Supplier / Vendor</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">GSTIN & Location</th>
                <th className="py-3 px-4">Payable Balance (Khata)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No suppliers found matching your query.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">{sup.name}</div>
                      {sup.companyName && (
                        <div className="text-[11px] text-slate-500 font-medium">{sup.companyName}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{sup.mobile}</span>
                      </div>
                      {sup.contactPerson && (
                        <div className="text-[11px] text-slate-500">Person: {sup.contactPerson}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{sup.city || 'Local Area'}</span>
                      </div>
                      {sup.gstin ? (
                        <div className="text-[10px] font-mono text-emerald-700 font-bold">GSTIN: {sup.gstin}</div>
                      ) : (
                        <div className="text-[10px] text-slate-400">Unregistered</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {(sup.outstandingBalance ?? 0) > 0 ? (
                        <div className="inline-flex flex-col">
                          <span className="text-sm font-black text-rose-600">
                            {money(sup.outstandingBalance)}
                          </span>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            Payment Due
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Clear (Nil)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {sup.outstandingBalance > 0 && (
                          <button
                            onClick={() => handleOpenPayModal(sup)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay Khata
                          </button>
                        )}

                        <button
                          onClick={onOpenAddStock}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-xs cursor-pointer"
                        >
                          + Purchase Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Wholesale Supplier */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Add Wholesale Supplier / Vendor</span>
              </h2>
              <button
                onClick={() => setIsAddSupplierModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier / Trade Name *</label>
                  <input
                    type="text"
                    required
                    value={newSupName}
                    onChange={(e) => setNewSupName(e.target.value)}
                    placeholder="e.g. Laxmi Wholesale Traders"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    value={newSupCompany}
                    onChange={(e) => setNewSupCompany(e.target.value)}
                    placeholder="e.g. Fortune Oil Depot"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={newSupMobile}
                    onChange={(e) => setNewSupMobile(e.target.value)}
                    placeholder="e.g. 9826012345"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={newSupContact}
                    onChange={(e) => setNewSupContact(e.target.value)}
                    placeholder="e.g. Rajesh Agarwal"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={newSupGstin}
                    onChange={(e) => setNewSupGstin(e.target.value)}
                    placeholder="23AAAAA0000A1Z5"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono uppercase font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Market Location</label>
                  <input
                    type="text"
                    value={newSupCity}
                    onChange={(e) => setNewSupCity(e.target.value)}
                    placeholder="e.g. Wholesale Grain Market"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Opening Payable Balance ({settings.currencySymbol})</label>
                <input
                  type="number"
                  min={0}
                  value={newSupBalance}
                  onChange={(e) => setNewSupBalance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-extrabold text-rose-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Enter amount if shop already owes money to this vendor</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={newSupAddress}
                  onChange={(e) => setNewSupAddress(e.target.value)}
                  placeholder="Shop No. 12, Main Mandi Gate"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Supplier Khata Payment */}
      {isPayModalOpen && selectedSupplierForPay && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Settle Vendor Khata Payment</span>
              </h2>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
              <span className="text-[11px] font-bold text-rose-800 block">Supplier</span>
              <span className="font-extrabold text-slate-900 text-sm block">{selectedSupplierForPay.name}</span>
              <span className="text-xs text-rose-700 font-bold mt-1 block">
                Total Outstanding Due: {money(selectedSupplierForPay.outstandingBalance)}
              </span>
            </div>

            <form onSubmit={handleSettleSupplierPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Amount Paid ({settings.currencySymbol}) *</label>
                <input
                  type="number"
                  min={1}
                  max={selectedSupplierForPay.outstandingBalance || 9999999}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-black text-emerald-700 text-base focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold focus:outline-none"
                >
                  <option value="CASH">Cash Payment</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="BANK">Bank Transfer / NEFT</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Receipt / Payment Notes</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid via GPay / Receipt Ref No."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Record Payment Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
