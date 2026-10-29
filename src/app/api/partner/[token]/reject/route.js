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
    const { jobId, reason = 'TECHNICIAN_DECLINED' } = body;
    const worker = authResult.worker;
    const supabase = getAdminClient();

    if (supabase && jobId) {
      // Revert job status to NEW so another technician can claim, or log refusal
      await supabase.from('jobs').update({
        assigned_worker_id: null,
        status: 'NEW',
        updated_at: new Date().toISOString()
      }).eq('id', jobId);

      await supabase.from('audit_logs').insert({
        actor: worker.name,
        action: 'JOB_DECLINED',
        entity: 'job',
        entity_id: jobId,
        metadata: { reason, workerId: worker.id }
      }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      message: 'Job passed. System will re-route to next technician.',
      jobId
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
