import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getNormalizedSupabaseUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://rxbrkbnubionfsyswohe.supabase.co';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  if (!url.includes('.')) {
    url = `${url}.supabase.co`;
  }
  return url;
}

/**
 * Creates a server-only Supabase admin client using the service role / secret key.
 * Bypasses RLS for trusted background tasks, atomic RPCs, seed scripts, and logging.
 * 
 * STRICT SECURITY: NEVER IMPORT THIS IN CLIENT COMPONENTS OR RUN IN THE BROWSER.
 * EXECUTING IN BROWSER CODE THROWS AN EXPLICIT RUNTIME ERROR.
 */
export function getAdminClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error(
      'SECURITY VIOLATION: SUPABASE_SERVICE_ROLE_KEY and getAdminClient can ONLY be executed server-side. Do not import in client components.'
    );
  }

  const supabaseUrl = getNormalizedSupabaseUrl();
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  const isMismatchedJwt = (key: string, targetUrl: string) => {
    if (key.includes('.')) {
      try {
        const parts = key.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          const match = targetUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
          if (payload.ref && match && match[1] && payload.ref !== match[1]) {
            return true;
          }
        }
      } catch (e) {}
    }
    return false;
  };

  const isRealKey =
    serviceRoleKey &&
    serviceRoleKey !== 'your_secret_key' &&
    !isMismatchedJwt(serviceRoleKey, supabaseUrl);

  const activeKey =
    isRealKey
      ? serviceRoleKey
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        'sb_publishable_e97-IjaP9kRty5R40M1F5Q_3PGATNBo';

  if (!supabaseUrl || !activeKey) {
    return null;
  }

  return createClient(supabaseUrl, activeKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export default getAdminClient;
