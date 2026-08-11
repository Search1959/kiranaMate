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
  Smartphone,
  Globe,
  Zap,
  ChevronRight,
  HelpCircle,
  Layers,
  Wrench,
  ClipboardList,
  Rocket,
  LineChart,
  Menu,
  X,
  LogIn
} from 'lucide-react';
import { LanguageCode, TradingSector } from '../types';

interface LandingViewProps {
  onOpenAuthModal: (mode: 'login' | 'register' | 'admin') => void;
  onStartDemo: (role: 'owner' | 'staff' | 'admin') => void;
  lang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSelectSectorDemo?: (sectorId: TradingSector, demoStoreId: string) => void;
  onOpenSectorModal?: () => void;
  onOpenServiceSectorModal?: () => void;
  onOpenHelp?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenAuthModal,
  onStartDemo,
  lang,
  onLanguageChange,
  onSelectSectorDemo,
  onOpenSectorModal,
  onOpenServiceSectorModal,
  onOpenHelp
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSignUpChooser, setShowSignUpChooser] = useState(false);

  // Soft, best-effort framing only — not authoritative (that's the signup
  // form's explicit country field). A visitor whose browser locale doesn't
  // look Indian sees a neutral hero badge instead of an India-specific one;
  // everyone still gets the exact same product and features either way.
  const isLikelyOverseas = (() => {
    try {
      const locales = (typeof navigator !== 'undefined' && navigator.languages && navigator.languages.length)
        ? Array.from(navigator.languages)
        : [typeof navigator !== 'undefined' ? navigator.language : 'en-IN'];
      return !locales.some(loc => loc.toLowerCase().includes('-in') || loc.toLowerCase() === 'in');
    } catch {
      return false;
    }
  })();

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-slate-900">
      {/* Top Header Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-100 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-display font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
              Trade<span className="text-emerald-600">POSX</span>
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-semibold leading-none">
              Universal Business ERP & POS
            </span>
          </div>
        </div>

        {/* Nav Links & Actions */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={onOpenSectorModal}
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold transition-all bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-300 px-3 py-1.5 rounded-full cursor-pointer"
            title="Browse all 23 Industry ERP Templates & Demo Environments"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>23 Trading Templates</span>
            <span className="bg-emerald-500/20 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
              Hub
            </span>
          </button>

          {/* Service ERP Directory Button */}
          <button
            onClick={onOpenServiceSectorModal}
            className="flex items-center gap-1.5 text-indigo-300 hover:text-slate-900 font-extrabold transition-all bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/40 px-3.5 py-1.5 rounded-full cursor-pointer shadow-sm hover:shadow-indigo-500/20"
            title="Open Universal Service Business ERP (34 Service Sectors)"
          >
            <Wrench className="w-4 h-4 text-indigo-400" />
            <span>Service ERP</span>
            <span className="bg-indigo-500/30 text-indigo-100 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
              34 Sectors
            </span>
          </button>

          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          {onOpenHelp && (
            <button onClick={onOpenHelp} className="hover:text-slate-900 transition-colors cursor-pointer">
              Help &amp; Guide
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher (desktop/tablet only — lives in the mobile menu sheet below) */}
          <div className="hidden sm:flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-full border border-green-100 text-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={lang}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-slate-900 focus:outline-none text-xs cursor-pointer"
            >
              <option value="en" className="bg-white">English</option>
              <option value="hi" className="bg-white">हिन्दी (Hindi)</option>
              <option value="bn" className="bg-white">বাংলা (Bengali)</option>
              <option value="mr" className="bg-white">मराठी (Marathi)</option>
              <option value="gu" className="bg-white">ગુજરાதી (Gujarati)</option>
              <option value="ta" className="bg-white">தமிழ் (Tamil)</option>
            </select>
          </div>

          <button
            onClick={() => onOpenAuthModal('login')}
            className="hidden sm:flex items-center justify-center w-9 h-9 text-slate-700 hover:text-slate-900 hover:bg-white rounded-full transition-colors border border-green-100 cursor-pointer shrink-0"
            title="Login"
          >
            <LogIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSignUpChooser(true)}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Sign Up Free</span>
            <span className="sm:hidden">Sign Up</span>
          </button>

          {/* Mobile Menu Toggle — replaces the old row of separate pills (Service ERP / Trading / Help),
              which used to overflow the header on real phones and push Login/Sign Up off-screen. */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden flex items-center justify-center text-slate-700 bg-white border border-green-100 p-2 rounded-full shrink-0"
            title="Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Mobile/Tablet Menu Sheet — covers the same range (below lg:) that the
          desktop nav links (`hidden lg:flex` above) are hidden for, so there's
          no gap where Service ERP / Trading Hub / Help become unreachable. */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 bg-white/80 backdrop-blur-xs z-[60] flex flex-col justify-end" onClick={() => setShowMobileMenu(false)}>
          <div
            className="bg-white border-t border-green-100 rounded-t-3xl p-5 shadow-2xl text-slate-900 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-green-100">
              <span className="font-display font-extrabold text-base">Menu</span>
              <button onClick={() => setShowMobileMenu(false)} className="p-1.5 rounded-full bg-emerald-100 text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <button
                onClick={() => { setShowMobileMenu(false); onOpenServiceSectorModal?.(); }}
                className="w-full flex items-center gap-2.5 text-indigo-300 bg-indigo-600/10 border border-indigo-500/30 px-4 py-3 rounded-2xl font-bold text-left"
              >
                <Wrench className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="flex-1">Service ERP</span>
                <span className="bg-indigo-500/30 text-indigo-100 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">34 Sectors</span>
              </button>

              <button
                onClick={() => { setShowMobileMenu(false); onOpenSectorModal?.(); }}
                className="w-full flex items-center gap-2.5 text-emerald-600 bg-emerald-500/10 border border-emerald-300 px-4 py-3 rounded-2xl font-bold text-left"
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span className="flex-1">Trading Industry Hub</span>
                <span className="bg-emerald-500/20 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">23 Sectors</span>
              </button>

              <button
                onClick={() => { setShowMobileMenu(false); onOpenAuthModal('login'); }}
                className="w-full flex items-center gap-2.5 text-slate-700 bg-emerald-50 border border-green-200 px-4 py-3 rounded-2xl font-bold text-left"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Login to Your Account</span>
              </button>

              {onOpenHelp && (
                <button
                  onClick={() => { setShowMobileMenu(false); onOpenHelp(); }}
                  className="w-full flex items-center gap-2.5 text-slate-700 bg-emerald-50 border border-green-200 px-4 py-3 rounded-2xl font-bold text-left"
                >
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Help &amp; Guide</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a href="#features" onClick={() => setShowMobileMenu(false)} className="text-center text-xs font-semibold text-slate-600 bg-emerald-50/70 border border-green-100 px-2 py-2.5 rounded-xl">Features</a>
                <a href="#pricing" onClick={() => setShowMobileMenu(false)} className="text-center text-xs font-semibold text-slate-600 bg-emerald-50/70 border border-green-100 px-2 py-2.5 rounded-xl">Pricing</a>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 border border-green-200 px-4 py-3 rounded-2xl mt-1">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <select
                  value={lang}
                  onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                  className="bg-transparent text-slate-900 focus:outline-none text-sm font-semibold flex-1 cursor-pointer"
                >
                  <option value="en" className="bg-white">English</option>
                  <option value="hi" className="bg-white">हिन्दी (Hindi)</option>
                  <option value="bn" className="bg-white">বাংলা (Bengali)</option>
                  <option value="mr" className="bg-white">मराठी (Marathi)</option>
                  <option value="gu" className="bg-white">ગુજરાதી (Gujarati)</option>
                  <option value="ta" className="bg-white">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Chooser — the single "Sign Up" button used to jump straight
          into the Trading registration form, leaving Service ERP reachable
          only via the hamburger menu (3 extra taps). Now it opens this
          chooser instead, so both paths are one tap away and equally
          visible. */}
      {showSignUpChooser && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4"
          onClick={() => setShowSignUpChooser(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSignUpChooser(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-50 text-slate-500 hover:text-slate-900 hover:bg-emerald-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 text-center">
              What are you setting up?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mt-1.5 mb-6">
              Choose the ERP built for your kind of business — both are free to start.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => { setShowSignUpChooser(false); onOpenAuthModal('register'); }}
                className="group flex flex-col items-center text-center gap-2.5 p-5 rounded-2xl border-2 border-green-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <Store className="w-6 h-6" />
                </div>
                <div className="font-display font-bold text-sm text-slate-900">TradeMate</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Buying &amp; selling goods — Kirana, Steel, Textiles, Agri, Hardware &amp; 23 trading sectors
                </p>
                <span className="mt-1 text-[11px] font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1">
                  Sign Up <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                onClick={() => { setShowSignUpChooser(false); onOpenServiceSectorModal?.(); }}
                className="group flex flex-col items-center text-center gap-2.5 p-5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Wrench className="w-6 h-6" />
                </div>
                <div className="font-display font-bold text-sm text-slate-900">Service ERP</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Providing a service — Salon, Clinic, Repair, Education &amp; 34 service sectors
                </p>
                <span className="mt-1 text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                  Sign Up <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 pt-5 border-t border-green-100 text-xs font-semibold text-slate-600">
              <button
                onClick={() => { setShowSignUpChooser(false); onOpenAuthModal('login'); }}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Already have an account? Login
              </button>
              <span className="text-green-200">•</span>
              {onOpenHelp && (
                <button
                  onClick={() => { setShowSignUpChooser(false); onOpenHelp(); }}
                  className="hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  Help &amp; Guide
                </button>
              )}
              <span className="text-green-200">•</span>
              <a href="#features" onClick={() => setShowSignUpChooser(false)} className="hover:text-emerald-600 transition-colors">Features</a>
              <span className="text-green-200">•</span>
              <a href="#pricing" onClick={() => setShowSignUpChooser(false)} className="hover:text-emerald-600 transition-colors">Pricing</a>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="relative pt-10 pb-16 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Panel: Hero Main Headline & CTAs */}
          <div className="lg:col-span-5 text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-200 text-emerald-600 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {isLikelyOverseas
                ? '🌍 Built for South Asian Traders Worldwide — FMCG, Steel, Textiles & Hardware'
                : '🇮🇳 Built for Indian FMCG, Steel, Mandi, Textiles & Hardware Trade'}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              No POS? <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-500">No Problem.</span>
            </h1>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-700">
              Your Smartphone is Now a Full-Powered POS with Auto Inventory.
            </h2>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Create GST invoices, manage inventory automatically, collect payments, monitor profit, and run your complete trading business from any device — tailored for <strong className="text-slate-700 font-semibold">Kirana, Metals & Steel, Agri Mandi, Textiles, Chemicals, Jewellery, Hardware & General Trading</strong>.
            </p>

            {/* Trust line — real, substantiated product facts (sector counts shown
                elsewhere on this page, actual feature set) rather than invented
                social-proof numbers. Replaces what used to be three hero buttons
                (Try Demo / Sign Up / System Admin Login) — Sign Up already lives
                in the header, System Admin Login moved to the footer, and the
                live-demo CTA was dropped per direct request. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
              {[
                '23 Trading Sectors',
                '34 Service Sectors',
                'GST-Ready Invoicing',
                'AI Bill Scanning',
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {item}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              No card required • Free to start
            </p>
          </div>

          {/* Right Panel: Multi-Sector Trading Industry Support Showcase */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-5 shadow-2xl relative z-10 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-green-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/15 text-emerald-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-emerald-300">
                      Universal Trading Platform
                    </span>
                    <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">Built for Any Trading Industry</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select a sector below or open the full Multi-Sector Trading Hub to try a live interactive demo.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onOpenSectorModal}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-slate-900 font-extrabold text-xs rounded-full shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-green-200"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View All 23 Sectors →</span>
                  </button>
                  <button
                    onClick={() => onStartDemo('owner')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Launch Kirana</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2 pt-3">
                {[
                  { id: 'FOOTWEAR_GARMENTS', title: 'Footwear & Garments', units: 'Pair, UK Size, pcs, Box', color: 'text-rose-200 bg-rose-950/30 border-rose-800/40', demoStoreId: 'store-demo-footwear' },
                  { id: 'PHARMACY', title: 'Pharmacy & Medical', units: 'Strip, Tablet, Bottle, Box', color: 'text-emerald-200 bg-emerald-950/30 border-emerald-800/40', demoStoreId: 'store-demo-pharmacy' },
                  { id: 'ELECTRICAL_ELECTRONICS', title: 'Electricals & Electronics', units: 'Piece, Coil, Meter, Box', color: 'text-emerald-700 bg-emerald-100 border-emerald-200', demoStoreId: 'store-demo-electrical' },
                  { id: 'AUTO_PARTS', title: 'Auto Parts & Spares', units: 'Set, Piece, Pair, Box', color: 'text-orange-200 bg-orange-950/30 border-orange-800/40', demoStoreId: 'store-demo-auto' },
                  { id: 'METALS_STEEL', title: 'Iron & Steel / Metals', units: 'MT, Quintal, kg, Length', color: 'text-slate-700 bg-emerald-100/70 border-green-200', demoStoreId: 'store-demo-steel' },
                  { id: 'AGRICULTURE', title: 'Agri Commodities', units: 'Quintal, MT, Bag, kg', color: 'text-emerald-200 bg-emerald-950/30 border-emerald-800/40', demoStoreId: 'store-demo-agri' },
                  { id: 'KIRANA_FMCG', title: 'FMCG & Kirana', units: 'pkt, kg, pouch, bottle', color: 'text-cyan-200 bg-cyan-950/30 border-cyan-800/40', demoStoreId: 'store-demo-kirana' },
                  { id: 'TEXTILES', title: 'Textiles & Fabrics', units: 'Meter, Roll, Bale, pcs', color: 'text-teal-200 bg-teal-950/30 border-teal-800/40', demoStoreId: 'store-demo-textile' },
                  { id: 'JEWELLERY', title: 'Jewellery & Gems', units: 'Gram, Carat, Tola, pcs', color: 'text-yellow-200 bg-amber-100 border-amber-300', demoStoreId: 'store-demo-jewellery' },
                  { id: 'COSMETICS', title: 'Cosmetics & Beauty', units: 'Bottle, Tube, Box, Piece', color: 'text-purple-200 bg-purple-950/30 border-purple-800/40', demoStoreId: 'store-demo-cosmetics' },
                  { id: 'BUILDING_HARDWARE', title: 'Building & Hardware', units: 'Bag, Piece, Box, Meter', color: 'text-stone-200 bg-stone-900/50 border-stone-700', demoStoreId: 'store-demo-hardware' },
                  { id: 'STATIONERY', title: 'Stationery & Books', units: 'Ream, Box, Pack, pcs', color: 'text-indigo-200 bg-indigo-950/30 border-indigo-800/40', demoStoreId: 'store-demo-stationery' },
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
                    className={`p-2.5 rounded-xl border ${s.color} hover:border-emerald-400 cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.02]`}
                  >
                    <div>
                      <div className="font-bold text-xs truncate text-slate-900">{s.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Units: {s.units}</div>
                    </div>
                    <div className="text-[9px] font-bold text-emerald-600 mt-1.5 flex items-center gap-0.5">
                      <span>Demo Available</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Honest Product Preview — clearly labeled sample, not a claim of real live activity */}
        <div className="mt-12 max-w-5xl mx-auto bg-white border border-green-100 rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-xl relative z-10">
          <div className="flex items-center justify-between pb-4 border-b border-green-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-200 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-200 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-200 inline-block"></span>
              <span className="ml-2 font-mono text-slate-600 font-bold">Your Shop Name — Sample Dashboard</span>
            </div>
            <span className="bg-emerald-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold border border-green-200">
              Sample Preview · Not Live Data
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
            <div className="bg-white/90 p-3.5 rounded-xl border border-green-100">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Today's Sales</div>
              <div className="text-xl sm:text-2xl font-display font-black text-slate-900">₹14,850</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Cash ₹8,200 • UPI ₹6,650</div>
            </div>

            <div className="bg-white/90 p-3.5 rounded-xl border border-green-100">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Pending Udhaar</div>
              <div className="text-xl sm:text-2xl font-display font-black text-amber-600">₹8,450</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">12 Customers Khata</div>
            </div>

            <div className="bg-white/90 p-3.5 rounded-xl border border-green-100">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Pending Orders</div>
              <div className="text-xl sm:text-2xl font-display font-black text-emerald-600">5 Orders</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Home Delivery Active</div>
            </div>

            <div className="bg-white/90 p-3.5 rounded-xl border border-green-100">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Estimated Profit</div>
              <div className="text-xl sm:text-2xl font-display font-black text-emerald-400">₹2,310</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Today Net Margin</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center pt-1">
            Illustrative example — these numbers populate automatically from your real sales once you start billing.
          </p>
        </div>

        {/* What's Inside — real, current product facts, not usage claims */}
        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white border border-green-100 p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-display font-black text-emerald-600">23</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Trading Sector Templates</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Kirana to Jewellery</div>
          </div>
          <div className="bg-white border border-green-100 p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-display font-black text-indigo-400">34</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Service Business Sectors</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Salon to Legal Firms</div>
          </div>
          <div className="bg-white border border-green-100 p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400">6</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Regional Languages</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Hindi, Bengali & more</div>
          </div>
          <div className="bg-white border border-green-100 p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-display font-black text-amber-600">₹0</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Free to Start</div>
            <div className="text-[10px] text-slate-500 mt-0.5">No card required</div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section id="features" className="py-20 px-4 sm:px-8 bg-emerald-50/60 border-t border-green-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-600">Universal Trading Platform</h2>
            <h3 className="font-display text-2xl sm:text-4xl font-black text-slate-900">
              Everything Your Trading Business Needs to Scale & Maximize Profit
            </h3>
            <p className="text-sm sm:text-base text-slate-500">
              Designed specifically for wholesale distributors, retail counters & traders across India. TradeMate replaces messy paper ledgers with fast, multi-unit digital tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-green-100 hover:border-emerald-400 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">Express 30-Sec POS Billing</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fast barcode scanning via camera or USB scanner. Add items, apply instant discount, generate thermal printer receipts or share WhatsApp invoice.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-green-100 hover:border-amber-400 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">Smart WhatsApp Khata Ledger</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track customer Udhaar balances automatically. Send 1-tap WhatsApp reminder messages with UPI payment links for faster collection.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-green-100 hover:border-rose-500/50 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-600/15 text-rose-400 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">Live Stock & Low Stock Alerts</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stock automatically deducts on every sale. Receive automated alerts when items fall below minimum reorder levels so you never run out.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-green-100 hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">WhatsApp Delivery Orders</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive customer delivery orders directly on WhatsApp, convert them into POS sales with 1-click, and manage order dispatch status.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-2xl border border-green-100 hover:border-emerald-500/50 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/15 text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">Daily Net Profit Analytics</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Live calculation of sales revenue, cost of goods sold, daily shop expenses (rent, electricity, staff salary), and net profit margin.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-2xl border border-green-100 hover:border-purple-500/50 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600/15 text-purple-400 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">6 Regional Languages</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Switch entire app interface between English, Hindi (हिन्दी), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી), and Tamil (தமிழ்) with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — real step-by-step onboarding, matches the nav anchor */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 bg-emerald-50 border-t border-green-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-600">Getting Started</h2>
            <h3 className="font-display text-2xl sm:text-4xl font-black text-slate-900">
              From Sign-Up to Your First Bill in Minutes
            </h3>
            <p className="text-sm sm:text-base text-slate-500">
              No installation, no training required — TradeMate runs in your browser on any phone, tablet, or PC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                icon: ClipboardList,
                color: 'text-emerald-600 bg-emerald-600/10 border-emerald-300',
                title: 'Choose Your Business Type',
                desc: 'Pick from 23 trading sector templates or 34 service business sectors — units, categories & workflow are pre-configured for you.'
              },
              {
                step: '2',
                icon: Rocket,
                color: 'text-amber-600 bg-amber-100 border-amber-200',
                title: 'Set Up in Minutes',
                desc: 'Add your store name, products or services, staff accounts, and currency. Or launch a free demo pre-loaded with sample data first.'
              },
              {
                step: '3',
                icon: Smartphone,
                color: 'text-indigo-400 bg-indigo-600/15 border-indigo-500/30',
                title: 'Bill & Track Daily',
                desc: 'Take counter sales or appointments, track customer Udhaar/dues, and send WhatsApp invoices & reminders straight from your phone.'
              },
              {
                step: '4',
                icon: LineChart,
                color: 'text-emerald-400 bg-emerald-600/15 border-emerald-500/30',
                title: 'Grow With Insights',
                desc: 'Watch your AI business health score, daily profit, and low-stock alerts to make better decisions as your business grows.'
              }
            ].map((s) => (
              <div key={s.step} className="relative bg-white p-6 rounded-2xl border border-green-100 space-y-3">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="absolute top-5 right-5 text-3xl font-display font-black text-slate-800">{s.step}</span>
                <h4 className="font-display text-base font-bold text-slate-900">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo vs New Account Explanation Banner */}
      <section className="py-16 px-4 sm:px-8 bg-emerald-50/60 border-t border-green-100">
        <div className="max-w-5xl mx-auto bg-white border border-green-100 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">Two Modes for Ultimate Flexibility</h3>
              <p className="text-xs sm:text-sm text-slate-500">Choose how you want to experience TradeMate today</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-white/90 p-5 rounded-2xl border border-green-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-600 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Demo Store & System Admin
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-600 font-bold px-2 py-0.5 rounded-full">
                  Pre-loaded Data
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore a fully populated shop with 100+ grocery products, past sales history, pending Khata balances, and System Admin store switcher.
              </p>
              <button
                onClick={() => onStartDemo('owner')}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-full text-xs transition-colors cursor-pointer"
              >
                Launch Demo Mode Now →
              </button>
            </div>

            <div className="bg-white/90 p-5 rounded-2xl border border-green-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-600 flex items-center gap-1.5">
                  <Store className="w-4 h-4" /> New Shop Account (From Scratch)
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
                  Zero Demo Data
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Register your real shop name. Your account starts with a clean slate (0 sales, 0 products) so you build your own custom inventory and prices.
              </p>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
              >
                Register New Shop (Zero Data) →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section: Why TradeMate? */}
      <section className="py-20 px-4 sm:px-8 bg-emerald-50 border-t border-green-100">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="bg-emerald-500/15 text-emerald-600 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300 uppercase tracking-wider">
              Comparison
            </span>
            <h3 className="font-display text-2xl sm:text-4xl font-black text-slate-900">Why Choose TradeMate?</h3>
            <p className="text-sm text-slate-500">See how TradeMate Universal Industry ERP compares against typical POS software.</p>
          </div>

          <div className="bg-white border border-green-100 rounded-2xl overflow-x-auto shadow-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-white border-b border-green-100 text-slate-600">
                <tr>
                  <th className="p-4 font-bold">Feature</th>
                  <th className="p-4 font-bold text-emerald-600 bg-emerald-100 border-x border-green-100 text-center">TradeMate Industry ERP</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Typical POS Software</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-600">
                {[
                  { feature: 'Universal Industry ERP Workflows', tm: '✅ Tailored for 10+ Industries', pos: '❌ Generic Single-Template' },
                  { feature: 'Auto Multi-Unit Inventory (MT, Kg, Gram, Meter, Ream)', tm: '✅ Built-in & Sector Configurable', pos: '⚠️ Basic Pieces Only' },
                  { feature: 'AI Purchase Bill Camera Scanner', tm: '✅ Auto Extracts Supplier, HSN & Items', pos: '❌ Manual Entry' },
                  { feature: 'AI Business Health & AI Assistant', tm: '✅ Live Score & Voice Commands', pos: '❌ None' },
                  { feature: 'Automated WhatsApp Udhaar Reminders', tm: '✅ 1-Tap Reminders with UPI Link', pos: '❌ Paid Add-on or Manual' },
                  { feature: 'Multi-Language Interface (6 Languages)', tm: '✅ English, Hindi, Bengali, Marathi, etc.', pos: '⚠️ English Only' },
                  { feature: 'Cloud & Offline Mobile First', tm: '✅ Works on Phone, Tablet & PC', pos: '⚠️ Expensive Hardware Required' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/60">
                    <td className="p-4 font-semibold text-slate-900">{row.feature}</td>
                    <td className="p-4 font-bold text-center text-emerald-400 bg-emerald-50 border-x border-green-100">{row.tm}</td>
                    <td className="p-4 text-center text-slate-500">{row.pos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className="py-20 px-4 sm:px-8 bg-emerald-50/60 border-t border-green-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-600">Affordable Plans</h2>
            <h3 className="font-display text-2xl sm:text-4xl font-black text-slate-900">Simple, Honest Shop Pricing</h3>
            <p className="text-sm text-slate-500">Start free today. Upgrade as your shop grows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="bg-white border border-green-100 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="font-display text-lg font-bold text-slate-900">Starter Kirana</h4>
                <p className="text-xs text-slate-500 mt-1">For small single-counter shops</p>
                <div className="mt-4 text-3xl font-display font-black text-slate-900">₹0 <span className="text-xs font-normal text-slate-500">/ forever</span></div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Express POS Counter Billing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 500 Inventory Items</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Customer Udhaar Khata Ledger</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Thermal Receipt Printing</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="w-full py-2.5 bg-emerald-100 hover:bg-emerald-200 text-slate-900 font-bold rounded-full text-xs transition-colors cursor-pointer"
              >
                Start Free Plan
              </button>
            </div>

            {/* Plan 2 */}
            <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-emerald-500/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider">
                Most Popular
              </span>
              <div>
                <h4 className="font-display text-lg font-bold text-slate-900">Pro Supermarket</h4>
                <p className="text-xs text-slate-500 mt-1">For growing grocery outlets</p>
                <div className="mt-4 text-3xl font-display font-black text-slate-900">₹499 <span className="text-xs font-normal text-slate-500">/ month</span></div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Everything in Starter Plan</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited Inventory & Products</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Automated WhatsApp Reminders</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Staff Roles & Permissions</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> WhatsApp Home Delivery Orders</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-white border border-green-100 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="font-display text-lg font-bold text-slate-900">System Admin Enterprise</h4>
                <p className="text-xs text-slate-500 mt-1">For multi-branch & chain stores</p>
                <div className="mt-4 text-3xl font-display font-black text-slate-900">₹1,499 <span className="text-xs font-normal text-slate-500">/ month</span></div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> Multi-Store Management Console</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> System Administrator Controls</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> Consolidated Financial Reports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> Priority WhatsApp & Phone Support</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuthModal('admin')}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-300 font-bold rounded-full text-xs transition-colors cursor-pointer"
              >
                System Admin Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-8 bg-emerald-50 border-t border-green-100">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="font-display text-2xl font-bold text-slate-900">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500">Got questions? We have answers for shop owners.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Do I need an expensive computer or barcode scanner?",
                a: "No! TradeMate runs directly in any phone browser, tablet, or PC. You can scan barcodes or AI invoices using your smartphone camera or plug in any standard USB barcode scanner."
              },
              {
                q: "Does a new registered account come with zero demo data?",
                a: "Yes! When you click 'Create Free Store' and register your business name, your account starts with a fresh clean database so you build your own inventory and sector unit setup from scratch."
              },
              {
                q: "How does the WhatsApp Udhaar Khata reminder work?",
                a: "When a customer has pending credit balance, you can click 'Send WhatsApp Reminder'. TradeMate auto-formats a polite reminder message in your chosen regional language (English, Hindi, Bengali, Marathi, Gujarati, Tamil) with their balance and your shop UPI payment link."
              },
              {
                q: "Can my shop staff use this with limited permissions?",
                a: "Yes! You can create staff accounts. Staff can perform sales, scan items, and collect payments, but cannot view profit reports or edit critical store settings."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-green-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left text-xs sm:text-sm font-semibold text-slate-900 flex items-center justify-between hover:bg-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    {item.q}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-green-100 pt-2">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-8 bg-emerald-50 border-t border-green-100 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span className="font-display font-bold text-slate-900">TradeMate</span>
            <span>— Universal Business ERP, POS Billing & Khata System</span>
          </div>
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} TradeMate POS. Built for Wholesale & Retail Traders across India.</p>
            <button
              onClick={() => onOpenAuthModal('admin')}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Admin</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
