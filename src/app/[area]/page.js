import React from 'react';
import { notFound } from 'next/navigation';
import { INDORE_AREAS_DATA } from '../../data/indoreAreasData';
import LocationPageClient from '../../components/location/LocationPageClient';

export function generateStaticParams() {
  return INDORE_AREAS_DATA.map((area) => ({
    area: area.slug
  }));
}

export function generateMetadata({ params }) {
  const { area } = params;
  const areaInfo = INDORE_AREAS_DATA.find((a) => a.slug === area);

  if (!areaInfo) {
    return {
      title: 'Indore Service Area | PlumberIndore',
      description: 'Doorstep Plumbing, Electrician, Pest Control and Home Appliance Repair in Indore.'
    };
  }

  // Exact title pattern requested by user: "Plumbing, Electrician & Pest Control in Vijay Nagar"
  const title = `Plumbing, Electrician & Pest Control in ${areaInfo.name}`;
  const description = `Doorstep Plumbing, Electrician, Pest Control and Home Appliance Repair in ${areaInfo.name}, Indore (Pincode ${areaInfo.pincode}). Certified technicians with prompt doorstep arrival, fixed pricing, and 30-day warranty.`;

  return {
    title: title,
    description: description,
    keywords: [
      `Plumbing in ${areaInfo.name}`,
      `Electrician in ${areaInfo.name}`,
      `Pest Control in ${areaInfo.name}`,
      `Plumber in ${areaInfo.name} Indore`,
      `Electrician in ${areaInfo.name} Indore`,
      `Pest Control in ${areaInfo.name} Indore`,
      `AC Repair ${areaInfo.name}`,
      `Washing Machine Repair ${areaInfo.name}`,
      `Refrigerator Repair ${areaInfo.name}`,
      `RO Purifier Service ${areaInfo.name}`,
      `Indore Pincode ${areaInfo.pincode} services`
    ],
    alternates: {
      canonical: `https://www.plumberindore.in/${areaInfo.slug}`
    },
    openGraph: {
      title: `${title} | PlumberIndore`,
      description: description,
      url: `https://www.plumberindore.in/${areaInfo.slug}`,
      siteName: 'PlumberIndore',
      locale: 'en_IN',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | PlumberIndore`,
      description: description
    }
  };
}

export default function AreaLandingPage({ params }) {
  const { area } = params;
  const areaInfo = INDORE_AREAS_DATA.find((a) => a.slug === area);

  if (!areaInfo) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': `PlumberIndore - ${areaInfo.name}`,
    'description': `Doorstep Plumbing, Electrician, Pest Control and Home Appliance Repair in ${areaInfo.name}, Indore.`,
    'telephone': '+91-9174934135',
    'email': 'plumberindore@gmail.com',
    'url': `https://www.plumberindore.in/${areaInfo.slug}`,
    'priceRange': '₹₹',
    'areaServed': {
      '@type': 'City',
      'name': 'Indore',
      'containedInPlace': {
        '@type': 'AdministrativeArea',
        'name': areaInfo.name
      }
    },
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': areaInfo.name,
      'addressRegion': 'Madhya Pradesh',
      'postalCode': areaInfo.pincode,
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 22.7196,
      'longitude': 75.8577
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LocationPageClient areaInfo={areaInfo} />
    </>
  );
}
