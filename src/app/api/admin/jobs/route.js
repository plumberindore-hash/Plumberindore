import { NextResponse } from 'next/server';
import { getJobs, dispatchJob } from '../../../../lib/partner-engine/store.js';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const workerId = searchParams.get('workerId') || null;

    const jobs = await getJobs({ status, worker_id: workerId });
    return NextResponse.json({ success: true, jobs });
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
    if (!body.customerPhone) {
      return NextResponse.json({ success: false, error: 'Customer phone is required' }, { status: 400 });
    }

    const result = await dispatchJob(body, session.user?.name || 'Owner');
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
