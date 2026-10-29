'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Wrench, 
  Clock, 
  Wallet, 
  QrCode, 
  DollarSign, 
  KeyRound, 
  Briefcase, 
  RefreshCw,
  X,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Bell,
  TrendingUp,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Flame
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
  
  // Dedicated Technician Bottom Navigation: 'jobs' | 'earnings' | 'history'
  const [navTab, setNavTab] = useState('jobs');

  // Live Shift Stats & History
  const [shiftStats, setShiftStats] = useState({
    todayEarningsPaise: 0,
    completedJobsCount: 0,
    cashCollectedPaise: 0
  });
  const [historyJobs, setHistoryJobs] = useState([]);

  // Audio / Vibration Incoming Job Alert State
  const [incomingJob, setIncomingJob] = useState(null);
  const [incomingTimer, setIncomingTimer] = useState(45);
  const [isAlerting, setIsAlerting] = useState(false);
  const audioCtxRef = useRef(null);
  const chimeIntervalRef = useRef(null);

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
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Phase 7 Worker Notifications State
  const [workerNotifications, setWorkerNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // -------------------------------------------------------------
  // Web Audio API Ringtone & Vibration Synthesizer
  // -------------------------------------------------------------
  const playAlertChime = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const playDualTone = () => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;

        // Tone 1 (Attention Chime 880Hz / A5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.35, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.25);

        // Tone 2 (Harmonic Escalation 1175Hz / D6)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1175, now + 0.25);
        gain2.gain.setValueAtTime(0.4, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.25);
        osc2.stop(now + 0.55);

        // Mobile Vibration Pattern (400ms pulse, 150ms pause, 400ms pulse)
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([350, 150, 400]);
          } catch (e) {}
        }
      };

      playDualTone();
      if (chimeIntervalRef.current) clearInterval(chimeIntervalRef.current);
      chimeIntervalRef.current = setInterval(playDualTone, 1400);
    } catch (err) {
      console.warn('[Audio Chime Notice]:', err);
    }
  }, []);

  const stopAlertChime = useCallback(() => {
    if (chimeIntervalRef.current) {
      clearInterval(chimeIntervalRef.current);
      chimeIntervalRef.current = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
  }, []);

  // Countdown timer effect for incoming alert
  useEffect(() => {
    let timer = null;
    if (isAlerting && incomingTimer > 0) {
      timer = setInterval(() => {
        setIncomingTimer((prev) => {
          if (prev <= 1) {
            stopAlertChime();
            setIsAlerting(false);
            setIncomingJob(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAlerting, incomingTimer, stopAlertChime]);

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      stopAlertChime();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => null);
      }
    };
  }, [stopAlertChime]);

  // -------------------------------------------------------------
  // Data Loading & Heartbeat
  // -------------------------------------------------------------
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

      if (data.shiftStats) {
        setShiftStats(data.shiftStats);
      }
      if (data.historyJobs) {
        setHistoryJobs(data.historyJobs);
      }

      // If active job exists, step accordingly
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

  // -------------------------------------------------------------
  // Incoming Dispatch Handlers
  // -------------------------------------------------------------
  const triggerSimulationAlert = () => {
    const mockOffer = {
      id: `offer-${Date.now()}`,
      job_number: `PI-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: 'Rajesh Malviya',
      customer_phone: '+91 98260 12345',
      locality: 'Vijay Nagar (Sector 54)',
      address: 'Flat 402, Royal Residency, Near C21 Mall, Indore',
      issue: 'Main Pipeline Leakage & Wall Mixer Diagnostic',
      total_paise: 29900,
      priority: 'Emergency'
    };
    setIncomingJob(mockOffer);
    setIncomingTimer(45);
    setIsAlerting(true);
    playAlertChime();
  };

  const handleAcceptIncoming = async () => {
    stopAlertChime();
    setIsAlerting(false);
    if (!incomingJob) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/partner/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: incomingJob.id })
      });
      const data = await res.json();
      if (data.success) {
        setActiveJob(incomingJob);
        setStep('job_card');
        setNavTab('jobs');
        loadWorkerData();
      }
    } catch (e) {
      console.warn('Accept job error:', e);
    } finally {
      setSubmitting(false);
      setIncomingJob(null);
    }
  };

  const handleRejectIncoming = async (reason = 'TECHNICIAN_DECLINED') => {
    stopAlertChime();
    setIsAlerting(false);
    if (!incomingJob) return;

    try {
      await fetch(`/api/partner/${token}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: incomingJob.id, reason })
      });
    } catch (e) {}
    setIncomingJob(null);
  };

  // -------------------------------------------------------------
  // Workflow Step Handlers
  // -------------------------------------------------------------
  const handleVerifyStartOtp = async (e) => {
    e.preventDefault();
    if (!startOtp || startOtp.trim().length !== 4) {
      setErrorMsg('Please enter a valid 4-digit OTP provided by the customer.');
      return;
    }

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
        setErrorMsg(data.message || data.error || 'Invalid start OTP. Please verify with customer.');
        return;
      }

      setActiveJob(prev => ({ ...prev, status: 'IN_PROGRESS' }));
      setStep('rate_card');
      setStartOtp('');
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Check network.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleItem = (catalogItem) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === catalogItem.id);
      if (exists) {
        return prev.filter(i => i.id !== catalogItem.id);
      } else {
        return [...prev, { ...catalogItem, quantity: 1 }];
      }
    });
  };

  const updateItemQty = (id, delta) => {
    setSelectedItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = (item.quantity || 1) + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const subtotalPaise = selectedItems.reduce((acc, curr) => acc + (curr.pricePaise * (curr.quantity || 1)), 0);
  const inspectionFeePaise = selectedItems.length > 0 ? 0 : 29900;
  const totalToCollectPaise = subtotalPaise + inspectionFeePaise;

  const handleSaveServicesAndProceed = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/partner/${token}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: activeJob.id,
          selectedServices: selectedItems
        })
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Failed to save diagnostic items.');
        return;
      }

      setStep('payment');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update billing details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePaymentOrder = async () => {
    if (!activeJob) return;
    setCreatingPayment(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/partner/${token}/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: activeJob.id })
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Failed to initialize UPI QR payment order.');
        return;
      }

      setPaymentOrder(data.order);
      setPaymentVerified(false);
      setPaymentPolling(true);
    } catch (err) {
      setErrorMsg(err.message || 'Payment order request failed.');
    } finally {
      setCreatingPayment(false);
    }
  };

  // Payment polling effect for dynamic QR verification
  useEffect(() => {
    let pollInterval = null;
    if (paymentPolling && paymentOrder?.paymentId && !paymentVerified) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/partner/${token}/payments/${paymentOrder.paymentId}/status`);
          const data = await res.json();

          if (data.success && (data.status === 'VERIFIED' || data.status === 'SUCCESS' || data.status === 'CAPTURED')) {
            setPaymentVerified(true);
            setPaymentPolling(false);
            setPaymentMethod('UPI');
            setStep('end_otp');
          }
        } catch (e) {}
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [paymentPolling, paymentOrder, paymentVerified, token]);

  const handleCompleteJob = async (e) => {
    e.preventDefault();
    if (!endOtp || endOtp.trim().length !== 4) {
      setErrorMsg('Please enter a valid 4-digit Completion OTP provided by customer.');
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
          paymentMethod: paymentMethod
        })
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message || data.error || 'Settlement failed. Check End OTP.');
        return;
      }

      setCompletedReceipt(data.receipt);
      setStep('receipt');
      setEndOtp('');
      loadWorkerData();
    } catch (err) {
      setErrorMsg(err.message || 'Job completion settlement failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Token Revocation & Loading States
  // -------------------------------------------------------------
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#0F1B33] text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4 border border-red-500/30">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-white">Access Token Revoked</h1>
        <p className="text-sm text-slate-300 mt-2 max-w-xs">{revokedReason}</p>
        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 max-w-xs">
          Please contact PlumberIndore Operations Support at <span className="text-[#FFB21A] font-bold">+91 92299 59827</span> to generate a new mobile session link.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#0F172A] flex justify-center selection:bg-amber-400 selection:text-slate-950 pb-24">
      <div className="w-full max-w-[430px] bg-white min-h-screen flex flex-col shadow-2xl relative">

        {/* 1. Dedicated Technician Header Bar */}
        <header className="bg-[#0F1B33] text-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFB21A] to-[#F59E0B] flex items-center justify-center text-[#0F1B33] font-black shadow-xs">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight">Plumber<span className="text-[#FFB21A]">Indore</span></span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  PARTNER
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">Fleet Operations Console</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Pill */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online</span>
            </div>

            {/* Notifications Bell */}
            <button
              type="button"
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
              type="button"
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

        {/* 2. Main Body Content */}
        <main className="flex-1 p-4 space-y-4">
          
          {/* Technician Welcome & Prepaid Wallet Pill */}
          {worker && (
            <div className="bg-[#16233D] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Verified Professional</span>
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

          {/* Live Shift Performance KPI Bar (Always Visible) */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-600 tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Today's Shift Performance</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono border border-emerald-200/50">
                LIVE METRICS
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Today's Earnings */}
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-emerald-800 uppercase leading-tight">Today's Earnings</div>
                <div className="text-sm font-black text-emerald-700 font-mono my-0.5">
                  ₹{Math.round(shiftStats.todayEarningsPaise / 100)}
                </div>
                <div className="text-[9px] text-emerald-600">90% Payout</div>
              </div>

              {/* Completed Jobs */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-amber-800 uppercase leading-tight">Completed Jobs</div>
                <div className="text-sm font-black text-amber-700 font-mono my-0.5">
                  {shiftStats.completedJobsCount}
                </div>
                <div className="text-[9px] text-amber-600">Shift Total</div>
              </div>

              {/* Cash Collected */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-700 uppercase leading-tight">Cash Collected</div>
                <div className="text-sm font-black text-slate-800 font-mono my-0.5">
                  ₹{Math.round(shiftStats.cashCollectedPaise / 100)}
                </div>
                <div className="text-[9px] text-slate-500">Doorstep COD</div>
              </div>
            </div>
          </div>

          {/* Low Wallet Balance Warning Card */}
          {worker && Number(worker.wallet_balance_paise || 0) < 10000 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold text-red-900">
                  Low Wallet Balance ({formatPaise(worker.wallet_balance_paise)})
                </div>
                <div className="text-[11px] text-red-700 mt-0.5 leading-snug">
                  Minimum ₹100 required for new customer dispatches. Please recharge at the office or via official UPI.
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

          {/* ========================================================= */}
          {/* TAB 1: JOBS VIEW                                          */}
          {/* ========================================================= */}
          {navTab === 'jobs' && (
            <div className="space-y-4">
              
              {/* STEP 1: ACTIVE JOB CARD OR FREE STANDBY */}
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
                        type="button"
                        onClick={() => setStep('start_otp')}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>START JOB (ENTER OTP)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] text-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                        <Briefcase className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">Online & Standing By</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                          You are free for new allocations. As soon as a doorstep job is dispatched in {worker?.locality || 'Indore'}, your phone will ring with sound & vibration.
                        </p>
                      </div>

                      {/* Interactive Test Alert Trigger */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={triggerSimulationAlert}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition shadow-xs"
                        >
                          <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                          <span>Test Incoming Dispatch Alert Ring 🔔</span>
                        </button>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          Tests Web Audio chime, vibration pulse, and 45s countdown timer.
                        </p>
                      </div>
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
                    <button type="button" onClick={() => setStep('job_card')} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleVerifyStartOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Customer Start OTP
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        inputMode="numeric"
                        autoFocus
                        placeholder="••••"
                        value={startOtp}
                        onChange={(e) => setStartOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full text-center tracking-[1em] text-2xl font-black font-mono py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || startOtp.length !== 4}
                      className="w-full py-3.5 rounded-xl bg-[#0F1B33] text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying OTP...</span>
                        </>
                      ) : (
                        <span>Verify & Start Labor</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 3: RATE CARD & SERVICE ITEMIZER */}
              {step === 'rate_card' && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-[#0F1B33]">Diagnostic & Services</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Job in Progress
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select repair items performed. Inspection fee ₹299 auto-waives when items are added.
                    </p>
                  </div>

                  {/* Service Checklist */}
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {catalog.map((item) => {
                      const isChecked = selectedItems.some(i => i.id === item.id);
                      const selectedObj = selectedItems.find(i => i.id === item.id);

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            isChecked 
                              ? 'bg-amber-50/60 border-[#FFB21A] shadow-xs' 
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <label className="flex items-start gap-2.5 cursor-pointer flex-1">
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
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {item.isPart ? 'Spare Part' : 'Labor Service'}
                              </div>
                            </div>
                          </label>

                          <div className="flex items-center gap-2">
                            <div className="font-mono font-bold text-xs text-slate-900">
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
                                <span className="text-xs font-bold px-1">{selectedObj?.quantity || 1}</span>
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

                  {/* Cost Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Inspection Fee:</span>
                      <span className="font-mono font-bold">
                        {inspectionFeePaise > 0 ? formatPaise(inspectionFeePaise) : 'WAIVED (₹0)'}
                      </span>
                    </div>
                    {subtotalPaise > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Items Subtotal:</span>
                        <span className="font-mono font-bold">{formatPaise(subtotalPaise)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-sm text-[#0F1B33] border-t border-slate-200 pt-2">
                      <span>Total to Collect:</span>
                      <span className="font-mono text-emerald-600">{formatPaise(totalToCollectPaise)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSaveServicesAndProceed}
                    className="w-full py-3.5 rounded-xl bg-[#0F1B33] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <span>CONFIRM BILL & PROCEED TO PAYMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 4: PAYMENT SELECTION & DYNAMIC UPI QR */}
              {step === 'payment' && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="font-extrabold text-base text-[#0F1B33]">Doorstep Payment</h3>
                    <p className="text-xs text-slate-500">
                      Total Bill Amount: <strong className="text-emerald-700 font-mono text-sm">{formatPaise(totalToCollectPaise)}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all ${
                        paymentMethod === 'CASH'
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-black shadow-xs'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <DollarSign className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                      <div className="text-xs font-bold">Cash on Delivery</div>
                      <div className="text-[10px] text-slate-400">Collect Full Cash</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('UPI');
                        if (!paymentOrder) handleGeneratePaymentOrder();
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all ${
                        paymentMethod === 'UPI'
                          ? 'border-[#FFB21A] bg-amber-50/50 text-amber-950 font-black shadow-xs'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <QrCode className="w-6 h-6 mx-auto mb-1 text-[#F59E0B]" />
                      <div className="text-xs font-bold">Dynamic UPI QR</div>
                      <div className="text-[10px] text-slate-400">Scan & Pay (Fast)</div>
                    </button>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                      {creatingPayment ? (
                        <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500">
                          <RefreshCw className="w-6 h-6 animate-spin text-[#F59E0B]" />
                          <span className="text-xs font-bold">Generating Dynamic Doorstep QR...</span>
                        </div>
                      ) : paymentOrder ? (
                        <>
                          <div className="bg-white p-3 rounded-xl border border-slate-300 inline-block shadow-sm">
                            <img
                              src={paymentOrder.upiQrDataUrl}
                              alt="Customer Payment QR"
                              className="w-44 h-44 mx-auto"
                            />
                          </div>

                          <div className="text-xs font-bold text-slate-800">
                            Ask customer to scan with Google Pay, PhonePe, or Paytm
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Listening for verified webhook settlement...</span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}

                  {paymentMethod === 'CASH' && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                      <strong>Doorstep Cash Collection:</strong> You collect {formatPaise(totalToCollectPaise)} directly from the customer. Platform 10% commission ({formatPaise(Math.round(totalToCollectPaise * 0.10))}) will be auto-debited from your prepaid wallet.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep('end_otp')}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
                  >
                    PAYMENT CONFIRMED → ENTER COMPLETION OTP
                  </button>
                </div>
              )}

              {/* STEP 5: END OTP COMPLETION MODAL */}
              {step === 'end_otp' && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
                  <div className="pb-2 border-b border-slate-100">
                    <h3 className="font-extrabold text-base text-[#0F1B33]">Job Completion Settlement</h3>
                    <p className="text-xs text-slate-500">Ask the customer for their 4-digit End OTP to finalize.</p>
                  </div>

                  <form onSubmit={handleCompleteJob} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Customer Completion OTP
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        inputMode="numeric"
                        autoFocus
                        placeholder="••••"
                        value={endOtp}
                        onChange={(e) => setEndOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full text-center tracking-[1em] text-2xl font-black font-mono py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || endOtp.length !== 4}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Finalizing Hisab & Wallet Split...</span>
                        </>
                      ) : (
                        <span>COMPLETE JOB & SETTLE</span>
                      )}
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
                    <h3 className="font-black text-xl text-[#0F1B33]">✓ Job Completed & Settled</h3>
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
                    type="button"
                    onClick={() => {
                      setStep('job_card');
                      setActiveJob(null);
                      loadWorkerData();
                    }}
                    className="w-full py-3.5 rounded-xl bg-[#0F1B33] text-white font-bold text-xs shadow-md"
                  >
                    RETURN TO RADAR
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: EARNINGS VIEW                                      */}
          {/* ========================================================= */}
          {navTab === 'earnings' && (
            <div className="space-y-4">
              
              {/* Shift Earnings Breakdown Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-extrabold text-sm text-[#0F1B33]">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Shift Earnings & Hisab</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    90% TAKE-HOME
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Today's Net Technician Payout:</span>
                    <span className="font-mono font-black text-emerald-600 text-base">
                      ₹{Math.round(shiftStats.todayEarningsPaise / 100)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-slate-100">
                    <span className="text-slate-500">Jobs Completed Today:</span>
                    <span className="font-bold text-slate-800">{shiftStats.completedJobsCount} Jobs</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-slate-100">
                    <span className="text-slate-500">Doorstep Cash Collected (COD):</span>
                    <span className="font-mono font-bold text-slate-800">
                      ₹{Math.round(shiftStats.cashCollectedPaise / 100)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prepaid Wallet & Khata Ledger */}
              <div className="bg-[#16233D] text-white p-5 rounded-2xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#FFB21A]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Khata Balance</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                    Active
                  </span>
                </div>

                <div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {formatPaise(worker?.wallet_balance_paise)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    10% commission automatically debited on cash jobs; 90% credited on UPI jobs.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 text-xs space-y-2">
                  <div className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Top-up Wallet via UPI</div>
                  <div className="bg-white/10 p-2.5 rounded-xl flex items-center justify-between font-mono text-xs text-amber-300">
                    <span>plumberindore@okaxis</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined') {
                          navigator.clipboard?.writeText('plumberindore@okaxis');
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }
                      }}
                      className="px-2 py-1 rounded bg-amber-400 text-slate-950 font-sans font-bold text-[10px] flex items-center gap-1 active:scale-95 transition"
                    >
                      {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Commission Rule Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-600">
                <div className="font-extrabold text-slate-800">Fair Share Transparency</div>
                <p className="text-[11px] leading-relaxed">
                  • <strong>90% Technician Share:</strong> You take home 90% of every labor and repair charge.<br />
                  • <strong>10% Platform Fee:</strong> Covers customer acquisition, doorstep dispatch, insurance warranty, and 24x7 support.
                </p>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: HISTORY VIEW                                       */}
          {/* ========================================================= */}
          {navTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-black text-sm text-[#0F1B33] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#F59E0B]" />
                  <span>Completed Job Log</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500 font-mono">
                  {historyJobs.length} Record{historyJobs.length === 1 ? '' : 's'}
                </span>
              </div>

              {historyJobs.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-300" />
                  <div className="font-bold text-xs text-slate-700">No Completed Jobs Yet</div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Jobs completed in your shift will appear here with payment breakdowns and receipts.
                  </p>
                </div>
              ) : (
                historyJobs.map((job) => (
                  <div key={job.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-[#0F1B33]">#{job.job_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        job.payment_method === 'UPI' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {job.payment_method || 'CASH'}
                      </span>
                    </div>

                    <div className="text-xs">
                      <div className="font-bold text-slate-900">{job.customer_name || 'Customer'}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#F59E0B]" />
                        <span>{job.locality || 'Indore'}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg">
                        {job.issue}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        {job.completed_at ? new Date(job.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today'}
                      </span>
                      <div className="font-mono text-right">
                        <span className="text-[10px] text-slate-400 mr-1.5">Earned:</span>
                        <strong className="text-emerald-700 font-black">
                          {formatPaise(job.worker_share_paise)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </main>

        {/* ========================================================= */}
        {/* INCOMING DISPATCH ALERT MODAL (AUDIO + VIBRATION + 45s)   */}
        {/* ========================================================= */}
        {isAlerting && incomingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FFB21A] animate-in zoom-in-95 duration-200">
              {/* Alert Header */}
              <div className="bg-[#0F1B33] text-white p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 animate-pulse" />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-2 animate-bounce">
                  <Bell className="w-3.5 h-3.5 animate-spin" />
                  <span>NEW DOORSTEP DISPATCH OFFER</span>
                </span>
                <h3 className="text-lg font-black text-white">Incoming Job Request</h3>
                <p className="text-xs text-slate-300 mt-0.5">Respond before the timer expires</p>

                {/* Circular Countdown Timer */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-700 stroke-current"
                        strokeWidth="3.5"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${incomingTimer > 20 ? 'text-emerald-400' : incomingTimer > 10 ? 'text-amber-400' : 'text-rose-500'} stroke-current transition-all duration-1000 ease-linear`}
                        strokeWidth="3.5"
                        strokeDasharray={`${Math.round((incomingTimer / 45) * 100)}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-mono font-black text-lg text-white">
                      {incomingTimer}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Alert Body */}
              <div className="p-5 space-y-4">
                {/* Estimated Earning */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Estimated Payout</div>
                    <div className="text-base font-black text-emerald-700 font-mono">
                      ₹{Math.round((incomingJob.total_paise || 29900) * 0.90 / 100)}
                      <span className="text-[10px] font-normal text-emerald-600 ml-1">(90% Share)</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
                    GUARANTEED
                  </span>
                </div>

                {/* Location & Issue Details */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800">{incomingJob.locality || 'Vijay Nagar'}, Indore</div>
                      <div className="text-slate-500 text-[11px]">{incomingJob.address || 'Doorstep Location'}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Wrench className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-800">Reported Issue</div>
                      <div className="text-slate-600 text-[11px]">{incomingJob.issue || 'Standard Doorstep Repair'}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleAcceptIncoming}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ACCEPT JOB (CLAIM NOW)</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleRejectIncoming('TECHNICIAN_DECLINED')}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
                  >
                    Pass / Decline Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  type="button"
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
                            type="button"
                            onClick={() => {
                              fetch(`/api/partner/${token}/notifications`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ notificationId: notif.id })
                              }).then(() => loadNotifications());
                            }}
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
                  type="button"
                  onClick={() => setShowNotifDrawer(false)}
                  className="w-full py-2.5 bg-[#0F1B33] text-white rounded-xl text-xs font-bold hover:bg-[#16233D] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Dedicated Technician Bottom Navigation (Jobs, Earnings, History) */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-[#0F1B33] border-t border-slate-800 grid grid-cols-3 py-2 px-2 z-40 shadow-2xl pb-safe">
          <button
            type="button"
            onClick={() => setNavTab('jobs')}
            className={`flex flex-col items-center justify-center py-1 text-[11px] transition-all ${
              navTab === 'jobs' 
                ? 'text-[#FFB21A] font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-200 font-semibold'
            }`}
          >
            <div className="relative">
              <Wrench className="w-5 h-5 mb-0.5" />
              {activeJob && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <span>Jobs</span>
            {navTab === 'jobs' && <span className="w-4 h-0.5 bg-[#FFB21A] rounded-full mt-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => setNavTab('earnings')}
            className={`flex flex-col items-center justify-center py-1 text-[11px] transition-all ${
              navTab === 'earnings' 
                ? 'text-[#FFB21A] font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-200 font-semibold'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span>Earnings</span>
            {navTab === 'earnings' && <span className="w-4 h-0.5 bg-[#FFB21A] rounded-full mt-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => setNavTab('history')}
            className={`flex flex-col items-center justify-center py-1 text-[11px] transition-all ${
              navTab === 'history' 
                ? 'text-[#FFB21A] font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-200 font-semibold'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span>History</span>
            {navTab === 'history' && <span className="w-4 h-0.5 bg-[#FFB21A] rounded-full mt-0.5" />}
          </button>
        </nav>

      </div>

    </div>
  );
}
