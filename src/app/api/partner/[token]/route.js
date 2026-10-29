import { NextResponse } from 'next/server';
import { validateWorkerToken } from '../../../../lib/partner-engine/auth.js';
import { getWorkerActiveJob, sanitizeJobForWorker } from '../../../../lib/partner-engine/store.js';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { token } = resolvedParams;
    const authResult = await validateWorkerToken(token);

    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: authResult.reason || 'Invalid or revoked token' },
        { status: 401 }
      );
    }

    const worker = authResult.worker;
    const activeJob = await getWorkerActiveJob(worker.id);

    return NextResponse.json({
      success: true,
      worker,
      activeJob: sanitizeJobForWorker(activeJob)
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
