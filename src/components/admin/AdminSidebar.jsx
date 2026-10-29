'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Wallet, 
  Receipt, 
  MapPin, 
  FileText, 
  Bell, 
  TrendingUp, 
  Sliders, 
  ShieldAlert, 
  LifeBuoy,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Jobs & Dispatch', href: '/admin/jobs', icon: Briefcase },
  { name: 'Technicians Fleet', href: '/admin/workers', icon: Users },
  { name: 'Wallets & Khata', href: '/admin/wallets', icon: Wallet },
  { name: 'Daily Hisab', href: '/admin/hisab', icon: Receipt },
  { name: 'Live Fleet Map', href: '/admin/fleet', icon: MapPin },
  { name: 'Payments Audit', href: '/admin/payments', icon: FileText },
  { name: 'Alerts & Issues', href: '/admin/alerts', icon: ShieldAlert },
  { name: 'Business Reports', href: '/admin/reports', icon: TrendingUp },
  { name: 'Broadcast & SMS', href: '/admin/notifications', icon: Bell },
  { name: 'Platform Settings', href: '/admin/settings', icon: Sliders },
  { name: 'Support & SOS', href: '/admin/support', icon: LifeBuoy },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      window.location.href = '/admin/login';
    } catch (e) {
      window.location.href = '/admin/login';
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-[#0B1528] text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            P
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight leading-none">PlumberIndore</div>
            <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider mt-1">Ops & Partner Engine</div>
          </div>
        </Link>
        {mobileOpen && (
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
          Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive 
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">Administrator</div>
              <div className="text-[10px] text-slate-400 truncate">Indore HQ Dispatch</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 min-h-screen">
        <NavContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <NavContent />
          </div>
        </div>
      )}
    </>
  );
}
