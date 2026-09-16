import React from 'react';
import AboutPageClient from '../../components/about/AboutPageClient';

export const metadata = {
  title: 'About Us - Indore’s Trusted Home Services Network | PlumberIndore',
  description: 'Learn about PlumberIndore - Indore’s leading network of certified plumbers, electricians, and appliance technicians providing prompt doorstep service across Vijay Nagar, Palasia & all sectors.',
  keywords: 'about PlumberIndore, doorstep repair company Indore, certified plumbers Indore, trusted technicians Indore',
  alternates: {
    canonical: 'https://www.plumberindore.in/about'
  },
  openGraph: {
    title: 'About Us - Indore’s Trusted Home Services Network | PlumberIndore',
    description: 'Learn about PlumberIndore - Indore’s leading network of certified plumbers, electricians, and appliance technicians.',
    url: 'https://www.plumberindore.in/about',
    siteName: 'PlumberIndore',
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Indore’s Trusted Home Services Network | PlumberIndore',
    description: 'Learn about PlumberIndore - Indore’s leading network of certified plumbers, electricians, and appliance technicians.'
  }
};

export default function AboutPage() {
  return <AboutPageClient />;
}
