import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  Scan,
  Bell,
  Globe,
  UserCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  LogOut,
  Home,
  ShieldCheck,
  Building2,
  ChevronDown,
  ShoppingCart,
  Zap,
  Receipt,
  FileText,
  Wrench,
  Sparkles,
  Layers
} from 'lucide-react';
import { StoreSettings, LanguageCode, User, NotificationAlert, TradingSector } from '../types';
import { translations } from '../lib/translations';
import { getSectorConfig, TRADING_SECTORS } from '../lib/sectorConfig';
import { serviceStore } from '../lib/serviceStore';
import { getServiceSectorConfig } from '../lib/serviceSectorConfig';

interface HeaderProps {
  settings: StoreSettings;
  lang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentUser: User;
  onUserSwitch: (user: User) => void;
  users: User[];
  onOpenBarcodeScanner: () => void;
  globalSearchQuery: string;
  onSearchChange: (q: string) => void;
  notifications: NotificationAlert[];
  onMarkNotificationRead: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
  currentStoreId: string;
  onGoToLanding: () => void;
  adminStoresList?: { id: string; storeName: string; ownerName: string; isDemo: boolean }[];
  onAdminSwitchStore?: (storeId: string) => void;
  onOpenSectorModal?: () => void;
  onSelectSectorDemo?: (sectorId: TradingSector, demoStoreId: string) => void;
  activeSectorId?: TradingSector;
  onOpenNewSale?: () => void;
  onOpenScanBill?: () => void;
  onOpenCollectPayment?: () => void;
  activeTab?: string;
  onOpenServiceSectorModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  lang,
  onLanguageChange,
  currentUser,
  onUserSwitch,
  users,
  onOpenBarcodeScanner,
  globalSearchQuery,
  onSearchChange,
  notifications,
  onMarkNotificationRead,
  onNavigateToTab,
  currentStoreId,
  onGoToLanding,
  adminStoresList = [],
  onAdminSwitchStore,
  onOpenSectorModal,
  onSelectSectorDemo,
  activeSectorId,
  onOpenNewSale,
  onOpenScanBill,
  onOpenCollectPayment,
  activeTab = 'home',
  onOpenServiceSectorModal
}) => {
  const t = translations[lang] || translations.en;
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const [showPosMenu, setShowPosMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isDemo = currentStoreId === 'store-demo' || currentStoreId.startsWith('store-demo-');
  const isAdmin = currentUser.role === 'admin';
  const sectorInfo = getSectorConfig(settings.sector || activeSectorId || 'KIRANA_FMCG');

  const [isServiceWorkspace, setIsServiceWorkspace] = useState(activeTab.startsWith('service_'));

  useEffect(() => {
    if (activeTab.startsWith('service_')) {
      setIsServiceWorkspace(true);
    } else if (activeTab !== 'settings' && activeTab !== 'system_admin') {
      setIsServiceWorkspace(false);
    }
  }, [activeTab]);

  const isServiceTab = isServiceWorkspace;
  const activeServiceSector = serviceStore.getActiveSector();
  const serviceCfg = getServiceSectorConfig(activeServiceSector);

  const searchPlaceholder = isServiceTab
    ? `Search ${serviceCfg.customerTerm}s, ${serviceCfg.staffTerm}s, ${serviceCfg.workOrderTerm}s...`
    : (t.searchPlaceholder || "Search product, customer, barcode...");

  return (
    <header className={`h-14 ${isServiceTab ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} border-b px-3 sm:px-5 flex items-center justify-between shadow-xs shrink-0 z-40 sticky top-0 transition-colors`}>
      {/* Title & Sector Context Area */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {isServiceTab ? (
          <>
            {/* SERVICE ERP BRAND & SECTOR */}
            <div
              className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:bg-indigo-500 transition-colors"
              onClick={() => onNavigateToTab('service_dashboard')}
              title="Service ERP Dashboard"
            >
              <Wrench className="w-4 h-4 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-sm sm:text-base font-black tracking-tight truncate leading-tight text-white cursor-pointer hover:text-indigo-300 transition-colors"
                  onClick={() => onNavigateToTab('service_dashboard')}
                >
                  {serviceCfg.name}
                </h1>

                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 hidden md:inline-block">
                  Service ERP
                </span>
              </div>

              <p className="text-[10px] text-slate-400 font-semibold truncate hidden sm:block">
                {serviceCfg.group} • {serviceCfg.customerTerm} & {serviceCfg.workOrderTerm} Portal
              </p>
            </div>

            {/* Active Service Sector Display — same rule as the Trading
                side's badge: clickable switcher only for System Admin
                (previewing sectors), static label for every regular
                owner/staff login. */}
            {isAdmin ? (
              <button
                onClick={onOpenServiceSectorModal}
                className="ml-1 flex items-center bg-slate-800/80 hover:bg-slate-700 text-white border border-indigo-500/30 hover:border-indigo-400 rounded-lg px-2.5 py-1 shrink-0 cursor-pointer transition-all"
                title={`Click to browse all Service Sectors (Current: ${serviceCfg.name})`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 mr-1.5 shrink-0" />
                <span className="hidden sm:inline text-xs font-semibold text-indigo-200 mr-1">Sector:</span>
                <span className="text-xs font-extrabold text-white max-w-[120px] sm:max-w-[200px] truncate mr-1">
                  {serviceCfg.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
              </button>
            ) : (
              <div
                className="ml-1 flex items-center bg-slate-800/80 text-white border border-indigo-500/30 rounded-lg px-2.5 py-1 shrink-0"
                title={`Active Sector: ${serviceCfg.name}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 mr-1.5 shrink-0" />
                <span className="hidden sm:inline text-xs font-semibold text-indigo-200 mr-1">Sector:</span>
                <span className="text-xs font-extrabold text-white max-w-[120px] sm:max-w-[200px] truncate">
                  {serviceCfg.name}
                </span>
              </div>
            )}

            {/* Switch to Trading Button */}
            <button
              onClick={() => onNavigateToTab('home')}
              className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold transition-all shrink-0 cursor-pointer"
              title="Switch to TradeMate Trading ERP"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>Switch to Trading</span>
            </button>
          </>
        ) : (
          <>
            {/* TRADING ERP BRAND & STORE */}
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer" onClick={onGoToLanding}>
              <Store className="w-4 h-4 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-bold tracking-tight truncate leading-tight text-slate-900 cursor-pointer" onClick={() => onNavigateToTab('home')}>
                  {settings.storeName || 'Universal Trading Platform'}
                </h1>

                {/* Store Type Badge */}
                {isDemo ? (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 hidden md:inline-block">
                    Demo Store
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 hidden md:inline-block">
                    My Store
                  </span>
                )}
              </div>

              <p className="text-[10px] text-slate-400 font-medium truncate hidden sm:block">
                {settings.tagline || 'Multi-Sector Trading Management System'}
              </p>
            </div>

            {/* Active Trading Sector Badge — clickable switcher only for
                System Admin (who legitimately previews different sector
                templates); every regular owner/staff login sees a static
                label instead, since a real shop's sector isn't something to
                casually switch, and store-demo is Arun's own real working
                account too, not just the public seed demo — so this has to
                key off role, not storeId. */}
            {isAdmin ? (
              <button
                onClick={onOpenSectorModal}
                className="ml-1 flex items-center bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white border border-slate-700/80 hover:border-blue-400 rounded-lg shadow-xs px-2.5 py-1 shrink-0 cursor-pointer transition-all"
                title={`Click to switch Trading Sector (Current: ${sectorInfo.name})`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-400 mr-1.5 shrink-0" />
                <span className="hidden sm:inline text-xs font-semibold text-slate-300 mr-1">Sector:</span>
                <span className="text-xs font-extrabold text-blue-200 max-w-[110px] sm:max-w-[160px] truncate mr-1">
                  {sectorInfo.shortLabel}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
              </button>
            ) : (
              <div
                className="ml-1 flex items-center bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-700/80 rounded-lg shadow-xs px-2.5 py-1 shrink-0"
                title={`Trading Sector: ${sectorInfo.name}`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-400 mr-1.5 shrink-0" />
                <span className="hidden sm:inline text-xs font-semibold text-slate-300 mr-1">Sector:</span>
                <span className="text-xs font-extrabold text-blue-200 max-w-[110px] sm:max-w-[160px] truncate">
                  {sectorInfo.shortLabel}
                </span>
              </div>
            )}

            {/* System Admin Store Switcher Dropdown */}
            {isAdmin && adminStoresList.length > 0 && onAdminSwitchStore && (
              <div className="relative ml-1">
                <button
                  onClick={() => setShowStoreMenu(!showStoreMenu)}
                  className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300 rounded-md text-xs font-bold flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden xl:inline">Switch Store</span>
                  <ChevronDown className="w-3 h-3 text-amber-600" />
                </button>

                {showStoreMenu && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-slate-200 py-1 z-50 text-xs">
                    <div className="px-3 py-1.5 font-bold text-slate-400 text-[10px] uppercase border-b border-slate-100">
                      System Admin Store Switcher
                    </div>
                    {adminStoresList.map(st => (
                      <button
                        key={st.id}
                        onClick={() => { onAdminSwitchStore(st.id); setShowStoreMenu(false); }}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${currentStoreId === st.id ? 'font-bold bg-amber-50 text-amber-900' : ''}`}
                      >
                        <div>
                          <div className="font-semibold">{st.storeName}</div>
                          <div className="text-[10px] text-slate-400">Owner: {st.ownerName} {st.isDemo ? '(Demo)' : ''}</div>
                        </div>
                        {currentStoreId === st.id && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* The header search box was unused, so it's gone -- but camera
          barcode scanning is a real, marketed feature, so it stays as a
          standalone icon button rather than being lost along with it. */}
      {!isServiceTab && (
        <button
          onClick={onOpenBarcodeScanner}
          title={t.scanBarcode}
          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer shrink-0"
        >
          <Scan className="w-4 h-4" />
        </button>
      )}

      <div className="flex-1" />

      {/* Header Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Action Button */}
        {isServiceTab ? (
          <button
            onClick={() => onNavigateToTab('service_pos')}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white shadow-xs hover:shadow-md font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ring-2 ring-indigo-400/30"
            title="Open Service POS Billing Counter"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-200" />
            <span className="tracking-wide hidden sm:inline">Service POS</span>
            <span className="tracking-wide sm:hidden">POS</span>
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => {
                if (onOpenNewSale) {
                  onOpenNewSale();
                } else {
                  setShowPosMenu(!showPosMenu);
                }
                setShowLangMenu(false);
                setShowNotifMenu(false);
                setShowUserMenu(false);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-xs hover:shadow-md font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ring-2 ring-emerald-400/30"
              title="Open POS Billing Counter"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-pulse" />
              <span className="tracking-wide">POS Billing</span>
              <ChevronDown
                className="w-3 h-3 text-emerald-100 hidden sm:inline"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPosMenu(!showPosMenu);
                }}
              />
            </button>

            {/* Quick POS Daily Operations Mobile/Desktop Menu */}
            {showPosMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-slate-900">
                <div className="px-3.5 py-2 bg-slate-900 text-white font-bold text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <ShoppingCart className="w-3.5 h-3.5" /> Daily POS Menu
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded uppercase font-extrabold">
                    Fast
                  </span>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowPosMenu(false);
                      if (onOpenNewSale) onOpenNewSale();
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 rounded-lg flex items-center gap-2.5 font-bold text-emerald-900 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-xs">⚡ 30s Fast POS Billing</div>
                      <div className="text-[10px] text-slate-500 font-normal">Barcode scan, tap products & print bill</div>
                    </div>
                  </button>

                  {onOpenScanBill && (
                    <button
                      onClick={() => {
                        setShowPosMenu(false);
                        onOpenScanBill();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 rounded-lg flex items-center gap-2.5 font-semibold text-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs">📷 Scan Purchase Bill</div>
                        <div className="text-[10px] text-slate-500 font-normal">Auto OCR supplier invoice upload</div>
                      </div>
                    </button>
                  )}

                  {onOpenCollectPayment && (
                    <button
                      onClick={() => {
                        setShowPosMenu(false);
                        onOpenCollectPayment();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50 rounded-lg flex items-center gap-2.5 font-semibold text-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs">💳 Collect Udhaar / Payment</div>
                        <div className="text-[10px] text-slate-500 font-normal">Customer credit ledger & UPI settlement</div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowPosMenu(false);
                      onNavigateToTab('stock');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg flex items-center gap-2.5 font-semibold text-slate-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs">📦 Instant Stock Check</div>
                      <div className="text-[10px] text-slate-500 font-normal">Search current inventory & price list</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Return to Public Landing Home */}
        <button
          onClick={onGoToLanding}
          className={`px-2.5 py-1.5 rounded-md ${isServiceTab ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} text-xs font-semibold flex items-center gap-1.5 border cursor-pointer`}
          title="Back to Landing Page"
        >
          <Home className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Public Home</span>
        </button>

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => { setShowLangMenu(!showLangMenu); setShowNotifMenu(false); setShowUserMenu(false); }}
            className={`px-2.5 py-1.5 rounded-md ${isServiceTab ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} text-xs font-medium flex items-center gap-1 border cursor-pointer`}
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="uppercase font-semibold text-[11px] sm:text-xs">{lang}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
              <div className="px-3 py-1 font-semibold text-slate-400 text-[10px] uppercase border-b border-slate-100">
                Select Language
              </div>
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी (Hindi)' },
                { code: 'bn', label: 'বাংলা (Bengali)' },
                { code: 'mr', label: 'मराठी (Marathi)' },
                { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
                { code: 'ta', label: 'தமிழ் (Tamil)' }
              ].map(l => (
                <button
                  key={l.code}
                  onClick={() => { onLanguageChange(l.code as LanguageCode); setShowLangMenu(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${lang === l.code ? 'font-bold text-blue-600 bg-blue-50/60' : ''}`}
                >
                  <span>{l.label}</span>
                  {lang === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifMenu(!showNotifMenu); setShowLangMenu(false); setShowUserMenu(false); }}
            className={`p-2 rounded-md ${isServiceTab ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} relative border cursor-pointer`}
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-300 sm:text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-400" /> Alerts & Notifications ({notifications.length})
                </span>
                <button onClick={() => setShowNotifMenu(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No alerts right now.</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => { onMarkNotificationRead(n.id); if (n.type === 'LOW_STOCK' || n.type === 'OUT_OF_STOCK') onNavigateToTab('stock'); else if (n.type === 'OVERDUE_PAYMENT') onNavigateToTab('customers'); }}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${n.type === 'OUT_OF_STOCK' ? 'text-red-500' : n.type === 'LOW_STOCK' ? 'text-amber-500' : 'text-blue-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800">{n.title}</p>
                          <p className="text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowLangMenu(false); setShowNotifMenu(false); }}
            className={`px-2.5 py-1.5 rounded-md ${isServiceTab ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} text-xs flex items-center gap-1.5 border cursor-pointer`}
          >
            <UserCheck className={`w-3.5 h-3.5 ${isServiceTab ? 'text-indigo-400' : 'text-blue-600'}`} />
            <div className="text-left">
              <div className={`font-semibold text-[11px] leading-tight ${isServiceTab ? 'text-white' : 'text-slate-900'} truncate max-w-[100px]`}>
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                {currentUser.role}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                <p className="font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 uppercase">{currentUser.role} Account</p>
              </div>

              {isDemo && users.length > 1 && (
                <div className="py-1 border-b border-slate-100">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">Switch Demo Role</div>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { onUserSwitch(u); setShowUserMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between ${u.id === currentUser.id ? 'font-bold text-blue-600 bg-blue-50' : ''}`}
                    >
                      <span>{u.name} ({u.role})</span>
                      {u.id === currentUser.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setShowUserMenu(false); onGoToLanding(); }}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-1.5 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Store to Home</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
