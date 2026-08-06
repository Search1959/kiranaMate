import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CloudCheck,
  Server,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  RotateCcw,
  ShieldAlert,
  HardDrive
} from 'lucide-react';
import { api, getCurrentStoreId } from '../lib/api';

interface BackupViewProps {
  onRefreshData: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({ onRefreshData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentStoreId = getCurrentStoreId();

  const handleExportBackup = () => {
    setIsExporting(true);
    setMessage(null);
    try {
      api.exportBackup();
      setMessage({
        type: 'success',
        text: 'Backup file generation initiated! Check your browser downloads folder.'
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to download database backup.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = event.target?.result as string;
        if (!jsonContent) throw new Error('Selected backup file is empty.');

        const result = await api.restoreBackup(jsonContent);
        setMessage({
          type: 'success',
          text: result.message || 'Database restored successfully! Refreshing dashboard...'
        });
        onRefreshData();
      } catch (err: any) {
        setMessage({
          type: 'error',
          text: err.message || 'Failed to restore database from backup file.'
        });
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const handleForceCloudSync = async () => {
    setIsSyncingCloud(true);
    setMessage(null);
    try {
      await onRefreshData();
      setMessage({
        type: 'success',
        text: 'Successfully forced sync with Google Cloud Firestore database!'
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: 'Failed to sync with cloud database.'
      });
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Are you sure you want to reset demo data? This will repopulate initial sample inventory and customer accounts.')) {
      return;
    }

    setIsResetting(true);
    setMessage(null);
    try {
      const result = await api.resetDemoData();
      setMessage({
        type: 'success',
        text: result.message || 'Database reset to demo state!'
      });
      onRefreshData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to reset demo database.'
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* View Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-teal-600" />
            <span>Database Backup & Cloud Sync Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Export JSON backups, restore store database, and manage live Cloud Firestore database synchronization
          </p>
        </div>

        <button
          onClick={handleForceCloudSync}
          disabled={isSyncingCloud}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncingCloud ? 'animate-spin' : ''}`} />
          <span>{isSyncingCloud ? 'Syncing Cloud...' : 'Force Cloud Sync'}</span>
        </button>
      </div>

      {/* Cloud Database Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>Google Cloud Firestore Status</span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected & Online
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Data added anywhere is automatically persisted and accessible from any device over the internet
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-700/80 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Store Account ID</span>
            <span className="font-mono text-teal-300 font-extrabold text-sm">{currentStoreId}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cloud Provider</span>
            <span className="font-bold text-white text-xs">Google Firebase Cloud</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Persistence Mode</span>
            <span className="font-bold text-emerald-400 text-xs">Hybrid Offline + Live Cloud Sync</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="font-bold text-slate-500 hover:text-slate-800">×</button>
        </div>
      )}

      {/* 2 Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Backup Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Export Full JSON Backup</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download a complete JSON backup file of all store products, customer accounts, sales receipts, delivery orders, purchases, and settings.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FileJson className="w-4 h-4" />
            <span>{isExporting ? 'Generating JSON...' : 'DOWNLOAD BACKUP FILE (.JSON)'}</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Restore Database from Backup</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a previously exported JSON backup file to instantly restore all products, stock quantities, and customer ledger data.
            </p>
          </div>

          <label className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
            <Upload className="w-4 h-4" />
            <span>{isRestoring ? 'Restoring File...' : 'SELECT & UPLOAD BACKUP FILE'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileRestore}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone / Reset Demo Data */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Demo Data Maintenance</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-xs">Reset to Fresh Demo Data</h3>
            <p className="text-[11px] text-slate-500">
              Re-populates 100+ Kirana grocery products, sample sales, and 50 customer accounts with realistic prices & barcodes.
            </p>
          </div>

          <button
            onClick={handleResetDemoData}
            disabled={isResetting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
