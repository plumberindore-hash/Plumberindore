import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, sanitizeString, escapeHtml, validateIndianPhone } from '../../../lib/security.js';
import { sendNotificationEmail } from '../../../utils/brevo.js';
import { getAdminClient } from '../../../lib/supabase/admin.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, chats: [] });
    }

    const { data: leads = [], error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('source', 'live_chat')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      chats: (leads || []).map(l => ({
        id: l.lead_number || l.id,
        dbId: l.id,
        customerName: l.name || 'Website Visitor',
        customerPhone: l.phone || '',
        locality: l.service_address || l.raw_payload?.locality || 'Vijay Nagar',
        service: l.service_name || 'Live Chat Inquiry',
        lastMessage: l.issue_description || '',
        status: l.status === 'converted' ? 'Converted' : (l.status === 'resolved' ? 'Resolved' : 'Active'),
        time: new Date(l.updated_at || l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: l.updated_at || l.created_at,
        messages: l.raw_payload?.messages || [
          { sender: 'user', text: l.issue_description || '', time: 'Recent' }
        ],
        linkedBookingId: l.raw_payload?.linkedBookingId || null,
        linkedInquiryId: l.raw_payload?.linkedInquiryId || null
      }))
    });
  } catch (err) {
    console.error('Error in GET /api/chat:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`chat_msg_${ip}`, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many chat messages sent. Please wait a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      sessionId,
      message, 
      customerName = 'Website Visitor', 
      customerPhone = '', 
      locality = 'Indore',
      orderId = 'Live Chat',
      chatHistory = []
    } = body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message text is required.' },
        { status: 400 }
      );
    }

    const cleanMsg = sanitizeString(message.trim());
    const cleanName = sanitizeString(customerName);
    const cleanPhone = validateIndianPhone(customerPhone) || sanitizeString(customerPhone);
    const cleanLocality = sanitizeString(locality);
    const effectiveSessionId = sessionId ? sanitizeString(sessionId) : `CHAT-${Math.floor(10000 + Math.random() * 90000)}`;

    // Persist conversation into Supabase leads table
    const supabaseAdmin = getAdminClient();
    if (supabaseAdmin) {
      try {
        const { data: existingLead } = await supabaseAdmin
          .from('leads')
          .select('id, raw_payload')
          .eq('source', 'live_chat')
          .eq('lead_number', effectiveSessionId)
          .maybeSingle();

        if (existingLead) {
          await supabaseAdmin
            .from('leads')
            .update({
              name: cleanName && cleanName !== 'Website Visitor' ? cleanName : undefined,
              phone: cleanPhone || undefined,
              service_address: cleanLocality,
              issue_description: cleanMsg,
              raw_payload: {
                ...(existingLead.raw_payload || {}),
                sessionId: effectiveSessionId,
                locality: cleanLocality,
                messages: chatHistory.length > 0 ? chatHistory : existingLead.raw_payload?.messages || [],
                lastUpdated: new Date().toISOString()
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', existingLead.id);
        } else {
          await supabaseAdmin
            .from('leads')
            .insert({
              lead_number: effectiveSessionId,
              source: 'live_chat',
              name: cleanName || 'Website Visitor',
              phone: cleanPhone || null,
              service_name: 'Website Live Chatbot',
              service_address: cleanLocality || 'Indore',
              issue_description: cleanMsg,
              status: 'active',
              raw_payload: {
                sessionId: effectiveSessionId,
                locality: cleanLocality,
                messages: chatHistory.length > 0 ? chatHistory : [
                  { sender: 'user', text: cleanMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                ],
                lastUpdated: new Date().toISOString()
              }
            });
        }
      } catch (dbErr) {
        console.warn('[POST /api/chat] Supabase lead persistence notice:', dbErr.message);
      }
    }

    // If customer phone is provided, dispatch chat alert to admin team via Brevo
    if (cleanPhone && cleanPhone.length >= 10) {
      try {
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 16px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: #fbbf24; margin: 0; font-size: 20px;">Plumber<span style="color: #ffffff;">Indore</span></h2>
              <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">💬 Live Chatbot Customer Lead</p>
            </div>
            <div style="padding: 16px 8px;">
              <p><strong>Session ID:</strong> ${effectiveSessionId}</p>
              <p><strong>Customer:</strong> ${cleanName}</p>
              <p><strong>Phone:</strong> <a href="tel:${cleanPhone}">${cleanPhone}</a></p>
              <p><strong>Locality:</strong> ${cleanLocality}</p>
              <div style="background-color: #f8fafc; padding: 14px; border-left: 4px solid #2563eb; border-radius: 4px; margin-top: 12px;">
                <p style="margin: 0; color: #1e293b; font-size: 13px;"><strong>Latest Message:</strong></p>
                <p style="margin: 6px 0 0 0; color: #334155; font-size: 13px;">${escapeHtml(cleanMsg)}</p>
              </div>
              <div style="margin-top: 16px; text-align: center;">
                <a href="https://www.plumberindore.in/portal-indore-ops-9821" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 12px; text-decoration: none;">
                  Open Live Chatbot Monitor →
                </a>
              </div>
            </div>
          </div>
        `;

        await sendNotificationEmail({
          subject: `[Live Chat Lead] ${cleanName} (${cleanPhone}) - ${cleanLocality}`,
          html: emailHtml,
          emailType: 'chat_lead'
        });
      } catch (mailErr) {
        console.warn('[POST /api/chat] Brevo notice:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: effectiveSessionId,
      message: 'Chat synchronized with Indore support desk.'
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
