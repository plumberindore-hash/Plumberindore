import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/partner-engine/auth.js';
import { getAdminClient } from '@/lib/supabase/admin.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const entityType = searchParams.get('entityType') || null;

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        auditLogs: [],
        total: 0,
        limit,
        offset,
        message: 'Supabase admin client unconfigured (In-Memory mode).'
      });
    }

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, count, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      auditLogs: data || [],
      total: count || (data ? data.length : 0),
      limit,
      offset
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
