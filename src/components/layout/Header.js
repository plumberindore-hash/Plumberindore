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

  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  // Suppress customer header on partner, admin, ops portal, and tracking screens
  if (currentPath && (currentPath.startsWith('/partner') || currentPath.startsWith('/admin') || currentPath.startsWith('/portal') || currentPath.startsWith('/track'))) {
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
        a.landmark.toLowerCase().includes(trimmedQuery) ||
        a.pincode.includes(trimmedQuery) ||
        a.slug.toLowerCase().includes(trimmedQuery)
      ).slice(0, 4)
    : [];

  const showSearchResults = isSearchFocused && trimmedQuery.length >= 1 && (matchingServices.length > 0 || matchingAreas.length > 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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

  // Click outside to dismiss search results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (megaMenuContainerRef.current && !megaMenuContainerRef.current.contains(e.target)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectService = (slug) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    router.push(getLegacyServiceRedirect(slug));
  };

  const handleSelectArea = (areaSlug) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    router.push(`/${areaSlug}`);
  };

  const handleMouseEnterServices = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeaveServices = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  return (
    <header data-customer-header="true" className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg py-2.5' 
        : 'bg-slate-900 border-b border-slate-800/80 py-3.5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" ref={megaMenuContainerRef}>
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center">
                Plumber<span className="text-amber-400">Indore</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-1">
                Doorstep Experts
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search plumbing, AC, electrician or area..."
                className="w-full pl-10 pr-9 py-2 bg-slate-800/90 border border-slate-700/80 rounded-full text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 space-y-2 z-50">
                {matchingServices.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                      Services
                    </div>
                    {matchingServices.map((srv) => (
                      <button
                        key={srv.id}
                        onClick={() => handleSelectService(srv.slug)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between text-xs text-white group transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Wrench className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-semibold">{srv.name}</span>
                        </div>
                        <span className="text-amber-400 font-bold">₹{srv.startingPrice}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchingAreas.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                      Indore Areas
                    </div>
                    {matchingAreas.map((area) => (
                      <button
                        key={area.slug}
                        onClick={() => handleSelectArea(area.slug)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between text-xs text-white group transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-semibold">{area.name}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-bold text-slate-300">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>

            {/* Services with Hover Dropdown */}
            <div
              className="relative py-2 cursor-pointer flex items-center space-x-1 hover:text-amber-400 transition-colors"
              onMouseEnter={handleMouseEnterServices}
              onMouseLeave={handleMouseLeaveServices}
            >
              <span>Services</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-amber-400' : ''}`} />
            </div>

            <Link href="/services" className="hover:text-amber-400 transition-colors">
              All Repairs
            </Link>

            <Link href="/about" className="hover:text-amber-400 transition-colors">
              About
            </Link>

            <Link href="/contact" className="hover:text-amber-400 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => openBookingModal('ac-repair')}
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-300 transition-all active:scale-95"
            >
              <span>⚡ Book Now</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Desktop Mega Menu Dropdown */}
        <ServicesMegaMenu
          isOpen={isMegaMenuOpen}
          onMouseEnter={handleMouseEnterServices}
          onMouseLeave={handleMouseLeaveServices}
          onClose={() => setIsMegaMenuOpen(false)}
        />
      </div>

      {/* Mobile Slide-down Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search Input */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AC, Plumber, Area..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
            {trimmedQuery.length >= 1 && (
              <div className="mt-2 bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-2 max-h-56 overflow-y-auto">
                {matchingServices.map((srv) => (
                  <button
                    key={srv.id}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSelectService(srv.slug);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between text-xs text-white"
                  >
                    <span className="font-bold">{srv.name}</span>
                    <span className="text-amber-400 font-extrabold">₹{srv.startingPrice}</span>
                  </button>
                ))}
                {matchingAreas.map((area) => (
                  <button
                    key={area.slug}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSelectArea(area.slug);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between text-xs text-white"
                  >
                    <span className="font-bold">{area.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-300">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/services"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 hover:text-white"
            >
              All Services
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 hover:text-white"
            >
              About Company
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 hover:text-white"
            >
              Contact Indore
            </Link>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                openBookingModal('ac-repair');
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-3 rounded-xl text-sm text-center block shadow-md"
            >
              {t('bookNow')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
