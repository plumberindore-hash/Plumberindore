import { NextResponse } from 'next/server';
import { validateWorkerToken } from '@/lib/partner-engine/auth.js';
import { getWorkerActiveJob, sanitizeJobForWorker, getJobs } from '@/lib/partner-engine/store.js';

export const dynamic = 'force-dynamic';

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

    // Retrieve worker's complete job history & calculate live shift stats
    const allWorkerJobs = await getJobs({ worker_id: worker.id });
    const completedJobs = allWorkerJobs.filter(j => j.status === 'COMPLETED');

    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    let todayEarningsPaise = 0;
    let completedJobsCount = 0;
    let cashCollectedPaise = 0;

    completedJobs.forEach(j => {
      const compDate = (j.completed_at || j.created_at || '').split('T')[0];
      const total = Number(j.total_paise || 29900);
      const workerShare = Math.round(total * 0.90);
      
      if (compDate === todayStr) {
        todayEarningsPaise += workerShare;
        completedJobsCount += 1;
        if ((j.payment_method || 'CASH').toUpperCase() === 'CASH') {
          cashCollectedPaise += total;
        }
      }
    });

    const formattedHistory = completedJobs.map(j => ({
      id: j.id,
      job_number: j.job_number,
      customer_name: j.customer_name,
      locality: j.locality,
      issue: j.issue,
      total_paise: Number(j.total_paise || 29900),
      worker_share_paise: Math.round(Number(j.total_paise || 29900) * 0.90),
      commission_paise: Number(j.total_paise || 29900) - Math.round(Number(j.total_paise || 29900) * 0.90),
      payment_method: j.payment_method || 'CASH',
      completed_at: j.completed_at || j.created_at
    }));

    return NextResponse.json({
      success: true,
      worker,
      activeJob: sanitizeJobForWorker(activeJob),
      shiftStats: {
        todayEarningsPaise,
        completedJobsCount,
        cashCollectedPaise,
        totalHistoricalJobs: completedJobs.length
      },
      historyJobs: formattedHistory
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
