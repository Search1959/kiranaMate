import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scan, X, Search, CheckCircle2, AlertCircle, Camera, Keyboard } from 'lucide-react';
import { Product } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
  products: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeDetected,
  products
}) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError("Camera access not supported on this browser.");
      }
    } catch (err: any) {
      console.warn("Camera access failed or denied:", err);
      setCameraError("Camera permission denied or camera unavailable. Please type barcode manually.");
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
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
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onBarcodeDetected(manualCode.trim());
      setManualCode('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <Scan className="w-5 h-5 text-amber-300" />
            <span>Barcode & Item Scanner</span>
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
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-amber-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-24 border-2 border-red-500/80 rounded-lg animate-pulse flex items-center justify-center">
                    <span className="text-[11px] text-amber-300 bg-black/60 px-2 py-0.5 rounded font-mono">
                      Align Barcode Here
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <Camera className="w-8 h-8 text-slate-500 mb-2 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">
                  {cameraError || "Initializing camera..."}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Or select/type barcode from quick list below
                </p>
              </div>
            )}
          </div>

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
                  onClick={() => {
                    onBarcodeDetected(p.barcode);
                    onClose();
                  }}
                  className="w-full text-left p-2.5 hover:bg-emerald-50 text-xs flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-800 block">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">BC: {p.barcode}</span>
                  </div>
                  <span className="font-bold text-emerald-700">₹{p.sellingPrice}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
