import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../../lib/partner-engine/auth.js';
import { getAdminClient } from '../../../../../lib/supabase/admin.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: true, verifiedPayments: [], zeroDrift: true });
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, amount_paise, status, provider, created_at')
      .eq('status', 'VERIFIED');

    return NextResponse.json({
      success: true,
      verifiedPayments: payments || [],
      count: payments?.length || 0
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
