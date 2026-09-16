'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Clock, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Wrench, HelpCircle, PhoneCall, AlertCircle, AlertTriangle } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { checkPincodeServiceability } from '../../data/pincodesData';
import { IS_BOOKING_ENABLED } from '../../config/serviceArea.js';
import PlumbingServicesGrid from './PlumbingServicesGrid';

export default function ServiceDetailPageClient({ service }) {
  const { openBookingModal, userPincode, setUserPincode } = useBooking();
  const [pinInput, setPinInput] = useState(userPincode || '452010');
  const [pinResult, setPinResult] = useState(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-amber-400 transition-colors">Services</Link>
            <span>/</span>
            <span className="text-amber-400 font-semibold">{service.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>30-Day Post Service Warranty in Indore</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white leading-tight">
                {service.name} in Indore
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {service.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  30-Day Warranty
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-semibold">Prompt Doorstep Service</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-400 font-semibold">100% Genuine Spares</span>
              </div>

              {/* Quick Book Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => openBookingModal(service.id)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl shadow-lg text-sm transition-all text-center cursor-pointer"
                >
                  Book Service (Starts ₹{service.startingPrice})
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

            {/* Right Banner Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                <img
                  src={service.bannerImage}
                  alt={`${service.name} in Indore`}
                  className="w-full h-64 sm:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-xs text-white bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700">
                  ⚡ <span className="font-bold text-amber-400">Prompt Doorstep Service</span> guaranteed across all Vijay Nagar, Palasia, Bhanwarkuan & Indore pincodes.
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 space-y-12">
        
        {/* Pincode Availability Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
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
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shrink-0"
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

        {/* Dedicated Plumbing Services Grid if Plumber service */}
        {service.id === 'plumber' ? (
          <PlumbingServicesGrid />
        ) : (
          /* Standard Pricing / Packages Section for other appliances */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-heading">
                  Service Packages & Fixed Pricing
                </h2>
                <p className="text-xs text-slate-500">
                  Transparent labor & service charges. Doorstep inspection fee waived if repair is approved.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-900 font-heading">{pkg.title}</h3>
                      <div className="text-right">
                        <div className="text-xl font-extrabold text-slate-900 font-heading">₹{pkg.price}</div>
                        {pkg.originalPrice && (
                          <div className="text-xs text-slate-400 line-through">₹{pkg.originalPrice}</div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{pkg.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Duration: {pkg.duration}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      30-Day Warranty Included
                    </span>

                    <button
                      onClick={() => openBookingModal(service.id, pkg)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Select & Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5-6 Real-World Problems Solved */}
        {service.issues && service.issues.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 inline-block">
                Doorstep Diagnostics
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
                Common {service.name} Problems Solved in Indore ({service.issues.length} Issues)
              </h2>
              <p className="text-xs text-slate-500">
                Our technicians identify the exact root cause and replace parts with genuine OEM spares on site.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.issues.map((iss, i) => (
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

        {/* 5-6 FAQ Accordion Section */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-500" />
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
                  Frequently Asked Questions ({service.name} - Indore)
                </h2>
                <p className="text-xs text-slate-500">
                  Real answers to common questions asked by Indore homeowners.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {service.faqs.map((faq, idx) => {
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
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading">Need Doorstep {service.name} in Indore?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            PlumberIndore technicians are active across Vijay Nagar, Palasia, Bhanwarkuan, Rau, Sudama Nagar, Annapurna, and all Indore sectors with prompt doorstep service.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openBookingModal(service.id)}
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
