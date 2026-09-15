import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase/admin.js';

export const dynamic = 'force-dynamic';

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
      return {
        id: bId,
        dbId: b.id,
        customerName: b.customer_name || 'Customer',
        phone: b.customer_phone || b.mobile_number || '',
        area: extractLocality(b.service_address || b.address, b.pincode),
        service: b.service_name || 'Home Repair',
        amount: Number(b.total_amount || b.price || 0),
        status: b.status || 'Technician Assigned',
        technician: b.notes?.includes('Tech:') ? b.notes.split('Tech:')[1]?.trim() : (b.status === 'In Progress' ? 'Ramesh Sharma' : 'Pending Allocation'),
        time: `${b.scheduled_date || b.booking_date || 'Today'}, ${b.time_slot || b.booking_slot || 'Slot'}`,
        source: b.booking_number?.startsWith('IND-') ? 'Website Booking' : 'Portal Lead',
        linkedInquiryId: b.notes?.match(/INQ-[A-Za-z0-9-]+/)?.[0] || null,
        linkedChatId: b.notes?.match(/CHAT-[A-Za-z0-9-]+/)?.[0] || null,
        paymentStatus: b.payment_status || 'Pending',
        paymentMethod: b.payment_method || 'Cash / UPI on Doorstep',
        address: b.service_address || b.address || 'Indore',
        pincode: b.pincode || '452010',
        createdAt: b.created_at
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
      .order('updated_at', { ascending: false });

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

    return NextResponse.json({
      success: true,
      source: 'supabase',
      counts: {
        bookings: bookings.length,
        inquiries: inquiries.length,
        chats: chats.length
      },
      bookings,
      inquiries,
      chats,
      syncedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /api/portal/data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
