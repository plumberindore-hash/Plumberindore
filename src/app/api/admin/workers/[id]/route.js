import { NextResponse } from 'next/server';
import { getWorkerById, updateWorker } from '../../../../../lib/partner-engine/store.js';
import { getAdminSession } from '../../../../../lib/partner-engine/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const worker = await getWorkerById(id);
    if (!worker) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, worker });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const result = await updateWorker(id, body, session.user?.name || 'Owner');
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
