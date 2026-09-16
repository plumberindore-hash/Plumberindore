'use client';

import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function PackageComparisonTable() {
  const { openBookingModal } = useBooking();

  const tiers = [
    {
      name: 'Basic Inspection',
      price: 299,
      waived: 'Waived on Repair',
      desc: 'Complete fault diagnostics & electrical health check',
      foamJet: false,
      spareDiscount: '0%',
      warranty: 'None (Inspection only)',
      arrival: 'Prompt Same-Day',
      btnText: 'Book Inspection'
    },
    {
      name: 'Power Foam Service',
      price: 499,
      highlight: true,
      desc: 'Deep pressure foam cleaning + full system check',
      foamJet: true,
      spareDiscount: '10% OFF',
      warranty: '30-Day Full Warranty',
      arrival: 'Priority Slot',
      btnText: 'Book Foam Service'
    },
    {
      name: 'Master Overhaul & Repair',
      price: 899,
      desc: 'Complete deep overhaul, chemical wash & wiring safety tune',
      foamJet: true,
      spareDiscount: '10% OFF',
      warranty: '60-Day Extended Warranty',
      arrival: 'Immediate Priority',
      btnText: 'Book Master Overhaul'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-md space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          Transparent Comparison
        </span>
        <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
          Service Package Comparison Matrix
        </h3>
        <p className="text-xs text-slate-500">
          Compare features across Basic Inspection, Deep Power Servicing, and Master Overhaul.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="p-4 font-bold text-slate-700 w-1/3">Features & Benefits</th>
              {tiers.map((t, i) => (
                <th key={i} className={`p-4 text-center ${t.highlight ? 'bg-amber-50/80 rounded-t-2xl' : ''}`}>
                  <div className="font-extrabold text-sm text-slate-900 font-heading">{t.name}</div>
                  <div className="text-lg font-extrabold text-amber-600 font-heading mt-1">₹{t.price}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">{t.waived || 'Fixed Cost'}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td className="p-4 font-semibold text-slate-900">Deep Foam Pressure Jet Cleaning</td>
              {tiers.map((t, i) => (
                <td key={i} className={`p-4 text-center ${t.highlight ? 'bg-amber-50/50' : ''}`}>
                  {t.foamJet ? <Check className="w-5 h-5 text-emerald-600 mx-auto stroke-[3]" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900">Spare Parts Discount</td>
              {tiers.map((t, i) => (
                <td key={i} className={`p-4 text-center font-bold ${t.highlight ? 'bg-amber-50/50 text-amber-900' : 'text-slate-700'}`}>
                  {t.spareDiscount}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900">Post-Service Warranty Coverage</td>
              {tiers.map((t, i) => (
                <td key={i} className={`p-4 text-center font-bold text-emerald-700 ${t.highlight ? 'bg-amber-50/50' : ''}`}>
                  {t.warranty}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900">Doorstep Arrival Speed</td>
              {tiers.map((t, i) => (
                <td key={i} className={`p-4 text-center font-semibold ${t.highlight ? 'bg-amber-50/50' : ''}`}>
                  {t.arrival}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4">Action</td>
              {tiers.map((t, i) => (
                <td key={i} className={`p-4 text-center ${t.highlight ? 'bg-amber-50/80 rounded-b-2xl' : ''}`}>
                  <button
                    onClick={() => openBookingModal('ac-repair', { title: t.name, price: t.price })}
                    className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs shadow-sm transition-all ${
                      t.highlight
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {t.btnText}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
