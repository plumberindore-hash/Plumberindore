import { NextResponse } from 'next/server';
import { getFleet, rechargeWorkerWallet } from '../../../../lib/partner-engine/store.js';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const fleet = await getFleet();
    const wallets = fleet.map(w => ({
      workerId: w.id,
      workerName: w.name,
      workerPhone: w.phone,
      locality: w.locality,
      balancePaise: w.wallet_balance_paise || 0,
      todayJobsCount: w.today_jobs_count || 0,
      status: w.status
    }));

    return NextResponse.json({ success: true, wallets });
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
    const { workerId, amountRupees, reason } = body;

    if (!workerId || !amountRupees || Number(amountRupees) <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid worker ID or recharge amount.' }, { status: 400 });
    }

    const result = await rechargeWorkerWallet(
      workerId,
      Number(amountRupees),
      'ADMIN_MANUAL_TOPUP',
      reason || 'Owner Manual Top-Up',
      session.user?.name || 'Owner'
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
