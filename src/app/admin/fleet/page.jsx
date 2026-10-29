'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  AlertTriangle, 
  PlusCircle, 
  ExternalLink, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Send, 
  X,
  Slash,
  ArrowUpDown,
  Wallet
} from 'lucide-react';
import { formatPaise } from '../../../lib/partner-engine/money.js';
import { createClient } from '../../../lib/supabase/client.js';

const AREA_FILTERS = [
  'All Areas',
  'Vijay Nagar',
  'Palasia',
  'Bhanwarkuan',
  'Rau',
  'Scheme No. 54',
  'Scheme No. 78',
  'Sudama Nagar'
];

export default function LiveFleetPage() {
  const supabase = createClient();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // ALL, ONLINE_FREE, BUSY, OFFLINE, LOW_WALLET, SUSPENDED
  const [sortBy, setSortBy] = useState('status'); // status, wallet_desc, wallet_asc, jobs_today
  const [searchQuery, setSearchQuery] = useState('');

  // Recharge Modal State
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [rechargeAmount, setRechargeAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [rechargeNotes, setRechargeNotes] = useState('');
  const [submittingRecharge, setSubmittingRecharge] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedArea !== 'All Areas') params.set('locality', selectedArea);
      if (selectedStatus !== 'ALL' && selectedStatus !== 'LOW_WALLET') params.set('status', selectedStatus);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/fleet?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.workers) {
        setWorkers(data.workers);
      }
    } catch (err) {
      console.warn('Failed to fetch fleet:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedArea, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Realtime Supabase Subscription
  useEffect(() => {
    const channel = supabase
      .channel('partner-engine-fleet')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
        fetchWorkers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'worker_presence' }, () => {
        fetchWorkers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchWorkers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchWorkers]);

  const handleOpenRecharge = (worker) => {
    setSelectedWorker(worker);
    setRechargeAmount('500');
    setPaymentMethod('Cash');
    setRechargeNotes('');
    setFeedback(null);
    setRechargeModalOpen(true);
  };

  const handleConfirmRecharge = async (e) => {
    e.preventDefault();
    if (!selectedWorker) return;
    setSubmittingRecharge(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: selectedWorker.id,
          amountRupees: parseFloat(rechargeAmount),
          paymentMethod,
          notes: rechargeNotes
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || data.message || 'Recharge failed');
      }

      setFeedback({ type: 'success', message: `₹${rechargeAmount} recharged to ${selectedWorker.name}'s wallet!` });
      setTimeout(() => {
        setRechargeModalOpen(false);
        fetchWorkers();
      }, 800);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmittingRecharge(false);
    }
  };

  // Filter & Sort
  let displayedWorkers = workers.filter(w => {
    if (selectedStatus === 'LOW_WALLET') {
      return Number(w.wallet_balance_paise || 0) < 10000;
    }
    if (selectedStatus === 'SUSPENDED') {
      return w.status === 'SUSPENDED' || w.is_suspended;
    }
    if (selectedStatus !== 'ALL') {
      return w.status === selectedStatus;
    }
    return true;
  });

  if (sortBy === 'wallet_desc') {
    displayedWorkers = [...displayedWorkers].sort((a, b) => Number(b.wallet_balance_paise || 0) - Number(a.wallet_balance_paise || 0));
  } else if (sortBy === 'wallet_asc') {
    displayedWorkers = [...displayedWorkers].sort((a, b) => Number(a.wallet_balance_paise || 0) - Number(b.wallet_balance_paise || 0));
  } else if (sortBy === 'jobs_today') {
    displayedWorkers = [...displayedWorkers].sort((a, b) => (b.today_jobs_count || 0) - (a.today_jobs_count || 0));
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-Time Fleet Radar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
            Live Worker Fleet
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor technician availability, doorstep locations, and active balances across Indore.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchWorkers}
            className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-[#F5F8FC] transition-colors"
            title="Refresh Fleet"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/jobs"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20"
          >
            <Send className="w-4 h-4 fill-current" />
            <span>Dispatch Job</span>
          </Link>
        </div>
      </div>

      {/* 2. Area Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {AREA_FILTERS.map((area) => (
          <button
            key={area}
            onClick={() => setSelectedArea(area)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedArea === area
                ? 'bg-[#0F1B33] text-white shadow-sm'
                : 'bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* 3. Search, Status, and Sort Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search technician by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F5F8FC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB21A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'ALL', label: `All (${workers.length})` },
            { id: 'ONLINE_FREE', label: 'Online' },
            { id: 'BUSY', label: 'Busy' },
            { id: 'OFFLINE', label: 'Offline' },
            { id: 'LOW_WALLET', label: 'Low Wallet' },
            { id: 'SUSPENDED', label: 'Suspended' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedStatus === st.id ? 'bg-[#0F1B33] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none border-none py-1"
            >
              <option value="status">Sort: Status</option>
              <option value="wallet_desc">Wallet (High to Low)</option>
              <option value="wallet_asc">Wallet (Low to High)</option>
              <option value="jobs_today">Jobs Today</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Worker Fleet Grid / Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F5F8FC] border-b border-[#E2E8F0] text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Technician</th>
                <th className="py-3.5 px-4">Locality</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Wallet Balance</th>
                <th className="py-3.5 px-4">Today's Jobs</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {displayedWorkers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No technicians matching selected criteria.
                  </td>
                </tr>
              ) : (
                displayedWorkers.map((worker) => {
                  const isLow = Number(worker.wallet_balance_paise || 0) < 10000;
                  const isSuspended = worker.status === 'SUSPENDED' || worker.is_suspended;

                  return (
                    <tr key={worker.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Phone */}
                      <td className="py-4 px-4 sm:px-6">
                        <Link href={`/admin/workers/${worker.id}`} className="font-bold text-slate-900 text-sm hover:underline hover:text-blue-600 block">
                          {worker.name}
                        </Link>
                        <div className="text-slate-500 flex items-center gap-1 font-mono text-xs mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{worker.phone}</span>
                        </div>
                      </td>

                      {/* Locality */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>{worker.locality}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            <Slash className="w-3 h-3 text-red-500" />
                            <span>Suspended</span>
                          </span>
                        ) : worker.status === 'ONLINE_FREE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Online (Free)</span>
                          </span>
                        ) : worker.status === 'BUSY' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Busy (On Job)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span>Offline</span>
                          </span>
                        )}
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${
                            isLow ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            {formatPaise(worker.wallet_balance_paise)}
                          </span>

                          {isLow && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded" title="Recharge required before accepting new jobs">
                              <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                              <span>Recharge Required</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Today's Jobs */}
                      <td className="py-4 px-4 font-bold text-slate-700">
                        {worker.today_jobs_count || 0} jobs
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenRecharge(worker)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors border border-emerald-200/60"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Recharge</span>
                          </button>

                          <Link
                            href={`/admin/workers/${worker.id}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                          >
                            Profile
                          </Link>

                          {/* Quick Partner Link preview */}
                          <Link
                            href={`/partner/${worker.token || (worker.name?.toLowerCase().includes('suresh') ? 'suresh_8821' : 'ramesh_4821')}`}
                            target="_blank"
                            title="Open Mobile Console"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F1B33] hover:bg-slate-100 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Recharge Modal */}
      {rechargeModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0F1B33]">Recharge Worker Wallet</h3>
                <p className="text-xs text-slate-500 mt-0.5">Technician: <strong>{selectedWorker.name}</strong></p>
              </div>
              <button 
                onClick={() => setRechargeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRecharge} className="mt-4 space-y-4">
              {feedback && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recharge Amount (INR) *
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['200', '500', '1000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-lg border ${
                        rechargeAmount === amt
                          ? 'bg-[#0F1B33] text-white border-[#0F1B33]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="50"
                  step="10"
                  required
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="Cash">Cash at Office</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reference Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Received via Cash / UPI ref"
                  value={rechargeNotes}
                  onChange={(e) => setRechargeNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRechargeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecharge}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submittingRecharge ? 'Crediting...' : 'Confirm Recharge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
