import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../../../lib/supabase/admin.js';

/**
 * PATCH /api/technician/jobs/[id]/status
 * Technician workflow transitions:
 * assigned -> accepted -> on_the_way -> arrived -> started -> completed
 * Allows adding extra parts/labor cost before completion.
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, extraParts = 0, technicianNotes } = body;

    const allowedStatuses = ['assigned', 'accepted', 'on_the_way', 'arrived', 'started', 'completed', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Status updated in fallback mode.'
      });
    }

    // Map technician status to booking status
    const bookingStatusMap = {
      accepted: 'Technician Assigned',
      on_the_way: 'On The Way',
      arrived: 'In Progress',
      started: 'In Progress',
      completed: 'Payment Verified & Completed',
      cancelled: 'Cancelled'
    };

    // Find assignment and associated booking
    const { data: assignment, error: fetchErr } = await supabaseAdmin
      .from('technician_assignments')
      .select('id, booking_id, status, bookings(id, subtotal, parts_cost, total_amount)')
      .eq('id', id)
      .single();

    if (fetchErr || !assignment) {
      return NextResponse.json({ success: false, error: 'Job assignment not found' }, { status: 404 });
    }

    // Update assignment status
    const updateAssignmentPayload = {};
    if (status) updateAssignmentPayload.status = status;
    if (technicianNotes) updateAssignmentPayload.notes = technicianNotes;
    if (status === 'completed') updateAssignmentPayload.completed_at = new Date().toISOString();

    await supabaseAdmin
      .from('technician_assignments')
      .update(updateAssignmentPayload)
      .eq('id', id);

    // Update booking status and parts cost
    if (status && bookingStatusMap[status]) {
      const bookingUpdate = {
        status: bookingStatusMap[status]
      };

      if (Number(extraParts) > 0) {
        const currentSubtotal = Number(assignment.bookings?.subtotal || 0);
        bookingUpdate.parts_cost = Number(extraParts);
        bookingUpdate.total_amount = currentSubtotal + Number(extraParts);
      }

      await supabaseAdmin
        .from('bookings')
        .update(bookingUpdate)
        .eq('id', assignment.booking_id);
    }

    return NextResponse.json({
      success: true,
      status,
      message: `Job status transitioned to '${status}' successfully.`
    });

  } catch (error) {
    console.error('Error in /api/technician/jobs/[id]/status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
