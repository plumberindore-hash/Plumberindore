'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import BookingModal from '../booking/BookingModal';
import TrackingModal from '../booking/TrackingModal';
import AllServicesModal from '../services/AllServicesModal';
import LiveChatbotWidget from '../chat/LiveChatbotWidget';

export default function CustomerLayoutChrome({ children }) {
  const pathname = usePathname();
  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  
  // Isolated consoles: partner mobile console, admin dashboard, ops portal, tracking modal pages
  const isIsolatedConsole = Boolean(
    currentPath && (
      currentPath.startsWith('/partner') || 
      currentPath.startsWith('/admin') || 
      currentPath.startsWith('/portal') || 
      currentPath.startsWith('/track')
    )
  );

  if (isIsolatedConsole) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <BookingModal />
      <TrackingModal />
      <AllServicesModal />
      <LiveChatbotWidget />
    </>
  );
}
