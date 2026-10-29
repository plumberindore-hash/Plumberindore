'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RotateCcw, 
  ArrowUpRight, 
  ShieldCheck, 
  DollarSign, 
  QrCode, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { formatPaise } from '../../../lib/partner-engine/money.js';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [reconciliation, setReconciliation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Refund Modal State
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundFeedback, setRefundFeedback] = useState(null);

  const fetchPaymentsData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.set('status', statusFilter);
      if (providerFilter !== 'ALL') queryParams.set('provider', providerFilter);
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());

      const [paymentsRes, reconRes] = await Promise.all([
        fetch(`/api/admin/payments?${queryParams.toString()}`).then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/reconciliation/payments').then(r => r.json()).catch(() => ({}))
      ]);

      if (paymentsRes?.success && paymentsRes.payments) {
        setPayments(paymentsRes.payments);
      }
      if (reconRes?.success && reconRes.reconciliation) {
        setReconciliation(reconRes.reconciliation);
      }
    } catch (err) {
      console.warn('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, providerFilter, searchQuery]);

  useEffect(() => {
    fetchPaymentsData();
  }, [fetchPaymentsData]);

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setSubmittingRefund(true);
    setRefundFeedback(null);

    try {
      const res = await fetch(`/api/admin/payments/${selectedPayment.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountPaise: selectedPayment.amount_paise,
          reason: refundReason.trim() || 'Admin customer dispute refund'
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to refund payment');
      }

      setRefundFeedback({ type: 'success', message: 'Refund initiated successfully' });
      fetchPaymentsData();
      setTimeout(() => {
        setRefundModalOpen(false);
        setSelectedPayment(null);
        setRefundReason('');
        setRefundFeedback(null);
      }, 1500);
    } catch (err) {
      setRefundFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmittingRefund(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            VERIFIED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-600" />
            PENDING
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/30">
            FAILED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-700 border border-slate-500/30">
            EXPIRED
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 border border-purple-500/30">
            <RotateCcw className="w-3 h-3 text-purple-600" />
            REFUNDED
          </span>
        );
      case 'DUPLICATE_PAYMENT_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            REVIEW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-700 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <CreditCard className="w-3.5 h-3.5 text-[#FFB21A]" />
            <span>Financial Integrity & Doorstep Settlement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
            Payments & Gateway Audit
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time reconciliation of Razorpay, Doorstep Dynamic UPI QR, and Cash collections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPaymentsData}
            className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-[#F5F8FC] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Reconciliation Cards */}
      {reconciliation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reconciled Volume</span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-[#0F1B33] mt-2">
              {formatPaise(reconciliation.total_verified_paise || 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {reconciliation.verified_count || 0} successfully verified orders
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gateway Settlements</span>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <QrCode className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-[#0F1B33] mt-2">
              {formatPaise(reconciliation.online_volume_paise || 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              UPI Dynamic QR & Direct Razorpay
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audit Discrepancies</span>
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-[#0F1B33] mt-2">
              {reconciliation.unreconciled_count || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Zero undetected mismatch tolerance
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, Job ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#FFB21A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-[#E2E8F0] bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-[#E2E8F0] bg-white text-slate-700"
          >
            <option value="ALL">All Providers</option>
            <option value="razorpay">Razorpay / UPI</option>
            <option value="cash">Doorstep Cash</option>
          </select>
        </div>
      </div>

      {/* 4. Payments Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] border-b border-[#E2E8F0] text-slate-500 uppercase font-black tracking-wider">
              <tr>
                <th className="p-4">Payment Ref</th>
                <th className="p-4">Job & Technician</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-bold">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#FFB21A]" />
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-bold">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-900">#{p.id}</div>
                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                        {p.provider_payment_id || p.provider_order_id || 'Cash Entry'}
                      </div>
                    </td>
                    <td className="p-4">
                      {p.job_id ? (
                        <Link
                          href={`/admin/jobs/${p.job_id}`}
                          className="font-bold text-blue-600 hover:underline block"
                        >
                          Job #{p.job_id}
                        </Link>
                      ) : (
                        <span className="text-slate-400">Direct Payment</span>
                      )}
                      <div className="text-[11px] text-slate-500">
                        {p.technician_name || p.worker_id || 'Unassigned'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono font-black text-slate-900 text-sm">
                        {formatPaise(p.amount_paise)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Fee: {formatPaise(p.platform_fee_paise || 0)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 capitalize">
                        {p.provider === 'razorpay' ? <QrCode className="w-3 h-3 text-blue-600" /> : <DollarSign className="w-3 h-3 text-emerald-600" />}
                        {p.provider}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="p-4 text-slate-500">
                      <div>{new Date(p.created_at).toLocaleDateString('en-IN')}</div>
                      <div className="text-[10px]">{new Date(p.created_at).toLocaleTimeString('en-IN')}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/payments/${p.id}`}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {p.status === 'VERIFIED' && p.provider !== 'cash' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(p);
                              setRefundModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Refund Modal Dialog */}
      {refundModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Initiate Refund</h3>
                  <p className="text-xs text-slate-500">Transaction #{selectedPayment.id}</p>
                </div>
              </div>
              <button
                onClick={() => setRefundModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Refund Amount:</span>
                  <span className="font-mono font-bold text-slate-900">{formatPaise(selectedPayment.amount_paise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Order:</span>
                  <span className="font-mono text-slate-700">{selectedPayment.provider_order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider:</span>
                  <span className="font-bold text-slate-700 capitalize">{selectedPayment.provider}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Refund (Mandatory)
                </label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g., Customer double charged, service canceled, dispute..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>

              {refundFeedback && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  refundFeedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {refundFeedback.message}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund || !refundReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition"
                >
                  {submittingRefund ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
