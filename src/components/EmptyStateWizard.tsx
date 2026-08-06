import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  UserPlus,
  ShoppingCart,
  Store,
  CheckCircle2,
  PackageCheck,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';

interface EmptyStateWizardProps {
  storeName: string;
  onNavigateTab: (tab: string) => void;
  onRefreshData: () => void;
}

export const EmptyStateWizard: React.FC<EmptyStateWizardProps> = ({
  storeName,
  onNavigateTab,
  onRefreshData
}) => {
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [starterAdded, setStarterAdded] = useState(false);

  const handleAddStarterPack = async () => {
    try {
      setLoadingSeed(true);
      const starterItems = [
        { name: 'Basmati Rice 1kg', category: 'Rice & Grains', brand: 'India Gate', unit: 'kg', purchasePrice: 90, sellingPrice: 110, mrp: 120, currentStock: 25, minStock: 5 },
        { name: 'Chakki Fresh Atta 5kg', category: 'Atta & Flours', brand: 'Aashirvaad', unit: 'pkt', purchasePrice: 210, sellingPrice: 245, mrp: 260, currentStock: 15, minStock: 3 },
        { name: 'Amul Taaza Milk 500ml', category: 'Dairy & Bakery', brand: 'Amul', unit: 'pouch', purchasePrice: 24, sellingPrice: 27, mrp: 27, currentStock: 30, minStock: 5 },
        { name: 'Mustard Oil 1 Litre', category: 'Edible Oils & Ghee', brand: 'Fortune', unit: 'bottle', purchasePrice: 135, sellingPrice: 155, mrp: 170, currentStock: 20, minStock: 4 },
        { name: 'Tata Salt 1kg', category: 'Spices & Masalas', brand: 'Tata', unit: 'pkt', purchasePrice: 22, sellingPrice: 28, mrp: 28, currentStock: 40, minStock: 10 },
        { name: 'Refined Sugar 1kg', category: 'Rice & Grains', brand: 'Loose', unit: 'kg', purchasePrice: 38, sellingPrice: 44, mrp: 48, currentStock: 50, minStock: 10 },
        { name: 'Toor Dal Premium 1kg', category: 'Dals & Pulses', brand: 'Tata Sampann', unit: 'pkt', purchasePrice: 125, sellingPrice: 145, mrp: 160, currentStock: 20, minStock: 5 },
        { name: 'Good Day Butter Biscuits 100g', category: 'Biscuits & Cookies', brand: 'Britannia', unit: 'pkt', purchasePrice: 16, sellingPrice: 20, mrp: 20, currentStock: 30, minStock: 5 }
      ];

      await api.bulkImportProducts(starterItems);
      setStarterAdded(true);
      onRefreshData();
    } catch (err) {
      console.error('Failed to add starter pack:', err);
    } finally {
      setLoadingSeed(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-xl mb-6 text-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-600/30">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <span>Welcome to {storeName}!</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-extrabold px-2 py-0.5 rounded-full border border-blue-500/30 uppercase">
                Clean Slate Account
              </span>
            </h3>
            <p className="text-xs text-slate-300">Your store has zero demo data. Follow these 3 quick steps to set up your shop!</p>
          </div>
        </div>

        {!starterAdded && (
          <button
            onClick={handleAddStarterPack}
            disabled={loadingSeed}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <PackageCheck className="w-4 h-4" />
            <span>{loadingSeed ? 'Adding Products...' : 'Load 8 Starter Grocery Items'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <button
          onClick={() => onNavigateTab('products')}
          className="p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all cursor-pointer group flex items-start justify-between"
        >
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-400">Step 1</div>
            <div className="font-bold text-xs text-white group-hover:text-blue-300 flex items-center gap-1 mt-0.5">
              <span>Add Your First Product</span>
              <Plus className="w-3.5 h-3.5" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Barcode, price, stock & unit</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => onNavigateTab('customers')}
          className="p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all cursor-pointer group flex items-start justify-between"
        >
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400">Step 2</div>
            <div className="font-bold text-xs text-white group-hover:text-amber-300 flex items-center gap-1 mt-0.5">
              <span>Add Customer Udhaar Khata</span>
              <UserPlus className="w-3.5 h-3.5" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Name, mobile & credit limit</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => onNavigateTab('pos')}
          className="p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer group flex items-start justify-between"
        >
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400">Step 3</div>
            <div className="font-bold text-xs text-white group-hover:text-emerald-300 flex items-center gap-1 mt-0.5">
              <span>Make Express POS Sale</span>
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">30s barcode billing & receipt</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
