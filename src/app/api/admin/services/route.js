import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';
import { getAdminClient } from '../../../../lib/supabase/admin.js';
import { SERVICE_CATALOG } from '../../../../lib/partner-engine/store.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    if (supabase) {
      const { data: services, error } = await supabase
        .from('service_catalog')
        .select('*')
        .order('category', { ascending: true });

      if (!error && services && services.length > 0) {
        return NextResponse.json({ success: true, catalog: services });
      }
    }

    return NextResponse.json({ success: true, catalog: SERVICE_CATALOG });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
