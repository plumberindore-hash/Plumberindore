'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Wallet, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  Send, 
  PlusCircle, 
  RefreshCw, 
  ChevronRight, 
  ShieldCheck,
  Zap,
  MapPin,
  Calendar
} from 'lucide-react';
import { formatPaise } from '../../lib/partner-engine/money.js';
import { createClient } from '../../lib/supabase/client.js';

export default function AdminDashboardPage() {
  const supabase = createClient();

  const [metrics, setMetrics] = useState({
    totalTechnicians: 8,
    currentlyBusy: 0,
    available: 8,
    totalWalletPaise: 80000,
    lowBalanceCount: 0
  });

  const [hisab, setHisab] = useState({
    total_jobs: 30,
    gross_revenue_paise: 1845000,
    commission_paise: 369000,
    worker_share_paise: 1476000,
    cash_collected_paise: 1145000,
    upi_collected_paise: 700000
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Date and Greeting
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fleetRes, hisabRes, jobsRes] = await Promise.all([
        fetch('/api/admin/fleet').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/hisab').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/jobs').then(r => r.json()).catch(() => ({}))
      ]);

      if (fleetRes?.workers) {
        const workers = fleetRes.workers;
        setMetrics({
          totalTechnicians: workers.length,
          currentlyBusy: workers.filter(w => w.status === 'BUSY').length,
          available: workers.filter(w => w.status === 'ONLINE_FREE' || w.status === 'AVAILABLE').length,
          totalWalletPaise: workers.reduce((sum, w) => sum + Number(w.wallet_balance_paise || 0), 0),
          lowBalanceCount: workers.filter(w => Number(w.wallet_balance_paise || 0) < 10000).length
        });
      }

      if (hisabRes?.metrics) {
        setHisab(hisabRes.metrics);
      }

      if (jobsRes?.jobs) {
        setRecentJobs(jobsRes.jobs.slice(0, 5));
      }
    } catch (err) {
      console.warn('Dashboard fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('partner-engine-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{dateFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
            {greeting}, <span className="text-[#F59E0B]">Owner</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's what's happening with your team and operations today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            title="Refresh Live Data"
            className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-[#F5F8FC] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/jobs"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] hover:from-[#ffba32] hover:to-[#ea9203] text-[#0F1B33] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-4 h-4 fill-current" />
            <span>Dispatch New Job</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Technicians */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Technicians</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#0F1B33]">
              {metrics.totalTechnicians}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-slate-500">
              <span className="text-emerald-600 font-bold">{metrics.available} Available</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{metrics.currentlyBusy} Busy</span>
            </div>
          </div>
        </div>

        {/* Total Hisab / Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today Hisab</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#0F1B33]">
              {formatPaise(hisab.gross_revenue_paise)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-slate-500">
              <span className="text-slate-900 font-bold">{hisab.total_jobs} Jobs</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">10% Platform Cut</span>
            </div>
          </div>
        </div>

        {/* Worker Wallets */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fleet Wallets</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#0F1B33]">
              {formatPaise(metrics.totalWalletPaise)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-slate-500">
              {metrics.lowBalanceCount > 0 ? (
                <span className="text-rose-600 font-bold">{metrics.lowBalanceCount} Low Balances</span>
              ) : (
                <span className="text-emerald-600 font-bold">All Balances Healthy</span>
              )}
            </div>
          </div>
        </div>

        {/* Platform Share */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Earnings</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#0F1B33]">
              {formatPaise(hisab.commission_paise)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-slate-500">
              <span className="text-slate-900 font-bold">Worker Net: {formatPaise(hisab.worker_share_paise)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Operational Quick Actions */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Quick Launch Engine
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/jobs"
            className="p-4 rounded-xl border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex flex-col gap-2 group"
          >
            <Send className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-bold text-xs text-slate-900">Dispatch Job</div>
              <div className="text-[11px] text-slate-500">Assign to closest tech</div>
            </div>
          </Link>

          <Link
            href="/admin/workers"
            className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col gap-2 group"
          >
            <Users className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-bold text-xs text-slate-900">Manage Fleet</div>
              <div className="text-[11px] text-slate-500">Status, tokens & onboarding</div>
            </div>
          </Link>

          <Link
            href="/admin/wallets"
            className="p-4 rounded-xl border border-slate-200/80 hover:border-purple-400 hover:bg-purple-50/50 transition-all flex flex-col gap-2 group"
          >
            <Wallet className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-bold text-xs text-slate-900">Wallet Recharge</div>
              <div className="text-[11px] text-slate-500">Top-up technician credit</div>
            </div>
          </Link>

          <Link
            href="/admin/fleet"
            className="p-4 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all flex flex-col gap-2 group"
          >
            <MapPin className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-bold text-xs text-slate-900">Live Indore Map</div>
              <div className="text-[11px] text-slate-500">Active corridor presence</div>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Recent Jobs Section */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#0F1B33]">Recent Service Jobs</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live status feed across Indore</p>
          </div>
          <Link
            href="/admin/jobs"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentJobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No recent jobs found. Use 'Dispatch New Job' above to assign a booking.
            </div>
          ) : (
            recentJobs.map((job) => (
              <div key={job.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-[#0F1B33]">#{job.job_number}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700 truncate">{job.customer_name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {job.locality || 'Indore'} • {job.service_category || 'Plumbing'}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    job.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    job.status === 'ASSIGNED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {job.status}
                  </span>

                  <span className="text-xs font-bold text-slate-900">
                    {formatPaise(job.total_paise)}
                  </span>

                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
