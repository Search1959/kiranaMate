import React, { useState } from 'react';
import {
  Wrench,
  Stethoscope,
  Scissors,
  Briefcase,
  GraduationCap,
  Smartphone,
  Zap,
  Building2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  Phone,
  Store,
  User,
  Users,
  Building,
  KeyRound
} from 'lucide-react';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { ServiceSector, User as UserType } from '../../types';
import { serviceStore } from '../../lib/serviceStore';

interface ServiceLoginViewProps {
  sector: ServiceSector;
  onBackToDirectory: () => void;
  onLoginSuccess: (user: UserType, sector: ServiceSector) => void;
}

export const ServiceLoginView: React.FC<ServiceLoginViewProps> = ({
  sector,
  onBackToDirectory,
  onLoginSuccess
}) => {
  const cfg = getServiceSectorConfig(sector);

  const [businessName, setBusinessName] = useState(`${cfg.name} Centre`);
  const [ownerName, setOwnerName] = useState('Dr. Anand Kulkarni');
  const [mobile, setMobile] = useState('9876543210');
  const [role, setRole] = useState<'owner' | 'staff' | 'admin'>('owner');
  const [pin, setPin] = useState('1234');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    serviceStore.setActiveSector(sector);

    const user: UserType = {
      id: `srv-user-${Date.now()}`,
      name: ownerName || 'Service Manager',
      username: (ownerName || 'owner').toLowerCase().replace(/\s+/g, '_'),
      role: role,
      mobile: mobile || '9876543210',
      permissions: {
        canViewReports: true,
        canEditProducts: true,
        canDeleteRecords: role === 'owner' || role === 'admin',
        canCollectPayments: true,
        canCreateOrders: true,
        canManageSettings: role === 'owner' || role === 'admin'
      }
    };

    onLoginSuccess(user, sector);
  };

  const handleQuickDemoLogin = (demoRole: 'owner' | 'staff' | 'receptionist') => {
    serviceStore.setActiveSector(sector);

    let name = 'Service Business Owner';
    let userRole: 'owner' | 'staff' | 'admin' = 'owner';

    if (demoRole === 'owner') {
      name = `Dr. / Specialist ${cfg.staffTerm} (Owner)`;
      userRole = 'owner';
    } else if (demoRole === 'staff') {
      name = `Senior ${cfg.staffTerm} (Operations)`;
      userRole = 'staff';
    } else {
      name = 'Front Desk & Billing Executive';
      userRole = 'staff';
    }

    const user: UserType = {
      id: `srv-demo-${demoRole}`,
      name: name,
      username: demoRole,
      role: userRole,
      mobile: '9876543210',
      permissions: {
        canViewReports: true,
        canEditProducts: true,
        canDeleteRecords: demoRole === 'owner',
        canCollectPayments: true,
        canCreateOrders: true,
        canManageSettings: demoRole === 'owner'
      }
    };

    onLoginSuccess(user, sector);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={onBackToDirectory}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Service Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            Service ERP Portal
          </span>
        </div>
      </div>

      {/* Main Login Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 my-auto flex flex-col md:flex-row gap-8 items-center justify-center">
        {/* Left Side: Sector Info & Features */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-xs font-extrabold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{cfg.group} Sector Workspace</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {cfg.name}
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
              {cfg.tagline}
            </p>
          </div>

          {/* Terminology Highlights */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tailored Sector Terminology
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Client Term</span>
                <span className="font-bold text-indigo-300">{cfg.customerTerm}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Staff Term</span>
                <span className="font-bold text-blue-300">{cfg.staffTerm}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Work Order</span>
                <span className="font-bold text-emerald-300">{cfg.workOrderTerm}</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Demo Login Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ 1-Click Instant Demo Launch:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('owner')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Owner Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('staff')}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>{cfg.staffTerm}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('receptionist')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Front Desk POS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="w-full md:w-[400px] shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Login to Service ERP</h2>
              <p className="text-xs text-slate-400">Enter your credentials to launch workspace</p>
            </div>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
            {/* Service Business Name */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Business / Clinic / Shop Name
              </label>
              <div className="relative">
                <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Health OPD Clinic"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Owner/Manager Name */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                User / Doctor / Manager Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile & Role */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Mobile No.</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-8 pr-2 py-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-white px-2 py-2 rounded-xl focus:outline-none font-bold"
                >
                  <option value="owner">Owner / Director</option>
                  <option value="staff">Staff / Specialist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Password PIN */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Password / Security PIN</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Launch Service ERP Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-500">
        TradeMate Service ERP & POS Platform • Tailored for {cfg.name}
      </div>
    </div>
  );
};
