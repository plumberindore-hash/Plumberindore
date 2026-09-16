'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2, Loader2, AlertCircle, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import Breadcrumbs from '../layout/Breadcrumbs';

export default function ContactPageClient() {
  const { openBookingModal } = useBooking();
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Contact Us', href: '/contact' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSubmitted(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', message: '' });
      } else {
        setError(data.error || 'Failed to deliver message. Please call helpline directly.');
      }
    } catch (err) {
      setError('Connection error. Please call our Indore helpline +91 91749 34135 directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <Breadcrumbs items={breadcrumbs} />

        {/* Contact Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            24/7 Doorstep Support Desk
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading">
            Contact PlumberIndore
          </h1>
          <p className="text-sm text-slate-600">
            Need doorstep plumbing, electrician, or appliance repair in Indore? Call our hotline or submit an inquiry for prompt technician dispatch.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto font-bold">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-heading">Business Helpline</h3>
            <p className="text-xs text-slate-500">Instant Booking & Inquiries</p>
            <a href="tel:+919174934135" className="inline-block text-sm font-extrabold text-amber-600 hover:underline pt-1">
              +91 91749 34135
            </a>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-heading">WhatsApp Support</h3>
            <p className="text-xs text-slate-500">Location & Photo Sharing</p>
            <a href="https://wa.me/919174934135" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-extrabold text-emerald-600 hover:underline pt-1">
              +91 91749 34135
            </a>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-heading">Official Email</h3>
            <p className="text-xs text-slate-500">Corporate & Support Desk</p>
            <a href="mailto:plumberindore@gmail.com" className="inline-block text-xs font-extrabold text-slate-900 hover:underline pt-1">
              plumberindore@gmail.com
            </a>
          </div>

        </div>

        {/* Doorstep Operations & Form Block */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-soft-md grid grid-cols-1 md:grid-cols-2 gap-10">
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 font-heading">Indore Operations Desk</h3>
            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>PlumberIndore Tech Services, Doorstep Home Service Network across Indore, MP</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>Operating Hours: Monday – Sunday, 8:00 AM – 9:00 PM</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 font-semibold space-y-1">
              <div className="text-slate-900 font-bold">Doorstep Service Coverage:</div>
              <div>Vijay Nagar, Palasia, Bhanwarkuan, Bengali Square, Rau, Rajendra Nagar, Annapurna, Sudama Nagar, Nipania, Super Corridor, MR-10, Bhawrasla</div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => openBookingModal('ac-repair')}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Doorstep Service Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 font-heading">Send a Message</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ansh Patidar"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 91749 34135"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Service Query</label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your plumbing, AC, or appliance repair need in Indore..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {submitted && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Message delivered to support desk! We will call you back within 15 minutes.</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>Submit Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
