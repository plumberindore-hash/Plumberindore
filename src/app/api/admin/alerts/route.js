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
      const { data: alerts, error } = await supabase
        .from('operational_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && alerts) {
        return NextResponse.json({ success: true, alerts });
      }
    }

    return NextResponse.json({ success: true, alerts: [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { alertId, status, notes } = body;

    const supabase = getAdminClient();
    if (supabase && alertId) {
      await supabase
        .from('operational_alerts')
        .update({
          status: status || 'RESOLVED',
          resolved_at: new Date().toISOString(),
          resolved_by: session.user?.name || 'Owner',
          resolution_notes: notes || 'Resolved via Admin Portal'
        })
        .eq('id', alertId);
    }

    return NextResponse.json({ success: true, message: 'Alert updated.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
