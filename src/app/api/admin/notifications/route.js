import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';
import { getAdminClient } from '../../../../lib/supabase/admin.js';
import { enqueueNotification } from '../../../../lib/partner-engine/notifications/queue.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    if (supabase) {
      const { data: notifications, error } = await supabase
        .from('notification_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && notifications) {
        return NextResponse.json({ success: true, notifications });
      }
    }

    return NextResponse.json({ success: true, notifications: [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientPhone, recipientName, recipientType, channel, message, templateId } = body;

    const notif = await enqueueNotification({
      idempotencyKey: `MANUAL_BROADCAST:${Date.now()}:${recipientPhone}`,
      recipientType: recipientType || 'WORKER',
      recipientPhone,
      recipientName,
      channel: channel || 'WHATSAPP',
      notificationType: 'BROADCAST_MESSAGE',
      templateId: templateId || null,
      variables: { message }
    });

    return NextResponse.json({ success: true, notification: notif });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
