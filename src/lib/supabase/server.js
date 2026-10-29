import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers.js';

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
 * Creates a server-side Supabase client for Server Components, Server Actions, and API Route Handlers.
 * Automatically synchronizes cookies for authenticated sessions.
 */
export function createClientServer() {
  const cookieStore = cookies();
  const supabaseUrl = getNormalizedSupabaseUrl();
  const supabaseKey = 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_e97-IjaP9kRty5R40M1F5Q_3PGATNBo';

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handled during Server Component rendering
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handled during Server Component rendering
          }
        },
      },
    }
  );
}
