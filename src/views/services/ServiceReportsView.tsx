import React from 'react';
import { FileText, TrendingUp, Users, Calendar, Wrench, IndianRupee } from 'lucide-react';
import { serviceStore } from '../../lib/serviceStore';
import { getServiceSectorConfig } from '../../lib/serviceSectorConfig';

export const ServiceReportsView: React.FC = () => {
  const activeSector = serviceStore.getActiveSector();
  const cfg = getServiceSectorConfig(activeSector);
  const stats = serviceStore.getStats();
  const staff = serviceStore.getStaff();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span>Service Business Analytics & Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Revenue breakdown, staff performance, AMC reports & GST summary for {cfg.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <p className="text-xs font-extrabold uppercase text-slate-400">Total Monthly Revenue</p>
          <p className="text-2xl font-black text-emerald-400">₹{stats.monthlyIncome.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400">Service POS + Direct Invoices</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <p className="text-xs font-extrabold uppercase text-slate-400">Total Outstanding Dues</p>
          <p className="text-2xl font-black text-red-400">₹{stats.outstandingPayments.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400">Pending Job Cards & Invoices</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <p className="text-xs font-extrabold uppercase text-slate-400">Average Client Rating</p>
          <p className="text-2xl font-black text-amber-400">{stats.averageRating} ★</p>
          <p className="text-[10px] text-slate-400">Feedback from {stats.completedJobsCount} completed jobs</p>
        </div>
      </div>

      {/* Staff Performance Report Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span>{cfg.staffTerm} Performance Breakdown</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="p-3">Staff Name</th>
                <th className="p-3">Specialty</th>
                <th className="p-3">Jobs Done</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Commission %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {staff.map(st => (
                <tr key={st.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">{st.name}</td>
                  <td className="p-3">{st.specialty}</td>
                  <td className="p-3 font-bold text-emerald-400">{st.totalJobsCompleted}</td>
                  <td className="p-3 font-bold text-amber-400">{st.rating} ★</td>
                  <td className="p-3 font-bold text-blue-400">{st.commissionPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
