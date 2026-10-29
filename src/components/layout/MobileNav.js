'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, PlusCircle, Phone, MessageSquare } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { openBookingModal } = useBooking();

  // Suppress customer navigation on partner, admin, ops portal, and tracking screens
  if (pathname && (pathname.startsWith('/partner') || pathname.startsWith('/admin') || pathname.startsWith('/portal') || pathname.startsWith('/track'))) {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Book', action: () => openBookingModal('ac-repair'), icon: PlusCircle, isHighlight: true },
    { name: 'Services', href: '/services', icon: Wrench },
  ];

  return (
    <>
      {/* Prominent Quick Call & WhatsApp Floating Sticky Bar */}
      <div className="md:hidden fixed bottom-16 left-3 right-3 z-40 flex items-center justify-between gap-2.5 pointer-events-auto">
        <a
          href="tel:+919752524398"
          className="flex-1 bg-slate-900/95 backdrop-blur-md hover:bg-slate-900 text-white font-extrabold py-2.5 px-3 rounded-2xl shadow-xl border border-slate-700/80 flex items-center justify-center gap-2 text-xs transition-all active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
            <Phone className="w-3.5 h-3.5 fill-slate-950" />
          </div>
          <span>Call Helpline</span>
        </a>

        <a
          href="https://wa.me/919752524398"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-emerald-600/95 backdrop-blur-md hover:bg-emerald-600 text-white font-extrabold py-2.5 px-3 rounded-2xl shadow-xl border border-emerald-500/80 flex items-center justify-center gap-2 text-xs transition-all active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-white text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-3.5 h-3.5 fill-emerald-600" />
          </div>
          <span>WhatsApp Chat</span>
        </a>
      </div>

      {/* Main Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-3 py-1.5 shadow-2xl">
        <div className="grid grid-cols-3 items-center justify-items-center">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.href && pathname === item.href;

            if (item.isHighlight) {
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="flex flex-col items-center justify-center group -mt-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-active:scale-95 transition-transform border-4 border-slate-950">
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-400 mt-0.5">
                    {item.name}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={index}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
