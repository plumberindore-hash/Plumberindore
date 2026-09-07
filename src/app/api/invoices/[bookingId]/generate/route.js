import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../../lib/supabase/admin.js';
import { UPI_ID, UPI_PAYEE_NAME, UPI_QR_DATA_URI } from '../../../../../lib/qrCode.js';
import { isValidUUID, checkRateLimit, getClientIp } from '../../../../../lib/security.js';
import { sendEmail, sendNotificationEmail, ADMIN_NOTIFICATION_EMAIL } from '../../../../../utils/brevo.js';

/**
 * POST /api/invoices/[bookingId]/generate
 * Generates an official tax invoice in Supabase.
 */
export async function POST(request, { params }) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`invoice_gen_${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many invoice generation requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const { bookingId } = params || {};
    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Booking ID is required.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Database connection is not available.'
      }, { status: 503 });
    }

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        id,
        booking_number,
        customer_name,
        customer_email,
        customer_phone,
        service_address,
        service_name,
        package_title,
        subtotal,
        parts_cost,
        total_amount,
        payment_method,
        payment_ref,
        booking_items (
          service_name,
          package_title,
          unit_price,
          quantity,
          total_price
        )
      `);

    if (bookingId.startsWith('IND-') || bookingId.startsWith('PI-')) {
      query = query.eq('booking_number', bookingId);
    } else if (isValidUUID(bookingId)) {
      query = query.eq('id', bookingId);
    } else {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    const { data: dbBooking, error: fetchErr } = await query.maybeSingle();
    if (fetchErr || !dbBooking) {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    const targetBooking = dbBooking;
    const invNumber = `INV-2026-${targetBooking.booking_number || targetBooking.id}`;
    const laborCost = Number(targetBooking.subtotal || targetBooking.total_amount || 199);
    const partsCost = Number(targetBooking.parts_cost || 0);
    const taxAmount = 0;
    const totalPaid = laborCost + partsCost;

    // Upsert invoice in DB
    const { data: createdInv, error: invErr } = await supabaseAdmin
      .from('invoices')
      .upsert({
        booking_id: targetBooking.id,
        invoice_number: invNumber,
        customer_name: targetBooking.customer_name,
        customer_email: targetBooking.customer_email,
        customer_phone: targetBooking.customer_phone,
        billing_address: targetBooking.service_address,
        labor_cost: laborCost,
        parts_cost: partsCost,
        tax_amount: taxAmount,
        total_paid: totalPaid,
        payment_method: targetBooking.payment_method || 'UPI',
        payment_ref: targetBooking.payment_ref,
        sent_at: new Date().toISOString()
      }, { onConflict: 'invoice_number' })
      .select()
      .maybeSingle();

    if (invErr) {
      console.error('Invoice upsert error:', invErr.message);
    }

    if (createdInv) {
      // Insert invoice items
      await supabaseAdmin.from('invoice_items').insert([
        {
          invoice_id: createdInv.id,
          description: `${targetBooking.service_name} - ${targetBooking.package_title || 'Standard Service'}`,
          quantity: 1,
          unit_price: laborCost,
          amount: laborCost
        },
        ...(partsCost > 0 ? [{
          invoice_id: createdInv.id,
          description: 'Approved Replacement Spare Parts / Materials',
          quantity: 1,
          unit_price: partsCost,
          amount: partsCost
        }] : [])
      ]);
    }

    // Dispatch Brevo email with invoice summary
    try {
      const invoiceHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 18px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: #fbbf24; margin: 0;">Plumber<span style="color: #ffffff;">Indore</span></h2>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Tax Invoice Generated</p>
          </div>
          <div style="padding: 20px 8px;">
            <h3 style="color: #0f172a; margin-top: 0;">Invoice #${invNumber}</h3>
            <p><strong>Customer:</strong> ${targetBooking.customer_name}</p>
            <p><strong>Service:</strong> ${targetBooking.service_name}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 14px; background: #f8fafc; border-radius: 8px;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Labor:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">₹${laborCost}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Parts:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">₹${partsCost}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">Total Paid:</td><td style="padding: 10px; font-weight: bold; color: #059669; font-size: 16px;">₹${totalPaid}</td></tr>
            </table>
          </div>
        </div>
      `;

      if (targetBooking.customer_email) {
        await sendEmail({
          to: targetBooking.customer_email,
          subject: `[Tax Invoice ${invNumber}] Plumber Indore - ₹${totalPaid}`,
          html: invoiceHtml,
          replyTo: ADMIN_NOTIFICATION_EMAIL,
          emailType: 'customer_invoice'
        });
      }

      await sendNotificationEmail({
        subject: `[Invoice Generated] ${invNumber} - ₹${totalPaid} (${targetBooking.customer_name})`,
        html: invoiceHtml,
        emailType: 'admin_invoice_copy'
      });
    } catch (mailErr) {
      console.warn('[POST /api/invoices/[bookingId]/generate] Brevo email notice:', mailErr);
    }

    return NextResponse.json({
      success: true,
      invoiceNumber: invNumber,
      totalPaid,
      customerName: targetBooking.customer_name
    });

  } catch (error) {
    console.error('Error in /api/invoices/[bookingId]/generate:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
