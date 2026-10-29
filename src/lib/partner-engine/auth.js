import { getAdminClient } from '../supabase/admin.js';
import { createClientServer } from '../supabase/server.js';

export const OWNER_SESSION_COOKIE = 'pi_partner_engine_session';

/**
 * Validates whether the current request is an authenticated OWNER or ADMIN
 * Checks server-side cookies and Supabase Auth session with profile role lookup.
 */
export async function getAdminSession() {
  let cookieStore = null;
  try {
    const nextHeaders = await import('next/headers.js').catch(() => import('next/headers'));
    cookieStore = nextHeaders.cookies ? nextHeaders.cookies() : null;
  } catch (e) {}

  const sessionToken = cookieStore?.get ? cookieStore.get(OWNER_SESSION_COOKIE)?.value : null;

  // 1. Check local session cookie
  if (sessionToken) {
    try {
      const decoded = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'));
      if (decoded && (decoded.role === 'OWNER' || decoded.role === 'ADMIN')) {
        return {
          user: decoded,
          role: decoded.role,
          isOwner: decoded.role === 'OWNER'
        };
      }
    } catch (e) {
      // invalid token
    }
  }

  // 2. Check Supabase Auth user via Server Client (reading auth cookies)
  try {
    const supabaseServer = createClientServer();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (user) {
      const adminSupabase = getAdminClient() || supabaseServer;
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .maybeSingle();

      const role = profile?.role || 'OWNER';
      if (role === 'OWNER' || role === 'ADMIN') {
        return {
          user: {
            id: user.id,
            email: user.email,
            name: profile?.full_name || 'Business Owner',
            role
          },
          role,
          isOwner: role === 'OWNER'
        };
      }
    }
  } catch (e) {
    // server client auth read fallback
  }

  // 3. Fallback to general session cookie
  try {
    const generalCookie = cookieStore?.get ? cookieStore.get('plumberindore_session')?.value : null;
    if (generalCookie) {
      const parsed = JSON.parse(generalCookie);
      if (parsed?.role === 'admin' || parsed?.role === 'OWNER') {
        return {
          user: {
            id: parsed.id || 'admin-general',
            email: parsed.email || 'admin@plumberindore.in',
            name: parsed.name || 'Administrator',
            role: 'OWNER'
          },
          role: 'OWNER',
          isOwner: true
        };
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Validates Worker API Token for Console access
 * Checks token validity, active worker status, and returns worker details.
 */
export async function validateWorkerToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'TOKEN_REQUIRED' };
  }

  const cleanToken = token.trim();

  // Try live database token verification first
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('worker_tokens')
        .select(`
          id,
          token,
          is_active,
          revoked_at,
          expires_at,
          worker:workers (
            id,
            name,
            phone,
            locality,
            status,
            wallet_balance_paise,
            rating,
            today_jobs_count,
            total_jobs_count,
            is_active
          )
        `)
        .eq('token', cleanToken)
        .maybeSingle();

      if (!error && data) {
        if (!data.is_active || data.revoked_at) {
          return { valid: false, reason: 'TOKEN_REVOKED' };
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          return { valid: false, reason: 'TOKEN_EXPIRED' };
        }

        const worker = data.worker;
        if (!worker || !worker.is_active) {
          return { valid: false, reason: 'WORKER_INACTIVE' };
        }

        // Update last_used_at in background
        supabase
          .from('worker_tokens')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', data.id)
          .then(() => null)
          .catch(() => null);

        return {
          valid: true,
          worker,
          tokenId: data.id
        };
      }
    } catch (err) {
      console.warn('[validateWorkerToken Supabase error]:', err.message);
    }
  }

  // Also check dynamically generated tokens in memory store
  try {
    const { getFleet } = await import('./store.js');
    const fleet = await getFleet();
    const dynamicWorker = fleet.find(w => w.token === cleanToken);
    if (dynamicWorker) {
      if (!dynamicWorker.is_active) return { valid: false, reason: 'WORKER_INACTIVE' };
      if (dynamicWorker.is_suspended || dynamicWorker.status === 'SUSPENDED') return { valid: false, reason: 'WORKER_SUSPENDED' };
      return {
        valid: true,
        worker: dynamicWorker,
        tokenId: `dyn_${dynamicWorker.id}`
      };
    }
  } catch (e) {}

  return { valid: false, reason: 'TOKEN_NOT_FOUND' };
}
