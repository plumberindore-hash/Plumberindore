'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  PlusCircle, 
  ExternalLink, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Wallet,
  ArrowRight,
  X,
  Clock,
  Briefcase,
  Slash,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { formatPaise } from '../../../lib/partner-engine/money.js';
import { createClient } from '../../../lib/supabase/client.js';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Fleet' },
  { id: 'ONLINE_FREE', label: 'Online' },
  { id: 'BUSY', label: 'Busy' },
  { id: 'OFFLINE', label: 'Offline' },
  { id: 'SUSPENDED', label: 'Suspended' },
  { id: 'LOW_WALLET', label: 'Low Wallet (<₹100)' }
];

export default function AdminWorkersPage() {
  const supabase = createClient();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedToken, setCopiedToken] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWorkerData, setNewWorkerData] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    locality: 'Vijay Nagar',
    assignedAreas: ['Vijay Nagar'],
    serviceCategory: 'plumber',
    serviceCategories: ['Plumber'],
    address: '',
    emergencyContact: '',
    notes: '',
    initialBalanceRupees: '500'
  });

  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [rechargeAmount, setRechargeAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [rechargeNotes, setRechargeNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/workers');
      const data = await res.json();
      if (data.success && data.workers) {
        setWorkers(data.workers);
      }
    } catch (err) {
      console.warn('Failed to fetch workers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Realtime Supabase Subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-workers-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
        fetchWorkers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'worker_tokens' }, () => {
        fetchWorkers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchWorkers]);

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkerData)
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({ type: 'success', text: `Technician "${data.worker.name}" successfully onboarded!` });
        setCreateModalOpen(false);
        setNewWorkerData({
          name: '',
          phone: '',
          whatsappNumber: '',
          email: '',
          locality: 'Vijay Nagar',
          assignedAreas: ['Vijay Nagar'],
          serviceCategory: 'plumber',
          serviceCategories: ['Plumber'],
          address: '',
          emergencyContact: '',
          notes: '',
          initialBalanceRupees: '500'
        });
        fetchWorkers();
      } else {
        setActionFeedback({ type: 'error', text: data.error || 'Failed to create worker' });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (worker) => {
    const newStatus = !worker.is_active;
    const confirmMsg = newStatus 
      ? `Reactivate technician ${worker.name}?` 
      : `Deactivate ${worker.name}? Deactivated technicians cannot receive any new jobs.`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/workers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: worker.id, isActive: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchWorkers();
        setActionFeedback({ type: 'success', text: `Status updated for ${worker.name}` });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    }
  };

  const handleSuspendWorker = async (worker) => {
    const reason = window.prompt(`Enter suspension reason for ${worker.name}:`, 'Administrative disciplinary hold');
    if (!reason) return;

    try {
      const res = await fetch(`/api/admin/workers/${worker.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        fetchWorkers();
        setActionFeedback({ type: 'success', text: `${worker.name} has been suspended.` });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    }
  };

  const handleUnsuspendWorker = async (worker) => {
    if (!window.confirm(`Reinstate ${worker.name}? A new active partner token will be generated.`)) return;

    try {
      const res = await fetch(`/api/admin/workers/${worker.id}/suspend`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchWorkers();
        setActionFeedback({ type: 'success', text: `${worker.name} reinstated.` });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    }
  };

  const handleRegenerateToken = async (worker) => {
    if (!window.confirm(`Generate a new secure partner link for ${worker.name}? Any previous link will be immediately revoked.`)) return;

    try {
      const res = await fetch(`/api/admin/workers/${worker.id}/token`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchWorkers();
        setActionFeedback({ type: 'success', text: `New link generated for ${worker.name}: /partner/${data.token}` });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    }
  };

  const handleRevokeToken = async (worker) => {
    if (!window.confirm(`Revoke partner access for ${worker.name}? The technician will be logged out immediately.`)) return;

    try {
      const res = await fetch(`/api/admin/workers/${worker.id}/token`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchWorkers();
        setActionFeedback({ type: 'success', text: `Partner access revoked for ${worker.name}` });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    }
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorker) return;
    setSubmitting(true);
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
      if (data.success) {
        setRechargeModalOpen(false);
        setActionFeedback({ type: 'success', text: `Wallet recharged by ₹${rechargeAmount} for ${selectedWorker.name}` });
        fetchWorkers();
      } else {
        setActionFeedback({ type: 'error', text: data.error || 'Recharge failed' });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (token) => {
    const fullUrl = `${window.location.origin}/partner/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const filtered = workers.filter(w => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = w.name.toLowerCase().includes(q) || w.phone.includes(q) || w.locality.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (statusFilter === 'LOW_WALLET') {
      return Number(w.wallet_balance_paise || 0) < 10000;
    }
    if (statusFilter === 'SUSPENDED') {
      return w.status === 'SUSPENDED' || w.is_suspended;
    }
    if (statusFilter !== 'ALL') {
      return w.status === statusFilter;
    }

    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F1B33] text-[#FFB21A] flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0F1B33] tracking-tight">Technician Fleet & Operations</h1>
              <p className="text-xs text-slate-500">Manage partner profiles, onboarding, credentials, and wallet health</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchWorkers()}
            className="p-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-xl text-slate-600 shadow-xs flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] hover:brightness-105 rounded-xl font-black text-xs shadow-xs flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Onboard Technician</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
          actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <span>{actionFeedback.text}</span>
          <button onClick={() => setActionFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Status Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="flex-1 bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by technician name, phone, or area..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-[#0F1B33] text-white shadow-xs'
                  : 'bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Roster Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Technician Profile</th>
                <th className="py-3.5 px-4">Locality & Category</th>
                <th className="py-3.5 px-4">Fleet Status</th>
                <th className="py-3.5 px-4">Prepaid Wallet</th>
                <th className="py-3.5 px-4">Partner Console Access</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FFB21A]" />
                    <span>Loading verified fleet...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No technicians matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((worker) => {
                  const isLow = Number(worker.wallet_balance_paise || 0) < 10000;
                  const isBusy = worker.status === 'BUSY';
                  const isOffline = worker.status === 'OFFLINE';
                  const isSuspended = worker.status === 'SUSPENDED' || worker.is_suspended;
                  const isDeactivated = !worker.is_active;

                  return (
                    <tr key={worker.id} className={`hover:bg-slate-50/70 transition-colors ${isDeactivated || isSuspended ? 'opacity-70 bg-slate-50/40' : ''}`}>
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <Link href={`/admin/workers/${worker.id}`} className="font-extrabold text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-2">
                          <span>{worker.name}</span>
                          {isSuspended ? (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                              SUSPENDED
                            </span>
                          ) : isDeactivated ? (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              DEACTIVATED
                            </span>
                          ) : null}
                        </Link>
                        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{worker.phone}</span>
                        </div>
                      </td>

                      {/* Locality & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{worker.locality}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize mt-0.5">
                          {worker.service_category || 'Plumber'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <Slash className="w-3 h-3 text-red-500" />
                            <span>Suspended</span>
                          </span>
                        ) : isBusy ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Busy on Job</span>
                          </span>
                        ) : isOffline ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Offline</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Online Free</span>
                          </span>
                        )}
                      </td>

                      {/* Wallet */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                            {formatPaise(worker.wallet_balance_paise)}
                          </span>
                          {isLow && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                              Low (&lt;₹100)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedWorker(worker);
                            setRechargeAmount('500');
                            setRechargeModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline mt-0.5"
                        >
                          + Quick Recharge
                        </button>
                      </td>

                      {/* Partner Link */}
                      <td className="py-3.5 px-4">
                        {worker.token ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => copyToClipboard(worker.token)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] flex items-center gap-1 transition-colors"
                              title="Click to copy full worker access URL"
                            >
                              {copiedToken === worker.token ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Copy Link</span>
                            </button>

                            <Link
                              href={`/partner/${worker.token}`}
                              target="_blank"
                              className="p-1 text-slate-400 hover:text-slate-700 rounded"
                              title="Open Console in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleRevokeToken(worker)}
                              className="text-[10px] text-rose-600 hover:text-rose-800 underline ml-1"
                              title="Revoke access"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegenerateToken(worker)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200"
                          >
                            Generate Link
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/workers/${worker.id}`}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition-colors"
                          >
                            Profile
                          </Link>

                          {isSuspended ? (
                            <button
                              onClick={() => handleUnsuspendWorker(worker)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold"
                            >
                              Reinstate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspendWorker(worker)}
                              className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-[11px] font-bold"
                            >
                              Suspend
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleActive(worker)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              worker.is_active 
                                ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700' 
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {worker.is_active ? 'Deactivate' : 'Reactivate'}
                          </button>
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

      {/* MODAL 1: ONBOARD NEW TECHNICIAN */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFB21A]/20 text-[#0F1B33] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F1B33]">Onboard New Technician</h3>
                  <p className="text-[11px] text-slate-500">Create profile & provision partner token</p>
                </div>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newWorkerData.name}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit (e.g. 9826012345)"
                    value={newWorkerData.phone}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="Leave blank to use phone"
                    value={newWorkerData.whatsappNumber}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, whatsappNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. tech@plumberindore.in"
                    value={newWorkerData.email}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Locality</label>
                  <select
                    value={newWorkerData.locality}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, locality: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none"
                  >
                    <option value="Vijay Nagar">Vijay Nagar</option>
                    <option value="Palasia">Palasia</option>
                    <option value="Bhanwarkuan">Bhanwarkuan</option>
                    <option value="Rau">Rau</option>
                    <option value="Scheme No. 54">Scheme No. 54</option>
                    <option value="Scheme No. 78">Scheme No. 78</option>
                    <option value="Sudama Nagar">Sudama Nagar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trade Category</label>
                  <select
                    value={newWorkerData.serviceCategory}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, serviceCategory: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none"
                  >
                    <option value="plumber">Plumber</option>
                    <option value="electrician">Electrician</option>
                    <option value="ac_repair">AC Repair</option>
                    <option value="appliance">Appliance</option>
                    <option value="carpenter">Carpenter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Wallet (₹)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={newWorkerData.initialBalanceRupees}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, initialBalanceRupees: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doorstep Address (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 12, LIG Colony, Indore"
                  value={newWorkerData.address}
                  onChange={(e) => setNewWorkerData({ ...newWorkerData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. Family member phone"
                    value={newWorkerData.emergencyContact}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Experienced in commercial pumps"
                    value={newWorkerData.notes}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <span>{submitting ? 'Creating Profile...' : 'Complete Onboarding & Generate Link'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK RECHARGE */}
      {rechargeModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F1B33]">Recharge Wallet</h3>
                  <p className="text-[11px] text-slate-500">{selectedWorker.name}</p>
                </div>
              </div>
              <button onClick={() => setRechargeModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRechargeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recharge Amount (₹)</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['200', '500', '1000'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-lg border ${
                        rechargeAmount === amt ? 'bg-[#0F1B33] text-white border-[#0F1B33]' : 'bg-slate-50 border-slate-200 text-slate-700'
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-md"
              >
                {submitting ? 'Crediting Wallet...' : `Credit ₹${rechargeAmount} to Technician`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
