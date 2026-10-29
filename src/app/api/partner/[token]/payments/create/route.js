import { NextResponse } from 'next/server';
import { validateWorkerToken } from '../../../../../../lib/partner-engine/auth.js';
import { createPaymentOrderForJob, getJobById } from '../../../../../../lib/partner-engine/store.js';
import { CreatePaymentOrderSchema } from '../../../../../../lib/partner-engine/validation.js';

export async function POST(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { token } = resolvedParams;
    const authResult = await validateWorkerToken(token);

    if (!authResult.valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or revoked token' }, { status: 401 });
    }

    const body = await request.json();
    const validated = CreatePaymentOrderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { jobId } = validated.data;
    const job = await getJobById(jobId);

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    // Security: Worker can only generate payment for their assigned job
    if (job.assigned_worker_id !== authResult.worker.id) {
      return NextResponse.json({ success: false, error: 'Forbidden: You are not assigned to this job' }, { status: 403 });
    }

    const result = await createPaymentOrderForJob(jobId, {
      actor: `Worker:${authResult.worker.name}`
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, payment: result.payment });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
