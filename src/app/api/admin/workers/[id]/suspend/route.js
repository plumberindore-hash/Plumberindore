import { NextResponse } from 'next/server';
import { suspendWorker, unsuspendWorker } from '../../../../../../lib/partner-engine/store.js';
import { getAdminSession } from '../../../../../../lib/partner-engine/auth.js';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { action, reason } = body;

    let result;
    if (action === 'UNSUSPEND') {
      result = await unsuspendWorker(id, session.user?.name || 'Owner');
    } else {
      result = await suspendWorker(id, reason || 'Suspended by admin', session.user?.name || 'Owner');
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
