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
    return { valid: false, error: 'Token is required' };
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return { valid: false, error: 'Database unconfigured' };
  }

  try {
    const { data: tokenRow, error: tokenErr } = await supabase
      .from('worker_tokens')
      .select('*, worker:workers(*)')
      .eq('token', token)
      .eq('revoked', false)
      .maybeSingle();

    if (tokenErr || !tokenRow) {
      return { valid: false, error: 'Invalid or revoked token' };
    }

    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
      return { valid: false, error: 'Token expired' };
    }

    const worker = tokenRow.worker;
    if (!worker || worker.status === 'SUSPENDED') {
      return { valid: false, error: 'Worker account is suspended' };
    }

    return {
      valid: true,
      worker,
      token: tokenRow
    };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
