import React, { useState } from 'react';
import { Truck, Plus, Camera, Sparkles, ChevronDown, ChevronUp, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Purchase, Supplier } from '../types';

interface PurchasesViewProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  onOpenAddStock: () => void;
  onOpenScanBill: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  suppliers,
  onOpenAddStock,
  onOpenScanBill
}) => {
  const [expandedPurchaseId, setExpandedPurchaseId] = useState<string | null>(null);

  const totalPurchaseValue = purchases.reduce((sum, p) => sum + (p.grandTotal || p.totalAmount || 0), 0);

  const toggleExpand = (id: string) => {
    setExpandedPurchaseId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4 pb-12 sm:pb-6">
      {/* Top Banner & Scanner Action */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 text-white p-5 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" /> Supplier Purchases & Inbound Stock
            </h2>
            <span className="bg-blue-500/30 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
              Auto Stock Sync
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Scan purchase bills in Hindi, Bengali, or English to instantly update inventory & create clients.
          </p>
          <div className="text-xs text-slate-400 mt-2">
            Total Inbound Purchase Value: <strong className="text-amber-400 font-extrabold text-sm">₹{(totalPurchaseValue ?? 0).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenScanBill}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer transform active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Bill with Camera (AI)</span>
            <span className="bg-emerald-800 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
              हिन्दी / বাংলা / EN
            </span>
          </button>

          <button
            onClick={onOpenAddStock}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Manual Restock
          </button>
        </div>
      </div>

      {/* List of Purchases */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Recent Supplier Bills ({purchases.length})</span>
          <span className="text-[11px] font-normal text-slate-500">Click any row to view items breakdown</span>
        </div>

        {purchases.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No Purchase Bills Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan your first wholesale invoice or purchase bill using your phone or laptop camera to update stock automatically!
            </p>
            <button
              onClick={onOpenScanBill}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Scan Purchase Bill
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {purchases.map(p => {
              const isExpanded = expandedPurchaseId === p.id;
              const totalAmt = p.grandTotal || p.totalAmount || 0;

              return (
                <div key={p.id} className="transition-colors hover:bg-slate-50/80">
                  <div
                    onClick={() => toggleExpand(p.id)}
                    className="p-4 flex items-center justify-between text-xs cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">PO #{p.purchaseNumber}</span>
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Invoice: {p.invoiceNumber || p.supplierInvoiceNo || 'N/A'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-700 mt-0.5">{p.supplierName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                          <span>• {p.items?.length || 0} items</span>
                          {p.notes && <span className="text-emerald-600 font-semibold">• {p.notes}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-base font-black text-slate-900 block">
                          ₹{(totalAmt ?? 0).toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase inline-block ${
                          p.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.paymentStatus === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {p.paymentStatus}
                        </span>
                      </div>

                      <button className="text-slate-400 p-1 hover:text-slate-700">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Items Drawer */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-slate-50/90 border-t border-slate-100 text-xs">
                      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-2">
                        <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider text-slate-500">
                          Purchased Items Breakdown
                        </div>
                        <div className="divide-y divide-slate-100">
                          {p.items?.map((item, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-slate-800 block">{item.productName}</span>
                                <span className="text-[10px] text-slate-500">
                                  Qty: {item.quantity} × ₹{item.purchasePrice || item.unitPrice}
                                </span>
                              </div>
                              <span className="font-bold text-slate-900">
                                ₹{(item.totalPrice || (item.quantity * (item.purchasePrice || item.unitPrice || 0))).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
