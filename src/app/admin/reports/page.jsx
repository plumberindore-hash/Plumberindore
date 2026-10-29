'use client';

import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  AlertTriangle,
  Download,
  IndianRupee,
  RefreshCw
} from 'lucide-react';

export default function AdminDailyReportsPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState(null);

  const fetchReport = async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?date=${date}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
      }
    } catch (err) {
      console.warn('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate]);

  const handleBroadcast = async () => {
    setBroadcasting(true);
    setBroadcastStatus(null);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastStatus({ type: 'success', text: 'Daily WhatsApp digest dispatched to Owner.' });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setBroadcastStatus({ type: 'error', text: err.message });
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#FFB21A]" />
            <span>Business Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
            Daily Hisab & Operational Report
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated closing reports, job metrics, revenue distribution, and broadcast status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB21A]"
          />

          <button
            onClick={() => fetchReport(selectedDate)}
            className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-[#F5F8FC] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleBroadcast}
            disabled={broadcasting}
            className="px-4 py-2.5 rounded-xl bg-[#0F1B33] text-white hover:bg-slate-800 text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-[#FFB21A]" />
            <span>{broadcasting ? 'Broadcasting...' : 'Send WhatsApp Digest'}</span>
          </button>
        </div>
      </div>

      {broadcastStatus && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${
          broadcastStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {broadcastStatus.text}
        </div>
      )}

      {loading ? (
        <div className="bg-white p-16 rounded-2xl border border-[#E2E8F0] text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FFB21A]" />
          <span>Generating operational report for {selectedDate}...</span>
        </div>
      ) : !report ? (
        <div className="bg-white p-16 rounded-2xl border border-[#E2E8F0] text-center text-slate-500 font-bold">
          No report data recorded for {selectedDate}.
        </div>
      ) : (
        <div className="space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">Gross Revenue</div>
              <div className="text-2xl font-black text-[#0F1B33] mt-1">
                ₹{(report.gross_revenue_paise / 100).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Total customer receipts</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <div className="text-xs font-bold text-amber-600 uppercase">Platform Take (10%)</div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                ₹{(report.commission_paise / 100).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Net platform earnings</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <div className="text-xs font-bold text-emerald-600 uppercase">Partner Payout (90%)</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                ₹{(report.worker_share_paise / 100).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Distributed to technicians</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">Completed Jobs</div>
              <div className="text-2xl font-black text-[#0F1B33] mt-1">
                {report.completed_jobs}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {report.total_jobs} total created
              </div>
            </div>
          </div>

          {/* Reconciliation Audit Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-[#0F1B33]">End of Day Reconciliation</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                report.reconciliation_status === 'RECONCILED' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {report.reconciliation_status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] text-xs">
              <div>
                <span className="text-slate-500 font-bold block mb-0.5">Payment Method Split:</span>
                <span className="font-extrabold text-slate-800">
                  Online: ₹{((report.payment_breakdown?.online_paise || 0) / 100).toLocaleString('en-IN')} • Cash: ₹{((report.payment_breakdown?.cash_paise || 0) / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-0.5">Active Technicians:</span>
                <span className="font-extrabold text-slate-800">
                  {report.active_workers_count || 0} technicians on duty
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-0.5">Closing Discrepancy:</span>
                <span className="font-extrabold text-emerald-600">
                  ₹{((report.reconciliation_diff_paise || 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
