'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, MapPin, Clock, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, 
  Wrench, HelpCircle, PhoneCall, Sparkles, Tag, Star, AlertTriangle
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { checkPincodeServiceability } from '../../data/pincodesData';
import { IS_BOOKING_ENABLED } from '../../config/serviceArea.js';
import Breadcrumbs from '../layout/Breadcrumbs';
import PlumbingServicesGrid from '../services/PlumbingServicesGrid';

export default function CategoryHubClient({ category, baseService }) {
  const { openBookingModal, userPincode, setUserPincode } = useBooking();
  const [pinInput, setPinInput] = useState(userPincode || '452010');
  const [pinResult, setPinResult] = useState(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: category.name, href: category.url }
  ];

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    const res = checkPincodeServiceability(pinInput);
    setPinResult(res);
    if (res.valid && res.serviceable && IS_BOOKING_ENABLED) {
      setUserPincode(pinInput);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Hero Header */}
      <div className="bg-slate-900 text-white pt-8 pb-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <Breadcrumbs items={breadcrumbs} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Indore’s Verified Doorstep Service Network</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white leading-tight">
                {category.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {category.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  30-Day Warranty
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-semibold">Prompt Doorstep Service Across Indore</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-400 font-semibold">100% Genuine Spare Parts</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => openBookingModal(category.subcategories[0]?.serviceId || 'ac-repair')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl shadow-lg text-sm transition-all text-center cursor-pointer"
                >
                  Book Service (Starts ₹{category.startingPrice})
                </button>
                <a
                  href="tel:+919174934135"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl text-xs border border-slate-700 flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Call Helpline: +91 91749 34135</span>
                </a>
              </div>

            </div>

            {/* Right Hero Banner */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                <img
                  src={category.bannerImage}
                  alt={category.name}
                  className="w-full h-64 sm:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-xs text-white bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700">
                  ⚡ <span className="font-bold text-amber-400">Prompt Doorstep Service</span> guaranteed across all Vijay Nagar, Palasia & Indore sectors.
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 space-y-12">
        
        {/* Pincode Availability Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
          <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-heading shrink-0">
              <MapPin className="w-5 h-5 text-amber-500" />
              <span>Check Indore Pincode Availability:</span>
            </div>
            <div className="flex-1 w-full flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter 6-digit Pincode (e.g. 452010)"
                className="w-full sm:w-48 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shrink-0 cursor-pointer"
              >
                Check
              </button>
            </div>
            {pinResult && (
              <div className={`text-xs font-semibold px-4 py-2.5 rounded-2xl w-full sm:w-auto flex items-start gap-2.5 border ${
                pinResult.valid && pinResult.serviceable && IS_BOOKING_ENABLED
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}>
                {pinResult.valid && pinResult.serviceable && IS_BOOKING_ENABLED ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{pinResult.message}</span>
              </div>
            )}
          </form>
        </div>

        {/* Subcategories Catalog Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 inline-block font-heading">
                All {category.name} Solutions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
                Explore {category.name} Subcategories ({category.subcategories.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md sm:text-right">
              Fixed rate cards, verified background-checked technicians, and genuine spare parts.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {category.subcategories.map((sub) => (
              <div
                key={sub.slug}
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-28 sm:h-44 overflow-hidden bg-slate-900">
                    <img
                      src={sub.bannerImage}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[9px] sm:text-[11px] font-extrabold px-1.5 sm:px-2.5 py-0.5 rounded-full border border-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>30-Day Warranty</span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 space-y-1 sm:space-y-2">
                    <h3 className="text-xs sm:text-lg font-bold text-slate-900 font-heading line-clamp-1 leading-tight">
                      {sub.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 leading-relaxed hidden sm:block">
                      {sub.description}
                    </p>
                    
                    <div className="pt-2 flex items-center justify-between text-[10px] sm:text-xs border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Starts from</span>
                      <span className="text-xs sm:text-base font-extrabold text-amber-600 font-heading">₹{sub.startingPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-5 pt-0 flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                  <Link
                    href={sub.url}
                    className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition-colors"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => openBookingModal(sub.serviceId)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* If Plumbing, show full 11-category interactive grid */}
        {category.id === 'plumbing' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 font-heading">Comprehensive Plumbing Rate Card</h3>
            <PlumbingServicesGrid />
          </div>
        )}

        {/* 5-6 Real-World Problems Solved in Indore */}
        {baseService && baseService.issues && baseService.issues.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 inline-block font-heading">
                Common Breakdown Scenarios
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
                Common {category.name} Problems Solved in Indore ({baseService.issues.length} Issues)
              </h2>
              <p className="text-xs text-slate-500">
                Our technicians identify the exact root cause and replace parts with genuine OEM spares on site.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {baseService.issues.map((iss, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-3 hover:border-amber-400 hover:bg-white transition-all shadow-2xs">
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-bold text-slate-900 leading-snug">{iss.title}</span>
                    </div>
                    {iss.cause && (
                      <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                        <strong className="text-slate-700">Root Cause: </strong>{iss.cause}
                      </p>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between pl-6">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Fixed Rate</span>
                    <span className="text-xs font-extrabold text-amber-600 font-heading">From ₹{iss.startingPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5-6 Local FAQs Section */}
        {baseService && baseService.faqs && baseService.faqs.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-500" />
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
                  Frequently Asked Questions ({category.name} - Indore)
                </h2>
                <p className="text-xs text-slate-500">
                  Real answers to common questions asked by Indore homeowners.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {baseService.faqs.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Local Service Coverage Notice */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 text-center space-y-4 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading">Need Doorstep {category.name} in Indore?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            PlumberIndore technicians are active across Vijay Nagar, Palasia, Bhanwarkuan, Rau, Sudama Nagar, Annapurna, and all Indore sectors with prompt doorstep service.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openBookingModal(category.subcategories[0]?.serviceId || 'ac-repair')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-md cursor-pointer"
            >
              Book Doorstep Technician Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
