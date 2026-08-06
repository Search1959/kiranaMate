import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Share2,
  Receipt,
  Phone,
  MapPin,
  CreditCard,
  History,
  X,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';
import { Customer, CustomerTransaction, StoreSettings, LanguageCode } from '../types';
import { api } from '../lib/api';
import { getWhatsAppWebLink, generateUdhaarReminderText } from '../lib/whatsapp';

interface CustomersViewProps {
  customers: Customer[];
  settings: StoreSettings;
  lang: LanguageCode;
  onRefreshData: () => void;
  onOpenCollectPayment: (customer: Customer) => void;
  onOpenNewOrderForCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  settings,
  lang,
  onRefreshData,
  onOpenCollectPayment,
  onOpenNewOrderForCustomer
}) => {
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerLedger, setCustomerLedger] = useState<CustomerTransaction[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [confirmDeleteCustomer, setConfirmDeleteCustomer] = useState<Customer | null>(null);

  // New / Edit Customer Form State
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newArea, setNewArea] = useState('Subhash Nagar');
  const [newOpeningBalance, setNewOpeningBalance] = useState<number | ''>(0);
  const [newCreditLimit, setNewCreditLimit] = useState<number | ''>(5000);
  const [newNotes, setNewNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust);
    setNewName(cust.name);
    setNewMobile(cust.mobile);
    setNewAddress(cust.address || '');
    setNewArea(cust.area || 'Subhash Nagar');
    setNewOpeningBalance(cust.openingBalance || 0);
    setNewCreditLimit(cust.creditLimit || 5000);
    setNewNotes(cust.notes || '');
  };

  const handleDeleteCustomer = (cust: Customer) => {
    setConfirmDeleteCustomer(cust);
  };

  const executeDeleteCustomer = async () => {
    if (!confirmDeleteCustomer) return;
    const cust = confirmDeleteCustomer;
    setDeletingCustomerId(cust.id);
    setConfirmDeleteCustomer(null);

    try {
      await api.deleteCustomer(cust.id);
      onRefreshData();
      if (selectedCustomer?.id === cust.id) {
        setSelectedCustomer(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer');
    } finally {
      setDeletingCustomerId(null);
    }
  };

  const areas = Array.from(new Set(customers.map(c => c.area).filter(Boolean)));

  const filteredCustomers = customers.filter(c => {
    const areaStr = c.area || c.address || '';
    const matchesSearch = !search.trim() || (
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.mobile || '').includes(search) ||
      areaStr.toLowerCase().includes(search.toLowerCase())
    );
    const matchesArea = selectedArea === 'ALL' || c.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const handleSelectCustomer = async (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsLoadingLedger(true);
    try {
      const res = await api.getCustomerById(cust.id);
      setCustomerLedger(res.ledger || []);
    } catch {
      setCustomerLedger([]);
    } finally {
      setIsLoadingLedger(false);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newMobile) {
      alert("Please provide customer name and mobile number!");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, {
          name: newName,
          mobile: newMobile,
          address: newAddress || `${newArea}, Main Market`,
          area: newArea,
          creditLimit: Number(newCreditLimit) || 5000,
          notes: newNotes
        });
      } else {
        await api.createCustomer({
          name: newName,
          mobile: newMobile,
          address: newAddress || `${newArea}, Main Market`,
          area: newArea,
          openingBalance: Number(newOpeningBalance) || 0,
          creditLimit: Number(newCreditLimit) || 5000,
          notes: newNotes
        });
      }
      onRefreshData();
      setShowAddCustomerModal(false);
      setEditingCustomer(null);
      resetCustomerForm();
    } catch (err: any) {
      alert(err.message || 'Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  };

  const resetCustomerForm = () => {
    setNewName('');
    setNewMobile('');
    setNewAddress('');
    setNewArea('Subhash Nagar');
    setNewOpeningBalance(0);
    setNewCreditLimit(5000);
    setNewNotes('');
  };

  return (
    <div className="space-y-4 pb-12 sm:pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" /> Customer Directory & Udhaar Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Total {customers.length} registered shop customers
          </p>
        </div>

        <button
          onClick={() => setShowAddCustomerModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <UserPlus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      {/* Search & Area Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, mobile number or colony..."
            className="w-full bg-white border border-slate-300 rounded-2xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs"
          />
        </div>

        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="bg-white border border-slate-300 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs"
        >
          <option value="ALL">All Areas / Colonies ({areas.length})</option>
          {areas.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCustomers.map(cust => {
          const balance = cust.currentBalance ?? cust.outstandingBalance ?? 0;
          const hasUdhaar = balance > 0;
          return (
            <div
              key={cust.id}
              className={`bg-white p-4 rounded-3xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                hasUdhaar ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3
                      onClick={() => handleSelectCustomer(cust)}
                      className="font-bold text-slate-900 text-sm hover:text-emerald-700 cursor-pointer hover:underline"
                    >
                      {cust.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {cust.area || cust.address}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                    hasUdhaar ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Udhaar: ₹{balance.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-0.5 pt-2 border-t border-slate-100">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-600" /> +91 {cust.mobile}
                  </p>
                  <p className="text-slate-500">Address: {cust.address}</p>
                </div>
              </div>

              {/* Card Action Buttons: View/Ledger, Edit, Collect, WhatsApp, Delete */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSelectCustomer(cust)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 transition-colors"
                    title="View Customer Ledger"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" /> View
                  </button>

                  <button
                    onClick={() => handleOpenEditCustomer(cust)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 transition-colors"
                    title="Edit Customer Details"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-600" /> Edit
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenCollectPayment(cust)}
                    className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-2.5 py-1.5 rounded-xl text-[11px] shadow-2xs"
                  >
                    Collect
                  </button>

                  <a
                    href={getWhatsAppWebLink(cust.mobile, generateUdhaarReminderText(cust, settings, lang))}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center shadow-2xs"
                    title="WhatsApp Reminder"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDeleteCustomer(cust)}
                    disabled={deletingCustomerId === cust.id}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Profile & Ledger History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base leading-tight">{selectedCustomer.name} Profile</h3>
                <p className="text-[11px] text-emerald-200">+91 {selectedCustomer.mobile} • {selectedCustomer.area}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-full hover:bg-emerald-700 text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Udhaar Summary Box */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-800 font-bold uppercase tracking-wider block">Total Udhaar / Outstanding</span>
                  <span className="text-2xl font-black text-amber-950">₹{(selectedCustomer.currentBalance ?? selectedCustomer.outstandingBalance ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const c = selectedCustomer;
                      setSelectedCustomer(null);
                      onOpenCollectPayment(c);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3 py-2 rounded-xl text-xs"
                  >
                    Collect Payment
                  </button>
                  <a
                    href={getWhatsAppWebLink(selectedCustomer.mobile, generateUdhaarReminderText(selectedCustomer, settings, lang))}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center"
                    title="Send WhatsApp Reminder"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Transaction Ledger History */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-600" /> Account Transaction Ledger
                </h4>

                {isLoadingLedger ? (
                  <div className="p-4 text-center text-slate-400">Loading ledger...</div>
                ) : customerLedger.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-2xl">
                    No transactions recorded in ledger yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white p-2">
                    {customerLedger.map(tx => (
                      <div key={tx.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                        <div>
                          <span className={`font-bold block ${tx.type === 'PAYMENT_RECEIVED' ? 'text-emerald-700' : 'text-amber-800'}`}>
                            {tx.type === 'PAYMENT_RECEIVED' ? '🟢 Payment Received' : tx.type === 'CREDIT_SALE' ? '🔴 Credit Sale' : '⚪ Opening Balance'}
                          </span>
                          <span className="text-[10px] text-slate-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN') : 'N/A'}</span>
                          {tx.notes && <p className="text-[10px] text-slate-600">{tx.notes}</p>}
                        </div>

                        <div className="text-right">
                          <span className={`font-black text-sm block ${tx.type === 'PAYMENT_RECEIVED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {tx.type === 'PAYMENT_RECEIVED' ? `- ₹${(tx.amount ?? 0).toLocaleString('en-IN')}` : `+ ₹${(tx.amount ?? 0).toLocaleString('en-IN')}`}
                          </span>
                          <span className="text-[10px] text-slate-400">Bal: ₹{(tx.balanceAfter ?? 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {(showAddCustomerModal || editingCustomer) && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <UserPlus className="w-5 h-5 text-amber-300" />
                <span>{editingCustomer ? 'Edit Customer Record' : 'Add New Shop Customer'}</span>
              </div>
              <button
                onClick={() => {
                  setShowAddCustomerModal(false);
                  setEditingCustomer(null);
                  resetCustomerForm();
                }}
                className="p-1 rounded-full hover:bg-emerald-700 text-emerald-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rameshwar Sharma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Number (10 Digits) *</label>
                <input
                  type="tel"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="e.g. 9829012345"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area / Colony</label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="e.g. Subhash Nagar"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {!editingCustomer && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Opening Udhaar (₹)</label>
                    <input
                      type="number"
                      value={newOpeningBalance}
                      onChange={(e) => setNewOpeningBalance(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. House No. 45, Street 3"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isSaving ? 'Saving Customer...' : editingCustomer ? 'UPDATE CUSTOMER DETAILS' : 'SAVE CUSTOMER TO DIRECTORY'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE CUSTOMER MODAL */}
      {confirmDeleteCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Customer?</h3>
                <p className="text-xs text-slate-500">{confirmDeleteCustomer.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              Are you sure you want to delete customer <strong>"{confirmDeleteCustomer.name}"</strong>? This action will remove the customer record from your store.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmDeleteCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteCustomer}
                disabled={deletingCustomerId === confirmDeleteCustomer.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {deletingCustomerId === confirmDeleteCustomer.id ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
