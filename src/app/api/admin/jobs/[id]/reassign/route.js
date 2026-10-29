import { NextResponse } from 'next/server';
import { reassignJob } from '../../../../../../lib/partner-engine/store.js';
import { getAdminSession } from '../../../../../../lib/partner-engine/auth.js';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { newWorkerId, reason } = body;

    if (!newWorkerId) {
      return NextResponse.json({ success: false, error: 'New worker ID is required' }, { status: 400 });
    }

    const result = await reassignJob(id, newWorkerId, reason, session.user?.name || 'Owner');
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
