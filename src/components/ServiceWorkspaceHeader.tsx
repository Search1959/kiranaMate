import React from 'react';
import {
  Sparkles
} from 'lucide-react';
import { serviceStore } from '../lib/serviceStore';
import { getServiceSectorConfig } from '../lib/serviceSectorConfig';
import { ServiceSector } from '../types';

interface ServiceWorkspaceHeaderProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  /** @deprecated Sector is now fixed at signup/demo-launch; the in-dashboard switcher was removed. */
  onSectorChange?: (sector: ServiceSector) => void;
}

export const ServiceWorkspaceHeader: React.FC<ServiceWorkspaceHeaderProps> = () => {
  const currentSector = serviceStore.getActiveSector();
  const cfg = getServiceSectorConfig(currentSector);
  const companyMeta = serviceStore.getCompanyMeta();
  const companyName = companyMeta.businessName || cfg.name;

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
      </div>
    </div>
  );
};
