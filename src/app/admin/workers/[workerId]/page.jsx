'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ArrowLeft, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Wallet, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  KeyRound, 
  Copy, 
  Check, 
  RefreshCw, 
  Slash, 
  MessageSquare, 
  DollarSign, 
  TrendingUp,
  Receipt,
  AlertCircle,
  X
} from 'lucide-react';
import { formatPaise } from '@/lib/partner-engine/money.js';

export default function WorkerDetailPage({ params }) {
  const { workerId } = params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'wallet' | 'jobs' | 'security'
  const [copiedToken, setCopiedToken] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Recharge Modal
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [rechargeNotes, setRechargeNotes] = useState('');
  const [submittingRecharge, setSubmittingRecharge] = useState(false);

  const fetchWorkerDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/workers/${workerId}`);
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      } else {
        setActionFeedback({ type: 'error', text: resData.error || 'Failed to load technician' });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    fetchWorkerDetail();
  }, [fetchWorkerDetail]);

  const handleCopyLink = () => {
    if (!data?.security?.token) return;
    const url = `${window.location.origin}/partner/${data.security.token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleRegenerateToken = async () => {
    if (!window.confirm('Regenerate secure access link? The existing link will be immediately invalidated.')) return;
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/token`, { method: 'POST' });
      const resData = await res.json();
      if (resData.success) {
        setActionFeedback({ type: 'success', text: 'New access token successfully generated.' });
        fetchWorkerDetail();
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    }
  };

  const handleRevokeToken = async () => {
    if (!window.confirm('Revoke access token? The technician will lose access to the mobile console immediately.')) return;
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/token`, { method: 'DELETE' });
      const resData = await res.json();
      if (resData.success) {
        setActionFeedback({ type: 'success', text: 'Access token revoked.' });
        fetchWorkerDetail();
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    }
  };

  const handleSuspend = async () => {
    const reason = window.prompt('Enter reason for suspension:');
    if (!reason) return;
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const resData = await res.json();
      if (resData.success) {
        setActionFeedback({ type: 'success', text: 'Technician suspended.' });
        fetchWorkerDetail();
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    }
  };

  const handleUnsuspend = async () => {
    if (!window.confirm('Reinstate this technician?')) return;
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/suspend`, { method: 'DELETE' });
      const resData = await res.json();
      if (resData.success) {
        setActionFeedback({ type: 'success', text: 'Technician reinstated to active roster.' });
        fetchWorkerDetail();
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    }
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRecharge(true);
    try {
      const res = await fetch('/api/admin/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId,
          amountRupees: parseFloat(rechargeAmount),
          paymentMethod,
          notes: rechargeNotes
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setRechargeOpen(false);
        setActionFeedback({ type: 'success', text: 'Wallet balance successfully credited.' });
        fetchWorkerDetail();
      } else {
        setActionFeedback({ type: 'error', text: resData.error || 'Recharge failed' });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmittingRecharge(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#FFB21A] animate-spin" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Technician Record Not Found</h2>
        <Link href="/admin/workers" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F1B33] text-white rounded-xl font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Fleet Roster
        </Link>
      </div>
    );
  }

  const { profile, wallet, stats, security, recentJobs } = data;
  const isSuspended = profile.status === 'SUSPENDED';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/workers" className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">{profile.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                  profile.status === 'ONLINE_FREE' ? 'bg-emerald-100 text-emerald-800' :
                  profile.status === 'BUSY' ? 'bg-blue-100 text-blue-800' :
                  profile.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {profile.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <a href={`tel:${profile.phone}`} className="font-mono text-blue-600 hover:underline flex items-center gap-1 font-bold">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{profile.phone}</span>
                </a>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{profile.locality}, Indore</span>
                </span>
                <span>•</span>
                <span>Skill: <strong className="text-slate-800">{profile.skills?.join(', ') || 'General Plumbing'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRechargeOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" />
              <span>Credit Wallet</span>
            </button>

            {isSuspended ? (
              <button
                onClick={handleUnsuspend}
                className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors"
              >
                Reinstate
              </button>
            ) : (
              <button
                onClick={handleSuspend}
                className="px-3.5 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
              >
                Suspend
              </button>
            )}
          </div>
        </div>

        {/* Action feedback */}
        {actionFeedback && (
          <div className={`p-4 rounded-xl text-xs font-bold ${
            actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {actionFeedback.text}
          </div>
        )}

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Prepaid Wallet</span>
            <div className="text-xl font-mono font-black text-slate-900 mt-1">
              {formatPaise(wallet?.balance_paise)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Completed Jobs</span>
            <div className="text-xl font-mono font-black text-emerald-600 mt-1">
              {stats?.completedJobs || 0}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Earned</span>
            <div className="text-xl font-mono font-black text-slate-900 mt-1">
              {formatPaise(stats?.totalEarningsPaise || 0)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Commission Paid</span>
            <div className="text-xl font-mono font-black text-amber-600 mt-1">
              {formatPaise(stats?.commissionPaidPaise || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Jobs' },
          { id: 'wallet', label: 'Wallet Khata & Ledger' },
          { id: 'security', label: 'Security & Access Link' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === t.id ? 'bg-[#0F1B33] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & JOBS */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0]">
            <h3 className="font-extrabold text-sm text-[#0F1B33]">Recent Dispatched Jobs</h3>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {(recentJobs || []).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No jobs dispatched yet.</div>
            ) : (
              recentJobs.map(job => (
                <div key={job.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">#{job.job_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        job.status === 'CANCELLED' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{job.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{job.customer_name} • {job.area}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-slate-900 block">{formatPaise(job.total_amount_paise)}</span>
                    <Link href={`/admin/jobs/${job.id}`} className="text-xs text-blue-600 font-bold hover:underline mt-1 inline-block">
                      View Job →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WALLET KHATA */}
      {activeTab === 'wallet' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#0F1B33]">Khata Ledger Transactions</h3>
            <button
              onClick={() => setRechargeOpen(true)}
              className="text-xs text-[#F59E0B] font-bold hover:underline"
            >
              + Add Recharge
            </button>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {(wallet?.transactions || []).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No wallet transactions recorded.</div>
            ) : (
              wallet.transactions.map((tx, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{tx.description || tx.type}</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">{new Date(tx.created_at).toLocaleString('en-IN')}</span>
                  </div>
                  <span className={`font-mono font-black text-sm ${
                    tx.amount_paise > 0 ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {tx.amount_paise > 0 ? `+${formatPaise(tx.amount_paise)}` : formatPaise(tx.amount_paise)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & TOKEN */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#0F1B33]">Mobile Console Secret Access Link</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The technician uses this magic URL to open their doorstep Partner Engine console on WhatsApp or mobile browser without passwords.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Live Partner Link:</span>
            {security?.token ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/partner/${security.token}`}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-[#0F1B33] text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No active token currently provisioned.</div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRegenerateToken}
              className="px-4 py-2.5 rounded-xl bg-[#FFB21A] text-[#0F1B33] font-bold text-xs hover:bg-[#F59E0B] shadow-xs"
            >
              Generate New Token
            </button>
            <button
              onClick={handleRevokeToken}
              className="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-xs hover:bg-red-100"
            >
              Revoke Token
            </button>
          </div>
        </div>
      )}

      {/* RECHARGE MODAL */}
      {rechargeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0F1B33]">Recharge Technician Wallet</h3>
                <p className="text-xs text-slate-500">Crediting balance for {profile.name}</p>
              </div>
              <button onClick={() => setRechargeOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRechargeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recharge Amount (INR)</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-lg font-mono font-bold focus:ring-2 focus:ring-[#FFB21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="Cash">Cash at Hub</option>
                  <option value="UPI">Company UPI</option>
                  <option value="Bank Transfer">NEFT / IMPS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reference Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Receipt #1029 or UPI Ref"
                  value={rechargeNotes}
                  onChange={(e) => setRechargeNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setRechargeOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecharge}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
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
