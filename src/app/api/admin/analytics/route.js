import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';
import { getAdminClient } from '../../../../lib/supabase/admin.js';
import { getDashboardMetrics, getTodaysHisab } from '../../../../lib/partner-engine/store.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [metrics, hisab] = await Promise.all([
      getDashboardMetrics(),
      getTodaysHisab()
    ]);

    return NextResponse.json({
      success: true,
      analytics: {
        fleet: metrics,
        financials: hisab,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
