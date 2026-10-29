'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Send, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  X, 
  Wrench,
  ShieldCheck,
  ChevronRight,
  Flame,
  Check,
  Slash,
  MessageSquare,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { formatPaise } from '../../../lib/partner-engine/money.js';
import { INDORE_LOCALITIES, SERVICE_CATEGORIES } from '../../../lib/partner-engine/constants.js';
import { createClient } from '../../../lib/supabase/client.js';

export default function JobsDispatchPage() {
  const supabase = createClient();
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dispatch Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerWhatsapp: '',
    locality: 'Vijay Nagar',
    address: '',
    issue: 'Tap leak + mixer problem',
    serviceCategory: 'Plumber',
    priority: 'Normal',
    preferredTime: 'Immediate',
    notes: '',
    preferredWorkerId: ''
  });

  // Reassign / Cancel Modals
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [activeJobForAction, setActiveJobForAction] = useState(null);
  const [selectedNewWorkerId, setSelectedNewWorkerId] = useState('');
  const [reassignReason, setReassignReason] = useState('Dispatcher reassignment');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('CUSTOMER_CANCELLED');

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, fleetRes] = await Promise.all([
        fetch(`/api/admin/jobs?status=${statusFilter}`).then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/fleet').then(r => r.json()).catch(() => ({}))
      ]);

      if (jobsRes?.jobs) setJobs(jobsRes.jobs);
      if (fleetRes?.workers) setWorkers(fleetRes.workers);
    } catch (err) {
      console.warn('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('partner-engine-jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, supabase]);

  // Technicians eligible for assignment: ONLINE_FREE + wallet >= 10,000 paise (₹100) + active
  const availableWorkers = workers.filter(w => 
    w.status === 'ONLINE_FREE' && 
    w.is_active !== false && 
    !w.is_suspended &&
    Number(w.wallet_balance_paise || 0) >= 10000
  );

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to dispatch job');
      }

      setFeedback({ type: 'success', message: 'Job created & assigned successfully!' });
      setTimeout(() => {
        setIsDispatchModalOpen(false);
        setFormData({
          customerName: '',
          customerPhone: '',
          customerWhatsapp: '',
          locality: 'Vijay Nagar',
          address: '',
          issue: 'Tap leak + mixer problem',
          serviceCategory: 'Plumber',
          priority: 'Normal',
          preferredTime: 'Immediate',
          notes: '',
          preferredWorkerId: ''
        });
        fetchData();
      }, 800);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!activeJobForAction || !selectedNewWorkerId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/jobs/${activeJobForAction.id}/reassign`, {
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
        setActiveJobForAction(null);
        fetchData();
      } else {
        alert(data.message || data.error || 'Reassignment failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!activeJobForAction) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/jobs/${activeJobForAction.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      if (data.success) {
        setCancelModalOpen(false);
        setActiveJobForAction(null);
        fetchData();
      } else {
        alert(data.message || data.error || 'Cancellation failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Send className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Field Job Dispatch Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
            Jobs & Dispatch Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create customer orders, auto-match available technicians, and track execution lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-[#F5F8FC] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setFeedback(null);
              setIsDispatchModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Dispatch New Job</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {[
          { id: 'ALL', label: 'All Jobs' },
          { id: 'ASSIGNED', label: 'Assigned' },
          { id: 'IN_PROGRESS', label: 'In Progress' },
          { id: 'PAYMENT_PENDING', label: 'Payment Pending' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'CANCELLED', label: 'Cancelled' }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === filter.id
                ? 'bg-[#0F1B33] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F0] text-slate-600 hover:bg-[#F5F8FC]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 3. Job Cards Feed */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FFB21A]" />
            <span>Loading active jobs...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center space-y-3">
            <p className="text-slate-500 font-medium text-sm">No jobs match this filter.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const assignedTech = job.assigned_worker || workers.find(w => w.id === job.assigned_worker_id);
            const isCompleted = job.status === 'COMPLETED';
            const isCancelled = job.status === 'CANCELLED';
            const isUncompleted = !isCompleted && !isCancelled;

            const isUrgent = job.priority?.toUpperCase() === 'URGENT' || job.priority?.toUpperCase() === 'EMERGENCY';
            const isHigh = job.priority?.toUpperCase() === 'HIGH';

            return (
              <div 
                key={job.id} 
                className={`bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isUrgent ? 'ring-2 ring-rose-400/40' : ''
                }`}
              >
                {/* Left: Job & Customer Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/jobs/${job.id}`} className="font-mono text-sm font-extrabold text-[#0F1B33] hover:underline flex items-center gap-1">
                      <span>#{job.job_number}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      isCancelled ? 'bg-slate-100 text-slate-600' :
                      job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'PAYMENT_PENDING' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {job.status?.replace('_', ' ')}
                    </span>

                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      isUrgent ? 'bg-rose-100 text-rose-800 animate-pulse' :
                      isHigh ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {job.priority || 'Normal'}
                    </span>

                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 capitalize">{job.service_category || 'Plumber'}</span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.customer_name}</span>
                    </div>
                    <div className="font-mono text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.customer_phone}</span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.locality}, Indore</span>
                    </div>
                  </div>

                  {/* Issue description */}
                  <div className="text-xs text-slate-700 bg-[#F5F8FC] p-2.5 rounded-xl border border-slate-200">
                    <strong className="text-slate-900">Issue:</strong> {job.issue}
                  </div>

                  {/* Quick Customer Communication */}
                  <div className="flex items-center gap-2 pt-1 text-xs font-bold">
                    <a
                      href={`tel:${job.customer_phone}`}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Customer</span>
                    </a>
                    <a
                      href={`https://wa.me/${(job.customer_whatsapp || job.customer_phone).replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(job.customer_name)},%20regarding%20your%20PlumberIndore%20booking%20#${job.job_number}...`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Middle: Assigned Technician */}
                <div className="w-full lg:w-56 bg-[#F5F8FC] p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Assigned Technician
                  </div>
                  {assignedTech ? (
                    <div>
                      <Link href={`/admin/workers/${assignedTech.id}`} className="font-bold text-slate-900 hover:underline flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{assignedTech.name}</span>
                      </Link>
                      <div className="text-slate-500 font-mono mt-0.5">{assignedTech.phone}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>Wallet: <strong>{formatPaise(assignedTech.wallet_balance_paise)}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-700 font-semibold py-1">
                      ⚠️ Unassigned
                    </div>
                  )}
                </div>

                {/* Right: Price & Operational Controls */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                  <div className="text-left lg:text-right">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Amount</div>
                    <div className="text-lg sm:text-xl font-black font-mono text-slate-900">
                      {formatPaise(job.total_paise)}
                    </div>
                    {job.waiver_paise > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Inspection ₹299 Waived
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      Details
                    </Link>

                    {isUncompleted && (
                      <>
                        <button
                          onClick={() => {
                            setActiveJobForAction(job);
                            setSelectedNewWorkerId('');
                            setReassignReason('Dispatcher reassignment');
                            setReassignModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition-colors"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => {
                            setActiveJobForAction(job);
                            setCancelReason('CUSTOMER_CANCELLED');
                            setCancelModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 4. DISPATCH NEW JOB MODAL */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-[#0F1B33]">Dispatch Customer Order</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct assignment to available Indore technicians.
                </p>
              </div>
              <button 
                onClick={() => setIsDispatchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="mt-4 space-y-4">
              {feedback && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Customer Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Customer WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Leave blank to use mobile"
                    value={formData.customerWhatsapp}
                    onChange={(e) => setFormData({ ...formData, customerWhatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Preferred Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Immediate, Today 4 PM"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>
              </div>

              {/* Locality & Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Locality Dropdown *
                  </label>
                  <select
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none bg-white"
                  >
                    {INDORE_LOCALITIES.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none bg-white font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (Active Leak)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.serviceCategory}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none bg-white"
                  >
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Doorstep Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 302, Royal Palms, Behind C21 Mall"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                />
              </div>

              {/* Issue Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reported Issue *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe problem (e.g. Wall mixer dripping, needs seal change)"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                />
              </div>

              {/* Eligible Technicians Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assign Available Technician (Only Eligible Shown)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-[#F5F8FC] rounded-xl border border-slate-200">
                  <div 
                    onClick={() => setFormData({ ...formData, preferredWorkerId: '' })}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      formData.preferredWorkerId === '' 
                        ? 'bg-[#0F1B33] text-white border-[#0F1B33]' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Leave Unassigned</div>
                    <div className="text-[11px] opacity-80">Technicians claim via first-to-claim</div>
                  </div>

                  {availableWorkers.map(w => (
                    <div 
                      key={w.id}
                      onClick={() => setFormData({ ...formData, preferredWorkerId: w.id })}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        formData.preferredWorkerId === w.id 
                          ? 'bg-[#0F1B33] text-white border-[#0F1B33]' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{w.name}</span>
                        <span className="font-mono text-emerald-500 font-bold">{formatPaise(w.wallet_balance_paise)}</span>
                      </div>
                      <div className="text-[11px] opacity-80 flex items-center justify-between mt-1">
                        <span>{w.locality}</span>
                        <span>ONLINE_FREE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-sm flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>{submitting ? 'Dispatching...' : 'Confirm Job Dispatch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSIGN MODAL */}
      {reassignModalOpen && activeJobForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0F1B33]">Reassign Job #{activeJobForAction.job_number}</h3>
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
                  {availableWorkers.filter(w => w.id !== activeJobForAction.assigned_worker_id).map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.locality}) — Wallet {formatPaise(w.wallet_balance_paise)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reassignment Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Previous tech vehicle issue / delay"
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
                  disabled={submitting || !selectedNewWorkerId}
                  className="px-5 py-2 bg-[#FFB21A] text-[#0F1B33] font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModalOpen && activeJobForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0F1B33]">Cancel Job #{activeJobForAction.job_number}</h3>
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
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
