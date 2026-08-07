import React, { useState } from 'react';
import {
  X,
  Search,
  Wrench,
  Stethoscope,
  Scissors,
  Briefcase,
  GraduationCap,
  Smartphone,
  Zap,
  Server,
  Camera,
  Hotel,
  Building,
  Shirt,
  Shield,
  Sprout,
  Truck,
  Landmark,
  Building2,
  Sun,
  Gamepad2,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Activity,
  Smile,
  HeartPulse,
  Heart,
  Dog,
  Sparkles as SparklesIcon,
  Crown,
  Maximize2,
  Flame,
  Dumbbell,
  Scale,
  FileCheck,
  Calculator,
  Compass,
  Monitor,
  Cpu,
  Tv,
  Droplets,
  Car,
  Bike,
  ShieldAlert,
  Paintbrush,
  Video,
  Printer,
  CalendarDays,
  Key,
  Utensils,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { SERVICE_SECTORS, SERVICE_SECTOR_GROUPS, ServiceSectorConfig } from '../lib/serviceSectorConfig';
import { ServiceSector } from '../types';

interface ServiceSectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSector: (sectorId: ServiceSector) => void;
}

export const ServiceSectorModal: React.FC<ServiceSectorModalProps> = ({
  isOpen,
  onClose,
  onSelectSector
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Filter sectors by group and search query
  const filteredSectors = SERVICE_SECTORS.filter((sector) => {
    const matchesGroup = selectedGroup === 'All' || sector.group === selectedGroup;
    const matchesQuery =
      searchQuery.trim() === '' ||
      sector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sector.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sector.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sector.customerTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sector.staffTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sector.subIndustries.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesGroup && matchesQuery;
  });

  const getGroupIcon = (groupName: string) => {
    switch (groupName) {
      case 'Healthcare': return <Stethoscope className="w-4 h-4" />;
      case 'Beauty & Wellness': return <Scissors className="w-4 h-4" />;
      case 'Legal & Professional': return <Briefcase className="w-4 h-4" />;
      case 'Education & Training': return <GraduationCap className="w-4 h-4" />;
      case 'Repair & Maintenance': return <Smartphone className="w-4 h-4" />;
      case 'Automobile': return <Wrench className="w-4 h-4" />;
      case 'Home Services': return <Zap className="w-4 h-4" />;
      case 'IT & Technology': return <Server className="w-4 h-4" />;
      case 'Creative Services': return <Camera className="w-4 h-4" />;
      case 'Hospitality & Travel': return <Hotel className="w-4 h-4" />;
      case 'Property & Construction': return <Building className="w-4 h-4" />;
      case 'Laundry & Cleaning': return <Shirt className="w-4 h-4" />;
      case 'Security Services': return <Shield className="w-4 h-4" />;
      case 'Agriculture Services': return <Sprout className="w-4 h-4" />;
      case 'Logistics & Courier': return <Truck className="w-4 h-4" />;
      case 'Financial Services': return <Landmark className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const getSectorIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope className="w-5 h-5 text-emerald-400" />;
      case 'Activity': return <Activity className="w-5 h-5 text-blue-400" />;
      case 'Smile': return <Smile className="w-5 h-5 text-cyan-400" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'Heart': return <Heart className="w-5 h-5 text-pink-400" />;
      case 'Dog': return <Dog className="w-5 h-5 text-amber-400" />;
      case 'Scissors': return <Scissors className="w-5 h-5 text-purple-400" />;
      case 'Sparkles': return <SparklesIcon className="w-5 h-5 text-indigo-400" />;
      case 'Crown': return <Crown className="w-5 h-5 text-amber-300" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Dumbbell': return <Dumbbell className="w-5 h-5 text-emerald-400" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'Scale': return <Scale className="w-5 h-5 text-amber-400" />;
      case 'FileCheck': return <FileCheck className="w-5 h-5 text-teal-400" />;
      case 'Calculator': return <Calculator className="w-5 h-5 text-emerald-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-blue-400" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-cyan-400" />;
      case 'Monitor': return <Monitor className="w-5 h-5 text-blue-400" />;
      case 'Tv': return <Tv className="w-5 h-5 text-purple-400" />;
      case 'Droplets': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-amber-400" />;
      case 'Car': return <Car className="w-5 h-5 text-blue-400" />;
      case 'Bike': return <Bike className="w-5 h-5 text-rose-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-emerald-400" />;
      case 'Server': return <Server className="w-5 h-5 text-purple-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Camera': return <Camera className="w-5 h-5 text-rose-400" />;
      case 'Video': return <Video className="w-5 h-5 text-indigo-400" />;
      case 'Printer': return <Printer className="w-5 h-5 text-blue-400" />;
      case 'CalendarDays': return <CalendarDays className="w-5 h-5 text-amber-400" />;
      case 'Hotel': return <Hotel className="w-5 h-5 text-amber-400" />;
      case 'Building': return <Building className="w-5 h-5 text-slate-300" />;
      case 'Shirt': return <Shirt className="w-5 h-5 text-teal-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'Sprout': return <Sprout className="w-5 h-5 text-emerald-400" />;
      case 'Truck': return <Truck className="w-5 h-5 text-amber-400" />;
      case 'Landmark': return <Landmark className="w-5 h-5 text-indigo-400" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-slate-300" />;
      default: return <Wrench className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                  Universal Service ERP Directory
                </h2>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  50+ Service Sectors
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Select your service industry sector to open its specialized Service ERP login & management workspace.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Filter Bar */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 space-y-3.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor clinic, hospital, salon, car garage, lawyer, IT agency, tuition, AC repair, gym..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          {/* Group Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 py-1 text-xs max-h-36 overflow-y-auto scrollbar-thin">
            <button
              onClick={() => setSelectedGroup('All')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedGroup === 'All'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              All Industries ({SERVICE_SECTORS.length})
            </button>

            {SERVICE_SECTOR_GROUPS.map((grp) => {
              const isSelected = selectedGroup === grp.name;
              return (
                <button
                  key={grp.name}
                  onClick={() => setSelectedGroup(grp.name)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {getGroupIcon(grp.name)}
                  <span>{grp.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sectors Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/50">
          {filteredSectors.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Search className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-300">No service sectors found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for another keyword like "clinic", "garage", "salon", "lawyer", or "IT".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSectors.map((sector) => {
                return (
                  <div
                    key={sector.id}
                    onClick={() => onSelectSector(sector.id)}
                    className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Icon & Group Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-indigo-950/50 transition-all">
                          {getSectorIcon(sector.iconName)}
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {sector.group}
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <div>
                        <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                          {sector.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-normal leading-relaxed">
                          {sector.tagline}
                        </p>
                      </div>

                      {/* Dynamic Parameters Badge */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1 text-[10px] text-slate-300 font-medium">
                        <span className="px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
                          👤 {sector.customerTerm}s
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40">
                          👨‍🔧 {sector.staffTerm}s
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                          📋 {sector.workOrderTerm}s
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action CTA */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                      <span>Launch Service ERP Portal</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Universal Service ERP tailored with custom workflows, billing, staff rosters & appointments.</span>
          </div>
          <span className="font-bold text-slate-300">Showing {filteredSectors.length} of {SERVICE_SECTORS.length} Service Sectors</span>
        </div>
      </div>
    </div>
  );
};
