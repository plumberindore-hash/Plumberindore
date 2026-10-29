import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../../lib/partner-engine/auth.js';
import { getAdminClient } from '../../../../../lib/supabase/admin.js';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const supabase = getAdminClient();
    if (supabase) {
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*, jobs(*)')
        .eq('id', id)
        .maybeSingle();

      if (!error && payment) {
        return NextResponse.json({ success: true, payment });
      }
    }

    return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
