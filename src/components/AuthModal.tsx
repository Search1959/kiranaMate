import React, { useState } from 'react';
import {
  X,
  Store,
  UserCheck,
  ShieldCheck,
  Sparkles,
  KeyRound,
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
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { User as UserType, UserRole, TradingSector } from '../types';
import { TRADING_SECTORS } from '../lib/sectorConfig';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin';
  onAuthSuccess: (user: UserType, storeId: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onAuthSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'admin'>(initialMode);
  
  // Registration Form State
  const [regShopName, setRegShopName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSector, setRegSector] = useState<TradingSector>('METALS_STEEL');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSector, setLoginSector] = useState<TradingSector>('METALS_STEEL');

  // Admin Login Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const shopName = regShopName.trim() || 'My Commercial Store';
    const ownerName = regOwnerName.trim() || 'Store Owner';
    const username = regUsername.trim() || `user_${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      setLoading(true);
      const res = await api.register({
        shopName,
        ownerName,
        mobile: regMobile.trim() || '9876543210',
        username,
        password: regPassword.trim() || '123456',
        sector: regSector
      });

      api.setStoreId(res.storeId);
      api.setUserRole('owner');
      setSuccessMsg(`Store '${shopName}' created successfully for ${TRADING_SECTORS.find(s => s.id === regSector)?.name || regSector}!`);

      setTimeout(() => {
        onAuthSuccess(res.user, res.storeId);
        onClose();
      }, 500);
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
      const res = await api.register({
        shopName: `Clean Store #${randomId}`,
        ownerName: 'Store Owner',
        mobile: '9876543210',
        username: `user_${randomId}`,
        password: '123456',
        sector: regSector
      });

      api.setStoreId(res.storeId);
      api.setUserRole('owner');
      setSuccessMsg(`Store created successfully! Launching clean store...`);

      setTimeout(() => {
        onAuthSuccess(res.user, res.storeId);
        onClose();
      }, 500);
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
      const res = await api.login(loginUsername.trim(), loginPassword.trim() || '123456', loginSector);

      api.setStoreId(res.storeId);
      api.setUserRole(res.user.role);
      setSuccessMsg(`Welcome back, ${res.user.name}! Landing on ${TRADING_SECTORS.find(s => s.id === loginSector)?.name || loginSector} Dashboard.`);

      setTimeout(() => {
        onAuthSuccess(res.user, res.storeId);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check username.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setErrorMsg('Please enter both System Admin User ID and Secret Password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login(adminUsername.trim(), adminPassword.trim());
      if (res && res.user) {
        if (res.user.role !== 'admin') {
          setErrorMsg('This account does not have System Administrator privileges.');
          setLoading(false);
          return;
        }
        api.setStoreId('store-demo');
        api.setUserRole('admin');
        setSuccessMsg(`System Admin authenticated successfully! Welcome, ${res.user.name}.`);
        setTimeout(() => {
          onAuthSuccess(res.user, 'store-demo');
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid System Admin credentials. Please verify your User ID and Password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = async (role: 'admin' | 'owner' | 'staff') => {
    setLoading(true);
    setErrorMsg('');

    try {
      const username = role === 'admin' ? 'admin' : role === 'owner' ? 'owner' : 'staff';
      const res = await api.login(username, '123456');

      api.setStoreId('store-demo');
      api.setUserRole(role);

      onAuthSuccess(res.user, 'store-demo');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSectorDemoAccess = async (demoStoreId: string) => {
    setLoading(true);
    setErrorMsg('');

    try {
      api.setStoreId(demoStoreId);
      api.setUserRole('owner');
      const res = await api.login('owner', '123456');

      onAuthSuccess(res.user, demoStoreId);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Sector demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative text-white">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">TradeMate Business Access</h3>
              <p className="text-[11px] text-slate-400">Account & Store Access</p>
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
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Sign Up / New Store</span>
          </button>

          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login Store</span>
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

          {/* TAB 1: SIGN UP / CREATE NEW STORE */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              {/* 1-Click Fast Sign Up */}
              <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-3.5 text-center space-y-2.5">
                <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Fastest 1-Click Sign Up</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant clean store creation for GitHub & web users with zero demo data setup.
                </p>
                <button
                  type="button"
                  onClick={handleQuickSignUp}
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                  <span>Instant 1-Click Sign Up & Launch Store</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Or Fill Custom Shop Details</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong>Zero Demo Data Promise:</strong> Your store starts completely clean (0 sales, 0 products) tailored to your industry.
                </span>
              </div>

              {/* Business Sector / Trading Line Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Business Sector / Trading Line *
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 absolute left-3 top-3 text-blue-400" />
                  <select
                    value={regSector}
                    onChange={(e) => setRegSector(e.target.value as TradingSector)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-blue-500/60 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-blue-400"
                  >
                    {TRADING_SECTORS.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white py-1">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-blue-300 mt-1 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  Pre-configures industry unit metrics (e.g., Tons/Kg for Steel, Meters for Textiles, L/Bbl for Fuel).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Shop / Store Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahavir Iron & Steel Traders"
                    value={regShopName}
                    onChange={(e) => setRegShopName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Owner Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={regOwnerName}
                      onChange={(e) => setRegOwnerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                    placeholder="e.g. mahavirsteel"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Setting Up Your Store...' : 'Create My Store (Zero Data)'}
              </button>
            </form>
          </div>
          )}

          {/* TAB 2: LOGIN TO EXISTING STORE */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Sector Landing Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Select Sector Dashboard *
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 absolute left-3 top-3 text-blue-400" />
                  <select
                    value={loginSector}
                    onChange={(e) => setLoginSector(e.target.value as TradingSector)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-blue-500/60 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-blue-400"
                  >
                    {TRADING_SECTORS.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white py-1">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  After login you will land directly on this sector's custom dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter store username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Login to Store'}
              </button>
            </form>
          )}

          {/* TAB 3: SYSTEM ADMIN LOGIN */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-xs">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>System Administrator Authentication</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Enter authorized System Admin credentials to access platform control panel and account management:
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    System Admin User ID / Email *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Enter System Admin Email / User ID"
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

              <div className="border-t border-slate-800 pt-3">
                <p className="text-[11px] text-slate-400 mb-2 font-medium">Quick Demo Role Access:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoAccess('owner')}
                    disabled={loading}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-[11px] text-slate-300 hover:text-white"
                  >
                    <div className="font-bold">Shop Owner Demo</div>
                    <div className="text-[9px] text-slate-500">Full Store Access</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoAccess('staff')}
                    disabled={loading}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-[11px] text-slate-300 hover:text-white"
                  >
                    <div className="font-bold">Counter Staff Demo</div>
                    <div className="text-[9px] text-slate-500">POS & Sales Only</div>
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
