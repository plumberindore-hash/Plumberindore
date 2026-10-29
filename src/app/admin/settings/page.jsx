'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, QrCode, Phone, Mail, Building, RefreshCw, X } from 'lucide-react';

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
    business_upi_vpa: 'plumberindore@okaxis'
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
            business_upi_vpa: s.business_upi_vpa || 'plumberindore@okaxis'
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
      business_upi_vpa: form.business_upi_vpa
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
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Operational Parameters</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B33] tracking-tight">
          Platform Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure commission shares, inspection fees, wallet thresholds, and official business contacts.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-6">
        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Platform operational settings saved and applied to database!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FFB21A]" />
            <span>Loading platform settings...</span>
          </div>
        ) : (
          <>
            {/* Financial Parameters */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Revenue & Wallet Rules</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Platform Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={form.platform_commission_percent}
                    onChange={(e) => setForm({ ...form, platform_commission_percent: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default 10% platform fee, 90% goes to partner.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Standard Inspection Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.inspection_fee_rupees}
                    onChange={(e) => setForm({ ...form, inspection_fee_rupees: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Upfront inspection visit charge (₹299 standard).</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Minimum Wallet Balance (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.minimum_worker_wallet_balance_rupees}
                    onChange={(e) => setForm({ ...form, minimum_worker_wallet_balance_rupees: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Workers with wallet balance below this amount cannot accept new jobs.
                </p>
              </div>
            </div>

            {/* Business Contact Configuration */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Official Business Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Business Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.business_name}
                    onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Support Phone</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.business_phone}
                    onChange={(e) => setForm({ ...form, business_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Support Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.business_email}
                    onChange={(e) => setForm({ ...form, business_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                  />
                </div>
              </div>

              {/* Business UPI ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Official Business UPI VPA (for dynamic doorstep QR)</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.business_upi_vpa}
                  onChange={(e) => setForm({ ...form, business_upi_vpa: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#FFB21A] focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Doorstep dynamic QR codes generated for customers will route payments directly to this UPI address.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB21A] to-[#F59E0B] text-[#0F1B33] font-black text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving to Database...' : 'Save Settings to Database'}</span>
            </button>
          </>
        )}
      </form>
    </div>
  );
}
