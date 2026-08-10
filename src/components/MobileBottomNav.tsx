import React, { useState, useEffect } from 'react';
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  Grid,
  Plus,
  ShoppingCart,
  Receipt,
  UserPlus,
  ArrowUpRight,
  TrendingDown,
  FileText,
  Settings,
  Database,
  LogOut,
  X,
  PlusCircle,
  Truck,
  BookOpen,
  DollarSign,
  Wrench,
  Calendar,
  ShieldCheck,
  ArrowLeftRight,
  MessageCircle,
  Camera
} from 'lucide-react';
import { LanguageCode, DailyStats } from '../types';
import { translations } from '../lib/translations';
import { serviceStore } from '../lib/serviceStore';
import { getServiceSectorConfig } from '../lib/serviceSectorConfig';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  lang: LanguageCode;
  stats: DailyStats;
  onOpenQuickAction: (action: string) => void;
  onLogout: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  lang,
  stats,
  onOpenQuickAction,
  onLogout
}) => {
  const t = translations[lang] || translations.en;
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [activeQuickCategory, setActiveQuickCategory] = useState<string>('');

  // Same "sticky workspace" pattern as DesktopSidebar.tsx: a shared tab like
  // 'settings' shouldn't flip the mobile nav back to Trading mid-session.
  const [isServiceMode, setIsServiceMode] = useState(activeTab.startsWith('service_'));
  useEffect(() => {
    if (activeTab.startsWith('service_')) {
      setIsServiceMode(true);
    } else if (activeTab !== 'settings' && activeTab !== 'system_admin') {
      setIsServiceMode(false);
    }
  }, [activeTab]);

  const serviceCfg = getServiceSectorConfig(serviceStore.getActiveSector());

  const tradingNavItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'orders', label: t.orders, icon: ShoppingBag, badge: stats.pendingOrdersCount },
    { id: 'stock', label: t.stock, icon: Package, badge: stats.lowStockCount + stats.outOfStockCount },
    { id: 'customers', label: t.customers, icon: Users, badge: stats.overdueUdhaar > 0 ? 1 : 0 },
    { id: 'more', label: t.more, icon: Grid }
  ];

  const serviceNavItems: typeof tradingNavItems = [
    { id: 'service_dashboard', label: 'Hub', icon: Home, badge: undefined },
    { id: 'service_jobs', label: serviceCfg.workOrderTerm, icon: Wrench, badge: undefined },
    { id: 'service_appointments', label: 'Appts', icon: Calendar, badge: undefined },
    { id: 'service_customers', label: 'Clients', icon: Users, badge: undefined },
    { id: 'more', label: t.more, icon: Grid, badge: undefined }
  ];

  const navItems = isServiceMode ? serviceNavItems : tradingNavItems;

  const tradingQuickActions = [
    { id: 'new-sale', label: t.newSale + ' (30s POS)', icon: ShoppingCart, bg: 'bg-emerald-600 text-white', category: 'Billing' },
    { id: 'new-order', label: t.newOrder, icon: ShoppingBag, bg: 'bg-blue-600 text-white', category: 'Billing' },
    { id: 'collect-payment', label: t.collectPayment, icon: Receipt, bg: 'bg-amber-600 text-white', category: 'Billing' },
    { id: 'add-stock', label: t.addStock, icon: ArrowUpRight, bg: 'bg-indigo-600 text-white', category: 'Inventory' },
    { id: 'scan-bill', label: 'Scan Bill (Camera)', icon: Camera, bg: 'bg-cyan-600 text-white', category: 'Inventory' },
    { id: 'add-product', label: t.addProduct, icon: PlusCircle, bg: 'bg-purple-600 text-white', category: 'Inventory' },
    { id: 'add-customer', label: t.addCustomer, icon: UserPlus, bg: 'bg-teal-600 text-white', category: 'Customers' },
    { id: 'whatsapp-udhaar-reminder', label: 'WhatsApp Udhaar Reminder', icon: MessageCircle, bg: 'bg-green-600 text-white', category: 'Customers' },
    { id: 'add-expense', label: t.addExpense, icon: TrendingDown, bg: 'bg-rose-600 text-white', category: 'Expenses' }
  ];

  // Service ERP's create-forms are local state inside each view (not lifted
  // to App.tsx like Trading's are), so these navigate straight to the right
  // screen rather than popping a modal directly — one extra tap to hit "+"
  // there, but still a real shortcut past the full menu.
  const serviceQuickActions = [
    { id: 'service-new-bill', label: 'New Bill (POS)', icon: ShoppingCart, bg: 'bg-emerald-600 text-white', category: 'Billing' },
    { id: 'service-record-payment', label: 'Record Payment', icon: Receipt, bg: 'bg-amber-600 text-white', category: 'Billing' },
    { id: 'service-book-appointment', label: 'Book Appointment', icon: Calendar, bg: 'bg-blue-600 text-white', category: 'Jobs' },
    { id: 'service-new-job', label: `New ${serviceCfg.workOrderTerm}`, icon: Wrench, bg: 'bg-indigo-600 text-white', category: 'Jobs' },
    { id: 'service-add-client', label: `Add ${serviceCfg.customerTerm}`, icon: UserPlus, bg: 'bg-teal-600 text-white', category: 'Clients' },
    { id: 'service-new-quotation', label: 'New Quotation', icon: BookOpen, bg: 'bg-purple-600 text-white', category: 'Clients' },
    { id: 'service-add-expense', label: 'Record Expense', icon: TrendingDown, bg: 'bg-rose-600 text-white', category: 'Clients' }
  ];

  const quickActions = isServiceMode ? serviceQuickActions : tradingQuickActions;
  const quickActionCategories = Array.from(new Set(quickActions.map(a => a.category)));
  const currentQuickCategory = quickActionCategories.includes(activeQuickCategory) ? activeQuickCategory : quickActionCategories[0];
  const visibleQuickActions = quickActions.filter(a => a.category === currentQuickCategory);

  // Desktop-only screens (Finance, Reports, Stock Ledger, Settings, Backup,
  // System Admin) are deliberately left out of both lists below — reviewing
  // numbers and admin work belongs on a wide screen, not this drawer.
  const tradingMoreItems = [
    { id: 'service_dashboard', label: 'Switch to Service ERP', icon: ArrowLeftRight, color: 'text-blue-600 bg-blue-50' },
    { id: 'sales', label: t.sales, icon: ShoppingCart, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'purchases', label: t.purchases, icon: Truck, color: 'text-blue-600 bg-blue-50' },
    { id: 'expenses', label: t.expenses, icon: TrendingDown, color: 'text-rose-600 bg-rose-50' },
    { id: 'suppliers', label: t.suppliers, icon: Users, color: 'text-purple-600 bg-purple-50' },
  ];

  const serviceMoreItems = [
    { id: 'home', label: 'Switch to TradeMate', icon: ArrowLeftRight, color: 'text-blue-600 bg-blue-50' },
    { id: 'service_staff', label: `${serviceCfg.staffTerm} Roster`, icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'service_packages', label: 'Packages & AMC', icon: Package, color: 'text-purple-600 bg-purple-50' },
    { id: 'service_payments', label: 'Payments', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'service_expenses', label: 'Expenses', icon: TrendingDown, color: 'text-rose-600 bg-rose-50' },
    { id: 'service_invoices', label: 'Invoices & Receipts', icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { id: 'service_quotations', label: 'Quotations', icon: BookOpen, color: 'text-amber-600 bg-amber-50' },
  ];

  const moreItems = isServiceMode ? serviceMoreItems : tradingMoreItems;

  return (
    <>
      {/* FAB Quick Action Button (Floating +) */}
      <div className="md:hidden fixed right-4 bottom-20 z-50">
        <button
          onClick={() => { setActiveQuickCategory(''); setShowFabMenu(!showFabMenu); }}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 text-white ${
            showFabMenu ? 'bg-slate-800 rotate-45' : isServiceMode ? 'bg-indigo-600 hover:bg-indigo-700 font-bold ring-4 ring-indigo-500/20' : 'bg-blue-600 hover:bg-blue-700 font-bold ring-4 ring-blue-500/20'
          }`}
          title="Quick Action"
        >
          <Plus className="w-6 h-6 text-white stroke-[2.5]" />
        </button>
      </div>

      {/* FAB Quick Actions — full-screen sheet with category tabs, so picking
          a category shows its cards right there instead of navigating away.
          Stops at bottom-16 (not inset-0) so the persistent bottom nav bar
          stays visible/tappable underneath, instead of getting covered. */}
      {showFabMenu && (
        <div className="md:hidden fixed top-0 left-0 right-0 bottom-16 bg-slate-50 z-50 flex flex-col animate-in fade-in duration-150 shadow-2xl">
          <div className={`p-4 sm:p-5 flex items-center justify-between shrink-0 text-white ${isServiceMode ? 'bg-indigo-600' : 'bg-blue-600'}`}>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Plus className="w-5 h-5" /> {t.quickActions}
            </h3>
            <button
              onClick={() => setShowFabMenu(false)}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 overflow-x-auto shrink-0 border-b border-slate-200 bg-white">
            {quickActionCategories.map(cat => {
              const count = quickActions.filter(a => a.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveQuickCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    currentQuickCategory === cat
                      ? (isServiceMode ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white')
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 rounded-full ${currentQuickCategory === cat ? 'bg-white/20' : 'bg-slate-200'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Selected category's cards — same screen, no navigation away */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3 content-start">
              {visibleQuickActions.map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      setShowFabMenu(false);
                      onOpenQuickAction(action.id);
                    }}
                    className={`flex flex-col items-start gap-4 p-4 rounded-2xl text-left font-semibold text-xs transition-all active:scale-95 shadow-md min-h-[104px] justify-between ${action.bg}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="leading-snug">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* More Drawer Menu — stops at bottom-16 so the persistent nav bar
          underneath stays visible, same as the Quick Actions sheet above. */}
      {showMoreMenu && (
        <div className="md:hidden fixed top-0 left-0 right-0 bottom-16 bg-slate-900/60 z-50 flex flex-col justify-end" onClick={() => setShowMoreMenu(false)}>
          <div
            className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 text-slate-800 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-base">{t.more} Menu</span>
              <button onClick={() => setShowMoreMenu(false)} className="p-1 rounded-full bg-slate-100">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {moreItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowMoreMenu(false);
                      onTabChange(item.id);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 text-center"
                  >
                    <div className={`p-2.5 rounded-xl ${item.color} mb-1.5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 leading-tight">{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => { setShowMoreMenu(false); onLogout(); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-95 text-center"
              >
                <div className="p-2.5 rounded-xl bg-red-100 text-red-600 mb-1.5">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-red-700">{t.logout}</span>
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400 pt-3 mt-2 border-t border-slate-100">
              Reports, Finance & Settings are easier to review on a bigger screen — open TradeMate on desktop for those.
            </p>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Bar */}
      {/* z-[80] is deliberately higher than every modal in the app (max z-[70]
          in use elsewhere) so this stays visible and tappable no matter what
          else is open — the actual persistent fix, rather than reserving
          bottom space in every individual modal one at a time. */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[80] bg-white border-t border-slate-200 shadow-lg px-2 py-1 flex items-center justify-around select-none">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  setShowMoreMenu(true);
                } else {
                  setShowMoreMenu(false);
                  onTabChange(item.id);
                }
              }}
              className={`flex-1 py-1 flex flex-col items-center justify-center min-w-0 relative transition-colors ${
                isActive ? (isServiceMode ? 'text-indigo-600 font-bold' : 'text-blue-600 font-bold') : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0.2 min-w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] truncate mt-0.5 max-w-full leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
