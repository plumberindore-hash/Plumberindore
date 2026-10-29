'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, QrCode, Phone, Mail, Building, RefreshCw, X, Zap, MessageSquare } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [form, setForm] = useState({
    platform_commission_percent: '10',
    minimum_worker_wallet_balance_rupees: '100',
    inspection_fee_rupees: '299',
    heartbeat_timeout_minutes: '15',
    business_name: 'PlumberIndore',
    business_phone: '+91 92299 59827',
    business_email: 'plumberindore@gmail.com',
    business_upi_vpa: 'plumberindore@okaxis',
    auto_dispatch_broadcast: true,
    dispatch_mode: 'AUTO_BROADCAST'
  });

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setForm({
            platform_commission_percent: String(s.platform_commission_percent != null ? s.platform_commission_percent : 10),
            minimum_worker_wallet_balance_rupees: String(Math.round((s.minimum_worker_wallet_balance_paise || 10000) / 100)),
            inspection_fee_rupees: String(Math.round((s.inspection_fee_paise || 29900) / 100)),
            heartbeat_timeout_minutes: String(s.heartbeat_timeout_minutes || 15),
            business_name: s.business_name || 'PlumberIndore',
            business_phone: s.business_phone || '+91 92299 59827',
            business_email: s.business_email || 'plumberindore@gmail.com',
            business_upi_vpa: s.business_upi_vpa || 'plumberindore@okaxis',
            auto_dispatch_broadcast: s.auto_dispatch_broadcast !== false,
            dispatch_mode: s.dispatch_mode || 'AUTO_BROADCAST'
          });
        }
      } catch (err) {
        console.warn('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      platform_commission_percent: Number(form.platform_commission_percent),
      minimum_worker_wallet_balance_paise: Number(form.minimum_worker_wallet_balance_rupees) * 100,
      inspection_fee_paise: Number(form.inspection_fee_rupees) * 100,
      heartbeat_timeout_minutes: Number(form.heartbeat_timeout_minutes),
      business_name: form.business_name,
      business_phone: form.business_phone,
      business_email: form.business_email,
      business_upi_vpa: form.business_upi_vpa,
      auto_dispatch_broadcast: Boolean(form.auto_dispatch_broadcast),
      dispatch_mode: form.dispatch_mode
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMessage(data.error || 'Failed to save settings');
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className=\"space-y-6 max-w-4xl animate-in fade-in duration-300\">
      {/* Header */}
      <div className=\"bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs\">
        <div className=\"flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1\">
          <Settings className=\"w-3.5 h-3.5 text-[#F59E0B]\" />
          <span>Operational Parameters</span>
        </div>
        <h1 className=\"text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight\">
          Platform Settings
        </h1>
        <p className=\"text-sm text-slate-500 mt-0.5\">
          Configure commission shares, inspection fees, wallet thresholds, and official business contacts.
        </p>
      </div>

      <form onSubmit={handleSave} className=\"bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-6\">
        {saved && (
          <div className=\"p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200\">
            <CheckCircle2 className=\"w-4 h-4 text-emerald-600 shrink-0\" />
            <span>Platform operational settings saved and applied to database!</span>
          </div>
        )}

        {errorMessage && (
          <div className=\"p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between\">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)}><X className=\"w-4 h-4\" /></button>
          </div>
        )}

        {loading ? (
          <div className=\"py-12 text-center text-slate-400\">
            <RefreshCw className=\"w-6 h-6 animate-spin mx-auto mb-2 text-[#FFB21A]\" />
            <span className=\"text-xs\">Loading operational parameters...</span>
          </div>
        ) : (
          <>
            <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-6\">
              {/* Commission % */}
              <div>
                <label className=\"block text-xs font-bold text-slate-700 uppercase mb-1\">
                  Platform Commission (%)
                </label>
                <div className=\"relative\">
                  <input
                    type=\"number\"
                    min=\"0\"
                    max=\"100\"
                    required
                    value={form.platform_commission_percent}
                    onChange={(e) => setForm({ ...form, platform_commission_percent: e.target.value })}
                    className=\"w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#FFB21A] focus:outline-none\"
                  />
                  <span className=\"absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm\">%</span>
                </div>
                <p className=\"text-[11px] text-slate-400 mt-1\">
                  Standard 10% platform share / 90% technician payout.
                </p>
              </div>

              {/* Default Inspection Fee */}
              <div>
                <label className=\"block text-xs font-bold text-slate-700 uppercase mb-1\">
                  Standard Inspection Fee (₹)
                </label>
                <div className=\"relative\">
                  <span className=\"absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm\">₹</span>
                  <input
                    type=\"number\"
                    min=\"0\"
                    required
                    value={form.inspection_fee_rupees}
                    onChange={(e) => setForm({ ...form, inspection_fee_rupees: e.target.value })}
                    className=\"w-full pl-8 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#FFB21A] focus:outline-none\"
                  />
                </div>
                <p className=\"text-[11px] text-slate-400 mt-1\">
                  Auto-waived whenever any repair parts or services are chosen.
                </p>
              </div>

              {/* Heartbeat Timeout */}
              <div>
                <label className=\"block text-xs font-bold text-slate-700 uppercase mb-1\">
                  Heartbeat Inactivity Timeout (Minutes)
                </label>
                <input
                  type=\"number\"
                  min=\"5\"
                  max=\"120\"
                  required
                  value={form.heartbeat_timeout_minutes}
                  onChange={(e) => setForm({ ...form, heartbeat_timeout_minutes: e.target.value })}
                  className=\"w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#FFB21A] focus:outline-none\"
                />
                <p className=\"text-[11px] text-slate-400 mt-1\">
                  Workers are marked OFFLINE if no heartbeat is received within this window.
                </p>
              </div>

              {/* Low Wallet Threshold */}
              <div>
                <label className=\"block text-xs font-bold text-slate-700 uppercase mb-1\">
                  Minimum Wallet Balance (₹)
                </label>
                <div className=\"relative\">
                  <span className=\"absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm\">₹</span>
                  <input
                    type=\"number\"
                    min=\"0\"
                    required
                    value={form.minimum_worker_wallet_balance_rupees}
                    onChange={(e) => setForm({ ...form, minimum_worker_wallet_balance_rupees: e.target.value })}
                    className=\"w-full pl-8 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#FFB21A] focus:outline-none\"
                  />
                </div>
                <p className=\"text-[11px] text-slate-400 mt-1\">
                  Workers with wallet balance below this amount cannot accept new jobs.
                </p>
              </div>
            </div>

            {/* Automated Dispatch & WhatsApp Broadcast */}
            <div className=\"pt-4 border-t border-slate-100 space-y-4\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <h3 className=\"text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5\">
                    <Zap className=\"w-3.5 h-3.5 text-[#F59E0B]\" />
                    <span>Automated Dispatch & WhatsApp Broadcast</span>
                  </h3>
                  <p className=\"text-[11px] text-slate-400 mt-0.5\">
                    Automatically match incoming bookings to available technicians and dispatch instant WhatsApp alerts with live tracking links.
                  </p>
                </div>
                <label className=\"relative inline-flex items-center cursor-pointer\">
                  <input
                    type=\"checkbox\"
                    checked={form.auto_dispatch_broadcast}
                    onChange={(e) => setForm({ ...form, auto_dispatch_broadcast: e.target.checked })}
                    className=\"sr-only peer\"
                  />
                  <div className=\"w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500\"></div>
                </label>
              </div>

              <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2\">
                <div>
                  <label className=\"block text-xs font-bold text-slate-700 mb-1\">
                    Dispatch Routing Strategy
                  </label>
                  <select
                    value={form.dispatch_mode}
                    onChange={(e) => setForm({ ...form, dispatch_mode: e.target.value })}
                    className=\"w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-[#FFB21A] focus:outline-none\"
                  >
                    <option value=\"AUTO_BROADCAST\">Auto Broadcast & Zone Preferred (Recommended)</option>
                    <option value=\"ZONE_AUTO\">Strict Zone Direct Allocation</option>
                    <option value=\"MANUAL\">Manual Allocation Only (Ops Portal)</option>
                  </select>
                  <p className=\"text-[11px] text-slate-400 mt-1\">
                    Matches closest available technician in sector first, then broadcasts if technician is busy.
                  </p>
                </div>

                <div className=\"p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5\">
                  <MessageSquare className=\"w-4 h-4 text-amber-600 shrink-0 mt-0.5\" />
                  <div className=\"text-[11px] text-amber-900 leading-relaxed\">
                    <strong>Instant WhatsApp Notification:</strong> When enabled, technicians receive interactive push alerts with customer details and a 1-tap console link. Customers receive live tracking URLs with 4-digit Start OTP verification.
                  </div>
                </div>
              </div>
            </div>

            {/* Business Contact Configuration */}
            <div className=\"pt-4 border-t border-slate-100 space-y-4\">
              <h3 className=\"text-xs font-black uppercase tracking-wider text-slate-500\">Official Business Details</h3>

              <div className=\"grid grid-cols-1 sm:grid-cols-3 gap-4\">
                <div>
                  <label className=\"block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5\">
                    <Building className=\"w-3.5 h-3.5 text-[#F59E0B]\" />
                    <span>Business Name</span>
                  </label>
                  <input
                    type=\"text\"
                    required
                    value={form.business_name}
                    onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                    className=\"w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FFB21A] focus:outline-none\"
                  />
                </div>

                <div>
                  <label className=\"block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5\">
                    <Phone className=\"w-3.5 h-3.5 text-[#F59E0B]\" />
                    <span>Support Phone</span>
                  </label>
                  <input
                    type=\"text\"
                    required
                    value={form.business_phone}
                    onChange={(e) => setForm({ ...form, business_phone: e.target.value })}
                    className=\"w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FFB21A] focus:outline-none\"
                  />
                </div>

                <div>
                  <label className=\"block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5\">
                    <Mail className=\"w-3.5 h-3.5 text-[#F59E0B]\" />
                    <span>Support Email</span>
                  </label>
                  <input
                    type=\"email\"
                    required
                    value={form.business_email}
                    onChange={(e) => setForm({ ...form, business_email: e.target.value })}
                    className=\"w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FFB21A] focus:outline-none\"
                  />
                </div>
              </div>

              {/* Business UPI ID */}
              <div>
                <label className=\"block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5\">
                  <QrCode className=\"w-3.5 h-3.5 text-[#F59E0B]\" />
                  <span>Official Business UPI VPA (for dynamic doorstep QR)</span>
                </label>
                <input
                  type=\"text\"
                  required
                  value={form.business_upi_vpa}
                  onChange={(e) => setForm({ ...form, business_upi_vpa: e.target.value })}
                  className=\"w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#FFB21A] focus:outline-none\"
                />
                <p className=\"text-[11px] text-slate-400 mt-1\">
                  Doorstep dynamic QR codes generated for customers will route payments directly to this UPI address.
                </p>
              </div>
            </div>

            <button
              type=\"submit\"
              disabled={submitting}
              className=\"px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2\"
            >
              <Save className=\"w-4 h-4\" />
              <span>{submitting ? 'Saving to Database...' : 'Save Settings to Database'}</span>
            </button>
          </>
        )}
      </form>
    </div>
  );
}