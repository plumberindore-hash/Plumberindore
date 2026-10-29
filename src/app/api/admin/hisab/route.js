import { NextResponse } from 'next/server';
import { getTodaysHisab, getJobs } from '../../../../lib/partner-engine/store.js';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'today';

    const hisab = await getTodaysHisab();
    const completedJobs = await getJobs({ status: 'COMPLETED' });

    return NextResponse.json({
      success: true,
      range,
      metrics: hisab,
      settlements: completedJobs
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
