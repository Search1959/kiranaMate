import React, { useState } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, Calendar, Wrench, Shield, Pencil, Trash2 } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { ServiceCustomer } from '../../types';

interface ServiceCustomersViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const ServiceCustomersView: React.FC<ServiceCustomersViewProps> = ({ onNavigateTab }) => {
  const [sector, setSector] = useState(serviceStore.getActiveSector());
  const cfg = getServiceSectorConfig(sector);
  const [refreshTick, setRefreshTick] = useState(0);
  const customers = serviceStore.getCustomers();

  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const resetForm = () => {
    setName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setNotes('');
    setEditingCustomerId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (c: ServiceCustomer) => {
    setEditingCustomerId(c.id);
    setName(c.name);
    setMobile(c.mobile);
    setEmail(c.email || '');
    setAddress(c.address || '');
    setNotes(c.notes || '');
    setShowModal(true);
  };

  const handleDeleteCustomer = (c: ServiceCustomer) => {
    if (!window.confirm(`Delete client "${c.name}" (${c.mobile})? This can't be undone.`)) return;
    serviceStore.deleteCustomer(c.id);
    setRefreshTick(t => t + 1);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert("Please enter customer name and mobile");
      return;
    }
    if (editingCustomerId) {
      serviceStore.updateCustomer(editingCustomerId, { name, mobile, email, address, notes });
    } else {
      serviceStore.addCustomer({
        name,
        mobile,
        email,
        address,
        notes
      });
    }
    setShowModal(false);
    resetForm();
    setRefreshTick(t => t + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Service {cfg.customerTerm} Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage client records, history, AMC contracts & notes for {cfg.name}</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New {cfg.customerTerm}</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search ${cfg.customerTerm} name or phone...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{c.name}</h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-400" />
                    <span>{c.mobile}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {c.amcStatus && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    c.amcStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    AMC {c.amcStatus}
                  </span>
                )}
                <button
                  onClick={() => handleOpenEdit(c)}
                  title="Edit client"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(c)}
                  title="Delete client"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Total Spent:</span>
                <span className="font-bold text-emerald-400">₹{c.totalSpent}</span>
              </div>
              {c.notes && <p className="text-[10px] text-slate-300 italic">{c.notes}</p>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddCustomer} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-white">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>{editingCustomerId ? `Edit ${cfg.customerTerm}` : `Add New ${cfg.customerTerm}`}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="client@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="Address..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30"
              >
                {editingCustomerId ? 'Save Changes' : 'Save Client'}
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>
  );
};
