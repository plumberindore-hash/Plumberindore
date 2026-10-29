'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  ShieldCheck, 
  Wrench, 
  AlertCircle,
  Receipt,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function CustomerTrackingPage({ params }) {
  const { secureToken } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchTracking = async () => {
    try {
      const res = await fetch(`/api/track/${secureToken}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Tracking details unavailable');
      } else {
        setTrackingData(json.data);
        setError(null);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      setError('Unable to load live status. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, [secureToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0F1B33] border-t-[#FFB21A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#0F172A]">Locating your service booking...</p>
          <p className="text-xs text-[#64748B] mt-1">Connecting to PlumberIndore fleet</p>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 text-center">
          <AlertCircle className="w-12 h-12 text-[#EF4444] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#0F172A] mb-1">Booking Not Available</h2>
          <p className="text-xs text-[#64748B] mb-5">{error || 'This tracking link may have expired or is invalid.'}</p>
          <a
            href="tel:+919229959827"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0F1B33] text-white text-xs font-semibold rounded-xl hover:bg-[#16233D] transition shadow-sm"
          >
            <Phone className="w-3.5 h-3.5 mr-2" />
            Contact PlumberIndore Support
          </a>
        </div>
      </div>
    );
  }

  const status = trackingData.status;
  const isCompleted = status === 'COMPLETED';
  const isCancelled = status === 'CANCELLED';
  const isPaymentPending = status === 'PAYMENT_PENDING';
  const isInProgress = ['IN_PROGRESS', 'PAYMENT_PENDING', 'COMPLETED'].includes(status);
  const isArrived = ['ARRIVED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'COMPLETED'].includes(status);
  const isDispatched = ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'COMPLETED'].includes(status);

  const steps = [
    { label: 'Booking Confirmed', done: true, current: status === 'NEW' },
    { label: 'Technician Assigned', done: isDispatched, current: status === 'ASSIGNED' || status === 'EN_ROUTE' },
    { label: 'Arrived & Inspecting', done: isArrived, current: status === 'ARRIVED' },
    { label: 'Work In Progress', done: isInProgress, current: status === 'IN_PROGRESS' },
    { label: 'Completed & Verified', done: isCompleted, current: isCompleted || isPaymentPending }
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FC] pb-12">
      {/* Header */}
      <header className="bg-[#0F1B33] text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFB21A] flex items-center justify-center text-[#0F1B33] font-black text-sm">
              PI
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">PlumberIndore</h1>
              <p className="text-[10px] text-slate-300">Live Customer Job Tracker</p>
            </div>
          </div>
          <button
            onClick={fetchTracking}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Updated</span>
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Job Status Banner */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Order Reference</span>
              <div className="text-sm font-bold font-mono text-[#0F172A]">{trackingData.job_number}</div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                isCompleted ? 'bg-emerald-100 text-emerald-800' :
                isCancelled ? 'bg-rose-100 text-rose-800' :
                isPaymentPending ? 'bg-amber-100 text-amber-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {trackingData.status_display}
              </span>
            </div>
          </div>

          <h2 className="text-base font-bold text-[#0F172A] mb-1">{trackingData.title}</h2>
          <div className="flex items-center text-xs text-[#64748B]">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#FFB21A]" />
            <span>{trackingData.area}, Indore</span>
          </div>
        </div>

        {/* Real-Time Progress Timeline */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <h3 className="text-xs font-bold tracking-wider uppercase text-[#64748B] mb-4">Service Journey</h3>
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#E2E8F0]" />
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex items-center">
                <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  step.done ? 'bg-emerald-500 text-white' :
                  step.current ? 'bg-[#FFB21A] text-[#0F1B33] ring-4 ring-amber-100 font-bold' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  {step.done ? '✓' : idx + 1}
                </div>
                <div className="ml-2">
                  <p className={`text-xs ${
                    step.current ? 'font-bold text-[#0F172A]' :
                    step.done ? 'font-semibold text-slate-700' :
                    'text-[#94A3B8]'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Technician Card */}
        {trackingData.technician && (
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-[#0F1B33] text-lg">
                  {trackingData.technician.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{trackingData.technician.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-[#64748B] mt-0.5">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                      4.9
                    </span>
                    <span>•</span>
                    <span>Certified Technician</span>
                  </div>
                </div>
              </div>
              <a
                href={`tel:${trackingData.technician.phone}`}
                className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16B879] border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 transition shadow-sm"
                title="Call Technician"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Itemized Pricing & Invoice Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold tracking-wider uppercase text-[#64748B] flex items-center">
              <Receipt className="w-3.5 h-3.5 mr-1.5 text-[#0F1B33]" />
              Official Bill Breakdown
            </h3>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              Verified Rates
            </span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            {/* Added Services */}
            {trackingData.services && trackingData.services.length > 0 ? (
              trackingData.services.map((srv, idx) => (
                <div key={idx} className="pt-2 flex justify-between items-center text-[#0F172A]">
                  <div>
                    <span className="font-medium">{srv.name}</span>
                    {srv.quantity > 1 && <span className="text-[#64748B] ml-1">× {srv.quantity}</span>}
                  </div>
                  <span className="font-bold">₹{((srv.ratePaise * (srv.quantity || 1)) / 100).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="pt-2 flex justify-between items-center text-[#0F172A]">
                <span className="font-medium">Initial On-Site Inspection & Diagnostics</span>
                <span className="font-bold">₹{(trackingData.pricing.inspection_fee_paise / 100).toFixed(2)}</span>
              </div>
            )}

            {/* Waiver notice if applicable */}
            {trackingData.pricing.waiver_paise > 0 && (
              <div className="pt-2 flex justify-between items-center text-emerald-600 font-semibold">
                <span>Inspection Fee Waived (Service Added)</span>
                <span>-₹{(trackingData.pricing.waiver_paise / 100).toFixed(2)}</span>
              </div>
            )}

            {/* Total Row */}
            <div className="pt-3 flex justify-between items-center text-sm font-extrabold text-[#0F172A]">
              <span>Final Total Amount</span>
              <span className="text-base text-[#0F1B33]">₹{(trackingData.pricing.total_paise / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Status Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-[#64748B]">Payment Status</span>
            {trackingData.payment.status === 'PAID' ? (
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Paid & Settled
              </span>
            ) : trackingData.payment.status === 'PENDING' ? (
              <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Payment Due
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium">Pending Completion</span>
            )}
          </div>
        </div>

        {/* Safety & Quality Assurance Guarantee */}
        <div className="bg-[#16233D] text-white rounded-2xl p-4 shadow-sm flex items-start space-x-3">
          <ShieldCheck className="w-6 h-6 text-[#FFB21A] shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-white mb-0.5">30-Day Service Guarantee</h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Every job executed by PlumberIndore comes with our verified 30-day rework guarantee and official digital receipt.
            </p>
          </div>
        </div>

        {/* Customer Support Footer */}
        <div className="text-center pt-2 text-xs text-[#64748B]">
          <p>Questions about this visit? Call Indore Operations</p>
          <a href="tel:+919229959827" className="font-bold text-[#0F1B33] hover:underline mt-0.5 inline-block">
            +91 92299 59827
          </a>
        </div>
      </main>
    </div>
  );
}
