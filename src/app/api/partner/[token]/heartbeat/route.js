import { NextResponse } from 'next/server';
import { validateWorkerToken } from '../../../../../lib/partner-engine/auth.js';
import { getAdminClient } from '../../../../../lib/supabase/admin.js';

/**
 * POST /api/partner/[token]/heartbeat
 * Heartbeat update for active worker presence
 * Updates last_seen_at & worker_presence.last_heartbeat
 */
export async function POST(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { token } = resolvedParams;
    const authResult = await validateWorkerToken(token);

    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: authResult.reason || 'Unauthorized' },
        { status: 401 }
      );
    }

    const worker = authResult.worker;
    const supabase = getAdminClient();
    const nowIso = new Date().toISOString();

    const isLowWallet = Number(worker.wallet_balance_paise || 0) < 10000;

    if (supabase) {
      try {
        // Update last_seen_at on worker
        await supabase
          .from('workers')
          .update({ last_seen_at: nowIso })
          .eq('id', worker.id);

        // Update worker_presence
        await supabase
          .from('worker_presence')
          .upsert({
            worker_id: worker.id,
            status: worker.status,
            last_heartbeat: nowIso
          }, { onConflict: 'worker_id' });
      } catch (err) {
        console.warn('Heartbeat Supabase notice:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      lastSeenAt: nowIso,
      status: worker.status,
      walletBalancePaise: worker.wallet_balance_paise,
      isLowWallet
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
