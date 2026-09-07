'use client';

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, ShieldAlert, FileText, Send } from 'lucide-react';

export default function DisputeTicketModal({ isOpen, onClose, booking }) {
  const [issueType, setIssueType] = useState('Re-inspection Request');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const tid = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketId(tid);
    setSubmitted(true);

    // Notify backend
    fetch('/api/booking/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claim',
        booking,
        claimReason: `Dispute / Ticket: ${issueType}`,
        claimDescription: details
      })
    }).catch(err => console.warn('Dispute ticket dispatch error:', err));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">Raise Support Ticket / Dispute</h3>
              <p className="text-xs text-amber-400 font-semibold">Booking #{booking.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Dispute / Complaint Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Re-inspection Request">Re-inspection Request (Same Issue Under 30-Day Warranty)</option>
              <option value="Technician Conduct">Technician Conduct / Delayed Arrival</option>
              <option value="Billing Query">Billing Query / Price Card Clarification</option>
              <option value="Spare Part Defect">Spare Part Defect Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Describe Issue Details</label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide specific details so our Indore Operations Manager can resolve it within 2 hours..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          {submitted && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ticket Generated: {ticketId}</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Assigned to Senior Service Operations Manager in Indore. Resolution expected within 2 hours.
              </p>
            </div>
          )}

          {!submitted ? (
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Dispute Ticket</span>
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
