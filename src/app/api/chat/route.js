import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, sanitizeString, escapeHtml } from '../../../lib/security.js';
import { sendNotificationEmail } from '../../../utils/brevo.js';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`chat_msg_${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many chat messages sent. Please wait a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      message, 
      customerName = 'Customer', 
      customerPhone, 
      orderId = 'Live Chat',
      chatHistory = []
    } = body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message text is required.' },
        { status: 400 }
      );
    }

    // Dispatch chat message alert to admin team via Brevo
    try {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0f172a; margin-top: 0;">💬 Live Chat Support Alert</h3>
          <p><strong>Customer:</strong> ${sanitizeString(customerName)}</p>
          <p><strong>Phone:</strong> ${customerPhone ? `<a href="tel:${customerPhone}">${customerPhone}</a>` : 'Not provided'}</p>
          <p><strong>Order ID / Topic:</strong> ${sanitizeString(orderId)}</p>
          <div style="background-color: #f8fafc; padding: 14px; border-left: 4px solid #2563eb; border-radius: 4px; margin-top: 12px;">
            <p style="margin: 0; color: #1e293b; font-size: 14px;"><strong>Latest Message:</strong></p>
            <p style="margin: 6px 0 0 0; color: #334155; font-size: 13px;">${escapeHtml(message.trim())}</p>
          </div>
        </div>
      `;

      await sendNotificationEmail({
        subject: `[Live Chat Alert] ${customerName} (${orderId})`,
        html: emailHtml,
        emailType: 'chat_alert'
      });
    } catch (mailErr) {
      console.warn('[POST /api/chat] Brevo chat dispatch notice:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Chat alert sent to Indore support desk.'
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
