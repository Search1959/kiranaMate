import React, { useState } from 'react';
import { Settings, Building, Check, Phone, Shield } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { ServiceSector } from '../../types';

export const ServiceSettingsView: React.FC = () => {
  const [activeSector] = useState<ServiceSector>(serviceStore.getActiveSector());
  const cfg = getServiceSectorConfig(activeSector);
  const companyMeta = serviceStore.getCompanyMeta();

  const [businessName, setBusinessName] = useState<string>(companyMeta.businessName || cfg.name);
  const [ownerName, setOwnerName] = useState<string>(companyMeta.ownerName || '');
  const [tagline, setTagline] = useState<string>(cfg.tagline);
  const [gstin, setGstin] = useState<string>('27AAAAA0000A1Z5');
  const [whatsappAutoSend, setWhatsappAutoSend] = useState<boolean>(true);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    serviceStore.updateCompanyProfile({ businessName, ownerName });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            <span>Service ERP Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Industry: <span className="text-blue-400 font-bold">{cfg.name}</span> · WhatsApp notifications & business profile
          </p>
        </div>
      </div>

      {/* Business Info Form */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-white">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
          <span>Service Business Profile & Invoice Customization</span>
        </h3>

        {savedMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Business profile updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Service Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Owner / Manager Name</label>
            <input
              type="text"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Tagline / Subheading</label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">GSTIN Registration #</label>
            <input
              type="text"
              value={gstin}
              onChange={e => setGstin(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="wa"
              checked={whatsappAutoSend}
              onChange={e => setWhatsappAutoSend(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="wa" className="text-xs text-slate-300 font-bold cursor-pointer">
              Enable WhatsApp Automatic Confirmation & Reminders
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          Save Service Settings
        </button>
      </form>
    </div>
  );
};
