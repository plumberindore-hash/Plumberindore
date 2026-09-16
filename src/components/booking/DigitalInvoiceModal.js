'use client';

import React, { useState } from 'react';
import { 
  X, Printer, Download, CheckCircle2, ShieldCheck, Wrench, 
  Lock, MessageSquare, Mail, Loader2, CreditCard 
} from 'lucide-react';
import { UPI_ID, UPI_PAYEE_NAME, UPI_QR_DATA_URI } from '../../lib/qrCode';

export default function DigitalInvoiceModal({ isOpen, onClose, booking, onOpenPayment }) {
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState(null);

  if (!isOpen || !booking) return null;

  const isPaid = booking.paymentStatus === 'PAID' || booking.isPaid || booking.status === 'Completed';

  const handlePrint = () => {
    window.print();
  };

  const laborCost = booking.price ? Math.round(booking.price * 0.82) : 399;
  const taxCost = (booking.price || 499) - laborCost;
  const invoiceNumber = booking.invoiceNumber || (booking.id ? `INV-2026-${booking.id}` : 'INV-OFFICIAL');

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*PlumberIndore Tax Invoice*\n` +
      `---------------------------------\n` +
      `*Invoice #:* ${invoiceNumber}\n` +
      `*Customer:* ${booking.customerName || 'Customer'}\n` +
      `*Service:* ${booking.serviceName} (${booking.packageTitle || 'Standard Repair'})\n` +
      `*Total Paid:* ₹${booking.price || 499} (Verified Online/Doorstep)\n` +
      `*Date:* ${booking.date || new Date().toISOString().split('T')[0]}\n` +
      `---------------------------------\n` +
      `Warranty: 30-Day doorstep warranty included.\n` +
      `Helpline: +91 91749 34135 | https://www.plumberindore.in`
    );
    const phone = (booking.customerPhone || '9174934135').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // Email Invoice via API
  const handleEmailInvoice = async () => {
    setEmailSending(true);
    setEmailMsg(null);
    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          customerName: booking.customerName || 'Valued Customer',
          customerEmail: booking.customerEmail || 'plumberindore@gmail.com',
          customerPhone: booking.customerPhone || '+91 91749 34135',
          address: booking.address,
          serviceName: booking.serviceName,
          packageTitle: booking.packageTitle,
          laborCost,
          partsCost: 0,
          taxCost,
          discountCost: 0,
          totalPaid: booking.price || 499,
          paymentMethod: booking.paymentMethod || 'UPI / Online Verified',
          paymentRef: `TXN-${booking.id}`,
          date: booking.date
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailMsg({ type: 'success', text: 'Invoice emailed successfully!' });
      } else {
        setEmailMsg({ type: 'error', text: data.error || 'Failed to email invoice.' });
      }
    } catch (e) {
      setEmailMsg({ type: 'error', text: 'Network error sending invoice email.' });
    } finally {
      setEmailSending(false);
      setTimeout(() => setEmailMsg(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Action Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm font-heading">
              {isPaid ? `Official Tax Invoice (${invoiceNumber})` : 'Tax Invoice (Locked)'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isPaid && (
              <>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  disabled={emailSending}
                  onClick={handleEmailInvoice}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer border border-slate-700 disabled:opacity-50"
                >
                  {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>Email</span>
                </button>
              </>
            )}

            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {emailMsg && (
          <div className={`px-6 py-2 text-xs font-bold ${
            emailMsg.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {emailMsg.text}
          </div>
        )}

        {/* Content: Gated by Payment */}
        {!isPaid ? (
          <div className="p-10 text-center space-y-5 bg-slate-50">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto text-amber-600 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                Invoice Locked: Payment Pending
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As per GST and doorstep service regulations, official tax invoices with unique registration numbers are generated and released <strong className="text-slate-900">only after successful payment completion</strong>.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 max-w-sm mx-auto text-xs text-left space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Order #{booking.id}</span>
                <span className="text-amber-600 font-extrabold text-sm">₹{booking.price}</span>
              </div>
              <div className="text-slate-600">{booking.serviceName}</div>
              <div className="text-slate-400 text-[11px]">{booking.address}</div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              {onOpenPayment && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPayment(booking);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-md flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{booking.price} Online / Unlock Invoice</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-3 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Printable Invoice Sheet */
          <div className="p-8 overflow-y-auto space-y-6 text-slate-900 text-xs bg-white print:p-0">
            
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold font-heading text-slate-900">
                  Plumber<span className="text-amber-500">Indore</span>
                </h2>
                <p className="text-slate-500 font-medium">PlumberIndore Tech Services Private Limited</p>
                <p className="text-slate-500">Doorstep Home Service Network, Indore, MP</p>
                <p className="text-slate-500">Helpline: +91 91749 34135 | plumberindore@gmail.com</p>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-xs border border-emerald-200">
                  PAID SERVICE INVOICE
                </span>
                <div className="text-slate-900 pt-1 font-mono font-extrabold">{invoiceNumber}</div>
                <div className="text-slate-500">Date: {booking.date || '2026-08-30'}</div>
                <div className="text-slate-500">Time: {booking.timeSlot || 'Doorstep Slot'}</div>
              </div>
            </div>

            {/* Billed To Details */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Customer Details</span>
                <div className="font-bold text-slate-900 text-sm">{booking.customerName || 'Valued Customer'}</div>
                <div className="text-slate-600">{booking.customerPhone || ''}</div>
                <div className="text-slate-600">{booking.address}</div>
                <div className="text-slate-600">Pincode: {booking.pincode} (Indore)</div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Service Order Summary</span>
                <div className="font-bold text-slate-900">{booking.serviceName}</div>
                <div className="text-slate-600">{booking.packageTitle}</div>
                <div className="text-slate-600 mt-1">Status: <strong className="text-emerald-700">Payment Verified</strong></div>
                <div className="text-emerald-700 font-bold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  30-Day Doorstep Warranty Included
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 text-[11px] font-extrabold uppercase">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booking.services && booking.services.length > 0 ? (
                  booking.services.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-semibold">
                        <div>{item.serviceName} - {item.packageTitle}</div>
                        <div className="text-[10px] text-slate-400">Includes verified doorstep service</div>
                      </td>
                      <td className="py-3 text-center">1</td>
                      <td className="py-3 text-right font-bold">₹{item.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 font-semibold">
                      <div>{booking.serviceName} - {booking.packageTitle || 'Doorstep Service'}</div>
                      <div className="text-[10px] text-slate-400">Includes diagnostic inspection & labor</div>
                    </td>
                    <td className="py-3 text-center">1</td>
                    <td className="py-3 text-right font-bold">₹{booking.price}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Calculation */}
            <div className="border-t border-slate-200 pt-4 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{booking.price}</span>
                </div>
                <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Paid Amount</span>
                  <span className="text-amber-600">₹{booking.price}</span>
                </div>
              </div>
            </div>

            {/* Compact Quick Scan & Pay UPI Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 shrink-0 shadow-sm flex items-center justify-center">
                  <img
                    src={UPI_QR_DATA_URI}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    Quick Scan & Pay
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    UPI ID: <span className="font-mono text-emerald-700 select-all">{UPI_ID}</span> ({UPI_PAYEE_NAME})
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Google Pay • PhonePe • Paytm • BHIM • Cred
                  </div>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-semibold text-slate-400 block">Instant Settlement</span>
                <span className="text-[11px] font-bold text-emerald-600">✓ 0% Surcharge</span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you for choosing PlumberIndore! For support, call +91 91749 34135.</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
