import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase/admin.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, payload } = body || {};

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, message: 'Updated locally (no db configured)' });
    }

    if (action === 'update_booking') {
      const { id, dbId, status, technician, paymentStatus } = payload;
      const updateData = {};
      if (status) updateData.status = status;
      if (paymentStatus) updateData.payment_status = paymentStatus;
      if (technician) updateData.notes = `Tech: ${technician}`;

      let query = supabaseAdmin.from('bookings').update(updateData);
      if (dbId) {
        query = query.eq('id', dbId);
      } else {
        query = query.or(`booking_number.eq.${id},id.eq.${id}`);
      }
      const { error } = await query;
      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Booking updated in Supabase.' });
    }

    if (action === 'reply_chat') {
      const { sessionId, dbId, replyText } = payload;
      const { data: lead } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('source', 'live_chat')
        .or(`lead_number.eq.${sessionId},id.eq.${dbId || sessionId}`)
        .maybeSingle();

      if (lead) {
        const existingMsgs = lead.raw_payload?.messages || [];
        const newMsg = {
          sender: 'bot',
          text: `[Ops Coordinator]: ${replyText}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        await supabaseAdmin
          .from('leads')
          .update({
            raw_payload: {
              ...(lead.raw_payload || {}),
              messages: [...existingMsgs, newMsg],
              lastUpdated: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);
      }

      return NextResponse.json({ success: true, message: 'Reply sent to chat session.' });
    }

    if (action === 'update_inquiry') {
      const { id, dbId, status, linkedBookingId } = payload;
      // Check if it's a quote_request (dbId or id starts with INQ-Q)
      if (id?.startsWith('INQ-Q')) {
        await supabaseAdmin
          .from('quote_requests')
          .update({ status: status?.toLowerCase() || 'reviewed' })
          .or(`id.eq.${dbId}`);
      } else if (id?.startsWith('INQ-C')) {
        await supabaseAdmin
          .from('contact_messages')
          .update({ status: status?.toLowerCase() || 'reviewed' })
          .or(`id.eq.${dbId}`);
      }
      return NextResponse.json({ success: true, message: 'Inquiry updated.' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('Error in /api/portal/update:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
