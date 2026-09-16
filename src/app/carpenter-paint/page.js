import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '../../data/categoriesData';
import { SERVICES_DATA } from '../../data/servicesData';
import CategoryHubClient from '../../components/category/CategoryHubClient';

export const metadata = {
  title: 'Carpenter & Painting in Indore | Prompt Doorstep Service | PlumberIndore',
  description: 'Book master carpenters and painters in Indore. Door locks, wardrobe hinges, furniture assembly, wall painting & waterproofing with prompt doorstep arrival.',
  keywords: 'carpenter Indore, painting service Indore, door lock repair Vijay Nagar, wall dampness Palasia, furniture assembly Indore, waterproofing Indore',
  alternates: {
    canonical: 'https://www.plumberindore.in/carpenter-paint'
  },
  openGraph: {
    title: 'Carpenter & Painting in Indore | Prompt Doorstep Service | PlumberIndore',
    description: 'Book master carpenters and painters in Indore. Door locks, furniture assembly, wall painting & waterproofing with prompt doorstep arrival.',
    url: 'https://www.plumberindore.in/carpenter-paint',
    siteName: 'PlumberIndore',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 800,
        alt: 'Carpenter and Painting Services Indore'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carpenter & Painting in Indore | PlumberIndore',
    description: 'Book master carpenters and painters in Indore. prompt doorstep arrival with 30-day post-service warranty.',
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80']
  }
};

export default function CarpenterPaintCategoryPage() {
  const category = getCategoryBySlug('carpenter-paint');
  if (!category) notFound();

  const baseService = SERVICES_DATA.find((s) => s.id === 'carpenter') || SERVICES_DATA[0];

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'serviceType': 'Carpenter and Painting Services',
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
