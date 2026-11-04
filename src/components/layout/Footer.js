'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, ShieldCheck, ExternalLink, Instagram, Linkedin, Facebook } from 'lucide-react';
import { SERVICES_DATA } from '../../data/servicesData';
import { getLegacyServiceRedirect } from '../../data/categoriesData';

export default function Footer() {
  const pathname = usePathname();
  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  // Suppress customer footer on partner, admin, ops portal, and tracking screens
  if (currentPath && (currentPath.startsWith('/partner') || currentPath.startsWith('/admin') || currentPath.startsWith('/portal') || currentPath.startsWith('/track'))) {
    return null;
  }

  const currentYear = 2026;

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/61593767434572/',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/plumberindore',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/plumber-indore/',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      name: 'WhatsApp Community',
      href: 'https://chat.whatsapp.com/ErZZare2Y9VC5kJesOv2cj',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      )
    }
  ];

  return (
    <footer data-customer-footer="true" className="bg-slate-950 text-slate-400 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <span className="text-2xl font-black text-white tracking-tight">
                Plumber<span className="text-amber-400">Indore</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Indore’s premier on-demand doorstep service platform. Certified professionals for plumbing, electrical, AC repair, home appliances, and sanitization across all 85+ wards.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-slate-300">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition-colors"
                  aria-label={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Popular Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/services/plumber" className="hover:text-amber-400 transition-colors">Emergency Plumbing</Link></li>
              <li><Link href="/appliance/ac-repair" className="hover:text-amber-400 transition-colors">AC Repair & Service</Link></li>
              <li><Link href="/services/electrician" className="hover:text-amber-400 transition-colors">Electrician Doorstep</Link></li>
              <li><Link href="/appliance/refrigerator" className="hover:text-amber-400 transition-colors">Refrigerator Repair</Link></li>
              <li><Link href="/appliance/washing-machine" className="hover:text-amber-400 transition-colors">Washing Machine Fix</Link></li>
              <li><Link href="/appliance/ro-purifier" className="hover:text-amber-400 transition-colors">RO Water Purifier</Link></li>
            </ul>
          </div>

          {/* Col 3: Service Areas */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Service Areas</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/vijay-nagar" className="hover:text-amber-400 transition-colors">Vijay Nagar</Link></li>
              <li><Link href="/palasia" className="hover:text-amber-400 transition-colors">Old & New Palasia</Link></li>
              <li><Link href="/bhanwarkuan" className="hover:text-amber-400 transition-colors">Bhanwarkuan</Link></li>
              <li><Link href="/rau" className="hover:text-amber-400 transition-colors">Rau & Silicon City</Link></li>
              <li><Link href="/bengali-square" className="hover:text-amber-400 transition-colors">Bengali Square & Kanadia</Link></li>
              <li><Link href="/service-areas" className="text-amber-400 hover:underline font-bold">All 40+ Localities →</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Direct Helpline</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href="tel:+919752524398" className="hover:text-white font-bold">+91 97525 24398</a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href="mailto:support@plumberindore.in" className="hover:text-white">support@plumberindore.in</a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>136, Scheme No 54, PU4 Commercial, Vijay Nagar, Indore (MP) 452010</span>
              </li>
              <li className="flex items-center space-x-2 text-emerald-400 font-bold pt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>30-Day Post Service Warranty</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {currentYear} PlumberIndore. All rights reserved. Registered under Madhya Pradesh Shop & Establishment Act.
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/terms-and-conditions" className="hover:text-slate-300">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-slate-300">Privacy Policy</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-300">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
