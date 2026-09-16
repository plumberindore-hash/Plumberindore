'use client';

import React from 'react';
import { Calendar, UserCheck, Wrench, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function HowItWorks() {
  const { openBookingModal } = useBooking();

  const steps = [
    {
      num: '01',
      title: 'Book Service Online',
      desc: 'Select your required service (AC, Fridge, Washing Machine, RO, Electrician, Plumber) & choose a date/time slot.',
      icon: Calendar
    },
    {
      num: '02',
      title: 'Technician Dispatched',
      desc: 'A skilled technician from PlumberIndore arrives promptly at your doorstep.',
      icon: UserCheck
    },
    {
      num: '03',
      title: 'Repair & Pay After Fix',
      desc: 'Diagnose issue with fixed upfront rate card. Inspect completed work and pay via UPI, Cash, or Card.',
      icon: Wrench
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 inline-block">
            Seamless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            How PlumberIndore Works
          </h2>
          <p className="text-sm text-slate-600">
            Get your home plumbing & appliances repaired in 3 simple steps without leaving your home.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 hover:border-amber-400 hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-md group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Icon className="w-7 h-7 stroke-[2.5]" />
                    </div>
                    <span className="text-4xl font-extrabold text-slate-300 group-hover:text-amber-500/40 transition-colors font-heading">
                      {st.num}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => openBookingModal('ac-repair')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-md transition-all inline-flex items-center gap-2"
          >
            <span>Book Your Service Now</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

      </div>
    </section>
  );
}
