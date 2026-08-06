import React, { useState } from 'react';
import {
  X,
  Store,
  UserCheck,
  ShieldCheck,
  Sparkles,
  KeyRound,
  User,
  Phone,
  Building2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Zap,
  LogIn
} from 'lucide-react';
import { api } from '../lib/api';
import { User as UserType, UserRole } from '../types';

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

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regShopName.trim() || !regOwnerName.trim() || !regUsername.trim()) {
      setErrorMsg('Please enter Shop Name, Owner Name, and Username.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.register({
        shopName: regShopName.trim(),
        ownerName: regOwnerName.trim(),
        mobile: regMobile.trim() || '9876543210',
        username: regUsername.trim(),
        password: regPassword.trim() || '123456'
      });

      api.setStoreId(res.storeId);
      api.setUserRole('owner');
      setSuccessMsg(`Store '${regShopName}' created successfully with clean zero demo data!`);

      setTimeout(() => {
        onAuthSuccess(res.user, res.storeId);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Try a different username.');
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
      const res = await api.login(loginUsername.trim(), loginPassword.trim() || '123456');

      api.setStoreId(res.storeId);
      api.setUserRole(res.user.role);
      setSuccessMsg(`Welcome back, ${res.user.name}!`);

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
              <h3 className="font-bold text-base text-white">KiranaMate Shop Access</h3>
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create New Store</span>
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

          {/* TAB 1: CREATE NEW STORE (Zero Demo Data!) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong>Zero Demo Data Promise:</strong> Your new account starts completely clean (0 sales, 0 products) so you can set up your store from scratch.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Shop / Store Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahavir Kirana & General Store"
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
                    placeholder="e.g. mahavirkirana"
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
          )}

          {/* TAB 2: LOGIN TO EXISTING STORE */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
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

          {/* TAB 3: DEMO & SYSTEM ADMIN ACCESS */}
          {activeTab === 'admin' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                1-Click Quick Login options for demonstration & system administration:
              </p>

              {/* System Admin Button */}
              <button
                onClick={() => handleQuickDemoAccess('admin')}
                disabled={loading}
                className="w-full p-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-amber-300">System Administrator</div>
                    <div className="text-[10px] text-slate-400">Manage all registered shops & view platform analytics</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400">Launch →</span>
              </button>

              {/* Demo Owner Button */}
              <button
                onClick={() => handleQuickDemoAccess('owner')}
                disabled={loading}
                className="w-full p-3.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-blue-300">Demo Store Owner (Ramesh Gupta)</div>
                    <div className="text-[10px] text-slate-400">Full owner access with 100+ demo items & sales</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-400">Launch →</span>
              </button>

              {/* Demo Staff Button */}
              <button
                onClick={() => handleQuickDemoAccess('staff')}
                disabled={loading}
                className="w-full p-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-200">Demo Store Staff (Suresh Kumar)</div>
                    <div className="text-[10px] text-slate-400">Counter staff billing & collection permissions</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-300">Launch →</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
