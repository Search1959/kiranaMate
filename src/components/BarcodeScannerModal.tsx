import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scan, X, CheckCircle2, AlertCircle, Camera, Keyboard } from 'lucide-react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Product, StoreSettings } from '../types';
import { formatMoney } from '../lib/currency';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
  products: Product[];
  settings?: StoreSettings | null;
  /**
   * When true (used when scanning items into an already-open sale/cart),
   * the modal stays open and keeps scanning after each detection instead
   * of closing — matching a real checkout counter flow: scan item, scan
   * next item, scan next item, then close when done. When false/omitted
   * (the original behavior — quick stock lookup, general scan entry
   * points with no cart context), it closes after the first detection.
   */
  continuousMode?: boolean;
}

// One shared reader instance is fine — it's stateless between decode calls.
const codeReader = new BrowserMultiFormatReader();

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeDetected,
  products,
  settings,
  continuousMode = false
}) => {
  const money = (v?: number | null) => formatMoney(v, settings?.currencySymbol, settings?.currencyCode);
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ barcode: string; product: Product | null } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastDetectedRef = useRef<{ code: string; at: number } | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleDetected = useCallback((barcode: string) => {
    // Debounce: the same barcode sitting in frame decodes many times a
    // second — only act on it once per 2s window so one physical item
    // doesn't get added to the cart a dozen times.
    const now = Date.now();
    if (lastDetectedRef.current && lastDetectedRef.current.code === barcode && now - lastDetectedRef.current.at < 2000) {
      return;
    }
    lastDetectedRef.current = { code: barcode, at: now };

    const product = products.find(p => p.barcode === barcode) || null;
    setLastResult({ barcode, product });
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setLastResult(null), 2200);

    onBarcodeDetected(barcode);

    if (!continuousMode) {
      onClose();
    }
  }, [products, onBarcodeDetected, continuousMode, onClose]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!videoRef.current) return;
    try {
      controlsRef.current = await codeReader.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result, err) => {
          if (result) {
            handleDetected(result.getText());
          }
          // NotFoundException fires continuously between frames with no
          // barcode in view — that's normal, not an error to surface.
        }
      );
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access failed or denied:', err);
      setCameraError(
        isMobile
          ? 'Camera permission denied or camera unavailable. Please type the barcode manually below.'
          : 'Camera permission denied or camera unavailable. Please type the barcode manually, or scan from a phone/tablet instead.'
      );
      setCameraActive(false);
    }
  }, [handleDetected, isMobile]);

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleDetected(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <Scan className="w-5 h-5 text-amber-300" />
            <span>{continuousMode ? 'Scan Items to Bill' : 'Barcode & Item Scanner'}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-emerald-700 text-emerald-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera Viewfinder Box */}
          <div className="relative w-full h-52 bg-slate-950 rounded-2xl overflow-hidden border-2 border-dashed border-emerald-500/50 flex flex-col items-center justify-center text-slate-400">
            {cameraActive ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-0 border-2 border-amber-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-24 border-2 border-red-500/80 rounded-lg flex items-center justify-center">
                    <span className="text-[11px] text-amber-300 bg-black/60 px-2 py-0.5 rounded font-mono">
                      Align Barcode Here
                    </span>
                  </div>
                </div>

                {/* Live scan confirmation — flashes over the viewfinder without
                    interrupting the camera, so the cashier can keep scanning. */}
                {lastResult && (
                  <div className={`absolute inset-0 flex items-center justify-center p-3 animate-in fade-in duration-150 ${lastResult.product ? 'bg-emerald-900/90' : 'bg-rose-900/90'}`}>
                    {lastResult.product ? (
                      <div className="text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-1" />
                        <div className="text-white font-bold text-sm">{lastResult.product.name}</div>
                        <div className="text-emerald-200 text-xs font-mono mt-0.5">{money(lastResult.product.sellingPrice)} • Added!</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-rose-300 mx-auto mb-1" />
                        <div className="text-white font-bold text-sm">Barcode not recognized</div>
                        <div className="text-rose-200 text-xs font-mono mt-0.5">{lastResult.barcode}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-4">
                <Camera className="w-8 h-8 text-slate-500 mb-2 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">
                  {cameraError || 'Initializing camera...'}
                </p>
                {!cameraError && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Or type the barcode manually below
                  </p>
                )}
              </div>
            )}
          </div>

          {continuousMode && cameraActive && (
            <p className="text-[11px] text-center text-emerald-700 font-semibold -mt-1">
              Camera stays on — keep scanning items, then close when done.
            </p>
          )}

          {/* Manual Barcode Input */}
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-emerald-600" /> Type Barcode or SKU
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. 8901058852310"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
              />
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Scan
              </button>
            </div>
          </form>

          {/* Sample Barcode Quick Selector for Demo */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Click Sample Barcode
            </div>
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50">
              {products.slice(0, 6).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleDetected(p.barcode)}
                  className="w-full text-left p-2.5 hover:bg-emerald-50 text-xs flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-800 block">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">BC: {p.barcode}</span>
                  </div>
                  <span className="font-bold text-emerald-700">{money(p.sellingPrice)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
