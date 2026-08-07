import React, { useState } from 'react';
import { IndianRupee, Plus, CreditCard, Search } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';
import { PaymentMethod } from '../../types';

export const ServicePaymentsView: React.FC = () => {
  const activeSector = serviceStore.getActiveSector();
  const cfg = getServiceSectorConfig(activeSector);
  const payments = serviceStore.getPayments();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [custName, setCustName] = useState<string>('');
  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || amount <= 0) {
      alert("Please enter customer name and valid amount");
      return;
    }

    serviceStore.addPayment({
      customerId: `scust-${Date.now()}`,
      customerName: custName,
      amount,
      date: new Date().toISOString().split('T')[0],
      method,
      notes
    });

    setShowModal(false);
    setCustName('');
    setNotes('');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>Service Payments & Receipts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Collect outstanding dues, advance deposits & payment logs for {cfg.name}</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Payment Received</span>
        </button>
      </div>

      <div className="space-y-3">
        {payments.map(p => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-400">{p.receiptNo}</span>
                <span className="text-[10px] text-slate-400">{p.date}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                  {p.method}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mt-1">{p.customerName}</h3>
              {p.notes && <p className="text-[10px] text-slate-400">{p.notes}</p>}
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-emerald-400">+ ₹{p.amount}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRecordPayment} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-white">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Record Payment Collection</span>
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Method</label>
                  <select
                    value={method}
                    onChange={e => setMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="OTHER">Card / Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notes / Ref #</label>
                <input
                  type="text"
                  placeholder="Txn ID / Remark..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
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
                className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30"
              >
                Save Receipt
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
