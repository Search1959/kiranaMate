import React, { useState, useEffect } from 'react';
import { X, Package, Scan } from 'lucide-react';
import { Product, Supplier, TradingSector, StoreSettings } from '../types';
import { api } from '../lib/api';
import { getSectorConfig } from '../lib/sectorConfig';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  suppliers: Supplier[];
  settings: StoreSettings;
  onOpenBarcodeScanner: () => void;
  scannedBarcode?: string;
  onProductSaved: () => void;
  activeSector?: TradingSector;
}

const CATEGORIES: string[] = [
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

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  suppliers,
  settings,
  onOpenBarcodeScanner,
  scannedBarcode,
  onProductSaved,
  activeSector = 'KIRANA_FMCG'
}) => {
  const sectorCfg = getSectorConfig(activeSector);
  const availableCategories = sectorCfg.categories || CATEGORIES;
  const availableUnits = Array.from(new Set([...sectorCfg.primaryUnits, 'pkt', 'kg', 'g', 'pouch', 'bottle', 'tin', 'box', 'pcs', 'jar', 'MT', 'Quintal', 'Meter', 'Length', 'Ream', 'Drum', 'Cylinder', 'Bag', 'Roll', 'Bale']));

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<string>(availableCategories[0] || 'General');
  const [unit, setUnit] = useState(availableUnits[0] || 'pcs');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [mrp, setMrp] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [currentStock, setCurrentStock] = useState<number | ''>(10);
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [gstPercent, setGstPercent] = useState<number>(0);
  const [supplierId, setSupplierId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sector-Specific Form State
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [scheduleCategory, setScheduleCategory] = useState('');
  const [grade, setGrade] = useState('');
  const [thickness, setThickness] = useState('');
  const [imei, setImei] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState<number | ''>('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [oemNumber, setOemNumber] = useState('');
  const [purity, setPurity] = useState('');
  const [makingCharge, setMakingCharge] = useState<number | ''>('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setName(productToEdit.name);
        setBrand(productToEdit.brand);
        setCategory(productToEdit.category);
        setUnit(productToEdit.unit);
        setBarcode(productToEdit.barcode);
        setSku(productToEdit.sku);
        setMrp(productToEdit.mrp);
        setSellingPrice(productToEdit.sellingPrice);
        setPurchasePrice(productToEdit.purchasePrice);
        setCurrentStock(productToEdit.currentStock);
        setMinStock(productToEdit.minStock);
        setGstPercent(productToEdit.gstPercent || 0);
        setSupplierId(productToEdit.supplierId || '');
        setBatchNumber(productToEdit.batchNumber || '');
        setExpiryDate(productToEdit.expiryDate || '');
        setScheduleCategory(productToEdit.scheduleCategory || '');
        setGrade(productToEdit.grade || '');
        setThickness(productToEdit.thickness || '');
        setImei(productToEdit.imei || '');
        setSerialNumber(productToEdit.serialNumber || '');
        setWarrantyMonths(productToEdit.warrantyMonths || '');
        setVehicleModel(productToEdit.vehicleModel || '');
        setOemNumber(productToEdit.oemNumber || '');
        setPurity(productToEdit.purity || '');
        setMakingCharge(productToEdit.makingCharge || '');
        setSize(productToEdit.size || '');
        setColor(productToEdit.color || '');
      } else {
        setName('');
        setBrand('');
        setCategory(availableCategories[0] || 'General');
        setUnit(availableUnits[0] || 'pcs');
        setBarcode(scannedBarcode || '');
        setSku('');
        setMrp('');
        setSellingPrice('');
        setPurchasePrice('');
        setCurrentStock(10);
        setMinStock(5);
        setGstPercent(sectorCfg.defaultGstPercent || 0);
        setSupplierId('');
        setBatchNumber('');
        setExpiryDate('');
        setScheduleCategory('');
        setGrade('');
        setThickness('');
        setImei('');
        setSerialNumber('');
        setWarrantyMonths('');
        setVehicleModel('');
        setOemNumber('');
        setPurity('');
        setMakingCharge('');
        setSize('');
        setColor('');
      }
    }
  }, [isOpen, productToEdit, scannedBarcode, activeSector]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || sellingPrice === '' || Number(sellingPrice) <= 0) {
      alert("Please provide valid product name and selling price!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Product> = {
        name,
        brand: brand || 'General',
        category,
        unit,
        barcode: barcode || `BC-${Date.now().toString().slice(-8)}`,
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        mrp: Number(mrp) || Number(sellingPrice),
        sellingPrice: Number(sellingPrice),
        purchasePrice: Number(purchasePrice) || Math.round(Number(sellingPrice) * 0.85),
        currentStock: Number(currentStock) || 0,
        minStock: Number(minStock) || 5,
        gstPercent: Number(gstPercent) || 0,
        supplierId: supplierId || undefined,
        status: 'ACTIVE',
        batchNumber: batchNumber || undefined,
        expiryDate: expiryDate || undefined,
        scheduleCategory: scheduleCategory || undefined,
        grade: grade || undefined,
        thickness: thickness || undefined,
        imei: imei || undefined,
        serialNumber: serialNumber || undefined,
        warrantyMonths: warrantyMonths !== '' ? Number(warrantyMonths) : undefined,
        vehicleModel: vehicleModel || undefined,
        oemNumber: oemNumber || undefined,
        purity: purity || undefined,
        makingCharge: makingCharge !== '' ? Number(makingCharge) : undefined,
        size: size || undefined,
        color: color || undefined
      };

      if (productToEdit) {
        await api.updateProduct(productToEdit.id, payload);
      } else {
        await api.createProduct(payload);
      }

      onProductSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-base">
            <Package className="w-5 h-5 text-amber-300" />
            <span>{productToEdit ? 'Edit Kirana Product' : 'Add New Kirana Product'}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-emerald-700 text-emerald-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fortune Kachi Ghani Mustard Oil 1L"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Tata, JSW, Amul, Asian Paints"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                {availableUnits.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Barcode / EAN</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or type barcode"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={onOpenBarcodeScanner}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 p-2 rounded-xl shrink-0"
                  title="Scan camera"
                >
                  <Scan className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Selling Price ({settings.currencySymbol}) *</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                placeholder="138"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-extrabold text-emerald-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">MRP ({settings.currencySymbol})</label>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(Number(e.target.value))}
                placeholder="155"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Purchase Price ({settings.currencySymbol})</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                placeholder="122"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Sector-Specific Fields Box */}
          {(activeSector === 'PHARMACY' || activeSector === 'COSMETICS') && (
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[11px] font-bold text-emerald-900 block">🏥 Pharmacy & Expiry Tracking Attributes</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. B-2026-X8"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Schedule Category</label>
                  <select
                    value={scheduleCategory}
                    onChange={(e) => setScheduleCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-semibold"
                  >
                    <option value="">None / OTC</option>
                    <option value="Schedule H">Schedule H</option>
                    <option value="Schedule H1">Schedule H1</option>
                    <option value="Schedule X">Schedule X</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {(activeSector === 'METALS_STEEL' || activeSector === 'BUILDING_HARDWARE' || activeSector === 'FURNITURE_WOOD') && (
            <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200 space-y-2">
              <span className="text-[11px] font-bold text-blue-900 block">🏗️ Metals, Steel & Wood Specifications</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade / Standard</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. Fe500D / OPC 43"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thickness / Dimension</label>
                  <input
                    type="text"
                    value={thickness}
                    onChange={(e) => setThickness(e.target.value)}
                    placeholder="e.g. 12mm / 2.5mm"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {(activeSector === 'MOBILE_COMPUTERS' || activeSector === 'ELECTRICAL_ELECTRONICS' || activeSector === 'WATER_RO') && (
            <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-200 space-y-2">
              <span className="text-[11px] font-bold text-purple-900 block">📱 IMEI, Serial & Warranty Tracking</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">IMEI Number</label>
                  <input
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="15-digit IMEI"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Device Serial"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="e.g. 12"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {(activeSector === 'AUTO_PARTS') && (
            <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-200 space-y-2">
              <span className="text-[11px] font-bold text-orange-900 block">🚗 Auto Spare Parts OEM Mapping</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">OEM Part Number</label>
                  <input
                    type="text"
                    value={oemNumber}
                    onChange={(e) => setOemNumber(e.target.value)}
                    placeholder="e.g. BS-OIL-091"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Compatible Vehicle</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Maruti Swift / Dzire"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {(activeSector === 'JEWELLERY') && (
            <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200 space-y-2">
              <span className="text-[11px] font-bold text-rose-900 block">💎 Gold, Silver & Diamond Attributes</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gold Purity / Hallmarking</label>
                  <input
                    type="text"
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    placeholder="e.g. 22K (916) / 24K"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Making Charge ({settings.currencySymbol}/g)</label>
                  <input
                    type="number"
                    value={makingCharge}
                    onChange={(e) => setMakingCharge(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="e.g. 450"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {(activeSector === 'FOOTWEAR_GARMENTS' || activeSector === 'TEXTILES') && (
            <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 space-y-2">
              <span className="text-[11px] font-bold text-amber-900 block">👕 Garment & Footwear Matrix</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Size</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. UK 8 / XL / 32"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Color / Design</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Navy Blue / Indigo"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Opening Stock</label>
              <input
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                placeholder="10"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Min Alert Stock</label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                placeholder="5"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">GST Tax %</label>
              <select
                value={gstPercent}
                onChange={(e) => setGstPercent(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-98 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Saving...' : productToEdit ? 'UPDATE PRODUCT' : 'SAVE PRODUCT TO STOCK'}
          </button>
        </form>
      </div>
    </div>
  );
};
