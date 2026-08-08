import React, { useState } from 'react';
import {
  X,
  Wrench,
  UserCheck,
  ShieldCheck,
  Sparkles,
  User,
  User as UserIcon,
  Phone,
  Building2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Zap,
  LogIn,
  Layers,
  ArrowRight,
  Users
} from 'lucide-react';
import { User as UserType, ServiceSector } from '../types';
import { SERVICE_SECTORS, SERVICE_SECTOR_GROUPS } from '../lib/serviceSectorConfig';
import { serviceStore } from '../lib/serviceStore';

interface ServiceAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin';
  onAuthSuccess: (user: UserType, sector: ServiceSector) => void;
}

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '123456';

function buildUser(overrides: Partial<UserType> & Pick<UserType, 'name' | 'username' | 'role'>): UserType {
  return {
    id: `srv-user-${Date.now()}`,
    mobile: '9876543210',
    permissions: {
      canViewReports: true,
      canEditProducts: true,
      canDeleteRecords: overrides.role !== 'staff',
      canCollectPayments: true,
      canCreateOrders: true,
      canManageSettings: overrides.role !== 'staff'
    },
    ...overrides
  };
}

export const ServiceAuthModal: React.FC<ServiceAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onAuthSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'admin'>(initialMode);

  // Registration Form State
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSector, setRegSector] = useState<ServiceSector>('SALON');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSector, setLoginSector] = useState<ServiceSector>('SALON');

  // Admin / Demo Tab State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [demoSector, setDemoSector] = useState<ServiceSector>('SALON');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const sectorLabel = (id: ServiceSector) => SERVICE_SECTORS.find(s => s.id === id)?.name || id;

  const sectorOptions = (
    <>
      {SERVICE_SECTOR_GROUPS.map(group => {
        const sectorsInGroup = SERVICE_SECTORS.filter(s => s.group === group.name);
        if (sectorsInGroup.length === 0) return null;
        return (
          <optgroup key={group.name} label={group.name} className="bg-slate-900 text-slate-300">
            {sectorsInGroup.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white py-1">
                {s.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </>
  );

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const businessName = regBusinessName.trim() || `${sectorLabel(regSector)} Business`;
    const ownerName = regOwnerName.trim() || 'Business Owner';
    const username = regUsername.trim() || `user_${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      setLoading(true);
      const res = await serviceStore.registerCompany({
        businessName,
        ownerName,
        mobile: regMobile.trim() || '9876543210',
        username,
        password: regPassword.trim() || '123456',
        sector: regSector
      });

      setSuccessMsg(`Company '${businessName}' created successfully for ${sectorLabel(regSector)}!`);

      const user = buildUser({ name: ownerName, username: username.toLowerCase(), role: 'owner', mobile: regMobile.trim() || '9876543210' });
      setTimeout(() => {
        onAuthSuccess(user, res.sector);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Try a different username.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSignUp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setLoading(true);
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const res = await serviceStore.registerCompany({
        businessName: `Clean ${sectorLabel(regSector)} #${randomId}`,
        ownerName: 'Business Owner',
        mobile: '9876543210',
        username: `svcuser_${randomId}`,
        password: '123456',
        sector: regSector
      });

      setSuccessMsg('Company created successfully! Launching clean workspace...');
      const user = buildUser({ name: 'Business Owner', username: `svcuser_${randomId}`, role: 'owner' });

      setTimeout(() => {
        onAuthSuccess(user, res.sector);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginUsername.trim()) {
      setErrorMsg('Please enter your username.');
      return;
    }

    try {
      setLoading(true);
      const res = await serviceStore.loginCompany(loginUsername.trim(), loginPassword.trim() || '123456');
      setSuccessMsg(`Welcome back, ${res.ownerName}! Landing on ${sectorLabel(res.sector)} Dashboard.`);

      const user = buildUser({ name: res.ownerName, username: loginUsername.trim().toLowerCase(), role: res.role });
      setTimeout(() => {
        onAuthSuccess(user, res.sector);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your username.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = adminUsername.trim().toLowerCase();
    if (cleanUsername !== ADMIN_USERNAME || adminPassword.trim() !== ADMIN_PASSWORD) {
      setErrorMsg('Invalid System Admin credentials. Please verify your User ID and Password.');
      return;
    }

    setLoading(true);
    serviceStore.setActiveSector(demoSector);
    const user = buildUser({ name: 'System Administrator', username: ADMIN_USERNAME, role: 'admin' });
    setSuccessMsg('System Admin authenticated successfully!');
    setTimeout(() => {
      onAuthSuccess(user, demoSector);
      onClose();
      setLoading(false);
    }, 400);
  };

  const handleQuickDemoAccess = (role: 'owner' | 'staff' | 'receptionist') => {
    setLoading(true);
    setErrorMsg('');
    serviceStore.setActiveSector(demoSector);

    const cfg = SERVICE_SECTORS.find(s => s.id === demoSector);
    let name = 'Service Business Owner';
    let userRole: 'owner' | 'staff' = 'owner';

    if (role === 'owner') {
      name = `Owner (${cfg?.staffTerm || 'Manager'})`;
      userRole = 'owner';
    } else if (role === 'staff') {
      name = `Senior ${cfg?.staffTerm || 'Staff'}`;
      userRole = 'staff';
    } else {
      name = 'Front Desk & Billing Executive';
      userRole = 'staff';
    }

    const user = buildUser({ name, username: role, role: userRole });
    onAuthSuccess(user, demoSector);
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative text-white">

        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Service ERP Business Access</h3>
              <p className="text-[11px] text-slate-400">Account & Company Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 text-xs font-semibold bg-slate-950/30">
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sign Up / New Company</span>
          </button>

          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>

          <button
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Demo / Admin</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN UP / CREATE NEW COMPANY */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              {/* 1-Click Fast Sign Up */}
              <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-3.5 text-center space-y-2.5">
                <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Fastest 1-Click Sign Up</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant clean company creation for the sector selected below — zero demo data setup.
                </p>
                <button
                  type="button"
                  onClick={handleQuickSignUp}
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                  <span>Instant 1-Click Sign Up & Launch Company</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Or Fill Custom Company Details</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    <strong>Zero Demo Data Promise:</strong> Your company starts completely clean (0 appointments, 0 clients) tailored to your service sector.
                  </span>
                </div>

                {/* Service Sector Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Service Business Sector *
                  </label>
                  <div className="relative">
                    <Layers className="w-4 h-4 absolute left-3 top-3 text-indigo-400" />
                    <select
                      value={regSector}
                      onChange={(e) => setRegSector(e.target.value as ServiceSector)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-indigo-500/60 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-indigo-400"
                    >
                      {sectorOptions}
                    </select>
                  </div>
                  <p className="text-[10px] text-indigo-300 mt-1 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    Pre-configures your client/staff terminology and default service list (50+ industries available).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Business / Clinic / Shop Name *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Health OPD Clinic"
                      value={regBusinessName}
                      onChange={(e) => setRegBusinessName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Owner / Manager Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Anand Kulkarni"
                        value={regOwnerName}
                        onChange={(e) => setRegOwnerName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Username (for login) *</label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. apexclinic"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Choose password (min 3 chars)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Setting Up Your Company...' : 'Create My Company (Zero Data)'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: LOGIN TO EXISTING COMPANY */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Sector Landing Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Your Company's Service Sector *
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 absolute left-3 top-3 text-indigo-400" />
                  <select
                    value={loginSector}
                    onChange={(e) => setLoginSector(e.target.value as ServiceSector)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-indigo-500/60 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-indigo-400"
                  >
                    {sectorOptions}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Your account's own sector loads automatically once you log in — this only matters if we can't find your username.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter company username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Login to Company'}
              </button>
            </form>
          )}

          {/* TAB 3: DEMO / SYSTEM ADMIN */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-xs">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>System Administrator Authentication</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Enter authorized System Admin credentials to access the platform control panel:
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    System Admin User ID *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Enter System Admin User ID"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    System Admin Secret Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Enter Secret Password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Authenticating Admin...' : 'Authenticate & Access Admin Dashboard'}</span>
                </button>
              </form>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">⚡ 1-Click Instant Demo — Pick a sector:</label>
                <div className="relative">
                  <Layers className="w-4 h-4 absolute left-3 top-3 text-indigo-400" />
                  <select
                    value={demoSector}
                    onChange={(e) => setDemoSector(e.target.value as ServiceSector)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-indigo-400"
                  >
                    {sectorOptions}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoAccess('owner')}
                    disabled={loading}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-center text-[11px] text-slate-300 hover:text-white cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-0.5 text-indigo-400" />
                    <div className="font-bold">Owner Login</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoAccess('staff')}
                    disabled={loading}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-center text-[11px] text-slate-300 hover:text-white cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-400" />
                    <div className="font-bold">Staff Login</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoAccess('receptionist')}
                    disabled={loading}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-center text-[11px] text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-400" />
                    <div className="font-bold">Front Desk</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
