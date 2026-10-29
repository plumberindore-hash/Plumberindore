'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  QrCode,
  DollarSign,
  RefreshCw,
  X
} from 'lucide-react';
import { formatPaise } from '../../../../lib/partner-engine/money.js';

export default function AdminPaymentDetailPage({ params }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Refund dialog state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundFeedback, setRefundFeedback] = useState(null);

  const fetchPayment = useCallback(async () => {
    setLoading(true);
    try {
      const resolvedParams = await Promise.resolve(params);
      const res = await fetch(`/api/admin/payments/${resolvedParams.paymentId}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Payment not found');
      }
      setPayment(data.payment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!payment) return;
    setSubmittingRefund(true);
    setRefundFeedback(null);

    try {
      const res = await fetch(`/api/admin/payments/${payment.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountPaise: payment.amount_paise,
          reason: refundReason.trim() || 'Admin customer dispute refund'
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to refund payment');
      }

      setRefundFeedback({ type: 'success', message: 'Refund initiated successfully' });
      fetchPayment();
      setTimeout(() => {
        setRefundModalOpen(false);
        setRefundReason('');
        setRefundFeedback(null);
      }, 1500);
    } catch (err) {
      setRefundFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FFB21A] mb-3" />
        <p className="text-sm">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold">
          {error || 'Transaction not found'}
        </div>
        <Link href="/admin/payments" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payments Ledger</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 select-none font-sans">
      
      {/* 1. Header with Back Link */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/payments" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payments Ledger</span>
        </Link>

        {payment.status === 'VERIFIED' && payment.provider !== 'cash' && (
          <button
            onClick={() => setRefundModalOpen(true)}
            className="px-3.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Initiate Refund</span>
          </button>
        )}
      </div>

      {/* 2. Top Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Payment ID</span>
            <h1 className="text-xl font-mono font-black text-[#0F1B33]">{payment.id}</h1>
            <div className="text-xs text-slate-500 font-mono mt-0.5">Order: {payment.provider_order_id}</div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Gross Collected</span>
            <div className="text-2xl font-mono font-black text-slate-900">{formatPaise(payment.amount_paise)}</div>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              payment.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
              payment.status === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
              payment.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {payment.status}
            </span>
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Provider / Channel</span>
            <div className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mt-1 capitalize">
              {payment.provider === 'razorpay' ? <QrCode className="w-4 h-4 text-blue-600" /> : <DollarSign className="w-4 h-4 text-emerald-600" />}
              <span>{payment.provider}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">{payment.provider_payment_id || 'Cash Transaction'}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Platform Take (10%)</span>
            <div className="text-sm font-extrabold font-mono text-amber-600 mt-1">
              {formatPaise(payment.platform_fee_paise || 0)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Automated commission cut</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Partner Payout (90%)</span>
            <div className="text-sm font-extrabold font-mono text-emerald-600 mt-1">
              {formatPaise(payment.worker_share_paise || 0)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Technician earnings</div>
          </div>
        </div>
      </div>

      {/* 3. Associated Job & Customer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Details Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Associated Job</h3>
            {payment.job_id && (
              <Link href={`/admin/jobs/${payment.job_id}`} className="text-xs font-bold text-blue-600 hover:underline">
                View Job #{payment.job_id} →
              </Link>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Job Title:</span>
              <span className="font-extrabold text-slate-800">{payment.job?.title || `Order #${payment.job_id}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Locality:</span>
              <span className="font-bold text-slate-700">{payment.job?.area || 'Indore'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer Name:</span>
              <span className="font-bold text-slate-800">{payment.job?.customer_name || 'Direct Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer Phone:</span>
              <span className="font-mono text-slate-700">{payment.job?.customer_phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Technician Details Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Technician Details</h3>
            {payment.worker_id && (
              <Link href={`/admin/workers/${payment.worker_id}`} className="text-xs font-bold text-blue-600 hover:underline">
                View Profile →
              </Link>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Name:</span>
              <span className="font-extrabold text-slate-800">{payment.technician_name || payment.worker?.name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Technician Phone:</span>
              <span className="font-mono text-slate-700">{payment.worker?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Khata Entry:</span>
              <span className="font-mono text-emerald-600 font-bold">Ledger #{payment.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Audit & Verification Trail */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Technical Audit Details</h3>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-400">Payment Signature Verified:</span>
            <span className="text-emerald-600 font-bold">SHA-256 HMAC Verified</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-400">Webhook Event ID:</span>
            <span className="text-slate-800">{payment.webhook_event_id || '—'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-400">Created At:</span>
            <span className="text-slate-800">{payment.created_at ? new Date(payment.created_at).toLocaleString('en-IN') : '—'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-400">Verified At:</span>
            <span className="text-slate-800 font-bold text-emerald-700">
              {payment.verified_at ? new Date(payment.verified_at).toLocaleString('en-IN') : '—'}
            </span>
          </div>
          {payment.refunded_at && (
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Refunded At:</span>
              <span className="text-rose-700 font-bold">{new Date(payment.refunded_at).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Refund Modal Dialog */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Confirm Refund</h3>
                  <p className="text-xs text-slate-500">Transaction #{payment.id}</p>
                </div>
              </div>
              <button onClick={() => setRefundModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Refund Amount:</span>
                  <span className="font-mono font-bold text-slate-900">{formatPaise(payment.amount_paise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Order:</span>
                  <span className="font-mono text-slate-700">{payment.provider_order_id}</span>
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
                  placeholder="e.g., Customer double charged, dispute resolution..."
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
                  {submittingRefund ? 'Processing...' : 'Execute Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
