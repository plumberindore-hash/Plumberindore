import { NextResponse } from 'next/server';
import { getFleet } from '../../../../lib/partner-engine/store.js';
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
