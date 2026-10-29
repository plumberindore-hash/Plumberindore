import { NextResponse } from 'next/server';
import { validateWorkerToken } from '../../../../../lib/partner-engine/auth.js';
import { getWorkerNotifications, markNotificationRead } from '../../../../../lib/partner-engine/store.js';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { token } = resolvedParams;
    const authResult = await validateWorkerToken(token);

    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: authResult.reason || 'Invalid or revoked token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    const all = await getWorkerNotifications(authResult.worker.id, false);
    const unread = all.filter(n => !n.worker_read_at);

    return NextResponse.json({
      success: true,
      unreadCount: unread.length,
      notifications: unreadOnly ? unread : all
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { token } = resolvedParams;
    const authResult = await validateWorkerToken(token);

    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: authResult.reason || 'Invalid or revoked token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ success: false, error: 'notificationId is required' }, { status: 400 });
    }

    await markNotificationRead(notificationId);
    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
