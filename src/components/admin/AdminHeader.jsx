'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  Search, 
  Bell, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  UserCheck, 
  ExternalLink,
  X,
  Loader2,
  ChevronRight
} from 'lucide-react';

export default function AdminHeader({ onOpenMobile }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Search effect with debounce
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data?.success) {
          setResults(data.results);
          setIsOpen(true);
        }
      } catch (err) {
        console.warn('Search fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
  };

  const handleSelectResult = (url) => {
    clearSearch();
    router.push(url);
  };

  const totalResults = results ? (results.workers.length + results.jobs.length + results.customers.length) : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Indore HQ Live
            </span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md relative" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (results) setIsOpen(true); }}
              placeholder="Search technician, job #, customer phone..."
              className="w-full pl-9 pr-9 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all outline-none"
            />
            {loading ? (
              <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 animate-spin" />
            ) : query ? (
              <button 
                onClick={clearSearch} 
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Search Results Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 max-h-96 overflow-y-auto scrollbar-thin">
                {totalResults === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No matching technicians, jobs, or customers found.
                  </div>
                ) : (
                  <div className="space-y-3 p-1">
                    {/* Technicians */}
                    {results.workers.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-amber-500" />
                          <span>Technicians ({results.workers.length})</span>
                        </div>
                        <div className="space-y-0.5">
                          {results.workers.map(w => (
                            <button
                              key={w.id}
                              onClick={() => handleSelectResult(`/admin/workers/${w.id}`)}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50 flex items-center justify-between text-xs transition-colors group"
                            >
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 group-hover:text-amber-900 truncate">
                                  {w.name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {w.phone} • {w.service_category || 'Plumbing'}
                                </div>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {w.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Jobs */}
                    {results.jobs.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5 border-t border-slate-100 pt-2">
                          <Briefcase className="w-3 h-3 text-blue-500" />
                          <span>Jobs ({results.jobs.length})</span>
                        </div>
                        <div className="space-y-0.5">
                          {results.jobs.map(j => (
                            <button
                              key={j.id}
                              onClick={() => handleSelectResult(`/admin/jobs/${j.id}`)}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-blue-50 flex items-center justify-between text-xs transition-colors group"
                            >
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 group-hover:text-blue-900 truncate">
                                  #{j.job_number} • {j.customer_name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {j.locality || 'Indore'} • {j.issue || 'Service'}
                                </div>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {j.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customers */}
                    {results.customers.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5 border-t border-slate-100 pt-2">
                          <UserCheck className="w-3 h-3 text-emerald-500" />
                          <span>Customers ({results.customers.length})</span>
                        </div>
                        <div className="space-y-0.5">
                          {results.customers.map((c, i) => (
                            <button
                              key={i}
                              onClick={() => handleSelectResult(`/admin/jobs?search=${encodeURIComponent(c.customer_phone)}`)}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-50 flex items-center justify-between text-xs transition-colors group"
                            >
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 group-hover:text-emerald-900 truncate">
                                  {c.customer_name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {c.customer_phone}
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Links & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/portal-indore-ops-9821"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Public Ops Portal"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            <span>Ops View</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/admin/alerts"
            title="Operational Alerts"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </header>
  );
}
