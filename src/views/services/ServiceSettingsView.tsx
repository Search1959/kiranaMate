import React, { useState } from 'react';
import { Settings, Sparkles, Building, Check, Phone, Shield } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig, SERVICE_SECTORS } from '../../lib/serviceSectorConfig';
import { ServiceSector } from '../../types';

export const ServiceSettingsView: React.FC = () => {
  const [activeSector, setActiveSector] = useState<ServiceSector>(serviceStore.getActiveSector());
  const cfg = getServiceSectorConfig(activeSector);

  const [businessName, setBusinessName] = useState<string>(cfg.name);
  const [tagline, setTagline] = useState<string>(cfg.tagline);
  const [gstin, setGstin] = useState<string>('27AAAAA0000A1Z5');
  const [whatsappAutoSend, setWhatsappAutoSend] = useState<boolean>(true);

  const handleSectorChange = (s: ServiceSector) => {
    serviceStore.setActiveSector(s);
    setActiveSector(s);
    const newCfg = getServiceSectorConfig(s);
    setBusinessName(newCfg.name);
    setTagline(newCfg.tagline);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Service ERP settings updated successfully!");
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            <span>Service ERP Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Switch industry sector templates, WhatsApp notifications & business profile</p>
        </div>
      </div>

      {/* 22 Service Industry Templates Selection Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Select Service Industry Template (22 Sectors)</span>
          </h3>
          <span className="text-xs font-bold text-blue-400">Current: {cfg.name}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {SERVICE_SECTORS.map(sec => {
            const isSelected = sec.id === activeSector;
            return (
              <button
                key={sec.id}
                onClick={() => handleSectorChange(sec.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-600/20 text-white'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{sec.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-400 truncate">{sec.customerTerm} • {sec.staffTerm}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Info Form */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-white">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
          <span>Service Business Profile & Invoice Customization</span>
        </h3>

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
