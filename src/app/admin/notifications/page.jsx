'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Send, 
  CheckCheck, 
  AlertTriangle, 
  RefreshCw, 
  Filter, 
  Smartphone, 
  MessageSquare, 
  Clock, 
  FileText,
  ShieldAlert,
  Play
} from 'lucide-react';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [recipientFilter, setRecipientFilter] = useState('ALL');
  const [feedback, setFeedback] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        status: statusFilter,
        channel: channelFilter,
        recipientType: recipientFilter
      }).toString();

      const res = await fetch(`/api/admin/notifications?${query}`);
      const json = await res.json();
      if (json.success) {
        setNotifications(json.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [statusFilter, channelFilter, recipientFilter]);

  const handleProcessQueue = async () => {
    try {
      setProcessingQueue(true);
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process_queue' })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(`Queue processed: ${json.results.sent} sent, ${json.results.retried} retried, ${json.results.failed} failed, ${json.results.unconfigured} unconfigured.`);
        await fetchNotifications();
      }
    } catch (e) {
      setFeedback('Failed to trigger queue processing');
    } finally {
      setProcessingQueue(false);
    }
  };

  const totalCount = notifications.length;
  const sentCount = notifications.filter(n => ['SENT', 'DELIVERED', 'READ'].includes(n.status)).length;
  const retryCount = notifications.filter(n => n.status === 'RETRY').length;
  const failedCount = notifications.filter(n => n.status === 'FAILED').length;
  const unconfiguredCount = notifications.filter(n => n.status === 'NOT_CONFIGURED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">Notification Operations</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Phase 7</span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Authoritative delivery ledger, automated queue, and customer/technician communications.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/notifications/templates"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] flex items-center space-x-1.5 transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Manage Templates</span>
          </Link>

          <button
            onClick={handleProcessQueue}
            disabled={processingQueue}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0F1B33] hover:bg-[#16233D] text-white flex items-center space-x-1.5 transition shadow-sm disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${processingQueue ? 'animate-spin' : ''}`} />
            <span>{processingQueue ? 'Processing...' : 'Run Queue Now'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <span className="text-[11px] font-medium text-[#64748B] uppercase">Total In Ledger</span>
          <div className="text-2xl font-bold text-[#0F172A] mt-1">{totalCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <span className="text-[11px] font-medium text-emerald-600 uppercase">Delivered</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{sentCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <span className="text-[11px] font-medium text-amber-600 uppercase">Pending / Retry</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{retryCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <span className="text-[11px] font-medium text-rose-600 uppercase">Failed</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{failedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Unconfigured</span>
          <div className="text-2xl font-bold text-slate-700 mt-1">{unconfiguredCount}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs text-[#64748B]">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase text-[10px]">Filter:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="SENT">Sent / Delivered</option>
          <option value="RETRY">Retry Pending</option>
          <option value="FAILED">Failed</option>
          <option value="NOT_CONFIGURED">Not Configured</option>
        </select>

        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">All Channels</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="SMS">SMS</option>
        </select>

        <select
          value={recipientFilter}
          onChange={(e) => setRecipientFilter(e.target.value)}
          className="text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">All Recipient Types</option>
          <option value="CUSTOMER">Customer</option>
          <option value="TECHNICIAN">Technician</option>
          <option value="ADMIN">Admin / Owner</option>
        </select>

        <button
          onClick={fetchNotifications}
          className="ml-auto px-3 py-1.5 text-xs text-[#0F1B33] bg-slate-100 hover:bg-slate-200 rounded-lg font-medium flex items-center space-x-1 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Channel & Type</th>
                <th className="py-3 px-4">Message Content</th>
                <th className="py-3 px-4">Status & Attempts</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[#64748B]">
                    Loading notification ledger...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[#64748B]">
                    No notifications match your current filter.
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0F172A]">{n.recipient_name || 'N/A'}</div>
                      <div className="text-[11px] text-[#64748B]">{n.recipient_phone || 'No phone'}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {n.recipient_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 font-semibold text-[#0F172A]">
                        {n.channel === 'WHATSAPP' ? (
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>{n.channel}</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">{n.notification_type}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]" title={n.idempotency_key}>
                        {n.idempotency_key}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="line-clamp-2 text-[#0F172A] leading-relaxed text-[11px]">
                        {n.message_text}
                      </p>
                      {n.last_error && (
                        <div className="mt-1 text-[10px] text-rose-600 font-medium truncate max-w-xs" title={n.last_error}>
                          Err: {n.last_error}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        ['SENT', 'DELIVERED', 'READ'].includes(n.status) ? 'bg-emerald-100 text-emerald-800' :
                        n.status === 'RETRY' ? 'bg-amber-100 text-amber-800' :
                        n.status === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                        n.status === 'NOT_CONFIGURED' ? 'bg-slate-100 text-slate-700' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {n.status}
                      </span>
                      <div className="text-[11px] text-[#64748B] mt-1">
                        Attempts: {n.attempts || 0}/{n.max_attempts || 3}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                      <div>{n.created_at ? new Date(n.created_at).toLocaleDateString('en-IN') : 'N/A'}</div>
                      <div className="text-[10px]">{n.created_at ? new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
