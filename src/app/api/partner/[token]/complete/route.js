import { NextResponse } from 'next/server';
import { validateWorkerToken } from '../../../../../lib/partner-engine/auth.js';
import { completeJobAndSettle } from '../../../../../lib/partner-engine/store.js';
import { CompleteJobSchema } from '../../../../../lib/partner-engine/validation.js';

export async function POST(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { token } = resolvedParams;
    const authResult = await validateWorkerToken(token);

    if (!authResult.valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = CompleteJobSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { jobId, endOtp, paymentMethod } = validated.data;
    const result = await completeJobAndSettle(jobId, endOtp, paymentMethod, authResult.worker.name, authResult.worker.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
