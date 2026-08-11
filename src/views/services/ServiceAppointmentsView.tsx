import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  Share2,
  Filter,
  Sparkles,
  Pencil,
  Trash2
} from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { Appointment, AppointmentStatus } from '../../types';

interface ServiceAppointmentsViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const ServiceAppointmentsView: React.FC<ServiceAppointmentsViewProps> = ({ onNavigateTab }) => {
  const [sector, setSector] = useState(serviceStore.getActiveSector());
  const cfg = getServiceSectorConfig(sector);
  const [refreshTick, setRefreshTick] = useState(0);
  const appointments = serviceStore.getAppointments();
  const services = serviceStore.getServices();
  const staff = serviceStore.getStaff();

  const [search, setSearch] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);

  // New/Edit Appointment Form
  const [custName, setCustName] = useState<string>('');
  const [custMobile, setCustMobile] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || '');
  const [appDate, setAppDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appTime, setAppTime] = useState<string>('11:00');
  const [notes, setNotes] = useState<string>('');

  const resetForm = () => {
    setCustName('');
    setCustMobile('');
    setSelectedServiceId(services[0]?.id || '');
    setSelectedStaffId(staff[0]?.id || '');
    setAppDate(new Date().toISOString().split('T')[0]);
    setAppTime('11:00');
    setNotes('');
    setEditingAppId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (app: Appointment) => {
    setEditingAppId(app.id);
    setCustName(app.customerName);
    setCustMobile(app.mobile);
    setSelectedServiceId(app.serviceId);
    setSelectedStaffId(app.staffId);
    setAppDate(app.date);
    setAppTime(app.time);
    setNotes(app.notes || '');
    setShowModal(true);
  };

  const handleDeleteAppointment = (app: Appointment) => {
    if (!window.confirm(`Cancel/delete the appointment for ${app.customerName} on ${app.date} at ${app.time}? This can't be undone.`)) return;
    serviceStore.deleteAppointment(app.id);
    setRefreshTick(t => t + 1);
  };

  const filtered = appointments.filter(a => {
    const matchesSearch = a.customerName.toLowerCase().includes(search.toLowerCase()) ||
      a.mobile.includes(search) || a.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custMobile) {
      alert("Please enter customer name and mobile");
      return;
    }
    const srvObj = services.find(s => s.id === selectedServiceId);
    const staffObj = staff.find(st => st.id === selectedStaffId);

    if (editingAppId) {
      serviceStore.updateAppointment(editingAppId, {
        customerName: custName,
        mobile: custMobile,
        serviceId: selectedServiceId,
        serviceName: srvObj?.name || 'Custom Service',
        staffId: selectedStaffId,
        staffName: staffObj?.name || 'Assigned Staff',
        date: appDate,
        time: appTime,
        notes,
        totalAmount: srvObj?.price || 500
      });
    } else {
      serviceStore.addAppointment({
        customerId: `scust-${Date.now()}`,
        customerName: custName,
        mobile: custMobile,
        serviceId: selectedServiceId,
        serviceName: srvObj?.name || 'Custom Service',
        staffId: selectedStaffId,
        staffName: staffObj?.name || 'Assigned Staff',
        date: appDate,
        time: appTime,
        status: 'Scheduled',
        notes,
        totalAmount: srvObj?.price || 500,
        paidAmount: 0
      });
    }

    setShowModal(false);
    resetForm();
    setRefreshTick(t => t + 1);
  };

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    serviceStore.updateAppointmentStatus(id, status);
    setRefreshTick(t => t + 1);
  };

  const handleWhatsAppReminder = (app: Appointment) => {
    const msg = `Hi ${app.customerName}, your appointment for ${app.serviceName} at ${cfg.name} is scheduled for ${app.date} at ${app.time}. Assigned ${cfg.staffTerm}: ${app.staffName}. Thank you!`;
    window.open(`https://wa.me/91${app.mobile}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-400" />
            <span>Appointment Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Schedule, track & send WhatsApp reminders for {cfg.name}</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Book New Appointment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Scheduled', 'In-Progress', 'Completed', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No appointments found for this filter.
          </div>
        ) : (
          filtered.map(app => (
            <div key={app.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-sm hover:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 py-1 bg-blue-900/40 border border-blue-500/30 rounded-lg text-center font-bold text-xs text-blue-300">
                    {app.time}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{app.customerName}</h3>
                    <p className="text-[10px] text-slate-400">{app.mobile}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  app.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                  app.status === 'In-Progress' ? 'bg-blue-500/20 text-blue-300' :
                  app.status === 'Cancelled' ? 'bg-red-500/20 text-red-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {app.status}
                </span>
              </div>

              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 space-y-1 text-xs">
                <p className="font-bold text-white truncate">{app.serviceName}</p>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Assigned: <strong className="text-slate-200">{app.staffName}</strong></span>
                  <span>Fee: <strong className="text-emerald-400">₹{app.totalAmount}</strong></span>
                </div>
              </div>

              {/* Status & WhatsApp Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <select
                  value={app.status}
                  onChange={e => handleStatusChange(app.id, e.target.value as AppointmentStatus)}
                  className="bg-slate-800 text-white text-[10px] rounded px-2 py-1 border border-slate-700"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleWhatsAppReminder(app)}
                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(app)}
                    title="Edit appointment"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteAppointment(app)}
                    title="Delete appointment"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateAppointment} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-white max-h-[92vh] overflow-y-auto">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-400" />
              <span>{editingAppId ? `Edit Appointment (${cfg.name})` : `Book Appointment (${cfg.name})`}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Sharma"
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={custMobile}
                  onChange={e => setCustMobile(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Select Service</label>
                <select
                  value={selectedServiceId}
                  onChange={e => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assign {cfg.staffTerm}</label>
                <select
                  value={selectedStaffId}
                  onChange={e => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {staff.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={appDate}
                    onChange={e => setAppDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Time Slot</label>
                  <input
                    type="time"
                    value={appTime}
                    onChange={e => setAppTime(e.target.value)}
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
                className="flex-1 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30"
              >
                {editingAppId ? 'Save Changes' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>
  );
};
