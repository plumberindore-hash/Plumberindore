'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Wrench, 
  Zap, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Radio, 
  RefreshCw, 
  Lock, 
  Navigation, 
  User, 
  Check, 
  X, 
  ChevronRight,
  ExternalLink,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

export default function WorkerClaimDashboard() {
  const supabase = createClient();

  // State Management
  const [worker, setWorker] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('broadcast'); // 'broadcast' | 'my_jobs'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [channelStatus, setChannelStatus] = useState('connecting'); // 'connecting' | 'connected' | 'error'

  const audioCtxRef = useRef(null);

  // Synthesize Chime for New Booking Alerts (No external assets required)
  const playNotificationChime = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 2-Tone Urgent Dispatch Ding (880Hz -> 1320Hz)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc1.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio notification failed:', e);
    }
  }, [soundEnabled]);

  // 1. Initialize Worker Profile
  const loadWorkerProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch worker profile from workers table
        const { data: workerData, error } = await supabase
          .from('workers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (workerData) {
          setWorker(workerData);
          setIsOnline(workerData.is_available);
          return workerData;
        }
      }

      // Fallback demo worker profile for instant preview / simulation
      const demoWorker = {
        id: user?.id || 'd3b07384-d113-4f9e-9c2b-231a4a5e0110',
        full_name: 'Pankaj Sharma',
        phone: '+91 98267 43299',
        service_category: 'plumber',
        service_area: 'Vijay Nagar & Palasia, Indore',
        rating: 4.96,
        is_available: true
      };
      setWorker(demoWorker);
      setIsOnline(true);
      return demoWorker;
    } catch (err) {
      console.error('Error loading worker profile:', err);
      return null;
    }
  }, [supabase]);

  // 2. Fetch Initial Bookings (Pending & My Jobs)
  const fetchBookings = useCallback(async (currentWorker) => {
    if (!currentWorker) return;
    setLoading(true);
    try {
      // Fetch Pending bookings matching worker category
      let pendingQuery = supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending')
        .is('assigned_worker_id', null)
        .order('created_at', { ascending: false });

      if (currentWorker.service_category && currentWorker.service_category !== 'all') {
        pendingQuery = pendingQuery.ilike('service_category', currentWorker.service_category);
      }

      const { data: pendingData, error: pendingErr } = await pendingQuery;
      if (!pendingErr && pendingData) {
        setPendingBookings(pendingData);
      }

      // Fetch My Claimed Jobs
      const { data: myData, error: myErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('assigned_worker_id', currentWorker.id)
        .order('claimed_at', { ascending: false });

      if (!myErr && myData) {
        setMyJobs(myData);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Initial Boot
  useEffect(() => {
    loadWorkerProfile().then((w) => {
      if (w) fetchBookings(w);
    });
  }, [loadWorkerProfile, fetchBookings]);

  // 3. Supabase Realtime Subscription: Listen for New Bookings & Claim Events
  useEffect(() => {
    if (!worker) return;

    const channel = supabase
      .channel('public:bookings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          const newBooking = payload.new;
          // Verify category match and pending status
          const matchesCategory =
            !worker.service_category ||
            worker.service_category === 'all' ||
            (newBooking.service_category &&
              newBooking.service_category.toLowerCase() === worker.service_category.toLowerCase());

          if (matchesCategory && newBooking.status === 'pending' && !newBooking.assigned_worker_id) {
            setPendingBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);
            playNotificationChime();
            setAlert({
              type: 'urgent',
              message: `🚨 New ₹${newBooking.total_amount} Booking in ${newBooking.service_address?.split(',')[0] || 'Indore'}!`
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        (payload) => {
          const updated = payload.new;

          // If job was claimed by someone else or cancelled, remove from broadcast feed
          if (updated.status !== 'pending' || updated.assigned_worker_id) {
            setPendingBookings((prev) => prev.filter((b) => b.id !== updated.id));
          }

          // If claimed by this worker, update or add to My Jobs
          if (updated.assigned_worker_id === worker.id) {
            setMyJobs((prev) => [updated, ...prev.filter((b) => b.id !== updated.id)]);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setChannelStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setChannelStatus('error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, worker, playNotificationChime]);

  // 4. Claim Booking Action (Atomic Transaction Check)
  const handleClaimBooking = async (bookingId) => {
    if (!worker || claimingId) return;

    setClaimingId(bookingId);
    setAlert(null);

    try {
      // Direct call to atomic Postgres RPC function claim_booking_atomic
      const { data, error } = await supabase.rpc('claim_booking_atomic', {
        p_booking_id: bookingId,
        p_worker_id: worker.id
      });

      if (error) {
        // Fallback to direct conditional update if RPC is pending in migrations
        const { data: updateData, error: updateErr } = await supabase
          .from('bookings')
          .update({
            assigned_worker_id: worker.id,
            status: 'assigned',
            claimed_at: new Date().toISOString()
          })
          .eq('id', bookingId)
          .eq('status', 'pending')
          .is('assigned_worker_id', null)
          .select()
          .maybeSingle();

        if (updateErr || !updateData) {
          throw new Error('This booking was already accepted by another technician.');
        }

        // Successfully claimed via direct fallback
        setPendingBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setMyJobs((prev) => [updateData, ...prev]);
        setAlert({
          type: 'success',
          message: '✓ Booking claimed successfully! Address details unlocked.'
        });
        setActiveTab('my_jobs');
        return;
      }

      // Handled via RPC response
      if (data && data.success) {
        setPendingBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setAlert({
          type: 'success',
          message: '✓ Booking claimed successfully! Address details unlocked.'
        });
        fetchBookings(worker);
        setActiveTab('my_jobs');
      } else {
        throw new Error(data?.message || 'Booking was already accepted by another technician.');
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to claim booking.'
      });
      // Remove stale booking from list
      setPendingBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } finally {
      setClaimingId(null);
    }
  };

  // 5. Toggle Online Availability Status
  const toggleAvailability = async () => {
    if (!worker) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await supabase
        .from('workers')
        .update({ is_available: newStatus })
        .eq('id', worker.id);
    } catch (e) {
      console.warn('Could not persist availability toggle:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-16">
      
      {/* Top Operations Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20">
              ⚡
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>Dispatch Radar</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                  Live
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                {worker?.full_name || 'Technician'} • {worker?.service_area || 'Indore'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                soundEnabled 
                  ? 'bg-slate-800 border-slate-700 text-amber-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Online Toggle Switch */}
            <button
              onClick={toggleAvailability}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                isOnline 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-4">

        {/* Real-time Socket Connection Health Banner */}
        <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Radio className={`w-3.5 h-3.5 ${channelStatus === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-400 text-[11px]">
              Channel: {channelStatus === 'connected' ? 'Connected to Indore Fleet Radar' : 'Reconnecting...'}
            </span>
          </div>

          <button
            onClick={() => fetchBookings(worker)}
            className="flex items-center space-x-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync</span>
          </button>
        </div>

        {/* Global Notification Banner */}
        {alert && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all shadow-md ${
              alert.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              alert.type === 'urgent' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-bounce' :
              'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            <div className="flex items-center space-x-2">
              {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />}
              <span>{alert.message}</span>
            </div>
            <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'broadcast'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Available Broadcasts</span>
            {pendingBookings.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'broadcast' ? 'bg-slate-950 text-white' : 'bg-amber-400 text-slate-950 font-black'
              }`}>
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('my_jobs')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'my_jobs'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>My Claimed Jobs</span>
            {myJobs.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'my_jobs' ? 'bg-slate-950 text-white' : 'bg-slate-700 text-slate-200'
              }`}>
                {myJobs.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: AVAILABLE BROADCASTS (FIRST-TO-CLAIM) */}
        {activeTab === 'broadcast' && (
          <div className="space-y-3">
            {!isOnline && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3.5 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>You are currently <strong>Offline</strong>. Switch status to Online at top right to claim incoming jobs.</span>
              </div>
            )}

            {loading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
                <p className="text-xs">Scanning real-time broadcast frequency...</p>
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
                  <Radio className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <h3 className="font-bold text-slate-200 text-base">Radar Active: No Pending Broadcasts</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When a customer books in Indore, it will appear here immediately. First technician to tap "Accept Job" claims it.
                </p>
              </div>
            ) : (
              <div className="grid gap-3.5">
                {pendingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-900 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg shadow-black/40 transition-all animate-in fade-in zoom-in-95 duration-200"
                  >
                    {/* Header Row: Price, Category, Time */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 tracking-wider">
                            Urgent Request
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(b.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white mt-1">
                          {b.service_name}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Estimated Fare</span>
                        <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                          ₹{b.total_amount}
                        </div>
                      </div>
                    </div>

                    {/* Area & Privacy Safe Location Indicator */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold text-slate-200 truncate">
                          {b.service_address?.split(',')[0] || 'Indore'}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono shrink-0 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Exact address revealed upon claim
                      </span>
                    </div>

                    {/* Footer Row: First-To-Claim Action Button */}
                    <div className="pt-1 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Slot: {b.scheduled_date}, {b.time_slot}</span>
                      </div>

                      <button
                        onClick={() => handleClaimBooking(b.id)}
                        disabled={!isOnline || claimingId === b.id}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all ${
                          !isOnline 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : claimingId === b.id
                            ? 'bg-amber-300 text-slate-950 animate-pulse'
                            : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>{claimingId === b.id ? 'Claiming Lock...' : 'Accept Job (First Claim)'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY CLAIMED JOBS */}
        {activeTab === 'my_jobs' && (
          <div className="space-y-3">
            {myJobs.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto text-slate-600" />
                <h3 className="font-bold text-slate-300 text-base">No Active Jobs Claimed Yet</h3>
                <p className="text-xs text-slate-500">
                  Switch to the "Available Broadcasts" tab and accept a job when it appears.
                </p>
              </div>
            ) : (
              <div className="grid gap-3.5">
                {myJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                          ✓ Claimed & Assigned to You
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">
                          {job.service_name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          Ref #{job.booking_number || job.id.slice(0, 8)}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-400 font-mono">
                          ₹{job.total_amount}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {job.status === 'assigned' ? 'Action Required' : job.status}
                        </span>
                      </div>
                    </div>

                    {/* Customer Contact Box */}
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>Customer:</span>
                        </span>
                        <span className="font-bold text-slate-100">{job.customer_name}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>Address:</span>
                        </span>
                        <span className="font-medium text-slate-200 text-right max-w-[220px] truncate">
                          {job.service_address}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Time:</span>
                        </span>
                        <span className="font-medium text-slate-300">
                          {job.scheduled_date}, {job.time_slot}
                        </span>
                      </div>
                    </div>

                    {/* Quick Doorstep Actions: Call & Map Navigation */}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${job.customer_phone}`}
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.service_address + ', Indore')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate (Maps)</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
