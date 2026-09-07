import { NextResponse } from 'next/server';
import { checkRateLimit, sanitizeString, validateIndianPhone, validateEmail, getClientIp } from '../../../lib/security.js';
import { sendNotificationEmail, ADMIN_NOTIFICATION_EMAIL } from '../../../utils/brevo.js';

export async function POST(request) {
  try {
    // 1. Rate Limiting (Max 5 inquiries per minute per IP)
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`contact_${ip}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a minute before submitting again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawName = body?.name;
    const rawPhone = body?.phone;
    const rawMessage = body?.message;
    const rawEmail = body?.email;

    const name = sanitizeString(rawName);
    const message = sanitizeString(rawMessage);
    const cleanPhone = validateIndianPhone(rawPhone);
    const cleanEmail = validateEmail(rawEmail);

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid full name.' },
        { status: 400 }
      );
    }

    if (!cleanPhone) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please enter a message of at least 5 characters.' },
        { status: 400 }
      );
    }

    const phone = cleanPhone;
    const email = cleanEmail;

    // Persist in Supabase contact_messages table
    let dbRecord = null;
    try {
      const { getAdminClient } = await import('../../../lib/supabase/admin.js');
      const supabaseAdmin = getAdminClient();
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin.from('contact_messages').insert({
          name: name.trim(),
          phone: phone.trim(),
          email: email ? email.trim() : null,
          message: message.trim(),
          status: 'new'
        }).select().single();
        if (error) console.error('Supabase contact save error:', error.message);
        else dbRecord = data;
      }
    } catch (dbEx) {
      console.warn('Supabase contact save exception:', dbEx.message);
    }

    // Dispatch Brevo notification to admin team
    try {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 16px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: #fbbf24; margin: 0; font-size: 20px;">Plumber<span style="color: #ffffff;">Indore</span></h2>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">New Website Inquiry Alert</p>
          </div>
          <div style="padding: 20px 8px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b; width: 30%;">Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${name.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Phone:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">
                  <a href="tel:${phone.trim()}" style="color: #2563eb; font-weight: bold; text-decoration: none;">${phone.trim()}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${email ? email.trim() : 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Message:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${message.trim()}</td>
              </tr>
            </table>
          </div>
        </div>
      `;

      await sendNotificationEmail({
        subject: `[Contact Inquiry] New Message from ${name.trim()} (${phone.trim()})`,
        html: emailHtml,
        replyTo: email ? email.trim() : ADMIN_NOTIFICATION_EMAIL,
        emailType: 'contact_inquiry'
      });
    } catch (mailErr) {
      console.error('[POST /api/contact] Brevo dispatch exception:', mailErr);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been received! Our Indore support team will reach out shortly.',
        data: dbRecord || { name, phone }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/contact route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
