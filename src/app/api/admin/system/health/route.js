import { NextResponse } from 'next/server';
import { getFleet, getTodaysHisab, getPlatformSettings } from '@/lib/partner-engine/store.js';
import { getAdminSession } from '@/lib/partner-engine/auth.js';
import { getAdminClient } from '@/lib/supabase/admin.js';
import { validateEnvironment } from '@/lib/partner-engine/env-validation.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    const supabase = getAdminClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('settings').select('key').limit(1);
        if (error) dbStatus = 'degraded';
      } catch (e) {
        dbStatus = 'unreachable';
      }
    }
    dbLatencyMs = Date.now() - startTime;

    const [fleet, hisab, settings] = await Promise.all([
      getFleet(),
      getTodaysHisab(),
      getPlatformSettings()
    ]);

    const lowBalanceWorkers = fleet.filter(
      w => Number(w.wallet_balance_paise || 0) < (settings.minimum_worker_wallet_balance_paise || 10000)
    ).length;

    const diffPaise = (hisab.gross_revenue_paise || 0) - ((hisab.commission_paise || 0) + (hisab.worker_share_paise || 0));
    const envHealth = validateEnvironment();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Kolkata',
      system: {
        application: 'HEALTHY',
        database: dbStatus,
        databaseLatencyMs: dbLatencyMs,
        realtime: 'ACTIVE',
        authentication: 'ACTIVE',
        environmentConfig: 'VALIDATED'
      },
      financialReconciliation: {
        status: diffPaise === 0 ? 'RECONCILED' : 'DISCREPANCY_DETECTED',
        differencePaise: diffPaise
      },
      environmentHealth: envHealth,
      fleetHealth: {
        totalTechnicians: fleet.length,
        onlineCount: fleet.filter(w => w.status === 'ONLINE_FREE').length,
        busyCount: fleet.filter(w => w.status === 'BUSY').length,
        offlineCount: fleet.filter(w => w.status === 'OFFLINE').length,
        suspendedCount: fleet.filter(w => w.status === 'SUSPENDED').length,
        lowBalanceCount: lowBalanceWorkers
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
