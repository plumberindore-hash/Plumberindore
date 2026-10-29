import { NextResponse } from 'next/server';
import { validateWorkerToken } from '../../../../../lib/partner-engine/auth.js';
import { saveJobServices, SERVICE_CATALOG } from '../../../../../lib/partner-engine/store.js';
import { SaveJobServicesSchema } from '../../../../../lib/partner-engine/validation.js';
import { getAdminClient } from '../../../../../lib/supabase/admin.js';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { token } = resolvedParams;
    const authResult = await validateWorkerToken(token);

    if (!authResult.valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('service_catalog')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (!error && data && data.length > 0) {
        const formatted = data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          pricePaise: Number(item.price_paise),
          isPart: Boolean(item.is_part)
        }));
        return NextResponse.json({ success: true, catalog: formatted });
      }
    }

    return NextResponse.json({ success: true, catalog: SERVICE_CATALOG });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { token } = resolvedParams;
    const authResult = await validateWorkerToken(token);

    if (!authResult.valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = SaveJobServicesSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { jobId, services } = validated.data;
    const result = await saveJobServices(jobId, services);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
