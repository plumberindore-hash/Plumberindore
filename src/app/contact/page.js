import React from 'react';
import ContactPageClient from '../../components/contact/ContactPageClient';

export const metadata = {
  title: 'Contact Us & Doorstep Service Helpline | PlumberIndore',
  description: 'Need fast doorstep plumbing, electrician, or appliance repair in Indore? Call our hotline +91 91749 34135 or submit an inquiry for prompt technician dispatch.',
  keywords: 'contact PlumberIndore, plumber phone number Indore, electrician customer care Indore, appliance repair contact',
  alternates: {
    canonical: 'https://www.plumberindore.in/contact'
  },
  openGraph: {
    title: 'Contact Us & Doorstep Service Helpline | PlumberIndore',
    description: 'Need fast doorstep plumbing, electrician, or appliance repair in Indore? Call our hotline +91 91749 34135.',
    url: 'https://www.plumberindore.in/contact',
    siteName: 'PlumberIndore',
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us & Doorstep Service Helpline | PlumberIndore',
    description: 'Need fast doorstep plumbing, electrician, or appliance repair in Indore? Call our hotline +91 91749 34135.'
  }
};

export default function ContactPage() {
  return <ContactPageClient />;
}
