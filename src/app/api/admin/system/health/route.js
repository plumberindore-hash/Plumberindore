import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../../lib/partner-engine/auth.js';
import { checkDatabaseReadiness } from '../../../../lib/partner-engine/store.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbHealth = await checkDatabaseReadiness();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health: {
        database: dbHealth,
        environment: process.env.NODE_ENV || 'production'
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
