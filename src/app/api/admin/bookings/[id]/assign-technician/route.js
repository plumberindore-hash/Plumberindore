import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../../../lib/supabase/admin.js';
import { validateAdminRequest } from '../../../../../../lib/adminAuth.js';
import { isValidUUID } from '../../../../../../lib/security.js';

/**
 * POST /api/admin/bookings/[id]/assign-technician
 * Assigns or reassigns a technician to a booking and updates technician_assignments.
 */
export async function POST(request, { params }) {
  try {
    const auth = validateAdminRequest(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, error: 'Booking ID is required.' }, { status: 400 });
    }

    const body = await request.json();
    const { technicianId, notes } = body || {};

    if (!technicianId) {
      return NextResponse.json({ success: false, error: 'Technician ID is required.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Technician assigned in local fallback mode.'
      });
    }

    // Find booking
    let query = supabaseAdmin.from('bookings').select('*');
    if (id.startsWith('IND-') || id.startsWith('PI-')) {
      query = query.eq('booking_number', id);
    } else if (isValidUUID(id)) {
      query = query.eq('id', id);
    } else {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    const { data: booking, error: fetchErr } = await query.maybeSingle();
    if (fetchErr || !booking) {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    // Upsert assignment record
    const { data: assignment, error: assignErr } = await supabaseAdmin
      .from('technician_assignments')
      .insert({
        booking_id: booking.id,
        technician_id: technicianId,
        status: 'assigned',
        notes: notes || 'Assigned by admin'
      })
      .select(`
        id,
        status,
        technicians (
          id,
          title,
          phone,
          rating,
          vehicle_number,
          eta
        )
      `)
      .maybeSingle();

    if (assignErr) {
      return NextResponse.json({ success: false, error: assignErr.message }, { status: 500 });
    }

    // Update main booking status
    await supabaseAdmin
      .from('bookings')
      .update({
        status: 'Technician Assigned',
        assigned_worker_id: technicianId
      })
      .eq('id', booking.id);

    return NextResponse.json({
      success: true,
      assignment,
      message: 'Technician successfully assigned to booking.'
    });
  } catch (error) {
    console.error('Error in /api/admin/bookings/[id]/assign-technician:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
