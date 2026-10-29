import { NextResponse } from 'next/server';
import { validateWorkerToken } from '@/lib/partner-engine/auth.js';
import { getAdminClient } from '@/lib/supabase/admin.js';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { token } = resolvedParams;
    const authResult = await validateWorkerToken(token);

    if (!authResult.valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { jobId } = body;
    const worker = authResult.worker;
    const supabase = getAdminClient();

    if (supabase && jobId) {
      await supabase.from('jobs').update({
        assigned_worker_id: worker.id,
        status: 'ASSIGNED',
        updated_at: new Date().toISOString()
      }).eq('id', jobId);

      await supabase.from('workers').update({
        status: 'BUSY'
      }).eq('id', worker.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Job accepted successfully! You are now en route.',
      jobId
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
