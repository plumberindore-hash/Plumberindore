'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  XCircle, 
  Wallet, 
  Phone, 
  Clock, 
  ShieldAlert,
  Slash,
  Eye,
  Check
} from 'lucide-react';

export default function OperationsAlertCenterPage() {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/alerts?status=${statusFilter}`);
      const data = await res.json();
      if (data.success && data.alerts) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.warn('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAlertAction = async (alertId, action) => {
    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action })
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({ type: 'success', text: `Alert marked as ${action.toLowerCase()}d.` });
        fetchAlerts();
      }
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Operations Alert Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
            System & Dispatch Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time operational alerts for low technician balances, stale presence, and urgent orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAlerts}
            className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-[#F5F8FC] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {actionFeedback.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ACTIVE', 'RESOLVED', 'ALL'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              statusFilter === st ? 'bg-[#0F1B33] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st.toLowerCase()} Alerts
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FFB21A]" />
            <span>Loading alerts...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Active Operational Alerts</h3>
            <p className="text-xs text-slate-500">Fleet operations, balances, and dispatches are healthy.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.severity === 'CRITICAL' ? 'border-rose-300 ring-2 ring-rose-400/30' :
                alert.severity === 'HIGH' ? 'border-amber-300' : 'border-[#E2E8F0]'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    alert.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                    {alert.category}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    {new Date(alert.created_at).toLocaleTimeString('en-IN')}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-[#0F1B33]">{alert.title}</h3>
                <p className="text-xs text-slate-600">{alert.description}</p>
              </div>

              {alert.status === 'ACTIVE' && (
                <div className="flex items-center gap-2">
                  {alert.related_worker_id && (
                    <Link
                      href={`/admin/workers/${alert.related_worker_id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                    >
                      View Technician
                    </Link>
                  )}
                  {alert.related_job_id && (
                    <Link
                      href={`/admin/jobs/${alert.related_job_id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                    >
                      View Job
                    </Link>
                  )}
                  <button
                    onClick={() => handleAlertAction(alert.id, 'RESOLVE')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                  <button
                    onClick={() => handleAlertAction(alert.id, 'DISMISS')}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
