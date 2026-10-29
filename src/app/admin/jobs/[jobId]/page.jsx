'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  Wrench, 
  Wallet, 
  Receipt, 
  Printer, 
  Slash, 
  RefreshCw,
  AlertCircle,
  MessageSquare,
  X,
  ShieldCheck
} from 'lucide-react';
import { formatPaise } from '@/lib/partner-engine/money.js';

export default function AdminJobDetailPage({ params }) {
  const { jobId } = params;

  const [job, setJob] = useState(null);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Modals
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedNewWorkerId, setSelectedNewWorkerId] = useState('');
  const [reassignReason, setReassignReason] = useState('Dispatcher reassignment');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('CUSTOMER_CANCELLED');

  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchJobData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobRes, fleetRes] = await Promise.all([
        fetch(`/api/admin/jobs/${jobId}`).then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/fleet').then(r => r.json()).catch(() => ({}))
      ]);

      if (jobRes?.job) setJob(jobRes.job);
      if (fleetRes?.workers) setFleet(fleetRes.workers);
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJobData();
  }, [fetchJobData]);

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNewWorkerId) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newWorkerId: selectedNewWorkerId,
          reason: reassignReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setReassignModalOpen(false);
        setActionFeedback({ type: 'success', text: 'Job successfully reassigned.' });
        fetchJobData();
      } else {
        setActionFeedback({ type: 'error', text: data.message || data.error || 'Reassignment failed' });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      if (data.success) {
        setCancelModalOpen(false);
        setActionFeedback({ type: 'success', text: 'Job cancelled.' });
        fetchJobData();
      } else {
        setActionFeedback({ type: 'error', text: data.message || data.error || 'Cancellation failed' });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#FFB21A] animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <Link href="/admin/jobs" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F1B33] text-white rounded-xl font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>
    );
  }

  const isCompleted = job.status === 'COMPLETED';
  const isCancelled = job.status === 'CANCELLED';
  const isUncompleted = !isCompleted && !isCancelled;
  const eligibleWorkers = fleet.filter(w => w.status === 'ONLINE_FREE' && w.id !== job.assigned_worker_id && Number(w.wallet_balance_paise || 0) >= 10000);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/admin/jobs" className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">#{job.job_number}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                job.status === 'CANCELLED' ? 'bg-slate-100 text-slate-700' :
                job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {job.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F1B33] mt-0.5">{job.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isUncompleted && (
            <>
              <button
                onClick={() => setReassignModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Reassign Tech
              </button>
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
              >
                Cancel Job
              </button>
            </>
          )}

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 transition-colors"
            title="Print Job Docket"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className={`p-4 rounded-xl text-xs font-bold ${
          actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {actionFeedback.text}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Job & Service Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer & Location */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#0F1B33] uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#F59E0B]" />
              <span>Customer Premise Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer Name</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{job.customer_name}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Contact Phone</span>
                <a href={`tel:${job.customer_phone}`} className="font-mono font-bold text-blue-600 text-sm mt-0.5 block hover:underline">
                  {job.customer_phone}
                </a>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-medium">Doorstep Address</span>
                <span className="font-medium text-slate-800 mt-0.5 block leading-relaxed">{job.address}</span>
                <div className="mt-1 flex items-center gap-1.5 text-slate-500 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{job.area}, Indore ({job.pincode})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items & Scope */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#0F1B33] uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#F59E0B]" />
              <span>Scope of Work & Line Items</span>
            </h3>

            <div className="divide-y divide-[#E2E8F0] border-y border-[#E2E8F0] text-xs">
              {(job.items || []).map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{it.name}</span>
                    <span className="text-slate-400 font-mono text-[11px] ml-2">x{it.qty || 1}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatPaise(it.price_paise)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm pt-2">
              <span className="font-bold text-slate-600">Total Customer Due</span>
              <span className="font-mono font-black text-[#0F1B33] text-lg">{formatPaise(job.total_amount_paise)}</span>
            </div>
          </div>

        </div>

        {/* Right Column: Technician & Payment Settlement */}
        <div className="space-y-6">
          
          {/* Assigned Technician */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#0F1B33] uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#F59E0B]" />
              <span>Assigned Technician</span>
            </h3>

            {job.assigned_worker ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{job.assigned_worker.name}</span>
                  <a href={`tel:${job.assigned_worker.phone}`} className="font-mono text-blue-600 hover:underline">
                    {job.assigned_worker.phone}
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wallet Khata:</span>
                    <span className="font-mono font-bold text-slate-800">{formatPaise(job.assigned_worker.wallet_balance_paise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Area:</span>
                    <span className="font-bold text-slate-800">{job.assigned_worker.locality}</span>
                  </div>
                </div>

                <Link
                  href={`/admin/workers/${job.assigned_worker.id}`}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs block text-center transition-colors"
                >
                  View Technician Dossier
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <span>No technician currently assigned.</span>
              </div>
            )}
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#0F1B33] uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Doorstep Settlement</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Price</span>
                <span className="font-mono font-bold text-slate-800">{formatPaise(job.total_amount_paise)}</span>
              </div>

              <div className="flex justify-between text-amber-600">
                <span>Platform Commission (10%)</span>
                <span className="font-mono font-bold">{formatPaise(job.commission_paise)}</span>
              </div>

              <div className="flex justify-between text-emerald-600 border-t border-slate-100 pt-2 font-bold">
                <span>Technician Payout (90%)</span>
                <span className="font-mono font-black">{formatPaise(job.worker_share_paise)}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  job.payment_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                  job.payment_status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {job.payment_status || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* REASSIGN MODAL */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0F1B33]">Reassign Job #{job.job_number}</h3>
              <button onClick={() => setReassignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Available Technician</label>
                <select
                  required
                  value={selectedNewWorkerId}
                  onChange={(e) => setSelectedNewWorkerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="">-- Choose Eligible Technician --</option>
                  {eligibleWorkers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.locality}) — Wallet {formatPaise(w.wallet_balance_paise)}
                    </option>
                  ))}
                </select>
                {eligibleWorkers.length === 0 && (
                  <p className="text-[11px] text-red-600 mt-1">No free technicians with balance &ge; ₹100 found.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reassignment Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Previous tech vehicle puncture / offline"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction || !selectedNewWorkerId}
                  className="px-5 py-2 bg-[#FFB21A] text-[#0F1B33] font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submittingAction ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0F1B33]">Cancel Job #{job.job_number}</h3>
              <button onClick={() => setCancelModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cancellation Reason</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="CUSTOMER_CANCELLED">Customer Cancelled Request</option>
                  <option value="CUSTOMER_UNAVAILABLE">Customer Unavailable at Doorstep</option>
                  <option value="WRONG_ADDRESS">Wrong Address / Out of Indore Area</option>
                  <option value="TECHNICIAN_UNAVAILABLE">No Technician Available</option>
                  <option value="DUPLICATE_REQUEST">Duplicate Request</option>
                  <option value="OTHER">Other Reason</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submittingAction ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
