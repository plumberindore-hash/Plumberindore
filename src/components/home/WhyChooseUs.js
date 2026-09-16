'use client';

import React from 'react';
import { ShieldCheck, IndianRupee, Clock, Wrench, UserCheck, PhoneCall } from 'lucide-react';

export default function WhyChooseUs() {
  const benefits = [
    {
      icon: Clock,
      title: 'Prompt Doorstep Service',
      desc: 'Local Indore technicians stationed across Vijay Nagar, Palasia, Bhanwarkuan & Super Corridor for rapid doorstep arrival.'
    },
    {
      icon: IndianRupee,
      title: 'Upfront Fixed Rate Card',
      desc: 'Know the exact ₹ cost before work begins. Fixed upfront rate card in Indian Rupees (₹) with zero surprise charges or hidden fees.'
    },
    {
      icon: ShieldCheck,
      title: '30-Day Service Guarantee',
      desc: 'If the same issue reoccurs within 30 days of repair, our technician will re-inspect and fix it completely free of cost.'
    },
    {
      icon: UserCheck,
      title: 'Technicians',
      desc: '100% skilled technicians equipped with uniforms, photo IDs, and safety gear.'
    },
    {
      icon: Wrench,
      title: '100% Genuine Spare Parts',
      desc: 'We only use authentic OEM spare parts with manufacturer warranty for ACs, fridges, washing machines & purifiers.'
    },
    {
      icon: PhoneCall,
      title: 'Dedicated Indore Support',
      desc: 'Direct phone & WhatsApp support desk based in Indore for instant booking assistance and live service updates.'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
            The Indore Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
            Why PlumberIndore
          </h2>
          <p className="text-sm text-slate-300">
            Delivering trust, speed, and technical perfection for thousands of Indore homes.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 hover:border-amber-500/50 hover:bg-slate-800 transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">{b.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
