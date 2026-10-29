'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, ChevronDown, MapPin, Wrench, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useLanguage } from '../../context/LanguageContext';
import { SERVICES_DATA } from '../../data/servicesData';
import { getLegacyServiceRedirect } from '../../data/categoriesData';
import { INDORE_AREAS_DATA } from '../../data/indoreAreasData';
import ServicesMegaMenu from './ServicesMegaMenu';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Suppress customer header on partner, admin, ops portal, and tracking screens
  if (pathname && (pathname.startsWith('/partner') || pathname.startsWith('/admin') || pathname.startsWith('/portal') || pathname.startsWith('/track'))) {
    return null;
  }

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const timeoutRef = useRef(null);
  const megaMenuContainerRef = useRef(null);
  const searchContainerRef = useRef(null);

  const { openBookingModal } = useBooking();
  const { t } = useLanguage();

  // Filter matching services and Indore areas starting from first typed letter
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchingServices = trimmedQuery.length >= 1 
    ? SERVICES_DATA.filter((s) => 
        s.name.toLowerCase().includes(trimmedQuery) || 
        s.slug.toLowerCase().includes(trimmedQuery) ||
        (s.description && s.description.toLowerCase().includes(trimmedQuery))
      ).slice(0, 4)
    : [];

  const matchingAreas = trimmedQuery.length >= 1
    ? INDORE_AREAS_DATA.filter((a) => 
        a.name.toLowerCase().includes(trimmedQuery) ||
        (a.pincode && a.pincode.includes(trimmedQuery))
      ).slice(0, 3)
    : [];

  const hasSearchMatches = matchingServices.length > 0 || matchingAreas.length > 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on page route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
    setIsSearchFocused(false);
    setSearchQuery('');
  }, [pathname]);

  // Click outside listener to safely dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  const handleSelectService = (slug) => {
    const targetUrl = getLegacyServiceRedirect(slug);
    setIsSearchFocused(false);
    setSearchQuery('');
    router.push(targetUrl);
  };

  const handleSelectArea = (areaSlug) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    router.push(`/indore/${areaSlug}`);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2 border-b border-slate-100'
          : 'bg-white py-3 border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0 group">
            <span className="font-heading text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-amber-500 transition-colors">
              Plumber<span className="text-amber-500">Indore</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full">
              Doorstep Experts
            </span>
          </Link>

          {/* Search Bar - Center */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder') || 'Search plumbing, AC, electrician or area...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {isSearchFocused && hasSearchMatches && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {matchingServices.length > 0 && (
                  <div className="p-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                      Services
                    </div>
                    {matchingServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleSelectService(service.slug)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-900 truncate">
                            {service.name}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {matchingAreas.length > 0 && (
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                      Indore Areas
                    </div>
                    {matchingAreas.map((area) => (
                      <button
                        key={area.slug}
                        onClick={() => handleSelectArea(area.slug)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 shrink-0" />
                          <span className="text-xs font-medium text-slate-700 group-hover:text-amber-900 truncate">
                            {area.name} <span className="text-[10px] text-slate-400">({area.pincode})</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-amber-600 font-medium shrink-0">
                          View local experts →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-slate-700">
            <Link href="/" className="hover:text-amber-500 transition-colors">
              Home
            </Link>

            {/* Services with Hover Mega Menu */}
            <div
              ref={megaMenuContainerRef}
              className="relative py-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center space-x-1 hover:text-amber-500 transition-colors"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              >
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-amber-500' : ''}`} />
              </button>

              <ServicesMegaMenu
                isOpen={isMegaMenuOpen}
                onClose={() => setIsMegaMenuOpen(false)}
              />
            </div>

            <Link href="/pricing" className="hover:text-amber-500 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-amber-500 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-amber-500 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => openBookingModal('plumbing')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all active:scale-95"
            >
              Book Service
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-white border-b border-slate-200 shadow-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search services or areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm font-medium">
            <Link href="/" className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800">
              Home
            </Link>
            <Link href="/services" className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800">
              All Services
            </Link>
            <Link href="/pricing" className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800">
              Pricing List
            </Link>
            <Link href="/about" className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800">
              About Us
            </Link>
            <Link href="/contact" className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800">
              Contact
            </Link>
            <Link href="/privacy" className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800">
              Warranty & Policy
            </Link>
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openBookingModal('plumbing');
            }}
            className="w-full py-3 text-center text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-heading shadow-md"
          >
            ⚡ Instant Doorstep Booking
          </button>
        </div>
      )}
    </header>
  );
}
