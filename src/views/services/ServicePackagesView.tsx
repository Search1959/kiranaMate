import React, { useState } from 'react';
import { Package, Plus, Check, Pencil, Trash2 } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { ServicePackage } from '../../types';

export const ServicePackagesView: React.FC = () => {
  const activeSector = serviceStore.getActiveSector();
  const cfg = getServiceSectorConfig(activeSector);
  const [refreshTick, setRefreshTick] = useState(0);
  const packages = serviceStore.getPackages();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<ServicePackage | null>(null);
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<number>(2000);
  const [days, setDays] = useState<number>(365);
  const [desc, setDesc] = useState<string>('');
  const [isAmc, setIsAmc] = useState<boolean>(true);

  const openCreate = () => {
    setEditingPackage(null);
    setName('');
    setPrice(2000);
    setDays(365);
    setDesc('');
    setIsAmc(true);
    setShowModal(true);
  };

  const openEdit = (pk: ServicePackage) => {
    setEditingPackage(pk);
    setName(pk.name);
    setPrice(pk.price);
    setDays(pk.durationDays);
    setDesc(pk.description);
    setIsAmc(pk.isAmc);
    setShowModal(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) {
      alert("Please enter package name and price");
      return;
    }
    if (editingPackage) {
      serviceStore.updatePackage(editingPackage.id, {
        name,
        price,
        durationDays: days,
        description: desc || 'Annual Service & AMC Protection Package',
        isAmc
      });
    } else {
      serviceStore.addPackage({
        name,
        price,
        durationDays: days,
        includedServices: ['Preventive Checks', 'Priority Visits', 'Discounts'],
        discountPercent: 20,
        description: desc || 'Annual Service & AMC Protection Package',
        isAmc
      });
    }
    setShowModal(false);
    setEditingPackage(null);
    setRefreshTick(t => t + 1);
  };

  const confirmDelete = () => {
    if (!deletingPackage) return;
    serviceStore.deletePackage(deletingPackage.id);
    setDeletingPackage(null);
    setRefreshTick(t => t + 1);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            <span>Service Packages & AMC Contracts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Recurring memberships, AMC plans & renewal passes for {cfg.name}</p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Package / AMC</span>
        </button>
      </div>

      {packages.length === 0 && (
        <div className="text-center text-xs text-slate-500 py-10">No packages yet — create your first membership or AMC plan above.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map(pk => (
          <div key={pk.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative">
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {pk.isAmc && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                  AMC CONTRACT
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white pr-8">{pk.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{pk.description}</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-400">₹{pk.price}</span>
              <span className="text-xs text-slate-400">/ {pk.durationDays} Days</span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
              {pk.includedServices.map((inc, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{inc}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => openEdit(pk)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3 h-3 text-amber-400" /> Edit
              </button>
              <button
                onClick={() => setDeletingPackage(pk)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-rose-400" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSavePackage} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-white">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>{editingPackage ? 'Edit Package / AMC Plan' : 'New Package / AMC Plan'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Annual AMC Shield"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    required
                    value={days}
                    onChange={e => setDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Inclusions and details..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAmc"
                  checked={isAmc}
                  onChange={e => setIsAmc(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isAmc" className="text-slate-300 font-semibold cursor-pointer">Mark as AMC Contract</label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowModal(false); setEditingPackage(null); }}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 cursor-pointer"
              >
                {editingPackage ? 'Save Changes' : 'Save Package'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deletingPackage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/60 rounded-2xl max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              Delete "{deletingPackage.name}"?
            </h3>
            <p className="text-[11px] text-slate-400">
              This removes the package/plan from your offerings. Clients already subscribed are not affected.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingPackage(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
