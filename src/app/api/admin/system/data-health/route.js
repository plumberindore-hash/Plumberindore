import { NextResponse } from 'next/server';
import { getDataHealthReport } from '@/lib/partner-engine/store.js';
import { getAdminSession } from '@/lib/partner-engine/auth.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const report = await getDataHealthReport();
    return NextResponse.json({ success: true, ...report });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
