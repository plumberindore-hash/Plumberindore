'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, ExternalLink, Instagram, Linkedin, Facebook } from 'lucide-react';
import { SERVICES_DATA } from '../../data/servicesData';
import { getLegacyServiceRedirect } from '../../data/categoriesData';

export default function Footer() {
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
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group inline-block">
              <img
                src="/logo.png"
                alt="PlumberIndore Logo"
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <span className="text-xl font-extrabold text-white font-heading">
                Plumber<span className="text-amber-400">Indore</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              PlumberIndore Tech Services Private Limited is Indore’s premier doorstep plumbing and home appliance repair network. Certified HVAC engineers and plumbing specialists at your doorstep across Indore.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Doorstep Service Coverage across Indore, Madhya Pradesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+919174934135" className="hover:text-amber-400 font-bold">+91 91749 34135</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:plumberindore@gmail.com" className="hover:text-amber-400 font-semibold">plumberindore@gmail.com</a>
              </div>
            </div>

            {/* Social Media Icons Row */}
            <div className="pt-3 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-heading">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow PlumberIndore on ${social.name}`}
                    className="w-9 h-9 rounded-full bg-slate-900 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-800 hover:border-amber-400 flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 group"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Services List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-heading">
              Our Services
            </h4>
            <ul className="space-y-2 text-xs">
              {SERVICES_DATA.slice(0, 6).map((srv) => (
                <li key={srv.id}>
                  <Link href={getLegacyServiceRedirect(srv.slug)} className="hover:text-amber-400 transition-colors">
                    {srv.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Service Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-heading">
              Indore Hubs
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/vijay-nagar" className="hover:text-amber-400">Vijay Nagar Sector</Link></li>
              <li><Link href="/palasia" className="hover:text-amber-400">Palasia Sector</Link></li>
              <li><Link href="/bhanwarkuan" className="hover:text-amber-400">Bhanwarkuan Sector</Link></li>
              <li><Link href="/rau" className="hover:text-amber-400">Rau Bypass Sector</Link></li>
              <li><Link href="/sudama-nagar" className="hover:text-amber-400">Sudama Nagar Sector</Link></li>
            </ul>
          </div>

          {/* Col 4: Business Registration & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-heading">
              Business Information
            </h4>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="text-amber-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Registered Entity</span>
              </div>
              <p className="text-[11px] text-slate-300">PlumberIndore Tech Services Private Limited</p>
              <p className="text-[10px] text-slate-400">Doorstep Home Services Network across Indore</p>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {currentYear} PlumberIndore Tech Services Private Limited. All Rights Reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
