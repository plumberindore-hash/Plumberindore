import { NextResponse } from 'next/server';
import { checkRateLimit, sanitizeString, validateIndianPhone, validatePincode, getClientIp } from '../../../lib/security.js';
import { sendNotificationEmail } from '../../../utils/brevo.js';

export async function POST(request) {
  try {
    // 1. Rate Limiting (Max 5 quote requests per minute per IP)
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`quote_${ip}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a minute before submitting again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const category = sanitizeString(body?.category);
    const brand = sanitizeString(body?.brand);
    const modelType = sanitizeString(body?.modelType);
    const issue = sanitizeString(body?.issue);
    const estimatedPrice = Number(body?.estimatedPrice) || 0;
    const customerName = sanitizeString(body?.customerName);
    const customerPhone = validateIndianPhone(body?.customerPhone) || sanitizeString(body?.customerPhone);
    const customerPincode = validatePincode(body?.customerPincode);
    const remarks = sanitizeString(body?.remarks);

    if (!category || !issue) {
      return NextResponse.json(
        { success: false, error: 'Category and issue details are required.' },
        { status: 400 }
      );
    }

    // Persist in Supabase quote_requests table
    let dbRecord = null;
    try {
      const { getAdminClient } = await import('../../../lib/supabase/admin.js');
      const supabaseAdmin = getAdminClient();
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin.from('quote_requests').insert({
          category,
          brand: brand || null,
          model_type: modelType || null,
          issue,
          estimated_price: Number(estimatedPrice) || null,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          customer_pincode: customerPincode || null,
          remarks: remarks || null,
          status: 'pending'
        }).select().single();
        if (error) console.error('Supabase quote request save error:', error.message);
        else dbRecord = data;
      }
    } catch (dbEx) {
      console.warn('Supabase quote request save exception:', dbEx.message);
    }

    // Dispatch Brevo notification to admin team
    try {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 16px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: #fbbf24; margin: 0; font-size: 20px;">Plumber<span style="color: #ffffff;">Indore</span></h2>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">New Instant Quote Request</p>
          </div>
          <div style="padding: 20px 8px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b; width: 35%;">Category:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: bold;">${category}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Issue / Problem:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${issue}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Estimated Quote:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #059669; font-weight: bold;">₹${estimatedPrice}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Customer Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${customerName || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Phone:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">
                  ${customerPhone ? `<a href="tel:${customerPhone}" style="color: #2563eb; font-weight: bold; text-decoration: none;">${customerPhone}</a>` : 'Not provided'}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Pincode:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${customerPincode || 'Indore'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Remarks:</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${remarks || 'None'}</td>
              </tr>
            </table>
          </div>
        </div>
      `;

      await sendNotificationEmail({
        subject: `[Quote Request] ${category} - ${customerName || 'Customer'} (${customerPhone || 'Indore'})`,
        html: emailHtml,
        emailType: 'quote_request'
      });
    } catch (mailErr) {
      console.error('[POST /api/quote] Brevo dispatch exception:', mailErr);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Quote request submitted successfully!',
        data: dbRecord || { category, issue, estimatedPrice }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/quote route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
