import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '../../data/categoriesData';
import { SERVICES_DATA } from '../../data/servicesData';
import CategoryHubClient from '../../components/category/CategoryHubClient';

export const metadata = {
  title: 'Plumber in Indore | Prompt Doorstep Plumbing Services | PlumberIndore',
  description: 'Book certified plumbers in Indore. Tap leakage, toilet flush tank repair, drain blockage removal, water tank cleaning, and bathroom fittings with prompt doorstep arrival.',
  keywords: 'plumber Indore, plumbing services Indore, tap repair Vijay Nagar, toilet cistern fix Palasia, drain snake cleaning Indore, water motor repair Indore',
  alternates: {
    canonical: 'https://www.plumberindore.in/plumber'
  },
  openGraph: {
    title: 'Plumber in Indore | Prompt Doorstep Plumbing Services | PlumberIndore',
    description: 'Book certified plumbers in Indore. Tap leakage, toilet flush repair, drain blockage removal with prompt doorstep arrival.',
    url: 'https://www.plumberindore.in/plumber',
    siteName: 'PlumberIndore',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 800,
        alt: 'Plumbing Services Indore'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plumber in Indore | PlumberIndore',
    description: 'Book certified plumbers in Indore. prompt doorstep arrival with 30-day post-service warranty.',
    images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80']
  }
};

export default function PlumberCategoryPage() {
  const category = getCategoryBySlug('plumbing');
  if (!category) notFound();

  const baseService = SERVICES_DATA.find((s) => s.id === 'plumber') || SERVICES_DATA[0];

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'serviceType': 'Plumbing Services',
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'PlumberIndore',
      'telephone': '+91-9174934135',
      'email': 'plumberindore@gmail.com',
      'priceRange': '₹₹',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Indore',
        'addressRegion': 'Madhya Pradesh',
        'postalCode': '452010',
        'addressCountry': 'IN'
      }
    },
    'areaServed': {
      '@type': 'City',
      'name': 'Indore'
    },
    'description': category.description
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <CategoryHubClient category={category} baseService={baseService} />
    </>
  );
}
