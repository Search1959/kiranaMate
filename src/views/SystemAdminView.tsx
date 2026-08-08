import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Store,
  User as UserIcon,
  Phone,
  Key,
  Layers,
  ArrowRight,
  AlertCircle,
  X,
  Lock,
  Building,
  CheckCircle2,
  SlidersHorizontal,
  Mail
} from 'lucide-react';
import { AdminAccountItem, UserRole, TradingSector } from '../types';
import { api } from '../lib/api';
import { TRADING_SECTORS } from '../lib/sectorConfig';
import { cloudListAllServiceAccounts, cloudFetchCompanyData, cloudDeleteAccount, cloudAdminUpdateAccount } from '../lib/serviceCloud';
import { getServiceSectorConfig } from '../lib/serviceSectorConfig';

interface SystemAdminViewProps {
  onSwitchStore?: (storeId: string) => void;
}

export const SystemAdminView: React.FC<SystemAdminViewProps> = ({ onSwitchStore }) => {
  const [accounts, setAccounts] = useState<AdminAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  
  // UI States
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [viewingAccount, setViewingAccount] = useState<AdminAccountItem | null>(null);
  const [editingAccount, setEditingAccount] = useState<AdminAccountItem | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<AdminAccountItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form States
  const [editForm, setEditForm] = useState({
    userId: '',
    storeId: '',
    name: '',
    username: '',
    password: '',
    mobile: '',
    role: 'owner' as UserRole,
    storeName: '',
    storeSector: 'KIRANA_FMCG' as TradingSector
  });

  const [createForm, setCreateForm] = useState({
    shopName: '',
    ownerName: '',
    username: '',
    password: '',
    mobile: '',
    sector: 'KIRANA_FMCG' as TradingSector
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAccounts();
      const tradingAccounts: AdminAccountItem[] = (res && res.accounts) || [];

      // Merge in Service ERP companies from every hosting/browser — same
      // registry, same "auto sync a new signup" guarantee as Trading ERP.
      const serviceAccounts: AdminAccountItem[] = [];
      try {
        const svcDirectory = await cloudListAllServiceAccounts();
        for (const entry of svcDirectory) {
          const companyData = await cloudFetchCompanyData(entry.companyId);
          const cfg = getServiceSectorConfig(entry.sector);
          serviceAccounts.push({
            id: entry.companyId,
            userId: entry.companyId,
            name: entry.ownerName,
            username: entry.username,
            password: entry.password || '123456',
            role: entry.role || 'owner',
            mobile: entry.mobile || '9876543210',
            storeId: entry.companyId,
            storeName: entry.businessName,
            sectorLabel: cfg.name,
            productCount: companyData?.services?.length || 0,
            salesCount: companyData?.invoices?.length || 0,
            customerCount: companyData?.customers?.length || 0,
            createdAt: entry.createdAt,
            isDemo: false,
            workspaceType: 'service'
          });
        }
      } catch (err) {
        console.error('Failed to load Service ERP accounts:', err);
      }

      setAccounts([...tradingAccounts, ...serviceAccounts]);
    } catch (err) {
      console.error('Failed to load admin accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (accId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [accId]: !prev[accId] }));
  };

  // Open Edit Modal
  const openEditModal = (acc: AdminAccountItem) => {
    setEditingAccount(acc);
    setEditForm({
      userId: acc.userId || acc.id,
      storeId: acc.storeId,
      name: acc.name,
      username: acc.username,
      password: acc.password || '123456',
      mobile: acc.mobile || '',
      role: acc.role || 'owner',
      storeName: acc.storeName || '',
      storeSector: acc.storeSector || 'KIRANA_FMCG'
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingAccount?.workspaceType === 'service') {
        await cloudAdminUpdateAccount(editForm.username, {
          businessName: editForm.storeName,
          ownerName: editForm.name,
          mobile: editForm.mobile,
          password: editForm.password
        });
      } else {
        await api.updateAdminAccount(editForm);
      }
      showToast(`Account '${editForm.username}' updated successfully!`);
      setEditingAccount(null);
      fetchAccounts();
    } catch (err: any) {
      alert(err.message || 'Failed to update account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;
    setActionLoading(true);
    try {
      if (deletingAccount.workspaceType === 'service') {
        await cloudDeleteAccount(deletingAccount.username, deletingAccount.storeId);
      } else {
        await api.deleteAdminAccount(deletingAccount.storeId, deletingAccount.userId || deletingAccount.id);
      }
      showToast(`Account '${deletingAccount.username}' deleted.`);
      setDeletingAccount(null);
      fetchAccounts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.shopName || !createForm.ownerName || !createForm.username) {
      alert('Please fill in required fields');
      return;
    }
    setActionLoading(true);
    try {
      await api.createAdminAccount({
        shopName: createForm.shopName,
        ownerName: createForm.ownerName,
        username: createForm.username,
        password: createForm.password || '123456',
        mobile: createForm.mobile || '9876543210',
        sector: createForm.sector
      });
      showToast(`New Account '${createForm.username}' created successfully!`);
      setIsCreateModalOpen(false);
      setCreateForm({
        shopName: '',
        ownerName: '',
        username: '',
        password: '',
        mobile: '',
        sector: 'KIRANA_FMCG'
      });
      fetchAccounts();
    } catch (err: any) {
      alert(err.message || 'Failed to create account');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered accounts list
  const filteredAccounts = accounts.filter(acc => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      acc.storeName.toLowerCase().includes(q) ||
      acc.name.toLowerCase().includes(q) ||
      acc.username.toLowerCase().includes(q) ||
      acc.mobile.includes(q) ||
      acc.storeId.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || acc.role === roleFilter;
    const matchesSector = sectorFilter === 'all' || acc.storeSector === sectorFilter;

    return matchesSearch && matchesRole && matchesSector;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-amber-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" /> System Administrator Control Panel
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Registered Accounts & Credentials Registry
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Monitor, audit, view passwords, edit shop parameters, or purge user accounts across all TradeMate enterprise sector nodes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchAccounts}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Refresh Account Registry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Account</span>
            </button>
          </div>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Accounts</div>
            <div className="text-lg font-black text-white mt-0.5">{accounts.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Custom Registered</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">
              {accounts.filter(a => !a.isDemo).length}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Products</div>
            <div className="text-lg font-black text-blue-400 mt-0.5">
              {accounts.reduce((sum, a) => sum + (a.productCount || 0), 0)}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Recorded Sales</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">
              {accounts.reduce((sum, a) => sum + (a.salesCount || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search store, owner, email, mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Roles</option>
              <option value="admin" className="bg-slate-900">Admin</option>
              <option value="owner" className="bg-slate-900">Owner</option>
              <option value="staff" className="bg-slate-900">Staff</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Sector:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Sectors</option>
              {TRADING_SECTORS.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Credentials List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Account Credentials Registry ({filteredAccounts.length})</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            Click 👁️ to reveal password or 📋 to copy credentials
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
            Loading accounts database...
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            No accounts match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="py-3 px-4">Store & Sector</th>
                  <th className="py-3 px-4">Owner / User Name</th>
                  <th className="py-3 px-4">User ID / Email</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4 text-center">Data Volume</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
                {filteredAccounts.map((acc) => {
                  const isPassVisible = !!visiblePasswords[acc.id];
                  const sectorConfig = TRADING_SECTORS.find(s => s.id === acc.storeSector);

                  return (
                    <tr key={acc.id} className="hover:bg-slate-800/50 transition-colors">
                      {/* Store & Sector */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{acc.storeName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                            {acc.sectorLabel || sectorConfig?.name || acc.storeSector || 'General'}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold uppercase ${
                            acc.workspaceType === 'service'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {acc.workspaceType === 'service' ? 'Service ERP' : 'Trading ERP'}
                          </span>
                          {acc.isDemo && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Demo
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Owner / User */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{acc.name}</div>
                        <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-bold uppercase mt-0.5 ${
                          acc.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : acc.role === 'owner'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {acc.role}
                        </span>
                      </td>

                      {/* Username / Email */}
                      <td className="py-3.5 px-4 font-mono text-xs text-amber-300">
                        <div className="flex items-center gap-1.5">
                          <span>{acc.username}</span>
                          <button
                            onClick={() => handleCopy(acc.username, 'Email/User ID')}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                            title="Copy Email / User ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Password */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={isPassVisible ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {isPassVisible ? (acc.password || '123456') : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(acc.id)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title={isPassVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => handleCopy(acc.password || '123456', 'Password')}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                            title="Copy Password"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {acc.mobile || '9876543210'}
                      </td>

                      {/* Volume Stats */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-slate-300 font-medium">
                          {acc.workspaceType === 'service'
                            ? `${acc.productCount} Services | ${acc.salesCount} Invoices`
                            : `${acc.productCount} Prods | ${acc.salesCount} Sales`}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Button */}
                          <button
                            onClick={() => setViewingAccount(acc)}
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                            title="View Account Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">View</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(acc)}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                            title="Edit Credentials & Store"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingAccount(acc)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW ACCOUNT MODAL */}
      {viewingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{viewingAccount.storeName}</h3>
                  <p className="text-[10px] text-slate-400">Account ID: {viewingAccount.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingAccount(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span>🔐 Login Credentials</span>
                  <button
                    onClick={() => handleCopy(`User ID: ${viewingAccount.username} | Password: ${viewingAccount.password || '123456'}`, 'Full Credentials')}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Copy Pair
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">User ID / Email:</span>
                    <span className="font-mono text-white font-semibold">{viewingAccount.username}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Password:</span>
                    <span className="font-mono text-emerald-400 font-bold">{viewingAccount.password || '123456'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Owner Name</span>
                  <span className="text-white font-bold">{viewingAccount.name}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Account Role</span>
                  <span className="text-amber-400 font-bold uppercase">{viewingAccount.role}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Mobile Number</span>
                  <span className="text-white font-bold">{viewingAccount.mobile || '9876543210'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    {viewingAccount.workspaceType === 'service' ? 'Service Sector' : 'Trading Sector'}
                  </span>
                  <span className="text-blue-400 font-bold">{viewingAccount.sectorLabel || viewingAccount.storeSector || 'General'}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-around text-center text-xs">
                <div>
                  <div className="text-slate-400 text-[10px]">Products</div>
                  <div className="font-bold text-white text-sm">{viewingAccount.productCount}</div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <div className="text-slate-400 text-[10px]">Sales</div>
                  <div className="font-bold text-white text-sm">{viewingAccount.salesCount}</div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <div className="text-slate-400 text-[10px]">Store ID</div>
                  <div className="font-mono text-amber-300 text-[11px]">{viewingAccount.storeId}</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
              {onSwitchStore && viewingAccount.workspaceType !== 'service' && (
                <button
                  onClick={() => {
                    onSwitchStore(viewingAccount.storeId);
                    setViewingAccount(null);
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Switch to this Shop</span>
                </button>
              )}
              <button
                onClick={() => setViewingAccount(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ACCOUNT MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>Edit Account Credentials</span>
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Owner / User Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  User ID / Email *
                </label>
                <input
                  type="text"
                  required
                  readOnly={editingAccount?.workspaceType === 'service'}
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500 ${
                    editingAccount?.workspaceType === 'service' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
                {editingAccount?.workspaceType === 'service' && (
                  <p className="text-[10px] text-slate-500 mt-1">Username can't be changed — it's the account's lookup key.</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Account Password *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Account Role
                  </label>
                  {editingAccount?.workspaceType === 'service' ? (
                    <div className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400">
                      {editForm.role} <span className="text-slate-600">(fixed)</span>
                    </div>
                  ) : (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="owner">Owner</option>
                      <option value="staff">Staff</option>
                      <option value="admin">System Admin</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {editingAccount?.workspaceType === 'service' ? 'Business / Company Name *' : 'Store / Shop Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editForm.storeName}
                  onChange={(e) => setEditForm({ ...editForm, storeName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {editingAccount?.workspaceType === 'service' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Service Sector
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400">
                    {editingAccount.sectorLabel} <span className="text-slate-600">(change from the company's own Settings)</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Trading Sector
                  </label>
                  <select
                    value={editForm.storeSector}
                    onChange={(e) => setEditForm({ ...editForm, storeSector: e.target.value as TradingSector })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {TRADING_SECTORS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex gap-2 justify-end border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW ACCOUNT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create New Account Credential</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Shop / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Traders"
                  value={createForm.shopName}
                  onChange={(e) => setCreateForm({ ...createForm, shopName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Owner / Manager Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={createForm.ownerName}
                  onChange={(e) => setCreateForm({ ...createForm, ownerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  User ID / Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@store.com"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Secret password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={createForm.mobile}
                    onChange={(e) => setCreateForm({ ...createForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Trading Sector
                  </label>
                  <select
                    value={createForm.sector}
                    onChange={(e) => setCreateForm({ ...createForm, sector: e.target.value as TradingSector })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {TRADING_SECTORS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {actionLoading ? 'Creating...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Account?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete user account <strong className="text-amber-300">{deletingAccount.username}</strong> ({deletingAccount.storeName})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingAccount(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 cursor-pointer"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
