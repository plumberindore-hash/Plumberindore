import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { runAutomation } from '@/lib/partner-engine/store.js';

export const dynamic = 'force-dynamic';

let isCronRunning = false;

export async function GET(request) {
  return handleCron(request);
}

export async function POST(request) {
  return handleCron(request);
}

function timingSafeMatch(provided, expected) {
  if (!provided || !expected) return false;
  const bufA = Buffer.from(provided);
  const bufB = Buffer.from(expected);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function handleCron(request) {
  const cronSecret = process.env.CRON_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !cronSecret) {
    return NextResponse.json(
      { success: false, error: 'Server misconfiguration: CRON_SECRET must be configured in production environment.' },
      { status: 500 }
    );
  }

  const effectiveSecret = cronSecret || (!isProduction ? 'plumberindore_cron_secret_dev' : null);
  const authHeader = request.headers.get('authorization') || '';
  const xCronSecret = request.headers.get('x-cron-secret') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  let isAuthorized = false;
  if (effectiveSecret) {
    isAuthorized = timingSafeMatch(token, effectiveSecret) || timingSafeMatch(xCronSecret, effectiveSecret);
  } else if (!isProduction) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid CRON_SECRET' },
      { status: 401 }
    );
  }

  if (isCronRunning) {
    return NextResponse.json(
      { success: false, message: 'Automation job already running. Skipped to prevent concurrent overlap.' },
      { status: 429 }
    );
  }

  isCronRunning = true;
  const startTime = Date.now();

  try {
    const result = await runAutomation();
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      duration_ms: durationMs,
      timestamp: new Date().toISOString(),
      automation_stats: result.stats,
      queue_result: result.queueResult
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  } finally {
    isCronRunning = false;
  }
}
