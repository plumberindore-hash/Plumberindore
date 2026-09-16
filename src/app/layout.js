import React from 'react';
import Script from 'next/script';
import './globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import BookingModal from '../components/booking/BookingModal';
import TrackingModal from '../components/booking/TrackingModal';
import AllServicesModal from '../components/services/AllServicesModal';
import LiveChatbotWidget from '../components/chat/LiveChatbotWidget';
import { BookingProvider } from '../context/BookingContext';
import { LanguageProvider } from '../context/LanguageContext';

export const metadata = {
  metadataBase: new URL('https://www.plumberindore.in'),
  title: 'Home Services Indore - Plumbing, Electrician, Appliance & Pest Control',
  description: 'Book certified plumbers, electricians, AC repair, refrigerator repair, washing machine & RO repair in Indore. Prompt doorstep arrival with 30-day post service warranty.',
  keywords: 'plumber indore, AC repair Vijay Nagar, electrician Indore, refrigerator repair Palasia, washing machine service Indore, RO purifier repair Indore',
  alternates: {
    canonical: './',
  },
  verification: {
    google: 'oSTdaPCqjeWHhITF2gAlNUorKjDSGUO0kMTSB8GGG84',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '180x180', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: ['/favicon.ico']
  },
  manifest: '/site.webmanifest'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K8B67BDW');`,
          }}
        />
        {/* End Google Tag Manager */}

        <meta name="google-site-verification" content="oSTdaPCqjeWHhITF2gAlNUorKjDSGUO0kMTSB8GGG84" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased text-slate-800 bg-white selection:bg-amber-400 selection:text-slate-950 flex flex-col min-h-screen">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K8B67BDW"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <LanguageProvider>
          <BookingProvider>
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
          </BookingProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
