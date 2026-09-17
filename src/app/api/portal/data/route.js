import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase/admin.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // First chunk before comma
  if (address && address.includes(',')) {
    return address.split(',')[0].trim();
  }
  return address || 'Indore';
}

export async function GET(request) {
  try {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        bookings: [],
        inquiries: [],
        chats: [],
        syncedAt: new Date().toISOString()
      });
    }

    // 1. Fetch Bookings
    const { data: dbBookings = [], error: bookingsErr } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (bookingsErr) {
      console.error('Error fetching bookings in portal API:', bookingsErr.message);
    }

    const bookings = (dbBookings || []).map((b) => {
      const bId = b.booking_number || b.id;
      const scheduledDate = b.scheduled_date || b.booking_date || (b.created_at ? b.created_at.split('T')[0] : 'Today');
      const timeSlot = b.time_slot || b.booking_slot || 'Standard Slot';
      const locality = extractLocality(b.service_address || b.address, b.pincode);
      const serviceName = b.service_name || 'Home Repair';
      const packageTitle = b.package_title || 'Standard Package';
      const price = Number(b.total_amount ?? b.price ?? b.subtotal ?? 0);
      const customerPhone = b.customer_phone || b.mobile_number || '';
      const customerName = b.customer_name || 'Customer';
      const customerEmail = b.customer_email || '';
      const address = b.service_address || b.address || 'Indore';
      const assignedTech = b.notes?.includes('Tech:') 
        ? b.notes.split('Tech:')[1]?.trim() 
        : (b.status === 'In Progress' ? 'Ramesh Sharma' : 'Pending Allocation');
      const notes = b.notes || '';
      const priority = notes.toLowerCase().includes('urgent') ? 'Urgent' : 'High';

      return {
        id: bId,
        dbId: b.id,
        booking_number: bId,
        customerName: customerName,
        customer_name: customerName,
        name: customerName,
        customerPhone: customerPhone,
        customer_phone: customerPhone,
        mobile_number: customerPhone,
        phone: customerPhone,
        customerEmail: customerEmail,
        customer_email: customerEmail,
        email: customerEmail,
        locality: locality,
        area: locality,
        address: address,
        service_address: address,
        pincode: b.pincode || '452010',
        serviceName: serviceName,
        service_name: serviceName,
        service: serviceName,
        packageTitle: packageTitle,
        package_title: packageTitle,
        price: price,
        amount: price,
        total_amount: price,
        scheduledDate: scheduledDate,
        scheduled_date: scheduledDate,
        booking_date: scheduledDate,
        timeSlot: timeSlot,
        time_slot: timeSlot,
        booking_slot: timeSlot,
        time: `${scheduledDate}, ${timeSlot}`,
        status: b.status || 'Technician Assigned',
        priority: priority,
        assignedTechnician: assignedTech,
        technician: assignedTech,
        notes: notes,
        paymentStatus: b.payment_status || 'Pending (Pay on Completion)',
        payment_status: b.payment_status || 'Pending (Pay on Completion)',
        paymentMethod: b.payment_method || 'Cash / UPI on Doorstep',
        payment_method: b.payment_method || 'Cash / UPI on Doorstep',
        paymentRef: b.payment_ref || null,
        source: b.booking_number?.startsWith('IND-') ? 'Website Booking' : 'Portal Lead',
        linkedInquiryId: b.notes?.match(/INQ-[A-Za-z0-9-]+/)?.[0] || null,
        linkedChatId: b.notes?.match(/CHAT-[A-Za-z0-9-]+/)?.[0] || null,
        createdAt: b.created_at,
        created_at: b.created_at,
        updatedAt: b.updated_at || b.created_at
      };
    });

    // 2. Fetch Inquiries (Quote Requests + Contact Messages)
    const { data: dbQuotes = [] } = await supabaseAdmin
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: dbContact = [] } = await supabaseAdmin
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    const quoteInquiries = (dbQuotes || []).map((q) => ({
      id: `INQ-Q${q.id.slice(0, 5).toUpperCase()}`,
      dbId: q.id,
      customerName: q.customer_name || 'Cost Calculator Lead',
      phone: q.customer_phone || '',
      service: `${q.category ? q.category.toUpperCase() : 'General'}: ${q.issue}`,
      locality: extractLocality('', q.customer_pincode),
      estimatedAmount: Number(q.estimated_price) || 299,
      status: q.status === 'pending' ? 'Pending Quote' : (q.status === 'converted' ? 'Converted' : 'Reviewed'),
      time: new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      source: 'Instant Cost Calculator',
      notes: q.remarks || '',
      createdAt: q.created_at
    }));

    const contactInquiries = (dbContact || []).map((c) => ({
      id: `INQ-C${c.id.slice(0, 5).toUpperCase()}`,
      dbId: c.id,
      customerName: c.name || 'Website Contact Lead',
      phone: c.phone || '',
      service: `Message: ${c.message ? c.message.slice(0, 45) + (c.message.length > 45 ? '...' : '') : 'Direct Inquiry'}`,
      locality: 'Indore Central',
      estimatedAmount: 199,
      status: c.status === 'new' ? 'New Contact' : (c.status === 'converted' ? 'Converted' : 'Reviewed'),
      time: new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      source: 'Contact Us Form',
      notes: c.message || '',
      createdAt: c.created_at
    }));

    // Merge and sort inquiries newest first
    const inquiries = [...quoteInquiries, ...contactInquiries].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // 3. Fetch Live Chatbot Sessions (Leads where source = 'live_chat')
    const { data: dbChats = [] } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('source', 'live_chat')
      .order('created_at', { ascending: false });

    const chats = (dbChats || []).map((l) => ({
      id: l.lead_number || `CHAT-${l.id.slice(0, 5)}`,
      dbId: l.id,
      customerName: l.name || 'Website Visitor',
      phone: l.phone || '',
      locality: l.service_address || l.raw_payload?.locality || 'Vijay Nagar',
      service: l.service_name || 'Live Chat Inquiry',
      lastMessage: l.issue_description || 'Online session started',
      status: l.status === 'converted' ? 'Converted' : (l.status === 'resolved' ? 'Resolved' : 'Active'),
      time: new Date(l.updated_at || l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: l.updated_at || l.created_at,
      messages: l.raw_payload?.messages || [
        { sender: 'user', text: l.issue_description || '', time: 'Recent' }
      ],
      linkedBookingId: l.raw_payload?.linkedBookingId || null,
      linkedInquiryId: l.raw_payload?.linkedInquiryId || null
    }));

    // 4. Certified Field Fleet & Supabase Tracking
    const DEFAULT_FLEET = [
      {
        id: 'TECH-IND-01',
        name: 'Ramesh Sharma',
        title: 'Master Plumber & Sanitary Expert',
        phone: '+91 98260 11223',
        rating: 4.95,
        repairsCount: 540,
        vehicleNumber: 'Service Bike (MP 09 CZ 1122)',
        photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
        specialty: 'Plumbing & Leakages',
        operatingArea: 'Vijay Nagar, Palasia, Mahalaxmi',
        status: 'On Duty',
        eta: 'Prompt Arrival'
      },
      {
        id: 'TECH-IND-02',
        name: 'Vikas Patidar',
        title: 'Senior Electrician & Panel Specialist',
        phone: '+91 97550 44556',
        rating: 4.92,
        repairsCount: 420,
        vehicleNumber: 'Service Bike (MP 09 AB 3344)',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
        specialty: 'Electrical & MCB Safety',
        operatingArea: 'Bhawarkua, Rajendra Nagar, Annapurna',
        status: 'On Duty',
        eta: 'Prompt Arrival'
      },
      {
        id: 'TECH-IND-03',
        name: 'Sunil Chouhan',
        title: 'Lead HVAC & AC Specialist',
        phone: '+91 94250 77889',
        rating: 4.98,
        repairsCount: 680,
        vehicleNumber: 'Service Van (MP 09 EF 5566)',
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
        specialty: 'AC Foam Jet & Gas Refill',
        operatingArea: 'Vijay Nagar, Nipania, Bypass',
        status: 'On Duty',
        eta: 'Prompt Arrival'
      },
      {
        id: 'TECH-IND-04',
        name: 'Deepak Verma',
        title: 'Drainage & Motor Pump Technician',
        phone: '+91 91749 34135',
        rating: 4.91,
        repairsCount: 310,
        vehicleNumber: 'Service Bike (MP 09 GH 7788)',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        specialty: 'Drain Blockage & Water Motors',
        operatingArea: 'Sudama Nagar, Geeta Bhawan, Annapurna',
        status: 'On Duty',
        eta: 'Prompt Arrival'
      },
      {
        id: 'TECH-IND-05',
        name: 'Rajesh Malviya',
        title: 'Home Appliance & Geyser Pro',
        phone: '+91 98930 22334',
        rating: 4.89,
        repairsCount: 280,
        vehicleNumber: 'Service Bike (MP 09 KL 9900)',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
        specialty: 'Geyser, Fridge & RO Purifier',
        operatingArea: 'Central Indore & All Localities',
        status: 'On Duty',
        eta: 'Prompt Arrival'
      }
    ];

    const todayStr = new Date().toISOString().split('T')[0];

    const technicians = DEFAULT_FLEET.map(tech => {
      const assigned = bookings.filter(b => {
        const assignedName = (b.assignedTechnician || '').toLowerCase();
        const techName = tech.name.toLowerCase();
        return assignedName.includes(techName) || (b.notes && b.notes.toLowerCase().includes(techName));
      });

      const todayVisits = assigned.filter(b => {
        const isToday = b.scheduledDate === todayStr || b.booking_date === todayStr;
        const isActive = b.status === 'Technician Assigned' || b.status === 'In Progress' || b.status === 'On The Way' || b.status === 'Completed';
        return isToday || isActive;
      });

      const completed = assigned.filter(b => b.status === 'Completed' || b.status === 'Payment Verified & Completed');

      const cashInHand = assigned
        .filter(b => {
          const isCash = (b.paymentMethod || '').toLowerCase().includes('cash');
          const isPaid = (b.paymentStatus || '').toLowerCase().includes('paid') || b.status === 'Completed' || b.status === 'Payment Verified & Completed';
          return isCash && isPaid;
        })
        .reduce((sum, b) => sum + (Number(b.price || b.total_amount || 0)), 0);

      const activeJob = assigned.find(b => b.status === 'In Progress' || b.status === 'On The Way' || b.status === 'Technician Assigned') || null;

      return {
        ...tech,
        dailyVisitCount: todayVisits.length,
        completedJobs: completed.length,
        cashInHand: cashInHand,
        activeJobCount: assigned.filter(b => b.status === 'In Progress' || b.status === 'Technician Assigned' || b.status === 'On The Way').length,
        totalAssignedCount: assigned.length,
        currentJob: activeJob ? {
          bookingId: activeJob.id,
          customerName: activeJob.customerName,
          customerPhone: activeJob.customerPhone,
          locality: activeJob.locality,
          service: activeJob.serviceName,
          slot: activeJob.timeSlot,
          status: activeJob.status
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      source: 'supabase',
      counts: {
        bookings: bookings.length,
        inquiries: inquiries.length,
        chats: chats.length,
        technicians: technicians.length
      },
      bookings,
      inquiries,
      chats,
      technicians,
      syncedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error in /api/portal/data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
