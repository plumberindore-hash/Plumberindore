'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Search, Clock, Award, PhoneCall, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { checkPincodeServiceability } from '../../data/pincodesData';
import { useLanguage } from '../../context/LanguageContext';
import { IS_BOOKING_ENABLED } from '../../config/serviceArea.js';

export default function Hero() {
  const { openBookingModal, setUserPincode } = useBooking();
  const { t } = useLanguage();

  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  const handlePincodeSearch = (e) => {
    e.preventDefault();
    const result = checkPincodeServiceability(pincodeInput);
    setPincodeResult(result);
    if (result.valid && result.serviceable && IS_BOOKING_ENABLED) {
      setUserPincode(pincodeInput);
    }
  };

  return (
    <section className="relative bg-slate-950 text-white overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-slate-800">
      
      {/* Background Decorative Pattern & Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Copy & Pincode Checker */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Badge: Honest Guarantee Pill (No Fake Stars) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 shadow-md">
              <Award className="w-4 h-4 text-amber-400" />
              <span>⚡ Certified Doorstep Services Across Indore</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15]">
              Doorstep <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Home Services</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t.heroSubtitle}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Transparent Rate Card</span>
              </div>
            </div>

            {/* Pincode Search Box Widget */}
            <div className="pt-2 max-w-md mx-auto lg:mx-0">
              <form onSubmit={handlePincodeSearch} className="bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    placeholder="Enter 6-Digit Indore Pincode"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Check Availability</span>
                </button>
              </form>

              {/* Pincode Validation Feedback */}
              {pincodeResult && (
                <div className={`mt-2 text-xs font-semibold p-3 rounded-xl border flex items-start gap-2.5 text-left ${
                  pincodeResult.valid && pincodeResult.serviceable && IS_BOOKING_ENABLED
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                }`}>
                  {pincodeResult.valid && pincodeResult.serviceable && IS_BOOKING_ENABLED ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{pincodeResult.message}</span>
                </div>
              )}
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => openBookingModal('ac-repair')}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 text-sm transition-all transform hover:-translate-y-0.5"
              >
                Book Doorstep Service Now
              </button>

              <a
                href="tel:+919174934135"
                className="hidden sm:flex w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-800 text-xs sm:text-sm transition-all items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>Helpline: +91 91749 34135</span>
              </a>
            </div>

          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group">
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
                alt="PlumberIndore Technicians"
                className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              {/* Floating Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Verified Technicians</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Fixed upfront rate card. Inspection fee waived if repair is approved.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
