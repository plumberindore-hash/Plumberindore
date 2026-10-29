import { NextResponse } from 'next/server';
import { validateWorkerToken } from '../../../../../../../lib/partner-engine/auth.js';
import { pollPaymentStatus, getPaymentById } from '../../../../../../../lib/partner-engine/store.js';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { token, paymentId } = resolvedParams;
    const authResult = await validateWorkerToken(token);

    if (!authResult.valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or revoked token' }, { status: 401 });
    }

    const existingPayment = await getPaymentById(paymentId);
    if (!existingPayment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    // Security: Check worker ownership of the job
    if (existingPayment.job && existingPayment.job.assigned_worker_id && existingPayment.job.assigned_worker_id !== authResult.worker.id) {
      return NextResponse.json({ success: false, error: 'Forbidden: Access to another worker\'s payment is denied' }, { status: 403 });
    }

    const result = await pollPaymentStatus(paymentId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message || 'Status check failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      payment: result.payment,
      verified: !!result.verified,
      status: result.payment?.status
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
