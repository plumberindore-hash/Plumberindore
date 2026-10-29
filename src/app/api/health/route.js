import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkDatabaseReadiness } from '@/lib/supabase/admin.js';
import { validateEnvironment } from '@/lib/partner-engine/env-validation.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Production Health & Readiness Verification Endpoint
 * 
 * Accurately distinguishes between persistent database availability (READY),
 * transient degradations (DEGRADED), and unconfigured/unreachable states (NOT_READY).
 * Never exposes credentials, stack traces, or internal SQL errors.
 */
export async function GET(request) {
  const startTime = Date.now();
  const requestId = request?.headers?.get('x-request-id') || crypto.randomUUID();
  const isProduction = process.env.NODE_ENV === 'production';
  const allowDevStandalone = process.env.ALLOW_STANDALONE_DEV === 'true';

  const dbReadiness = await checkDatabaseReadiness();
  const envHealth = validateEnvironment();
  const responseTimeMs = Date.now() - startTime;

  let overallStatus = 'READY';
  let httpStatus = 200;

  if (isProduction && !allowDevStandalone) {
    if (dbReadiness.status !== 'READY') {
      overallStatus = 'NOT_READY';
      httpStatus = 503; // Service Unavailable when database cannot persist production records
    } else if (envHealth.issues.length > 0) {
      overallStatus = 'DEGRADED';
      httpStatus = 200;
    } else {
      overallStatus = 'READY';
      httpStatus = 200;
    }
  } else {
    // Development or explicit standalone dev mode
    if (dbReadiness.status === 'READY') {
      overallStatus = 'READY';
    } else {
      overallStatus = 'STANDALONE_DEV_MODE';
    }
    httpStatus = 200;
  }

  // Determine overall certification label
  let certification = envHealth.certification;
  if (isProduction && !allowDevStandalone && dbReadiness.status !== 'READY') {
    certification = 'NOT READY — DATABASE UNCONFIGURED';
  }

  return NextResponse.json({
    status: overallStatus,
    requestId,
    timestamp: new Date().toISOString(),
    responseTimeMs,
    environment: isProduction ? 'production' : 'development',
    database: {
      status: dbReadiness.status,
      persistent: dbReadiness.persistent,
      reason: dbReadiness.reason,
      latencyMs: dbReadiness.latencyMs
    },
    subsystems: {
      payments: envHealth.subsystems.payments,
      whatsapp: envHealth.subsystems.whatsapp,
      sms: envHealth.subsystems.sms,
      cron: envHealth.subsystems.cron,
      adminAuth: envHealth.subsystems.adminAuth
    },
    certification
  }, {
    status: httpStatus,
    headers: {
      'x-request-id': requestId,
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
