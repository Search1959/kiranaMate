import React from 'react';
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Package,
  ArrowUpRight,
  User,
  Plus,
  ShoppingCart,
  Receipt,
  UserPlus,
  Share2,
  AlertTriangle,
  ChevronRight,
  Clock,
  Sparkles,
  Wallet
} from 'lucide-react';
import { DailyStats, StoreSettings, Customer, LanguageCode, Sale, Order, Product } from '../types';
import { translations } from '../lib/translations';
import { getWhatsAppWebLink, generateUdhaarReminderText } from '../lib/whatsapp';
import { EmptyStateWizard } from '../components/EmptyStateWizard';

interface DashboardViewProps {
  stats: DailyStats;
  settings: StoreSettings;
  lang: LanguageCode;
  customersWithUdhaar: Customer[];
  lowStockProducts: Product[];
  recentSales: Sale[];
  recentOrders: Order[];
  onOpenQuickAction: (action: string) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenCollectPayment: (customer: Customer) => void;
  onOpenAddStock: (product: Product) => void;
  onOpenInvoicePrint: (data: Sale | Order) => void;
  totalProductsCount?: number;
  onRefreshData?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  settings,
  lang,
  customersWithUdhaar,
  lowStockProducts,
  recentSales,
  recentOrders,
  onOpenQuickAction,
  onNavigateToTab,
  onOpenCollectPayment,
  onOpenAddStock,
  onOpenInvoicePrint,
  totalProductsCount = 10,
  onRefreshData = () => {}
}) => {
  const t = translations[lang] || translations.en;

  return (
    <div className="space-y-5 pb-12 sm:pb-6 font-sans text-slate-900">
      {/* Zero Data Onboarding Wizard for New Store Accounts */}
      {totalProductsCount === 0 && (
        <EmptyStateWizard
          storeName={settings.storeName}
          onNavigateTab={onNavigateToTab}
          onRefreshData={onRefreshData}
        />
      )}
      {/* 1. Metric Cards Grid (4 columns on desktop) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div
          onClick={() => onNavigateToTab('sales')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t.todaysSales}
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-slate-900">
              ₹{(stats?.todaySalesTotal ?? 0).toLocaleString('en-IN')}
            </h3>
            <span className="text-green-600 text-xs font-bold">↑ Today</span>
          </div>
          <div className="flex gap-2.5 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            <span>Cash: <strong className="text-slate-800">₹{stats?.cashSales ?? 0}</strong></span>
            <span>UPI: <strong className="text-slate-800">₹{stats?.upiSales ?? 0}</strong></span>
          </div>
        </div>

        {/* Card 2: Pending Udhaar */}
        <div
          onClick={() => onNavigateToTab('customers')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-orange-400 hover:border-orange-400 transition-all cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t.pendingUdhaar}
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-slate-900">
              ₹{(stats?.totalPendingUdhaar ?? 0).toLocaleString('en-IN')}
            </h3>
            <button className="text-blue-600 text-xs font-bold hover:underline">Collect</button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {(customersWithUdhaar || []).length} customers outstanding • Collected ₹{stats?.todayCollection ?? 0}
          </p>
        </div>

        {/* Card 3: Pending Orders */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t.pendingOrders}
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-slate-900">
              {stats?.pendingOrdersCount ?? 0}
            </h3>
            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold">
              Action Needed
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {stats?.newOrdersCount ?? 0} New • {stats?.outForDeliveryCount ?? 0} Out for delivery
          </p>
        </div>

        {/* Card 4: Est. Profit (Today) */}
        <div
          onClick={() => onNavigateToTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t.estimatedProfit} (Today)
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-slate-900">
              ₹{(stats?.estimatedProfitToday ?? 0).toLocaleString('en-IN')}
            </h3>
            <span className="text-blue-600 text-xs font-bold">~15.5% Margin</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            After ₹{stats?.todayExpenses ?? 0} expenses
          </p>
        </div>
      </section>

      {/* 2. Main Content Grid (Pending Collection & Stock Alerts) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Critical Pending Collection Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" /> Critical Udhaar Collections
            </h4>
            <button onClick={() => onNavigateToTab('customers')} className="text-blue-600 text-xs font-semibold hover:underline">
              View All ({customersWithUdhaar.length})
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-100 text-slate-400 font-medium">
                <tr>
                  <th className="p-3 uppercase text-[10px] font-bold tracking-wider">Customer</th>
                  <th className="p-3 uppercase text-[10px] font-bold tracking-wider">Pending</th>
                  <th className="p-3 uppercase text-[10px] font-bold tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customersWithUdhaar.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-400 text-xs">
                      No pending Udhaar balances. Great job!
                    </td>
                  </tr>
                ) : (
                  customersWithUdhaar.slice(0, 5).map(cust => (
                    <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{cust.name}</div>
                        <div className="text-[10px] text-slate-400">{cust.area} • +91 {cust.mobile}</div>
                      </td>
                      <td className="p-3 font-bold text-red-600">
                        ₹{(cust?.currentBalance ?? cust?.outstandingBalance ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenCollectPayment(cust)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Collect
                          </button>
                          <a
                            href={getWhatsAppWebLink(cust.mobile, generateUdhaarReminderText(cust, settings, lang))}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Share2 className="w-3 h-3" /> WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Stack: Stock Alerts & Quick Actions */}
        <div className="grid grid-rows-1 sm:grid-rows-2 gap-5">
          {/* Stock Alerts Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Low Stock Items
              </h4>
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">
                {lowStockProducts.length} NEED RESTOCK
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {lowStockProducts.length === 0 ? (
                <p className="col-span-2 text-center text-xs text-slate-400 py-3">All stocks healthy!</p>
              ) : (
                lowStockProducts.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between border border-slate-200 p-2.5 rounded-lg bg-slate-50/50">
                    <div className="overflow-hidden pr-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                      <p className={`text-[10px] font-semibold ${p.currentStock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {p.currentStock === 0 ? '0 pcs (Out of stock)' : `${p.currentStock} ${p.unit} left`}
                      </p>
                    </div>
                    <button
                      onClick={() => onOpenAddStock(p)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shrink-0 cursor-pointer"
                    >
                      + Stock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Tile Box */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col">
            <h4 className="text-sm font-bold text-slate-900 mb-3">{t.quickActions}</h4>
            <div className="grid grid-cols-3 gap-3 flex-1">
              <button
                onClick={() => onOpenQuickAction('new-sale')}
                className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/60 transition-all p-2 text-slate-800 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold">Express Sale</span>
              </button>
              <button
                onClick={() => onOpenQuickAction('new-order')}
                className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/60 transition-all p-2 text-slate-800 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold">New Order</span>
              </button>
              <button
                onClick={() => onOpenQuickAction('add-stock')}
                className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/60 transition-all p-2 text-slate-800 cursor-pointer"
              >
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold">Restock</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recent Activity Feeds */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Counter Sales Log */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" /> Recent Daily Sales
            </h3>
            <button onClick={() => onNavigateToTab('sales')} className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentSales.slice(0, 4).map(s => (
              <div key={s.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">{s.saleNumber} • {s.customerName}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {s.paymentMethod}
                  </span>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">₹{s.grandTotal}</span>
                  <button
                    onClick={() => onOpenInvoicePrint(s)}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Print Bill"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Delivery Orders */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" /> Recent Customer Orders
            </h3>
            <button onClick={() => onNavigateToTab('orders')} className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.slice(0, 4).map(o => (
              <div key={o.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">{o.orderNumber} • {o.customerName}</span>
                  <span className="text-[10px] text-slate-400">{o.items.length} items ordered</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">₹{o.total}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    o.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {o.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
