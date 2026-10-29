'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ArrowLeft, 
  Database, 
  Briefcase, 
  Users, 
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { formatPaise } from '@/lib/partner-engine/money.js';

export default function AdminDataHealthPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system/data-health');
      const data = await res.json();
      if (data?.success) {
        setReport(data);
      }
    } catch (err) {
      console.warn('Failed to load data health report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/system/health"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F1B33] tracking-tight">
                Database Health & Diagnostics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Data consistency checks, foreign key integrity, and orphan records auditor.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFB21A]' : ''}`} />
          <span>Re-scan Database</span>
        </button>
      </div>

      {loading && !report ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Scanning database tables, checking foreign key links and financial invariants...
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            report.status === 'HEALTHY' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {report.status === 'HEALTHY' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <h3 className="font-extrabold text-sm">
                  {report.status === 'HEALTHY' 
                    ? 'All Database Health Checks Passed' 
                    : 'Potential Consistency Issues Detected'}
                </h3>
                <p className="text-xs opacity-90 mt-0.5">
                  Scan completed at {new Date(report.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${
              report.status === 'HEALTHY' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
            }`}>
              {report.status}
            </span>
          </div>

          {/* Counts Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Total Workers</div>
                <div className="text-xl font-black text-slate-900">{report.metrics?.totalWorkers || 0}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Total Jobs</div>
                <div className="text-xl font-black text-slate-900">{report.metrics?.totalJobs || 0}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Gross Hisab (INR)</div>
                <div className="text-xl font-black font-mono text-slate-900">
                  {formatPaise(report.metrics?.grossRevenuePaise || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Diagnostic Checks */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FFB21A]" />
              <h2 className="font-extrabold text-sm text-[#0F1B33]">Automated Invariant & Referential Checks</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Check 1: Orphan Jobs */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  {report.diagnostics?.orphanJobsCount === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      Orphan Assigned Jobs
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Verify that all assigned jobs point to valid, existing technician records.
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                  report.diagnostics?.orphanJobsCount === 0 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {report.diagnostics?.orphanJobsCount || 0} orphans
                </span>
              </div>

              {/* Check 2: Unassigned Active Jobs */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  {report.diagnostics?.unassignedActiveJobsCount === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      Unassigned Active Jobs
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Check for jobs marked IN_PROGRESS or PAYMENT_PENDING without an assigned technician.
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                  report.diagnostics?.unassignedActiveJobsCount === 0 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {report.diagnostics?.unassignedActiveJobsCount || 0} issues
                </span>
              </div>

              {/* Check 3: Busy Workers Without Jobs */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  {report.diagnostics?.busyWorkersWithoutActiveJobsCount === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      Stuck BUSY Technicians
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Verify technicians marked BUSY are actually associated with an active dispatched job.
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                  report.diagnostics?.busyWorkersWithoutActiveJobsCount === 0 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {report.diagnostics?.busyWorkersWithoutActiveJobsCount || 0} stuck
                </span>
              </div>

              {/* Check 4: Double-Entry Financial Balance */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  {report.diagnostics?.reconciliationDiscrepancyPaise === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      Double-Entry Mathematical Balance
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Verify Gross Revenue = Platform Commission + Technician Payout with ₹0.00 drift.
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                  report.diagnostics?.reconciliationDiscrepancyPaise === 0 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  Variance: {formatPaise(report.diagnostics?.reconciliationDiscrepancyPaise || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
