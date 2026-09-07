import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '../../../../lib/security.js';
import { sendNotificationEmail, sendEmail, ADMIN_NOTIFICATION_RECIPIENTS, ADMIN_NOTIFICATION_EMAIL } from '../../../../utils/brevo.js';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`pay_notify_${ip}`, 15, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many payment notification requests. Please wait a minute.' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const { 
      status = 'success', // 'success' | 'failed' | 'pending'
      booking,
      paymentMethod = 'UPI / Online',
      paymentRef,
      amount
    } = body || {};

    if (!booking || !booking.id) {
      return NextResponse.json(
        { success: false, error: 'Booking details required.' },
        { status: 400 }
      );
    }

    const paidAmount = amount || booking.total_amount || booking.price || 0;
    const refCode = paymentRef || `TXN-${Date.now()}`;
    const bookingId = booking.booking_number || booking.id;
    const customerEmail = booking.customer_email || booking.customerEmail;
    const customerName = booking.customer_name || booking.customerName || 'Valued Customer';

    // Dispatch payment alert via Brevo
    try {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #059669; margin-top: 0;">💳 Payment Received: ₹${paidAmount}</h3>
          <p>Payment recorded for Booking <strong>#${bookingId}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 14px;">
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Status:</td><td style="padding: 8px; font-weight: bold; color: #059669;">${status.toUpperCase()}</td></tr>
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Amount:</td><td style="padding: 8px; font-weight: bold;">₹${paidAmount}</td></tr>
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Payment Method:</td><td style="padding: 8px;">${paymentMethod}</td></tr>
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Transaction Ref:</td><td style="padding: 8px;">${refCode}</td></tr>
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Customer:</td><td style="padding: 8px;">${customerName}</td></tr>
          </table>
        </div>
      `;

      await sendNotificationEmail({
        subject: `[Payment ${status.toUpperCase()}] ₹${paidAmount} - Booking #${bookingId}`,
        html: emailHtml,
        emailType: 'payment_notification'
      });

      if (customerEmail && !ADMIN_NOTIFICATION_RECIPIENTS.includes(customerEmail.toLowerCase())) {
        await sendEmail({
          to: customerEmail,
          subject: `[Payment Receipt] ₹${paidAmount} for Booking #${bookingId}`,
          html: emailHtml,
          replyTo: ADMIN_NOTIFICATION_EMAIL,
          emailType: 'payment_receipt'
        });
      }
    } catch (mailErr) {
      console.warn('[POST /api/payment/notify] Brevo payment notice:', mailErr);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Payment notification (${status}) processed successfully.`,
        data: { status, refCode, amount: paidAmount }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/payment/notify route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
