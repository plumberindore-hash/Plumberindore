import { NextResponse } from 'next/server';
import { getFleet, createWorker, toggleWorkerActive } from '../../../../lib/partner-engine/store.js';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locality = searchParams.get('locality') || 'All Areas';
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';

    const workers = await getFleet({ locality, status, search });
    return NextResponse.json({ success: true, workers });
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
    if (!body.name || !body.phone) {
      return NextResponse.json({ success: false, error: 'Worker name and 10-digit mobile number are required.' }, { status: 400 });
    }

    const result = await createWorker(body, session.user?.name || 'Owner');
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workerId, isActive } = body;

    if (!workerId) {
      return NextResponse.json({ success: false, error: 'Worker ID is required.' }, { status: 400 });
    }

    const result = await toggleWorkerActive(workerId, isActive, session.user?.name || 'Owner');
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
