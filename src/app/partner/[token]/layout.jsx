import React from 'react';

export const metadata = {
  title: 'Partner Console | PlumberIndore Fleet',
  description: 'Technician operations and doorstep job console',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PI Partner'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0F1B33'
};

export default function PartnerLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#0F172A] antialiased select-none pb-safe">
      {children}
    </div>
  );
}
