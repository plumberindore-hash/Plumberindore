import { NextResponse } from 'next/server';
import { UPI_ID, UPI_PAYEE_NAME, UPI_QR_DATA_URI } from '../../../lib/qrCode.js';
import { getAdminClient } from '../../../lib/supabase/admin.js';
import { checkRateLimit, getClientIp } from '../../../lib/security.js';
import { sendEmail, sendNotificationEmail, ADMIN_NOTIFICATION_RECIPIENTS, ADMIN_NOTIFICATION_EMAIL } from '../../../utils/brevo.js';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`invoice_post_${ip}`, 15, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many invoice requests. Please wait a minute.' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const {
      invoiceNumber,
      customerName,
      customerEmail,
      customerPhone,
      address,
      serviceName,
      packageTitle,
      laborCost = 0,
      partsCost = 0,
      taxCost = 0,
      discountCost = 0,
      totalPaid = 0,
      paymentMethod = 'UPI',
      paymentRef,
      date
    } = body || {};

    if (!invoiceNumber || !customerName || !totalPaid) {
      return NextResponse.json(
        { success: false, error: 'Invoice number, customer name, and total paid amount are required.' },
        { status: 400 }
      );
    }

    const issueDate = date || new Date().toISOString().split('T')[0];

    // 1. Persist in Supabase PostgreSQL
    try {
      const supabaseAdmin = getAdminClient();
      if (supabaseAdmin) {
        // Find booking if exists
        const bookingNum = invoiceNumber.replace('INV-2026-', '').replace('INV-', '');
        const { data: bData } = await supabaseAdmin.from('bookings').select('id').or(`booking_number.eq.${bookingNum},id.eq.${bookingNum}`).maybeSingle();

        const { data: invRecord, error: invErr } = await supabaseAdmin.from('invoices').insert({
          booking_id: bData ? bData.id : null,
          invoice_number: invoiceNumber,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || '+91 91749 34135',
          billing_address: address || 'Indore, MP',
          labor_cost: Number(laborCost || totalPaid),
          parts_cost: Number(partsCost || 0),
          tax_amount: Number(taxCost || 0),
          discount_amount: Number(discountCost || 0),
          total_paid: Number(totalPaid),
          payment_method: paymentMethod || 'Cash / UPI Verified',
          payment_ref: paymentRef || `TXN-${invoiceNumber}`,
          sent_at: new Date().toISOString()
        }).select().single();

        if (invRecord) {
          await supabaseAdmin.from('invoice_items').insert({
            invoice_id: invRecord.id,
            description: `${serviceName} - ${packageTitle || 'Service Package'}`,
            quantity: 1,
            unit_price: Number(totalPaid),
            amount: Number(totalPaid)
          });
        }

        if (bData) {
          await supabaseAdmin.from('bookings').update({
            payment_status: 'Paid',
            status: 'Payment Verified & Completed'
          }).eq('id', bData.id);
        }
      }
    } catch (dbEx) {
      console.warn('Supabase invoice save exception:', dbEx.message);
    }

    // Dispatch invoice email via Brevo
    try {
      const invoiceHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 18px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: #fbbf24; margin: 0;">Plumber<span style="color: #ffffff;">Indore</span></h2>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Official Service Receipt & Tax Invoice</p>
          </div>
          <div style="padding: 20px 8px;">
            <h3 style="color: #0f172a; margin-top: 0;">Tax Invoice: ${invoiceNumber}</h3>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Service:</strong> ${serviceName} (${packageTitle || 'Standard'})</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 14px; background: #f8fafc; border-radius: 8px;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Labor:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">₹${laborCost || totalPaid}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Parts:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">₹${partsCost || 0}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">Total Paid:</td><td style="padding: 10px; font-weight: bold; color: #059669; font-size: 16px;">₹${totalPaid}</td></tr>
            </table>
            <p style="font-size: 12px; color: #64748b; margin-top: 16px;">Payment Method: ${paymentMethod} | Reference: ${paymentRef || invoiceNumber}</p>
          </div>
        </div>
      `;

      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `[Invoice ${invoiceNumber}] Plumber Indore - ₹${totalPaid}`,
          html: invoiceHtml,
          replyTo: ADMIN_NOTIFICATION_EMAIL,
          emailType: 'customer_invoice'
        });
      }

      await sendNotificationEmail({
        subject: `[New Invoice Recorded] ${invoiceNumber} - ₹${totalPaid} (${customerName})`,
        html: invoiceHtml,
        emailType: 'admin_invoice_copy'
      });
    } catch (mailErr) {
      console.warn('[POST /api/invoice] Brevo invoice dispatch notice:', mailErr);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Invoice ${invoiceNumber} created and recorded successfully!`,
        data: { invoiceNumber, totalPaid }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
