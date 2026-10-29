import { NextResponse } from 'next/server';
import { getWalletTransactions } from '../../../../../lib/partner-engine/store.js';
import { getAdminSession } from '../../../../../lib/partner-engine/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId') || null;

    const ledger = await getWalletTransactions(workerId);
    return NextResponse.json({ success: true, ledger });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
