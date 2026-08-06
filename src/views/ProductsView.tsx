import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Scan,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Product, KiranaCategory } from '../types';

interface ProductsViewProps {
  products: Product[];
  onOpenAddProduct: (productToEdit?: Product) => void;
  onOpenAddStock: (product: Product) => void;
  onOpenBarcodeScanner: () => void;
  onOpenBulkImport: () => void;
}

const CATEGORIES: KiranaCategory[] = [
  'Atta & Flours',
  'Rice & Grains',
  'Dals & Pulses',
  'Edible Oils & Ghee',
  'Spices & Masalas',
  'Biscuits & Cookies',
  'Snacks & Namkeen',
  'Beverages & Tea/Coffee',
  'Dairy & Bakery',
  'Personal Care & Soap',
  'Cleaning & Household',
  'Chocolates & Sweets',
  'Pooja Essentials',
  'Other'
];

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onOpenAddProduct,
  onOpenAddStock,
  onOpenBarcodeScanner,
  onOpenBulkImport
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  const filteredProducts = products.filter(p => {
    const matchesSearch = !search.trim() || (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
    );
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStock =
      stockFilter === 'ALL' ? true :
      stockFilter === 'LOW' ? p.currentStock > 0 && p.currentStock <= p.minStock :
      p.currentStock === 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  return (
    <div className="space-y-4 pb-12 sm:pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" /> Kirana Stock & Product Inventory
          </h2>
          <p className="text-xs text-slate-500">
            Total {products.length} products listed in inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBulkImport}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" /> Bulk Import
          </button>
          <button
            onClick={() => onOpenAddProduct()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, brand or barcode..."
              className="w-full bg-white border border-slate-300 rounded-2xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex gap-1.5">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'LOW', label: 'Low Stock' },
              { id: 'OUT', label: 'Out of Stock' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStockFilter(f.id as any)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-colors ${
                  stockFilter === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Horizontal Scroll Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Categories ({products.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map(p => {
          const isLow = p.currentStock > 0 && p.currentStock <= p.minStock;
          const isOut = p.currentStock === 0;

          return (
            <div
              key={p.id}
              className={`bg-white p-4 rounded-3xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                isOut ? 'border-red-300 bg-red-50/20' : isLow ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {p.category} • {p.brand}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {p.name}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
                    isOut ? 'bg-red-100 text-red-800' : isLow ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {p.currentStock} {p.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Selling Price</span>
                    <span className="text-base font-black text-emerald-700">₹{p.sellingPrice}</span>
                    <span className="text-[10px] text-slate-400 line-through ml-1">MRP ₹{p.mrp}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Purchase Cost</span>
                    <span className="text-xs font-bold text-slate-700">₹{p.purchasePrice}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenAddProduct(p)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  onClick={() => onOpenAddStock(p)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> + Add Stock
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
