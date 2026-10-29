'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  CreditCard, 
  MapPin, 
  Wrench, 
  Users, 
  RefreshCw,
  PieChart
} from 'lucide-react';
import { formatPaise } from '@/lib/partner-engine/money.js';

export default function OperationalAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      const resData = await res.json();
      if (resData.success && resData.analytics) {
        setData(resData.analytics);
      }
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#FFB21A] animate-spin" />
      </div>
    );
  }

  const { kpis, areaDistribution, categoryDistribution, fleetSummary } = data || {};

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Operations Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
            Operational Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Key execution KPIs, area dispatch volumes, and financial splits across Indore.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-[#F5F8FC] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Top KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Dispatches
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#0F1B33]">
            {kpis?.totalJobs || 0}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Completed: <strong className="text-emerald-600">{kpis?.completedJobs || 0}</strong> ({kpis?.completionRatePercent || 0}%)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Cancellation Rate
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-700">
            {kpis?.cancellationRatePercent || 0}%
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Cancelled: <strong className="text-slate-900">{kpis?.cancelledJobs || 0}</strong> orders
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Average Job Value
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#0F1B33]">
            {formatPaise(kpis?.averageJobValuePaise || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Gross: {formatPaise(kpis?.totalGrossPaise || 0)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Fleet Capacity
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {fleetSummary?.onlineFree || 0} Free
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {fleetSummary?.busy || 0} Busy • {fleetSummary?.offline || 0} Offline
          </div>
        </div>
      </div>

      {/* Area & Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Area Volumes */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#0F1B33] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F59E0B]" />
              <span>Jobs by Locality</span>
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(areaDistribution || {}).map(([area, count]) => {
              const pct = kpis?.totalJobs ? Math.round((count / kpis.totalJobs) * 100) : 0;
              return (
                <div key={area} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{area}</span>
                    <span className="font-mono">{count} jobs ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] rounded-full"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Volumes */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#0F1B33] uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Jobs by Service Category</span>
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryDistribution || {}).map(([cat, count]) => {
              const pct = kpis?.totalJobs ? Math.round((count / kpis.totalJobs) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span className="capitalize">{cat}</span>
                    <span className="font-mono">{count} jobs ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Cash vs UPI Payment Ratio */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-[#0F1B33] uppercase tracking-wider">
          Payment Mode Distribution
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Doorstep Cash Collected</span>
            <div className="text-xl font-black font-mono text-slate-900">
              {formatPaise(kpis?.cashCollectedPaise || 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Directly paid to technician at customer premise</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Company Direct UPI</span>
            <div className="text-xl font-black font-mono text-slate-900">
              {formatPaise(kpis?.upiCollectedPaise || 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Paid directly via platform dynamic UPI QR</p>
          </div>
        </div>
      </div>

    </div>
  );
}
