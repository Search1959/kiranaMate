import React, { useState } from 'react';
import { FileText, Plus, ArrowRight, CheckCircle, Wrench, IndianRupee } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { ServiceQuotation } from '../../types';

export const ServiceQuotationsView: React.FC = () => {
  const activeSector = serviceStore.getActiveSector();
  const cfg = getServiceSectorConfig(activeSector);
  const quotations = serviceStore.getQuotations();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [custName, setCustName] = useState<string>('');
  const [custMobile, setCustMobile] = useState<string>('');
  const [serviceCharge, setServiceCharge] = useState<number>(1500);
  const [materialCharge, setMaterialCharge] = useState<number>(500);

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custMobile) {
      alert("Please enter customer name and mobile");
      return;
    }
    const tot = serviceCharge + materialCharge;
    const gst = Math.round(tot * 0.18);

    serviceStore.createQuotation({
      customerId: `scust-${Date.now()}`,
      customerName: custName,
      mobile: custMobile,
      date: new Date().toISOString().split('T')[0],
      validUntil: '2026-08-30',
      items: [
        { id: 'q1', name: `${cfg.name} Execution Fee`, type: 'SERVICE', price: serviceCharge, quantity: 1, total: serviceCharge },
        ...(materialCharge > 0 ? [{ id: 'q2', name: 'Spare Parts & Consumables', type: 'MATERIAL' as const, price: materialCharge, quantity: 1, total: materialCharge }] : [])
      ],
      labourCharges: serviceCharge,
      materialCharges: materialCharge,
      discount: 0,
      gstAmount: gst,
      grandTotal: tot + gst,
      status: 'Sent'
    });

    setShowModal(false);
    setCustName('');
    setCustMobile('');
  };

  const handleConvertToJob = (qId: string) => {
    serviceStore.convertQuotationToJobCard(qId);
    alert("Quotation converted to Job Card successfully!");
  };

  const handleConvertToInvoice = (qId: string) => {
    serviceStore.convertQuotationToInvoice(qId);
    alert("Quotation converted to Paid Invoice successfully!");
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Service Quotations & Estimates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Generate estimates & 1-click convert to Work Order or GST Invoice for {cfg.name}</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Quotation</span>
        </button>
      </div>

      <div className="space-y-3">
        {quotations.map(q => (
          <div key={q.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-blue-400">{q.quoteNo}</span>
                <span className="text-[10px] text-slate-400">{q.date}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  q.status.includes('Converted') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {q.status}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mt-1">{q.customerName} ({q.mobile})</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400">Estimate Total</p>
                <p className="text-sm font-black text-emerald-400">₹{q.grandTotal}</p>
              </div>

              {!q.status.includes('Converted') && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleConvertToJob(q.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Convert to Job</span>
                  </button>
                  <button
                    onClick={() => handleConvertToInvoice(q.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Convert to Invoice</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateQuotation} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-white">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Create Estimate Quotation</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="Client Name"
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mobile</label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={custMobile}
                  onChange={e => setCustMobile(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Labour Charge (₹)</label>
                  <input
                    type="number"
                    value={serviceCharge}
                    onChange={e => setServiceCharge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Material Charge (₹)</label>
                  <input
                    type="number"
                    value={materialCharge}
                    onChange={e => setMaterialCharge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30"
              >
                Generate Estimate
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
