import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Camera,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  Eye,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle2,
  Printer,
  Save,
  AlertCircle
} from 'lucide-react';
import { Purchase, Supplier, PaymentStatus } from '../types';
import { api } from '../lib/api';

interface PurchasesViewProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  onOpenAddStock: () => void;
  onOpenScanBill: () => void;
  onRefreshData?: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  suppliers,
  onOpenAddStock,
  onOpenScanBill,
  onRefreshData
}) => {
  const [expandedPurchaseId, setExpandedPurchaseId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localDeletedIds, setLocalDeletedIds] = useState<string[]>([]);

  // Modals
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [confirmDeletePurchase, setConfirmDeletePurchase] = useState<Purchase | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Edit Form Fields
  const [editSupplierName, setEditSupplierName] = useState('');
  const [editInvoiceNo, setEditInvoiceNo] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('PAID');
  const [editPaidAmount, setEditPaidAmount] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');
  const [editItems, setEditItems] = useState<any[]>([]);

  const calcPurchaseTotal = (p: Purchase) => {
    if (p.grandTotal && p.grandTotal > 0) return p.grandTotal;
    if (p.totalAmount && p.totalAmount > 0) return p.totalAmount;
    if (p.items && p.items.length > 0) {
      return p.items.reduce((sum, i) => sum + (i.totalPrice || ((i.quantity || 0) * (i.purchasePrice || i.unitPrice || 0))), 0);
    }
    return 0;
  };

  const totalPurchaseValue = purchases.reduce((sum, p) => sum + calcPurchaseTotal(p), 0);

  const toggleExpand = (id: string) => {
    setExpandedPurchaseId(prev => prev === id ? null : id);
  };

  const handleDeletePurchase = (p: Purchase) => {
    setConfirmDeletePurchase(p);
  };

  const executeDeletePurchase = async () => {
    if (!confirmDeletePurchase) return;
    const p = confirmDeletePurchase;
    setDeletingId(p.id);
    setLocalDeletedIds(prev => [...prev, p.id]);
    setConfirmDeletePurchase(null);

    try {
      await api.deletePurchase(p.id);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setLocalDeletedIds(prev => prev.filter(id => id !== p.id));
      alert(err.message || 'Failed to delete purchase bill');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenEditModal = (p: Purchase) => {
    setEditPurchase(p);
    setEditSupplierName(p.supplierName || '');
    setEditInvoiceNo(p.invoiceNumber || p.supplierInvoiceNo || '');
    setEditPaymentStatus(p.paymentStatus || 'PAID');
    setEditPaidAmount(p.paidAmount ?? calcPurchaseTotal(p));
    setEditNotes(p.notes || '');
    setEditItems(p.items ? p.items.map(i => ({ ...i })) : []);
  };

  const handleSaveEdit = async () => {
    if (!editPurchase) return;
    setSavingEdit(true);

    try {
      const calculatedGrandTotal = editItems.reduce(
        (sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.purchasePrice || item.unitPrice) || 0)),
        0
      );

      const updatedPayload: Partial<Purchase> = {
        supplierName: editSupplierName,
        invoiceNumber: editInvoiceNo,
        supplierInvoiceNo: editInvoiceNo,
        paymentStatus: editPaymentStatus,
        paidAmount: Number(editPaidAmount),
        grandTotal: calculatedGrandTotal,
        totalAmount: calculatedGrandTotal,
        notes: editNotes,
        items: editItems.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          purchasePrice: Number(item.purchasePrice || item.unitPrice) || 0,
          totalPrice: (Number(item.quantity) || 0) * (Number(item.purchasePrice || item.unitPrice) || 0)
        }))
      };

      await api.updatePurchase(editPurchase.id, updatedPayload);
      setEditPurchase(null);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update purchase bill');
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePrintPurchase = (p: Purchase) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalAmt = calcPurchaseTotal(p);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Bill #${p.purchaseNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; }
            .header { border-bottom: 2px solid #334155; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 20px; font-weight: 800; color: #0f172a; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
            th { text-align: left; padding: 8px; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            .total-row { font-weight: bold; font-size: 14px; background: #f8fafc; }
            .footer { margin-top: 24px; font-size: 11px; text-align: center; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">PURCHASE BILL INVOICE</div>
            <div>PO #${p.purchaseNumber} | Supplier Invoice: ${p.invoiceNumber || p.supplierInvoiceNo || 'N/A'}</div>
          </div>
          <div class="info-grid">
            <div><strong>Supplier:</strong> ${p.supplierName}</div>
            <div><strong>Date:</strong> ${p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'N/A'}</div>
            <div><strong>Payment Status:</strong> ${p.paymentStatus}</div>
            <div><strong>Paid Amount:</strong> ₹${(p.paidAmount ?? totalAmt).toLocaleString('en-IN')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${p.items?.map(i => `
                <tr>
                  <td>${i.productName}</td>
                  <td>${i.quantity}</td>
                  <td>₹${i.purchasePrice || i.unitPrice}</td>
                  <td style="text-align: right;">₹${(i.totalPrice || (i.quantity * (i.purchasePrice || i.unitPrice || 0))).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">Grand Total:</td>
                <td style="text-align: right;">₹${totalAmt.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          ${p.notes ? `<p style="font-size:12px; margin-top:12px;"><strong>Notes:</strong> ${p.notes}</p>` : ''}
          <div class="footer">KiranaMate Inventory & POS - Verified Record</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredPurchases = purchases
    .filter(p => !localDeletedIds.includes(p.id))
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (p.purchaseNumber && p.purchaseNumber.toLowerCase().includes(q)) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(q)) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q)) ||
        (p.supplierInvoiceNo && p.supplierInvoiceNo.toLowerCase().includes(q))
      );
    });

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

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by PO number, supplier name or invoice number..."
          className="w-full bg-transparent text-xs border-none focus:outline-none text-slate-800 placeholder-slate-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* List of Purchases */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Recent Supplier Bills ({filteredPurchases.length})</span>
          <span className="text-[11px] font-normal text-slate-500">View, edit, or delete purchase records</span>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {search ? 'No purchase bills match your search query' : 'No Purchase Bills Recorded Yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan your wholesale invoice or purchase bill using your phone or laptop camera to update stock automatically!
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
            {filteredPurchases.map(p => {
              const isExpanded = expandedPurchaseId === p.id;
              const totalAmt = calcPurchaseTotal(p);

              return (
                <div key={p.id} className="transition-colors hover:bg-slate-50/80">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-sm">PO #{p.purchaseNumber}</span>
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Invoice: {p.invoiceNumber || p.supplierInvoiceNo || 'N/A'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">{p.supplierName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                          <span>• {p.items?.length || 0} items</span>
                          {p.notes && <span className="text-emerald-600 font-semibold">• {p.notes}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
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

                      {/* Explicit Action Buttons: View, Edit, Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewPurchase(p)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                          title="View Bill Details"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                          title="Edit Purchase Bill"
                        >
                          <Edit2 className="w-4 h-4 text-amber-600" />
                        </button>

                        <button
                          onClick={() => handleDeletePurchase(p)}
                          disabled={deletingId === p.id}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Purchase Bill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleExpand(p.id)}
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                          title="Toggle Items Breakdown"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
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

      {/* VIEW PURCHASE DETAIL MODAL */}
      {viewPurchase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">Purchase Bill PO #{viewPurchase.purchaseNumber}</h3>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    viewPurchase.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {viewPurchase.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Supplier: <strong className="text-slate-800">{viewPurchase.supplierName}</strong></p>
                <p className="text-[11px] text-slate-400">
                  Invoice No: {viewPurchase.invoiceNumber || viewPurchase.supplierInvoiceNo || 'N/A'} • Date: {viewPurchase.createdAt ? new Date(viewPurchase.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setViewPurchase(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Item Details ({viewPurchase.items?.length || 0})</div>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 divide-y divide-slate-200">
                {viewPurchase.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{item.productName}</div>
                      <div className="text-[10px] text-slate-500">Rate: ₹{item.purchasePrice || item.unitPrice} | Qty: {item.quantity}</div>
                    </div>
                    <div className="font-black text-slate-900">
                      ₹{(item.totalPrice || (item.quantity * (item.purchasePrice || item.unitPrice || 0))).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100 space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Grand Total:</span>
                  <span className="text-base font-black text-blue-900">₹{calcPurchaseTotal(viewPurchase).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Paid Amount:</span>
                  <span className="font-bold text-emerald-700">₹{(viewPurchase.paidAmount ?? calcPurchaseTotal(viewPurchase)).toLocaleString('en-IN')}</span>
                </div>
                {viewPurchase.notes && (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-blue-200/60">
                    <strong>Notes:</strong> {viewPurchase.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => handlePrintPurchase(viewPurchase)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Download
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const p = viewPurchase;
                    setViewPurchase(null);
                    handleDeletePurchase(p);
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>

                <button
                  onClick={() => {
                    const p = viewPurchase;
                    setViewPurchase(null);
                    handleOpenEditModal(p);
                  }}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  onClick={() => setViewPurchase(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PURCHASE MODAL */}
      {editPurchase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-black text-slate-900">Edit Purchase Bill #{editPurchase.purchaseNumber}</h3>
              </div>
              <button
                onClick={() => setEditPurchase(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={editSupplierName}
                  onChange={(e) => setEditSupplierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Invoice / Bill No</label>
                  <input
                    type="text"
                    value={editInvoiceNo}
                    onChange={(e) => setEditInvoiceNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  value={editPaidAmount}
                  onChange={(e) => setEditPaidAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-emerald-700"
                />
              </div>

              {/* Items List inside Edit Modal */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Items & Quantities</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50">
                  {editItems.map((item, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                      <div className="font-bold text-slate-800 text-[11px] truncate flex-1">{item.productName}</div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400">Qty:</span>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: val } : it));
                          }}
                          className="w-16 bg-slate-100 border border-slate-300 rounded-md px-1.5 py-1 text-center text-xs font-bold"
                        />
                        <span className="text-[10px] text-slate-400">Rate: ₹</span>
                        <input
                          type="number"
                          value={item.purchasePrice || item.unitPrice || 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, purchasePrice: val, unitPrice: val } : it));
                          }}
                          className="w-20 bg-slate-100 border border-slate-300 rounded-md px-1.5 py-1 text-center text-xs font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes / Remarks</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Optional purchase notes..."
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setEditPurchase(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE PURCHASE MODAL */}
      {confirmDeletePurchase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Purchase Bill?</h3>
                <p className="text-xs text-slate-500">PO #{confirmDeletePurchase.purchaseNumber} • {confirmDeletePurchase.supplierName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              Are you sure you want to delete purchase bill <strong>PO #{confirmDeletePurchase.purchaseNumber}</strong>? This action cannot be undone and will update your local records.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmDeletePurchase(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDeletePurchase}
                disabled={deletingId === confirmDeletePurchase.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {deletingId === confirmDeletePurchase.id ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
