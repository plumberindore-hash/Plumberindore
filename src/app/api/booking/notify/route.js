import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '../../../../lib/security.js';
import { sendNotificationEmail, sendEmail, ADMIN_NOTIFICATION_RECIPIENTS, ADMIN_NOTIFICATION_EMAIL } from '../../../../utils/brevo.js';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`booking_notify_${ip}`, 15, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many notification requests. Please wait a minute.' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const { 
      action = 'create', // 'create' | 'reschedule' | 'cancel' | 'complete' | 'claim'
      booking,
      newDate,
      newTimeSlot,
      claimReason,
      claimDescription
    } = body || {};

    if (!booking || !booking.id) {
      return NextResponse.json(
        { success: false, error: 'Booking data with valid ID is required.' },
        { status: 400 }
      );
    }

    const bookingId = booking.booking_number || booking.id;
    const customerName = booking.customer_name || booking.customerName || 'Valued Customer';
    const customerEmail = booking.customer_email || booking.customerEmail;
    const customerPhone = booking.customer_phone || booking.customerPhone;
    const serviceName = booking.service_name || booking.serviceName || 'Plumbing Service';

    let subject = `[Plumber Indore Update] Booking #${bookingId} - ${action.toUpperCase()}`;
    let htmlContent = '';

    if (action === 'reschedule') {
      subject = `[Booking Rescheduled] #${bookingId} - ${customerName}`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #d97706; margin-top: 0;">📅 Appointment Rescheduled</h3>
          <p>Booking <strong>#${bookingId}</strong> has been updated with a new slot.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 14px;">
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Customer:</td><td style="padding: 8px;">${customerName} (${customerPhone || 'N/A'})</td></tr>
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Service:</td><td style="padding: 8px;">${serviceName}</td></tr>
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">New Date & Time:</td><td style="padding: 8px; font-weight: bold; color: #d97706;">${newDate || 'Updated Date'}, ${newTimeSlot || 'Updated Slot'}</td></tr>
          </table>
        </div>
      `;
    } else if (action === 'cancel') {
      subject = `[Booking Cancelled] #${bookingId} - ${customerName}`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #dc2626; margin-top: 0;">❌ Booking Cancelled</h3>
          <p>Booking <strong>#${bookingId}</strong> has been cancelled.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 14px;">
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Customer:</td><td style="padding: 8px;">${customerName} (${customerPhone || 'N/A'})</td></tr>
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Service:</td><td style="padding: 8px;">${serviceName}</td></tr>
          </table>
        </div>
      `;
    } else if (action === 'claim') {
      subject = `[Warranty Claim Filed] #${bookingId} - ${customerName}`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #7c3aed; margin-top: 0;">🛡️ 30-Day Warranty Claim Filed</h3>
          <p>A warranty claim has been submitted for booking <strong>#${bookingId}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 14px;">
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Customer:</td><td style="padding: 8px;">${customerName} (${customerPhone || 'N/A'})</td></tr>
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Reason:</td><td style="padding: 8px; font-weight: bold;">${claimReason || 'Not specified'}</td></tr>
            <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">Details:</td><td style="padding: 8px;">${claimDescription || 'No additional details'}</td></tr>
          </table>
        </div>
      `;
    }

    if (htmlContent) {
      try {
        await sendNotificationEmail({
          subject,
          html: htmlContent,
          emailType: `booking_${action}`
        });

        if (customerEmail && !ADMIN_NOTIFICATION_RECIPIENTS.includes(customerEmail.toLowerCase())) {
          await sendEmail({
            to: customerEmail,
            subject,
            html: htmlContent,
            replyTo: ADMIN_NOTIFICATION_EMAIL,
            emailType: `booking_${action}_customer`
          });
        }
      } catch (mailErr) {
        console.warn(`[POST /api/booking/notify] Brevo notify dispatch notice:`, mailErr);
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Notification for action "${action}" processed successfully.`,
        data: { action, bookingId: booking.id }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/booking/notify route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
