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
  Filter,
  Eye,
  Trash2,
  X,
  Barcode,
  AlertCircle
} from 'lucide-react';
import { Product, KiranaCategory } from '../types';
import { api } from '../lib/api';

interface ProductsViewProps {
  products: Product[];
  onOpenAddProduct: (productToEdit?: Product) => void;
  onOpenAddStock: (product: Product) => void;
  onOpenBarcodeScanner: () => void;
  onOpenBulkImport: () => void;
  onRefreshData?: () => void;
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
  onOpenBulkImport,
  onRefreshData
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<Product | null>(null);
  const [confirmZeroStockProduct, setConfirmZeroStockProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localDeletedIds, setLocalDeletedIds] = useState<string[]>([]);

  const handleDeleteProduct = (p: Product) => {
    setConfirmDeleteProduct(p);
  };

  const executeDeleteProduct = async () => {
    if (!confirmDeleteProduct) return;
    const p = confirmDeleteProduct;
    setDeletingId(p.id);
    setLocalDeletedIds(prev => [...prev, p.id]);
    setConfirmDeleteProduct(null);

    try {
      await api.deleteProduct(p.id);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setLocalDeletedIds(prev => prev.filter(id => id !== p.id));
      alert(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearStockToZero = (p: Product) => {
    setConfirmZeroStockProduct(p);
  };

  const executeZeroStock = async () => {
    if (!confirmZeroStockProduct) return;
    const p = confirmZeroStockProduct;
    setConfirmZeroStockProduct(null);

    try {
      await api.updateProduct(p.id, { currentStock: 0 });
      if (onRefreshData) onRefreshData();
      if (viewProduct && viewProduct.id === p.id) {
        setViewProduct({ ...viewProduct, currentStock: 0 });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reset stock');
    }
  };

  const filteredProducts = products
    .filter(p => !localDeletedIds.includes(p.id))
    .filter(p => {
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

                {/* Stock Intelligence Indicators */}
                <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    {p.currentStock > 30 ? (
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                        🚀 Fast Moving
                      </span>
                    ) : p.currentStock === 0 ? (
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-bold border border-rose-200">
                        ⚠️ Out of Stock
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                        📦 Normal Stock
                      </span>
                    )}
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold border border-blue-200">
                      {p.sellingPrice > 0 ? `${(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(0)}% Margin` : '0%'}
                    </span>
                  </div>

                  <span className="text-slate-500 font-bold">
                    Val: ₹{(p.currentStock * p.purchasePrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons: View, Edit, Add Stock, Delete */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                <button
                  onClick={() => setViewProduct(p)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  title="View Product Details"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" /> View
                </button>

                <button
                  onClick={() => onOpenAddProduct(p)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Edit Product"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-600" /> Edit
                </button>

                <button
                  onClick={() => onOpenAddStock(p)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  title="Add Stock"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> +Stock
                </button>

                <button
                  onClick={() => handleDeleteProduct(p)}
                  disabled={deletingId === p.id}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                  title="Delete Product"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Product Details Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  {viewProduct.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{viewProduct.name}</h3>
                <p className="text-xs text-slate-500">Brand: {viewProduct.brand || 'Generic'}</p>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Stock</span>
                  <span className="text-base font-black text-slate-900">{viewProduct.currentStock} {viewProduct.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Min Stock Alert</span>
                  <span className="text-base font-black text-amber-600">{viewProduct.minStock} {viewProduct.unit}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Selling Price</span>
                  <span className="text-sm font-black text-emerald-700">₹{viewProduct.sellingPrice}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Purchase Price</span>
                  <span className="text-sm font-black text-slate-700">₹{viewProduct.purchasePrice}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">MRP</span>
                  <span className="text-sm font-black text-slate-500 line-through">₹{viewProduct.mrp}</span>
                </div>
              </div>

              {viewProduct.barcode && (
                <div className="flex items-center gap-2 bg-slate-100 p-2.5 rounded-xl font-mono text-slate-700 font-bold">
                  <Barcode className="w-4 h-4 text-slate-500" />
                  <span>Barcode: {viewProduct.barcode}</span>
                </div>
              )}

              {viewProduct.gstPercent !== undefined && (
                <div className="text-[11px] font-semibold text-slate-600">
                  GST Rate: <strong className="text-slate-800">{viewProduct.gstPercent}%</strong>
                </div>
              )}

              <div className="text-[10px] text-slate-400 pt-1">
                Last updated: {viewProduct.updatedAt ? new Date(viewProduct.updatedAt).toLocaleString('en-IN') : 'N/A'}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 flex-wrap gap-2">
              <button
                onClick={() => handleClearStockToZero(viewProduct)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-xl text-xs"
              >
                Zero Out Stock
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prod = viewProduct;
                    setViewProduct(null);
                    handleDeleteProduct(prod);
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>

                <button
                  onClick={() => {
                    const prod = viewProduct;
                    setViewProduct(null);
                    onOpenAddProduct(prod);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE PRODUCT MODAL */}
      {confirmDeleteProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Product?</h3>
                <p className="text-xs text-slate-500">{confirmDeleteProduct.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              Are you sure you want to delete product <strong>"{confirmDeleteProduct.name}"</strong>? This action cannot be undone and will remove the product from your store inventory.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmDeleteProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteProduct}
                disabled={deletingId === confirmDeleteProduct.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {deletingId === confirmDeleteProduct.id ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM ZERO STOCK MODAL */}
      {confirmZeroStockProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Zero Out Stock?</h3>
                <p className="text-xs text-slate-500">{confirmZeroStockProduct.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              Reset stock quantity of <strong>"{confirmZeroStockProduct.name}"</strong> to 0?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmZeroStockProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeZeroStock}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Zero Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
