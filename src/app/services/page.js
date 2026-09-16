import React from 'react';
import ServicesPageClient from '../../components/services/ServicesPageClient';

export const metadata = {
  title: 'All Plumbing, Electrician & Appliance Repair Services in Indore | PlumberIndore',
  description: 'Explore all 13 doorstep repair services in Indore: AC repair, Plumber, Electrician, Pest Control, Refrigerator, Washing Machine, RO, Geyser, Chimney, and more. Prompt doorstep arrival with 30-day warranty.',
  keywords: 'services indore, plumbing services indore, electrician indore, pest control indore, AC service indore, appliance repair catalog',
  alternates: {
    canonical: 'https://www.plumberindore.in/services'
  },
  openGraph: {
    title: 'All Plumbing, Electrician & Appliance Repair Services in Indore | PlumberIndore',
    description: 'Explore all 13 doorstep repair services in Indore. Certified technicians, transparent fixed pricing, and prompt doorstep arrival.',
    url: 'https://www.plumberindore.in/services',
    siteName: 'PlumberIndore',
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Plumbing, Electrician & Appliance Repair Services in Indore | PlumberIndore',
    description: 'Explore all 13 doorstep repair services in Indore. Certified technicians, transparent fixed pricing, and prompt doorstep arrival.'
  }
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
