import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase/admin.js';
import { validateAdminRequest } from '../../../../lib/adminAuth.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/dashboard
 * Aggregates live operational KPIs:
 * Total bookings, Today's bookings, Pending, Active jobs, Completed, Revenue, Average rating.
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
        stats: {
          totalBookings: 0,
          todayBookings: 0,
          pendingBookings: 0,
          activeJobs: 0,
          completedJobs: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
          paidRevenue: 0,
          pendingRevenue: 0,
          averageRating: 5.0,
          totalReviews: 0,
          activeTechnicians: 0
        }
      });
    }

    // Fetch all bookings
    const { data: bookings = [] } = await supabaseAdmin
      .from('bookings')
      .select('id, total_amount, status, payment_status, scheduled_date, created_at');

    const todayStr = new Date().toISOString().split('T')[0];

    const totalBookings = bookings.length;
    const todayBookings = bookings.filter(b => b.scheduled_date === todayStr || (b.created_at && b.created_at.startsWith(todayStr))).length;
    const completedJobs = bookings.filter(b => b.status === 'Payment Verified & Completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'Technician Assigned' || b.status === 'On The Way (45-Min)' || b.status === 'On The Way').length;
    const activeJobs = bookings.filter(b => b.status === 'In Progress' || b.status === 'On The Way (45-Min)' || b.status === 'On The Way').length;
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;

    const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
    const paidRevenue = bookings
      .filter(b => b.payment_status === 'Paid')
      .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
    const pendingRevenue = totalRevenue - paidRevenue;

    // Fetch reviews
    const { data: reviews = [] } = await supabaseAdmin
      .from('reviews')
      .select('rating');

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2)
      : '5.00';

    // Fetch technicians count
    const { count: activeTechs } = await supabaseAdmin
      .from('technicians')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return NextResponse.json({
      success: true,
      source: 'database',
      stats: {
        totalBookings,
        todayBookings,
        pendingBookings,
        activeJobs,
        completedJobs,
        cancelledBookings,
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        averageRating: Number(avgRating),
        totalReviews,
        activeTechnicians: activeTechs || 0
      }
    });
  } catch (error) {
    console.error('Error in /api/admin/dashboard:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
