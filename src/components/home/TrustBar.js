'use client';

import React from 'react';
import { Clock, ShieldCheck, Tag, CheckCircle2 } from 'lucide-react';

export default function TrustBar() {
  const trustItems = [
    {
      icon: Clock,
      title: 'Prompt Arrival',
      desc: 'Rapid doorstep response across all Indore sectors'
    },
    {
      icon: ShieldCheck,
      title: '30-Day Warranty',
      desc: 'Spare parts guarantee'
    },
    {
      icon: Tag,
      title: 'Fixed Upfront Rates',
      desc: 'Transparent rate card before work begins'
    },
    {
      icon: CheckCircle2,
      title: 'Technicians',
      desc: 'Uniformed & certified Indore technicians'
    }
  ];

  return (
    <section className="bg-slate-900 border-b border-slate-800 py-6 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-slate-700">
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white font-heading block">{item.title}</span>
                  <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
