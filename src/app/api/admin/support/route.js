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
    if (supabase) {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*, workers(name, phone, locality)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && tickets) {
        return NextResponse.json({ success: true, tickets });
      }
    }

    return NextResponse.json({ success: true, tickets: [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
