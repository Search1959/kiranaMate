import React from 'react';
import {
  X,
  Boxes,
  ShoppingBag,
  Wheat,
  Scissors,
  FlaskConical,
  Zap,
  Gem,
  FileText,
  Hammer,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Building2
} from 'lucide-react';
import { TRADING_SECTORS, SectorDefinition, getSectorConfig } from '../lib/sectorConfig';
import { TradingSector } from '../types';

interface SectorDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSector?: TradingSector;
  onSelectSectorDemo: (sectorId: TradingSector, demoStoreId: string) => void;
}

export const SectorDemoModal: React.FC<SectorDemoModalProps> = ({
  isOpen,
  onClose,
  currentSector = 'KIRANA_FMCG',
  onSelectSectorDemo
}) => {
  if (!isOpen) return null;

  const activeSector = getSectorConfig(currentSector);

  const getSectorIcon = (iconName: string) => {
    switch (iconName) {
      case 'Boxes': return <Boxes className="w-5 h-5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
      case 'Wheat': return <Wheat className="w-5 h-5" />;
      case 'Scissors': return <Scissors className="w-5 h-5" />;
      case 'FlaskConical': return <FlaskConical className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Gem': return <Gem className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Hammer': return <Hammer className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400';
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400';
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400';
      case 'teal': return 'bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-400';
      case 'orange': return 'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-400';
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400';
      case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400';
      case 'stone': return 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-inner">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">Multi-Sector Trading Hub</h2>
                <span className="bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Universal Trading App
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Test and experience real interactive demo environments tailored for any trading industry.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Active Sector Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-600 text-white shrink-0">
                {getSectorIcon(activeSector.iconName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Currently Active:</span>
                  <span className="text-sm font-bold text-slate-900">{activeSector.name}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{activeSector.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-100/60 px-3 py-1.5 rounded-lg border border-blue-200 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Units: {activeSector.primaryUnits.slice(0, 4).join(', ')}</span>
            </div>
          </div>

          {/* Grid of All Trading Sectors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Select a Sector Demo to Test Live Functionality:</span>
              </h3>
              <span className="text-xs text-slate-500">{TRADING_SECTORS.length} Sectors Available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {TRADING_SECTORS.map((sector) => {
                const isActive = sector.id === currentSector;
                return (
                  <div
                    key={sector.id}
                    className={`relative rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/20'
                        : getBadgeStyle(sector.color)
                    }`}
                    onClick={() => {
                      onSelectSectorDemo(sector.id, sector.demoStoreId);
                      onClose();
                    }}
                  >
                    {isActive && (
                      <div className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    <div>
                      {/* Icon & Title */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-white shadow-xs text-slate-800'
                        }`}>
                          {getSectorIcon(sector.iconName)}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {sector.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                            {sector.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                        {sector.description}
                      </p>

                      {/* Unit Chips */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {sector.primaryUnits.slice(0, 4).map((u) => (
                          <span
                            key={u}
                            className="bg-white/80 border border-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                          >
                            {u}
                          </span>
                        ))}
                        {sector.primaryUnits.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-medium py-0.5">
                            +{sector.primaryUnits.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">
                        Default GST: <strong className="text-slate-800">{sector.defaultGstPercent}%</strong>
                      </span>

                      <button
                        type="button"
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSectorDemo(sector.id, sector.demoStoreId);
                          onClose();
                        }}
                      >
                        <span>{isActive ? 'Active Demo' : 'Launch Demo'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <p>
            💡 Switching sectors immediately loads tailored sample stock, units, suppliers, sales & settings.
          </p>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
