import React, { useState } from 'react';
import {
  Store,
  ShoppingCart,
  CreditCard,
  Package,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserCheck,
  Users,
  Smartphone,
  Globe,
  Award,
  Zap,
  Lock,
  ChevronRight,
  Star,
  Printer,
  Bell,
  HelpCircle
} from 'lucide-react';
import { LanguageCode, TradingSector } from '../types';

interface LandingViewProps {
  onOpenAuthModal: (mode: 'login' | 'register' | 'admin') => void;
  onStartDemo: (role: 'owner' | 'staff' | 'admin') => void;
  lang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSelectSectorDemo?: (sectorId: TradingSector, demoStoreId: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenAuthModal,
  onStartDemo,
  lang,
  onLanguageChange,
  onSelectSectorDemo
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Kirana<span className="text-blue-400">Mate</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-semibold leading-none">
              Smart POS & Khata System
            </span>
          </div>
        </div>

        {/* Nav Links & Actions */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Shopkeeper Reviews</a>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={lang}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-white focus:outline-none text-xs cursor-pointer"
            >
              <option value="en" className="bg-slate-800">English</option>
              <option value="hi" className="bg-slate-800">हिन्दी (Hindi)</option>
              <option value="mr" className="bg-slate-800">मराठी (Marathi)</option>
              <option value="gu" className="bg-slate-800">ગુજરાતી (Gujarati)</option>
              <option value="ta" className="bg-slate-800">தமிழ் (Tamil)</option>
            </select>
          </div>

          <button
            onClick={() => onOpenAuthModal('login')}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            Login
          </button>

          <button
            onClick={() => onOpenAuthModal('register')}
            className="px-4 py-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Create Free Store</span>
          </button>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <section className="relative pt-8 pb-16 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Panel: Hero Main Headline & CTAs */}
          <div className="lg:col-span-5 text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              🇮🇳 Trusted by 10,000+ Kirana & Grocery Shops Across India
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Digitalize Your Kirana Shop in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">60 Seconds</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              All-in-One Smart POS Counter Billing, WhatsApp Udhaar Khata Digital Reminders, Barcode Stock Alerts & WhatsApp Delivery Order Management.
            </p>

            {/* Key CTA Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onStartDemo('owner')}
                className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer text-xs sm:text-sm"
              >
                <Zap className="w-4 h-4 text-yellow-300 shrink-0" />
                <span>Try Instant Live Demo (Pre-loaded Store)</span>
              </button>

              <button
                onClick={() => onOpenAuthModal('register')}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-xs sm:text-sm"
              >
                <Store className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Start Clean Shop</span>
              </button>
            </div>

            <div className="pt-1 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenAuthModal('admin')}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-xs"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>System Admin Login</span>
              </button>

              <span className="text-[11px] text-slate-400">
                ⚡ Instant setup • Free Demo
              </span>
            </div>
          </div>

          {/* Right Panel: Multi-Sector Trading Industry Support Showcase */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative z-10 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-blue-400/30">
                      Universal Trading Platform
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">Built for Any Trading Industry</h3>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Select a sector below to test live interactive demo environments customized with tailored units & categories.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onSelectSectorDemo) {
                      onSelectSectorDemo('METALS_STEEL', 'store-demo-steel');
                    } else {
                      onStartDemo('owner');
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Launch Steel Demo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2 pt-3">
                {[
                  { id: 'METALS_STEEL', title: 'Iron & Steel / Metals', units: 'MT, Quintal, kg, Length', color: 'text-slate-200 bg-slate-800/80 border-slate-700', demoStoreId: 'store-demo-steel' },
                  { id: 'ENERGY', title: 'Energy Commodities', units: 'Litre, KL, Barrel, Cylinder', color: 'text-amber-200 bg-amber-950/30 border-amber-800/40', demoStoreId: 'store-demo-energy' },
                  { id: 'AGRICULTURE', title: 'Agri Commodities', units: 'Quintal, MT, Bag, kg', color: 'text-emerald-200 bg-emerald-950/30 border-emerald-800/40', demoStoreId: 'store-demo-agri' },
                  { id: 'CHEMICALS', title: 'Chemicals & Petro', units: 'Drum, Barrel, kg, Litre', color: 'text-purple-200 bg-purple-950/30 border-purple-800/40', demoStoreId: 'store-demo-chemical' },
                  { id: 'KIRANA_FMCG', title: 'FMCG & Kirana', units: 'pkt, kg, pouch, bottle', color: 'text-blue-200 bg-blue-950/30 border-blue-800/40', demoStoreId: 'store-demo-kirana' },
                  { id: 'TEXTILES', title: 'Textiles & Fabrics', units: 'Meter, Roll, Bale, pcs', color: 'text-teal-200 bg-teal-950/30 border-teal-800/40', demoStoreId: 'store-demo-textile' },
                  { id: 'JEWELLERY', title: 'Jewellery & Gems', units: 'Gram, Carat, Tola, pcs', color: 'text-yellow-200 bg-amber-900/30 border-amber-700/50', demoStoreId: 'store-demo-jewellery' },
                  { id: 'STATIONERY', title: 'Stationery & Books', units: 'Ream, Box, Pack, pcs', color: 'text-indigo-200 bg-indigo-950/30 border-indigo-800/40', demoStoreId: 'store-demo-stationery' },
                  { id: 'BUILDING_HARDWARE', title: 'Building & Hardware', units: 'Bag, Piece, Box, Meter', color: 'text-stone-200 bg-stone-900/50 border-stone-700', demoStoreId: 'store-demo-hardware' },
                  { id: 'KIRANA_FMCG', title: 'General Trading', units: 'pcs, Box, Lot, kg', color: 'text-blue-200 bg-slate-800/80 border-slate-700', demoStoreId: 'store-demo-kirana' },
                ].map((s) => (
                  <div
                    key={s.title}
                    onClick={() => {
                      if (onSelectSectorDemo) {
                        onSelectSectorDemo(s.id as TradingSector, s.demoStoreId);
                      } else {
                        onStartDemo('owner');
                      }
                    }}
                    className={`p-2.5 rounded-xl border ${s.color} hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.02]`}
                  >
                    <div>
                      <div className="font-bold text-xs truncate text-white">{s.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Units: {s.units}</div>
                    </div>
                    <div className="text-[9px] font-bold text-blue-400 mt-1.5 flex items-center gap-0.5">
                      <span>Demo Available</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Card Showcase */}
        <div className="mt-12 max-w-5xl mx-auto bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-xl relative z-10">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              <span className="ml-2 font-mono text-slate-300 font-bold">Gupta Kirana Store - Live POS Control</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
              ● Counter Active
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Today's Sales</div>
              <div className="text-xl sm:text-2xl font-black text-white">₹14,850</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">Cash ₹8,200 • UPI ₹6,650</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Pending Udhaar</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">₹8,450</div>
              <div className="text-[10px] text-slate-400 font-semibold mt-1">12 Customers Khata</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Pending Orders</div>
              <div className="text-xl sm:text-2xl font-black text-blue-400">5 Orders</div>
              <div className="text-[10px] text-blue-300 font-semibold mt-1">Home Delivery Active</div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Estimated Profit</div>
              <div className="text-xl sm:text-2xl font-black text-teal-300">₹2,310</div>
              <div className="text-[10px] text-slate-400 font-semibold mt-1">Today Net Margin</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section id="features" className="py-20 px-4 sm:px-8 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400">Complete Shop Solution</h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Everything Your Kirana Shop Needs to Grow Profit
            </h3>
            <p className="text-sm sm:text-base text-slate-400">
              Designed specifically for Indian grocery counters, KiranaMate replaces traditional ledger notebooks with lightning fast digital tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Express 30-Sec POS Billing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fast barcode scanning via camera or USB scanner. Add items, apply instant discount, generate thermal printer receipts or share WhatsApp invoice.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Smart WhatsApp Khata Ledger</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track customer Udhaar balances automatically. Send 1-tap WhatsApp reminder messages with UPI payment links for 3x faster collection!
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-rose-500/50 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Live Stock & Low Stock Alerts</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stock automatically deducts on every sale. Receive automated alerts when items fall below minimum reorder levels so you never run out.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">WhatsApp Delivery Orders</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive customer delivery orders directly on WhatsApp, convert them into POS sales with 1-click, and manage order dispatch status.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Daily Net Profit Analytics</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live calculation of sales revenue, cost of goods sold, daily shop expenses (rent, electricity, staff salary), and net profit margin.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">5 Regional Languages</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Switch entire app interface between English, Hindi (हिन्दी), Marathi (मराठी), Gujarati (ગુજરાતી), and Tamil (தமிழ்) with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo vs New Account Explanation Banner */}
      <section className="py-16 px-4 sm:px-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 border border-blue-500/30 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-400 shrink-0" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Two Modes for Ultimate Flexibility</h3>
              <p className="text-xs sm:text-sm text-slate-300">Choose how you want to experience KiranaMate today</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Demo Store & System Admin
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                  Pre-loaded Data
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore a fully populated shop with 100+ grocery products, past sales history, pending Khata balances, and System Admin store switcher.
              </p>
              <button
                onClick={() => onStartDemo('owner')}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Launch Demo Mode Now →
              </button>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-400 flex items-center gap-1.5">
                  <Store className="w-4 h-4" /> New Shop Account (From Scratch)
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full">
                  Zero Demo Data
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Register your real shop name. Your account starts with a clean slate (0 sales, 0 products) so you build your own custom inventory and prices.
              </p>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Register New Shop (Zero Data) →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className="py-20 px-4 sm:px-8 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400">Affordable Plans</h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white">Simple, Honest Shop Pricing</h3>
            <p className="text-sm text-slate-400">Start free today. Upgrade as your shop grows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white">Starter Kirana</h4>
                <p className="text-xs text-slate-400 mt-1">For small single-counter shops</p>
                <div className="mt-4 text-3xl font-black text-white">₹0 <span className="text-xs font-normal text-slate-400">/ forever</span></div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Express POS Counter Billing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 500 Inventory Items</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Customer Udhaar Khata Ledger</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Thermal Receipt Printing</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Start Free Plan
              </button>
            </div>

            {/* Plan 2 */}
            <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-blue-500/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider">
                Most Popular
              </span>
              <div>
                <h4 className="text-lg font-bold text-white">Pro Supermarket</h4>
                <p className="text-xs text-slate-400 mt-1">For growing grocery outlets</p>
                <div className="mt-4 text-3xl font-black text-white">₹499 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Everything in Starter Plan</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Unlimited Inventory & Products</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Automated WhatsApp Reminders</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Staff Roles & Permissions</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> WhatsApp Home Delivery Orders</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-blue-600/30"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white">System Admin Enterprise</h4>
                <p className="text-xs text-slate-400 mt-1">For multi-branch & chain stores</p>
                <div className="mt-4 text-3xl font-black text-white">₹1,499 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Multi-Store Management Console</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> System Administrator Controls</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Consolidated Financial Reports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Priority WhatsApp & Phone Support</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuthModal('admin')}
                className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                System Admin Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-400">Got questions? We have answers for shop owners.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Do I need an expensive computer or barcode scanner?",
                a: "No! KiranaMate runs directly in any phone browser, tablet, or PC. You can scan barcodes using your smartphone camera or plug in any standard USB barcode scanner."
              },
              {
                q: "Does a new registered account come with zero demo data?",
                a: "Yes! When you click 'Create Free Store' and register your shop name, your account starts with a fresh clean database (0 sales, 0 products) so you build your own shop inventory from scratch."
              },
              {
                q: "How does the WhatsApp Udhaar Khata reminder work?",
                a: "When a customer has pending credit balance, you can click 'Send WhatsApp Reminder'. KiranaMate auto-formats a polite reminder message in Hindi or English with their balance and your shop UPI payment link."
              },
              {
                q: "Can my shop staff use this with limited permissions?",
                a: "Yes! You can create staff accounts. Staff can perform sales, scan items, and collect payments, but cannot view profit reports or edit critical store settings."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left text-xs sm:text-sm font-semibold text-white flex items-center justify-between hover:bg-slate-900/60"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    {item.q}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-900 pt-2">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-8 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white">KiranaMate</span>
            <span>— Smart POS & Udhaar Management System</span>
          </div>
          <p>© {new Date().getFullYear()} KiranaMate POS. Built for Indian Shopkeepers with ❤️</p>
        </div>
      </footer>
    </div>
  );
};
