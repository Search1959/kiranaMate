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
  DollarSign
} from 'lucide-react';
import { Layers, Sparkles } from 'lucide-react';
import { LanguageCode, DailyStats, User, TradingSector } from '../types';
import { translations } from '../lib/translations';
import { getSectorConfig } from '../lib/sectorConfig';

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
  activeSectorId
}) => {
  const t = translations[lang] || translations.en;
  const activeSectorInfo = getSectorConfig(activeSectorId || 'KIRANA_FMCG');

  const menuGroups = [
    {
      title: "Main Directory",
      items: [
        { id: 'home', label: t.home, icon: Home },
        { id: 'sales', label: t.sales, icon: ShoppingCart },
        { id: 'orders', label: t.orders, icon: ShoppingBag, badge: stats.pendingOrdersCount > 0 ? `${stats.pendingOrdersCount}` : undefined, badgeColor: 'bg-orange-500 text-white' },
        { id: 'customers', label: t.customers, icon: Users, badge: stats.overdueUdhaar > 0 ? 'Udhaar' : undefined, badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
        { id: 'stock', label: t.stock, icon: Package, badge: stats.lowStockCount > 0 ? `${stats.lowStockCount}` : undefined, badgeColor: 'bg-red-500 text-white' },
        { id: 'purchases', label: t.purchases, icon: Truck },
        { id: 'expenses', label: t.expenses, icon: TrendingDown },
        { id: 'suppliers', label: t.suppliers, icon: Users },
      ]
    },
    {
      title: "Administration & Analytics",
      items: [
        { id: 'finance', label: t.finance, icon: DollarSign },
        { id: 'stockLedger', label: t.stockLedger, icon: BookOpen },
        { id: 'reports', label: t.reports, icon: FileText },
        { id: 'settings', label: t.settings, icon: Settings },
        { id: 'backup', label: t.backup, icon: Database },
      ]
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-white shrink-0 select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-400" />
            <span>Kirana<span className="text-blue-400">Mate</span></span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-semibold">Store Management</p>
        </div>
      </div>

      {/* POS Quick Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => onOpenQuickAction('new-sale')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-lg shadow-sm flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 text-blue-200" />
          <span>+ Express 30s Sale POS</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-slate-700 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Multi-Sector Trading Info Banner */}
        <div className="pt-2 border-t border-slate-800">
          <div className="w-full bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-xl p-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Active Sector
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

        {/* Quick Action Chips */}
        <div className="pt-2 border-t border-slate-800">
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Quick Actions
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onOpenQuickAction('collect-payment')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700/50 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate">Collect Udhaar</span>
            </button>
            <button
              onClick={() => onOpenQuickAction('add-stock')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700/50 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate">Restock</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User Footer Card */}
      <div className="p-3 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{currentUser.role} (Admin)</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
            title={t.logout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

