import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../../lib/partner-engine/auth.js';
import { NOTIFICATION_TEMPLATES } from '../../../../../lib/partner-engine/notifications/templates.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, templates: Object.values(NOTIFICATION_TEMPLATES) });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
