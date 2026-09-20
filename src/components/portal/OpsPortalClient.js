'use client';

import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, LogOut, Search, Filter, Download, Users, UserCheck, Truck, Wallet, 
  Plus, Send, Eye, Clock, Phone, MapPin, 
  Calendar, Wrench, AlertTriangle, MessageSquare, Bot, Sparkles, 
  TrendingUp, CheckCircle2, ChevronRight, X, ExternalLink, Copy,
  CheckCircle, ArrowUpRight, DollarSign, Activity, SlidersHorizontal,
  User, Briefcase, Zap, Shield, HelpCircle, RotateCcw, ArrowRight,
  MessageCircle, Layers, FileText, Receipt, Printer, Trash2
} from 'lucide-react';

// Hardcoded Master Auth Credentials
const AUTH_EMAIL = 'admin@plumberindore.in';
const AUTH_PASS = 'admin123';
const AUTH_STORAGE_KEY = 'plumberindore_portal_auth_v1';
const DATA_STORAGE_KEY = 'plumberindore_ops_portal_data_v2';

// Available Localities in Indore
const INDORE_LOCALITIES = [
  'All Localities',
  'Vijay Nagar',
  'Palasia',
  'Bhawarkua',
  'Annapurna',
  'Sudama Nagar',
  'Mahalaxmi Nagar',
  'Rau / Bypass',
  'Rajendra Nagar',
  'Geeta Bhawan'
];

// Clean Zero-State: All test bookings, dispatches, inquiries & chats cleared by default
const INITIAL_BOOKINGS = [];
const INITIAL_INQUIRIES = [];
const INITIAL_CHATS = [];

// Pre-canned Quick Replies for Chatbot Monitor

// Certified Indore Field Fleet: Ajay Mahajan, Pankaj Sharma & Saurabh Electrician
const DEFAULT_FLEET_DATA = [
  {
    id: 'TECH-IND-01',
    name: 'Ajay Mahajan',
    title: 'Lead Plumber & Sanitary Tech (South Corridor)',
    phone: '+91 84595 59141',
    rating: 4.96,
    repairsCount: 610,
    vehicleNumber: 'Service Bike (MP 09 MD 8821)',
    photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&h=200&q=80',
    specialty: 'Plumbing & South Sector Lead',
    operatingArea: 'Rau, Mhow, Bhawarkua, Bijalpur, Rajendra Nagar, Sudama Nagar, Tejaji Nagar, Nimbodi',
    serviceArea: 'Rau, Mhow, Bhawarkua, Bijalpur, Rajendra Nagar, Sudama Nagar, Tejaji Nagar, Nimbodi',
    locatedIn: 'Rau / Bhawarkua',
    specialization: 'Plumbing, Leakages & Sanitary Fixtures',
    status: 'Available',
    eta: 'Prompt Arrival'
  },
  {
    id: 'TECH-IND-02',
    name: 'Pankaj Sharma',
    title: 'Bicholi & Bypass Lead Technician',
    phone: '+91 98267 43299',
    rating: 4.94,
    repairsCount: 390,
    vehicleNumber: 'Service Bike (MP 09 BM 4329)',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
    specialty: 'Bicholi & East Bypass Plumbing',
    operatingArea: 'Bicholi Mardana, Bicholi Hapsi, Silicon City, Bypass',
    serviceArea: 'Bicholi Mardana, Bicholi Hapsi, Silicon City, Bypass',
    locatedIn: 'Bicholi Mardana',
    specialization: 'Plumbing, Water Motors & Pipeline Overhauls',
    status: 'Available',
    eta: 'Prompt Arrival'
  },
  {
    id: 'TECH-IND-03',
    name: 'Saurabh Electrician',
    title: 'Master Electrician & POP Specialist',
    phone: '+917869709526',
    rating: 4.98,
    repairsCount: 420,
    vehicleNumber: 'Service Bike (MP 09 EA 7869)',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&h=200&q=80',
    specialty: 'Electrician, POP and False Ceiling',
    operatingArea: 'All over Indore',
    serviceArea: 'All over Indore',
    locatedIn: 'Vijay Nagar',
    specialization: 'Electrician, POP and False Ceiling',
    status: 'Available',
    eta: 'Prompt Arrival'
  },
  {
    id: 'TECH-IND-04',
    name: 'Saifee Khozema',
    title: 'Senior Refrigerator & Cold Appliance Specialist',
    phone: '+91 98267 27487',
    rating: 4.97,
    repairsCount: 380,
    vehicleNumber: 'Service Bike (MP 09 SK 2748)',
    photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80',
    specialty: 'Refrigerator Repair Work',
    operatingArea: 'All areas (provides home services across the city)',
    serviceArea: 'All areas (provides home services across the city)',
    locatedIn: 'Khatiwala Tank, Indore, Madhya Pradesh',
    specialization: 'Refrigerator Repair Work',
    status: 'Available',
    eta: 'Prompt Arrival'
  }
];

const QUICK_REPLIES = [
  '🚀 Plumber dispatched! On the way, arriving in ~30 mins.',
  '💰 Inspection charge is ₹199, fully adjusted in the bill if repair is confirmed.',
  '📍 We have verified plumbers available right now across Vijay Nagar, Palasia & Bhawarkua.',
  '📞 Our senior supervisor is calling you on your phone right now to assist.'
];

/**
 * Official PlumberIndore Brand Logo SVG & Emblem
 */
function OfficialBrandLogo({ size = 'md', isDarkBg = false, showTagline = true }) {
  const iconSize = size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const headingSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl';
  const taglineSize = size === 'lg' ? 'text-[11px]' : 'text-[10px]';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Official PlumberIndore Brand Logo with SVG Enhancement */}
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src="/logo.png"
          alt="PlumberIndore Logo"
          className={`${iconSize} object-contain transition-transform duration-200 hover:scale-105`}
        />
      </div>

      {/* Brand Typographic Identity */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`${headingSize} font-extrabold tracking-tight font-heading ${isDarkBg ? 'text-white' : 'text-slate-900'}`}>
            Plumber<span className="text-amber-500">Indore</span>
          </span>
          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md uppercase tracking-wider ${
            isDarkBg 
              ? 'bg-slate-800 text-amber-400 border border-slate-700' 
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            OPS
          </span>
        </div>
        {showTagline && (
          <span className={`${taglineSize} font-semibold tracking-wider uppercase -mt-0.5 ${isDarkBg ? 'text-slate-400' : 'text-slate-500'}`}>
            Operations & Dispatch Control
          </span>
        )}
      </div>
    </div>
  );
}


// Helper: Extract Indore Locality with safe fallbacks
function extractLocality(address = '', pincode = '') {
  const addr = (address || '').toLowerCase();
  if (addr.includes('vijay nagar')) return 'Vijay Nagar';
  if (addr.includes('palasia')) return 'Palasia';
  if (addr.includes('bhawarkua') || addr.includes('bhanwarkuan')) return 'Bhawarkua';
  if (addr.includes('rau')) return 'Rau';
  if (addr.includes('bicholi') || addr.includes('mardana')) return 'Bicholi Mardana';
  if (addr.includes('khandwa')) return 'Khandwa Road';
  if (addr.includes('rajendra')) return 'Rajendra Nagar';
  if (addr.includes('annapurna')) return 'Annapurna';
  if (addr.includes('sudama')) return 'Sudama Nagar';
  if (addr.includes('nipania')) return 'Nipania';
  if (addr.includes('kanadia')) return 'Kanadia Road';
  if (addr.includes('mahalaxmi')) return 'Mahalaxmi Nagar';

  if (pincode === '452010') return 'Vijay Nagar';
  if (pincode === '452001') return 'Palasia';
  if (pincode === '452014') return 'Bhawarkua';
  if (pincode === '453331') return 'Rau';
  if (pincode === '452016') return 'Bicholi Mardana';

  if (address && address.includes(',')) {
    return address.split(',')[0].trim();
  }
  return address || 'Indore';
}

// Helper: Normalize any raw database booking record into uniform frontend format with safe fallback keys
function normalizeBookingRecord(b) {
  if (!b) return null;
  const bId = b.booking_number || b.id || `IND-${Math.floor(10000 + Math.random() * 90000)}`;
  const customerName = b.customerName || b.customer_name || b.name || 'Customer';
  const customerPhone = b.customerPhone || b.customer_phone || b.mobile_number || b.phone || '';
  const customerEmail = b.customerEmail || b.customer_email || b.email || '';
  const address = b.address || b.service_address || 'Indore';
  const pincode = b.pincode || '452010';
  const locality = b.locality || b.area || extractLocality(address, pincode);
  const serviceName = b.serviceName || b.service_name || b.service || 'Home Repair';
  const packageTitle = b.packageTitle || b.package_title || b.package || 'Standard Package';
  const price = Number(b.price ?? b.amount ?? b.total_amount ?? b.subtotal ?? 499);
  const scheduledDate = b.scheduledDate || b.scheduled_date || b.booking_date || (b.createdAt ? b.createdAt.split('T')[0] : (b.created_at ? b.created_at.split('T')[0] : 'Today'));
  const timeSlot = b.timeSlot || b.time_slot || b.booking_slot || (b.time?.includes(',') ? b.time.split(',')[1]?.trim() : (b.time || 'Standard Slot'));
  const status = b.status || 'Pending';
  const notes = b.notes || b.description || '';
  const priority = b.priority || (notes?.toLowerCase().includes('urgent') ? 'Urgent' : 'High');
  const assignedTechnician = b.assignedTechnician || b.technician || (notes?.includes('Tech:') ? notes.split('Tech:')[1]?.trim() : '');
  const paymentStatus = b.paymentStatus || b.payment_status || 'Pending (Pay on Completion)';
  const paymentMethod = b.paymentMethod || b.payment_method || 'Cash / UPI on Doorstep';
  const paymentRef = b.paymentRef || b.payment_ref || null;
  const source = b.source || (bId.startsWith('IND-') ? 'Website Booking' : 'Portal Lead');
  const linkedInquiryId = b.linkedInquiryId || notes?.match(/INQ-[A-Za-z0-9-]+/)?.[0] || null;
  const linkedChatId = b.linkedChatId || notes?.match(/CHAT-[A-Za-z0-9-]+/)?.[0] || null;
  const createdAt = b.createdAt || b.created_at || new Date().toISOString();

  return {
    id: bId,
    dbId: b.dbId || b.id,
    booking_number: bId,
    customerName,
    customer_name: customerName,
    name: customerName,
    customerPhone,
    customer_phone: customerPhone,
    mobile_number: customerPhone,
    phone: customerPhone,
    customerEmail,
    customer_email: customerEmail,
    email: customerEmail,
    locality,
    area: locality,
    address,
    service_address: address,
    pincode,
    serviceName,
    service_name: serviceName,
    service: serviceName,
    packageTitle,
    package_title: packageTitle,
    price,
    amount: price,
    total_amount: price,
    scheduledDate,
    scheduled_date: scheduledDate,
    booking_date: scheduledDate,
    timeSlot,
    time_slot: timeSlot,
    booking_slot: timeSlot,
    time: `${scheduledDate}, ${timeSlot}`,
    status,
    priority,
    assignedTechnician,
    technician: assignedTechnician,
    notes,
    paymentStatus,
    payment_status: paymentStatus,
    paymentMethod,
    payment_method: paymentMethod,
    paymentRef,
    source,
    linkedInquiryId,
    linkedChatId,
    createdAt
  };
}


// Common Indore Spare Parts & Material Presets for Quick Invoice Billing
const INDORE_COMMON_PARTS = [
  { name: 'Tap Spindle / Valve Core', rate: 150, category: 'Plumbing' },
  { name: 'Angle Valve (Brass / Chrome)', rate: 250, category: 'Plumbing' },
  { name: 'Flexible Waste Pipe (PVC)', rate: 120, category: 'Plumbing' },
  { name: 'Teflon Tape & Sealant Pack', rate: 50, category: 'Hardware' },
  { name: 'Flush Tank Syphon / Ball Valve', rate: 350, category: 'Sanitary' },
  { name: 'Modular Switch / 16A Socket', rate: 120, category: 'Electrical' },
  { name: 'Ceiling Fan Capacitor (2.5uF)', rate: 140, category: 'Electrical' },
  { name: 'MCB Single Pole (16A/32A)', rate: 220, category: 'Electrical' }
];

export default function OpsPortalClient() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Portal State - Clean Zero-State by Default
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'inquiries' | 'chats' | 'diagnostics'
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [liveConnected, setLiveConnected] = useState(true);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatReplyText, setChatReplyText] = useState('');


  // Technicians & Fleet Management State
  const [technicians, setTechnicians] = useState(DEFAULT_FLEET_DATA);
  const [isAddTechModalOpen, setIsAddTechModalOpen] = useState(false);
  const [techFilterSpecialty, setTechFilterSpecialty] = useState('All Specialties');
  const [newTechForm, setNewTechForm] = useState({
    name: '',
    phone: '',
    specialty: 'Plumbing & Leakages',
    specialization: 'Plumbing, Leakages & Sanitary Fixtures',
    locatedIn: 'Vijay Nagar',
    serviceArea: 'All over Indore',
    vehicleNumber: 'Service Bike (MP 09)',
    operatingArea: 'All over Indore',
    status: 'Available'
  });

  // Dynamically compute real-time metrics for each technician from Supabase bookings
  const liveTechnicians = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return technicians.map(tech => {
      const techName = (tech.name || tech.title || '').toLowerCase();
      // Find all bookings assigned to this tech
      const assigned = bookings.filter(b => {
        const assignedName = (b.assignedTechnician || b.technician || '').toLowerCase();
        const notes = (b.notes || '').toLowerCase();
        return assignedName.includes(techName) || notes.includes(`tech: ${techName}`) || notes.includes(techName);
      });

      // Daily visits: scheduled for today or active status
      const todayVisits = assigned.filter(b => {
        const isToday = b.scheduledDate === todayStr || b.date === todayStr;
        const isActive = ['Technician Assigned', 'In Progress', 'On The Way', 'Completed', 'Payment Verified & Completed'].includes(b.status);
        return isToday || isActive;
      });

      // Completed jobs
      const completed = assigned.filter(b => b.status === 'Completed' || b.status === 'Payment Verified & Completed');

      // Cash in hand: sum of price/total_amount for cash completed jobs not yet reconciled
      const cashInHand = assigned
        .filter(b => {
          const isCash = (b.paymentMethod || '').toLowerCase().includes('cash');
          const isPaid = (b.paymentStatus || '').toLowerCase().includes('paid') || b.status === 'Completed' || b.status === 'Payment Verified & Completed';
          return isCash && isPaid && !b.cashReconciled;
        })
        .reduce((sum, b) => sum + Number(b.price || b.total_amount || 0), 0);

      const activeJob = assigned.find(b => ['In Progress', 'On The Way', 'Technician Assigned'].includes(b.status)) || null;

      return {
        ...tech,
        dailyVisitCount: todayVisits.length,
        completedJobs: completed.length,
        cashInHand: cashInHand,
        assignedBookings: assigned,
        activeJob: activeJob
      };
    });
  }, [technicians, bookings]);

  // Overall Fleet Totals
  const fleetTotals = useMemo(() => {
    const activeTechs = liveTechnicians.filter(t => t.status === 'On Duty').length;
    const totalDailyVisits = liveTechnicians.reduce((sum, t) => sum + t.dailyVisitCount, 0);
    const totalCompleted = liveTechnicians.reduce((sum, t) => sum + t.completedJobs, 0);
    const totalCashInHand = liveTechnicians.reduce((sum, t) => sum + t.cashInHand, 0);
    return { activeTechs, totalDailyVisits, totalCompleted, totalCashInHand };
  }, [liveTechnicians]);

  // Assign Technician to Booking
  const assignTechnicianToBooking = async (bookingId, technicianName) => {
    let targetDbId = null;
    const isUnassigned = !technicianName || technicianName === 'Unassigned';
    const finalTech = isUnassigned ? '' : technicianName;
    const finalStatus = isUnassigned ? 'Pending' : 'Technician Assigned';

    const updated = bookings.map(b => {
      if (b.id === bookingId || b.booking_number === bookingId || b.dbId === bookingId) {
        targetDbId = b.dbId;
        return {
          ...b,
          assignedTechnician: finalTech,
          technician: finalTech,
          status: finalStatus,
          notes: isUnassigned ? '' : `Tech: ${finalTech}`
        };
      }
      return b;
    });
    setBookings(updated);
    persistState(updated);
    showNotice(isUnassigned ? `Booking #${bookingId} marked as Pending` : `✓ Assigned ${technicianName} to #${bookingId}`);

    try {
      await fetch('/api/portal/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_technician',
          payload: {
            id: bookingId,
            dbId: targetDbId,
            technician: finalTech || null,
            status: finalStatus
          }
        })
      });
    } catch (e) {
      console.warn('Assign technician API error:', e);
    }
  };

  // Reconcile Cash Collection for Technician
  const reconcileTechnicianCash = async (technicianName, amount) => {
    const updated = bookings.map(b => {
      const assignedName = (b.assignedTechnician || b.technician || '').toLowerCase();
      const techName = technicianName.toLowerCase();
      if (assignedName.includes(techName) || (b.notes && b.notes.toLowerCase().includes(techName))) {
        return {
          ...b,
          cashReconciled: true,
          paymentStatus: 'Paid & Deposited'
        };
      }
      return b;
    });
    setBookings(updated);
    showNotice(`✓ Reconciled ₹${amount.toLocaleString('en-IN')} cash collection for ${technicianName}`);

    try {
      await fetch('/api/portal/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reconcile_cash',
          payload: { technician: technicianName, amount }
        })
      });
    } catch (e) {
      console.warn('Reconcile cash API error:', e);
    }
  };

  // Register New Technician
  const handleRegisterTechnician = (e) => {
    e.preventDefault();
    if (!newTechForm.name || !newTechForm.phone) {
      showNotice('Please enter technician name and mobile number.');
      return;
    }
    const newTech = {
      id: `TECH-IND-0${technicians.length + 1}`,
      name: newTechForm.name.trim(),
      title: `${newTechForm.specialization || newTechForm.specialty} Specialist`,
      phone: newTechForm.phone.trim(),
      rating: 4.95,
      repairsCount: 10,
      vehicleNumber: newTechForm.vehicleNumber.trim() || 'Service Bike (MP 09)',
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
      specialty: newTechForm.specialization || newTechForm.specialty,
      specialization: newTechForm.specialization || newTechForm.specialty,
      operatingArea: newTechForm.serviceArea || newTechForm.operatingArea || 'All over Indore',
      serviceArea: newTechForm.serviceArea || newTechForm.operatingArea || 'All over Indore',
      locatedIn: newTechForm.locatedIn || 'Indore',
      status: newTechForm.status || 'Available',
      eta: 'Prompt Arrival'
    };
    setTechnicians(prev => [newTech, ...prev]);
    setIsAddTechModalOpen(false);
    setNewTechForm({
      name: '',
      phone: '',
      specialty: 'Plumbing & Leakages',
      specialization: 'Plumbing, Leakages & Sanitary Fixtures',
      locatedIn: 'Vijay Nagar',
      serviceArea: 'All over Indore',
      vehicleNumber: 'Service Bike (MP 09)',
      operatingArea: 'All over Indore',
      status: 'Available'
    });
    showNotice(`✓ Registered ${newTech.name} to Field Fleet!`);
  };

  // Filters
  const [selectedLocality, setSelectedLocality] = useState('All Localities');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isManualLeadOpen, setIsManualLeadOpen] = useState(false);
  const [whatsappModalData, setWhatsappModalData] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  // Tax Invoice Generator Modal State
  const [invoiceModalBooking, setInvoiceModalBooking] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [invoicePaymentStatus, setInvoicePaymentStatus] = useState('Paid');
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState('UPI / Doorstep Verified');
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartRate, setNewPartRate] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedInvoiceNotice, setCopiedInvoiceNotice] = useState(false);

  const [copiedNotice, setCopiedNotice] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Manual Lead Form State with linking
  const [leadForm, setLeadForm] = useState({
    customerName: '',
    customerPhone: '',
    locality: 'Vijay Nagar',
    address: '',
    serviceName: 'Tap & Mixer Leakage Repair',
    price: '499',
    priority: 'High',
    scheduledDate: new Date().toISOString().split('T')[0],
    timeSlot: '02:00 PM - 04:00 PM',
    notes: '',
    linkedInquiryId: null,
    linkedChatId: null
  });

  // Diagnostic Assistant State
  const [diagInput, setDiagInput] = useState('');
  const [diagLocality, setDiagLocality] = useState('Vijay Nagar');
  const [diagResult, setDiagResult] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Notice Banner Helper
  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  // Fetch Live Data from Supabase
  const fetchLivePortalData = async (showToast = false) => {
    try {
      setIsSyncing(true);
      const res = await fetch(`/api/portal/data?ts=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.bookings)) {
            const normalized = data.bookings.map(normalizeBookingRecord);
            setBookings(normalized);
          }
          if (Array.isArray(data.inquiries)) {
            setInquiries(data.inquiries);
          }
          if (Array.isArray(data.chats)) {
            setChats(data.chats);
            if (data.chats.length > 0 && !selectedChatId) {
              setSelectedChatId(data.chats[0].id);
            }
          }
          if (Array.isArray(data.technicians) && data.technicians.length > 0) {
            setTechnicians(data.technicians);
          }
          setLiveConnected(true);
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSynced(timeStr);
          if (showToast) showNotice(`Synced ${data.counts?.bookings || 0} bookings, ${data.counts?.inquiries || 0} inquiries, ${data.counts?.chats || 0} chats`);
        }
      }
    } catch (err) {
      console.warn('Ops portal live sync notice:', err);
      setLiveConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };


  // Supabase Realtime Active Channel Subscription
  useEffect(() => {
    if (!isAuthenticated) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hnawwvxvfdnkmwtytwre.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_BT_qk2dmGPrd82h-FWZ-VA_ONM7HKJO';
    
    let client = null;
    let channel = null;

    try {
      client = createClient(supabaseUrl, supabaseKey);

      channel = client
        .channel('realtime-portal-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          (payload) => {
            console.log('[Realtime Booking Event]:', payload.eventType, payload.new || payload.old);
            if (payload.eventType === 'INSERT') {
              const normalized = normalizeBookingRecord(payload.new);
              setBookings((prev) => {
                const exists = prev.some(b => b.id === normalized.id || (normalized.dbId && b.dbId === normalized.dbId));
                if (exists) return prev;
                return [normalized, ...prev];
              });
              showNotice(`⚡ Realtime: New Booking #${normalized.id} (${normalized.customerName}) received!`);
            } else if (payload.eventType === 'UPDATE') {
              const normalized = normalizeBookingRecord(payload.new);
              setBookings((prev) =>
                prev.map(b => (b.dbId === normalized.dbId || b.id === normalized.id) ? { ...b, ...normalized } : b)
              );
              setSelectedBookingDetail(curr => (curr && (curr.id === normalized.id || curr.dbId === normalized.dbId)) ? { ...curr, ...normalized } : curr);
              showNotice(`⚡ Realtime: Booking #${normalized.id} updated!`);
            } else if (payload.eventType === 'DELETE') {
              setBookings((prev) =>
                prev.filter(b => b.dbId !== payload.old?.id && b.id !== payload.old?.booking_number)
              );
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leads' },
          () => {
            fetchLivePortalData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'quote_requests' },
          () => {
            fetchLivePortalData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'contact_messages' },
          () => {
            fetchLivePortalData();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeActive(true);
          } else {
            setRealtimeActive(false);
          }
        });
    } catch (err) {
      console.warn('Realtime subscription init notice:', err);
    }

    return () => {
      if (client && channel) {
        client.removeChannel(channel);
      }
    };
  }, [isAuthenticated]);


  // Open Tax Invoice Modal with booking defaults
  const openInvoiceModal = (booking) => {
    if (!booking) return;
    const bId = booking.id || booking.booking_number || `IND-${Math.floor(10000 + Math.random() * 90000)}`;
    const basePrice = Number(booking.price ?? booking.amount ?? booking.total_amount ?? 199);
    const serviceTitle = booking.serviceName || booking.service_name || booking.service || 'Doorstep Service';
    const packageTitle = booking.packageTitle || booking.package_title || booking.package || 'Standard Service Package';
    
    setInvoiceModalBooking(booking);
    setInvoiceNumber(`INV-2026-${bId.toString().replace('IND-', '')}`);
    const today = new Date();
    setInvoiceDate(today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    
    setInvoiceItems([
      {
        id: 'base-service',
        name: serviceTitle,
        description: packageTitle,
        quantity: 1,
        rate: basePrice,
        isBase: true
      }
    ]);
    setInvoiceDiscount(0);
    const isPaid = (booking.paymentStatus || booking.payment_status || '').toLowerCase().includes('paid');
    setInvoicePaymentStatus(isPaid ? 'Paid' : 'Pending (Pay on Completion)');
    setInvoicePaymentMethod(booking.paymentMethod || booking.payment_method || 'UPI / Doorstep Verified');
    setNewPartName('');
    setNewPartQty(1);
    setNewPartRate('');
  };

  // Add Item to Invoice
  const addInvoiceItem = (name = newPartName, qty = newPartQty, rate = newPartRate, desc = 'Replacement Part / Material') => {
    if (!name || !name.toString().trim()) {
      showNotice('Please enter item or spare part description');
      return;
    }
    const numQty = Math.max(1, Number(qty) || 1);
    const numRate = Math.max(0, Number(rate) || 0);
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.toString().trim(),
      description: desc,
      quantity: numQty,
      rate: numRate,
      isBase: false
    };
    setInvoiceItems(prev => [...prev, newItem]);
    setNewPartName('');
    setNewPartQty(1);
    setNewPartRate('');
    showNotice(`Added "${newItem.name}" (₹${numQty * numRate}) to invoice`);
  };

  // Remove Item from Invoice
  const removeInvoiceItem = (itemId) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== itemId));
    showNotice('Item removed from invoice');
  };

  // Calculations for Invoice
  const invoiceSubtotal = useMemo(() => {
    return invoiceItems.reduce((acc, item) => acc + (Number(item.quantity) || 1) * (Number(item.rate) || 0), 0);
  }, [invoiceItems]);

  const invoiceGrandTotal = useMemo(() => {
    return Math.max(0, invoiceSubtotal - (Number(invoiceDiscount) || 0));
  }, [invoiceSubtotal, invoiceDiscount]);

  // Dynamic UPI Payment URI & QR Code
  const upiId = '9174934135@yescred';
  const upiPayee = 'sarthak patidar';
  const upiPaymentUri = useMemo(() => {
    const encodedPayee = encodeURIComponent(upiPayee);
    const encodedNote = encodeURIComponent(`PlumberIndore-${invoiceNumber || 'Bill'}`);
    return `upi://pay?pa=${upiId}&pn=${encodedPayee}&am=${invoiceGrandTotal}&cu=INR&tn=${encodedNote}`;
  }, [invoiceGrandTotal, invoiceNumber]);

  const upiQrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPaymentUri)}`;
  }, [upiPaymentUri]);

  // Print Invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  // Download Standalone Self-Contained HTML Bill
  const handleDownloadInvoiceHtml = () => {
    if (!invoiceModalBooking) return;
    const b = invoiceModalBooking;
    const custName = b.customerName || b.customer_name || 'Customer';
    const custPhone = b.customerPhone || b.phone || b.mobile_number || '';
    const custAddr = b.address || b.service_address || 'Indore';
    const custLoc = b.locality || b.area || 'Indore';

    const itemsRowsHtml = invoiceItems.map((item, i) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
          <strong>${item.name}</strong>${item.description ? `<br><span style="font-size: 11px; color: #64748b;">${item.description}</span>` : ''}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #1e293b;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #1e293b; font-family: monospace;">₹${item.rate}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: bold; color: #0f172a; font-family: monospace;">₹${item.quantity * item.rate}</td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tax Invoice - ${invoiceNumber} | PlumberIndore</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 30px; color: #0f172a; background: #f8fafc; }
    .invoice-card { max-width: 760px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 24px; }
    .logo-text { font-size: 24px; font-weight: 800; color: #0f172a; }
    .logo-text span { color: #f59e0b; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: ${invoicePaymentStatus === 'Paid' ? '#ecfdf5' : '#fffbeb'}; color: ${invoicePaymentStatus === 'Paid' ? '#059669' : '#b45309'}; border: 1px solid ${invoicePaymentStatus === 'Paid' ? '#a7f3d0' : '#fde68a'}; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
    .info-box { background: #f8fafc; padding: 14px 18px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 2px solid #cbd5e1; }
    .totals { margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 14px; }
    .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: #475569; }
    .grand-total { display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; font-weight: 800; color: #0f172a; border-top: 2px solid #0f172a; margin-top: 6px; }
    .upi-box { margin-top: 28px; padding: 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .footer { margin-top: 36px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6; }
    @media print {
      body { background: white; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo-text">Plumber<span>Indore</span></div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Indore's #1 Doorstep Home Services • Certified Operations</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Support: +91 91749 34135 • www.plumberindore.in</div>
      </div>
      <div style="text-align: right;">
        <div class="badge">${invoicePaymentStatus === 'Paid' ? 'TAX INVOICE - PAID' : 'TAX INVOICE - PAYMENT DUE'}</div>
        <div style="font-size: 16px; font-weight: 800; font-family: monospace; margin-top: 8px; color: #0f172a;">#${invoiceNumber}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Date: ${invoiceDate}</div>
        <div style="font-size: 11px; color: #64748b;">Booking Ref: <strong>#${b.id || b.booking_number}</strong></div>
      </div>
    </div>

    <div class="grid">
      <div class="info-box">
        <strong style="color: #0f172a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Billed To (Customer):</strong><br>
        <strong>${custName}</strong><br>
        Phone: <strong>${custPhone}</strong><br>
        Locality: <strong>${custLoc}</strong>, Indore<br>
        Address: ${custAddr}
      </div>
      <div class="info-box">
        <strong style="color: #0f172a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Service & Dispatch Details:</strong><br>
        Service: <strong>${b.serviceName || 'Home Repair'}</strong><br>
        Technician: <strong>${b.assignedTechnician || 'Doorstep Certified Expert'}</strong><br>
        Slot: ${b.scheduledDate || 'Today'} (${b.timeSlot || 'Standard Slot'})<br>
        Payment Mode: <strong>${invoicePaymentMethod}</strong>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Service / Spare Part Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Rate</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span style="font-family: monospace;">₹${invoiceSubtotal}</span>
      </div>
      ${invoiceDiscount > 0 ? `
      <div class="total-row" style="color: #059669;">
        <span>Promotional Discount:</span>
        <span style="font-family: monospace;">-₹${invoiceDiscount}</span>
      </div>` : ''}
      <div class="grand-total">
        <span>Total Payable:</span>
        <span style="color: #059669; font-family: monospace;">₹${invoiceGrandTotal}</span>
      </div>
    </div>

    <div class="upi-box">
      <div style="display: flex; align-items: center; gap: 16px;">
        <img src="${upiQrImageUrl}" alt="Scan to Pay" style="width: 100px; height: 100px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; padding: 4px;" />
        <div>
          <span style="font-size: 10px; font-weight: 800; background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">Instant UPI Scan & Pay</span>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 6px;">
            UPI ID: <span style="font-family: monospace; color: #059669;">${upiId}</span>
          </div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">
            Payee: <strong>${upiPayee}</strong> (PlumberIndore)
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Supports Google Pay, PhonePe, Paytm, BHIM, Cred & Banking UPI
          </div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 11px; color: #64748b;">Amount Due</div>
        <div style="font-size: 22px; font-weight: 900; color: #059669; font-family: monospace;">₹${invoiceGrandTotal}</div>
        <div style="font-size: 10px; color: #166534; font-weight: 700; margin-top: 2px;">${invoicePaymentStatus === 'Paid' ? '✓ Payment Received' : 'Pay On Completion'}</div>
      </div>
    </div>

    <div class="footer">
      <strong>30-Day Post Service Warranty:</strong> All repair work and installed parts are protected under PlumberIndore standard warranty.<br>
      This is a certified digital tax invoice generated by PlumberIndore Operations Center.<br>
      Regd. Address: Indore, Madhya Pradesh • Helpline: +91 91749 34135 • https://www.plumberindore.in
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PlumberIndore_Invoice_${invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`Downloaded Invoice ${invoiceNumber}.html`);
  };

  // WhatsApp Bill Dispatch
  const handleSendInvoiceWhatsApp = () => {
    if (!invoiceModalBooking) return;
    const b = invoiceModalBooking;
    const custPhone = (b.customerPhone || b.phone || b.mobile_number || '').replace(/[^0-9]/g, '');
    const custName = b.customerName || b.customer_name || 'Customer';

    const itemsSummary = invoiceItems.map(it => `• ${it.name} (x${it.quantity}): ₹${it.quantity * it.rate}`).join('\n');
    
    const text = 
`*PLUMBERINDORE TAX INVOICE & SERVICE BILL*\n` +
`--------------------------------------\n` +
`*Invoice No:* #${invoiceNumber}\n` +
`*Date:* ${invoiceDate}\n` +
`*Booking Ref:* #${b.id || b.booking_number}\n` +
`*Customer:* ${custName}\n` +
`*Locality:* ${b.locality || b.area || 'Indore'}\n` +
`--------------------------------------\n` +
`*SERVICE & CHARGES BREAKDOWN:*\n` +
`${itemsSummary}\n` +
`--------------------------------------\n` +
`*Subtotal:* ₹${invoiceSubtotal}\n` +
(invoiceDiscount > 0 ? `*Discount:* -₹${invoiceDiscount}\n` : '') +
`*TOTAL AMOUNT:* ₹${invoiceGrandTotal}\n` +
`*Payment Status:* ${invoicePaymentStatus}\n` +
`--------------------------------------\n` +
`*PAY VIA UPI:*\n` +
`UPI ID: ${upiId} (sarthak patidar)\n` +
`Payment Link: ${upiPaymentUri}\n` +
`--------------------------------------\n` +
`🛡️ *30-Day Doorstep Service Warranty Included*\n` +
`Helpline: +91 91749 34135\n` +
`Website: https://www.plumberindore.in`;

    const encoded = encodeURIComponent(text);
    const waUrl = custPhone ? `https://api.whatsapp.com/send?phone=91${custPhone.slice(-10)}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
    showNotice(`Opened WhatsApp with Invoice #${invoiceNumber}`);
  };

  // Periodic Auto-Sync Every 15 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchLivePortalData();
      const timer = setInterval(() => {
        fetchLivePortalData();
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  // 1. Check LocalStorage Auth on Mount & Clear Any Old Test Data
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth === 'authenticated') {
        setIsAuthenticated(true);
      }

      // Explicitly remove legacy test demo storage key
      localStorage.removeItem('plumberindore_ops_portal_data_v1');

      // Load cached portal state if present (v2)
      const storedData = localStorage.getItem(DATA_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.bookings && Array.isArray(parsed.bookings)) setBookings(parsed.bookings);
        if (parsed.inquiries && Array.isArray(parsed.inquiries)) setInquiries(parsed.inquiries);
        if (parsed.chats && Array.isArray(parsed.chats)) {
          setChats(parsed.chats);
          if (parsed.chats.length > 0) setSelectedChatId(parsed.chats[0].id);
        }
      } else {
        setBookings([]);
        setInquiries([]);
        setChats([]);
      }
    } catch (e) {
      console.warn('Ops portal localStorage initialization error:', e);
    }
  }, []);

  // 2. Persist state changes to LocalStorage
  const persistState = (newBookings, newInquiries, newChats) => {
    try {
      const payload = {
        bookings: newBookings || bookings,
        inquiries: newInquiries || inquiries,
        chats: newChats || chats,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Ops portal persist error:', e);
    }
  };

  // Reset / Clear All Data & Wipe LocalStorage
  const handleResetAllData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all bookings, dispatches, inquiries and chat records?\n\nThis will reset all dashboard counters to zero.'
    );
    if (!confirmed) return;

    setBookings([]);
    setInquiries([]);
    setChats([]);
    setSelectedChatId(null);
    localStorage.removeItem(DATA_STORAGE_KEY);
    localStorage.removeItem('plumberindore_ops_portal_data_v1');
    const emptyPayload = {
      bookings: [],
      inquiries: [],
      chats: [],
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(emptyPayload));
    showNotice('All records cleared. Counters reset to zero.');
  };

  // Auth Handler
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      if (authEmail.trim().toLowerCase() === AUTH_EMAIL && authPassword === AUTH_PASS) {
        setIsAuthenticated(true);
        localStorage.setItem(AUTH_STORAGE_KEY, 'authenticated');
        setIsAuthenticating(false);
      } else {
        setAuthError('Invalid Ops credentials. Access restricted to authorized PlumberIndore personnel.');
        setIsAuthenticating(false);
      }
    }, 400);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setAuthPassword('');
  };

  const autofillDemoCredentials = () => {
    setAuthEmail(AUTH_EMAIL);
    setAuthPassword(AUTH_PASS);
    setAuthError('');
  };

  // KPI Calculations - Starts at ZERO when empty
  const kpis = useMemo(() => {
    const totalRev = bookings
      .filter(b => b.status === 'Completed' || b.paymentStatus === 'Paid')
      .reduce((acc, b) => acc + Number(b.price || 0), 0);
    
    const activeDispatches = bookings.filter(
      b => b.status === 'Technician Assigned' || b.status === 'In Progress'
    ).length;

    const pendingLeads = bookings.filter(b => b.status === 'Pending').length + 
      inquiries.filter(i => i.status === 'New').length;

    const completedJobs = bookings.filter(b => b.status === 'Completed').length;

    return {
      totalRevenue: totalRev,
      activeDispatches,
      pendingLeads,
      completedJobs,
      avgArrival: completedJobs > 0 ? '28 Min' : '0 Min',
      csatRating: completedJobs > 0 ? '4.9 ★' : '0.0 ★'
    };
  }, [bookings, inquiries]);

  // Filtering Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesLocality = selectedLocality === 'All Localities' || 
        (b.locality && b.locality.toLowerCase().includes(selectedLocality.toLowerCase())) ||
        (b.address && b.address.toLowerCase().includes(selectedLocality.toLowerCase()));
      
      const matchesStatus = selectedStatus === 'All Statuses' || b.status === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        b.id.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        (b.address && b.address.toLowerCase().includes(q)) ||
        (b.serviceName && b.serviceName.toLowerCase().includes(q));

      return matchesLocality && matchesStatus && matchesSearch;
    });
  }, [bookings, selectedLocality, selectedStatus, searchQuery]);

  // Status Updater
  const updateBookingStatus = (bookingId, newStatus) => {
    let targetDbId = null;
    let targetTech = null;
    const updated = bookings.map(b => {
      if (b.id === bookingId || b.booking_number === bookingId || b.dbId === bookingId) {
        targetDbId = b.dbId;
        targetTech = b.assignedTechnician || b.technician;
        return {
          ...b,
          status: newStatus,
          paymentStatus: newStatus === 'Completed' ? 'Paid' : b.paymentStatus
        };
      }
      return b;
    });
    setBookings(updated);
    persistState(updated);

    // Persist status update to Supabase
    fetch('/api/portal/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_booking',
        payload: {
          id: bookingId,
          dbId: targetDbId,
          technician: targetTech,
          status: newStatus,
          paymentStatus: newStatus === 'Completed' ? 'Paid' : undefined
        }
      })
    }).catch(console.warn);
  };

  // CSV Export
  const exportBookingsCSV = () => {
    const headers = [
      'Booking ID',
      'Customer Name',
      'Phone',
      'Email',
      'Locality',
      'Address',
      'Service',
      'Package',
      'Price (INR)',
      'Status',
      'Payment Status',
      'Payment Method',
      'Scheduled Date',
      'Time Slot',
      'Technician',
      'Linked Inquiry',
      'Linked Chat',
      'Created At'
    ];

    const rows = filteredBookings.map(b => [
      `"${b.id || b.booking_number || ''}"`,
      `"${b.customerName || b.customer_name || ''}"`,
      `"${b.customerPhone || b.phone || b.mobile_number || ''}"`,
      `"${b.customerEmail || b.customer_email || b.email || ''}"`,
      `"${b.locality || b.area || ''}"`,
      `"${(b.address || b.service_address || '').replace(/"/g, '""')}"`,
      `"${(b.serviceName || b.service_name || b.service || '').replace(/"/g, '""')}"`,
      `"${(b.packageTitle || b.package_title || b.package || '').replace(/"/g, '""')}"`,
      b.price ?? b.amount ?? b.total_amount ?? 0,
      `"${b.status || 'Technician Assigned'}"`,
      `"${b.paymentStatus || b.payment_status || 'Pending'}"`,
      `"${b.paymentMethod || b.payment_method || ''}"`,
      `"${b.scheduledDate || b.scheduled_date || ''}"`,
      `"${b.timeSlot || b.time_slot || ''}"`,
      `"${b.assignedTechnician || b.technician || 'Unassigned'}"`,
      `"${b.linkedInquiryId || ''}"`,
      `"${b.linkedChatId || ''}"`,
      `"${b.createdAt || b.created_at || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `PlumberIndore_Bookings_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------
  // CROSS-LINKING ACTIONS: CONNECTING CHATS, INQUIRIES & BOOKINGS
  // -------------------------------------------------------------

  // 1. Manual / Converted Lead Creation (Links to Booking)
  const handleCreateManualLead = (e) => {
    e.preventDefault();
    if (!leadForm.customerName || !leadForm.customerPhone) return;

    const newBookingId = `IND-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking = {
      id: newBookingId,
      customerName: leadForm.customerName.trim(),
      customerPhone: leadForm.customerPhone.trim(),
      customerEmail: '',
      locality: leadForm.locality,
      address: leadForm.address.trim() || `${leadForm.locality}, Indore`,
      pincode: '452010',
      serviceName: leadForm.serviceName,
      packageTitle: 'Standard Doorstep Repair',
      price: Number(leadForm.price || 499),
      status: 'Pending',
      priority: leadForm.priority,
      scheduledDate: leadForm.scheduledDate,
      timeSlot: leadForm.timeSlot,
      paymentStatus: 'Pending',
      paymentMethod: 'Cash / UPI on Doorstep',
      assignedTechnician: 'Pending Assignment',
      notes: leadForm.notes || 'Manually logged via Ops Portal.',
      linkedInquiryId: leadForm.linkedInquiryId || null,
      linkedChatId: leadForm.linkedChatId || null,
      createdAt: new Date().toISOString()
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);

    // If converted from inquiry, update inquiry status & link booking ID
    let updatedInquiries = inquiries;
    if (leadForm.linkedInquiryId) {
      updatedInquiries = inquiries.map(inq => 
        inq.id === leadForm.linkedInquiryId 
          ? { ...inq, status: 'Converted', linkedBookingId: newBookingId }
          : inq
      );
      setInquiries(updatedInquiries);
    }

    // If converted from chat, update chat & link booking ID
    let updatedChats = chats;
    if (leadForm.linkedChatId) {
      updatedChats = chats.map(c => 
        c.id === leadForm.linkedChatId 
          ? { ...c, linkedBookingId: newBookingId }
          : c
      );
      setChats(updatedChats);
    }

    persistState(updatedBookings, updatedInquiries, updatedChats);
    setIsManualLeadOpen(false);

    // Persist booking to Supabase
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: leadForm.customerName.trim(),
        phone: leadForm.customerPhone.trim(),
        address: leadForm.address.trim() || `${leadForm.locality}, Indore`,
        pincode: '452010',
        date: leadForm.scheduledDate,
        timeSlot: leadForm.timeSlot,
        serviceName: leadForm.serviceName,
        packageTitle: 'Standard Doorstep Repair',
        description: leadForm.notes || 'Logged via Ops Portal'
      })
    }).then(() => fetchLivePortalData()).catch(console.warn);

    // Automatically navigate to Bookings & Dispatch and highlight the new order
    setActiveTab('bookings');
    showNotice(`✅ Booking #${newBookingId} successfully created and linked!`);

    // Reset Form
    setLeadForm({
      customerName: '',
      customerPhone: '',
      locality: 'Vijay Nagar',
      address: '',
      serviceName: 'Tap & Mixer Leakage Repair',
      price: '499',
      priority: 'High',
      scheduledDate: new Date().toISOString().split('T')[0],
      timeSlot: '02:00 PM - 04:00 PM',
      notes: '',
      linkedInquiryId: null,
      linkedChatId: null
    });
  };

  // 2. Convert Inquiry ➔ Booking
  const convertInquiryToBooking = (inquiry) => {
    setLeadForm({
      customerName: inquiry.customerName,
      customerPhone: inquiry.phone,
      locality: inquiry.locality,
      address: `${inquiry.locality}, Indore`,
      serviceName: inquiry.category || 'General Plumbing Inquiry',
      price: '599',
      priority: 'High',
      scheduledDate: new Date().toISOString().split('T')[0],
      timeSlot: '03:00 PM - 05:00 PM',
      notes: `Converted from Inquiry #${inquiry.id}: ${inquiry.message}`,
      linkedInquiryId: inquiry.id,
      linkedChatId: inquiry.linkedChatId || null
    });
    setIsManualLeadOpen(true);
  };

  // 3. Convert Chat ➔ Booking directly
  const convertChatToBooking = (chat) => {
    if (!chat) return;
    const cleanName = chat.customerName.replace(/\s*\([^)]*\)/, '').trim();
    const detectedLoc = chat.customerName.includes('Palasia') ? 'Palasia' : chat.customerName.includes('Bhawarkua') ? 'Bhawarkua' : 'Vijay Nagar';
    const lastMsg = chat.messages?.[chat.messages.length - 1]?.text || 'Live customer discussion';

    setLeadForm({
      customerName: cleanName,
      customerPhone: chat.phone,
      locality: detectedLoc,
      address: `${detectedLoc}, Indore`,
      serviceName: 'Doorstep Plumbing Inspection & Repair',
      price: '499',
      priority: 'High',
      scheduledDate: new Date().toISOString().split('T')[0],
      timeSlot: '02:00 PM - 04:00 PM',
      notes: `Converted from Live Chat #${chat.id}: "${lastMsg}"`,
      linkedInquiryId: chat.linkedInquiryId || null,
      linkedChatId: chat.id
    });
    setIsManualLeadOpen(true);
  };

  // 4. Convert Chat ➔ Inquiry
  const convertChatToInquiry = (chat) => {
    if (!chat) return;
    const inqId = `INQ-${Math.floor(100 + Math.random() * 900)}`;
    const cleanName = chat.customerName.replace(/\s*\([^)]*\)/, '').trim();
    const detectedLoc = chat.customerName.includes('Palasia') ? 'Palasia' : chat.customerName.includes('Bhawarkua') ? 'Bhawarkua' : 'Vijay Nagar';
    const lastMsg = chat.messages?.[chat.messages.length - 1]?.text || 'Inquiry escalated from customer chat.';

    const newInq = {
      id: inqId,
      customerName: cleanName,
      phone: chat.phone,
      locality: detectedLoc,
      category: 'Plumbing Inquiry (Escalated from Live Chat)',
      message: `[From Chat #${chat.id}] ${lastMsg}`,
      createdAt: new Date().toISOString(),
      status: 'New',
      linkedChatId: chat.id
    };

    const updatedInquiries = [newInq, ...inquiries];
    setInquiries(updatedInquiries);

    const updatedChats = chats.map(c => 
      c.id === chat.id ? { ...c, linkedInquiryId: inqId } : c
    );
    setChats(updatedChats);

    persistState(null, updatedInquiries, updatedChats);
    setActiveTab('inquiries');
    showNotice(`📩 Chat #${chat.id} linked & converted to Inquiry #${inqId}!`);
  };

  // 5. Open or Create Live Chat session from Booking or Inquiry
  const openOrCreateChatForCustomer = (name, phone, locality = 'Vijay Nagar', initialNote = '') => {
    const existing = chats.find(c => c.phone === phone);
    if (existing) {
      setSelectedChatId(existing.id);
      setActiveTab('chats');
      showNotice(`💬 Opened active chat with ${existing.customerName}`);
      return;
    }

    const cleanName = name.replace(/\s*\([^)]*\)/, '').trim();
    const newChatId = `CHAT-${Math.floor(300 + Math.random() * 699)}`;
    const newChat = {
      id: newChatId,
      customerName: `${cleanName} (${locality})`,
      phone: phone,
      lastActive: 'Just now',
      unread: false,
      messages: [
        { 
          sender: 'bot', 
          text: initialNote || `Namaste ${cleanName} ji! PlumberIndore Operations here. We are reviewing your request in ${locality}. How can we assist you?`, 
          time: 'Just now' 
        }
      ]
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setSelectedChatId(newChatId);
    persistState(null, null, updatedChats);
    setActiveTab('chats');
    showNotice(`💬 Created live chat session #${newChatId} for ${cleanName}`);
  };

  // 6. Simulation Generators for Quick Testing
  const simulateSampleChat = () => {
    const samples = [
      { name: 'Sunita Jain', loc: 'Vijay Nagar', phone: '9826199887', issue: 'Namaste, mera geyser ka inlet pipe leak ho raha hai. Jaldi technician bhej do.' },
      { name: 'Amit Saxena', loc: 'Palasia', phone: '9977233445', issue: 'Kitchen sink blocked ho gaya hai. Emergency visit chahiye.' },
      { name: 'Gaurav Rathore', loc: 'Bhawarkua', phone: '9752044321', issue: 'Toilet cistern flush valve leak ho raha hai. Rate kya hai?' }
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    const newId = `CHAT-${Math.floor(300 + Math.random() * 699)}`;
    const newChat = {
      id: newId,
      customerName: `${pick.name} (${pick.loc})`,
      phone: pick.phone,
      lastActive: 'Just now',
      unread: true,
      messages: [
        { sender: 'customer', text: pick.issue, time: '12:40 PM' },
        { sender: 'bot', text: `Namaste ${pick.name} ji! Hum turant ${pick.loc} me technician bhej sakte hain.`, time: '12:41 PM' }
      ]
    };

    const updated = [newChat, ...chats];
    setChats(updated);
    setSelectedChatId(newId);
    persistState(null, null, updated);
    setActiveTab('chats');
    showNotice(`✨ Simulated incoming customer chat session #${newId}`);
  };

  const simulateSampleInquiry = () => {
    const samples = [
      { name: 'Neeraj Joshi', phone: '9826555123', loc: 'Vijay Nagar', cat: 'Full Bathroom Plumbing Renovation', msg: 'Want to remodel bathroom in Scheme 78 with concealed valves. Need quote.' },
      { name: 'Kavita Verma', phone: '9425112233', loc: 'Palasia', cat: 'Water Meter & Main Line Repair', msg: 'Narmada water line inlet valve leaking outside boundary wall.' },
      { name: 'Dr. Manish Patidar', phone: '9174934135', loc: 'Sudama Nagar', cat: 'Water Motor Booster Pump Installation', msg: 'Need automatic 0.5HP pressure booster pump installed.' }
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    const newId = `INQ-${Math.floor(100 + Math.random() * 900)}`;
    const newInq = {
      id: newId,
      customerName: pick.name,
      phone: pick.phone,
      locality: pick.loc,
      category: pick.cat,
      message: pick.msg,
      createdAt: new Date().toISOString(),
      status: 'New'
    };

    const updated = [newInq, ...inquiries];
    setInquiries(updated);
    persistState(null, updated, null);
    setActiveTab('inquiries');
    showNotice(`✨ Simulated incoming customer inquiry #${newId}`);
  };

  // WhatsApp Message Generator
  const openWhatsAppModal = (booking, target = 'customer') => {
    let text = '';
    if (target === 'customer') {
      text = `*PlumberIndore Booking Confirmation* 🛠️\n\n` +
        `Namaste *${booking.customerName}* ji,\n` +
        `Your doorstep plumbing appointment has been recorded.\n\n` +
        `📋 *Booking ID:* #${booking.id}\n` +
        `🔧 *Service:* ${booking.serviceName}\n` +
        `📍 *Address:* ${booking.address}\n` +
        `⏰ *Slot:* ${booking.scheduledDate} (${booking.timeSlot})\n` +
        `💰 *Estimated Amount:* ₹${booking.price} (Pay via UPI/Cash upon completion)\n` +
        `👷 *Assigned Tech:* ${booking.assignedTechnician || 'Doorstep Pro Assigned'}\n\n` +
        `Our technician will arrive equipped with genuine parts promptly. For urgent updates, call 91749 34135.\n\n` +
        `_Doorstep Plumbing Network, Indore_`;
    } else {
      text = `*🚨 PLUMBER INDORE - TECHNICIAN DISPATCH ORDER*\n\n` +
        `*Order:* #${booking.id} (${booking.priority.toUpperCase()} PRIORITY)\n` +
        `*Customer:* ${booking.customerName || booking.customer_name || 'Customer'}\n` +
        `*Contact:* ${booking.customerPhone || booking.phone || booking.mobile_number || 'Not provided'}\n` +
        `*Locality:* ${booking.locality || booking.area || 'Indore'}\n` +
        `*Address:* ${booking.address || booking.service_address || 'Indore'}\n` +
        `*Service Required:* ${booking.serviceName || booking.service_name || 'Home Repair'}\n` +
        `*Problem Notes:* ${booking.notes || booking.description || 'Check and repair'}\n` +
        `*Scheduled Time:* ${booking.scheduledDate || booking.scheduled_date || 'Today'} (${booking.timeSlot || booking.time_slot || 'Slot'})\n` +
        `*Collect Amount:* ₹${booking.price ?? booking.amount ?? booking.total_amount ?? 0}\n\n` +
        `📌 *Google Maps:* https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}\n\n` +
        `_Report status back to Indore Ops Console after arrival._`;
    }

    setWhatsappModalData({
      booking,
      target,
      message: text
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  // AI Diagnostic Generator Logic
  const runAIDiagnostic = (customPrompt = null, bookingContext = null) => {
    setIsDiagnosing(true);
    const query = (customPrompt || diagInput).toLowerCase();
    
    setTimeout(() => {
      let diagnosis = {
        title: 'General Plumbing Inspection & Valve Check',
        probableCause: 'Internal seal wear-and-tear or water pressure airlocks common in Indore overhead gravity feeds.',
        severity: 'Medium (Standard doorstep repair)',
        partsNeeded: ['Quarter turn ceramic spindle (1/2")', 'PTFE Teflon seal tape', 'Neoprene O-rings'],
        toolsRequired: ['Adjustable pipe wrench 10"', 'Spanner set 12-19mm', 'Internal thread cleaner'],
        laborEstimate: 299,
        partsEstimate: 180,
        totalEstimate: 479,
        timeToFix: '35 - 45 Minutes',
        recommendation: 'Turn off the main overhead tank inlet stop-cock before dismantling the fixture to prevent back-pressure overflow.'
      };

      if (query.includes('seep') || query.includes('concealed') || query.includes('wall') || query.includes('leak')) {
        diagnosis = {
          title: 'Concealed Joint Failure or Tile Grout Water Penetration',
          probableCause: 'CPVC pipe joint solvent weld failure behind tiles or degraded waterproofing near shower elbow drop.',
          severity: 'High (Risk of plaster structural degradation)',
          partsNeeded: ['CPVC 1/2" transition brass elbow', 'Heavy duty solvent weld cement', 'Non-shrink tile epoxy grout'],
          toolsRequired: ['Rotary hammer drill with chisel bit', 'Pipe pressure test pump', 'Acoustic leak probe'],
          laborEstimate: 750,
          partsEstimate: 350,
          totalEstimate: 1100,
          timeToFix: '90 - 120 Minutes',
          recommendation: 'Perform hydrostatic pressure test on the hot and cold line individually to isolate the specific concealed burst point.'
        };
      } else if (query.includes('clog') || query.includes('sink') || query.includes('drain') || query.includes('block')) {
        diagnosis = {
          title: 'Kitchen Fat / Soap Curd Mechanical Drainage Obstruction',
          probableCause: 'Accumulation of solidified cooking ghee/oil and solid food sediments in P-trap and 40mm waste line.',
          severity: 'Moderate (Foul sewer odor & backflow risk)',
          partsNeeded: ['Heavy gauge flexible waste pipe 1.5"', 'Rubber slip joint washer', 'Drain-X microbial enzyme packet'],
          toolsRequired: ['Steel spring drain auger (5 meter)', 'High pressure suction plunger', 'Tubing cutter'],
          laborEstimate: 450,
          partsEstimate: 120,
          totalEstimate: 570,
          timeToFix: '30 - 40 Minutes',
          recommendation: 'Avoid acid cleaners which weaken PVC pipe bends; use mechanical snaking followed by boiling hot water flush.'
        };
      } else if (query.includes('flush') || query.includes('toilet') || query.includes('cistern') || query.includes('commode')) {
        diagnosis = {
          title: 'Flush Cistern Syphon Diaphragm & Ball Valve Failure',
          probableCause: 'Hard water scale buildup in Indore borewell water causing siphon flap rubber to stiffen, causing non-stop trickle into bowl.',
          severity: 'High Water Wastage (Losing up to 200 Litres/day)',
          partsNeeded: ['Universal dual-flush siphon assembly', 'Bottom inlet float valve 1/2"', 'Connecting braided hose 18"'],
          toolsRequired: ['Basin spanner', 'Multi-grip pliers', 'Descaling wire brush'],
          laborEstimate: 350,
          partsEstimate: 280,
          totalEstimate: 630,
          timeToFix: '25 - 35 Minutes',
          recommendation: 'Inspect float arm height. If tank water level is above overflow pipe, adjust float screw 1/2 inch downward.'
        };
      } else if (query.includes('tank') || query.includes('motor') || query.includes('pump')) {
        diagnosis = {
          title: 'Centrifugal Pump Air-Lock or Foot Valve Non-Return Leak',
          probableCause: 'Bottom foot valve strainer choked with rust debris or suction line drawing micro air pockets from ground sump.',
          severity: 'High (Motor running dry causes impeller burn)',
          partsNeeded: ['Brass check non-return valve (NRV) 1"', 'Teflon heavy tape', 'GI nipple adapter'],
          toolsRequired: ['Heavy pipe wrench 14"', 'Priming funnel', 'Teflon pipe sealer'],
          laborEstimate: 550,
          partsEstimate: 390,
          totalEstimate: 940,
          timeToFix: '45 - 60 Minutes',
          recommendation: 'Prime suction pipe completely and verify clockwise motor rotation before continuous load run.'
        };
      }

      setDiagResult(diagnosis);
      setIsDiagnosing(false);
    }, 450);
  };

  // Chat Quick Reply Handler
  const sendQuickReply = (text) => {
    if (!text || !selectedChatId) return;
    const updatedChats = chats.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          unread: false,
          messages: [
            ...c.messages,
            { sender: 'bot', text: text, time: 'Just now' }
          ]
        };
      }
      return c;
    });
    setChats(updatedChats);
    setChatReplyText('');
    persistState(null, null, updatedChats);

    // Persist reply to Supabase leads table
    const currentChat = chats.find(c => c.id === selectedChatId);
    if (currentChat) {
      fetch('/api/portal/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply_chat',
          payload: {
            sessionId: currentChat.id,
            dbId: currentChat.dbId,
            replyText: text
          }
        })
      }).catch(console.warn);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Unauthenticated Shield Gate (Crisp White / Light-Slate Theme)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 selection:bg-amber-100 selection:text-slate-900 overflow-y-auto">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-soft-lg p-8 relative z-10">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="PlumberIndore Official Logo" 
                  className="w-16 h-16 object-contain drop-shadow-sm transition-transform hover:scale-105"
                />
              </div>
            </div>
            
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">
              Plumber<span className="text-amber-500">Indore</span> <span className="text-xs bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded border border-slate-200 ml-1">OPS</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Confidential Operations & Dispatch Console
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold">
              <MapPin className="w-3 h-3 text-amber-500" />
              <span>Indore Control Hub: Vijay Nagar • Palasia • Bhawarkua</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Ops Identity Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="admin@plumberindore.in"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Secret Access Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-soft-md flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              <Lock className="w-4 h-4" />
              <span>{isAuthenticating ? 'Authenticating Session...' : 'Sign In to Ops Console'}</span>
            </button>

            <button
              type="button"
              onClick={autofillDemoCredentials}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-fill Demo Credentials (admin@plumberindore.in)</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Zero-Backend LocalStorage Persistence • Indore Cluster</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Authenticated Ops Dashboard (White / Light-Slate & Navy Theme)
  // -------------------------------------------------------------
  const activeChat = chats.find(c => c.id === selectedChatId) || chats[0] || null;

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-slate-900 overflow-y-auto pb-16">
      
      {/* Dynamic Action Notification Banner */}
      {actionNotice && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Ops Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OfficialBrandLogo size="md" isDarkBg={false} showTagline={true} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Database Status Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden md:inline">{realtimeActive ? '⚡ Realtime Live Active' : 'Live Supabase Connected'}</span>
              <span className="md:hidden">{realtimeActive ? '⚡ Realtime' : 'Live DB'}</span>
              {lastSynced && <span className="text-[10px] text-emerald-600 font-normal hidden lg:inline">({lastSynced})</span>}
              <button
                type="button"
                onClick={() => fetchLivePortalData(true)}
                disabled={isSyncing}
                className="ml-1 p-1 hover:bg-emerald-100 rounded text-emerald-800 transition-colors cursor-pointer"
                title="Refresh live bookings, inquiries & chats from Supabase"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => {
                setLeadForm({
                  customerName: '',
                  customerPhone: '',
                  locality: 'Vijay Nagar',
                  address: '',
                  serviceName: 'Tap & Mixer Leakage Repair',
                  price: '499',
                  priority: 'High',
                  scheduledDate: new Date().toISOString().split('T')[0],
                  timeSlot: '02:00 PM - 04:00 PM',
                  notes: '',
                  linkedInquiryId: null,
                  linkedChatId: null
                });
                setIsManualLeadOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">New Lead / Booking</span>
              <span className="sm:hidden">Add</span>
            </button>

            <button
              onClick={exportBookingsCSV}
              disabled={filteredBookings.length === 0}
              className="bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1.5 shadow-soft-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handleResetAllData}
              className="bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:border-rose-200 flex items-center gap-1.5 shadow-soft-sm transition-colors"
              title="Clear all local booking & inquiry records and reset counters to zero"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset to Zero</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            <button
              onClick={handleLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Sign Out of Ops Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* 4 KPI Metric Cards - Clean Zero State */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* KPI 1: Total Revenue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-soft-sm hover:shadow-soft-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              ₹{kpis.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>{kpis.completedJobs} jobs verified completed ({kpis.completedJobs > 0 ? '+14.2%' : '0%'})</span>
            </div>
          </div>

          {/* KPI 2: Active Dispatches */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-soft-sm hover:shadow-soft-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Dispatches</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              {kpis.activeDispatches}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Wrench className="w-3 h-3 text-blue-600" />
              <span>Technicians en-route / in progress</span>
            </div>
          </div>

          {/* KPI 3: Pending Leads */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-soft-sm hover:shadow-soft-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Leads</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight font-heading">
              {kpis.pendingLeads}
            </div>
            <div className="mt-2 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Awaiting technician allocation</span>
            </div>
          </div>

          {/* KPI 4: Indore SLA Speed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-soft-sm hover:shadow-soft-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Indore SLA Speed</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              {kpis.avgArrival}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <span>Customer CSAT Rating: <strong className="text-slate-900">{kpis.csatRating}</strong></span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* INTERCONNECTED WORKFLOW PIPELINE BREADCRUMB */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-soft-sm">
          <div className="flex items-center gap-2 sm:gap-3 text-xs overflow-x-auto no-scrollbar py-0.5">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Ops Pipeline:</span>
            </span>

            {/* Stage 1: Live Chats */}
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold shrink-0 ${
                activeTab === 'chats'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Live Chat Monitor</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono">
                {chats.length}
              </span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            {/* Stage 2: Inquiries */}
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold shrink-0 ${
                activeTab === 'inquiries'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Inquiries & Quotes</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
                {inquiries.length}
              </span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            {/* Stage 3: Bookings */}
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold shrink-0 ${
                activeTab === 'bookings'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Bookings & Dispatch</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                {bookings.length}
              </span>
            </button>
          </div>

          {/* Quick Simulation Trigger for Demonstration */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <button
              onClick={simulateSampleChat}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
              title="Simulate incoming customer chat to test cross-linking"
            >
              <Plus className="w-3 h-3" />
              <span>Simulate Chat</span>
            </button>
            <button
              onClick={simulateSampleInquiry}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
              title="Simulate customer quote inquiry to test cross-linking"
            >
              <Plus className="w-3 h-3" />
              <span>Simulate Inquiry</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Main Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Bookings & Dispatch ({filteredBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'inquiries'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Inquiry & Quotes ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'chats'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Chatbot Monitor ({chats.length})</span>
          </button>


          <button
            onClick={() => setActiveTab('technicians')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'technicians'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            <span>Technicians & Field Fleet ({liveTechnicians.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'diagnostics'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Diagnostic Engine</span>
          </button>
        </div>

        {/* --------------------------------------------------------- */}
        {/* TAB 1: BOOKINGS & DISPATCH */}
        {/* --------------------------------------------------------- */}
        {activeTab === 'bookings' && (
          <div>
            {/* Filter & Search Toolbar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-soft-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer, phone, booking ID, or street..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {/* Locality Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-slate-800 text-xs font-medium cursor-pointer"
                  >
                    {INDORE_LOCALITIES.map(loc => (
                      <option key={loc} value={loc} className="bg-white text-slate-900">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                  <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-slate-800 text-xs font-medium cursor-pointer"
                  >
                    <option value="All Statuses" className="bg-white text-slate-900">All Statuses</option>
                    <option value="Pending" className="bg-white text-slate-900">Pending</option>
                    <option value="Technician Assigned" className="bg-white text-slate-900">Technician Assigned</option>
                    <option value="In Progress" className="bg-white text-slate-900">In Progress</option>
                    <option value="Completed" className="bg-white text-slate-900">Completed</option>
                    <option value="Cancelled" className="bg-white text-slate-900">Cancelled</option>
                  </select>
                </div>

                {(selectedLocality !== 'All Localities' || selectedStatus !== 'All Statuses' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedLocality('All Localities');
                      setSelectedStatus('All Statuses');
                      setSearchQuery('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 underline font-semibold transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Bookings Table with Cross-Linking */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Booking ID & Origin</th>
                      <th className="py-3.5 px-4">Customer & Contact</th>
                      <th className="py-3.5 px-4">Locality & Address</th>
                      <th className="py-3.5 px-4">Service Booked</th>
                      <th className="py-3.5 px-4">Slot & Price</th>
                      <th className="py-3.5 px-4">Assigned Technician</th>
                      <th className="py-3.5 px-4">Dispatch Status</th>
                      <th className="py-3.5 px-4 text-right">Actions & Chat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-slate-500">
                          <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                          <p className="font-bold text-slate-800 text-base font-heading">No bookings recorded</p>
                          <p className="text-xs mt-1 text-slate-500 max-w-md mx-auto">
                            All test records have been wiped and counters reset to zero. Convert an inquiry, escalate a live customer chat, or log a direct booking below.
                          </p>
                          <div className="mt-4 flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setLeadForm({
                                  customerName: '',
                                  customerPhone: '',
                                  locality: 'Vijay Nagar',
                                  address: '',
                                  serviceName: 'Tap & Mixer Leakage Repair',
                                  price: '499',
                                  priority: 'High',
                                  scheduledDate: new Date().toISOString().split('T')[0],
                                  timeSlot: '02:00 PM - 04:00 PM',
                                  notes: '',
                                  linkedInquiryId: null,
                                  linkedChatId: null
                                });
                                setIsManualLeadOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Log Direct Booking</span>
                            </button>
                            <button
                              onClick={() => setActiveTab('inquiries')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>View Inquiries ({inquiries.length})</span>
                            </button>
                            <button
                              onClick={() => setActiveTab('chats')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>View Chats ({chats.length})</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const statusColors = {
                          'Pending': 'bg-amber-50 text-amber-800 border-amber-200',
                          'Technician Assigned': 'bg-blue-50 text-blue-800 border-blue-200',
                          'In Progress': 'bg-indigo-50 text-indigo-800 border-indigo-200',
                          'Completed': 'bg-emerald-50 text-emerald-800 border-emerald-200',
                          'Cancelled': 'bg-rose-50 text-rose-800 border-rose-200'
                        };

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>#{b.id || b.booking_number}</span>
                                {(b.priority === 'Urgent' || b.notes?.toLowerCase().includes('urgent')) && (
                                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Urgent Lead" />
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 block font-sans font-normal">
                                {b.scheduledDate || b.scheduled_date || (b.time ? b.time.split(',')[0] : 'Today')}
                              </span>
                              
                              {/* Cross-Link Badges to Source Inquiry / Chat */}
                              <div className="flex flex-wrap gap-1 mt-1 font-sans">
                                {b.linkedInquiryId && (
                                  <button
                                    onClick={() => {
                                      setActiveTab('inquiries');
                                      showNotice(`Viewing Source Inquiry #${b.linkedInquiryId}`);
                                    }}
                                    className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[9px] font-bold transition-colors"
                                    title={`Click to view original Inquiry #${b.linkedInquiryId}`}
                                  >
                                    <span>From {b.linkedInquiryId}</span>
                                    <ArrowUpRight className="w-2.5 h-2.5" />
                                  </button>
                                )}
                                {b.linkedChatId && (
                                  <button
                                    onClick={() => {
                                      setActiveTab('chats');
                                      setSelectedChatId(b.linkedChatId);
                                      showNotice(`Viewing Source Chat Session #${b.linkedChatId}`);
                                    }}
                                    className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded text-[9px] font-bold transition-colors"
                                    title={`Click to open original Chat Session #${b.linkedChatId}`}
                                  >
                                    <span>From {b.linkedChatId}</span>
                                    <ArrowUpRight className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                <span>{b.customerName || b.customer_name || 'Customer'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <a href={`tel:${b.customerPhone || b.phone || b.mobile_number}`} className="hover:text-emerald-700 font-mono transition-colors font-medium">
                                  {b.customerPhone || b.phone || b.mobile_number || 'Not provided'}
                                </a>
                              </div>
                            </td>

                            <td className="py-4 px-4 max-w-xs">
                              <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px] mb-1">
                                📍 {b.locality || b.area || 'Indore'}
                              </span>
                              <p className="text-slate-600 text-xs line-clamp-1" title={b.address || b.service_address}>
                                {b.address || b.service_address || 'Doorstep Address'}
                              </p>
                            </td>

                            <td className="py-4 px-4 max-w-xs">
                              <p className="font-semibold text-slate-900 line-clamp-1" title={b.serviceName || b.service_name || b.service}>
                                {b.serviceName || b.service_name || b.service || 'Home Repair'}
                              </p>
                              <span className="text-[11px] text-slate-500 block">
                                {b.packageTitle || b.package_title || b.package || 'Standard Package'}
                              </span>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900 font-mono text-sm">
                                ₹{b.price ?? b.amount ?? b.total_amount ?? 0}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{b.timeSlot || b.time_slot || (b.time ? b.time.split(',')[1] : 'Standard Slot')}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <select
                                value={
                                  !b.assignedTechnician || b.assignedTechnician === 'Pending Allocation' || b.assignedTechnician === 'Unassigned'
                                    ? 'Unassigned'
                                    : b.assignedTechnician
                                }
                                onChange={(e) => assignTechnicianToBooking(b.id, e.target.value)}
                                className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs transition-all"
                              >
                                <option value="Unassigned">⚠️ Pending Allocation</option>
                                {liveTechnicians.map(t => (
                                  <option key={t.id || t.name} value={t.name}>
                                    👷 {t.name} ({t.specialization || t.specialty || 'Pro'})
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <select
                                value={b.status}
                                onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                                  statusColors[b.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <option value="Pending" className="bg-white text-slate-900">Pending</option>
                                <option value="Technician Assigned" className="bg-white text-slate-900">Technician Assigned</option>
                                <option value="In Progress" className="bg-white text-slate-900">In Progress</option>
                                <option value="Completed" className="bg-white text-slate-900">Completed</option>
                                <option value="Cancelled" className="bg-white text-slate-900">Cancelled</option>
                              </select>
                            </td>

                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Cross-Link: Open/Create Live Customer Chat */}
                                <button
                                  onClick={() => openOrCreateChatForCustomer(
                                    b.customerName || b.customer_name || 'Customer',
                                    b.customerPhone || b.phone || b.mobile_number || '',
                                    b.locality || b.area || 'Indore',
                                    `Namaste ${b.customerName || b.customer_name || 'Customer'} ji, this is PlumberIndore regarding your Booking #${b.id || b.booking_number} (${b.serviceName || b.service_name || 'Home Repair'}). How can we assist you?`
                                  )}
                                  title="Open / Start Live Chat with this customer"
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>

                                {/* WhatsApp Dispatch Trigger */}
                                <button
                                  onClick={() => openWhatsAppModal(b, 'customer')}
                                  title="Dispatch WhatsApp Notification"
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>

                                {/* Tax Invoice & Bill Generator Trigger */}
                                <button
                                  onClick={() => openInvoiceModal(b)}
                                  title="Generate Tax Invoice & Bill"
                                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                                </button>

                                {/* View Detail Drawer */}
                                <button
                                  onClick={() => setSelectedBookingDetail(b)}
                                  title="View Full Booking Details"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 2: INQUIRIES & QUOTE REVIEWS */}
        {/* --------------------------------------------------------- */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">Customer Inquiries & Quote Requests</h2>
                <p className="text-xs text-slate-500">Inbound leads linked to the dispatch pipeline. Convert directly to Bookings or Live Chat.</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={simulateSampleInquiry}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simulate New Inquiry</span>
                </button>
              </div>
            </div>

            {inquiries.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500 shadow-soft-sm">
                <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-800 text-base font-heading">No customer inquiries or quote requests</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  All test leads have been cleared. Inbound inquiries from the website, contact forms, or escalated from live chats will appear here.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={simulateSampleInquiry}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Create Sample Inquiry</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('chats')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Monitor Live Chats ({chats.length})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-soft-sm hover:shadow-soft-md transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold text-slate-500">{inq.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          inq.status === 'New' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          inq.status === 'Converted' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {inq.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base font-heading">{inq.customerName}</h3>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <a href={`tel:${inq.phone}`} className="hover:text-emerald-700 font-mono font-semibold">
                          {inq.phone}
                        </a>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-700 font-medium">📍 {inq.locality}</span>
                      </div>

                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700">
                        <p className="font-bold text-slate-900 mb-1">{inq.category}</p>
                        <p className="text-slate-600 text-xs leading-relaxed">{inq.message}</p>
                      </div>

                      {/* Cross-Link Status Badges */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {inq.linkedBookingId && (
                          <button
                            onClick={() => {
                              setActiveTab('bookings');
                              setSearchQuery(inq.linkedBookingId);
                              showNotice(`Viewing Linked Booking #${inq.linkedBookingId}`);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                          >
                            <Briefcase className="w-3 h-3 text-emerald-600" />
                            <span>Linked Booking #{inq.linkedBookingId}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {inq.linkedChatId && (
                          <button
                            onClick={() => {
                              setActiveTab('chats');
                              setSelectedChatId(inq.linkedChatId);
                              showNotice(`Viewing Linked Chat Session #${inq.linkedChatId}`);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-blue-600" />
                            <span>Linked Chat #{inq.linkedChatId}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* Cross-link to live chat */}
                      <button
                        onClick={() => openOrCreateChatForCustomer(inq.customerName, inq.phone, inq.locality, `Namaste ${inq.customerName} ji! PlumberIndore here regarding your inquiry for ${inq.category}.`)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                        title="Chat directly with customer in Live Monitor"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Chat</span>
                      </button>

                      {/* Convert to Booking */}
                      <button
                        onClick={() => convertInquiryToBooking(inq)}
                        disabled={inq.status === 'Converted'}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1 shadow-sm ${
                          inq.status === 'Converted'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {inq.status === 'Converted' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Converted</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Convert Lead</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 3: CHATBOT LIVE MONITOR */}
        {/* --------------------------------------------------------- */}
        {activeTab === 'chats' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft-sm">
            {chats.length === 0 ? (
              <div className="p-16 text-center text-slate-400 bg-white flex flex-col items-center justify-center">
                <MessageSquare className="w-12 h-12 text-slate-200 mb-3" />
                <h3 className="font-bold text-slate-700 text-base font-heading">No Active Chat Conversations</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                  All test chat logs have been wiped. Live visitor conversations from the doorstep chatbot widget will appear here in real-time.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={simulateSampleChat}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Simulate Inbound Customer Chat</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>View Bookings ({bookings.length})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
                {/* Conversations Sidebar */}
                <div className="border-r border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Live Conversations ({chats.length})
                    </h3>
                    <button
                      onClick={simulateSampleChat}
                      className="text-[10px] text-blue-700 hover:underline font-bold"
                    >
                      + Add Chat
                    </button>
                  </div>
                  <div className="space-y-2">
                    {chats.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedChatId(c.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          selectedChatId === c.id
                            ? 'bg-white border-slate-900 text-slate-900 shadow-sm'
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900">{c.customerName}</span>
                          <span className="text-[10px] text-slate-400">{c.lastActive}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {c.messages[c.messages.length - 1]?.text}
                        </p>
                        
                        {/* Status Pills */}
                        <div className="flex items-center gap-1 mt-1.5">
                          {c.linkedBookingId && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              Booked #{c.linkedBookingId}
                            </span>
                          )}
                          {c.linkedInquiryId && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                              Inquiry #{c.linkedInquiryId}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Chat Conversation View */}
                <div className="md:col-span-2 flex flex-col justify-between bg-white p-4 sm:p-6">
                  {activeChat ? (
                    <>
                      <div>
                        {/* Chat Header with Direct Link Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 mb-4 gap-3">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm font-heading flex items-center gap-2">
                              <span>{activeChat?.customerName}</span>
                              <span className="text-[10px] font-mono text-slate-400">({activeChat?.id})</span>
                            </h3>
                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>Phone: <strong className="font-mono text-slate-700">{activeChat?.phone}</strong></span>
                              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Customer Session
                              </span>
                            </p>
                          </div>

                          {/* Cross-Link Action Buttons */}
                          <div className="flex items-center gap-2">
                            {/* Convert to Booking Button */}
                            <button
                              onClick={() => convertChatToBooking(activeChat)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                              title="Create and link a booking order directly from this chat"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Create Booking</span>
                            </button>

                            {/* Convert to Inquiry Button */}
                            <button
                              onClick={() => convertChatToInquiry(activeChat)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Escalate and save this conversation as an Inquiry"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Save as Inquiry</span>
                            </button>

                            <a
                              href={`tel:${activeChat?.phone}`}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-emerald-700 rounded-xl border border-slate-200 transition-colors"
                              title="Direct Phone Call"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </div>
                        </div>

                        {/* Linked Chips if already converted */}
                        {(activeChat.linkedBookingId || activeChat.linkedInquiryId) && (
                          <div className="mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-xs">
                            <span className="font-bold text-slate-500 text-[11px]">Linked Records:</span>
                            {activeChat.linkedBookingId && (
                              <button
                                onClick={() => {
                                  setActiveTab('bookings');
                                  setSearchQuery(activeChat.linkedBookingId);
                                  showNotice(`Viewing Linked Booking #${activeChat.linkedBookingId}`);
                                }}
                                className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100/60 hover:bg-emerald-200 px-2 py-0.5 rounded-lg font-bold transition-colors"
                              >
                                <Briefcase className="w-3 h-3 text-emerald-600" />
                                <span>Booking #{activeChat.linkedBookingId}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            {activeChat.linkedInquiryId && (
                              <button
                                onClick={() => {
                                  setActiveTab('inquiries');
                                  showNotice(`Viewing Linked Inquiry #${activeChat.linkedInquiryId}`);
                                }}
                                className="inline-flex items-center gap-1 text-amber-800 bg-amber-100/60 hover:bg-amber-200 px-2 py-0.5 rounded-lg font-bold transition-colors"
                              >
                                <HelpCircle className="w-3 h-3 text-amber-600" />
                                <span>Inquiry #{activeChat.linkedInquiryId}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-4">
                          {activeChat?.messages.map((m, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col ${m.sender === 'customer' ? 'items-start' : 'items-end'}`}
                            >
                              <div
                                className={`max-w-md p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                  m.sender === 'customer'
                                    ? 'bg-slate-100 border border-slate-200 text-slate-900 rounded-tl-none'
                                    : 'bg-slate-900 text-white font-medium rounded-tr-none shadow-sm'
                                }`}
                              >
                                {m.text}
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Ops One-Click Quick Replies:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                          {QUICK_REPLIES.map((reply, i) => (
                            <button
                              key={i}
                              onClick={() => sendQuickReply(reply)}
                              className="text-left p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-medium rounded-xl transition-colors truncate"
                              title={reply}
                            >
                              {reply}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={chatReplyText}
                            onChange={(e) => setChatReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendQuickReply(chatReplyText)}
                            placeholder="Type custom dispatch message or response..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                          />
                          <button
                            onClick={() => sendQuickReply(chatReplyText)}
                            disabled={!chatReplyText.trim()}
                            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold p-2.5 rounded-xl transition-all shadow-sm"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}


        {/* --------------------------------------------------------- */}
        {/* TAB 5: TECHNICIANS & FIELD FLEET DASHBOARD */}
        {/* --------------------------------------------------------- */}
        {activeTab === 'technicians' && (
          <div className="space-y-6">
            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-soft-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Fleet On Duty</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">{fleetTotals.activeTechs}</span>
                  <span className="text-xs text-slate-500">/ {liveTechnicians.length} Verified</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">● 100% Indore Service Coverage</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-soft-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Visits Scheduled</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">{fleetTotals.totalDailyVisits}</span>
                  <span className="text-xs text-slate-500">Scheduled Visits</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium block mt-1">Directly synced from bookings</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-soft-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jobs Completed</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">{fleetTotals.totalCompleted}</span>
                  <span className="text-xs text-slate-500">Finished</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Verified on-site repairs</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-soft-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cash in Hand (Fleet)</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600 font-mono">₹{fleetTotals.totalCashInHand.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium block mt-1">Cash collected pending deposit</span>
              </div>
            </div>

            {/* Fleet Controls & Search Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={techFilterSpecialty}
                    onChange={(e) => setTechFilterSpecialty(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-xs text-slate-800 cursor-pointer font-bold"
                  >
                    <option value="All Specialties">All Specialties</option>
                    <option value="Plumbing & Leakages">Plumbing & Leakages</option>
                    <option value="Electrical & MCB Safety">Electrical & MCB Safety</option>
                    <option value="AC Foam Jet & Gas Refill">AC Foam Jet & Gas Refill</option>
                    <option value="Drain Blockage & Water Motors">Drain Blockage & Water Motors</option>
                    <option value="Geyser, Fridge & RO Purifier">Home Appliances</option>
                    <option value="Refrigerator Repair Work">Refrigerator Repair Work</option>
                  </select>
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  Showing {liveTechnicians.filter(t => 
                    techFilterSpecialty === 'All Specialties' || 
                    t.specialty === techFilterSpecialty || 
                    t.specialization === techFilterSpecialty ||
                    (t.specialization && t.specialization.toLowerCase().includes(techFilterSpecialty.toLowerCase())) ||
                    (t.specialty && t.specialty.toLowerCase().includes(techFilterSpecialty.toLowerCase()))
                  ).length} of {liveTechnicians.length} field professionals
                </span>
              </div>

              <button
                onClick={() => setIsAddTechModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Register New Technician</span>
              </button>
            </div>

            {/* Technician Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {liveTechnicians
                .filter(t => 
                  techFilterSpecialty === 'All Specialties' || 
                  t.specialty === techFilterSpecialty || 
                  t.specialization === techFilterSpecialty ||
                  (t.specialization && t.specialization.toLowerCase().includes(techFilterSpecialty.toLowerCase())) ||
                  (t.specialty && t.specialty.toLowerCase().includes(techFilterSpecialty.toLowerCase()))
                )
                .map((tech) => (
                  <div
                    key={tech.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Technician Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={tech.photoUrl}
                              alt={tech.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
                            />
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active on Duty" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-extrabold text-slate-900 text-sm font-heading">{tech.name}</h4>
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                                ★ {tech.rating}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">{tech.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {tech.id}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          tech.status === 'Available' || tech.status === 'On Duty'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          ● {tech.status || 'Available'}
                        </span>
                      </div>

                      {/* 3 Core Metadata Attributes: Service Area, Located in, Specialization */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="flex items-center gap-1.5 font-bold text-slate-500 shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Located in:</span>
                          </span>
                          <span className="font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-right">
                            {tech.locatedIn || tech.location || 'Indore'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <span className="flex items-center gap-1.5 font-bold text-slate-500 shrink-0">
                            <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Service Area:</span>
                          </span>
                          <span className="font-semibold text-slate-800 text-right max-w-[210px] truncate" title={tech.serviceArea || tech.operatingArea}>
                            {tech.serviceArea || tech.operatingArea || 'All over Indore'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <span className="flex items-center gap-1.5 font-bold text-slate-500 shrink-0">
                            <Wrench className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Specialization:</span>
                          </span>
                          <span className="font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-right max-w-[220px]">
                            {tech.specialization || tech.specialty || 'General Maintenance'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-50">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone:
                          </span>
                          <a href={`tel:${tech.phone}`} className="font-mono font-bold text-slate-900 hover:text-blue-600">
                            {tech.phone}
                          </a>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Shield className="w-3.5 h-3.5 text-slate-400" /> Vehicle:
                          </span>
                          <span className="font-mono font-medium text-slate-800">{tech.vehicleNumber}</span>
                        </div>
                      </div>

                      {/* Supabase Real-Time Tracking Stat Badges */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                        <div className="bg-amber-50/70 border border-amber-100 p-2 rounded-xl">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block">Daily Visits</span>
                          <span className="text-base font-black text-amber-900 font-mono">{tech.dailyVisitCount}</span>
                          <span className="text-[9px] text-amber-700 block">Today's Visits</span>
                        </div>

                        <div className="bg-blue-50/70 border border-blue-100 p-2 rounded-xl">
                          <span className="text-[10px] font-bold text-blue-800 uppercase block">Completed</span>
                          <span className="text-base font-black text-blue-900 font-mono">{tech.completedJobs}</span>
                          <span className="text-[9px] text-blue-700 block">Closed Jobs</span>
                        </div>

                        <div className="bg-emerald-50/70 border border-emerald-100 p-2 rounded-xl">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Cash in Hand</span>
                          <span className="text-base font-black text-emerald-700 font-mono">₹{tech.cashInHand}</span>
                          <span className="text-[9px] text-emerald-700 block">
                            {tech.cashInHand > 0 ? 'To Deposit' : 'Clear'}
                          </span>
                        </div>
                      </div>

                      {/* Cash in Hand Reconcile Quick Action */}
                      {tech.cashInHand > 0 && (
                        <div className="mt-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs">
                          <span className="text-[11px] font-bold text-emerald-900">
                            ₹{tech.cashInHand} Cash Collected
                          </span>
                          <button
                            onClick={() => reconcileTechnicianCash(tech.name, tech.cashInHand)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-2xs"
                          >
                            Reconcile Cash
                          </button>
                        </div>
                      )}

                      {/* Current Active Job Snippet */}
                      {tech.activeJob ? (
                        <div className="mt-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Activity className="w-3 h-3 text-blue-600" /> Current Active Job:
                            </span>
                            <span className="font-mono text-blue-600 font-bold">#{tech.activeJob.id}</span>
                          </div>
                          <p className="text-slate-700 font-semibold truncate">{tech.activeJob.customerName} - {tech.activeJob.locality}</p>
                          <p className="text-[11px] text-slate-500 truncate">{tech.activeJob.serviceName} ({tech.activeJob.timeSlot})</p>
                        </div>
                      ) : (
                        <div className="mt-3 bg-slate-50 border border-dashed border-slate-200 p-2.5 rounded-xl text-center text-slate-400 text-xs">
                          No active job in progress • Available for instant dispatch
                        </div>
                      )}
                    </div>

                    {/* Direct Assignment Dropdown Linked to Bookings Table */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                        <span>Assign Booking to {tech.name.split(' ')[0]}:</span>
                        <span className="text-[10px] text-slate-400 font-normal">Supabase Link</span>
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            assignTechnicianToBooking(e.target.value, tech.name);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 cursor-pointer transition-all"
                      >
                        <option value="" disabled>+ Select Booking from Table to Assign...</option>
                        {bookings
                          .filter(b => b.status !== 'Completed' && b.status !== 'Cancelled')
                          .map(b => (
                            <option key={b.id} value={b.id}>
                              #{b.id} - {b.customerName} ({b.locality || 'Indore'}) - {b.serviceName} [{b.assignedTechnician || 'Unassigned'}]
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 4: AI DIAGNOSTIC ENGINE */}
        {/* --------------------------------------------------------- */}
        {activeTab === 'diagnostics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-amber-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-heading">Indore Plumbing Diagnostic</h3>
                  <p className="text-xs text-slate-500">AI rules tuned for MP water supply & pipe fittings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Locality / Zone
                  </label>
                  <select
                    value={diagLocality}
                    onChange={(e) => setDiagLocality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    {INDORE_LOCALITIES.filter(l => l !== 'All Localities').map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Reported Symptoms / Customer Description
                  </label>
                  <textarea
                    rows={4}
                    value={diagInput}
                    onChange={(e) => setDiagInput(e.target.value)}
                    placeholder="e.g. Toilet tank won't stop running water, low pressure in bathroom but good in kitchen, water dripping behind wall tiles..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="text-[11px] text-slate-500">
                  <span className="font-medium">Quick sample presets:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setDiagInput('Concealed pipe leaking behind master bathroom wall tiles')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200"
                    >
                      Wall Seepage
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiagInput('Kitchen sink blocked with grease and water draining very slowly')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200"
                    >
                      Sink Clog
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiagInput('Flush tank siphon leaking continuously into commode')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200"
                    >
                      Flush Cistern
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiagInput('Water motor running but not pumping water to roof overhead tank')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200"
                    >
                      Motor Pump
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => runAIDiagnostic()}
                  disabled={isDiagnosing || !diagInput.trim()}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{isDiagnosing ? 'Analyzing Faults...' : 'Run Diagnostic & Pricing'}</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Output Results */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-soft-sm">
              {diagResult ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-bold">
                        AI DIAGNOSTIC REPORT
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1.5 font-heading">{diagResult.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{diagResult.probableCause}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500">Estimated Total Quote</div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        ₹{diagResult.totalEstimate}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Labor ₹{diagResult.laborEstimate} + Parts ₹{diagResult.partsEstimate}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-blue-700" />
                        <span>Recommended Spare Parts</span>
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                        {diagResult.partsNeeded.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Technician Toolkit</span>
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                        {diagResult.toolsRequired.map((t, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-950">Indore Ground Advisory:</span>
                      <span>{diagResult.recommendation}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(`[AI Diagnostic Report: ${diagResult.title}]\nProbable Cause: ${diagResult.probableCause}\nEst. Cost: ₹${diagResult.totalEstimate} (Labor: ₹${diagResult.laborEstimate}, Parts: ₹${diagResult.partsEstimate})\nParts: ${diagResult.partsNeeded.join(', ')}\nAdvisory: ${diagResult.recommendation}`)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>{copiedNotice ? 'Copied Report!' : 'Copy Diagnostic Report'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Bot className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Ready to Analyze Plumbing Diagnostics</p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Enter customer symptom notes on the left or select a preset to generate instant root causes, recommended toolset, and pricing estimates.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>


      {/* ------------------------------------------------------------- */}
      {/* MODAL: REGISTER NEW FIELD TECHNICIAN */}
      {/* ------------------------------------------------------------- */}
      {isAddTechModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-900 text-white rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-heading">Register Field Technician</h3>
                  <p className="text-[11px] text-slate-500">Add verified field professional to PlumberIndore fleet</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTechModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterTechnician} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Technician Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mukesh Chouhan"
                  value={newTechForm.name}
                  onChange={(e) => setNewTechForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile Phone (Calling & WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98260 12345"
                  value={newTechForm.phone}
                  onChange={(e) => setNewTechForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Located in (Residential Area) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vijay Nagar"
                  value={newTechForm.locatedIn}
                  onChange={(e) => setNewTechForm(prev => ({ ...prev, locatedIn: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Service Area (Coverage Territory) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. All over Indore"
                  value={newTechForm.serviceArea}
                  onChange={(e) => setNewTechForm(prev => ({ ...prev, serviceArea: e.target.value, operatingArea: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Specialization (Skills & Trades) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrician, POP and False Ceiling"
                  value={newTechForm.specialization}
                  onChange={(e) => setNewTechForm(prev => ({ ...prev, specialization: e.target.value, specialty: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Vehicle Registration / Type</label>
                <input
                  type="text"
                  placeholder="e.g. Service Bike (MP 09 XY 5678)"
                  value={newTechForm.vehicleNumber}
                  onChange={(e) => setNewTechForm(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTechModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Confirm & Save Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: MANUAL LEAD ENTRY MODAL (Supports linking to chat/inquiry) */}
      {/* ------------------------------------------------------------- */}
      {isManualLeadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-900 text-white rounded-lg">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-heading">
                    {leadForm.linkedInquiryId ? `Convert Inquiry #${leadForm.linkedInquiryId} to Booking` : 
                     leadForm.linkedChatId ? `Convert Chat #${leadForm.linkedChatId} to Booking` : 
                     'Direct Lead & Booking Entry'}
                  </h3>
                  {(leadForm.linkedInquiryId || leadForm.linkedChatId) && (
                    <p className="text-[11px] text-slate-500">
                      Linked to {leadForm.linkedInquiryId ? `Inquiry #${leadForm.linkedInquiryId}` : `Chat #${leadForm.linkedChatId}`}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsManualLeadOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualLead} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={leadForm.customerName}
                    onChange={(e) => setLeadForm({ ...leadForm, customerName: e.target.value })}
                    placeholder="e.g. Rohit Rathore"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={leadForm.customerPhone}
                    onChange={(e) => setLeadForm({ ...leadForm, customerPhone: e.target.value })}
                    placeholder="10-digit number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Indore Locality *</label>
                  <select
                    value={leadForm.locality}
                    onChange={(e) => setLeadForm({ ...leadForm, locality: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    {INDORE_LOCALITIES.filter(l => l !== 'All Localities').map(loc => (
                      <option key={loc} value={loc} className="bg-white text-slate-900">{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Priority Level</label>
                  <select
                    value={leadForm.priority}
                    onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="Urgent" className="bg-white text-rose-600 font-semibold">Urgent (Immediate Dispatch)</option>
                    <option value="High" className="bg-white text-amber-600 font-semibold">High</option>
                    <option value="Standard" className="bg-white text-slate-700">Standard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Doorstep Street Address</label>
                <input
                  type="text"
                  value={leadForm.address}
                  onChange={(e) => setLeadForm({ ...leadForm, address: e.target.value })}
                  placeholder="Flat/House, Street, Landmark"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Service Required</label>
                  <input
                    type="text"
                    value={leadForm.serviceName}
                    onChange={(e) => setLeadForm({ ...leadForm, serviceName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Quoted Price (₹)</label>
                  <input
                    type="number"
                    value={leadForm.price}
                    onChange={(e) => setLeadForm({ ...leadForm, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={leadForm.scheduledDate}
                    onChange={(e) => setLeadForm({ ...leadForm, scheduledDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Time Window</label>
                  <select
                    value={leadForm.timeSlot}
                    onChange={(e) => setLeadForm({ ...leadForm, timeSlot: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Initial Fault Notes</label>
                <textarea
                  rows={2}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Additional notes for assigned technician..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualLeadOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all active:scale-95"
                >
                  {leadForm.linkedInquiryId || leadForm.linkedChatId ? 'Confirm & Create Linked Booking' : 'Save & Log Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: WHATSAPP DISPATCH MESSAGE GENERATOR */}
      {/* ------------------------------------------------------------- */}
      {whatsappModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base font-heading">WhatsApp Dispatch Generator</h3>
              </div>
              <button
                onClick={() => setWhatsappModalData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => openWhatsAppModal(whatsappModalData.booking, 'customer')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    whatsappModalData.target === 'customer'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  To Customer ({whatsappModalData.booking.customerName})
                </button>
                <button
                  onClick={() => openWhatsAppModal(whatsappModalData.booking, 'technician')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    whatsappModalData.target === 'technician'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  To Technician Work Order
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Message Preview (Editable):
                </label>
                <textarea
                  rows={9}
                  value={whatsappModalData.message}
                  onChange={(e) => setWhatsappModalData({ ...whatsappModalData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => copyToClipboard(whatsappModalData.message)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copiedNotice ? 'Copied!' : 'Copy Message'}</span>
                </button>

                <a
                  href={`https://wa.me/91${whatsappModalData.booking.customerPhone}?text=${encodeURIComponent(whatsappModalData.message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Direct</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: INTERACTIVE TAX INVOICE & BILL GENERATOR */}
      {/* ------------------------------------------------------------- */}
      {invoiceModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Navigation & Action Top Bar (Hidden on Print) */}
            <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0 no-print">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-heading">
                    Tax Invoice & Bill Generator
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Booking Ref #{invoiceModalBooking.id || invoiceModalBooking.booking_number} • Live Recalculation & UPI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print / Save PDF</span>
                </button>

                <button
                  onClick={handleDownloadInvoiceHtml}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Download Standalone HTML Bill"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download HTML</span>
                </button>

                <button
                  onClick={() => setInvoiceModalBooking(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6 text-xs">
              
              {/* Dynamic Spare Parts & Charges Editor (Hidden on Print) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 no-print">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Add Extra Charges or Replacement Spare Parts</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Recalculates subtotal & dynamic UPI QR code</span>
                </div>

                {/* Quick Add Presets Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Quick Add Common Indore Parts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {INDORE_COMMON_PARTS.map((part) => (
                      <button
                        key={part.name}
                        onClick={() => addInvoiceItem(part.name, 1, part.rate, `${part.category} Spare Part`)}
                        className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-amber-600" />
                        <span>{part.name} (₹{part.rate})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Item Entry Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-slate-200">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Part Name / Extra Charge Description (e.g. Angle Valve)"
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={newPartQty}
                      onChange={(e) => setNewPartQty(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 text-center font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Rate"
                        value={newPartRate}
                        onChange={(e) => setNewPartRate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-6 pr-2 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      onClick={() => addInvoiceItem()}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Status & Discount Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                    <select
                      value={invoicePaymentStatus}
                      onChange={(e) => setInvoicePaymentStatus(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none"
                    >
                      <option value="Paid">Paid (Cash / UPI Received)</option>
                      <option value="Pending (Pay on Completion)">Pending (Pay on Completion)</option>
                      <option value="Partially Paid">Partially Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                    <select
                      value={invoicePaymentMethod}
                      onChange={(e) => setInvoicePaymentMethod(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none"
                    >
                      <option value="UPI / Doorstep Verified">UPI / QR Code Scan</option>
                      <option value="Cash on Doorstep">Cash on Doorstep</option>
                      <option value="Online NetBanking / Card">Online NetBanking / Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Discount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={invoiceDiscount}
                        onChange={(e) => setInvoiceDiscount(Number(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-6 pr-2 py-1.5 text-xs text-slate-900 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------- */}
              {/* THE OFFICIAL TAX INVOICE TEMPLATE (PRINTABLE REGION) */}
              {/* ----------------------------------------------------------- */}
              <div 
                id="printable-tax-invoice" 
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm"
              >
                {/* Official Invoice Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <img src="/logo.png" alt="PlumberIndore Logo" className="w-10 h-10 object-contain" />
                      <div>
                        <div className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                          Plumber<span className="text-amber-500">Indore</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold tracking-wide">
                          Indore's #1 Doorstep Home Services
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 pt-1">
                      Certified Operations • Helpline: +91 91749 34135 • www.plumberindore.in
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      invoicePaymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {invoicePaymentStatus === 'Paid' ? 'PAID TAX INVOICE' : 'TAX INVOICE - PAYMENT DUE'}
                    </span>
                    <div className="text-base font-black font-mono text-slate-900 mt-2">
                      #{invoiceNumber}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Date: <strong className="text-slate-800">{invoiceDate}</strong>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Booking Ref: <span className="font-mono font-bold text-slate-900">#{invoiceModalBooking.id || invoiceModalBooking.booking_number}</span>
                    </div>
                  </div>
                </div>

                {/* Customer & Service Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Billed To (Customer Details)
                    </span>
                    <div className="font-bold text-slate-900 text-sm">
                      {invoiceModalBooking.customerName || invoiceModalBooking.customer_name || 'Customer'}
                    </div>
                    <div className="text-slate-600 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{invoiceModalBooking.customerPhone || invoiceModalBooking.phone || invoiceModalBooking.mobile_number || 'Not provided'}</span>
                    </div>
                    <div className="text-slate-600 flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        {invoiceModalBooking.address || invoiceModalBooking.service_address || 'Indore'}, <strong>{invoiceModalBooking.locality || invoiceModalBooking.area || 'Indore'}</strong> {invoiceModalBooking.pincode ? `(${invoiceModalBooking.pincode})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Service & Dispatch Details
                    </span>
                    <div className="font-bold text-slate-900 text-sm">
                      {invoiceModalBooking.serviceName || invoiceModalBooking.service_name || 'Home Repair'}
                    </div>
                    <div className="text-slate-600">
                      Package: <span className="font-semibold text-slate-800">{invoiceModalBooking.packageTitle || invoiceModalBooking.package_title || 'Standard Package'}</span>
                    </div>
                    <div className="text-slate-600">
                      Slot: <span className="text-amber-700 font-semibold">{invoiceModalBooking.scheduledDate || 'Today'} ({invoiceModalBooking.timeSlot || 'Standard Slot'})</span>
                    </div>
                    <div className="text-slate-600">
                      Technician: <strong className="text-slate-900">{invoiceModalBooking.assignedTechnician || invoiceModalBooking.technician || 'Doorstep Certified Expert'}</strong>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4 w-12">#</th>
                        <th className="py-2.5 px-4">Description / Spare Part</th>
                        <th className="py-2.5 px-3 text-center w-20">Qty</th>
                        <th className="py-2.5 px-4 text-right w-24">Rate (₹)</th>
                        <th className="py-2.5 px-4 text-right w-28">Amount (₹)</th>
                        <th className="py-2.5 px-3 text-center w-12 no-print">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoiceItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            {item.description && (
                              <span className="text-[11px] text-slate-500 block">{item.description}</span>
                            )}
                            {item.isBase && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-semibold">
                                Base Booking Service
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            ₹{item.rate}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            ₹{item.quantity * item.rate}
                          </td>
                          <td className="py-3 px-3 text-center no-print">
                            {!item.isBase ? (
                              <button
                                onClick={() => removeInvoiceItem(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                title="Remove spare part"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-300 font-mono">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Grand Total Breakdown */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                  <div className="space-y-1 text-slate-500 max-w-sm">
                    <p className="font-semibold text-slate-700">Terms & Payment Info:</p>
                    <p className="text-[11px]">
                      Mode: <strong className="text-slate-900">{invoicePaymentMethod}</strong> • Status: <strong className="text-emerald-700">{invoicePaymentStatus}</strong>
                    </p>
                    <p className="text-[11px]">
                      Doorstep verified service completed by certified PlumberIndore technician.
                    </p>
                  </div>

                  <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Service Subtotal:</span>
                      <span className="font-mono font-semibold text-slate-900">₹{invoiceSubtotal}</span>
                    </div>
                    {invoiceDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount Applied:</span>
                        <span className="font-mono font-semibold">-₹{invoiceDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>GST / Taxes:</span>
                      <span className="font-mono">Included</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-emerald-700 font-mono text-lg">₹{invoiceGrandTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Instant UPI QR Code & Scan-to-Pay Box */}
                <div className="bg-gradient-to-r from-emerald-50/60 to-slate-50 p-4 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-white p-1.5 rounded-xl border border-emerald-300 shadow-sm shrink-0 flex items-center justify-center">
                      <img 
                        src={upiQrImageUrl} 
                        alt="Dynamic UPI QR Code" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[9px] uppercase tracking-wider">
                        Quick Scan & Pay via UPI
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">UPI ID:</span>
                        <span className="font-mono font-bold text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {upiId}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(upiId);
                            setCopiedUpi(true);
                            setTimeout(() => setCopiedUpi(false), 2000);
                          }}
                          className="text-[10px] text-slate-500 hover:text-slate-800 underline no-print"
                        >
                          {copiedUpi ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Payee: <strong>{upiPayee}</strong> (PlumberIndore Ops)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Accepts Google Pay, PhonePe, Paytm, BHIM, Cred, and Mobile Banking
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right shrink-0">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Payable Balance</div>
                    <div className="text-2xl font-black text-emerald-700 font-mono">
                      ₹{invoiceGrandTotal}
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 mt-0.5">
                      {invoicePaymentStatus === 'Paid' ? '✓ Paid & Settled' : 'Payment on Service Delivery'}
                    </div>
                  </div>
                </div>

                {/* Guarantee & Certified Service Footer */}
                <div className="pt-4 border-t border-slate-200 text-center space-y-1 text-slate-500 text-[11px]">
                  <p className="font-semibold text-slate-700 flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>30-Day Post-Service Warranty Guaranteed on All Completed Doorstep Works</span>
                  </p>
                  <p>
                    For queries or follow-up service, contact PlumberIndore 24/7 Helpline: <strong>+91 91749 34135</strong> • support@plumberindore.in
                  </p>
                  <p className="text-[10px] text-slate-400">
                    This is a computer-generated tax invoice issued by PlumberIndore Operations Console.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Modal Action Footer (Hidden on Print) */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 shrink-0 no-print">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendInvoiceWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Send itemized invoice details directly to customer via WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>

                <button
                  onClick={handleDownloadInvoiceHtml}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download HTML Bill</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Bill</span>
                </button>

                <button
                  onClick={() => setInvoiceModalBooking(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: BOOKING DETAIL MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base font-heading">Booking #{selectedBookingDetail.id || selectedBookingDetail.booking_number}</h3>
              </div>
              <button
                onClick={() => setSelectedBookingDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Customer Name:</span>
                  <span className="font-bold text-slate-900">
                    {selectedBookingDetail.customerName || selectedBookingDetail.customer_name || 'Customer'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {selectedBookingDetail.customerPhone || selectedBookingDetail.phone || selectedBookingDetail.mobile_number || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Locality:</span>
                  <span className="text-slate-800 font-semibold">
                    {selectedBookingDetail.locality || selectedBookingDetail.area || 'Indore'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Full Address:</span>
                  <span className="text-right text-slate-700 max-w-[240px]">
                    {selectedBookingDetail.address || selectedBookingDetail.service_address || 'Indore'}
                    {selectedBookingDetail.pincode ? ` (${selectedBookingDetail.pincode})` : ''}
                  </span>
                </div>
                {selectedBookingDetail.linkedInquiryId && (
                  <div className="flex justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Origin Inquiry:</span>
                    <button
                      onClick={() => {
                        setSelectedBookingDetail(null);
                        setActiveTab('inquiries');
                        showNotice(`Viewing Source Inquiry #${selectedBookingDetail.linkedInquiryId}`);
                      }}
                      className="font-bold text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <span>Inquiry #{selectedBookingDetail.linkedInquiryId}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedBookingDetail.linkedChatId && (
                  <div className="flex justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Origin Chat Session:</span>
                    <button
                      onClick={() => {
                        setSelectedBookingDetail(null);
                        setActiveTab('chats');
                        setSelectedChatId(selectedBookingDetail.linkedChatId);
                        showNotice(`Viewing Source Chat Session #${selectedBookingDetail.linkedChatId}`);
                      }}
                      className="font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <span>Chat #{selectedBookingDetail.linkedChatId}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Service Booked:</span>
                  <span className="font-bold text-slate-900">
                    {selectedBookingDetail.serviceName || selectedBookingDetail.service_name || selectedBookingDetail.service || 'Home Repair'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Package:</span>
                  <span className="text-slate-700">
                    {selectedBookingDetail.packageTitle || selectedBookingDetail.package_title || selectedBookingDetail.package || 'Standard Package'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Scheduled Date & Slot:</span>
                  <span className="text-amber-700 font-bold">
                    {selectedBookingDetail.scheduledDate || selectedBookingDetail.scheduled_date || (selectedBookingDetail.time ? selectedBookingDetail.time.split(',')[0] : 'Today')}, {selectedBookingDetail.timeSlot || selectedBookingDetail.time_slot || (selectedBookingDetail.time ? selectedBookingDetail.time.split(',')[1] : 'Standard Slot')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Total Price:</span>
                  <span className="font-mono text-slate-900 font-bold text-sm">
                    ₹{selectedBookingDetail.price ?? selectedBookingDetail.amount ?? selectedBookingDetail.total_amount ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Payment Status:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedBookingDetail.paymentStatus || selectedBookingDetail.payment_status || 'Pending (Pay on Completion)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Assigned Technician:</span>
                  <span className="text-slate-800 font-medium">
                    {selectedBookingDetail.assignedTechnician || selectedBookingDetail.technician || 'Pending Allocation'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Problem Notes:</span>
                  <span className="text-right text-slate-700 max-w-[240px]">
                    {selectedBookingDetail.notes || selectedBookingDetail.description || 'None'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const b = selectedBookingDetail;
                      setSelectedBookingDetail(null);
                      openInvoiceModal(b);
                    }}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Generate Tax Invoice for this booking"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Tax Invoice</span>
                  </button>

                  <button
                    onClick={() => {
                      const b = selectedBookingDetail;
                      setSelectedBookingDetail(null);
                      openOrCreateChatForCustomer(
                        b.customerName || b.customer_name || 'Customer',
                        b.customerPhone || b.phone || b.mobile_number || '',
                        b.locality || b.area || 'Indore',
                        `Namaste ${b.customerName || b.customer_name || 'Customer'} ji! Discussing booking #${b.id || b.booking_number}.`
                      );
                    }}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Open Chat</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedBookingDetail(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
