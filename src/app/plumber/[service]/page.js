import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getSubcategory } from '../../../data/categoriesData';
import SubcategoryPageClient from '../../../components/category/SubcategoryPageClient';

export function generateStaticParams() {
  const category = getCategoryBySlug('plumbing');
  return category.subcategories.map((sub) => ({
    service: sub.slug
  }));
}

export function generateMetadata({ params }) {
  const { service } = params;
  const subcategory = getSubcategory('plumbing', service);

  if (!subcategory) {
    return {
      title: 'Plumbing Service Not Found | PlumberIndore',
      description: 'The requested plumbing service could not be found.'
    };
  }

  const title = `${subcategory.metaTitle || subcategory.name + ' in Indore | Prompt Doorstep Service'}`;
  const description = subcategory.metaDescription || subcategory.description;

  return {
    title: title,
    description: description,
    keywords: [
      `${subcategory.name} Indore`,
      `${subcategory.name} Vijay Nagar`,
      `${subcategory.name} Palasia`,
      `${subcategory.name} cost Indore`,
      `best plumber ${subcategory.name} Indore`
    ],
    alternates: {
      canonical: `https://www.plumberindore.in/plumber/${subcategory.slug}`
    },
    openGraph: {
      title: `${title} | PlumberIndore`,
      description: description,
      url: `https://www.plumberindore.in/plumber/${subcategory.slug}`,
      siteName: 'PlumberIndore',
      images: [
        {
          url: subcategory.bannerImage,
          width: 800,
          height: 600,
          alt: `${subcategory.name} in Indore`
        }
      ],
      locale: 'en_IN',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | PlumberIndore`,
      description: description,
      images: [subcategory.bannerImage]
    }
  };
}

export default function PlumberSubcategoryPage({ params }) {
  const { service } = params;
  const category = getCategoryBySlug('plumbing');
  const subcategory = getSubcategory('plumbing', service);

  if (!category || !subcategory) {
    notFound();
  }

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'serviceType': subcategory.name,
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
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 22.7533,
        'longitude': 75.8937
      }
    },
    'areaServed': {
      '@type': 'City',
      'name': 'Indore'
    },
    'description': subcategory.description,
    'offers': {
      '@type': 'Offer',
      'price': subcategory.startingPrice,
      'priceCurrency': 'INR'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <SubcategoryPageClient subcategory={subcategory} category={category} />
    </>
  );
}
