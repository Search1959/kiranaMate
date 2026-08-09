import React, { useState } from 'react';
import { Settings, Store, Save, RefreshCw, CheckCircle2, Layers, Sparkles } from 'lucide-react';
import { StoreSettings, TradingSector } from '../types';
import { api } from '../lib/api';
import { TRADING_SECTORS } from '../lib/sectorConfig';
import { serviceStore } from '../lib/serviceStore';
import { getServiceSectorConfig } from '../lib/serviceSectorConfig';
import { CURRENCIES, getCurrencyByCode, getCurrencyBySymbol, COUNTRIES, getCurrencyByCountry } from '../lib/currency';
import { getSectorConfig } from '../lib/sectorConfig';

interface SettingsViewProps {
  settings: StoreSettings;
  onRefreshData: () => void;
  isServiceMode?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onRefreshData,
  isServiceMode
}) => {
  const activeServiceSector = serviceStore.getActiveSector();
  const serviceCfg = getServiceSectorConfig(activeServiceSector);
  
  const isServiceWorkspace =
    isServiceMode ||
    localStorage.getItem('trademate_active_workspace') === 'service' ||
    Boolean(activeServiceSector);

  const [storeName, setStoreName] = useState(settings.storeName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [gstin, setGstin] = useState(settings.gstin || '');
  const [tagline, setTagline] = useState(settings.tagline);
  const [sector, setSector] = useState<TradingSector>(settings.sector || 'KIRANA_FMCG');
  const [currencyCode, setCurrencyCode] = useState<string>(
    settings.currencyCode || getCurrencyBySymbol(settings.currencySymbol).code
  );
  const [country, setCountry] = useState<string>(settings.country || 'IN');
  const sectorLabel = getSectorConfig(settings.sector || 'KIRANA_FMCG').shortLabel;
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const currency = getCurrencyByCode(currencyCode);
      await api.updateSettings({
        storeName,
        ownerName,
        phone,
        address,
        city,
        gstin,
        tagline,
        sector,
        country,
        currencyCode: currency.code,
        currencySymbol: currency.symbol
      });
      onRefreshData();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    if (confirm("Are you sure you want to reset demo data back to initial seed state? Any new sales/customers created will be refreshed.")) {
      try {
        await api.resetDemoData();
        onRefreshData();
        alert("Database successfully reset!");
      } catch (err: any) {
        alert(err.message || "Failed to reset");
      }
    }
  };

  return (
    <div className="space-y-4 pb-12 sm:pb-6">
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {isServiceWorkspace ? (
            <>
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Service Business Profile & Invoice Settings</span>
            </>
          ) : (
            <>
              <Settings className="w-5 h-5 text-emerald-600" />
              <span>Store Profile & Bill Settings</span>
            </>
          )}
        </h2>
        <p className="text-xs text-slate-500">
          {isServiceWorkspace
            ? 'Configure Service Business details printed on WhatsApp invoices, work orders, estimates, and receipts'
            : `Configure ${sectorLabel} store details printed on WhatsApp bills and receipts`}
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {isServiceWorkspace
              ? 'Service business details updated successfully!'
              : 'Store details updated successfully!'}
          </div>
        )}

        {/* Primary Sector Selection or Active Service Sector Display */}
        {isServiceWorkspace ? (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2.5 text-white">
            <label className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Active Service Industry Sector</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Configured service industry sector template and workflow terms for your business.
            </p>

            <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white shadow-inner font-bold flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-blue-400 font-extrabold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  {serviceCfg.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30 shrink-0">
                  {serviceCfg.group}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{serviceCfg.tagline}</p>
              <div className="text-[11px] text-slate-400 font-medium flex flex-wrap gap-x-4 gap-y-1 mt-1 pt-1.5 border-t border-slate-800/80">
                <span>Customer Term: <strong className="text-slate-200">{serviceCfg.customerTerm}</strong></span>
                <span>Staff Term: <strong className="text-slate-200">{serviceCfg.staffTerm}</strong></span>
                <span>Work Order: <strong className="text-slate-200">{serviceCfg.workOrderTerm}</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Primary Trading Sector & Industry Type</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Sets default measurement units, product categories, and AI bill extraction hints for your business.
            </p>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as TradingSector)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {TRADING_SECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.tagline})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isServiceWorkspace ? 'Service Business Name *' : 'Business / Store Name *'}
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isServiceWorkspace ? 'Owner / Manager Name *' : 'Owner Name *'}
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">WhatsApp / Phone Number *</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">GSTIN Number (Optional)</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              placeholder="e.g. 27AAAAA0000A1Z5"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Business Country</label>
          <select
            value={country}
            onChange={(e) => {
              const newCountry = e.target.value;
              setCountry(newCountry);
              setCurrencyCode(getCurrencyByCountry(newCountry).code);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">
            Changing this also updates your currency below to match.
          </p>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Currency</label>
          <select
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} — {c.name} ({c.code})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">
            Auto-detected from your browser when this store was created. All bills, reports and WhatsApp messages use this currency — change it here if it guessed wrong.
          </p>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            {isServiceWorkspace ? 'Business Tagline / Subheading' : 'Shop Tagline'}
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            {isServiceWorkspace ? 'Business Address & City' : 'Store Address & City'}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className={`text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 cursor-pointer ${
            isServiceWorkspace
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-emerald-700 hover:bg-emerald-800'
          }`}
        >
          <Save className="w-4 h-4" />{' '}
          {isSaving
            ? 'Saving...'
            : isServiceWorkspace
            ? 'SAVE SERVICE BUSINESS CONFIGURATION'
            : 'SAVE STORE CONFIGURATION'}
        </button>
      </form>

      {/* Reset Seed Data */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-2 text-xs">
        <h3 className="font-bold text-slate-800">Database Demo Reset</h3>
        <p className="text-slate-500">Reset sample database back to initial seed state (50 customers, 100+ items, sample sales).</p>
        <button
          onClick={handleResetData}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Seed Data
        </button>
      </div>
    </div>
  );
};
