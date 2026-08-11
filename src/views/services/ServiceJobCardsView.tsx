import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  IndianRupee,
  Share2,
  FileText,
  X,
  Pencil,
  Trash2
} from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { JobCard, JobCardStatus, JobPriority } from '../../types';

interface ServiceJobCardsViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const ServiceJobCardsView: React.FC<ServiceJobCardsViewProps> = ({ onNavigateTab }) => {
  const [sector, setSector] = useState(serviceStore.getActiveSector());
  const cfg = getServiceSectorConfig(sector);
  const [refreshTick, setRefreshTick] = useState(0);
  const jobCards = serviceStore.getJobCards();
  const staff = serviceStore.getStaff();

  const [search, setSearch] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // New/Edit Job Card Form
  const [custName, setCustName] = useState<string>('');
  const [custMobile, setCustMobile] = useState<string>('');
  const [assignedStaffId, setAssignedStaffId] = useState<string>(staff[0]?.id || '');
  const [priority, setPriority] = useState<JobPriority>('Medium');
  const [issueDesc, setIssueDesc] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const [labour, setLabour] = useState<number>(500);
  const [material, setMaterial] = useState<number>(0);

  const resetForm = () => {
    setCustName('');
    setCustMobile('');
    setAssignedStaffId(staff[0]?.id || '');
    setPriority('Medium');
    setIssueDesc('');
    setDeviceInfo('');
    setLabour(500);
    setMaterial(0);
    setEditingJobId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (j: JobCard) => {
    setEditingJobId(j.id);
    setCustName(j.customerName);
    setCustMobile(j.mobile);
    setAssignedStaffId(j.assignedStaffId);
    setPriority(j.priority);
    setIssueDesc(j.issueDescription);
    setDeviceInfo(j.deviceOrVehicleInfo);
    setLabour(j.labourCharges);
    setMaterial(j.materialCharges);
    setShowModal(true);
  };

  const handleDeleteJobCard = (j: JobCard) => {
    if (!window.confirm(`Delete work order ${j.jobNo} for ${j.customerName}? This can't be undone.`)) return;
    serviceStore.deleteJobCard(j.id);
    setRefreshTick(t => t + 1);
  };

  const filtered = jobCards.filter(j => {
    const matchesSearch = j.jobNo.toLowerCase().includes(search.toLowerCase()) ||
      j.customerName.toLowerCase().includes(search.toLowerCase()) ||
      j.mobile.includes(search) || j.issueDescription.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || j.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJobCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custMobile || !issueDesc) {
      alert("Please fill client name, mobile and issue description");
      return;
    }
    const staffObj = staff.find(st => st.id === assignedStaffId);
    const tot = labour + material;

    if (editingJobId) {
      const existing = jobCards.find(j => j.id === editingJobId);
      const alreadyPaid = existing?.paidAmount || 0;
      serviceStore.updateJobCard(editingJobId, {
        customerName: custName,
        mobile: custMobile,
        assignedStaffId,
        assignedStaffName: staffObj?.name || 'Assigned Technician',
        priority,
        issueDescription: issueDesc,
        deviceOrVehicleInfo: deviceInfo || `${cfg.name} Work Order`,
        partsUsed: material > 0 ? [{ id: 'p1', name: 'Parts & Spare Materials', quantity: 1, unitPrice: material, totalPrice: material }] : [],
        labourCharges: labour,
        materialCharges: material,
        totalAmount: tot,
        balanceAmount: Math.max(0, tot - alreadyPaid)
      });
    } else {
      serviceStore.addJobCard({
        customerId: `scust-${Date.now()}`,
        customerName: custName,
        mobile: custMobile,
        assignedStaffId,
        assignedStaffName: staffObj?.name || 'Assigned Technician',
        status: 'Pending',
        priority,
        issueDescription: issueDesc,
        deviceOrVehicleInfo: deviceInfo || `${cfg.name} Work Order`,
        partsUsed: material > 0 ? [{ id: 'p1', name: 'Parts & Spare Materials', quantity: 1, unitPrice: material, totalPrice: material }] : [],
        labourCharges: labour,
        materialCharges: material,
        totalAmount: tot,
        paidAmount: 0,
        balanceAmount: tot,
        estimatedCompletionDate: new Date().toISOString().split('T')[0]
      });
    }

    setShowModal(false);
    resetForm();
    setRefreshTick(t => t + 1);
  };

  const handleUpdateStatus = (id: string, status: JobCardStatus) => {
    serviceStore.updateJobCardStatus(id, status);
    setRefreshTick(t => t + 1);
  };

  const handleWhatsApp = (j: JobCard) => {
    const msg = `Hi ${j.customerName}, your ${cfg.workOrderTerm} (${j.jobNo}) status is updated to '${j.status}'. Balance Due: ₹${j.balanceAmount}. Thank you (${cfg.name})!`;
    window.open(`https://wa.me/91${j.mobile}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-400" />
            <span>{cfg.workOrderTerm} / Work Orders</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Track active jobs, technician assignments, parts & billing for {cfg.name}</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New {cfg.workOrderTerm}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search job #, client, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Pending', 'In-Progress', 'Completed', 'Delivered'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No work orders found.
          </div>
        ) : (
          filtered.map(j => (
            <div key={j.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-sm hover:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-300">{j.jobNo}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                    j.priority === 'Urgent' ? 'bg-red-500/20 text-red-300' :
                    j.priority === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {j.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    j.status === 'Completed' || j.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                    j.status === 'In-Progress' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {j.status}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(j)}
                    title="Edit work order"
                    className="p-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteJobCard(j)}
                    title="Delete work order"
                    className="p-1 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white">{j.customerName} ({j.mobile})</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{j.deviceOrVehicleInfo}</p>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{j.issueDescription}</p>
              </div>

              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 space-y-1 text-xs">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Assigned: <strong className="text-slate-200">{j.assignedStaffName}</strong></span>
                  <span>Total: <strong className="text-emerald-400">₹{j.totalAmount}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <select
                  value={j.status}
                  onChange={e => handleUpdateStatus(j.id, e.target.value as JobCardStatus)}
                  className="bg-slate-800 text-white text-[10px] rounded px-2 py-1 border border-slate-700"
                >
                  <option value="Pending">Pending</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                </select>

                <button
                  onClick={() => handleWhatsApp(j)}
                  className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Update Client</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Job Card Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateJobCard} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-white max-h-[92vh] overflow-y-auto">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-400" />
              <span>{editingJobId ? `Edit ${cfg.workOrderTerm}` : `Create ${cfg.workOrderTerm}`}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Anand Sharma"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mobile</label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    value={custMobile}
                    onChange={e => setCustMobile(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Item / Device / Vehicle Info</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 Pro or Honda City MH-12-AB-1234"
                  value={deviceInfo}
                  onChange={e => setDeviceInfo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Work Description & Requirement</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe work to be performed..."
                  value={issueDesc}
                  onChange={e => setIssueDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Assign {cfg.staffTerm}</label>
                  <select
                    value={assignedStaffId}
                    onChange={e => setAssignedStaffId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    {staff.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as JobPriority)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Labour Charge (₹)</label>
                  <input
                    type="number"
                    value={labour}
                    onChange={e => setLabour(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Parts/Material (₹)</label>
                  <input
                    type="number"
                    value={material}
                    onChange={e => setMaterial(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
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
                className="flex-1 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30"
              >
                {editingJobId ? 'Save Changes' : 'Create Job Card'}
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>
  );
};
