import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '../../data/categoriesData';
import { SERVICES_DATA } from '../../data/servicesData';
import CategoryHubClient from '../../components/category/CategoryHubClient';

export const metadata = {
  title: 'Electrician in Indore | Prompt Doorstep Electrical Services | PlumberIndore',
  description: 'Book certified electricians in Indore. Switchboard socket repair, ceiling fan installation, MCB tripping fix, chandelier mounting & house wiring with prompt doorstep arrival.',
  keywords: 'electrician Indore, electrical service Indore, fan repair Vijay Nagar, switch socket fix Palasia, MCB tripping Indore, short circuit repair Indore',
  alternates: {
    canonical: 'https://www.plumberindore.in/electrician'
  },
  openGraph: {
    title: 'Electrician in Indore | Prompt Doorstep Electrical Services | PlumberIndore',
    description: 'Book certified electricians in Indore. Switchboard repair, ceiling fan mounting, MCB safety breaker fix with prompt doorstep arrival.',
    url: 'https://www.plumberindore.in/electrician',
    siteName: 'PlumberIndore',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 800,
        alt: 'Electrician Services Indore'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Electrician in Indore | PlumberIndore',
    description: 'Book certified electricians in Indore. prompt doorstep arrival with 30-day post-service warranty.',
    images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80']
  }
};

export default function ElectricianCategoryPage() {
  const category = getCategoryBySlug('electrician');
  if (!category) notFound();

  const baseService = SERVICES_DATA.find((s) => s.id === 'electrician') || SERVICES_DATA[0];

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'serviceType': 'Electrician Services',
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
