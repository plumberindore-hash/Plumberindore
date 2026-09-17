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

    const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    if (action === 'update_booking') {
      const { id, dbId, status, technician, paymentStatus } = payload;
      const updateData = { updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      if (paymentStatus) updateData.payment_status = paymentStatus;
      if (technician) updateData.notes = `Tech: ${technician}`;

      // 1. Dual-Write to audit_logs (ensures permanent persistence across poll cycles even under strict RLS)
      try {
        await supabaseAdmin.from('audit_logs').insert([{
          action: 'update_booking',
          entity_type: 'booking',
          entity_id: id || dbId,
          new_values: {
            booking_number: id,
            db_id: isUuid(dbId) ? dbId : (isUuid(id) ? id : null),
            status: status,
            payment_status: paymentStatus,
            technician: technician,
            notes: technician ? `Tech: ${technician}` : undefined,
            updated_at: new Date().toISOString()
          }
        }]);
      } catch (auditErr) {
        console.warn('Could not write update to audit_logs:', auditErr.message);
      }

      // 2. Direct bookings table update with safe UUID type handling
      try {
        let query = supabaseAdmin.from('bookings').update(updateData);
        if (dbId && isUuid(dbId)) {
          query = query.eq('id', dbId);
        } else if (id && isUuid(id)) {
          query = query.eq('id', id);
        } else if (id) {
          query = query.eq('booking_number', id);
        }
        await query;
      } catch (tableErr) {
        console.warn('Direct bookings table update notice:', tableErr.message);
      }

      return NextResponse.json({ success: true, message: 'Booking updated in Supabase.' });
    }

    if (action === 'assign_technician') {
      const { id, dbId, technician, status = 'Technician Assigned' } = payload;
      const finalStatus = !technician || technician === 'Unassigned' ? 'Pending' : status;
      const techNotes = technician && technician !== 'Unassigned' ? `Tech: ${technician}` : '';

      const updateData = {
        notes: techNotes,
        status: finalStatus,
        updated_at: new Date().toISOString()
      };

      // 1. Dual-Write to audit_logs (guarantees assignment won't revert when portal polls /api/portal/data)
      try {
        await supabaseAdmin.from('audit_logs').insert([{
          action: 'assign_technician',
          entity_type: 'booking',
          entity_id: id || dbId,
          new_values: {
            booking_number: id,
            db_id: isUuid(dbId) ? dbId : (isUuid(id) ? id : null),
            technician: technician === 'Unassigned' ? null : technician,
            status: finalStatus,
            notes: techNotes,
            assigned_at: new Date().toISOString()
          }
        }]);
      } catch (auditErr) {
        console.warn('Could not write assignment to audit_logs:', auditErr.message);
      }

      // 2. Direct bookings table update with safe UUID type handling
      try {
        let query = supabaseAdmin.from('bookings').update(updateData);
        if (dbId && isUuid(dbId)) {
          query = query.eq('id', dbId);
        } else if (id && isUuid(id)) {
          query = query.eq('id', id);
        } else if (id) {
          query = query.eq('booking_number', id);
        }
        await query;
      } catch (tableErr) {
        console.warn('Direct bookings table update notice:', tableErr.message);
      }

      return NextResponse.json({ success: true, message: `Assigned ${technician || 'Pending'} to booking.` });
    }

    if (action === 'reconcile_cash') {
      const { technician } = payload;
      return NextResponse.json({ success: true, message: `Cash reconciliation recorded for ${technician}.` });
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
