'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Zap, 
  Bug, 
  Hammer, 
  Paintbrush, 
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SERVICES_DATA } from '../../data/servicesData';
import { getLegacyServiceRedirect } from '../../data/categoriesData';
import { useBooking } from '../../context/BookingContext';
import Breadcrumbs from '../layout/Breadcrumbs';

export default function LocationPageClient({ areaInfo }) {
  const { openBookingModal } = useBooking();
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Indore Hubs', href: '/#indore-service-areas' },
    { name: areaInfo.name, href: `/${areaInfo.slug}` }
  ];

  const faqs = [
    {
      q: `How quickly can a technician arrive in ${areaInfo.name}?`,
      a: `Our assigned doorstep technicians and electricians are positioned near ${areaInfo.landmark} and typically reach your home in ${areaInfo.eta} across Pincode ${areaInfo.pincode}.`
    },
    {
      q: `What services are available in ${areaInfo.name}, Indore?`,
      a: `We provide complete doorstep services in ${areaInfo.name} including Plumbing (taps, pipes, leakages, toilets, motor pumps), Electrician (wiring, fans, MCB, switchboards), Pest Control (cockroaches, bed bugs, termites), AC Repair & Servicing, Refrigerator Repair, Washing Machine Repair, RO Purifier Filter Replacement, Geyser & Water Heater Repair, Microwave Repair, Kitchen Chimney Repair, Air Cooler Servicing, Carpenter Services, and Painting & Waterproofing.`
    },
    {
      q: `Is there a warranty on repairs done in ${areaInfo.name}?`,
      a: `Yes! Every repair and servicing booked in ${areaInfo.name} comes with an official 30-Day Doorstep Warranty and 100% price protection with genuine spare parts.`
    },
    {
      q: `What are the payment options for ${areaInfo.name} residents?`,
      a: `You can pay safely after the doorstep service is completed via Cash, UPI QR (Google Pay, PhonePe, Paytm), or Net Banking/Cards with an instant digital invoice.`
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* 1. Hero Header */}
      <div className="bg-slate-900 text-white pt-8 pb-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          
          <Breadcrumbs items={breadcrumbItems} />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 shadow-sm">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{areaInfo.eta} Doorstep Arrival in {areaInfo.name}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white leading-tight">
              Plumbing, Electrician & Pest Control in {areaInfo.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {areaInfo.description} Certified local plumbers, electricians, pest control specialists & appliance engineers active near {areaInfo.landmark} (Pincode: {areaInfo.pincode}).
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <span className="bg-emerald-950/80 text-emerald-300 font-bold px-2.5 py-1 rounded-md border border-emerald-800/80 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {areaInfo.activeTechs} On-Duty Technicians
              </span>
              <span className="bg-slate-800 text-slate-200 font-bold px-2.5 py-1 rounded-md border border-slate-700">
                Pincode {areaInfo.pincode}
              </span>
              <span className="bg-amber-950/60 text-amber-300 font-bold px-2.5 py-1 rounded-md border border-amber-800/60">
                30-Day Service Warranty
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => openBookingModal('plumber')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl shadow-lg text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>Book Doorstep Service in {areaInfo.name}</span>
              </button>

              <a
                href="tel:+919174934135"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Hotline: +91 91749 34135</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-10 sm:space-y-12">
        
        {/* 2. Quick Highlight Grid: Key Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">Doorstep Service</div>
              <div className="text-[11px] text-slate-500">Fast doorstep dispatch</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">30-Day Warranty</div>
              <div className="text-[11px] text-slate-500">Assured post-fix cover</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">Fixed Rate Card</div>
              <div className="text-[11px] text-slate-500">Zero hidden fees</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">{areaInfo.pincode} Indore</div>
              <div className="text-[11px] text-slate-500">{areaInfo.activeTechs} active pros</div>
            </div>
          </div>
        </div>

        {/* 3. ALL SERVICES MENTIONED & AVAILABLE IN THIS LOCATION */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-soft-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 inline-block mb-2">
                Complete Catalog ({SERVICES_DATA.length} Services)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                All Doorstep Services Available in {areaInfo.name}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Select any service to book an instant technician visit in {areaInfo.name}
            </p>
          </div>

          {/* 2-Column Mobile Grid / 3-Column Desktop Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {SERVICES_DATA.map((srv) => (
              <div 
                key={srv.id} 
                className="bg-slate-50/70 hover:bg-white rounded-2xl p-3 sm:p-5 border border-slate-200 hover:border-amber-400 hover:shadow-soft-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-24 sm:h-36 rounded-xl overflow-hidden bg-slate-900 relative">
                    <img
                      src={srv.bannerImage}
                      alt={`${srv.name} in ${areaInfo.name}, Indore`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
                      {srv.badge || 'Indore Verified'}
                    </div>
                  </div>

                  <div>
                    <Link 
                      href={getLegacyServiceRedirect(srv.slug)}
                      className="text-xs sm:text-base font-bold text-slate-900 font-heading hover:text-amber-600 transition-colors line-clamp-1 leading-tight block"
                    >
                      {srv.name}
                    </Link>
                    <p className="hidden sm:block text-xs text-slate-600 leading-snug line-clamp-2 mt-1">
                      {srv.description}
                    </p>
                  </div>

                  {/* Top package / feature preview */}
                  {srv.packages && srv.packages.length > 0 && (
                    <div className="hidden sm:block bg-white p-2 rounded-xl border border-slate-200/60 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-800">Popular: </span>
                      {srv.packages[0].title}
                    </div>
                  )}
                </div>

                <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-slate-200/60 flex items-center justify-between gap-1.5">
                  <div>
                    <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold block uppercase">Starts At</span>
                    <span className="text-xs sm:text-base font-extrabold text-slate-900 font-heading">₹{srv.startingPrice}</span>
                  </div>

                  <button
                    onClick={() => openBookingModal(srv.slug, { title: srv.name, price: srv.startingPrice })}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10px] sm:text-xs py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Local Landmark Coverage & Neighborhood Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-heading">
              Local Areas & Landmarks Served in {areaInfo.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our doorstep service network covers residential townships, commercial centers, apartments, and markets across {areaInfo.name}, including key landmarks such as <strong className="text-slate-800">{areaInfo.landmark}</strong> and surrounding sub-localities in Pincode {areaInfo.pincode}.
            </p>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-700">
                <span>Central Landmark:</span>
                <strong className="text-slate-900 text-right">{areaInfo.landmark}</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Postal Pincode:</span>
                <strong className="text-emerald-700">{areaInfo.pincode} (Indore)</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Average Doorstep ETA:</span>
                <strong className="text-amber-700">{areaInfo.eta}</strong>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-soft-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 inline-block">
                Emergency & Standard Booking
              </span>
              <h3 className="text-xl font-bold font-heading text-white">
                Need Fast Doorstep Repair in {areaInfo.name}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Whether you have an overflowing water tank, a tripping MCB, cockroach infestation, or an AC cooling failure, our certified technicians are on standby across {areaInfo.name}.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openBookingModal('plumber')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 px-6 rounded-xl text-xs shadow-md transition-all text-center"
              >
                Instant Booking ({areaInfo.name})
              </button>
              <a
                href="tel:+919174934135"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-5 rounded-xl text-xs border border-slate-700 text-center"
              >
                +91 91749 34135
              </a>
            </div>
          </div>
        </div>

        {/* 5. FAQs for this Area */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-600">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Local Service FAQs</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-heading">
              Frequently Asked Questions in {areaInfo.name}
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100 font-bold text-xs sm:text-sm text-slate-900 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
