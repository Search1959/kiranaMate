import React, { useState } from 'react';
import { Megaphone, Star, Gift, Search, Share2, Users } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import {
  DEFAULT_FEEDBACK_REQUEST_TEMPLATE,
  DEFAULT_WINBACK_OFFER_TEMPLATE,
  fillMessageTemplate,
  getWhatsAppWebLink
} from '../../lib/whatsapp';

type OutreachTab = 'FEEDBACK' | 'WINBACK';
type VisitFilter = 'ALL' | 'RECENT_7' | 'INACTIVE_30' | 'INACTIVE_60' | 'NEVER';

export const ServiceOutreachView: React.FC = () => {
  const cfg = getServiceSectorConfig(serviceStore.getActiveSector());
  const company = serviceStore.getCompanyMeta();
  const businessName = company.businessName || cfg.name;

  const customers = serviceStore.getCustomers();
  const invoices = serviceStore.getInvoices().filter(inv => inv.status !== 'CANCELLED');

  const [activeTab, setActiveTab] = useState<OutreachTab>('FEEDBACK');
  const [feedbackTemplate, setFeedbackTemplate] = useState(DEFAULT_FEEDBACK_REQUEST_TEMPLATE);
  const [winbackTemplate, setWinbackTemplate] = useState(DEFAULT_WINBACK_OFFER_TEMPLATE);
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [search, setSearch] = useState('');
  const [visitFilter, setVisitFilter] = useState<VisitFilter>('ALL');

  // Last real visit per client — matched by mobile, since walk-in invoices
  // aren't always linked to a saved ServiceCustomer record, but mobile is
  // the stable identifier either way (and the one we're messaging anyway).
  const lastVisitByMobile = new Map<string, string>();
  invoices.forEach(inv => {
    const existing = lastVisitByMobile.get(inv.mobile);
    if (!existing || inv.date > existing) lastVisitByMobile.set(inv.mobile, inv.date);
  });

  const today = new Date();
  const daysSince = (dateStr?: string) => {
    if (!dateStr) return null;
    const diffMs = today.getTime() - new Date(dateStr).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const rows = customers.map(c => {
    const lastVisit = lastVisitByMobile.get(c.mobile);
    return { customer: c, lastVisit, days: daysSince(lastVisit) };
  });

  const filtered = rows.filter(({ customer, days }) => {
    const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase()) || customer.mobile.includes(search);
    if (!matchesSearch) return false;
    switch (visitFilter) {
      case 'RECENT_7': return days !== null && days <= 7;
      case 'INACTIVE_30': return days !== null && days >= 30;
      case 'INACTIVE_60': return days !== null && days >= 60;
      case 'NEVER': return days === null;
      default: return true;
    }
  });

  const activeTemplate = activeTab === 'FEEDBACK' ? feedbackTemplate : winbackTemplate;

  const handleSend = (customerName: string, mobile: string) => {
    const text = fillMessageTemplate(activeTemplate, {
      clientName: customerName,
      businessName,
      discount: String(discountPercent)
    });
    window.open(getWhatsAppWebLink(mobile, text), '_blank');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-emerald-400" />
          <span>Client Outreach & Offers</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Send feedback requests and win-back offers to {cfg.customerTerm.toLowerCase()}s via WhatsApp — each message opens for you to review and send, one at a time (WhatsApp doesn't allow true automated bulk sending without its paid Business API).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('FEEDBACK')}
          className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeTab === 'FEEDBACK' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Request Feedback</span>
        </button>
        <button
          onClick={() => setActiveTab('WINBACK')}
          className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeTab === 'WINBACK' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Win-Back Offer</span>
        </button>
      </div>

      {/* Message Template Editor */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {activeTab === 'FEEDBACK' ? 'Feedback Request Message' : 'Win-Back Offer Message'}
          </p>
          <p className="text-[10px] text-slate-500">Placeholders: {'{clientName}'} {activeTab === 'WINBACK' && '{discount}'}</p>
        </div>
        <textarea
          rows={3}
          value={activeTab === 'FEEDBACK' ? feedbackTemplate : winbackTemplate}
          onChange={e => (activeTab === 'FEEDBACK' ? setFeedbackTemplate(e.target.value) : setWinbackTemplate(e.target.value))}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
        />
        {activeTab === 'WINBACK' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold">Discount %:</label>
            <input
              type="number"
              min={1}
              max={90}
              value={discountPercent}
              onChange={e => setDiscountPercent(Number(e.target.value))}
              className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
        <select
          value={visitFilter}
          onChange={e => setVisitFilter(e.target.value as VisitFilter)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
        >
          <option value="ALL">All Clients</option>
          <option value="RECENT_7">Visited in last 7 days</option>
          <option value="INACTIVE_30">Inactive 30+ days</option>
          <option value="INACTIVE_60">Inactive 60+ days</option>
          <option value="NEVER">Never billed yet</option>
        </select>
      </div>

      {/* Client List */}
      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-10 bg-slate-900 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs flex flex-col items-center gap-2">
            <Users className="w-6 h-6" />
            <p>No {cfg.customerTerm.toLowerCase()}s match this search/filter.</p>
          </div>
        )}
        {filtered.map(({ customer, lastVisit, days }) => (
          <div key={customer.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {customer.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{customer.name}</p>
                <p className="text-[10px] text-slate-400">{customer.mobile}</p>
              </div>
            </div>

            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-[10px] text-slate-400">
                {lastVisit ? `Last visit: ${days} day${days === 1 ? '' : 's'} ago` : 'Never billed yet'}
              </p>
              <p className="text-[10px] font-bold text-emerald-400">Total Spent: ₹{customer.totalSpent}</p>
            </div>

            <button
              onClick={() => handleSend(customer.name, customer.mobile)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send via WhatsApp</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
