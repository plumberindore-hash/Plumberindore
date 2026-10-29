import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

function getNormalizedSupabaseUrl(): string {
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
export function createClientServer(): SupabaseClient {
  const cookieStore = cookies();
  const supabaseUrl = getNormalizedSupabaseUrl();
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_e97-IjaP9kRty5R40M1F5Q_3PGATNBo';

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Handled during Server Component rendering
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Handled during Server Component rendering
        }
      },
    },
  });
}

export default createClientServer;
