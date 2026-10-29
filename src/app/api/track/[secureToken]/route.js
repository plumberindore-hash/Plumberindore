import { NextResponse } from 'next/server';
import { getJobs, getWorkers } from '../../../../lib/partner-engine/store.js';
import { getJobByTrackingToken } from '../../../../lib/partner-engine/notifications/queue.js';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { secureToken } = params;
    if (!secureToken) {
      return NextResponse.json({ success: false, error: 'Tracking token required' }, { status: 400 });
    }

    const jobs = await getJobs({ status: 'ALL' });
    const workers = await getWorkers();

    const trackingData = await getJobByTrackingToken(secureToken, jobs, workers);

    if (!trackingData) {
      return NextResponse.json(
        { success: false, error: 'Tracking link not found or invalid' },
        { status: 404 }
      );
    }

    if (trackingData.expired) {
      return NextResponse.json(
        { success: false, error: 'This tracking link has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trackingData
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
