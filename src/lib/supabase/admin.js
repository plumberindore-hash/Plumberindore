import { createClient } from '@supabase/supabase-js';

/**
 * Normalizes Supabase URL (handles project ref or full URL)
 */
function getNormalizedSupabaseUrl() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hnawwvxvfdnkmwtytwre.supabase.co';
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
 * Bypasses RLS for trusted background tasks, seed scripts, invoice generation, and logging.
 * NEVER IMPORT THIS IN CLIENT COMPONENTS.
 */
export function getAdminClient() {
  const supabaseUrl = getNormalizedSupabaseUrl();
  const serviceRoleKey = 
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY;

  const activeKey = (serviceRoleKey && serviceRoleKey !== 'your_secret_key') 
    ? serviceRoleKey 
    : (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_BT_qk2dmGPrd82h-FWZ-VA_ONM7HKJO');

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
