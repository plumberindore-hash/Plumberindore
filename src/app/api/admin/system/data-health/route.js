import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';
import { getAdminClient } from '../../../../lib/supabase/admin.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Supabase admin client unconfigured (In-Memory active).' });
    }

    const tables = ['workers', 'jobs', 'payments', 'settings', 'audit_logs', 'operational_alerts'];
    const checks = {};

    for (const t of tables) {
      try {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        checks[t] = { accessible: !error, rowCount: count || 0, error: error?.message || null };
      } catch (e) {
        checks[t] = { accessible: false, error: e.message };
      }
    }

    return NextResponse.json({ success: true, dataHealth: checks, checkedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
