import React, { useState } from 'react';
import {
  Calendar,
  Wrench,
  Clock,
  CheckCircle,
  IndianRupee,
  Users,
  Star,
  PlusCircle,
  ShoppingCart,
  FileText,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Shield,
  Layers,
  Search,
  Zap,
  Briefcase,
  GraduationCap,
  Smartphone,
  Smile,
  Droplets,
  Server,
  Camera,
  Printer,
  Hotel,
  Building,
  Shirt,
  Sprout,
  Truck,
  Landmark,
  Building2,
  Sun,
  Gamepad2,
  Check,
  ChevronRight
} from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { clientStore } from '../../lib/clientStore';
import { ServiceSector } from '../../types';
import { ServiceWorkspaceHeader } from '../../components/ServiceWorkspaceHeader';

interface ServiceDashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenQuickAction?: (action: string) => void;
}

export const ServiceDashboardView: React.FC<ServiceDashboardViewProps> = ({
  onNavigateTab,
  onOpenQuickAction
}) => {
  const [activeSector, setActiveSector] = useState<ServiceSector>(serviceStore.getActiveSector());
  const [showToast, setShowToast] = useState<string | null>(null);

  const cfg = getServiceSectorConfig(activeSector);
  const stats = serviceStore.getStats();
  const appointments = serviceStore.getAppointments().slice(0, 5);
  const jobCards = serviceStore.getJobCards().slice(0, 5);
  const staff = serviceStore.getStaff();

  const handleSectorChange = (s: ServiceSector) => {
    serviceStore.setActiveSector(s);
    setActiveSector(s);
    const newCfg = getServiceSectorConfig(s);
    setShowToast(`Switched Workspace to ${newCfg.name}! Custom params & demo data loaded.`);
    setTimeout(() => setShowToast(null), 3500);
  };

  // High-value SaaS modules list
  const premiumModules = [
    { title: 'AMC Management', desc: 'Annual Maintenance Contracts, Renewal Alerts & Schedule', icon: Shield, badge: 'Popular' },
    { title: 'Subscription & Memberships', desc: 'Monthly/Annual Passes, Auto-renewal & Passes', icon: Sparkles, badge: 'High Retention' },
    { title: 'Appointment Booking & Queue', desc: 'Slot Booking, Live Token Queue & Reminders', icon: Calendar, badge: 'Live' },
    { title: 'Service Contracts & Warranty', desc: 'Service Level Agreements, Warranty Claim Records', icon: FileText, badge: 'Enterprise' },
    { title: 'Help Desk & Ticket Management', desc: 'Customer Complaints, SLA Timer & Escalation', icon: Wrench, badge: 'SaaS' },
    { title: 'Field Service & Technician Tracking', desc: 'Doorstep Tech Dispatch, Onsite Job Completion', icon: Truck, badge: 'Field Duty' },
    { title: 'Lead CRM & Quotations', desc: 'Inbound Inquiries, Quotations to Invoice Flow', icon: TrendingUp, badge: 'Growth' },
    { title: 'Customer & Vendor Portal', desc: 'Self-service Job Status, Online Invoices & History', icon: Users, badge: 'Portal' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Service Workspace Header with Sub-tabs */}
      <ServiceWorkspaceHeader
        activeTab="service_dashboard"
        onNavigateTab={onNavigateTab}
        onSectorChange={handleSectorChange}
      />

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed top-16 right-4 z-50 bg-blue-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-blue-400 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{showToast}</span>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
        {/* Active Industry Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest">
                  Active Sector: {cfg.group}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  {cfg.customerTerm} • {cfg.staffTerm}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex flex-wrap items-center gap-3">
                <span>{clientStore.getSettings()?.storeName || cfg.name}</span>
                {(clientStore.getSettings()?.storeName && clientStore.getSettings().storeName !== cfg.name) && (
                  <span className="text-sm font-semibold text-blue-300">({cfg.name})</span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                {cfg.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onNavigateTab('service_pos')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Express Service POS</span>
              </button>
              <button
                onClick={() => onNavigateTab('service_jobs')}
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>+ Create {cfg.workOrderTerm}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div
            onClick={() => onNavigateTab('service_appointments')}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-3.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Appointments</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-lg font-black text-white">{stats.todayAppointmentsCount}</p>
            <p className="text-[10px] text-blue-400 font-semibold">Today Scheduled</p>
          </div>

          <div
            onClick={() => onNavigateTab('service_jobs')}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-3.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Work Orders</span>
              <Wrench className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-lg font-black text-white">{stats.todayJobsCount}</p>
            <p className="text-[10px] text-indigo-400 font-semibold">New {cfg.workOrderTerm}s</p>
          </div>

          <div
            onClick={() => onNavigateTab('service_jobs')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-lg font-black text-amber-400">{stats.pendingJobsCount}</p>
            <p className="text-[10px] text-slate-400 font-medium">In Queue / Duty</p>
          </div>

          <div
            onClick={() => onNavigateTab('service_jobs')}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-black text-emerald-400">{stats.completedJobsCount}</p>
            <p className="text-[10px] text-emerald-500 font-medium">Delivered / Done</p>
          </div>

          <div
            onClick={() => onNavigateTab('service_invoices')}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-3.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Today Income</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-black text-emerald-400">₹{stats.todayRevenue.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 font-medium">Billing Income</p>
          </div>

          <div
            onClick={() => onNavigateTab('service_payments')}
            className="bg-slate-900 border border-slate-800 hover:border-red-500/50 p-3.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Outstanding</span>
              <IndianRupee className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-lg font-black text-red-400">₹{stats.outstandingPayments.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-red-400 font-medium">Pending Dues</p>
          </div>

          <div
            onClick={() => onNavigateTab('service_staff')}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-3.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">{cfg.staffTerm.split('/')[0]}</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-lg font-black text-white">{stats.activeStaffCount}</p>
            <p className="text-[10px] text-blue-400 font-medium">Active On-Duty</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Rating</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-lg font-black text-amber-400">{stats.averageRating} ★</p>
            <p className="text-[10px] text-slate-400 font-medium">Feedback Score</p>
          </div>
        </div>

        {/* Appointment Schedule & Work Order Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-sm text-white">Today's Appointment Schedule</h3>
              </div>
              <button
                onClick={() => onNavigateTab('service_appointments')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No appointments scheduled for today.</p>
              ) : (
                appointments.map(app => (
                  <div
                    key={app.id}
                    className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-500/40 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 py-1.5 rounded-xl bg-blue-900/40 border border-blue-500/30 text-center shrink-0">
                        <p className="text-xs font-black text-blue-300">{app.time}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{app.customerName}</p>
                        <p className="text-[11px] text-slate-300 truncate">{app.serviceName}</p>
                        <p className="text-[10px] text-slate-400">Assigned: {app.staffName || 'Unassigned'}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        app.status === 'In-Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {app.status}
                      </span>
                      <p className="text-xs font-black text-white mt-1">₹{app.totalAmount}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Work Orders Pipeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-sm text-white">Active {cfg.workOrderTerm} Pipeline</h3>
              </div>
              <button
                onClick={() => onNavigateTab('service_jobs')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {jobCards.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No active work orders found.</p>
              ) : (
                jobCards.map(job => (
                  <div
                    key={job.id}
                    className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-300">{job.jobNo}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                          job.priority === 'Urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          job.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {job.priority}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{job.customerName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{job.issueDescription}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        job.status === 'Completed' || job.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                        job.status === 'In-Progress' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {job.status}
                      </span>
                      <p className="text-xs font-black text-emerald-400 mt-1">₹{job.totalAmount}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ⭐ HIGH-VALUE SAAS PREMIUM MODULES HUB */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Premium SaaS Features</span>
              </div>
              <h2 className="text-xl font-black text-white">Enterprise Service ERP Modules</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Built-in high value modules for AMC, subscriptions, field tracking, appointment queues, and customer portals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {premiumModules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div key={idx} className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl space-y-2.5 hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[9px] font-black text-amber-400 border border-amber-500/20">
                      {mod.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{mod.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{mod.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Duty & Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>{cfg.staffTerm} Duty & Performance Roster</span>
            </h3>
            <button
              onClick={() => onNavigateTab('service_staff')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Staff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {staff.map(st => (
              <div key={st.id} className="bg-slate-800/50 border border-slate-700/50 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {st.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{st.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{st.role}</p>
                    <p className="text-[10px] text-blue-400">{st.specialty}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-amber-400">{st.rating} ★</span>
                  <p className="text-[10px] text-slate-400">{st.totalJobsCompleted} jobs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
