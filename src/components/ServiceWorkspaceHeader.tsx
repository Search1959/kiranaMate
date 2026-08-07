import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  Layers,
  Search
} from 'lucide-react';
import { serviceStore } from '../lib/serviceStore';
import { getServiceSectorConfig, SERVICE_SECTORS } from '../lib/serviceSectorConfig';
import { clientStore } from '../lib/clientStore';
import { ServiceSector } from '../types';

interface ServiceWorkspaceHeaderProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onSectorChange?: (sector: ServiceSector) => void;
}

export const ServiceWorkspaceHeader: React.FC<ServiceWorkspaceHeaderProps> = ({
  activeTab,
  onNavigateTab,
  onSectorChange
}) => {
  const [currentSector, setCurrentSector] = useState<ServiceSector>(serviceStore.getActiveSector());
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cfg = getServiceSectorConfig(currentSector);
  const storeSettings = clientStore.getSettings();
  const companyName = storeSettings?.storeName || cfg.name;

  const handleSelectSector = (s: ServiceSector) => {
    serviceStore.setActiveSector(s);
    setCurrentSector(s);
    setIsSectorDropdownOpen(false);
    if (onSectorChange) {
      onSectorChange(s);
    }
  };

  const filteredSectors = SERVICE_SECTORS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subIndustries.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white select-none sticky top-0 z-20 shadow-md">
      {/* Top Header Row: Active Sector Info & Workspace Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                Service ERP ({cfg.group})
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {cfg.customerTerm} / {cfg.staffTerm}
              </span>
            </div>
            <h2 className="text-base font-black text-white flex flex-wrap items-center gap-1.5">
              <span>{companyName}</span>
              {companyName !== cfg.name && (
                <span className="text-xs font-semibold text-slate-400">• {cfg.name}</span>
              )}
            </h2>
          </div>
        </div>

        {/* Sector Quick Switch Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[160px] sm:max-w-none">Change Industry ({SERVICE_SECTORS.length})</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSectorDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search doctor, garage, salon, lawyer, IT..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {filteredSectors.map(sec => {
                  const isSelected = sec.id === currentSector;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleSelectSector(sec.id)}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold truncate">{sec.name}</p>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {sec.group} • {sec.subIndustries.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {sec.workOrderTerm}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
