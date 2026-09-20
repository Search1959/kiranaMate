import React, { useEffect, useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import Papa from 'papaparse';
import { api } from '../lib/api';
import { Product } from '../types';
import { findMatchingProduct } from '../lib/productMatch';

interface BulkProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const IMPORT_SIGS_KEY = 'trademate_product_import_sigs';

/** Case-insensitive column lookup: exact header first, then any header that contains an alias. */
function pick(row: Record<string, any>, aliases: string[]): any {
  const keys = Object.keys(row);
  for (const a of aliases) {
    const k = keys.find(k => k.trim().toLowerCase() === a);
    if (k !== undefined && row[k] !== '' && row[k] != null) return row[k];
  }
  for (const a of aliases) {
    const k = keys.find(k => k.trim().toLowerCase().includes(a));
    if (k !== undefined && row[k] !== '' && row[k] != null) return row[k];
  }
  return undefined;
}

function rowToProduct(row: Record<string, any>): Partial<Product> | null {
  const name = String(pick(row, ['product name', 'name', 'product', 'item name', 'item']) ?? '').trim();
  if (!name) return null;
  const selling = Number(pick(row, ['selling price', 'sellingprice', 'price', 'rate']) || 0);
  const barcode = pick(row, ['barcode', 'ean']);
  return {
    name,
    category: String(pick(row, ['category']) ?? 'Other'),
    brand: String(pick(row, ['brand']) ?? 'General'),
    unit: String(pick(row, ['unit']) ?? 'pkt') as any,
    sellingPrice: selling,
    mrp: Number(pick(row, ['mrp']) || selling || 0),
    purchasePrice: Number(pick(row, ['purchase price', 'purchaseprice', 'cost']) || 0),
    // A missing quantity column means "no stock info", not "10 pieces".
    currentStock: Number(pick(row, ['stock', 'quantity', 'qty', 'currentstock']) || 0),
    minStock: Number(pick(row, ['min stock', 'minstock']) || 5),
    barcode: barcode ? String(barcode) : undefined
  };
}

export const BulkProductImportModal: React.FC<BulkProductImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<Partial<Product>[]>([]);
  const [existing, setExisting] = useState<Product[]>([]);
  const [mode, setMode] = useState<'add' | 'replace'>('add');
  const [seenBefore, setSeenBefore] = useState(false);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ addedCount: number; newCount?: number; updatedCount?: number; errors: string[] } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    api.getProducts().then(list => setExisting(list as Product[])).catch(() => setExisting([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const signature = (f: File, rows: number) => `${f.name}|${f.size}|${rows}`;

  const finishParse = (f: File, rows: Record<string, any>[]) => {
    const parsed = rows.map(rowToProduct).filter(Boolean) as Partial<Product>[];
    setItems(parsed);
    if (parsed.length === 0) setParseErrors(['No rows with a product name were found in this file.']);
    try {
      const sigs: string[] = JSON.parse(localStorage.getItem(IMPORT_SIGS_KEY) || '[]');
      setSeenBefore(sigs.includes(signature(f, parsed.length)));
    } catch {
      setSeenBefore(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseErrors([]);
    setImportResult(null);
    setItems([]);
    setMode('add');

    if (/\.xlsx?$/i.test(selectedFile.name)) {
      try {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(await selectedFile.arrayBuffer(), { type: 'array' });
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        finishParse(selectedFile, rows);
      } catch {
        setParseErrors(['Could not read this Excel file. Save it as .xlsx or .csv and try again.']);
      }
      return;
    }

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => finishParse(selectedFile, results.data as Record<string, any>[]),
      error: (err) => {
        setParseErrors([`CSV Parse Error: ${err.message}`]);
      }
    });
  };

  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Product Name,Category,Brand,Unit,Selling Price,MRP,Purchase Price,Stock,Barcode,Min Stock\n" +
      "Loose Wheat Atta 10kg,Atta & Flours,Local,pkt,390,420,350,20,890000000991,5\n" +
      "Tata Salt 1kg,Spices & Masalas,Tata,pkt,28,28,22,50,8901058000018,10\n" +
      "Amul Butter 100g,Dairy & Bakery,Amul,pkt,58,60,50,15,8901262030021,5";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trademate_sample_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // What will happen to each row, decided the same way the import itself does it.
  const matches = items.map(it => findMatchingProduct(existing, it.name || '', it.barcode));
  const newCount = matches.filter(m => !m).length;
  const mergeCount = matches.length - newCount;
  const similar = items
    .map((it, i) => ({ it, m: matches[i] }))
    .filter(x => x.m && x.m.kind === 'similar') as { it: Partial<Product>; m: { product: Product } }[];

  const handleStartImport = async () => {
    if (items.length === 0) return;

    setIsImporting(true);
    try {
      const withBarcodes = items.map(it => ({
        ...it,
        barcode: it.barcode || `BC-${Date.now()}-${Math.floor(Math.random() * 100000)}`
      }));
      // Rows that matched an existing product keep that product's barcode.
      const res = await api.bulkImportProducts(
        withBarcodes.map((it, i) => (matches[i] ? { ...it, barcode: matches[i]!.product.barcode } : it)),
        mode
      );
      setImportResult(res);
      if (file) {
        try {
          const sigs: string[] = JSON.parse(localStorage.getItem(IMPORT_SIGS_KEY) || '[]');
          localStorage.setItem(IMPORT_SIGS_KEY, JSON.stringify([...sigs, signature(file, items.length)].slice(-30)));
        } catch { /* history is best-effort */ }
      }
      onImportComplete();
    } catch (err: any) {
      setParseErrors([err.message || 'Import failed']);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <span>Bulk Product Import (Excel / CSV)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-800">Sample Product CSV</p>
              <p className="text-[10px] text-slate-500">Download formatted template with columns</p>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Sample CSV
            </button>
          </div>

          {/* File Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl text-xs inline-block">
              Choose Excel or CSV File
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
            </label>
            {file && (
              <p className="text-xs font-bold text-emerald-700 mt-2">
                Selected File: {file.name} ({items.length} products detected)
              </p>
            )}
          </div>

          {/* Preview: what this import will do, before anything is saved */}
          {items.length > 0 && !importResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
                  <div className="text-xl font-extrabold text-blue-700">{newCount}</div>
                  <div className="text-[10px] font-bold text-blue-800">New products</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                  <div className="text-xl font-extrabold text-emerald-700">{mergeCount}</div>
                  <div className="text-[10px] font-bold text-emerald-800">Already in stock (merged)</div>
                </div>
              </div>

              {seenBefore && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-amber-900 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p><strong>You imported this exact file before.</strong> Importing it again with "Add to stock" will double the quantities. Choose "Replace" if you only want to correct the stock.</p>
                </div>
              )}

              {mergeCount > 0 && (
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-700">For the {mergeCount} products already in stock:</p>
                  <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer ${mode === 'add' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                    <input type="radio" checked={mode === 'add'} onChange={() => setMode('add')} className="mt-0.5" />
                    <span><strong>Add to stock</strong> — file quantity is added on top of what you have (new purchase).</span>
                  </label>
                  <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer ${mode === 'replace' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
                    <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} className="mt-0.5" />
                    <span><strong>Replace stock</strong> — file quantity becomes the new stock (physical re-count).</span>
                  </label>
                </div>
              )}

              {similar.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <p className="font-bold text-slate-700 mb-1">{similar.length} matched by similar name (spelling/spacing differs):</p>
                  <ul className="space-y-0.5 text-[11px] text-slate-600 max-h-24 overflow-y-auto">
                    {similar.slice(0, 20).map((x, i) => (
                      <li key={i}>“{x.it.name}” → <strong className="text-slate-800">{x.m.product.name}</strong></li>
                    ))}
                  </ul>
                  {similar.length > 20 && <p className="text-[10px] text-slate-400 mt-1">…and {similar.length - 20} more</p>}
                </div>
              )}
            </div>
          )}

          {/* Import Result Feedback */}
          {importResult && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  Imported {importResult.addedCount} products
                  {importResult.newCount !== undefined ? ` (${importResult.newCount} new, ${importResult.updatedCount} updated)` : ''}!
                </span>
              </div>
              {importResult.errors.length > 0 && (
                <div className="text-[11px] text-red-600 pt-1">
                  <strong>Skipped rows / Errors:</strong>
                  <ul className="list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto">
                    {importResult.errors.map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {parseErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-red-800 text-xs">
              {parseErrors.map((e, idx) => <p key={idx}>{e}</p>)}
            </div>
          )}

          {items.length > 0 && !importResult && (
            <button
              onClick={handleStartImport}
              disabled={isImporting}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-98 disabled:opacity-50"
            >
              {isImporting ? 'Importing Products...' : `IMPORT ${items.length} PRODUCTS NOW`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
