import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../../../lib/partner-engine/auth.js';
import { getPaymentProvider } from '../../../../../../lib/partner-engine/payments/provider.js';
import { logAudit } from '../../../../../../lib/partner-engine/store.js';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { amountPaise, reason } = body;

    const provider = getPaymentProvider();
    const refundResult = await provider.processRefund(id, { amountPaise, reason });

    await logAudit({
      actor: session.user?.name || 'Owner',
      action: 'PAYMENT_REFUNDED',
      entity_type: 'payment',
      entity_id: id,
      details: { amountPaise, reason, refundResult }
    });

    return NextResponse.json({ success: true, refund: refundResult });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
