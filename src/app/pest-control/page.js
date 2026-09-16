import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '../../data/categoriesData';
import { SERVICES_DATA } from '../../data/servicesData';
import CategoryHubClient from '../../components/category/CategoryHubClient';

export const metadata = {
  title: 'Pest Control in Indore | Herbal & Odorless Pest Control | PlumberIndore',
  description: 'Book certified pest control in Indore. Odorless cockroach control, anti-termite wood treatment, bed bugs eradication with up to 45-day warranty and prompt doorstep service.',
  keywords: 'pest control Indore, cockroach control Vijay Nagar, termite treatment Palasia, bed bugs spray Indore, herbal pest control Indore',
  alternates: {
    canonical: 'https://www.plumberindore.in/pest-control'
  },
  openGraph: {
    title: 'Pest Control in Indore | Herbal & Odorless Pest Control | PlumberIndore',
    description: 'Book certified pest control in Indore. Odorless cockroach control, anti-termite wood treatment with prompt doorstep service.',
    url: 'https://www.plumberindore.in/pest-control',
    siteName: 'PlumberIndore',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 800,
        alt: 'Pest Control Services Indore'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pest Control in Indore | PlumberIndore',
    description: 'Book certified pest control in Indore. Prompt doorstep service with up to 45-day warranty.',
    images: ['https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=1200&q=80']
  }
};

export default function PestControlCategoryPage() {
  const category = getCategoryBySlug('pest-control');
  if (!category) notFound();

  const baseService = SERVICES_DATA.find((s) => s.id === 'pest-control') || SERVICES_DATA[0];

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'serviceType': 'Pest Control Services',
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
