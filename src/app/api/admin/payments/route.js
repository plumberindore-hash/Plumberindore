import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';
import { getAdminClient } from '../../../../lib/supabase/admin.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || 100);

    const supabase = getAdminClient();
    if (supabase) {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*, jobs(job_number, customer_name, customer_phone)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && payments) {
        return NextResponse.json({ success: true, payments });
      }
    }

    return NextResponse.json({ success: true, payments: [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
