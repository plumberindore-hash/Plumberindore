'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Send, FileText } from 'lucide-react';

export default function WarrantyClaimModal({ isOpen, onClose, booking }) {
  const [claimReason, setClaimReason] = useState('Cooling / Leakage Issue Persists');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [claimId, setClaimId] = useState(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cid = `WRN-${Math.floor(10000 + Math.random() * 90000)}`;
    setClaimId(cid);
    setSubmitted(true);

    // Notify backend
    fetch('/api/booking/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claim',
        booking,
        claimReason,
        claimDescription: description
      })
    }).catch(err => console.warn('Warranty claim dispatch error:', err));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">File 30-Day Warranty Claim</h3>
              <p className="text-xs text-emerald-400 font-semibold">Free Doorstep Re-Inspection (# {booking.id})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">{booking.serviceName}</div>
            <div className="text-[11px] text-slate-500">
              Warranty Coverage: <strong className="text-emerald-700 font-bold">30 Days (100% Free Labor & Spare Inspection)</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Claim Category</label>
            <select
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Cooling / Leakage Issue Persists">Cooling / Leakage Issue Persists</option>
              <option value="Replaced Spare Part Check">Replaced Spare Part Checkup</option>
              <option value="Unusual Noise / Vibration">Unusual Noise or Vibration After Repair</option>
              <option value="General Free Re-Inspection">General Free Re-Inspection</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Explanation</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what issue you are experiencing so our lead Indore engineer brings proper testing tools..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          {submitted && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Warranty Claim Filed: {claimId}</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Senior Lead Technician assigned for zero-cost doorstep re-inspection within 24 hours.
              </p>
            </div>
          )}

          {!submitted ? (
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Free Warranty Claim</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs"
            >
              Close Window
            </button>
          )}

        </form>

      </div>
    </div>
  );
}
