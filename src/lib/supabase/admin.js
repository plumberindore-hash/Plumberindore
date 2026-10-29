import { createClient } from '@supabase/supabase-js';

/**
 * Normalizes Supabase URL (handles project ref or full URL)
 */
function getNormalizedSupabaseUrl() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://rxbrkbnubionfsyswohe.supabase.co';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  if (!url.includes('.')) {
    url = `${url}.supabase.co`;
  }
  return url;
}

/**
 * Sanitizes an API key string by removing accidental surrounding quotes and whitespace.
 */
function cleanKey(key) {
  if (!key || typeof key !== 'string') return '';
  let clean = key.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }
  return clean;
}

/**
 * Validates whether a Supabase Service Role Key is a real production secret
 * rather than a placeholder string.
 */
export function isServiceRoleKeyValid(key) {
  const clean = cleanKey(key);
  if (clean.length === 0) return false;
  if (clean.endsWith('...')) return false;
  const lower = clean.toLowerCase();
  if (lower.includes('your_') || lower.includes('change') || lower.includes('placeholder') || lower.includes('demo') || lower.includes('xxxx') || lower.includes('sample')) {
    return false;
  }
  return true;
}

/**
 * Creates a server-only Supabase admin client using the service role / secret key.
 * Bypasses RLS for trusted background tasks, atomic RPCs, seed scripts, and logging.
 * NEVER IMPORT THIS IN CLIENT COMPONENTS.
 */
export function getAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('SECURITY VIOLATION: SUPABASE_SERVICE_ROLE_KEY and getAdminClient can ONLY be executed server-side.');
  }

  const supabaseUrl = getNormalizedSupabaseUrl();
  const rawServiceKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SECRET_KEY || 
    process.env.SUPABASE_SERVICE_KEY;

  const isRealKey = isServiceRoleKeyValid(rawServiceKey);

  const activeKey = isRealKey 
    ? cleanKey(rawServiceKey) 
    : (process.env.NODE_ENV === 'production' 
        ? null 
        : cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY));

  if (!supabaseUrl || !activeKey) {
    return null;
  }

  return createClient(supabaseUrl, activeKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Executes an active database readiness check that safely tests connectivity
 * and verifies essential schema availability without exposing internal credentials or SQL errors.
 */
export async function checkDatabaseReadiness() {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowDev = process.env.ALLOW_STANDALONE_DEV === 'true';
  const rawServiceKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SECRET_KEY || 
    process.env.SUPABASE_SERVICE_KEY;

  if (!isServiceRoleKeyValid(rawServiceKey)) {
    if (isProduction && !allowDev) {
      return {
        status: 'NOT_READY',
        reason: 'CREDENTIAL_UNCONFIGURED',
        persistent: false,
        latencyMs: 0
      };
    }
    return {
      status: 'STANDALONE_DEV_MODE',
      reason: 'LOCAL_DEV_FALLBACK',
      persistent: false,
      latencyMs: 0
    };
  }

  const client = getAdminClient();
  if (!client) {
    return {
      status: 'NOT_READY',
      reason: 'CLIENT_INITIALIZATION_FAILED',
      persistent: false,
      latencyMs: 0
    };
  }

  const start = Date.now();
  try {
    const { error } = await client.from('settings').select('key').limit(1);
    const latencyMs = Date.now() - start;

    if (error) {
      const msg = (error.message || '').toLowerCase();
      const code = String(error.code || '');

      // Server-side diagnostic log (never prints keys, URLs, tokens, or customer data)
      const sanitizedCode = error.code ? String(error.code).replace(/[^a-zA-Z0-9_-]/g, '') : 'NO_CODE';
      const sanitizedMsg = typeof error.message === 'string' ? error.message.slice(0, 100) : 'Query error';
      console.error(`[checkDatabaseReadiness] Database query failed: code=${sanitizedCode}, msg=${sanitizedMsg}, latency=${latencyMs}ms`);

      // 1. Missing table or schema cache issue
      if (
        code === 'PGRST205' ||
        code === '42P01' ||
        msg.includes('schema cache') ||
        msg.includes('could not find') ||
        msg.includes('does not exist') ||
        msg.includes('relation')
      ) {
        return {
          status: 'NOT_READY',
          reason: 'SCHEMA_NOT_FOUND',
          persistent: false,
          latencyMs
        };
      }

      // 2. Authentication or invalid key issue
      if (
        code === 'PGRST301' ||
        code === '401' ||
        msg.includes('invalid api key') ||
        msg.includes('jwt') ||
        msg.includes('apikey') ||
        msg.includes('unauthorized') ||
        msg.includes('signature')
      ) {
        return {
          status: 'NOT_READY',
          reason: 'AUTH_FAILED_SERVICE_ROLE_KEY',
          persistent: false,
          latencyMs
        };
      }

      // 3. Permission denied (Postgres 42501)
      if (code === '42501' || msg.includes('permission denied')) {
        return {
          status: 'DEGRADED',
          reason: 'PERMISSION_DENIED',
          persistent: false,
          latencyMs
        };
      }

      // 4. Other query errors
      return {
        status: 'DEGRADED',
        reason: 'DATABASE_QUERY_ERROR',
        persistent: false,
        latencyMs
      };
    }

    return {
      status: 'READY',
      reason: 'CONNECTED',
      persistent: true,
      latencyMs
    };
  } catch (err) {
    return {
      status: 'NOT_READY',
      reason: 'CONNECTION_FAILED',
      persistent: false,
      latencyMs: Date.now() - start
    };
  }
}

export default getAdminClient;
