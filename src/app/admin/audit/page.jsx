'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  Calendar, 
  User, 
  Tag, 
  FileText,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit?limit=100');
      const data = await res.json();
      if (data?.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch = searchTerm === '' || 
      (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.actor && log.actor.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  // Extract unique actions for filter dropdown
  const uniqueActions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)));

  const getActionColor = (action) => {
    if (action.includes('REASSIGN') || action.includes('CANCEL')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (action.includes('SUSPEND') || action.includes('REVOKE')) return 'bg-red-100 text-red-800 border-red-300';
    if (action.includes('SETTLEMENT') || action.includes('RECHARGE') || action.includes('DISPATCH')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (action.includes('OTP')) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0F1B33] text-[#FFB21A] rounded-xl shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F1B33] tracking-tight">
                Operational Audit Logs
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Immutable trail of sensitive dispatch, financial, security, and authentication events.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFB21A]' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, entity ID, actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F5F8FC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFB21A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-[#F5F8FC] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FFB21A] w-full sm:w-auto"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading immutable audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-bold text-sm text-slate-700">No Audit Events Found</div>
            <div className="text-xs text-slate-400">Try clearing filters or search terms.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.created_at || Date.now()).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{log.entity_type}</span>
                      {log.entity_id && (
                        <span className="text-[11px] text-slate-400 font-mono ml-1.5">
                          ({log.entity_id.length > 12 ? `${log.entity_id.slice(0, 8)}...` : log.entity_id})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono whitespace-nowrap">
                      {log.actor || 'SYSTEM'}
                    </td>
                    <td className="py-3 px-4">
                      {log.details ? (
                        <div className="font-mono text-[11px] text-slate-600 max-w-md truncate">
                          {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
