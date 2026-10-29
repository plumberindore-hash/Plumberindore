import { NextResponse } from 'next/server';
import { processDeliveryWebhook } from '@/lib/partner-engine/notifications/queue.js';

export const dynamic = 'force-dynamic';

// WhatsApp Cloud API challenge verification (GET)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'plumberindore_verify_token_prod';

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ success: false, error: 'Webhook challenge failed' }, { status: 403 });
}

// Delivery status callback (POST)
export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || request.headers.get('x-provider-signature') || '';

    const headers = {};
    request.headers.forEach((v, k) => {
      headers[k] = v;
    });

    const result = await processDeliveryWebhook(rawBody, signature, headers);

    if (!result.success && result.code === 401) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
