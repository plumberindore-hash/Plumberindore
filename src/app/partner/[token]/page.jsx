'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Wrench, 
  ShieldCheck, 
  Clock, 
  Wallet, 
  ChevronRight, 
  User, 
  QrCode, 
  DollarSign, 
  Check, 
  Lock, 
  KeyRound, 
  Home, 
  Briefcase, 
  RefreshCw,
  X,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Bell
} from 'lucide-react';
import { formatPaise } from '../../../lib/partner-engine/money.js';

export default function WorkerMobileConsolePage({ params }) {
  const routeParams = useParams();
  const token = params?.token || routeParams?.token;

  // Global State
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);
  const [revokedReason, setRevokedReason] = useState('');
  const [worker, setWorker] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [navTab, setNavTab] = useState('home'); // 'home' | 'jobs' | 'wallet' | 'profile'

  // Workflow State Modals & Steps
  const [step, setStep] = useState('job_card'); // 'job_card' | 'start_otp' | 'rate_card' | 'payment' | 'end_otp' | 'receipt'
  const [startOtp, setStartOtp] = useState('');
  const [endOtp, setEndOtp] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH' | 'UPI'
  const [completedReceipt, setCompletedReceipt] = useState(null);

  // Phase 6 Verified Payment State
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);

  // Status and feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Phase 7 Worker Notifications State
  const [workerNotifications, setWorkerNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/partner/${token}/notifications`);
      const json = await res.json();
      if (json.success) {
        setWorkerNotifications(json.notifications || []);
        setUnreadNotifCount(json.unreadCount || 0);
      }
    } catch (e) {}
  }, [token]);

  const handleMarkNotifRead = async (id) => {
    try {
      await fetch(`/api/partner/${token}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      loadNotifications();
    } catch (e) {}
  };

  // 1. Load Worker Profile & Active Job
  const loadWorkerData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/partner/${token}`);
      const data = await res.json();

      if (!data.success) {
        setTokenValid(false);
        setRevokedReason(data.error || 'Your partner access has expired or been revoked.');
        return;
      }

      setTokenValid(true);
      setWorker(data.worker);
      setActiveJob(data.activeJob);

      // Determine appropriate step based on active job status
      if (data.activeJob) {
        if (data.activeJob.status === 'ARRIVED' || data.activeJob.status === 'ASSIGNED') {
          setStep('job_card');
        } else if (data.activeJob.status === 'IN_PROGRESS') {
          setStep('rate_card');
        } else if (data.activeJob.status === 'PAYMENT_PENDING') {
          setStep('payment');
        } else if (data.activeJob.status === 'COMPLETED') {
          setStep('job_card');
        }
      }

      // Fetch service catalog
      const catRes = await fetch(`/api/partner/${token}/services`);
      const catData = await catRes.json();
      if (catData?.catalog) {
        setCatalog(catData.catalog);
      }
    } catch (err) {
      console.warn('Load partner error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadWorkerData();
    loadNotifications();
    const notifInterval = setInterval(loadNotifications, 25000);
    return () => clearInterval(notifInterval);
  }, [loadWorkerData, loadNotifications]);

  // Periodic heartbeat ping to update presence & last_seen_at
  useEffect(() => {
    if (!tokenValid) return;
    const interval = setInterval(() => {
      fetch(`/api/partner/${token}/heartbeat`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          if (data?.walletBalancePaise !== undefined && worker) {
            setWorker(prev => ({ ...prev, wallet_balance_paise: data.walletBalancePaise }));
          }
        })
        .catch(() => null);
    }, 45000);

    return () => clearInterval(interval);
  }, [token, tokenValid, worker]);

  // Phase 6 Payment Order initialization
  const fetchOrCreatePaymentOrder = useCallback(async (jobId) => {
    const id = jobId || activeJob?.id;
    if (!id) return;
    setCreatingPayment(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/partner/${token}/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: id })
      });
      const data = await res.json();
      if (data.success && data.payment) {
        setPaymentOrder(data.payment);
        if (data.payment.status === 'VERIFIED') {
          setPaymentVerified(true);
        }
      } else if (!data.success) {
        setErrorMsg(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCreatingPayment(false);
    }
  }, [token, activeJob]);

  // Auto-poll payment status every 4 seconds when UPI is active
  useEffect(() => {
    if (step !== 'payment' || paymentMethod !== 'UPI' || !paymentOrder?.id || paymentVerified) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        setPaymentPolling(true);
        const res = await fetch(`/api/partner/${token}/payments/${paymentOrder.id}/status`);
        const data = await res.json();
        if (data.success && data.payment) {
          if (data.payment.status === 'VERIFIED') {
            setPaymentVerified(true);
            setPaymentOrder(data.payment);
          }
        }
      } catch (err) {
        // Polling retry
      } finally {
        setPaymentPolling(false);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [step, paymentMethod, paymentOrder?.id, paymentVerified, token]);

  // 2. Start Job OTP Submit
  const handleStartJob = async (e) => {
    e.preventDefault();
    if (!activeJob) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/partner/${token}/start-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: activeJob.id,
          otp: startOtp.trim()
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Invalid Start OTP. Please check with customer.');
      }

      setActiveJob(prev => ({ ...prev, status: 'IN_PROGRESS' }));
      setStep('rate_card');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Service or Part item
  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, { ...item, ratePaise: item.pricePaise, quantity: 1 }];
    });
  };

  const updateItemQty = (itemId, delta) => {
    setSelectedItems(prev => prev.map(i => {
      if (i.id === itemId) {
        const nextQty = Math.max(1, (i.quantity || 1) + delta);
        return { ...i, quantity: nextQty };
      }
      return i;
    }));
  };

  // Calculate totals and inspection waiver rule
  const serviceItemsTotalPaise = selectedItems.reduce((sum, item) => sum + (item.ratePaise * (item.quantity || 1)), 0);
  const isInspectionWaived = serviceItemsTotalPaise > 0;
  const inspectionFeePaise = 29900; // ₹299
  const waiverPaise = isInspectionWaived ? inspectionFeePaise : 0;
  const totalToCollectPaise = isInspectionWaived ? serviceItemsTotalPaise : inspectionFeePaise;

  // 3. Confirm Services & Proceed to Payment
  const handleSaveServices = async () => {
    if (!activeJob) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/partner/${token}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: activeJob.id,
          services: selectedItems
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save services');

      setActiveJob(prev => ({
        ...prev,
        status: 'PAYMENT_PENDING',
        total_paise: totalToCollectPaise,
        subtotal_paise: serviceItemsTotalPaise,
        waiver_paise: waiverPaise
      }));
      setStep('payment');
      if (paymentMethod === 'UPI') {
        fetchOrCreatePaymentOrder(activeJob.id);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Complete Job and Settle with End OTP
  const handleCompleteJob = async (e) => {
    e.preventDefault();
    if (!activeJob) return;
    if (paymentMethod === 'UPI' && !paymentVerified) {
      setErrorMsg('UPI payment must be verified by server before completing the job.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/partner/${token}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: activeJob.id,
          endOtp: endOtp.trim(),
          paymentMethod
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Invalid completion OTP.');
      }

      setCompletedReceipt(data);
      setStep('receipt');
      // Refresh worker wallet balance in background
      if (worker && data.new_wallet_balance_paise !== undefined) {
        setWorker(prev => ({ ...prev, wallet_balance_paise: data.new_wallet_balance_paise }));
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Revoked or Invalid Token Screen
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-xs space-y-4 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Revoked</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {revokedReason || 'Your partner access has expired or been revoked.'}
          </p>
          <div className="pt-2 text-[11px] text-slate-500">
            Please contact PlumberIndore fleet operations to request an updated access token.
          </div>
        </div>
      </div>
    );
  }

  // Dynamic UPI URL for QR code
  const totalRupees = (totalToCollectPaise / 100).toFixed(0);
  const upiPayString = `upi://pay?pa=plumberindore@okaxis&pn=PlumberIndore&am=${totalRupees}&cu=INR&tn=Job-${activeJob?.job_number || '1028'}`;

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-slate-900 flex justify-center font-sans antialiased">
      
      {/* Mobile Frame Container (Max 430px) */}
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col shadow-2xl border-x border-[#E2E8F0] relative pb-20">
        
        {/* 1. Mobile App Top Bar */}
        <header className="bg-[#0F1B33] text-white px-4 py-3.5 sticky top-0 z-30 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFB21A] to-[#F59E0B] flex items-center justify-center text-[#0F1B33] font-black">
              <Wrench className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
                <span>Plumber<strong className="text-[#FFB21A]">Indore</strong></span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                PARTNER CONSOLE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online</span>
            </div>

            {/* Notifications Bell */}
            <button
              onClick={() => setShowNotifDrawer(true)}
              title="Notifications"
              className="relative p-1.5 text-slate-400 hover:text-white transition"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => {
                loadWorkerData();
                loadNotifications();
              }}
              title="Refresh"
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* 2. Main Content Body */}
        <main className="flex-1 p-4 space-y-4">
          
          {/* Technician Welcome Pill */}
          {worker && (
            <div className="bg-[#16233D] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Welcome</span>
                <h2 className="font-bold text-sm text-white">{worker.name}</h2>
                <div className="text-[11px] text-slate-300 font-mono">{worker.phone}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase">Prepaid Wallet</span>
                <div className="font-mono font-black text-emerald-400 text-sm">
                  {formatPaise(worker.wallet_balance_paise)}
                </div>
              </div>
            </div>
          )}

          {/* Low Wallet Balance Warning Card */}
          {worker && Number(worker.wallet_balance_paise || 0) < 10000 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold text-red-900">
                  Low Wallet Balance ({formatPaise(worker.wallet_balance_paise)})
                </div>
                <div className="text-[11px] text-red-700 mt-0.5 leading-snug">
                  Minimum ₹100 required for new customer dispatches. Please recharge at the office or request owner top-up.
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: JOB CARD VIEW */}
          {step === 'job_card' && (
            <>
              {activeJob ? (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-[#0F1B33] text-[#FFB21A] font-mono">
                      Current Job #{activeJob.job_number}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">
                      {activeJob.status?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Customer</div>
                    <div className="font-bold text-base text-slate-900">{activeJob.customer_name}</div>
                    
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                      <span>{activeJob.locality}, Indore</span>
                    </div>
                    <div className="text-xs text-slate-500 pl-5">
                      {activeJob.address}
                    </div>
                  </div>

                  {/* Issue */}
                  <div className="bg-[#F5F8FC] p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Reported Issue</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{activeJob.issue}</div>
                  </div>

                  {/* Contact Customer Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${activeJob.customer_phone}`}
                      className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                    >
                      <Phone className="w-4 h-4 shrink-0" />
                      <span className="truncate">Call Customer</span>
                    </a>
                    <a
                      href={`https://wa.me/${(activeJob.customer_whatsapp || activeJob.customer_phone || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </a>
                  </div>

                  {/* Start Job Action */}
                  <button
                    onClick={() => setStep('start_otp')}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>START JOB (ENTER OTP)</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">No Active Job Assigned</h3>
                  <p className="text-xs text-slate-500">
                    You are ONLINE and free. As soon as dispatch allocates a job in {worker?.locality || 'Indore'}, it will ring and appear here.
                  </p>
                </div>
              )}
            </>
          )}

          {/* STEP 2: START JOB OTP MODAL */}
          {step === 'start_otp' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-[#0F1B33]">Start Job Verification</h3>
                  <p className="text-xs text-slate-500">Enter customer's 4-digit start OTP to begin.</p>
                </div>
                <button onClick={() => setStep('job_card')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStartJob} className="space-y-4">
                <div>
                  <input
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    autoFocus
                    placeholder="4-digit OTP"
                    value={startOtp}
                    onChange={(e) => setStartOtp(e.target.value)}
                    className="w-full py-3.5 border-2 border-slate-300 focus:border-[#FFB21A] rounded-2xl text-center text-3xl font-mono tracking-widest font-black focus:outline-none"
                  />
                  <div className="text-[11px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Customer received 4-digit OTP via SMS/WhatsApp</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || startOtp.length !== 4}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-sm shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Verifying OTP...' : 'VERIFY & BEGIN WORK'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: SERVICE / RATE CARD SELECTION */}
          {step === 'rate_card' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm text-[#0F1B33]">Service / Parts Rate Card</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Job in Progress
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Select repair items performed. Inspection fee ₹299 auto-waives when items are added.
                </p>
              </div>

              {/* Service List Checklist */}
              <div className="space-y-2">
                {catalog.map((item) => {
                  const isChecked = selectedItems.some(i => i.id === item.id);
                  const selectedObj = selectedItems.find(i => i.id === item.id);

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isChecked 
                          ? 'bg-amber-50/60 border-[#FFB21A] shadow-xs' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item)}
                          className="w-4 h-4 mt-0.5 rounded text-[#FFB21A] focus:ring-[#FFB21A]"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900 leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.isPart ? 'Spare Part' : 'Labor Service'}
                          </div>
                        </div>
                      </label>

                      <div className="flex items-center gap-3">
                        <div className="font-mono font-bold text-xs sm:text-sm text-slate-900">
                          {formatPaise(item.pricePaise)}
                        </div>

                        {isChecked && (
                          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.id, -1)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-1.5">{selectedObj?.quantity || 1}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.id, 1)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inspection Fee Auto-Waiver Box */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Services & Parts Subtotal:</span>
                  <span className="font-mono font-bold">{formatPaise(serviceItemsTotalPaise)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Standard Inspection Fee:</span>
                  <span className="font-mono font-bold">{formatPaise(inspectionFeePaise)}</span>
                </div>

                {isInspectionWaived ? (
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Inspection Fee Auto-Waiver:</span>
                    </span>
                    <span className="font-mono">-₹299</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-300/80 bg-amber-500/10 p-2 rounded-lg">
                    ℹ️ Only inspection done? Standard ₹299 applies. Adding any repair auto-waives this fee.
                  </div>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">Total To Collect:</span>
                  <span className="text-xl font-black text-[#FFB21A] font-mono">
                    {formatPaise(totalToCollectPaise)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSaveServices}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <span>PROCEED TO PAYMENT ({formatPaise(totalToCollectPaise)})</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}

          {/* STEP 4: PAYMENT SCREEN (UPI QR / CASH) */}
          {step === 'payment' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
              <div className="text-center pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Collect from Customer</span>
                <div className="text-3xl font-black text-[#0F1B33] font-mono mt-1">
                  {formatPaise(totalToCollectPaise)}
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'CASH'
                      ? 'bg-[#0F1B33] text-white border-[#0F1B33]'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Cash on Doorstep</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('UPI');
                    if (!paymentOrder) {
                      fetchOrCreatePaymentOrder(activeJob?.id);
                    }
                  }}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'UPI'
                      ? 'bg-[#0F1B33] text-white border-[#0F1B33]'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Dynamic UPI QR</span>
                </button>
              </div>

              {/* Dynamic UPI QR Code View */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                  <div className="text-xs font-bold text-slate-700">Scan to Pay Exact Amount: ₹{totalRupees}</div>
                  
                  {/* Dynamic QR Code Render */}
                  <div className="w-48 h-48 mx-auto bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center relative">
                    {creatingPayment ? (
                      <div className="text-xs text-slate-400 flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#FFB21A]" />
                        <span>Generating Secure QR...</span>
                      </div>
                    ) : paymentOrder ? (
                      <img 
                        src={paymentOrder.upi_qr_data_url || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(paymentOrder.upi_qr_payload || upiPayString)}`} 
                        alt="Dynamic UPI QR" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => fetchOrCreatePaymentOrder(activeJob?.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#0F1B33] text-white text-xs font-bold"
                        >
                          Generate QR Code
                        </button>
                      </div>
                    )}
                  </div>

                  {paymentOrder?.provider_order_id && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Order: <strong>{paymentOrder.provider_order_id}</strong>
                    </div>
                  )}

                  {/* Payment Verification Status Badge */}
                  {paymentVerified ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-left flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-extrabold text-emerald-900">Payment Verified by Server ✓</div>
                        <div className="text-[11px] text-emerald-700 mt-0.5">
                          Bank receipt confirmed via gateway. You may now enter End OTP to complete the job.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-left flex items-start gap-2.5">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <div className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                          <span>Waiting for Customer Payment</span>
                          {paymentPolling && <span className="text-[10px] text-amber-600 font-normal">(verifying...)</span>}
                        </div>
                        <div className="text-[11px] text-amber-800 mt-0.5">
                          Checking gateway every 4 seconds. End OTP will unlock automatically when verified.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'CASH' && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
                  💵 <strong>Cash Collected:</strong> Technician collects ₹{totalRupees} cash from customer. The 10% platform commission will be debited from your prepaid wallet balance.
                </div>
              )}

              {/* Action Button: Gated on payment verification for UPI */}
              {paymentMethod === 'UPI' ? (
                <button
                  onClick={() => setStep('end_otp')}
                  disabled={!paymentVerified}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-sm shadow-md shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {paymentVerified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#0F1B33] stroke-[3]" />
                      <span>ENTER END OTP & COMPLETE JOB</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 animate-spin text-[#0F1B33]" />
                      <span>WAITING FOR PAYMENT CONFIRMATION</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setStep('end_otp')}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4 stroke-[3]" />
                  <span>CONFIRM CASH COLLECTED & ENTER END OTP</span>
                </button>
              )}
            </div>
          )}

          {/* STEP 5: END JOB OTP */}
          {step === 'end_otp' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-[#0F1B33]">Complete Job (End OTP)</h3>
                  <p className="text-xs text-slate-500">Customer provides 4-digit completion code.</p>
                </div>
                <button onClick={() => setStep('payment')} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCompleteJob} className="space-y-4">
                <div>
                  <input
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    autoFocus
                    placeholder="4-digit End OTP"
                    value={endOtp}
                    onChange={(e) => setEndOtp(e.target.value)}
                    className="w-full py-3.5 border-2 border-slate-300 focus:border-[#FFB21A] rounded-2xl text-center text-3xl font-mono tracking-widest font-black focus:outline-none"
                  />
                  <div className="text-[11px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Customer received 4-digit completion code</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || endOtp.length !== 4}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-sm shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Settling Job & Commission...' : 'VERIFY & COMPLETE JOB'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 6: COMPLETED JOB RECEIPT */}
          {step === 'receipt' && (
            <div className="bg-white rounded-2xl border border-emerald-300 p-6 shadow-md space-y-4 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-black text-xl text-[#0F1B33]">✓ Job Completed</h3>
                <p className="text-xs text-slate-500 font-mono">Job #{activeJob?.job_number || 'PI-1028'}</p>
              </div>

              <div className="bg-[#F5F8FC] p-4 rounded-xl text-left text-xs space-y-2 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <strong className="text-slate-900">{activeJob?.customer_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Collected:</span>
                  <strong className="text-slate-900 font-mono">{formatPaise(totalToCollectPaise)}</strong>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Platform Commission (10%):</span>
                  <strong className="font-mono">-{formatPaise(completedReceipt?.commission_paise != null ? completedReceipt.commission_paise : Math.round(totalToCollectPaise * 0.10))}</strong>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold border-t border-slate-200 pt-1.5">
                  <span>Technician Share (90%):</span>
                  <strong className="font-mono">{formatPaise(completedReceipt?.worker_share_paise != null ? completedReceipt.worker_share_paise : (totalToCollectPaise - Math.round(totalToCollectPaise * 0.10)))}</strong>
                </div>
                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1.5">
                  <span>New Wallet Balance:</span>
                  <strong className="font-mono text-slate-900">{formatPaise(completedReceipt?.new_wallet_balance_paise)}</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('job_card');
                  setActiveJob(null);
                  loadWorkerData();
                }}
                className="w-full py-3 rounded-xl bg-[#0F1B33] text-white font-bold text-xs"
              >
                RETURN TO RADAR
              </button>
            </div>
          )}

        </main>

        {/* Phase 7 Worker Notification Drawer Modal */}
        {showNotifDrawer && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-[430px] rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-[#0F1B33]" />
                  <h3 className="font-bold text-sm text-[#0F172A]">Notification Alerts</h3>
                  {unreadNotifCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">
                      {unreadNotifCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                {workerNotifications.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#64748B]">
                    No notifications yet. You will receive real-time dispatches and reminders here.
                  </div>
                ) : (
                  workerNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border text-xs transition ${
                        !notif.worker_read_at
                          ? 'bg-amber-50/60 border-amber-200 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-[#0F172A]">{notif.notification_type}</span>
                        {!notif.worker_read_at ? (
                          <button
                            onClick={() => handleMarkNotifRead(notif.id)}
                            className="text-[10px] text-blue-600 font-bold hover:underline shrink-0"
                          >
                            Mark Read
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 shrink-0">Read</span>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#0F172A]">{notif.message_text}</p>
                      <div className="mt-1 text-[9px] text-slate-400 font-medium">
                        {notif.created_at ? new Date(notif.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  className="w-full py-2.5 bg-[#0F1B33] text-white rounded-xl text-xs font-bold hover:bg-[#16233D] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-[#E2E8F0] grid grid-cols-4 py-2 px-1 z-30 shadow-lg">
          <button
            onClick={() => setNavTab('home')}
            className={`flex flex-col items-center justify-center py-1 text-[11px] font-bold ${
              navTab === 'home' ? 'text-[#FFB21A]' : 'text-slate-400'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setNavTab('jobs')}
            className={`flex flex-col items-center justify-center py-1 text-[11px] font-bold ${
              navTab === 'jobs' ? 'text-[#FFB21A]' : 'text-slate-400'
            }`}
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span>Jobs</span>
          </button>

          <button
            onClick={() => setNavTab('wallet')}
            className={`flex flex-col items-center justify-center py-1 text-[11px] font-bold ${
              navTab === 'wallet' ? 'text-[#FFB21A]' : 'text-slate-400'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span>Wallet</span>
          </button>

          <button
            onClick={() => setNavTab('profile')}
            className={`flex flex-col items-center justify-center py-1 text-[11px] font-bold ${
              navTab === 'profile' ? 'text-[#FFB21A]' : 'text-slate-400'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span>Profile</span>
          </button>
        </nav>

      </div>

    </div>
  );
}
