import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase/admin.js';
import { validateAdminRequest } from '../../../../lib/adminAuth.js';

/**
 * GET /api/admin/reviews — Lists all reviews with verification status
 * PATCH /api/admin/reviews — Toggles verification/moderation status
 */
export async function GET(request) {
  try {
    const auth = validateAdminRequest(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const supabaseAdmin = getAdminClient();

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        reviews: []
      });
    }

    const { data: reviews = [], error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        booking_id,
        customer_name,
        rating,
        comment,
        is_approved,
        created_at,
        bookings (
          booking_number,
          service_name,
          package_title
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formatted = reviews.map(r => ({
      id: r.id,
      bookingNumber: r.bookings?.booking_number || 'Direct',
      serviceName: r.bookings?.service_name || 'Home Maintenance',
      customerName: r.customer_name,
      rating: r.rating,
      comment: r.comment,
      isVerified: r.is_approved ?? true,
      createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : 'Recent'
    }));

    return NextResponse.json({
      success: true,
      reviews: formatted
    });
  } catch (error) {
    console.error('Error in GET /api/admin/reviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = validateAdminRequest(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { id, isVerified } = body || {};

    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, message: 'Updated in fallback mode.' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('reviews')
      .update({ is_approved: !!isVerified })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      review: updated,
      message: 'Review verification status updated.'
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/reviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
