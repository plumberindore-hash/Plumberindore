'use client';

import React from 'react';
import Link from 'next/link';
import Breadcrumbs from '../layout/Breadcrumbs';
import { useBooking } from '../../context/BookingContext';

export default function BlogPostDetailClient({ post }) {
  const { openBookingModal } = useBooking();

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: post.title, href: `/blog/${post.slug}` }
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <Breadcrumbs items={breadcrumbs} />

        <div className="space-y-4">
          <div className="text-xs text-amber-600 font-bold">{post.readTime} • Published by {post.author} on {post.date}</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading leading-tight">{post.title}</h1>
        </div>

        <img src={post.image} alt={post.title} className="w-full h-80 object-cover rounded-3xl border border-slate-200 shadow-md" />

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <div className="prose max-w-none space-y-4 whitespace-pre-line">
            {post.content}
          </div>

          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-3 mt-8">
            <h3 className="text-lg font-bold text-amber-950 font-heading">Need Professional Doorstep Repair in Indore?</h3>
            <p className="text-xs text-amber-900">Don't risk damaging delicate components. Our certified technicians reach your doorstep promptly.</p>
            <button
              onClick={() => openBookingModal('ac-repair')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs shadow-md cursor-pointer"
            >
              Book Service Technician Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
