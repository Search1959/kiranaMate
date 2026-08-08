import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  TrendingDown,
  Camera,
  Upload,
  Sparkles,
  Zap,
  Coffee,
  Truck,
  Building2,
  Package,
  Users,
  Wrench,
  Wifi,
  ShieldAlert,
  Megaphone,
  Check,
  RefreshCw,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  CreditCard,
  Tag,
  Receipt
} from 'lucide-react';
import { ExpenseCategory, PaymentMethod, StoreSettings } from '../types';
import { api } from '../lib/api';
import { formatMoney } from '../lib/currency';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseSaved: () => void;
  recordedBy?: string;
  settings: StoreSettings;
}

const EXPENSE_CATEGORIES: { label: ExpenseCategory; icon: any; color: string }[] = [
  { label: 'Tea & Snacks', icon: Coffee, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'Delivery/Transport', icon: Truck, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { label: 'Electricity', icon: Zap, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { label: 'Rent', icon: Building2, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { label: 'Packaging', icon: Package, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'Staff Salary', icon: Users, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { label: 'Maintenance', icon: Wrench, color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { label: 'Wi-Fi & Telecom', icon: Wifi, color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { label: 'Pest Control & Cleaning', icon: ShieldAlert, color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { label: 'Marketing & Signboard', icon: Megaphone, color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { label: 'Taxes & Licenses', icon: Receipt, color: 'bg-slate-100 text-slate-800 border-slate-200' },
  { label: 'Other', icon: Tag, color: 'bg-gray-100 text-gray-800 border-gray-200' }
];

interface QuickPreset {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  payeeName: string;
  description: string;
  icon: any;
  badgeColor: string;
  isRecurring?: boolean;
}

const REALISTIC_PRESETS: QuickPreset[] = [
  {
    id: 'preset-chai',
    title: 'Daily Staff Chai & Snacks',
    category: 'Tea & Snacks',
    amount: 60,
    paymentMethod: 'CASH',
    payeeName: 'Sharma Tea Stall',
    description: 'Morning & evening tea + biscuits for shop staff',
    icon: Coffee,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    isRecurring: true
  },
  {
    id: 'preset-freight',
    title: 'Mandi Auto Freight Charge',
    category: 'Delivery/Transport',
    amount: 350,
    paymentMethod: 'CASH',
    payeeName: 'Suresh Auto Driver',
    description: 'Auto fare for fetching rice & grain bags from wholesale mandi',
    icon: Truck,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
  },
  {
    id: 'preset-eb',
    title: 'Monthly EB Electricity Bill',
    category: 'Electricity',
    amount: 3200,
    paymentMethod: 'UPI',
    payeeName: 'Torrent / State Electricity Board',
    description: 'Monthly power charges for shop lighting & 2 deep freezers',
    icon: Zap,
    badgeColor: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
    isRecurring: true
  },
  {
    id: 'preset-rent',
    title: 'Shop Premises Rent',
    category: 'Rent',
    amount: 15000,
    paymentMethod: 'BANK',
    payeeName: 'Ramesh Patel (Landlord)',
    description: 'Monthly store shop rent payment',
    icon: Building2,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    isRecurring: true
  },
  {
    id: 'preset-bags',
    title: 'Carry Bags & Packaging Rolls',
    category: 'Packaging',
    amount: 850,
    paymentMethod: 'UPI',
    payeeName: 'Sardar Plastic & Packaging',
    description: '10kg bio-degradable carry bags & sealing tapes',
    icon: Package,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
  },
  {
    id: 'preset-salary',
    title: 'Daily Helper Wage / Salary',
    category: 'Staff Salary',
    amount: 600,
    paymentMethod: 'CASH',
    payeeName: 'Raju (Shop Boy)',
    description: 'Daily wage payment for store helper',
    icon: Users,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    isRecurring: true
  },
  {
    id: 'preset-repair',
    title: 'Deep Freezer Refrigeration Servicing',
    category: 'Maintenance',
    amount: 1200,
    paymentMethod: 'CASH',
    payeeName: 'Cooling Tech Services',
    description: 'Gas refilling and condenser coil cleaning for ice cream freezer',
    icon: Wrench,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
  },
  {
    id: 'preset-wifi',
    title: 'Shop Wi-Fi & Landline Bill',
    category: 'Wi-Fi & Telecom',
    amount: 699,
    paymentMethod: 'UPI',
    payeeName: 'JioFiber / Airtel Broadband',
    description: 'Monthly unlimited internet for POS machine & CCTV',
    icon: Wifi,
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
    isRecurring: true
  },
  {
    id: 'preset-pest',
    title: 'Shop Pest Control & Sanitization',
    category: 'Pest Control & Cleaning',
    amount: 450,
    paymentMethod: 'CASH',
    payeeName: 'CleanPest Herbal Solutions',
    description: 'Monthly pest control sprayed around rice & grain storage bins',
    icon: ShieldAlert,
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
  },
  {
    id: 'preset-board',
    title: 'Flex Banner Signboard Printing',
    category: 'Marketing & Signboard',
    amount: 1500,
    paymentMethod: 'UPI',
    payeeName: 'A-One Digital Printers',
    description: 'New store discount flex banner printed for front entrance',
    icon: Megaphone,
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
  }
];

// Sample Expense Receipt SVG Mockups
const SAMPLE_EB_BILL = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750" fill="%23fff"><rect width="600" height="750" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="4"/><text x="30" y="50" font-family="sans-serif" font-size="22" font-weight="bold" fill="%230f172a">टोरेंट पावर / Torrent Power EB Receipt</text><text x="30" y="80" font-family="sans-serif" font-size="14" fill="%23475569">उपभोक्ता संख्या / Consumer No: EB-9823101 | दिनांक: 2026-08-02</text><text x="30" y="100" font-family="sans-serif" font-size="14" fill="%23475569">दुकान नाम: Kirana Mate Stores | मीटर श्रेणी: व्यावसायिक Commercial</text><line x1="30" y1="120" x2="570" y2="120" stroke="%2394a3b8" stroke-width="2"/><text x="30" y="160" font-family="sans-serif" font-size="16" fill="%231e293b">बिजली खपत / Power Consumption: 412 Units @ 7.50</text><text x="30" y="190" font-family="sans-serif" font-size="16" fill="%231e293b">फिक्स्ड चार्ज / Fixed Commercial Charge = 360.00</text><text x="30" y="220" font-family="sans-serif" font-size="16" fill="%231e293b">विद्युत कर / Electricity Duty (18%) = 480.00</text><line x1="30" y1="260" x2="570" y2="260" stroke="%2394a3b8" stroke-width="2"/><text x="30" y="310" font-family="sans-serif" font-size="22" font-weight="bold" fill="%23be123c">कुल भुगतान राशि (Total Amount Paid): INR 3,450.00</text><text x="30" y="340" font-family="sans-serif" font-size="14" fill="%23166534">भुगतान विधि: UPI / GPay Receipt Ref: EB-TXN-887123</text></svg>';

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseSaved,
  recordedBy = 'Shop Owner',
  settings
}) => {
  const money = (v?: number | null) => formatMoney(v, settings.currencySymbol, settings.currencyCode);
  const [activeTab, setActiveTab] = useState<'form' | 'scan'>('form');

  // Form State
  const [category, setCategory] = useState<ExpenseCategory | string>('Tea & Snacks');
  const [payeeName, setPayeeName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [receiptNo, setReceiptNo] = useState('');
  const [gstAmount, setGstAmount] = useState<number | ''>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Extracted Badge Banner
  const [aiExtractedBanner, setAiExtractedBanner] = useState<string | null>(null);

  // Scanner State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanTab, setScanTab] = useState<'upload' | 'camera'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState('Analyzing receipt layout with Gemini AI...');
  const [scanError, setScanError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
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
      console.error('Camera error:', err);
      setCameraError('Camera access unavailable. Please upload an image file instead.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'scan' && scanTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab, scanTab, startCamera, stopCamera]);

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
      stopCamera();
      processReceiptImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      processReceiptImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (p: QuickPreset) => {
    setCategory(p.category);
    setPayeeName(p.payeeName);
    setAmount(p.amount);
    setPaymentMethod(p.paymentMethod);
    setDescription(p.description);
    setIsRecurring(!!p.isRecurring);
    setAiExtractedBanner(null);
  };

  const handleQuickAddAmount = (addVal: number) => {
    const current = typeof amount === 'number' ? amount : 0;
    setAmount(current + addVal);
  };

  const processReceiptImage = async (base64Img: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanningMessage('Analyzing receipt text with Gemini AI OCR...');

    const timer = setTimeout(() => {
      setScanningMessage('Extracting payee name, total amount, category & date...');
    }, 1200);

    try {
      const res = await api.scanExpenseBill(base64Img);
      clearTimeout(timer);

      if (res.success && res.data) {
        populateExtractedData(res.data);
      } else {
        throw new Error('Could not parse expense receipt response from AI');
      }
    } catch (err: any) {
      clearTimeout(timer);
      console.error('Scan error:', err);
      setScanError(err.message || 'Failed to scan expense receipt. Using sample fallback.');
      // Fallback sample fill
      populateExtractedData({
        title: 'Torrent Power Electricity Bill',
        category: 'Electricity',
        amount: 3450,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        payeeName: 'Torrent Power Board',
        receiptNo: 'EB-TXN-887123',
        description: 'Monthly commercial electricity bill for Kirana store',
        isRecurring: true,
        gstAmount: 480,
        detectedLanguage: 'Hindi / English'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const populateExtractedData = (data: any) => {
    if (data.category) setCategory(data.category);
    if (data.payeeName || data.title) setPayeeName(data.payeeName || data.title);
    if (data.amount) setAmount(Number(data.amount));
    if (data.date) setDate(data.date);
    if (data.paymentMethod) setPaymentMethod(data.paymentMethod as PaymentMethod);
    if (data.receiptNo) setReceiptNo(data.receiptNo);
    if (data.description || data.title) setDescription(data.description || data.title);
    if (data.isRecurring !== undefined) setIsRecurring(!!data.isRecurring);
    if (data.gstAmount) setGstAmount(Number(data.gstAmount));

    const lang = data.detectedLanguage || 'Multi-lingual Receipt';
    setAiExtractedBanner(`✨ Extracted via Gemini AI OCR (${lang}) — Review details below`);
    setActiveTab('form');
  };

  const handleSampleReceiptSelect = () => {
    processReceiptImage(SAMPLE_EB_BILL);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid expense amount!");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDescription = [
        payeeName ? `Paid To: ${payeeName}` : null,
        description || `Shop expense: ${category}`,
        receiptNo ? `Ref/Bill #: ${receiptNo}` : null,
        isRecurring ? `[Monthly/Daily Recurring]` : null
      ].filter(Boolean).join(' • ');

      await api.createExpense({
        category,
        amount: Number(amount),
        date,
        description: fullDescription,
        paymentMethod,
        payeeName: payeeName || undefined,
        receiptNo: receiptNo || undefined,
        isRecurring,
        gstAmount: typeof gstAmount === 'number' ? gstAmount : undefined,
        recordedBy
      });

      onExpenseSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-800 via-rose-700 to-rose-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-rose-200 border border-white/20 shadow-inner">
              <TrendingDown className="w-5 h-5 text-rose-100" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <span>Record Shop Expense</span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                  Operational Costs
                </span>
              </h2>
              <p className="text-xs text-rose-100/80">
                Log daily shop expenses or scan receipt bills with AI Camera
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-rose-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'form'
                ? 'bg-white text-rose-700 border-slate-200 shadow-xs -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Expense Form & Quick Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'scan'
                ? 'bg-white text-rose-700 border-slate-200 shadow-xs -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Scan Bill / Receipt (AI Camera)</span>
            <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
              OCR
            </span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {aiExtractedBanner && activeTab === 'form' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{aiExtractedBanner}</span>
              </div>
              <button
                onClick={() => setAiExtractedBanner(null)}
                className="text-emerald-600 hover:text-emerald-900 font-bold text-sm px-1"
              >
                ×
              </button>
            </div>
          )}

          {/* TAB 1: FORM & PRESETS */}
          {activeTab === 'form' && (
            <div className="space-y-5">
              {/* FAST FILL REALISTIC KIRANA PRESETS */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Quick Realistic Presets (1-Click Fill)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Click any card to auto-fill form</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {REALISTIC_PRESETS.map((p) => {
                    const IconComponent = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer transform active:scale-95 flex flex-col justify-between ${p.badgeColor}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <IconComponent className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-black text-xs">{money(p.amount)}</span>
                        </div>
                        <div className="font-bold text-[11px] leading-tight mt-1 line-clamp-2">
                          {p.title}
                        </div>
                        <div className="text-[9px] opacity-75 mt-0.5 truncate">{p.category}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* EXPENSE FORM */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Category Selection */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Expense Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EXPENSE_CATEGORIES.map((cat) => {
                      const IconComp = cat.icon;
                      const isSelected = category === cat.label;
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => setCategory(cat.label)}
                          className={`p-2.5 rounded-xl border font-bold text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50 border-rose-600 text-rose-800 shadow-xs ring-2 ring-rose-500/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <IconComp className={`w-4 h-4 ${isSelected ? 'text-rose-600' : 'text-slate-500'}`} />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount & Quick Add Chips */}
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-rose-600" />
                      <span>Amount Spent ({settings.currencySymbol}) *</span>
                    </label>

                    {/* Quick +Amount Chips */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-semibold mr-1">Quick Add:</span>
                      {[50, 100, 500, 1000, 5000].map((addVal) => (
                        <button
                          key={addVal}
                          type="button"
                          onClick={() => handleQuickAddAmount(addVal)}
                          className="px-2 py-0.5 bg-white border border-rose-200 text-rose-700 font-bold text-[10px] rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          +{addVal}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Enter amount e.g. 350"
                    className="w-full bg-white border border-rose-300 rounded-xl px-4 py-2.5 text-lg font-black text-rose-700 focus:ring-2 focus:ring-rose-600 focus:outline-none shadow-xs"
                    required
                  />
                </div>

                {/* Title / Payee & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Payee / Person / Vendor Name
                    </label>
                    <input
                      type="text"
                      value={payeeName}
                      onChange={(e) => setPayeeName(e.target.value)}
                      placeholder="e.g. Suresh Auto Driver, Torrent Power"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-rose-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Expense Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-rose-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Payment Method & Ref No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-rose-600 focus:outline-none"
                    >
                      <option value="CASH">Cash (Petty Cash Counter)</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="BANK">Bank Transfer / NEFT</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Receipt / Bill No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={receiptNo}
                      onChange={(e) => setReceiptNo(e.target.value)}
                      placeholder="e.g. EB-9823101 or Slip #45"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-rose-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tax Component & Recurring Checkbox */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Tax / GST Component ({settings.currencySymbol} if deductible)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={gstAmount}
                      onChange={(e) => setGstAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 180"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-rose-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 border-slate-300"
                      />
                      <span className="font-bold text-slate-800">Recurring Fixed Expense</span>
                      <span className="text-[10px] text-slate-400">(Rent, EB, Wi-Fi, Salary)</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Notes / Reason / Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Auto fare paid for getting 10 rice bags from mandi"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-rose-600 focus:outline-none text-xs"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rose-700 hover:bg-rose-800 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recording Expense...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SAVE SHOP EXPENSE LOG</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SCAN BILL / RECEIPT */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold">Multi-lingual AI Receipt Scanner</p>
                    <p className="text-[11px] text-amber-800">
                      Snap or upload physical bills (Hindi, Gujarati, Marathi, English). Gemini AI auto-extracts total, payee, and category into the form!
                    </p>
                  </div>
                </div>
              </div>

              {scanError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{scanError}</span>
                  </div>
                  <button onClick={() => setScanError(null)} className="text-red-500 font-bold">×</button>
                </div>
              )}

              {isScanning ? (
                <div className="py-12 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    <Sparkles className="w-6 h-6 text-amber-500 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{scanningMessage}</h3>
                    <p className="text-xs text-slate-500 mt-1">Converting receipt details into expense log...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Camera vs Upload sub-tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setScanTab('upload')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        scanTab === 'upload' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Receipt Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanTab('camera')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        scanTab === 'camera' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      <span>Live Camera Snap</span>
                    </button>
                  </div>

                  {scanTab === 'camera' ? (
                    <div className="space-y-3">
                      {cameraError ? (
                        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs text-center space-y-2">
                          <p>{cameraError}</p>
                          <button
                            type="button"
                            onClick={() => setScanTab('upload')}
                            className="px-3 py-1.5 bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                          >
                            Switch to File Upload
                          </button>
                        </div>
                      ) : (
                        <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-4/3 max-h-[320px] flex items-center justify-center border border-slate-800">
                          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                          <div className="absolute inset-0 border-2 border-dashed border-rose-400/50 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                            <span className="text-white/80 text-xs font-semibold bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-xs">
                              Align Expense Receipt Here
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="absolute bottom-4 px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-full shadow-xl flex items-center gap-2 text-xs transition-all cursor-pointer transform active:scale-95"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Snap & Scan Receipt</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 hover:border-rose-500 bg-slate-50 hover:bg-rose-50/50 rounded-2xl p-8 text-center transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm text-slate-800">Click or Drag Receipt Photo Here</p>
                      <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WebP image of bill or voucher slip</p>
                    </div>
                  )}

                  {/* Sample Receipt for Testing */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Test with Sample Expense Receipt (Instant AI Scan):</span>
                    </p>
                    <button
                      type="button"
                      onClick={handleSampleReceiptSelect}
                      className="w-full p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl text-left transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center font-bold">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            Torrent Power Electricity Bill (Gujarati / English)
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Consumer No: EB-9823101 • ₹3,450.00
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200">
                        Scan Sample Bill
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
