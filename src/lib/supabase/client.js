import { createBrowserClient } from '@supabase/ssr';

/**
 * Normalizes Supabase URL (handles project ref or full URL)
 */
function getNormalizedSupabaseUrl() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rxbrkbnubionfsyswohe.supabase.co';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  if (!url.includes('.')) {
    url = `${url}.supabase.co`;
  }
  return url;
}

/**
 * Creates a browser-side Supabase client using public environment variables.
 * Safe to be executed in React Client Components.
 */
export function createClient() {
  const supabaseUrl = getNormalizedSupabaseUrl();
  const supabaseKey = 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_e97-IjaP9kRty5R40M1F5Q_3PGATNBo';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
