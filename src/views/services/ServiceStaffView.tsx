import React, { useState } from 'react';
import { Users, Plus, Star, Phone, Award, DollarSign, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { ServiceStaff } from '../../types';

export const ServiceStaffView: React.FC = () => {
  const activeSector = serviceStore.getActiveSector();
  const cfg = getServiceSectorConfig(activeSector);
  const [refreshTick, setRefreshTick] = useState(0);
  const staff = serviceStore.getStaff();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>(cfg.staffTerm);
  const [mobile, setMobile] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('');
  const [commission, setCommission] = useState<number>(20);
  const [status, setStatus] = useState<ServiceStaff['status']>('Active');

  const resetForm = () => {
    setName('');
    setRole(cfg.staffTerm);
    setMobile('');
    setSpecialty('');
    setCommission(20);
    setStatus('Active');
    setEditingStaffId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (st: ServiceStaff) => {
    setEditingStaffId(st.id);
    setName(st.name);
    setRole(st.role);
    setMobile(st.mobile);
    setSpecialty(st.specialty);
    setCommission(st.commissionPercent);
    setStatus(st.status);
    setShowModal(true);
  };

  const handleDeleteStaff = (st: ServiceStaff) => {
    if (!window.confirm(`Remove ${st.name} from your ${cfg.staffTerm.toLowerCase()} roster? This can't be undone.`)) return;
    serviceStore.deleteStaff(st.id);
    setRefreshTick(t => t + 1);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert("Please enter staff name and mobile");
      return;
    }
    if (editingStaffId) {
      serviceStore.updateStaff(editingStaffId, {
        name,
        role,
        mobile,
        specialty: specialty || 'General Specialist',
        commissionPercent: commission,
        status
      });
    } else {
      serviceStore.addStaff({
        name,
        role,
        mobile,
        specialty: specialty || 'General Specialist',
        rating: 4.8,
        totalJobsCompleted: 0,
        commissionPercent: commission,
        dailyTarget: 5000,
        status: 'Active'
      });
    }
    setShowModal(false);
    resetForm();
    setRefreshTick(t => t + 1);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>{cfg.staffTerm} Roster & Commission</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Track duty roster, performance rating & commissions for {cfg.name}</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New {cfg.staffTerm.split('/')[0]}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(st => (
          <div key={st.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                  {st.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{st.name}</h3>
                  <p className="text-[10px] text-slate-400">{st.role}</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{st.rating}</span>
              </span>
            </div>

            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 text-[11px] space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Specialty:</span>
                <span className="font-bold text-white">{st.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jobs Completed:</span>
                <span className="font-bold text-emerald-400">{st.totalJobsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Commission Rate:</span>
                <span className="font-bold text-blue-400">{st.commissionPercent}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                st.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                st.status === 'Busy' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {st.status}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(st)}
                  title="Edit staff"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteStaff(st)}
                  title="Remove staff"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddStaff} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-white">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>{editingStaffId ? 'Edit Staff Member' : 'Add Staff Member'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mobile</label>
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
                <label className="block text-slate-400 mb-1">Specialty & Skills</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Technician"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Commission Percent (%)</label>
                <input
                  type="number"
                  value={commission}
                  onChange={e => setCommission(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              {editingStaffId && (
                <div>
                  <label className="block text-slate-400 mb-1">Duty Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as ServiceStaff['status'])}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Busy">Busy</option>
                    <option value="On-Leave">On-Leave</option>
                  </select>
                </div>
              )}
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
                {editingStaffId ? 'Save Changes' : 'Save Staff'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
