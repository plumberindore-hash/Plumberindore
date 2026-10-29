import { NextResponse } from 'next/server';
import { getJobById } from '../../../../../lib/partner-engine/store.js';
import { getAdminSession } from '../../../../../lib/partner-engine/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const job = await getJobById(id);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
