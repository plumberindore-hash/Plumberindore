'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, LogOut, Search, Filter, Download, 
  Plus, Send, Eye, Clock, Phone, MapPin, 
  Calendar, Wrench, AlertTriangle, MessageSquare, Bot, Sparkles, 
  TrendingUp, CheckCircle2, ChevronRight, X, ExternalLink, Copy,
  CheckCircle, ArrowUpRight, DollarSign, Activity, SlidersHorizontal,
  User, Briefcase, Zap, Shield, HelpCircle
} from 'lucide-react';

// Hardcoded Master Auth Credentials
const AUTH_EMAIL = 'admin@plumberindore.in';
const AUTH_PASS = 'admin123';
const AUTH_STORAGE_KEY = 'plumberindore_portal_auth_v1';
const DATA_STORAGE_KEY = 'plumberindore_ops_portal_data_v1';

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

// Preloaded Realistic Seed Data for Zero-Backend Operation
const INITIAL_BOOKINGS = [
  {
    id: 'IND-84210',
    customerName: 'Vikramaditya Sharma',
    customerPhone: '9826012345',
    customerEmail: 'vikram.sharma@gmail.com',
    locality: 'Vijay Nagar',
    address: 'Flat 402, BCM Heights, Near Bombay Hospital, Vijay Nagar, Indore',
    pincode: '452010',
    serviceName: 'Concealed Pipe Leakage & Wall Seepage Detection',
    packageTitle: 'Laser Acoustic Leak Detection & Repair',
    price: 1450,
    status: 'In Progress',
    priority: 'Urgent',
    scheduledDate: '2026-09-15',
    timeSlot: '02:00 PM - 04:00 PM',
    paymentStatus: 'Pending',
    paymentMethod: 'UPI on Completion',
    assignedTechnician: 'Rajesh Malviya (Senior Plumber)',
    notes: 'Severe seepage behind bathroom wall. Pressure dropping rapidly.',
    createdAt: '2026-09-15T08:30:00Z'
  },
  {
    id: 'IND-84211',
    customerName: 'Ananya Solanki',
    customerPhone: '9425098765',
    customerEmail: 'ananya.s@outlook.com',
    locality: 'Palasia',
    address: '14/2 Old Palasia, Behind Industry House, AB Road, Indore',
    pincode: '452001',
    serviceName: 'Kitchen Sink & Drain Clog Unclogging',
    packageTitle: 'Motorized Mechanical Snake De-Clogging',
    price: 699,
    status: 'Technician Assigned',
    priority: 'High',
    scheduledDate: '2026-09-15',
    timeSlot: '03:30 PM - 05:30 PM',
    paymentStatus: 'Pending',
    paymentMethod: 'Cash / UPI on Doorstep',
    assignedTechnician: 'Sunil Chouhan',
    notes: 'Kitchen sink overflow and foul smell. Food residue blockage.',
    createdAt: '2026-09-15T09:15:00Z'
  },
  {
    id: 'IND-84212',
    customerName: 'Gaurav Rathore',
    customerPhone: '9752044321',
    customerEmail: 'grathore.indore@gmail.com',
    locality: 'Bhawarkua',
    address: 'Plot 88, Bholaram Ustad Marg, Near Holkar Science College, Bhawarkua, Indore',
    pincode: '452014',
    serviceName: 'Toilet Flush Cistern & Siphon Overhaul',
    packageTitle: 'Dual Flush Internal Valve Overhaul',
    price: 549,
    status: 'Technician Assigned',
    priority: 'Standard',
    scheduledDate: '2026-09-15',
    timeSlot: '04:00 PM - 06:00 PM',
    paymentStatus: 'Paid',
    paymentMethod: 'Prepaid UPI',
    assignedTechnician: 'Dinesh Parmar',
    notes: 'Water continuously running in western commode, wastage of tank water.',
    createdAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'IND-84205',
    customerName: 'Pooja Agarwal',
    customerPhone: '9827011223',
    customerEmail: 'pooja.agarwal77@yahoo.com',
    locality: 'Mahalaxmi Nagar',
    address: 'Row House 22, Sector R, Mahalaxmi Nagar, Indore',
    pincode: '452010',
    serviceName: 'Overhead Sintex Water Tank Cleaning',
    packageTitle: '5-Stage High Pressure Rotary & UV Sterilization',
    price: 1199,
    status: 'Completed',
    priority: 'Standard',
    scheduledDate: '2026-09-14',
    timeSlot: '11:00 AM - 01:00 PM',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI Verified (TXN-98214)',
    assignedTechnician: 'Rajesh Malviya',
    notes: '2000L tank sediment cleaned, float valve replaced.',
    createdAt: '2026-09-14T07:20:00Z'
  },
  {
    id: 'IND-84201',
    customerName: 'Harishankar Tiwari',
    customerPhone: '9981055443',
    customerEmail: 'htiwari.tax@gmail.com',
    locality: 'Annapurna',
    address: '76 Usha Nagar Ext, Near Ranjeet Hanuman Temple, Annapurna, Indore',
    pincode: '452009',
    serviceName: 'Bathroom Tap Mixer & Shower Replacement',
    packageTitle: 'Wall Mixer & Overhead Rain Shower Fitting',
    price: 850,
    status: 'Completed',
    priority: 'Standard',
    scheduledDate: '2026-09-14',
    timeSlot: '02:00 PM - 04:00 PM',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash on Delivery',
    assignedTechnician: 'Sunil Chouhan',
    notes: 'Jaquar quarter turn mixer spindle replaced.',
    createdAt: '2026-09-14T08:45:00Z'
  },
  {
    id: 'IND-84214',
    customerName: 'Dr. Manish Patidar',
    customerPhone: '9174934135',
    customerEmail: 'patidar.clinic@gmail.com',
    locality: 'Sudama Nagar',
    address: 'Sector E, Gopur Square Main Road, Sudama Nagar, Indore',
    pincode: '452009',
    serviceName: 'Water Motor Booster Pump Fitting',
    packageTitle: '0.5 HP Automatic Pressure Booster Installation',
    price: 1850,
    status: 'Pending',
    priority: 'Urgent',
    scheduledDate: '2026-09-15',
    timeSlot: '05:00 PM - 07:00 PM',
    paymentStatus: 'Pending',
    paymentMethod: 'Cash / UPI on Doorstep',
    assignedTechnician: 'Unassigned',
    notes: 'New booster pump delivery arrived. Needs bypass pipe connection.',
    createdAt: '2026-09-15T11:20:00Z'
  }
];

const INITIAL_INQUIRIES = [
  {
    id: 'INQ-101',
    customerName: 'Neeraj Joshi',
    phone: '9826555123',
    locality: 'Vijay Nagar',
    category: 'Full Bathroom Plumbing Renovation',
    message: 'Want to remodel two bathrooms in Scheme 78 with CPVC pipe lines and concealed valves. Need site visit and quote.',
    createdAt: '2026-09-15T10:45:00Z',
    status: 'New'
  },
  {
    id: 'INQ-102',
    customerName: 'Kavita Verma',
    phone: '9425112233',
    locality: 'Palasia',
    category: 'Water Meter & Main Line Repair',
    message: 'Narmada water line inlet valve leaking outside the bungalow boundary wall.',
    createdAt: '2026-09-15T09:30:00Z',
    status: 'Contacted'
  },
  {
    id: 'INQ-103',
    customerName: 'Mohit Dubey',
    phone: '9755889900',
    locality: 'Bhawarkua',
    category: 'Commercial Hostel Tank Overflow',
    message: 'Student hostel 5000L tank float ball cock broken. Water overflowing into street.',
    createdAt: '2026-09-15T08:15:00Z',
    status: 'Converted'
  }
];

const INITIAL_CHATS = [
  {
    id: 'CHAT-301',
    customerName: 'Sunita Jain (Vijay Nagar)',
    phone: '9826199887',
    lastActive: '5 mins ago',
    unread: true,
    messages: [
      { sender: 'customer', text: 'Namaste, mera geyser ka inlet pipe leak ho raha hai.', time: '12:35 PM' },
      { sender: 'bot', text: 'Namaste Sunita ji! Hum 45 minute me Vijay Nagar me technician bhej sakte hain. Kya geyser se paani bohot tez tapak raha hai?', time: '12:36 PM' },
      { sender: 'customer', text: 'Haan, bucket rakhna pad raha hai. Jaldi bhej do.', time: '12:38 PM' }
    ]
  },
  {
    id: 'CHAT-302',
    customerName: 'Amit Saxena (Palasia)',
    phone: '9977233445',
    lastActive: '18 mins ago',
    unread: false,
    messages: [
      { sender: 'customer', text: 'Tap repair ke kya charges hain?', time: '12:10 PM' },
      { sender: 'bot', text: 'Doorstep inspection & minor repair ₹199 se shuru hota hai. Agar parts badalna ho toh technician pehle exact quote batayega.', time: '12:12 PM' },
      { sender: 'customer', text: 'Theek hai, sham 4 baje ka slot book kar dijiye.', time: '12:15 PM' }
    ]
  }
];

// Pre-canned Quick Replies for Chatbot Monitor
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

/**
 * Vector SVG PlumberIndore Brand Shield Mark
 */
function BrandShieldSvg({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="piNavyGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F172A" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="piAmberGrad" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#piNavyGrad)" />
      {/* Precision Wrench */}
      <path d="M28 12C26.3 10.3 23.8 9.9 22.1 11.2L17.1 16.2L23.8 22.9L28.8 17.9C30.1 16.2 29.7 13.7 28 12Z" fill="url(#piAmberGrad)" />
      {/* Water Droplet */}
      <path d="M14 23C14 20.5 17.5 17 17.5 17C17.5 17 21 20.5 21 23C21 24.9 19.4 26.5 17.5 26.5C15.6 26.5 14 24.9 14 23Z" fill="#38BDF8" />
      {/* Wrench Handle */}
      <path d="M17.1 17.9L11.7 23.3C10.9 24.1 10.9 25.4 11.7 26.2L13.8 28.3C14.6 29.1 15.9 29.1 16.7 28.3L22.1 22.9L17.1 17.9Z" fill="#CBD5E1" />
    </svg>
  );
}

export default function OpsPortalClient() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Portal State
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'inquiries' | 'chats' | 'diagnostics'
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [selectedChatId, setSelectedChatId] = useState('CHAT-301');
  const [chatReplyText, setChatReplyText] = useState('');

  // Filters
  const [selectedLocality, setSelectedLocality] = useState('All Localities');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isManualLeadOpen, setIsManualLeadOpen] = useState(false);
  const [whatsappModalData, setWhatsappModalData] = useState(null); // { booking, target: 'customer' | 'technician', message: '' }
  const [diagnosticModalData, setDiagnosticModalData] = useState(null); // { booking, symptomInput, output: null }
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Manual Lead Form State
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
    notes: ''
  });

  // Diagnostic Assistant State
  const [diagInput, setDiagInput] = useState('');
  const [diagLocality, setDiagLocality] = useState('Vijay Nagar');
  const [diagResult, setDiagResult] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // 1. Check LocalStorage Auth on Mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth === 'authenticated') {
        setIsAuthenticated(true);
      }

      // Load cached portal state if present
      const storedData = localStorage.getItem(DATA_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.bookings && Array.isArray(parsed.bookings)) setBookings(parsed.bookings);
        if (parsed.inquiries && Array.isArray(parsed.inquiries)) setInquiries(parsed.inquiries);
        if (parsed.chats && Array.isArray(parsed.chats)) setChats(parsed.chats);
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

  // KPI Calculations
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
      avgArrival: '28 Min',
      csatRating: '4.9 ★'
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
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
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
      'Created At'
    ];

    const rows = filteredBookings.map(b => [
      `"${b.id}"`,
      `"${b.customerName}"`,
      `"${b.customerPhone}"`,
      `"${b.customerEmail || ''}"`,
      `"${b.locality || ''}"`,
      `"${(b.address || '').replace(/"/g, '""')}"`,
      `"${(b.serviceName || '').replace(/"/g, '""')}"`,
      `"${(b.packageTitle || '').replace(/"/g, '""')}"`,
      b.price,
      `"${b.status}"`,
      `"${b.paymentStatus}"`,
      `"${b.paymentMethod || ''}"`,
      `"${b.scheduledDate}"`,
      `"${b.timeSlot}"`,
      `"${b.assignedTechnician || 'Unassigned'}"`,
      `"${b.createdAt}"`
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

  // Manual Lead Creation
  const handleCreateManualLead = (e) => {
    e.preventDefault();
    if (!leadForm.customerName || !leadForm.customerPhone) return;

    const newBooking = {
      id: `IND-${Math.floor(10000 + Math.random() * 90000)}`,
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
      createdAt: new Date().toISOString()
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    persistState(updated);
    setIsManualLeadOpen(false);

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
      notes: ''
    });
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
        `Our technician will arrive equipped with genuine parts within 45 mins. For urgent updates, call 91749 34135.\n\n` +
        `_Doorstep Plumbing Network, Indore_`;
    } else {
      text = `*🚨 PLUMBER INDORE - TECHNICIAN DISPATCH ORDER*\n\n` +
        `*Order:* #${booking.id} (${booking.priority.toUpperCase()} PRIORITY)\n` +
        `*Customer:* ${booking.customerName}\n` +
        `*Contact:* ${booking.customerPhone}\n` +
        `*Locality:* ${booking.locality}\n` +
        `*Address:* ${booking.address}\n` +
        `*Service Required:* ${booking.serviceName}\n` +
        `*Problem Notes:* ${booking.notes || 'Check and repair'}\n` +
        `*Scheduled Time:* ${booking.timeSlot}\n` +
        `*Collect Amount:* ₹${booking.price}\n\n` +
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
    if (!text) return;
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
  };

  // Convert Inquiry to Booking
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
      notes: `Converted from Inquiry #${inquiry.id}: ${inquiry.message}`
    });
    
    // Mark inquiry as converted
    const updatedInquiries = inquiries.map(i => 
      i.id === inquiry.id ? { ...i, status: 'Converted' } : i
    );
    setInquiries(updatedInquiries);
    persistState(null, updatedInquiries);
    setIsManualLeadOpen(true);
  };

  // -------------------------------------------------------------
  // RENDER: Unauthenticated Shield Gate (Crisp White / Light-Slate Theme)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 selection:bg-amber-100 selection:text-slate-900 overflow-y-auto">
        {/* Subtle Brand Ambient Backdrops */}
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
  const activeChat = chats.find(c => c.id === selectedChatId) || chats[0];

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-slate-900 overflow-y-auto pb-16">
      {/* Top Ops Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OfficialBrandLogo size="md" isDarkBg={false} showTagline={true} />
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsManualLeadOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">New Lead / Booking</span>
              <span className="sm:hidden">Add</span>
            </button>

            <button
              onClick={exportBookingsCSV}
              className="bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1.5 shadow-soft-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
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
        
        {/* 4 KPI Metric Cards */}
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
              <span>{kpis.completedJobs} jobs verified completed (+14.2%)</span>
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

        {/* Tab Navigation */}
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
            <span>Live Chatbot Monitor</span>
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

            {/* Bookings Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Booking ID</th>
                      <th className="py-3.5 px-4">Customer & Contact</th>
                      <th className="py-3.5 px-4">Locality & Address</th>
                      <th className="py-3.5 px-4">Service Booked</th>
                      <th className="py-3.5 px-4">Slot & Price</th>
                      <th className="py-3.5 px-4">Dispatch Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          <AlertTriangle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <p className="font-semibold text-slate-700">No matching bookings found</p>
                          <p className="text-xs mt-1 text-slate-500">Try relaxing your locality or status filter.</p>
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
                                <span>#{b.id}</span>
                                {b.priority === 'Urgent' && (
                                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Urgent Lead" />
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 block font-sans font-normal">{b.scheduledDate}</span>
                            </td>

                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                <span>{b.customerName}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <a href={`tel:${b.customerPhone}`} className="hover:text-emerald-700 font-mono transition-colors font-medium">
                                  {b.customerPhone}
                                </a>
                              </div>
                            </td>

                            <td className="py-4 px-4 max-w-xs">
                              <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px] mb-1">
                                📍 {b.locality}
                              </span>
                              <p className="text-slate-600 text-xs line-clamp-1" title={b.address}>
                                {b.address}
                              </p>
                            </td>

                            <td className="py-4 px-4 max-w-xs">
                              <p className="font-semibold text-slate-900 line-clamp-1" title={b.serviceName}>
                                {b.serviceName}
                              </p>
                              <span className="text-[11px] text-slate-500 block">
                                {b.packageTitle}
                              </span>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900 font-mono text-sm">
                                ₹{b.price}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{b.timeSlot}</span>
                              </div>
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
                                {/* WhatsApp Dispatch Trigger */}
                                <button
                                  onClick={() => openWhatsAppModal(b, 'customer')}
                                  title="Dispatch WhatsApp Notification"
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>

                                {/* AI Diagnostic Trigger */}
                                <button
                                  onClick={() => {
                                    setDiagInput(`${b.serviceName}. ${b.notes || ''}`);
                                    setDiagLocality(b.locality);
                                    setActiveTab('diagnostics');
                                    runAIDiagnostic(`${b.serviceName}. ${b.notes || ''}`, b);
                                  }}
                                  title="Analyze with AI Diagnostic"
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">Customer Inquiries & Quote Requests</h2>
                <p className="text-xs text-slate-500">Review inbound leads from contact form & quotation calculators across Indore.</p>
              </div>
            </div>

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
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/91${inq.phone}?text=${encodeURIComponent(`Namaste ${inq.customerName} ji, this is PlumberIndore Operations regarding your plumbing inquiry in ${inq.locality}. How can we assist you today?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => convertInquiryToBooking(inq)}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Convert Lead</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 3: CHATBOT LIVE MONITOR */}
        {/* --------------------------------------------------------- */}
        {activeTab === 'chats' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px] shadow-soft-sm">
            {/* Conversations Sidebar */}
            <div className="border-r border-slate-200 bg-slate-50/60 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Live Conversations
              </h3>
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
                  </button>
                ))}
              </div>
            </div>

            {/* Active Chat Conversation View */}
            <div className="md:col-span-2 flex flex-col justify-between bg-white p-4 sm:p-6">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-heading">{activeChat?.customerName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Phone: <strong className="font-mono text-slate-700">{activeChat?.phone}</strong></span>
                      <span className="text-emerald-700 flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Customer Session
                      </span>
                    </p>
                  </div>

                  <a
                    href={`tel:${activeChat?.phone}`}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-emerald-700 rounded-xl border border-slate-200 transition-colors"
                    title="Call Customer"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                {/* Message Log */}
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

              {/* Quick Reply Canned Responses & Custom Composer */}
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
      {/* MODAL 1: MANUAL LEAD ENTRY MODAL */}
      {/* ------------------------------------------------------------- */}
      {isManualLeadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-900 text-white rounded-lg">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="font-bold text-slate-900 text-base font-heading">Direct Lead & Booking Entry</h3>
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
                  Save & Log Booking
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
                <h3 className="font-bold text-slate-900 text-base font-heading">Booking #{selectedBookingDetail.id}</h3>
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
                  <span className="font-bold text-slate-900">{selectedBookingDetail.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <span className="font-mono text-emerald-700 font-bold">{selectedBookingDetail.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Locality:</span>
                  <span className="text-slate-800 font-semibold">{selectedBookingDetail.locality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Full Address:</span>
                  <span className="text-right text-slate-700 max-w-[240px]">{selectedBookingDetail.address}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Service:</span>
                  <span className="font-bold text-slate-900">{selectedBookingDetail.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Package:</span>
                  <span className="text-slate-700">{selectedBookingDetail.packageTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Scheduled Date & Slot:</span>
                  <span className="text-amber-700 font-bold">{selectedBookingDetail.scheduledDate}, {selectedBookingDetail.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Total Price:</span>
                  <span className="font-mono text-slate-900 font-bold text-sm">₹{selectedBookingDetail.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Assigned Technician:</span>
                  <span className="text-slate-800 font-medium">{selectedBookingDetail.assignedTechnician || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Problem Notes:</span>
                  <span className="text-right text-slate-700 max-w-[240px]">{selectedBookingDetail.notes || 'None'}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
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
