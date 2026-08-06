import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import Papa from 'papaparse';
import { api } from '../lib/api';
import { Product } from '../types';

interface BulkProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const BulkProductImportModal: React.FC<BulkProductImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ addedCount: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseErrors([]);
    setImportResult(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedRows(results.data);
      },
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
    link.setAttribute("download", "kiranamate_sample_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartImport = async () => {
    if (parsedRows.length === 0) return;

    setIsImporting(true);
    try {
      const formattedProducts: Partial<Product>[] = parsedRows.map(row => ({
        name: row['Product Name'] || row['name'] || row['Product'],
        category: row['Category'] || row['category'] || 'Other',
        brand: row['Brand'] || row['brand'] || 'General',
        unit: row['Unit'] || row['unit'] || 'pkt',
        sellingPrice: Number(row['Selling Price'] || row['sellingPrice'] || row['Price'] || 0),
        mrp: Number(row['MRP'] || row['mrp'] || row['Selling Price'] || 0),
        purchasePrice: Number(row['Purchase Price'] || row['purchasePrice'] || 0),
        currentStock: Number(row['Stock'] || row['currentStock'] || 10),
        minStock: Number(row['Min Stock'] || row['minStock'] || 5),
        barcode: row['Barcode'] || row['barcode'] || `BC-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      }));

      const res = await api.bulkImportProducts(formattedProducts);
      setImportResult(res);
      onImportComplete();
    } catch (err: any) {
      setParseErrors([err.message || 'Import failed']);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
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
              Choose CSV File
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
            {file && (
              <p className="text-xs font-bold text-emerald-700 mt-2">
                Selected File: {file.name} ({parsedRows.length} rows detected)
              </p>
            )}
          </div>

          {/* Import Result Feedback */}
          {importResult && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Successfully Imported {importResult.addedCount} Products!</span>
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

          {parsedRows.length > 0 && !importResult && (
            <button
              onClick={handleStartImport}
              disabled={isImporting}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-98 disabled:opacity-50"
            >
              {isImporting ? 'Importing Products...' : `IMPORT ${parsedRows.length} PRODUCTS NOW`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
