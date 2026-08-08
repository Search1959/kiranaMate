import React, { useState, useEffect } from 'react';
import {
  DailyStats,
  StoreSettings,
  Customer,
  Product,
  Order,
  Sale,
  Purchase,
  Expense,
  Supplier,
  User,
  LanguageCode,
  NotificationAlert,
  InventoryTransaction,
  TradingSector
} from './types';
import { api, getCurrentStoreId } from './lib/api';
import { getSectorConfig, TRADING_SECTORS } from './lib/sectorConfig';
import { detectCurrencyFromLocale } from './lib/currency';

const DEFAULT_USER: User = {
  id: 'user-demo-owner',
  name: 'Shop Owner',
  username: 'owner',
  role: 'owner',
  mobile: '9876543210',
  permissions: {
    canViewReports: true,
    canEditProducts: true,
    canDeleteRecords: true,
    canCollectPayments: true,
    canCreateOrders: true,
    canManageSettings: true
  }
};

const DEFAULT_STATS: DailyStats = {
  todaySalesTotal: 0,
  cashSales: 0,
  upiSales: 0,
  creditSales: 0,
  todayExpenses: 0,
  estimatedProfitToday: 0,
  totalPendingUdhaar: 0,
  dueTodayUdhaar: 0,
  overdueUdhaar: 0,
  todayCollection: 0,
  pendingOrdersCount: 0,
  newOrdersCount: 0,
  preparingOrdersCount: 0,
  outForDeliveryCount: 0,
  deliveredOrdersToday: 0,
  lowStockCount: 0,
  outOfStockCount: 0
};

function getFallbackSettings(storeIdStr: string): StoreSettings {
  let sectorKey: TradingSector = 'KIRANA_FMCG';
  if (storeIdStr.includes('steel')) sectorKey = 'METALS_STEEL';
  else if (storeIdStr.includes('energy')) sectorKey = 'ENERGY';
  else if (storeIdStr.includes('agri')) sectorKey = 'AGRICULTURE';
  else if (storeIdStr.includes('chemical')) sectorKey = 'CHEMICALS';
  else if (storeIdStr.includes('textile')) sectorKey = 'TEXTILES';
  else if (storeIdStr.includes('jewellery')) sectorKey = 'JEWELLERY';
  else if (storeIdStr.includes('stationery')) sectorKey = 'STATIONERY';
  else if (storeIdStr.includes('hardware')) sectorKey = 'BUILDING_HARDWARE';

  const cfg = getSectorConfig(sectorKey);
  return {
    storeName: cfg.defaultSettings.storeName || `${cfg.shortLabel} Store`,
    tagline: cfg.tagline,
    ownerName: 'Demo Manager',
    phone: '9876543210',
    address: 'Industrial Estate, Main Road',
    city: 'Jaipur',
    pincode: '302001',
    currencySymbol: detectCurrencyFromLocale().symbol,
    currencyCode: detectCurrencyFromLocale().code,
    invoicePrefix: cfg.defaultSettings.invoicePrefix || 'TRD-2026-',
    invoiceFooterNote: 'Thank you for your business!',
    lowStockThresholdDefault: 10,
    defaultLanguage: 'en',
    sector: sectorKey
  };
}

// Layout Components
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DesktopSidebar } from './components/DesktopSidebar';
import { LandingView } from './components/LandingView';
import { AuthModal } from './components/AuthModal';

// Modals
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { NewSaleModal } from './components/NewSaleModal';
import { NewOrderModal } from './components/NewOrderModal';
import { CollectPaymentModal } from './components/CollectPaymentModal';
import { AddProductModal } from './components/AddProductModal';
import { AddStockModal } from './components/AddStockModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { BulkProductImportModal } from './components/BulkProductImportModal';
import { ScanPurchaseBillModal } from './components/ScanPurchaseBillModal';
import { SectorDemoModal } from './components/SectorDemoModal';
import { ServiceSectorModal } from './components/ServiceSectorModal';
import { ServiceAuthModal } from './components/ServiceAuthModal';
import { AiAssistantWidget } from './components/AiAssistantWidget';

// Views
import { DashboardView } from './views/DashboardView';
import { CustomersView } from './views/CustomersView';
import { ProductsView } from './views/ProductsView';
import { OrdersView } from './views/OrdersView';
import { SalesView } from './views/SalesView';
import { PurchasesView } from './views/PurchasesView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { SuppliersView } from './views/SuppliersView';
import { BackupView } from './views/BackupView';
import { StockLedgerView } from './views/StockLedgerView';
import { FinanceView } from './views/FinanceView';
import { SystemAdminView } from './views/SystemAdminView';

// Service ERP Module Views
import { ServiceLoginView } from './views/services/ServiceLoginView';
import { ServiceDashboardView } from './views/services/ServiceDashboardView';
import { ServicePosView } from './views/services/ServicePosView';
import { ServiceAppointmentsView } from './views/services/ServiceAppointmentsView';
import { ServiceJobCardsView } from './views/services/ServiceJobCardsView';
import { ServiceCustomersView } from './views/services/ServiceCustomersView';
import { ServiceStaffView } from './views/services/ServiceStaffView';
import { ServicePackagesView } from './views/services/ServicePackagesView';
import { ServicePaymentsView } from './views/services/ServicePaymentsView';
import { ServiceExpensesView } from './views/services/ServiceExpensesView';
import { ServiceInvoicesView } from './views/services/ServiceInvoicesView';
import { ServiceQuotationsView } from './views/services/ServiceQuotationsView';
import { ServiceReportsView } from './views/services/ServiceReportsView';
import { ServiceSettingsView } from './views/services/ServiceSettingsView';
import { serviceStore } from './lib/serviceStore';
import { ServiceSector } from './types';

export default function App() {
  // Navigation & Page State
  const [viewMode, setViewMode] = useState<'landing' | 'service_login' | 'app'>('landing');
  const [currentStoreId, setCurrentStoreId] = useState<string>('store-demo');
  const [isServiceSectorModalOpen, setIsServiceSectorModalOpen] = useState(false);
  const [selectedServiceSector, setSelectedServiceSector] = useState<ServiceSector>('DOCTOR_CLINIC');

  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'admin'>('register');

  // Service ERP Business Access Modal
  const [isServiceAuthModalOpen, setIsServiceAuthModalOpen] = useState(false);
  const [serviceAuthModalMode, setServiceAuthModalMode] = useState<'login' | 'register' | 'admin'>('register');

  // Authentication & Users
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminStoresList, setAdminStoresList] = useState<{ id: string; storeName: string; ownerName: string; isDemo: boolean }[]>([]);

  // Core Data
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [lang, setLang] = useState<LanguageCode>('en');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modals Visibility
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [paymentCustomerTarget, setPaymentCustomerTarget] = useState<Customer | null>(null);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProductTarget, setEditingProductTarget] = useState<Product | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | undefined>(undefined);

  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [stockProductTarget, setStockProductTarget] = useState<Product | null>(null);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const [isInvoicePrintOpen, setIsInvoicePrintOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<Sale | Order | null>(null);

  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isScanPurchaseBillOpen, setIsScanPurchaseBillOpen] = useState(false);
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);

  const handleSelectSectorDemo = async (sectorId: TradingSector, demoStoreId: string) => {
    setIsSectorModalOpen(false);
    setIsLoading(true);
    try {
      api.setStoreId(demoStoreId);
      setCurrentStoreId(demoStoreId);

      const sectorDef = TRADING_SECTORS.find(s => s.id === sectorId || s.demoStoreId === demoStoreId);
      const storeName = sectorDef?.defaultSettings?.storeName || sectorDef?.name || 'TradeMate Demo Store';

      const userObj: User = {
        id: `user-owner-${demoStoreId}`,
        name: `Demo Manager`,
        username: 'owner',
        role: 'owner',
        mobile: '9876543210',
        storeId: demoStoreId,
        storeName: storeName,
        storeSector: sectorId,
        permissions: {
          canViewReports: true,
          canEditProducts: true,
          canDeleteRecords: true,
          canCollectPayments: true,
          canCreateOrders: true,
          canManageSettings: true
        }
      };

      setCurrentUser(userObj);
      localStorage.setItem('trademate_session_user', JSON.stringify(userObj));
      localStorage.setItem('trademate_session_store_id', demoStoreId);

      await loadData(demoStoreId);
      setActiveTab('home');
      setViewMode('app');
    } catch (err) {
      console.error("Failed to select sector demo:", err);
    } finally {
      setIsLoading(false);
      setIsSectorModalOpen(false);
    }
  };

  // Load Data for active store
  const loadData = async (storeId?: string) => {
    const targetStore = storeId || getCurrentStoreId();
    setIsLoading(true);
    try {
      api.setStoreId(targetStore);
      setCurrentStoreId(targetStore);

      const fallbackSettings = getFallbackSettings(targetStore);

      const [
        usersRes,
        statsData,
        settingsData,
        customersData,
        productsData,
        ordersData,
        salesData,
        purchasesData,
        expensesData,
        suppliersData,
        notifsData,
        invTxData
      ] = await Promise.all([
        api.getUsers().catch(() => ({ users: [DEFAULT_USER] })),
        api.getDailyStats().catch(() => DEFAULT_STATS),
        api.getSettings().catch(() => fallbackSettings),
        api.getCustomers().catch(() => []),
        api.getProducts().catch(() => []),
        api.getOrders().catch(() => []),
        api.getSales().catch(() => []),
        api.getPurchases().catch(() => []),
        api.getExpenses().catch(() => []),
        api.getSuppliers().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getInventoryTransactions().catch(() => [])
      ]);

      const usersData = usersRes?.users?.length ? usersRes.users : [DEFAULT_USER];
      setUsers(usersData);

      const activeSettings = settingsData || fallbackSettings;
      setSettings(activeSettings);

      setCurrentUser(prev => {
        const primaryUser = usersData[0] || DEFAULT_USER;
        const activeStoreName = activeSettings.storeName || primaryUser.storeName;
        if (!prev) {
          const newUserObj = { ...primaryUser, storeName: activeStoreName };
          localStorage.setItem('trademate_session_user', JSON.stringify(newUserObj));
          return newUserObj;
        }

        // If active user is System Admin, preserve admin identity
        if (prev.role === 'admin') {
          const updatedAdminObj = { ...prev, storeName: activeStoreName };
          localStorage.setItem('trademate_session_user', JSON.stringify(updatedAdminObj));
          return updatedAdminObj;
        }

        const matchedUser = usersData.find(u => u.id === prev.id || u.username.toLowerCase() === prev.username.toLowerCase()) || primaryUser;
        const updatedUserObj = {
          ...matchedUser,
          storeName: activeStoreName
        };
        localStorage.setItem('trademate_session_user', JSON.stringify(updatedUserObj));
        return updatedUserObj;
      });

      // Determine active role from session
      let activeRole = currentUser?.role;
      try {
        const savedUserRaw = localStorage.getItem('trademate_session_user') || localStorage.getItem('kiranamate_session_user');
        if (savedUserRaw) {
          const parsed = JSON.parse(savedUserRaw);
          if (parsed && parsed.role) activeRole = parsed.role;
        }
      } catch {
        // ignore
      }

      if (activeRole === 'admin') {
        api.setUserRole('admin');
        const adminRes = await api.getAdminStores().catch(() => ({ stores: [] }));
        setAdminStoresList(adminRes.stores || []);
      } else if (usersData[0]) {
        api.setUserRole(usersData[0].role);
      }

      setStats(statsData || DEFAULT_STATS);
      setCustomers(customersData || []);
      setProducts(productsData || []);
      setOrders(ordersData || []);
      setSales(salesData || []);
      setPurchases(purchasesData || []);
      setExpenses(expensesData || []);
      setSuppliers(suppliersData || []);
      setNotifications(notifsData || []);
      setInventoryTransactions(invTxData || []);
    } catch (err) {
      console.error("Failed to load TradeMate data:", err);
      setCurrentUser(prev => prev || DEFAULT_USER);
      setSettings(prev => prev || getFallbackSettings(targetStore));
      setStats(prev => prev || DEFAULT_STATS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedUserRaw = localStorage.getItem('trademate_session_user') || localStorage.getItem('kiranamate_session_user');
    const savedStoreId = localStorage.getItem('trademate_session_store_id') || localStorage.getItem('kiranamate_session_store_id');

    if (savedUserRaw && savedStoreId) {
      try {
        const savedUser: User = JSON.parse(savedUserRaw);
        setCurrentUser(savedUser);
        api.setUserRole(savedUser.role);
        api.setStoreId(savedStoreId);
        setCurrentStoreId(savedStoreId);
        setViewMode('app');
        loadData(savedStoreId);
        return;
      } catch (e) {
        console.warn('Invalid stored session, falling back:', e);
      }
    }

    loadData('store-demo');
  }, []);

  // Handlers
  const handleOpenAuthModal = (mode: 'login' | 'register' | 'admin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenServiceAuthModal = (mode: 'login' | 'register' | 'admin' = 'register') => {
    setServiceAuthModalMode(mode);
    setIsServiceAuthModalOpen(true);
  };

  const handleServiceAuthSuccess = (user: User, sector: ServiceSector) => {
    setCurrentUser(user);
    localStorage.setItem('trademate_session_user', JSON.stringify(user));
    localStorage.setItem('trademate_active_workspace', 'service');
    setViewMode('app');
    setActiveTab('service_dashboard');
  };

  const handleStartDemo = async (role: 'owner' | 'staff' | 'admin') => {
    setIsLoading(true);
    try {
      api.setStoreId('store-demo');
      setCurrentStoreId('store-demo');
      const username = role === 'admin' ? 'admin' : role === 'owner' ? 'owner' : 'staff';

      let userObj: User | null = null;
      try {
        const loginRes = await api.login(username, '123456');
        if (loginRes && loginRes.user) {
          userObj = loginRes.user;
        }
      } catch (e) {
        console.warn('Backend demo login fallback:', e);
      }

      if (!userObj) {
        userObj = {
          id: role === 'admin' ? 'user-admin' : role === 'staff' ? 'user-2' : 'user-1',
          name: role === 'admin' ? 'System Administrator' : role === 'staff' ? 'Counter Staff' : 'Shop Owner',
          username,
          role,
          mobile: '9876543210',
          permissions: {
            canViewReports: true,
            canEditProducts: true,
            canDeleteRecords: role !== 'staff',
            canCollectPayments: true,
            canCreateOrders: true,
            canManageSettings: role !== 'staff'
          }
        };
      }

      setCurrentUser(userObj);
      api.setUserRole(userObj.role);
      localStorage.setItem('trademate_session_user', JSON.stringify(userObj));
      localStorage.setItem('trademate_session_store_id', 'store-demo');

      await loadData('store-demo');
      setActiveTab('home');
      setViewMode('app');
    } catch (err) {
      console.error('Demo boot error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (user: User, storeId: string) => {
    setCurrentUser(user);
    api.setUserRole(user.role);
    api.setStoreId(storeId);
    setCurrentStoreId(storeId);

    localStorage.setItem('trademate_session_user', JSON.stringify(user));
    localStorage.setItem('trademate_session_store_id', storeId);

    await loadData(storeId);
    setViewMode('app');
  };

  const handleUserSwitch = (user: User) => {
    setCurrentUser(user);
    api.setUserRole(user.role);
    localStorage.setItem('trademate_session_user', JSON.stringify(user));
  };

  const handleAdminSwitchStore = async (targetStoreId: string) => {
    localStorage.setItem('trademate_session_store_id', targetStoreId);
    await loadData(targetStoreId);
  };

  const handleGoToLanding = () => {
    localStorage.removeItem('trademate_session_user');
    localStorage.removeItem('trademate_session_store_id');
    localStorage.removeItem('kiranamate_session_user');
    localStorage.removeItem('kiranamate_session_store_id');
    setCurrentUser(null);
    api.setStoreId('store-demo');
    setCurrentStoreId('store-demo');
    setViewMode('landing');
  };

  const handleBarcodeDetected = (barcode: string) => {
    setLastScannedBarcode(barcode);
    const found = products.find(p => p.barcode === barcode);
    if (found) {
      setIsNewSaleOpen(true);
    } else {
      setEditingProductTarget(null);
      setIsAddProductOpen(true);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'new-sale':
        setIsNewSaleOpen(true);
        break;
      case 'new-order':
        setIsNewOrderOpen(true);
        break;
      case 'collect-payment':
        setPaymentCustomerTarget(null);
        setIsCollectPaymentOpen(true);
        break;
      case 'add-stock':
        setStockProductTarget(null);
        setIsAddStockOpen(true);
        break;
      case 'add-product':
        setEditingProductTarget(null);
        setIsAddProductOpen(true);
        break;
      case 'add-customer':
        setActiveTab('customers');
        break;
      case 'add-expense':
        setIsAddExpenseOpen(true);
        break;
      default:
        break;
    }
  };

  const handleOpenCollectPayment = (customer?: Customer) => {
    setPaymentCustomerTarget(customer || null);
    setIsCollectPaymentOpen(true);
  };

  const handleOpenAddStock = (product?: Product) => {
    setStockProductTarget(product || null);
    setIsAddStockOpen(true);
  };

  const handleOpenInvoicePrint = (data: Sale | Order) => {
    setInvoiceData(data);
    setIsInvoicePrintOpen(true);
  };

  const handleSelectServiceSector = (sectorId: ServiceSector) => {
    setSelectedServiceSector(sectorId);
    serviceStore.setActiveSector(sectorId);
    setIsServiceSectorModalOpen(false);
    setViewMode('service_login');
  };

  const handleServiceLoginSuccess = (user: User, sector: ServiceSector) => {
    setCurrentUser(user);
    serviceStore.setActiveSector(sector);
    setViewMode('app');
    setActiveTab('service_dashboard');
  };

  // IF LANDING PAGE VIEW IS ACTIVE
  if (viewMode === 'landing') {
    return (
      <>
        <LandingView
          onOpenAuthModal={handleOpenAuthModal}
          onStartDemo={handleStartDemo}
          lang={lang}
          onLanguageChange={setLang}
          onSelectSectorDemo={handleSelectSectorDemo}
          onOpenSectorModal={() => setIsSectorModalOpen(true)}
          onOpenServiceSectorModal={() => handleOpenServiceAuthModal('register')}
        />

        {/* Multi-Sector Trading Demo Selector Modal */}
        <SectorDemoModal
          isOpen={isSectorModalOpen}
          onClose={() => setIsSectorModalOpen(false)}
          currentSector={settings?.sector}
          onSelectSectorDemo={handleSelectSectorDemo}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onAuthSuccess={handleAuthSuccess}
        />

        <ServiceAuthModal
          isOpen={isServiceAuthModalOpen}
          onClose={() => setIsServiceAuthModalOpen(false)}
          initialMode={serviceAuthModalMode}
          onAuthSuccess={handleServiceAuthSuccess}
        />
      </>
    );
  }

  // IF SERVICE ERP LOGIN VIEW IS ACTIVE (legacy per-sector directory flow, kept for direct links)
  if (viewMode === 'service_login') {
    return (
      <>
        <ServiceLoginView
          sector={selectedServiceSector}
          onBackToDirectory={() => {
            setIsServiceSectorModalOpen(true);
            setViewMode('landing');
          }}
          onLoginSuccess={handleServiceLoginSuccess}
        />

        {/* Service ERP Directory Modal */}
        <ServiceSectorModal
          isOpen={isServiceSectorModalOpen}
          onClose={() => setIsServiceSectorModalOpen(false)}
          onSelectSector={handleSelectServiceSector}
        />
      </>
    );
  }

  // IF STORE APP VIEW IS ACTIVE
  const activeSettings = settings || getFallbackSettings(currentStoreId);
  const activeStats = stats || DEFAULT_STATS;
  const activeUser = currentUser || DEFAULT_USER;

  if (isLoading && (!settings && !stats)) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Loading TradeMate Universal Control Panel...</p>
        </div>
      </div>
    );
  }

  const customersWithUdhaar = customers.filter(c => (c.currentBalance || 0) > 0);
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Mobile/Desktop Header */}
      <Header
        settings={activeSettings}
        lang={lang}
        onLanguageChange={setLang}
        currentUser={activeUser}
        onUserSwitch={handleUserSwitch}
        users={users.length ? users : [activeUser]}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        globalSearchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onNavigateToTab={setActiveTab}
        currentStoreId={currentStoreId}
        onGoToLanding={handleGoToLanding}
        adminStoresList={adminStoresList}
        onAdminSwitchStore={handleAdminSwitchStore}
        onOpenSectorModal={() => setIsSectorModalOpen(true)}
        onSelectSectorDemo={handleSelectSectorDemo}
        activeSectorId={activeSettings.sector}
        onOpenNewSale={() => setIsNewSaleOpen(true)}
        onOpenScanBill={() => setIsScanPurchaseBillOpen(true)}
        onOpenCollectPayment={() => handleOpenCollectPayment()}
        activeTab={activeTab}
        onOpenServiceSectorModal={() => handleOpenServiceAuthModal('register')}
      />

      {/* Main Container Layout */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* Left Desktop Navigation Sidebar */}
        <DesktopSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lang={lang}
          stats={activeStats}
          currentUser={activeUser}
          onOpenQuickAction={handleQuickAction}
          onLogout={handleGoToLanding}
          onOpenSectorModal={() => setIsSectorModalOpen(true)}
          activeSectorId={activeSettings.sector}
          onOpenServiceSectorModal={() => handleOpenServiceAuthModal('register')}
        />

        {/* View Router Main Screen */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto max-w-full">
          {activeTab === 'home' && (
            <DashboardView
              stats={activeStats}
              settings={activeSettings}
              lang={lang}
              customersWithUdhaar={customersWithUdhaar}
              lowStockProducts={lowStockProducts}
              recentSales={sales}
              recentOrders={orders}
              onOpenQuickAction={handleQuickAction}
              onNavigateToTab={setActiveTab}
              onOpenCollectPayment={handleOpenCollectPayment}
              onOpenAddStock={handleOpenAddStock}
              onOpenInvoicePrint={handleOpenInvoicePrint}
              totalProductsCount={products.length}
              onRefreshData={() => loadData(currentStoreId)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              settings={activeSettings}
              lang={lang}
              onRefreshData={() => loadData(currentStoreId)}
              onOpenCollectPayment={handleOpenCollectPayment}
              onOpenNewOrderForCustomer={(cust) => {
                setPaymentCustomerTarget(cust);
                setIsNewOrderOpen(true);
              }}
            />
          )}

          {activeTab === 'stock' && (
            <ProductsView
              products={products}
              settings={activeSettings}
              onOpenAddProduct={(prod) => {
                setEditingProductTarget(prod || null);
                setIsAddProductOpen(true);
              }}
              onOpenAddStock={handleOpenAddStock}
              onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
              onOpenBulkImport={() => setIsBulkImportOpen(true)}
              onRefreshData={() => loadData(currentStoreId)}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              settings={activeSettings}
              lang={lang}
              onRefreshData={() => loadData(currentStoreId)}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
              onOpenInvoicePrint={handleOpenInvoicePrint}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              sales={sales}
              settings={activeSettings}
              onOpenNewSale={() => setIsNewSaleOpen(true)}
              onOpenInvoicePrint={handleOpenInvoicePrint}
              onRefreshData={() => loadData(currentStoreId)}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesView
              purchases={purchases}
              suppliers={suppliers}
              settings={activeSettings}
              onOpenAddStock={() => setIsAddStockOpen(true)}
              onOpenScanBill={() => setIsScanPurchaseBillOpen(true)}
              onRefreshData={() => loadData(currentStoreId)}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              settings={activeSettings}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onRefreshData={() => loadData(currentStoreId)}
            />
          )}

          {activeTab === 'stockLedger' && (
            <StockLedgerView
              products={products}
              sales={sales}
              purchases={purchases}
              inventoryTransactions={inventoryTransactions}
              settings={activeSettings}
              onRefreshData={() => loadData(currentStoreId)}
              onOpenAddStock={() => setIsAddStockOpen(true)}
              onOpenScanBill={() => setIsScanPurchaseBillOpen(true)}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceView
              sales={sales}
              purchases={purchases}
              expenses={expenses}
              customers={customers}
              suppliers={suppliers}
              products={products}
              stats={activeStats}
              settings={activeSettings}
              onRefreshData={() => loadData(currentStoreId)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              stats={activeStats}
              products={products}
              sales={sales}
              settings={activeSettings}
            />
          )}

          {(activeTab === 'settings' || activeTab === 'service_settings') && (
            <SettingsView
              settings={activeSettings}
              onRefreshData={() => loadData(currentStoreId)}
              isServiceMode={
                activeTab === 'service_settings' ||
                activeTab.startsWith('service_') ||
                localStorage.getItem('trademate_active_workspace') === 'service'
              }
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              purchases={purchases}
              settings={activeSettings}
              onRefreshData={() => loadData(currentStoreId)}
              onOpenAddStock={() => setIsAddStockOpen(true)}
              onOpenScanBill={() => setIsScanPurchaseBillOpen(true)}
            />
          )}

          {activeTab === 'backup' && (
            <BackupView
              onRefreshData={() => loadData(currentStoreId)}
            />
          )}

          {activeTab === 'system_admin' && (
            <SystemAdminView
              onSwitchStore={handleAdminSwitchStore}
            />
          )}

          {/* SERVICE ERP MODULE VIEWS */}
          {(activeTab === 'service_dashboard' || activeTab === 'services') && (
            <ServiceDashboardView onNavigateTab={setActiveTab} />
          )}
          {activeTab === 'service_pos' && (
            <ServicePosView onNavigateTab={setActiveTab} />
          )}
          {activeTab === 'service_appointments' && (
            <ServiceAppointmentsView onNavigateTab={setActiveTab} />
          )}
          {activeTab === 'service_jobs' && (
            <ServiceJobCardsView onNavigateTab={setActiveTab} />
          )}
          {activeTab === 'service_customers' && (
            <ServiceCustomersView onNavigateTab={setActiveTab} />
          )}
          {activeTab === 'service_staff' && (
            <ServiceStaffView />
          )}
          {activeTab === 'service_packages' && (
            <ServicePackagesView />
          )}
          {activeTab === 'service_payments' && (
            <ServicePaymentsView />
          )}
          {activeTab === 'service_expenses' && (
            <ServiceExpensesView />
          )}
          {activeTab === 'service_invoices' && (
            <ServiceInvoicesView />
          )}
          {activeTab === 'service_quotations' && (
            <ServiceQuotationsView />
          )}
          {activeTab === 'service_reports' && (
            <ServiceReportsView />
          )}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lang={lang}
        stats={activeStats}
        onOpenQuickAction={handleQuickAction}
        onLogout={handleGoToLanding}
      />

      {/* Modals & Dialogs */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onBarcodeDetected={handleBarcodeDetected}
        products={products}
        settings={activeSettings}
      />

      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        products={products}
        customers={customers}
        settings={settings}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onSaleSuccess={() => loadData(currentStoreId)}
        onOpenInvoicePrint={handleOpenInvoicePrint}
      />

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        products={products}
        customers={customers}
        settings={activeSettings}
        selectedCustomerForOrder={paymentCustomerTarget}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOrderSuccess={() => loadData(currentStoreId)}
        onOpenInvoicePrint={handleOpenInvoicePrint}
      />

      <CollectPaymentModal
        isOpen={isCollectPaymentOpen}
        onClose={() => setIsCollectPaymentOpen(false)}
        customers={customers}
        selectedCustomerForPayment={paymentCustomerTarget}
        settings={settings}
        onPaymentSuccess={() => loadData(currentStoreId)}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        productToEdit={editingProductTarget}
        suppliers={suppliers}
        settings={activeSettings}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        scannedBarcode={lastScannedBarcode}
        onProductSaved={() => loadData(currentStoreId)}
        activeSector={settings?.sector}
      />

      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        products={products}
        suppliers={suppliers}
        settings={activeSettings}
        selectedProductForStock={stockProductTarget}
        onStockAdded={() => loadData(currentStoreId)}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onExpenseSaved={() => loadData(currentStoreId)}
        recordedBy={currentUser.name}
        settings={activeSettings}
      />

      <InvoicePrintModal
        isOpen={isInvoicePrintOpen}
        onClose={() => setIsInvoicePrintOpen(false)}
        data={invoiceData}
        settings={settings}
      />

      <BulkProductImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportComplete={() => loadData(currentStoreId)}
      />

      <ScanPurchaseBillModal
        isOpen={isScanPurchaseBillOpen}
        onClose={() => setIsScanPurchaseBillOpen(false)}
        suppliers={suppliers}
        products={products}
        settings={activeSettings}
        onBillProcessed={() => loadData(currentStoreId)}
      />

      {/* Multi-Sector Trading Demo Selector Modal */}
      <SectorDemoModal
        isOpen={isSectorModalOpen}
        onClose={() => setIsSectorModalOpen(false)}
        currentSector={settings?.sector}
        onSelectSectorDemo={handleSelectSectorDemo}
      />

      {/* Universal Service ERP Sector Selector Modal (legacy, no longer opened from any button) */}
      <ServiceSectorModal
        isOpen={isServiceSectorModalOpen}
        onClose={() => setIsServiceSectorModalOpen(false)}
        onSelectSector={handleSelectServiceSector}
      />

      {/* Service ERP Business Access — Sign Up / Login / Admin */}
      <ServiceAuthModal
        isOpen={isServiceAuthModalOpen}
        onClose={() => setIsServiceAuthModalOpen(false)}
        initialMode={serviceAuthModalMode}
        onAuthSuccess={handleServiceAuthSuccess}
      />

      {/* AI Assistant & Voice Commands Floating Widget */}
      {viewMode === 'app' && (
        <AiAssistantWidget
          products={products}
          customers={customers}
          stats={stats}
          recentSales={sales}
          settings={activeSettings}
          onNavigateTab={setActiveTab}
          onOpenQuickAction={(action) => {
            if (action === 'new_sale') setIsNewSaleOpen(true);
            else if (action === 'new_order') setIsNewOrderOpen(true);
            else if (action === 'scan_bill') setIsScanPurchaseBillOpen(true);
          }}
        />
      )}

      {/* Auth Modal Triggered from Header or Landing */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
