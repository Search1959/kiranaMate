import React from 'react';
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  ShoppingCart,
  TrendingDown,
  FileText,
  Settings,
  Database,
  LogOut,
  PlusCircle,
  Truck,
  CreditCard,
  Store,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Calendar,
  Wrench,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { LanguageCode, DailyStats, User, TradingSector } from '../types';
import { translations } from '../lib/translations';
import { getSectorConfig } from '../lib/sectorConfig';
import { serviceStore } from '../lib/serviceStore';
import { getServiceSectorConfig } from '../lib/serviceSectorConfig';

interface DesktopSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  lang: LanguageCode;
  stats: DailyStats;
  currentUser: User;
  onOpenQuickAction: (action: string) => void;
  onLogout: () => void;
  onOpenSectorModal?: () => void;
  activeSectorId?: TradingSector;
  onOpenServiceSectorModal?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  lang,
  stats,
  currentUser,
  onOpenQuickAction,
  onLogout,
  onOpenSectorModal,
  activeSectorId,
  onOpenServiceSectorModal
}) => {
  const t = translations[lang] || translations.en;
  const activeSectorInfo = getSectorConfig(activeSectorId || 'KIRANA_FMCG');

  const [isServiceWorkspace, setIsServiceWorkspace] = React.useState(activeTab.startsWith('service_'));

  React.useEffect(() => {
    if (activeTab.startsWith('service_')) {
      setIsServiceWorkspace(true);
    } else if (activeTab !== 'settings' && activeTab !== 'system_admin') {
      setIsServiceWorkspace(false);
    }
  }, [activeTab]);

  const isServiceTab = isServiceWorkspace;
  const activeServiceSector = serviceStore.getActiveSector();
  const serviceCfg = getServiceSectorConfig(activeServiceSector);

  // Trading ERP Groups
  const tradingMenuGroups = [
    {
      title: "TRADING ERP",
      items: [
        { id: 'home', label: t.home, icon: Home },
        { id: 'sales', label: t.sales, icon: ShoppingCart },
        { id: 'orders', label: t.orders, icon: ShoppingBag, badge: stats.pendingOrdersCount > 0 ? `${stats.pendingOrdersCount}` : undefined, badgeColor: 'bg-orange-500 text-white' },
        { id: 'customers', label: t.customers, icon: Users, badge: stats.overdueUdhaar > 0 ? 'Udhaar' : undefined, badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
        { id: 'stock', label: t.stock, icon: Package, badge: stats.lowStockCount > 0 ? `${stats.lowStockCount}` : undefined, badgeColor: 'bg-red-500 text-white' },
        { id: 'purchases', label: t.purchases, icon: Truck },
        { id: 'expenses', label: t.expenses, icon: TrendingDown },
        { id: 'suppliers', label: t.suppliers, icon: Users },
        { id: 'finance', label: t.finance, icon: DollarSign },
        { id: 'stockLedger', label: t.stockLedger, icon: BookOpen },
        { id: 'reports', label: t.reports, icon: FileText },
        ...(currentUser?.role === 'admin'
          ? [{ id: 'system_admin', label: 'System Admin Accounts', icon: ShieldCheck, badge: 'Admin', badgeColor: 'bg-amber-500 text-slate-950 font-bold' }]
          : []),
        { id: 'settings', label: t.settings, icon: Settings },
        { id: 'backup', label: t.backup, icon: Database },
      ]
    }
  ];

  // Service ERP Groups (3 Categories)
  const serviceMenuGroups = [
    {
      title: "1. CORE OPERATIONS",
      items: [
        { id: 'service_dashboard', label: 'Service ERP Hub', icon: Home },
        { id: 'service_pos', label: 'Service POS Billing', icon: ShoppingCart },
        { id: 'service_jobs', label: `${serviceCfg.workOrderTerm}s`, icon: Wrench },
        { id: 'service_appointments', label: 'Appointments Schedule', icon: Calendar },
      ]
    },
    {
      title: "2. CLIENTS & ROSTER",
      items: [
        { id: 'service_customers', label: `${serviceCfg.customerTerm}s`, icon: Users },
        { id: 'service_staff', label: `${serviceCfg.staffTerm} Roster`, icon: ShieldCheck },
        { id: 'service_packages', label: 'Service Packages & AMC', icon: Package },
      ]
    },
    {
      title: "3. FINANCE & ADMINISTRATION",
      items: [
        { id: 'service_payments', label: 'Service Payments', icon: DollarSign },
        { id: 'service_expenses', label: 'Service Expenses', icon: TrendingDown },
        { id: 'service_invoices', label: 'Invoices & Receipts', icon: FileText },
        { id: 'service_quotations', label: 'Quotations & Estimates', icon: BookOpen },
        { id: 'service_reports', label: 'Service Analytics', icon: TrendingDown },
        ...(currentUser?.role === 'admin'
          ? [{ id: 'system_admin', label: 'System Admin Accounts', icon: ShieldCheck, badge: 'Admin', badgeColor: 'bg-amber-500 text-slate-950 font-bold' }]
          : []),
        { id: 'settings', label: t.settings, icon: Settings },
      ]
    }
  ];

  const currentGroups = isServiceTab ? serviceMenuGroups : tradingMenuGroups;

  return (
    <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-white shrink-0 select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            {isServiceTab ? (
              <>
                <Wrench className="w-5 h-5 text-indigo-400" />
                <span>Service<span className="text-indigo-400">ERP</span></span>
              </>
            ) : (
              <>
                <Store className="w-5 h-5 text-emerald-400" />
                <span>Trade<span className="text-emerald-400">Mate</span></span>
              </>
            )}
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-semibold">
            {isServiceTab ? serviceCfg.name : 'Store Management'}
          </p>
        </div>
      </div>

      {/* Mode Action Button */}
      <div className="px-3 pt-3 pb-2 space-y-2">
        {isServiceTab ? (
          <button
            onClick={() => onTabChange('home')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-2 px-3 rounded-lg shadow-xs flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Switch to TradeMate Trading</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenQuickAction('new-sale')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-lg shadow-xs flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-200" />
            <span>+ Express 30s Sale POS</span>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {currentGroups.map((group, idx) => (
          <div key={idx}>
            <div className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? isServiceTab
                          ? 'bg-indigo-600 text-white font-bold shadow-md'
                          : 'bg-emerald-600 text-white font-bold shadow-md'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {(item as { badge?: string; badgeColor?: string }).badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${(item as { badge?: string; badgeColor?: string }).badgeColor || 'bg-slate-700 text-white'}`}>
                        {(item as { badge?: string; badgeColor?: string }).badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Multi-Sector Trading Info Banner (When in Trading ERP) */}
        {!isServiceTab && (
          <div className="pt-2 border-t border-slate-800">
            <div className="w-full bg-gradient-to-r from-emerald-900/40 to-indigo-900/40 border border-emerald-500/20 rounded-xl p-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Active Trading Sector
                </span>
              </div>
              <div className="font-bold text-xs text-white mt-1 truncate">
                {activeSectorInfo.name}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                Units: {activeSectorInfo.primaryUnits.join(', ')}
              </p>
            </div>
          </div>
        )}
      </nav>

      {/* User Footer Card */}
      <div className="p-3 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-full ${isServiceTab ? 'bg-indigo-600' : 'bg-emerald-600'} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{currentUser.role}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title={t.logout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};


