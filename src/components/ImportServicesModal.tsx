import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, Camera, Check, Trash2, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { serviceStore } from '../lib/serviceStore';
import { getServiceSectorConfig } from '../lib/serviceSectorConfig';
import {
  ImportedService,
  parseSpreadsheetServices,
  scanServicesWithAI,
  fileToDataUrl
} from '../lib/serviceImport';

interface ImportServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

const SPREADSHEET_EXT = ['.xlsx', '.xls', '.csv'];

export const ImportServicesModal: React.FC<ImportServicesModalProps> = ({ isOpen, onClose, onImported }) => {
  const cfg = getServiceSectorConfig(serviceStore.getActiveSector());
  const [rows, setRows] = useState<ImportedService[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setRows([]);
      setError('');
    }
    return stopCamera;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError('');
    setBusy(true);
    try {
      const lower = file.name.toLowerCase();
      let found: ImportedService[];
      if (SPREADSHEET_EXT.some(e => lower.endsWith(e))) {
        found = await parseSpreadsheetServices(file);
      } else if (lower.endsWith('.pdf') || file.type.startsWith('image/')) {
        found = await scanServicesWithAI(await fileToDataUrl(file), cfg.name);
      } else {
        throw new Error('Please choose an Excel (.xlsx/.xls), CSV, PDF or image file.');
      }
      if (found.length === 0) setError('No services with a name and price were found in this file.');
      setRows(found);
    } catch (e: any) {
      setError(e.message || 'Could not read this file.');
    } finally {
      setBusy(false);
    }
  };

  const startCamera = async () => {
    setError('');
    setCameraOn(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraOn(false);
      setError('Camera not available. Allow camera access, or upload a photo of the price list instead.');
    }
  };

  const captureAndScan = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setBusy(true);
    setError('');
    try {
      const found = await scanServicesWithAI(dataUrl, cfg.name);
      if (found.length === 0) setError('No services with a name and price were found. Try a clearer, straight-on photo.');
      setRows(found);
    } catch (e: any) {
      setError(e.message || 'Could not read the photo.');
    } finally {
      setBusy(false);
    }
  };

  const updateRow = (i: number, patch: Partial<ImportedService>) =>
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const handleImport = () => {
    const valid = rows.filter(r => r.name.trim() && r.price > 0);
    const { added, skipped } = serviceStore.bulkAddServices(
      valid.map(r => ({
        name: r.name,
        category: r.category || 'General',
        price: r.price,
        durationMinutes: r.durationMinutes || 0,
        gstPercent: r.gstPercent || 0,
        description: r.description || undefined
      }))
    );
    if (skipped > 0) alert(`${added} added. ${skipped} skipped because a service with the same name already exists.`);
    onImported();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full my-auto flex flex-col max-h-[92vh] text-white shadow-2xl">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-extrabold text-base">Import or Scan Services</h2>
              <p className="text-xs text-slate-400">Excel, CSV, PDF, a photo — or scan your price list with the camera</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-6 h-6 text-blue-400" />
              <span className="font-bold">Upload File</span>
              <span className="text-[10px] text-slate-400">Excel · CSV · PDF · Photo</span>
            </button>
            <button
              onClick={cameraOn ? stopCamera : startCamera}
              disabled={busy}
              className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-6 h-6 text-emerald-400" />
              <span className="font-bold">{cameraOn ? 'Close Camera' : 'Scan with Camera'}</span>
              <span className="text-[10px] text-slate-400">Point at your price list / menu</span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv,.pdf,application/pdf,image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />

          <div className={cameraOn ? 'space-y-2' : 'hidden'}>
            <video ref={videoRef} playsInline muted className="w-full rounded-2xl bg-black max-h-72 object-contain" />
            <button
              onClick={captureAndScan}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl cursor-pointer"
            >
              Capture & Read Price List
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            Spreadsheet columns are matched by heading (Name, Category, Price, GST, Duration, Description). PDFs and photos are read by AI and may need a quick check below.
          </p>

          {busy && (
            <div className="flex items-center gap-2 text-blue-300 font-bold">
              <RefreshCw className="w-4 h-4 animate-spin" /> Reading your file...
            </div>
          )}
          {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">{error}</div>}

          {rows.length > 0 && (
            <div className="space-y-2">
              <p className="font-bold text-slate-200">{rows.length} services found — review, edit or remove before importing:</p>
              <div className="rounded-2xl border border-slate-800 overflow-hidden">
                <div className="grid grid-cols-[1fr_110px_70px_28px] gap-2 px-2.5 py-1.5 bg-slate-800/70 text-[10px] font-bold uppercase text-slate-400">
                  <span>Service</span><span>Category</span><span>Price</span><span />
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                  {rows.map((r, i) => (
                    <div key={i} className="grid grid-cols-[1fr_110px_70px_28px] gap-2 px-2.5 py-1.5 items-center">
                      <input value={r.name} onChange={e => updateRow(i, { name: e.target.value })} className="bg-slate-800 rounded px-2 py-1 border border-slate-700 min-w-0" />
                      <input value={r.category} onChange={e => updateRow(i, { category: e.target.value })} className="bg-slate-800 rounded px-2 py-1 border border-slate-700 min-w-0" />
                      <input type="number" value={r.price} onChange={e => updateRow(i, { price: Number(e.target.value) })} className="bg-slate-800 rounded px-2 py-1 border border-slate-700 min-w-0" />
                      <button onClick={() => setRows(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-300 cursor-pointer" title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex gap-2 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-700">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={rows.length === 0}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Import {rows.length || ''} Services</span>
          </button>
        </div>
      </div>
    </div>
  );
};
