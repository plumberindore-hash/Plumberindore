'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, Clock, Users, Wrench, ArrowRight, Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function AboutPageClient() {
  const { openBookingModal } = useBooking();
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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
    <div className="py-12 md:py-20 bg-slate-50 min-h-screen space-y-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            About Our Company
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            About PlumberIndore Tech Services
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            PlumberIndore was founded with a single mission: to bring speed, transparency, and top-tier technical excellence to doorstep plumbing & home appliance repair across Indore, Madhya Pradesh.
          </p>
        </div>

        {/* Mission Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-soft-md grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              Our Vision for Indore Homes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Home appliance breakdowns and plumbing issues can disrupt your daily routine. We eliminate long wait times, unfair pricing, and unverified mechanics by offering a 100% skilled technician team with guaranteed prompt doorstep service.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700 font-semibold space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Verified Technicians</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Prompt Doorstep Service</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
              alt="PlumberIndore Team"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>

        {/* Local SEO Statement */}
        <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed">
          PlumberIndore provides home plumbing & appliance repair services across Indore, including AC repair, refrigerator repair, washing machine repair, RO repair, geyser repair, electrician, and plumbing services.
        </div>

        {/* Action Call */}
        <div className="text-center pt-2">
          <button
            onClick={() => openBookingModal('ac-repair')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Book Doorstep Service in Indore</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* MERGED CONTACT SECTION */}
      <section id="contact" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-8 border-t border-slate-200">
        
        {/* Contact Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            Get In Touch & Support Desk
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Contact PlumberIndore Support Desk
          </h2>
          <p className="text-sm text-slate-600">
            Have a question, feedback, or need assistance with your booking in Indore? Reach out to our doorstep customer support desk.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-sm space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto font-bold">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-heading">Business Helpline</h3>
            <p className="text-xs text-slate-500">Instant Booking & Status Updates</p>
            <a href="tel:+919174934135" className="inline-block text-sm font-extrabold text-amber-600 hover:underline pt-1">
              +91 91749 34135
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-sm space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-heading">WhatsApp Helpline</h3>
            <p className="text-xs text-slate-500">Quick Chat & Location Sharing</p>
            <a href="https://wa.me/919174934135" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-extrabold text-emerald-600 hover:underline pt-1">
              +91 91749 34135
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-sm space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-heading">Official Email</h3>
            <p className="text-xs text-slate-500">For Business & Customer Inquiries</p>
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
                  placeholder="How can we help you with your appliance repair or plumbing in Indore?"
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

      </section>

    </div>
  );
}
