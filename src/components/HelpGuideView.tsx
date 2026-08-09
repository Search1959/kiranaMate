import React, { useState } from 'react';
import {
  ArrowLeft,
  Store,
  Wrench,
  ChevronDown,
  Sparkles,
  Globe,
  MessageCircle,
  Languages,
  Rocket,
  LayoutDashboard,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  Camera,
  TrendingDown,
  Users,
  LineChart,
  BookOpen,
  Settings,
  Database,
  Calendar,
  Wallet,
  FileText,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';

interface HelpGuideViewProps {
  onBack: () => void;
  onStartDemo: () => void;
  onSignUp: () => void;
}

interface GuideSection {
  id: string;
  icon: any;
  title: string;
  forWhom?: string;
  body: React.ReactNode;
}

export const HelpGuideView: React.FC<HelpGuideViewProps> = ({ onBack, onStartDemo, onSignUp }) => {
  const [activeErp, setActiveErp] = useState<'trading' | 'service'>('trading');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['getting-started']));

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const tradingSections: GuideSection[] = [
    {
      id: 'getting-started',
      icon: Rocket,
      title: 'Getting Started',
      body: (
        <>
          <p>From the home page, choose <strong className="text-white">"Try Instant Live Demo"</strong> to explore a pre-loaded shop with sample products and sales — no signup needed. When you're ready for your own store, choose <strong className="text-white">"Sign Up"</strong>, pick your business sector from 23 trading templates (Kirana, Steel & Metals, Textiles, Pharmacy, Jewellery, and more), and your store starts completely empty — zero demo data — so every number you see afterward is real.</p>
          <p className="mt-2">During signup you'll also pick your <strong className="text-white">business country</strong>. This sets your currency automatically (₹, $, £, AED, and more) — a shop in Mumbai and a store run by the diaspora in Dubai or Toronto both get the right currency from day one, no manual conversion needed.</p>
        </>
      )
    },
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard',
      body: (
        <>
          <p>Your home screen shows today's sales, pending customer dues, pending delivery orders, and today's estimated profit at a glance — plus a quick list of customers with overdue balances and any products running low on stock. Everything updates live as you bill, restock, or collect payments through the day.</p>
        </>
      )
    },
    {
      id: 'pos',
      icon: ShoppingCart,
      title: 'POS Billing',
      body: (
        <>
          <p>Tap <strong className="text-white">"POS Billing"</strong> from the header to open the counter. Search or scan a barcode to add items, adjust quantity or price if needed, apply a discount, and choose Cash, UPI, Bank, or Credit (Udhaar). A bill closes in under 30 seconds and can be printed on a thermal printer or shared instantly on WhatsApp.</p>
          <p className="mt-2">On a phone, the same button opens a dedicated <strong className="text-white">full-screen mobile POS</strong> — built specifically for one-handed billing at a counter, not a shrunk-down desktop popup.</p>
        </>
      )
    },
    {
      id: 'orders',
      icon: Package,
      title: 'Orders & Delivery',
      body: (
        <p>Customers can send delivery orders over WhatsApp; you convert them into a sale with one click and track dispatch status (New → Confirmed → Out for Delivery → Delivered) — each status change can notify the customer automatically.</p>
      )
    },
    {
      id: 'customers',
      icon: Users,
      title: 'Customers & Udhaar Khata',
      body: (
        <>
          <p><strong className="text-white">Udhaar Khata</strong> is a running credit ledger — very common in Indian retail, where regular customers buy on trust and settle up later (similar to a "tab" or "running account" in other markets). TradeMate tracks exactly who owes what, sends a 1-tap WhatsApp reminder with the balance and your UPI payment link, and records when they pay it down. If your business doesn't extend credit, you can simply ignore this feature — every sale can just as easily be Cash, UPI, or Bank instead.</p>
        </>
      )
    },
    {
      id: 'stock',
      icon: Package,
      title: 'Stock & Inventory',
      body: (
        <>
          <p>Every sale deducts stock automatically. Set a minimum reorder level per product and TradeMate flags it the moment stock runs low. For bulk setup, use <strong className="text-white">Bulk Import</strong> to upload a CSV of your whole catalog in one go instead of typing each item by hand.</p>
        </>
      )
    },
    {
      id: 'purchases',
      icon: Camera,
      title: 'Purchases & AI Bill Scanning',
      body: (
        <>
          <p>This is the feature that makes TradeMate an <strong className="text-white">auto-inventory system, not a data-entry job</strong>. Instead of typing in a new stock delivery line by line, scan the actual supplier bill — as a <strong className="text-white">photo, a PDF, or even an Excel/CSV stock list</strong> — and AI reads it, translates it if it's in Hindi, Bengali, Gujarati, Marathi, or another regional script, and fills in every item, quantity, and price for you. Review the extracted list, fix anything that looks off, and confirm — your stock and supplier records update in one step. If a photo doesn't have a bill to scan, sample bills are available to try the feature, and you can always fall back to a manual entry form for a short list.</p>
        </>
      )
    },
    {
      id: 'expenses',
      icon: TrendingDown,
      title: 'Expenses',
      body: <p>Log day-to-day running costs — rent, electricity, staff wages, transport, packaging — either by typing them in or scanning a receipt. These feed directly into your profit calculation, so your P&L reflects real costs, not just sales minus stock cost.</p>
    },
    {
      id: 'suppliers',
      icon: Truck,
      title: 'Suppliers',
      body: <p>Every supplier you've ever billed from — whether typed in manually or auto-created from a scanned bill — is tracked here with their contact details and purchase history.</p>
    },
    {
      id: 'finance',
      icon: LineChart,
      title: 'Finance, Reports & Stock Ledger',
      body: (
        <>
          <p><strong className="text-white">Finance & Profit</strong> gives you a real-time profit & loss breakdown. <strong className="text-white">Reports</strong> shows your best-selling items. <strong className="text-white">Stock Ledger</strong> is a full audit trail — opening stock, everything that came in, everything that went out, and closing stock value — for any date range, exportable as CSV or a printable ledger.</p>
        </>
      )
    },
    {
      id: 'languages',
      icon: Languages,
      title: 'Multi-Language & Multi-Currency',
      body: (
        <>
          <p>Switch the entire interface between English, Hindi, Bengali, Marathi, Gujarati, and Tamil from the header. Combined with automatic currency detection at signup, the same product works equally well for a shop in Ahmedabad and a store run by the diaspora abroad.</p>
        </>
      )
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Settings & Backup',
      body: (
        <p><strong className="text-white">Settings</strong> holds your store name, address, GSTIN, currency, and country — change any of it any time. <strong className="text-white">Backup & Restore</strong> lets you export your full store data as a file and restore it later, and (for demo stores only) reset back to fresh sample data.</p>
      )
    }
  ];

  const serviceSections: GuideSection[] = [
    {
      id: 'getting-started',
      icon: Rocket,
      title: 'Getting Started',
      body: (
        <>
          <p>Open <strong className="text-white">"Service ERP"</strong> from the home page and pick your industry from 34 service sector templates — clinics, salons, gyms, law firms, IT/software agencies, repair shops, event planners, and many more. Each template pre-configures the right terminology for your business (a clinic calls its customers "Patients", a repair shop calls them "Clients", a salon has "Stylists" instead of "Technicians") and the right workflow ("Appointment" vs "Job Card" vs "Case Matter").</p>
          <p className="mt-2">Like Trading ERP, a new account starts with zero demo data, and picks up your currency automatically from the country you select at signup.</p>
        </>
      )
    },
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard',
      body: <p>See today's appointments, active work orders, today's billing income, and outstanding dues at a glance, plus your staff/team's duty and performance roster.</p>
    },
    {
      id: 'pos',
      icon: ShoppingCart,
      title: 'Service POS Billing',
      body: <p>Bill a client for services rendered — add each service, assign the staff member who performed it, adjust labour/material charges, apply a discount, and generate a GST bill on the spot.</p>
    },
    {
      id: 'jobs',
      icon: ClipboardList,
      title: 'Job / Service Cards',
      body: <p>Track any piece of work from intake to completion — repair jobs, legal case matters, project tickets, whatever your sector calls them — with status (Pending → In-Progress → Completed → Delivered), priority, assigned staff, parts/materials used, and payment status all in one card.</p>
    },
    {
      id: 'appointments',
      icon: Calendar,
      title: 'Appointments Scheduling',
      body: <p>Book and track client appointments by date and time, see today's schedule at a glance, and mark them Scheduled, In-Progress, or Completed.</p>
    },
    {
      id: 'clients',
      icon: Users,
      title: 'Clients & Staff Roster',
      body: <p>Keep a client directory with contact details and service history. The Staff Roster tracks each team member's specialty, jobs completed, rating, and commission percentage.</p>
    },
    {
      id: 'packages',
      icon: ShieldCheck,
      title: 'Service Packages & AMC',
      body: <p>Sell recurring packages or Annual Maintenance Contracts (AMC) instead of one-off jobs — useful for gyms, clinics, IT support, and equipment servicing businesses that bill on a subscription or contract basis.</p>
    },
    {
      id: 'payments',
      icon: Wallet,
      title: 'Payments & Expenses',
      body: (
        <>
          <p><strong className="text-white">Service Payments</strong> records money coming in — advance deposits, partial payments, full settlements. <strong className="text-white">Service Expenses</strong> tracks money going out — staff salary, office rent, software subscriptions, marketing spend, travel — so your Analytics tab can show real net profit, not just revenue.</p>
        </>
      )
    },
    {
      id: 'invoices',
      icon: FileText,
      title: 'Invoices & Quotations',
      body: <p>Generate GST invoices and receipts for completed work, or send a client a Quotation/Estimate first and convert it into a real Job Card or Invoice with one click once they approve it.</p>
    },
    {
      id: 'analytics',
      icon: LineChart,
      title: 'Analytics',
      body: <p>Revenue, outstanding dues, total business expenses, net profit, average client rating, and a staff performance breakdown — all in one screen.</p>
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Settings',
      body: <p>Business profile, invoice details, WhatsApp notification preferences, and currency — all editable any time.</p>
    }
  ];

  const activeSections = activeErp === 'trading' ? tradingSections : serviceSections;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/25">
            <Store className="w-4 h-4" />
          </div>
          <span className="font-display font-extrabold text-white">Trade<span className="text-blue-400">Mate</span> Guide</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-10 pb-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
          <Globe className="w-3.5 h-3.5" />
          <span>For businesses in India and worldwide</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight">Help &amp; User Guide</h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Everything TradeMate (Trading ERP) and Service ERP can do, explained in plain language — whether you're running a Kirana shop in Indore or a business for the diaspora community in Dubai, London, or Toronto.
        </p>
      </section>

      {/* ERP Tab Switcher */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-6">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
          <button
            onClick={() => setActiveErp('trading')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeErp === 'trading' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>TradeMate (Trading ERP)</span>
          </button>
          <button
            onClick={() => setActiveErp('service')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeErp === 'service' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Service ERP</span>
          </button>
        </div>
      </div>

      {/* Guide Sections */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pb-16 space-y-2.5">
        {activeSections.map(section => {
          const isOpen = openSections.has(section.id);
          const Icon = section.icon;
          const accent = activeErp === 'trading' ? 'blue' : 'indigo';
          return (
            <div key={section.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    accent === 'blue' ? 'bg-blue-600/15 text-blue-400' : 'bg-indigo-600/15 text-indigo-400'
                  }`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-display font-bold text-sm sm:text-base text-white">{section.title}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pl-[3.75rem] text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {section.body}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* WhatsApp Note */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pb-16">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-400 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white">A note on WhatsApp</h3>
            <p className="text-xs text-slate-400 mt-1">
              Both TradeMate and Service ERP lean heavily on WhatsApp for billing, reminders, and delivery updates — the default communication channel across India, South Asia, the Gulf, and much of the diaspora abroad. If your customers primarily use SMS or email instead, every WhatsApp action has an SMS or copy-to-clipboard fallback right next to it.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pb-16">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="font-display text-xl font-bold text-white">Ready to try it yourself?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">No card required — explore a fully populated demo, or register your real business with a clean slate.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              onClick={onStartDemo}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full text-xs sm:text-sm cursor-pointer"
            >
              Try Instant Live Demo
            </button>
            <button
              onClick={onSignUp}
              className="px-6 py-3 bg-transparent hover:bg-slate-800 text-white font-bold rounded-full border border-slate-700 text-xs sm:text-sm cursor-pointer"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
