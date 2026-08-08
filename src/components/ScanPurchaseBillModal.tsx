import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  RefreshCw,
  Building2,
  Package,
  Layers,
  ShoppingBag,
  DollarSign,
  Languages,
  Check
} from 'lucide-react';
import { Supplier, Product, ProductUnit, PaymentMethod, StoreSettings } from '../types';
import { api } from '../lib/api';
import { formatMoney } from '../lib/currency';

interface ScanPurchaseBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: Product[];
  settings: StoreSettings;
  onBillProcessed: () => void;
}

interface ScannedItem {
  id: string;
  productId?: string;
  name: string;
  category: string;
  brand: string;
  unit: ProductUnit;
  quantity: number;
  purchasePrice: number;
  mrp: number;
  sellingPrice: number;
  totalPrice: number;
  isExistingProduct: boolean;
}

export const ScanPurchaseBillModal: React.FC<ScanPurchaseBillModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  products,
  settings,
  onBillProcessed
}) => {
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);
  const [step, setStep] = useState<'capture' | 'scanning' | 'review'>('capture');
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('upload');

  // Camera stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Preview Image
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState<boolean>(true);
  const [scanningMessage, setScanningMessage] = useState('Initializing Gemini AI OCR...');

  // Parsed Form Data
  const [supplierName, setSupplierName] = useState('');
  const [supplierMobile, setSupplierMobile] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('Auto (Hindi / Bengali / English)');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  /** Where the data on the review screen actually came from — controls what the top banner honestly claims. */
  const [dataSource, setDataSource] = useState<'ai' | 'sample' | 'manual'>('ai');
  const [lastScannedImage, setLastScannedImage] = useState<string | null>(null);

  // Sample Bills for testing
  const sampleHindiBillUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23fff"><rect width="600" height="800" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="4"/><text x="30" y="50" font-family="sans-serif" font-size="22" font-weight="bold" fill="%231e293b">लक्ष्मी होलसेल किराना स्टोर्स</text><text x="30" y="80" font-family="sans-serif" font-size="14" fill="%23475569">बिल / चालान संख्या: HIN-987456 | दिनांक: 2026-08-01</text><text x="30" y="100" font-family="sans-serif" font-size="14" fill="%23475569">मोबाईल: 9823011223 | स्थान: इंदौर (म.प्र.)</text><line x1="30" y1="120" x2="570" y2="120" stroke="%2394a3b8" stroke-width="2"/><text x="30" y="150" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">1. बासमती चावल (Basmati Rice) - 50 kg @ 95 = 4750</text><text x="30" y="190" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">2. चने की दाल (Chana Dal) - 20 kg @ 82 = 1640</text><text x="30" y="230" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">3. पतंजलि गाय घी 1L (Patanjali Ghee) - 10 pkt @ 580 = 5800</text><text x="30" y="270" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">4. टाटा नमक 1kg (Tata Salt) - 50 pkt @ 21 = 1050</text><line x1="30" y1="310" x2="570" y2="310" stroke="%2394a3b8" stroke-width="2"/><text x="30" y="350" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23166534">कुल राशि (Total Amount): INR 13,240</text></svg>';

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or unavailable on this device. Please upload a photo instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(dataUrl);
      stopCamera();
      processBillImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      processBillImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleSelect = (type: 'hindi' | 'bengali' | 'english' | 'steel') => {
    if (type === 'steel') {
      const mockData = {
        supplierName: 'ABC Iron & Steel Traders (Sample)',
        supplierMobile: '9829012345',
        invoiceNumber: 'DEMO-2026-001',
        invoiceDate: new Date().toISOString().split('T')[0],
        detectedLanguage: 'English (Steel & Hardware Wholesale Invoice)',
        items: [
          { name: 'TMT Rod 8mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg' as ProductUnit, quantity: 51, purchasePrice: 61, mrp: 76, sellingPrice: 70 },
          { name: 'TMT Rod 10mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg' as ProductUnit, quantity: 52, purchasePrice: 62, mrp: 78, sellingPrice: 72 },
          { name: 'TMT Rod 12mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg' as ProductUnit, quantity: 53, purchasePrice: 63, mrp: 79, sellingPrice: 73 },
          { name: 'TMT Rod 16mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg' as ProductUnit, quantity: 54, purchasePrice: 64, mrp: 80, sellingPrice: 74 },
          { name: 'TMT Rod 20mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg' as ProductUnit, quantity: 55, purchasePrice: 65, mrp: 82, sellingPrice: 75 },
          { name: 'TMT Rod 25mm', category: 'Building Materials & Hardware', brand: 'TATA Tiscon', unit: 'kg' as ProductUnit, quantity: 56, purchasePrice: 66, mrp: 83, sellingPrice: 76 },
          { name: 'MS Angle 25x25x3', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 57, purchasePrice: 67, mrp: 84, sellingPrice: 77 },
          { name: 'MS Angle 40x40x5', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 58, purchasePrice: 68, mrp: 85, sellingPrice: 78 },
          { name: 'MS Angle 50x50x6', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 59, purchasePrice: 69, mrp: 86, sellingPrice: 79 },
          { name: 'MS Angle 65x65x6', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 60, purchasePrice: 70, mrp: 88, sellingPrice: 80 },
          { name: 'MS Flat 25x6', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 61, purchasePrice: 71, mrp: 89, sellingPrice: 81 },
          { name: 'MS Flat 40x6', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 62, purchasePrice: 72, mrp: 90, sellingPrice: 82 },
          { name: 'MS Flat 50x8', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 63, purchasePrice: 73, mrp: 91, sellingPrice: 83 },
          { name: 'MS Flat 75x10', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 64, purchasePrice: 74, mrp: 92, sellingPrice: 84 },
          { name: 'MS Round Bar 10', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 65, purchasePrice: 75, mrp: 94, sellingPrice: 85 },
          { name: 'MS Round Bar 12', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 66, purchasePrice: 76, mrp: 95, sellingPrice: 86 },
          { name: 'MS Round Bar 16', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 67, purchasePrice: 77, mrp: 96, sellingPrice: 87 },
          { name: 'MS Round Bar 20', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 68, purchasePrice: 78, mrp: 98, sellingPrice: 88 },
          { name: 'MS Square Bar 12', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 69, purchasePrice: 79, mrp: 99, sellingPrice: 89 },
          { name: 'MS Square Bar 16', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 70, purchasePrice: 80, mrp: 100, sellingPrice: 90 },
          { name: 'MS Channel75', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 71, purchasePrice: 81, mrp: 101, sellingPrice: 91 },
          { name: 'MS Channel100', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 72, purchasePrice: 82, mrp: 102, sellingPrice: 92 },
          { name: 'MS Channel125', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 73, purchasePrice: 83, mrp: 104, sellingPrice: 93 },
          { name: 'MS Channel150', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 74, purchasePrice: 84, mrp: 105, sellingPrice: 94 },
          { name: 'MS Beam100', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 75, purchasePrice: 85, mrp: 106, sellingPrice: 95 },
          { name: 'MS Beam150', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 76, purchasePrice: 86, mrp: 108, sellingPrice: 96 },
          { name: 'MS Beam200', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 77, purchasePrice: 87, mrp: 109, sellingPrice: 97 },
          { name: 'GI Pipe1/2', category: 'Building Materials & Hardware', brand: 'Jindal', unit: 'kg' as ProductUnit, quantity: 78, purchasePrice: 88, mrp: 110, sellingPrice: 98 },
          { name: 'GI Pipe1', category: 'Building Materials & Hardware', brand: 'Jindal', unit: 'kg' as ProductUnit, quantity: 79, purchasePrice: 89, mrp: 111, sellingPrice: 99 },
          { name: 'GI Pipe2', category: 'Building Materials & Hardware', brand: 'Jindal', unit: 'kg' as ProductUnit, quantity: 80, purchasePrice: 90, mrp: 112, sellingPrice: 100 },
          { name: 'MS Pipe1', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 81, purchasePrice: 91, mrp: 114, sellingPrice: 101 },
          { name: 'MS Pipe2', category: 'Building Materials & Hardware', brand: 'Generic', unit: 'kg' as ProductUnit, quantity: 82, purchasePrice: 92, mrp: 115, sellingPrice: 102 }
        ],
        totalAmount: 201343,
        paidAmount: 201343
      };
      setErrorMsg(null);
      setImagePreview(sampleHindiBillUrl);
      populateExtractedData(mockData, 'sample');
      return;
    }

    let mockData = {
      supplierName: 'Laxmi Wholesale Kirana Stores',
      supplierMobile: '9823011223',
      invoiceNumber: 'HIN-987456',
      invoiceDate: new Date().toISOString().split('T')[0],
      detectedLanguage: 'Hindi / English Translated',
      items: [
        { name: 'Basmati Rice Premium', category: 'Rice & Grains', brand: 'India Gate', unit: 'kg' as ProductUnit, quantity: 50, purchasePrice: 95, mrp: 120, sellingPrice: 110 },
        { name: 'Chana Dal Super', category: 'Dals & Pulses', brand: 'Tata Sampann', unit: 'kg' as ProductUnit, quantity: 20, purchasePrice: 82, mrp: 105, sellingPrice: 95 },
        { name: 'Patanjali Cow Ghee 1L', category: 'Edible Oils & Ghee', brand: 'Patanjali', unit: 'pkt' as ProductUnit, quantity: 10, purchasePrice: 580, mrp: 650, sellingPrice: 620 },
        { name: 'Tata Salt 1kg', category: 'Spices & Masalas', brand: 'Tata', unit: 'pkt' as ProductUnit, quantity: 50, purchasePrice: 21, mrp: 28, sellingPrice: 28 }
      ],
      totalAmount: 13240,
      paidAmount: 10000
    };

    if (type === 'bengali') {
      mockData = {
        supplierName: 'M/s Ma Kali Traders Kolkata',
        supplierMobile: '9830112244',
        invoiceNumber: 'BEN-45120',
        invoiceDate: new Date().toISOString().split('T')[0],
        detectedLanguage: 'Bengali / English Translated',
        items: [
          { name: 'Mustard Oil Pure 1L', category: 'Edible Oils & Ghee', brand: 'Fortune', unit: 'bottle' as ProductUnit, quantity: 30, purchasePrice: 135, mrp: 170, sellingPrice: 155 },
          { name: 'Chakki Fresh Atta 5kg', category: 'Atta & Flours', brand: 'Aashirvaad', unit: 'pkt' as ProductUnit, quantity: 15, purchasePrice: 210, mrp: 260, sellingPrice: 245 },
          { name: 'Toor Dal Premium 1kg', category: 'Dals & Pulses', brand: 'Loose', unit: 'kg' as ProductUnit, quantity: 25, purchasePrice: 125, mrp: 160, sellingPrice: 145 }
        ],
        totalAmount: 10325,
        paidAmount: 10325
      };
    }

    setErrorMsg(null);
    setImagePreview(sampleHindiBillUrl);
    populateExtractedData(mockData, 'sample');
  };

  const processBillImage = async (base64Img: string) => {
    setLastScannedImage(base64Img);
    setStep('scanning');
    setErrorMsg(null);
    setScanningMessage('Analyzing invoice layout with Gemini AI...');

    const timer1 = setTimeout(() => setScanningMessage('Translating Hindi / Bengali text to English...'), 1200);
    const timer2 = setTimeout(() => setScanningMessage('Extracting products, quantities & prices...'), 2400);

    try {
      const res = await api.scanPurchaseBill(base64Img);
      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res.success && res.data) {
        populateExtractedData(res.data, 'ai');
      } else {
        throw new Error('Could not parse response from the AI bill scanner');
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('Scan error:', err);
      // Stay on the capture step with the real photo still visible — never silently swap
      // in unrelated sample data and claim it was "extracted" from the user's real bill.
      setStep('capture');
      setErrorMsg(
        (err.message || 'AI scan failed') +
        '. This can happen without an internet connection or if the photo is unclear. Retry the scan, or enter the bill details manually below.'
      );
    }
  };

  const populateExtractedData = (data: any, source: 'ai' | 'sample' | 'manual' = 'ai') => {
    setDataSource(source);
    setSupplierName(data.supplierName || 'Wholesale Trader');
    setSupplierMobile(data.supplierMobile || '9876543210');
    setInvoiceNumber(data.invoiceNumber || `BILL-${Date.now().toString().slice(-6)}`);
    setInvoiceDate(data.invoiceDate || new Date().toISOString().split('T')[0]);
    setDetectedLanguage(data.detectedLanguage || 'English / Multi-lingual');

    const mappedItems: ScannedItem[] = (data.items || []).map((it: any, idx: number) => {
      const extractedName = (it.name || it.productName || it.description || 'Unnamed Item').trim();
      // Check if product exists in shop inventory
      const existing = products.find(
        p => p.name.toLowerCase().trim() === extractedName.toLowerCase()
      );

      const qty = Number(it.quantity) || 1;
      const price = Number(it.purchasePrice) || 0;

      return {
        id: `scanned-it-${idx}`,
        productId: existing?.id,
        name: extractedName,
        category: it.category || existing?.category || 'Building Materials & Hardware',
        brand: it.brand || existing?.brand || 'Generic',
        unit: (it.unit as ProductUnit) || existing?.unit || 'kg',
        quantity: qty,
        purchasePrice: price,
        mrp: Number(it.mrp) || Math.round(price * 1.25),
        sellingPrice: Number(it.sellingPrice) || Math.round(price * 1.15),
        totalPrice: Number(it.totalPrice) || (qty * price),
        isExistingProduct: !!existing
      };
    });

    setItems(mappedItems);
    const total = mappedItems.reduce((acc, i) => acc + i.totalPrice, 0);
    setPaidAmount(data.paidAmount !== undefined ? Number(data.paidAmount) : total);
    setStep('review');
  };

  /** Recovery path when AI scanning fails: skip straight to the review form, empty and
   * ready to fill in by hand, keeping the user's real uploaded photo for reference. */
  const handleManualEntry = () => {
    setDataSource('manual');
    setErrorMsg(null);
    setSupplierName('');
    setSupplierMobile('');
    setInvoiceNumber(`BILL-${Date.now().toString().slice(-6)}`);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDetectedLanguage('Not scanned');
    setItems([]);
    setPaidAmount(0);
    setStep('review');
  };

  // Item edit helpers
  const handleItemChange = (index: number, field: keyof ScannedItem, val: any) => {
    setItems(prev => {
      const updated = [...prev];
      const cur = { ...updated[index], [field]: val };

      if (field === 'quantity' || field === 'purchasePrice') {
        cur.totalPrice = Number(cur.quantity) * Number(cur.purchasePrice);
      }

      updated[index] = cur;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        id: `scanned-it-new-${Date.now()}`,
        name: 'New Item',
        category: 'General Kirana',
        brand: 'Generic',
        unit: 'pkt',
        quantity: 1,
        purchasePrice: 100,
        mrp: 120,
        sellingPrice: 110,
        totalPrice: 100,
        isExistingProduct: false
      }
    ]);
  };

  const grandTotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const newProductsCount = items.filter(i => !i.isExistingProduct).length;
  const existingProductsCount = items.filter(i => i.isExistingProduct).length;

  const isExistingSupplier = suppliers.some(
    s => s.name.toLowerCase().trim() === supplierName.toLowerCase().trim() ||
         (supplierMobile && s.mobile === supplierMobile)
  );

  const handleFinalSave = async () => {
    if (!supplierName.trim()) {
      setErrorMsg('Please enter a Supplier / Client Name');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Please add at least one purchased item');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const totalAmtCalculated = items.reduce((sum, i) => sum + (Number(i.totalPrice) || (Number(i.quantity) * Number(i.purchasePrice))), 0);
      const payload = {
        supplierName: supplierName.trim(),
        supplierMobile: supplierMobile.trim(),
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate,
        grandTotal: totalAmtCalculated,
        totalAmount: totalAmtCalculated,
        paidAmount: Number(paidAmount),
        paymentMethod,
        notes: `AI Camera Scanned Bill (${detectedLanguage})`,
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          category: i.category,
          brand: i.brand,
          unit: i.unit,
          quantity: Number(i.quantity),
          purchasePrice: Number(i.purchasePrice),
          mrp: Number(i.mrp),
          sellingPrice: Number(i.sellingPrice),
          totalPrice: Number(i.totalPrice) || (Number(i.quantity) * Number(i.purchasePrice))
        }))
      };

      await api.processScannedPurchaseBill(payload);
      onBillProcessed();
      onClose();
    } catch (err: any) {
      console.error('Final purchase save error:', err);
      setErrorMsg(err.message || 'Failed to save purchase bill to stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>Scan Purchase Bill with AI Camera</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Multi-lingual OCR
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Supports Hindi, Bengali, Gujarati, Marathi & English • Auto Stock & Supplier Creation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-800 font-bold shrink-0 cursor-pointer">×</button>
              </div>
              {step === 'capture' && lastScannedImage && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => processBillImage(lastScannedImage)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Scan
                  </button>
                  <button
                    onClick={handleManualEntry}
                    className="px-3 py-1.5 bg-white hover:bg-red-100 text-red-700 border border-red-300 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Enter Bill Details Manually
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: CAPTURE OR UPLOAD */}
          {step === 'capture' && (
            <div className="space-y-4">
              {/* Camera vs File Upload Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'upload' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image File</span>
                </button>
                <button
                  onClick={() => setActiveTab('camera')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'camera' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Live Camera Capture</span>
                </button>
              </div>

              {activeTab === 'camera' ? (
                <div className="space-y-3">
                  {cameraError ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs text-center space-y-2">
                      <p>{cameraError}</p>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer"
                      >
                        Switch to File Upload
                      </button>
                    </div>
                  ) : (
                    <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-4/3 max-h-[360px] flex items-center justify-center border border-slate-800">
                      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                      <div className="absolute inset-0 border-2 border-dashed border-blue-400/50 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                        <span className="text-white/80 text-xs font-semibold bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-xs">
                          Align Purchase Bill Here
                        </span>
                      </div>
                      <button
                        onClick={capturePhoto}
                        className="absolute bottom-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-xl flex items-center gap-2 text-xs transition-all cursor-pointer transform active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Photo & Scan</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-8 text-center transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm text-slate-800">Click or Drag Purchase Bill Photo Here</p>
                  <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WebP photo of invoice, bill or receipt</p>
                </div>
              )}

              {/* Sample Test Bills for instant demo without hardware camera */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Don't have a paper bill right now? Try these sample bills:</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSampleSelect('steel')}
                    className="p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[10px] font-extrabold text-indigo-800 uppercase">🏗️ Steel & Hardware</div>
                    <div className="font-semibold text-xs text-slate-800 truncate mt-0.5">ABC Iron & Steel Traders</div>
                    <div className="text-[10px] text-slate-500">32 Items • ₹201,343</div>
                  </button>

                  <button
                    onClick={() => handleSampleSelect('hindi')}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[10px] font-extrabold text-amber-800 uppercase">🇮🇳 Hindi Bill</div>
                    <div className="font-semibold text-xs text-slate-800 truncate mt-0.5">लक्ष्मी किराना इंदौर</div>
                    <div className="text-[10px] text-slate-500">4 items • ₹13,240</div>
                  </button>

                  <button
                    onClick={() => handleSampleSelect('bengali')}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[10px] font-extrabold text-emerald-800 uppercase">🇮🇳 Bengali Bill</div>
                    <div className="font-semibold text-xs text-slate-800 truncate mt-0.5">মা কালী ট্রেডার্স কলকাতা</div>
                    <div className="text-[10px] text-slate-500">3 items • ₹10,325</div>
                  </button>

                  <button
                    onClick={() => handleSampleSelect('hindi')}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-colors cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <div className="text-[10px] font-extrabold text-blue-800 uppercase">🇮🇳 English Bill</div>
                    <div className="font-semibold text-xs text-slate-800 truncate mt-0.5">National Wholesale</div>
                    <div className="text-[10px] text-slate-500">Multilingual OCR Test</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SCANNING IN PROGRESS */}
          {step === 'scanning' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-500 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">{scanningMessage}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Converting regional text (Hindi/Bengali/Tamil/Gujarati) to English and structuring invoice values...
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & EDIT EXTRACTED DATA */}
          {step === 'review' && (
            <div className="space-y-5">
              {/* Top Highlights Banner — copy honestly reflects where this data actually came from */}
              <div className={`text-white rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                dataSource === 'ai'
                  ? 'bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900'
                  : dataSource === 'sample'
                  ? 'bg-gradient-to-r from-amber-900 via-slate-900 to-amber-800'
                  : 'bg-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold ${dataSource === 'sample' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                    {dataSource === 'manual' ? <FileText className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                      {dataSource === 'ai' && <span>Bill Extracted & Translated to English</span>}
                      {dataSource === 'sample' && <span>Sample Bill Preview (Demo Data)</span>}
                      {dataSource === 'manual' && <span>Manual Entry — Add Your Bill Items Below</span>}
                      {dataSource !== 'manual' && (
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                          dataSource === 'sample' ? 'bg-amber-400/20 text-amber-200 border-amber-400/30' : 'bg-blue-400/20 text-blue-300 border-blue-400/30'
                        }`}>
                          {detectedLanguage}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {dataSource === 'ai' && 'Review supplier, pricing and stock changes below before saving.'}
                      {dataSource === 'sample' && "This is placeholder demo data, not extracted from a real photo — edit or replace it before saving to your real stock."}
                      {dataSource === 'manual' && 'AI scanning was unavailable, so nothing was auto-filled — add your supplier and items below.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { setStep('capture'); setImagePreview(null); setErrorMsg(null); }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another Bill</span>
                </button>
              </div>

              {/* Uploaded Purchase Bill Image Preview Card */}
              {imagePreview && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md text-white">
                  <div className="p-3 bg-slate-950 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200">
                        {dataSource === 'sample' ? 'Sample Reference Image' : 'Uploaded Bill Image Preview'}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">
                        {dataSource === 'sample' ? 'Demo Image, Not Yours' : 'Your Original Document'}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowImagePreview(!showImagePreview)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer flex items-center gap-1"
                    >
                      <span>{showImagePreview ? 'Hide Bill Image' : 'Show Bill Image'}</span>
                    </button>
                  </div>

                  {showImagePreview && (
                    <div className="p-3 bg-slate-900/80 flex flex-col items-center justify-center max-h-[350px] overflow-auto">
                      <img
                        src={imagePreview}
                        alt="Uploaded Purchase Bill Preview"
                        className="max-h-[320px] w-auto object-contain rounded border border-slate-700 shadow-xl"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Supplier & Invoice Header Fields */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" /> Supplier / Wholesale Client Name
                    </span>
                    {isExistingSupplier ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        ✓ Existing Supplier
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        ✨ Will Create New Supplier
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Laxmi Wholesale Traders"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Mobile</label>
                  <input
                    type="text"
                    value={supplierMobile}
                    onChange={(e) => setSupplierMobile(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Invoice / Bill No.</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Bill No."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Purchased Items ({items.length})</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      ({existingProductsCount} existing stock update, {newProductsCount} new items created)
                    </span>
                  </h4>

                  <button
                    onClick={handleAddItemRow}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg flex items-center gap-1 border border-blue-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Row</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                          <th className="py-2.5 px-3 min-w-[160px]">Product Name (English)</th>
                          <th className="py-2.5 px-3 w-28">Category</th>
                          <th className="py-2.5 px-3 w-20">Unit</th>
                          <th className="py-2.5 px-3 w-20">Qty</th>
                          <th className="py-2.5 px-3 w-24">Buy Price ({settings.currencySymbol})</th>
                          <th className="py-2.5 px-3 w-24">Sell Price ({settings.currencySymbol})</th>
                          <th className="py-2.5 px-3 w-24 text-right">Total ({settings.currencySymbol})</th>
                          <th className="py-2.5 px-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-4 text-center text-slate-400">No items extracted. Click "Add Item Row".</td>
                          </tr>
                        ) : (
                          items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                {item.isExistingProduct ? (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded mt-0.5 inline-block">
                                    Matches Stock Catalog
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded mt-0.5 inline-block">
                                    ✨ New Catalog Product
                                  </span>
                                )}
                              </td>

                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.category}
                                  onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>

                              <td className="p-2">
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {['kg', 'g', 'liter', 'ml', 'pkt', 'pc', 'pcs', 'box', 'bottle', 'pouch', 'bag', 'tin', 'meter', 'ft', 'set'].map(u => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                </select>
                              </td>

                              <td className="p-2">
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-bold text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>

                              <td className="p-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={item.purchasePrice}
                                  onChange={(e) => handleItemChange(idx, 'purchasePrice', Number(e.target.value))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>

                              <td className="p-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={item.sellingPrice}
                                  onChange={(e) => handleItemChange(idx, 'sellingPrice', Number(e.target.value))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-semibold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>

                              <td className="p-2 text-right font-bold text-slate-900">
                                {money(item.totalPrice)}
                              </td>

                              <td className="p-2 text-center">
                                <button
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Payment & Summary Footer */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Total Bill Amount</label>
                    <div className="text-xl font-extrabold text-amber-400">
                      {money(grandTotal)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Amount Paid Now ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CREDIT">Udhaar (Unpaid)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Saving will update stock for <strong>{items.length} items</strong>
                      {!isExistingSupplier && `, register supplier <strong>${supplierName}</strong>`}
                      {newProductsCount > 0 && ` & create <strong>${newProductsCount} new catalog items</strong>`}.
                    </span>
                  </div>

                  <button
                    onClick={handleFinalSave}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Updating Stock...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm & Enter into Stock</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
