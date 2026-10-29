import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase/admin.js';
import { validateAdminRequest } from '../../../../lib/adminAuth.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/invoices
 * Returns all generated tax invoices with itemized line items and booking references.
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
        invoices: []
      });
    }

    const { data: invoices = [], error } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        bookings (
          booking_number,
          service_name
        ),
        invoice_items (
          description,
          quantity,
          unit_price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      invoices: invoices.map(i => ({
        id: i.id,
        invoiceNumber: i.invoice_number,
        bookingNumber: i.bookings?.booking_number || 'N/A',
        serviceName: i.bookings?.service_name || 'Home Service',
        customerName: i.customer_name,
        customerEmail: i.customer_email || '',
        customerPhone: i.customer_phone || '',
        billingAddress: i.billing_address || i.customer_address || 'Indore, MP',
        laborCost: Number(i.labor_cost || i.subtotal || i.total_amount || 0),
        partsCost: Number(i.parts_cost || 0),
        taxAmount: Number(i.tax_amount || 0),
        totalPaid: Number(i.total_paid || i.total_amount || 0),
        paymentMethod: i.payment_method || 'UPI / Cash',
        paymentRef: i.payment_ref || null,
        issuedAt: i.issued_at || i.created_at,
        sentAt: i.sent_at || null,
        items: i.invoice_items || []
      }))
    });
  } catch (error) {
    console.error('Error in /api/admin/invoices:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
