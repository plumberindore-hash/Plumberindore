import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '../../data/categoriesData';
import { SERVICES_DATA } from '../../data/servicesData';
import CategoryHubClient from '../../components/category/CategoryHubClient';

export const metadata = {
  title: 'Appliance Repair in Indore | Prompt Doorstep Service | PlumberIndore',
  description: 'Book certified doorstep appliance repair in Indore: AC repair, Refrigerator, Washing Machine, RO Purifier, Geyser, Microwave, Chimney & Coolers. prompt doorstep arrival with 30-day warranty.',
  keywords: 'appliance repair Indore, AC service Indore, refrigerator repair Vijay Nagar, washing machine technician Indore, RO filter change Indore',
  alternates: {
    canonical: 'https://www.plumberindore.in/appliance'
  },
  openGraph: {
    title: 'Appliance Repair in Indore | Prompt Doorstep Service | PlumberIndore',
    description: 'Book certified doorstep appliance repair in Indore. prompt doorstep arrival with 30-day post-service warranty.',
    url: 'https://www.plumberindore.in/appliance',
    siteName: 'PlumberIndore',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 800,
        alt: 'Appliance Repair Indore'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Appliance Repair in Indore | PlumberIndore',
    description: 'Book certified doorstep appliance repair in Indore. prompt doorstep arrival with 30-day post-service warranty.',
    images: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80']
  }
};

export default function ApplianceCategoryPage() {
  const category = getCategoryBySlug('appliance');
  if (!category) notFound();

  const baseService = SERVICES_DATA.find((s) => s.id === 'ac-repair') || SERVICES_DATA[0];

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'serviceType': 'Appliance Repair Services',
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
