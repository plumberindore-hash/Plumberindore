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
export function isServiceRoleKeyValid(key, targetUrl = null) {
  const clean = cleanKey(key);
  if (clean.length === 0) return false;
  if (clean.endsWith('...')) return false;
  const lower = clean.toLowerCase();
  if (lower.includes('your_') || lower.includes('change') || lower.includes('placeholder') || lower.includes('demo') || lower.includes('xxxx') || lower.includes('sample')) {
    return false;
  }
  if (targetUrl && clean.includes('.')) {
    try {
      const parts = clean.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.ref) {
          const match = targetUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
          if (match && match[1] && payload.ref !== match[1]) {
            console.warn(`[Supabase Admin] Configured service key belongs to project '${payload.ref}', but target database is '${match[1]}'.`);
            return false;
          }
        }
      }
    } catch (e) {}
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

  const isRealKey = isServiceRoleKeyValid(rawServiceKey, supabaseUrl);

  const fallbackKey = cleanKey(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'sb_publishable_e97-IjaP9kRty5R40M1F5Q_3PGATNBo'
  );

  const activeKey = isRealKey ? cleanKey(rawServiceKey) : fallbackKey;

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
    const { data, error } = await client
      .from('workers')
      .select('count', { count: 'exact', head: true });

    const latencyMs = Date.now() - start;

    if (error) {
      return {
        status: 'DEGRADED',
        reason: 'SCHEMA_DISCREPANCY',
        persistent: false,
        latencyMs
      };
    }

    return {
      status: 'OPERATIONAL',
      reason: 'ALL_SYSTEMS_VERIFIED',
      persistent: true,
      latencyMs
    };
  } catch (err) {
    return {
      status: 'ERROR',
      reason: 'NETWORK_TIMEOUT',
      persistent: false,
      latencyMs: Date.now() - start
    };
  }
}

/**
 * Creates an admin client with custom schema or auth config if needed
 */
export function getCustomAdminClient(options = {}) {
  const supabaseUrl = getNormalizedSupabaseUrl();
  const rawServiceKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SECRET_KEY || 
    process.env.SUPABASE_SERVICE_KEY;

  const isRealKey = isServiceRoleKeyValid(rawServiceKey, supabaseUrl);
  const activeKey = isRealKey ? cleanKey(rawServiceKey) : cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_e97-IjaP9kRty5R40M1F5Q_3PGATNBo');

  if (!supabaseUrl || !activeKey) {
    return null;
  }

  return createClient(supabaseUrl, activeKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    ...options
  });
}
