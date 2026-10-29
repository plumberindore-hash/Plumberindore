import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';
import { getTodaysHisab } from '../../../../lib/partner-engine/store.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const hisab = await getTodaysHisab();
    const discrepancyPaise = (hisab.gross_revenue_paise || 0) - ((hisab.commission_paise || 0) + (hisab.worker_share_paise || 0));

    return NextResponse.json({
      success: true,
      reconciliation: {
        ...hisab,
        discrepancyPaise,
        zeroDriftVerified: discrepancyPaise === 0
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
