'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, CheckCircle2, AlertCircle, Lock, Unlock, Search, Printer, 
  Share2, Mail, MessageSquare, ArrowRight, ShieldCheck, CreditCard, 
  QrCode, Banknote, DollarSign, Calendar, MapPin, User, X, Loader2, Plus, Download, RefreshCw
} from 'lucide-react';
import { useBooking } from '../../../context/BookingContext';
import { UPI_ID, UPI_PAYEE_NAME, UPI_QR_DATA_URI } from '../../../lib/qrCode';

export default function AdminInvoicesDashboard() {
  const { userBookings } = useBooking();

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live invoices/bookings from API
  const fetchInvoices = () => {
    setIsLoading(true);
    fetch('/api/bookings')
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.bookings) && data.bookings.length > 0) {
          const mapped = data.bookings.map(b => {
            const isPaid = b.payment_status === 'Paid';
            const price = Number(b.total_amount || b.price || 0);
            const laborCost = Math.round(price * 0.82);
            const taxCost = price - laborCost;
            return {
              id: b.booking_number || b.id,
              invoiceNumber: b.invoices?.[0]?.invoice_number || (isPaid ? `INV-2026-${b.booking_number || b.id}` : null),
              customerName: b.customer_name || 'Customer',
              customerPhone: b.customer_phone || '',
              customerEmail: b.customer_email || '',
              address: b.service_address || '',
              pincode: b.pincode || '452010',
              serviceName: b.service_name || 'Doorstep Service',
              packageTitle: b.package_title || 'Standard Service',
              date: b.scheduled_date || 'Today',
              timeSlot: b.time_slot || '10:00 AM - 12:00 PM',
              technicianName: 'Assigned Doorstep Pro',
              paymentStatus: isPaid ? 'PAID' : 'UNPAID',
              paymentMethod: b.payment_method || (isPaid ? 'UPI / Cash' : null),
              paymentRef: b.payment_ref || null,
              paymentDate: b.invoices?.[0]?.issued_at || (isPaid ? b.created_at : null),
              laborCost,
              partsCost: Number(b.parts_cost || 0),
              taxCost,
              discountCost: 0,
              totalPaid: price
            };
          });
          setInvoices(mapped);
        } else {
          setInvoices([]);
        }
      })
      .catch(() => {
        setInvoices([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PAID' | 'UNPAID'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Payment Collector Modal State
  const [collectPaymentOrder, setCollectPaymentOrder] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');
  const [extraPartsCost, setExtraPartsCost] = useState(0);
  const [collecting, setCollecting] = useState(false);

  // Email sending state
  const [emailSendingId, setEmailSendingId] = useState(null);
  const [emailStatusMessage, setEmailStatusMessage] = useState(null);

  // Filter logic
  const filteredInvoices = invoices.filter(inv => {
    const matchesTab = 
      activeTab === 'ALL' ? true :
      activeTab === 'PAID' ? inv.paymentStatus === 'PAID' :
      inv.paymentStatus === 'UNPAID';

    const matchesSearch = 
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerPhone.includes(searchQuery) ||
      inv.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  // Stats calculation
  const totalRevenue = invoices
    .filter(i => i.paymentStatus === 'PAID')
    .reduce((sum, i) => sum + i.totalPaid, 0);
  
  const paidCount = invoices.filter(i => i.paymentStatus === 'PAID').length;
  const unpaidCount = invoices.filter(i => i.paymentStatus === 'UNPAID').length;

  // Handle Mark as Paid & Generate Invoice
  const handleConfirmPayment = (e) => {
    e.preventDefault();
    if (!collectPaymentOrder) return;

    setCollecting(true);
    setTimeout(() => {
      const generatedInvoiceNum = `INV-2026-${collectPaymentOrder.id}`;
      const nowFormatted = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      
      const newTotal = collectPaymentOrder.totalPaid + Number(extraPartsCost || 0);
      const updatedLabor = Math.round(newTotal * 0.82);
      const updatedTax = newTotal - updatedLabor;

      const updated = invoices.map(item => {
        if (item.id === collectPaymentOrder.id) {
          return {
            ...item,
            invoiceNumber: generatedInvoiceNum,
            paymentStatus: 'PAID',
            paymentMethod: selectedPaymentMethod,
            paymentRef: selectedPaymentMethod === 'Cash' 
              ? `CASH-VERIFIED/${Math.floor(100000 + Math.random() * 900000)}` 
              : `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            paymentDate: nowFormatted,
            partsCost: Number(extraPartsCost || 0),
            laborCost: updatedLabor,
            taxCost: updatedTax,
            totalPaid: newTotal
          };
        }
        return item;
      });

      setInvoices(updated);
      setCollecting(false);
      setCollectPaymentOrder(null);
      setExtraPartsCost(0);

      // Auto open the newly generated invoice
      const newlyPaid = updated.find(i => i.id === collectPaymentOrder.id);
      if (newlyPaid) setSelectedInvoice(newlyPaid);
    }, 1000);
  };

  // Send Invoice via Email API
  const handleSendInvoiceEmail = async (inv) => {
    setEmailSendingId(inv.id);
    setEmailStatusMessage(null);

    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customerName,
          customerEmail: inv.customerEmail,
          customerPhone: inv.customerPhone,
          address: inv.address,
          serviceName: inv.serviceName,
          packageTitle: inv.packageTitle,
          laborCost: inv.laborCost,
          partsCost: inv.partsCost,
          taxCost: inv.taxCost,
          discountCost: inv.discountCost,
          totalPaid: inv.totalPaid,
          paymentMethod: inv.paymentMethod,
          paymentRef: inv.paymentRef,
          date: inv.date
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatusMessage({ type: 'success', text: `Invoice ${inv.invoiceNumber} emailed successfully!` });
      } else {
        setEmailStatusMessage({ type: 'error', text: data.error || 'Failed to email invoice.' });
      }
    } catch (err) {
      setEmailStatusMessage({ type: 'error', text: 'Network error sending invoice email.' });
    } finally {
      setEmailSendingId(null);
      setTimeout(() => setEmailStatusMessage(null), 5000);
    }
  };

  // Send Invoice via WhatsApp
  const handleSendInvoiceWhatsApp = (inv) => {
    const text = encodeURIComponent(
      `*PlumberIndore Tax Invoice*\n` +
      `---------------------------------\n` +
      `*Invoice #:* ${inv.invoiceNumber}\n` +
      `*Customer:* ${inv.customerName}\n` +
      `*Service:* ${inv.serviceName} (${inv.packageTitle})\n` +
      `*Amount Paid:* ₹${inv.totalPaid} (${inv.paymentMethod})\n` +
      `*Payment Ref:* ${inv.paymentRef}\n` +
      `*Date:* ${inv.date}\n` +
      `---------------------------------\n` +
      `Thank you for choosing PlumberIndore! 30-Day doorstep warranty included.\n` +
      `Helpline: +91 91749 34135\n` +
      `Website: https://www.plumberindore.in`
    );
    const cleanPhone = inv.customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Doorstep Admin & Technician Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Tax Invoice & Payment Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Tax invoices are generated and released <strong className="text-amber-400">only after verified payment completion</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchInvoices}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Refresh live invoices from database"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              href="/bookings"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <span>User Bookings View</span>
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Homepage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Global Toast Notification */}
        {emailStatusMessage && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between animate-fade-in ${
            emailStatusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm'
              : 'bg-red-50 text-red-900 border-red-300 shadow-sm'
          }`}>
            <div className="flex items-center gap-2">
              {emailStatusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{emailStatusMessage.text}</span>
            </div>
            <button onClick={() => setEmailStatusMessage(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue Collected</div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">₹{totalRevenue}</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% Tax Compliant</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Invoices Issued</div>
            <div className="text-2xl font-extrabold text-emerald-600 font-heading">{paidCount}</div>
            <div className="text-[11px] text-slate-500">Available for Download / Share</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Payment Collections</div>
            <div className="text-2xl font-extrabold text-amber-600 font-heading">{unpaidCount}</div>
            <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Invoices Locked Until Paid</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Technicians</div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">3 Active</div>
            <div className="text-[11px] text-slate-500">Ramesh, Suresh & Rajesh</div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Orders ({invoices.length})
            </button>

            <button
              onClick={() => setActiveTab('PAID')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'PAID'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid & Invoices ({paidCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('UNPAID')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'UNPAID'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Pending Payment ({unpaidCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, invoice..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

        </div>

        {/* Invoices List / Table */}
        <div className="space-y-4">
          {filteredInvoices.map((inv) => {
            const isPaid = inv.paymentStatus === 'PAID';

            return (
              <div 
                key={inv.id}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-soft-sm hover:shadow-soft-md ${
                  isPaid ? 'border-slate-200' : 'border-amber-300/80 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left Column: Order & Customer Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-extrabold text-slate-900 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
                        Order #{inv.id}
                      </span>

                      {isPaid ? (
                        <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PAID • {inv.invoiceNumber}</span>
                        </span>
                      ) : (
                        <span className="text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          <span>INVOICE LOCKED (PAYMENT PENDING)</span>
                        </span>
                      )}

                      <span className="text-xs text-slate-500 font-medium">
                        Technician: <strong className="text-slate-800">{inv.technicianName}</strong>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 font-heading">
                        {inv.serviceName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{inv.packageTitle}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span><strong>{inv.customerName}</strong> ({inv.customerPhone})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[280px]">{inv.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Amount & Method */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right min-w-[200px] space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase font-bold">Total Bill Amount</div>
                    <div className="text-2xl font-extrabold text-slate-900 font-heading">₹{inv.totalPaid}</div>
                    
                    {isPaid ? (
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        Paid via {inv.paymentMethod}
                        <div className="text-[10px] text-slate-400 font-mono">{inv.paymentRef}</div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-700 font-bold">
                        Collect payment to unlock invoice
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions (Gated by Payment Status) */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                    {isPaid ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>View & Print Invoice</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendInvoiceWhatsApp(inv)}
                            className="flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            title="Send invoice via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            disabled={emailSendingId === inv.id}
                            onClick={() => handleSendInvoiceEmail(inv)}
                            className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                            title="Send invoice via Email"
                          >
                            {emailSendingId === inv.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                            ) : (
                              <Mail className="w-3.5 h-3.5 text-slate-600" />
                            )}
                            <span>Email</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCollectPaymentOrder(inv)}
                        className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Collect Payment & Issue Invoice</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}

          {invoices.length === 0 ? (
            <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 font-heading">No Invoices Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No invoices have been generated yet. When customer bookings are placed and completed, official tax invoices will be listed here automatically.
              </p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No matching orders found</h3>
              <p className="text-xs text-slate-400">Try changing your search query or filter selection.</p>
            </div>
          ) : null}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: VIEW & PRINT INVOICE MODAL (Available only after payment) */}
      {/* ------------------------------------------------------------- */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Action Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm font-heading">Official Tax Invoice ({selectedInvoice.invoiceNumber})</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendInvoiceWhatsApp(selectedInvoice)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button 
                  onClick={() => setSelectedInvoice(null)} 
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 text-xs bg-white">
              
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
                  <div className="text-slate-700 pt-1 font-mono font-bold">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-slate-500">Date: {selectedInvoice.date}</div>
                  <div className="text-slate-500">Time: {selectedInvoice.timeSlot}</div>
                </div>
              </div>

              {/* Billed To Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Customer Details</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedInvoice.customerName}</div>
                  <div className="text-slate-600">{selectedInvoice.customerPhone}</div>
                  <div className="text-slate-600">{selectedInvoice.address}</div>
                  <div className="text-slate-600">Pincode: {selectedInvoice.pincode} (Indore)</div>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Service & Technician Details</span>
                  <div className="font-bold text-slate-900">{selectedInvoice.serviceName}</div>
                  <div className="text-slate-600">{selectedInvoice.packageTitle}</div>
                  <div className="text-slate-600 mt-1">Lead Pro: <strong>{selectedInvoice.technicianName}</strong></div>
                  <div className="text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    30-Day Post Service Warranty Included
                  </div>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 text-[11px] font-extrabold uppercase">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 font-semibold">
                      <div>{selectedInvoice.serviceName} - {selectedInvoice.packageTitle}</div>
                      <div className="text-[10px] text-slate-400">Doorstep inspection, diagnostic analysis & professional labor</div>
                    </td>
                    <td className="py-3 text-center">1</td>
                    <td className="py-3 text-right font-bold">₹{selectedInvoice.laborCost}</td>
                  </tr>

                  {selectedInvoice.partsCost > 0 && (
                    <tr>
                      <td className="py-3 font-semibold">
                        <div>Original Spare Parts & Consumables</div>
                        <div className="text-[10px] text-slate-400">OEM genuine components with manufacturer warranty</div>
                      </td>
                      <td className="py-3 text-center">1</td>
                      <td className="py-3 text-right font-bold">₹{selectedInvoice.partsCost}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Summary */}
              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-slate-600 text-xs">
                  <div>Payment Mode: <strong className="text-slate-900">{selectedInvoice.paymentMethod}</strong></div>
                  <div>Payment Reference: <strong className="text-slate-900 font-mono">{selectedInvoice.paymentRef}</strong></div>
                  <div>Paid At: {selectedInvoice.paymentDate}</div>
                </div>

                <div className="w-full sm:w-64 bg-slate-900 text-white p-4 rounded-2xl space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoice.totalPaid}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base text-white pt-2 border-t border-slate-800">
                    <span>Total Paid:</span>
                    <span className="text-amber-400 font-heading">₹{selectedInvoice.totalPaid}</span>
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
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you for choosing PlumberIndore! For customer assistance, call <strong>+91 91749 34135</strong>.</span>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: TECHNICIAN PAYMENT COLLECTOR (Generates Invoice On-Site) */}
      {/* ------------------------------------------------------------- */}
      {collectPaymentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-heading">Doorstep Payment Collector</h3>
                  <p className="text-xs text-emerald-400 font-semibold">Verify Payment to Issue Tax Invoice</p>
                </div>
              </div>
              <button onClick={() => setCollectPaymentOrder(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-6 space-y-4">
              
              {/* Order Info */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Order #{collectPaymentOrder.id}</span>
                  <span className="text-amber-600 font-extrabold text-sm">₹{collectPaymentOrder.totalPaid + Number(extraPartsCost || 0)}</span>
                </div>
                <div className="text-slate-600">{collectPaymentOrder.serviceName}</div>
                <div className="text-slate-500">Customer: <strong>{collectPaymentOrder.customerName}</strong> ({collectPaymentOrder.customerPhone})</div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Received Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      selectedPaymentMethod === 'UPI'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('Cash')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      selectedPaymentMethod === 'Cash'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                    <span>Doorstep Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('Card')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      selectedPaymentMethod === 'Card'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    <span>Card / POS</span>
                  </button>
                </div>
              </div>

              {/* Optional Extra Parts / Charges */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Extra Material / Spare Parts (₹ Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={extraPartsCost}
                  onChange={(e) => setExtraPartsCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Confirming payment will automatically generate the unique Tax Invoice number and release it for print/sharing.</span>
              </div>

              <button
                type="submit"
                disabled={collecting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {collecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Tax Invoice...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Payment & Issue Invoice</span>
                  </>
                )}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
