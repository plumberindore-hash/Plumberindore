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
    // Supabase auth error or unconfigured
  }

  return null;
}

/**
 * Creates an admin session cookie payload (base64 encoded JSON)
 */
export function createAdminSessionPayload(user) {
  const session = {
    id: user.id || 'owner_root',
    email: user.email || 'support@plumberindore.in',
    name: user.name || 'Business Owner',
    role: user.role || 'OWNER',
    issuedAt: Date.now()
  };
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

/**
 * Validates a worker magic link or permanent token for the mobile partner console.
 * Checks against Supabase `worker_tokens` joined with `workers` and fallback mock data.
 */
export async function validateWorkerToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'INVALID_TOKEN_FORMAT' };
  }

  const cleanToken = token.trim();
  const supabase = getAdminClient();

  if (supabase) {
    try {
      // Query token record joined with worker
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

        if (worker.status === 'SUSPENDED') {
          return { valid: false, reason: 'WORKER_SUSPENDED' };
        }

        // Token is valid! Update last used timestamp non-blockingly
        supabase
          .from('worker_tokens')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', data.id)
          .then(() => {})
          .catch(() => {});

        return {
          valid: true,
          worker,
          tokenId: data.id
        };
      }
    } catch (e) {
      // Supabase unavailable or table missing, fallback to mock store
    }
  }

  // Direct token check if token matches worker token pattern in mock data
  const isFallbackDirect = cleanToken.includes('_') || ['ansh_5454', 'ajay_9141', 'pankaj_4329', 'saurabh_9526', 'saifee_7487', 'vansh_8490', 'ramiz_9827', 'aman_8182', 'arjun_2889', 'shubham_5616', 'ramesh_4821', 'suresh_8821', 'rajesh_7654'].includes(cleanToken);

  if (isFallbackDirect) {
    const fallbackTokens = {
      'ansh_5454': {
        id: '11111111-1111-1111-1111-111111111125',
        name: 'Ansh Patidar',
        phone: '+91 93435 05454',
        locality: 'All over Indore',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.99,
        today_jobs_count: 0,
        total_jobs_count: 520,
        is_active: true
      },
      'anshpatidar_5054': {
        id: '11111111-1111-1111-1111-111111111125',
        name: 'Ansh Patidar',
        phone: '+91 93435 05454',
        locality: 'All over Indore',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.99,
        today_jobs_count: 0,
        total_jobs_count: 520,
        is_active: true
      },
      'ajay_9141': {
        id: '11111111-1111-1111-1111-111111111101',
        name: 'Ajay Mahajan',
        phone: '+91 84595 59141',
        locality: 'Rau / Bhawarkua',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.96,
        today_jobs_count: 0,
        total_jobs_count: 610,
        is_active: true
      },
      'ajaymahajan_5591': {
        id: '11111111-1111-1111-1111-111111111101',
        name: 'Ajay Mahajan',
        phone: '+91 84595 59141',
        locality: 'Rau / Bhawarkua',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.96,
        today_jobs_count: 0,
        total_jobs_count: 610,
        is_active: true
      },
      'pankaj_4329': {
        id: '11111111-1111-1111-1111-111111111102',
        name: 'Pankaj Sharma',
        phone: '+91 98267 43299',
        locality: 'Bicholi Mardana',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.94,
        today_jobs_count: 0,
        total_jobs_count: 390,
        is_active: true
      },
      'pankajsharma_7432': {
        id: '11111111-1111-1111-1111-111111111102',
        name: 'Pankaj Sharma',
        phone: '+91 98267 43299',
        locality: 'Bicholi Mardana',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.94,
        today_jobs_count: 0,
        total_jobs_count: 390,
        is_active: true
      },
      'saurabh_9526': {
        id: '11111111-1111-1111-1111-111111111103',
        name: 'Saurabh Electrician',
        phone: '+91 78697 09526',
        locality: 'Vijay Nagar',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.98,
        today_jobs_count: 0,
        total_jobs_count: 420,
        is_active: true
      },
      'saurabhelectrician_7095': {
        id: '11111111-1111-1111-1111-111111111103',
        name: 'Saurabh Electrician',
        phone: '+91 78697 09526',
        locality: 'Vijay Nagar',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.98,
        today_jobs_count: 0,
        total_jobs_count: 420,
        is_active: true
      },
      'saifee_7487': {
        id: '11111111-1111-1111-1111-111111111104',
        name: 'Saifee Khozema',
        phone: '+91 98267 27487',
        locality: 'Khatiwala Tank',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.97,
        today_jobs_count: 0,
        total_jobs_count: 380,
        is_active: true
      },
      'saifeekhozema_7274': {
        id: '11111111-1111-1111-1111-111111111104',
        name: 'Saifee Khozema',
        phone: '+91 98267 27487',
        locality: 'Khatiwala Tank',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.97,
        today_jobs_count: 0,
        total_jobs_count: 380,
        is_active: true
      },
      'vansh_8490': {
        id: '11111111-1111-1111-1111-111111111105',
        name: 'Vansh Budhlani',
        phone: '+91 95898 18490',
        locality: 'Sudama Nagar',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.96,
        today_jobs_count: 0,
        total_jobs_count: 340,
        is_active: true
      },
      'vanshbudhlani_8184': {
        id: '11111111-1111-1111-1111-111111111105',
        name: 'Vansh Budhlani',
        phone: '+91 95898 18490',
        locality: 'Sudama Nagar',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.96,
        today_jobs_count: 0,
        total_jobs_count: 340,
        is_active: true
      },
      'ramiz_9827': {
        id: '11111111-1111-1111-1111-111111111106',
        name: 'Ramiz',
        phone: '+91 92299 59827',
        locality: 'Annapurna',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.96,
        today_jobs_count: 0,
        total_jobs_count: 320,
        is_active: true
      },
      'ramiz_9598': {
        id: '11111111-1111-1111-1111-111111111106',
        name: 'Ramiz',
        phone: '+91 92299 59827',
        locality: 'Annapurna',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.96,
        today_jobs_count: 0,
        total_jobs_count: 320,
        is_active: true
      },
      'aman_8182': {
        id: '11111111-1111-1111-1111-111111111107',
        name: 'Aman Meena',
        phone: '+91 70895 98182',
        locality: 'Indore',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.97,
        today_jobs_count: 0,
        total_jobs_count: 450,
        is_active: true
      },
      'amanmeena_5981': {
        id: '11111111-1111-1111-1111-111111111107',
        name: 'Aman Meena',
        phone: '+91 70895 98182',
        locality: 'Indore',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.97,
        today_jobs_count: 0,
        total_jobs_count: 450,
        is_active: true
      },
      'arjun_2889': {
        id: '11111111-1111-1111-1111-111111111108',
        name: 'Arjun Solanki',
        phone: '+91 97536 28898',
        locality: 'Vijay Nagar / All over Indore',
        trade: 'Chimney & Gas Stove Service',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.97,
        today_jobs_count: 0,
        total_jobs_count: 310,
        is_active: true
      },
      'arjonsolanki_2889': {
        id: '11111111-1111-1111-1111-111111111108',
        name: 'Arjun Solanki',
        phone: '+91 97536 28898',
        locality: 'Vijay Nagar / All over Indore',
        trade: 'Chimney & Gas Stove Service',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.97,
        today_jobs_count: 0,
        total_jobs_count: 310,
        is_active: true
      },
      'shubham_5616': {
        id: '11111111-1111-1111-1111-111111111109',
        name: 'Shubham Parmar',
        phone: '+91 70890 05616',
        locality: 'Vijay Nagar / Scheme 136',
        trade: 'Electrician',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.96,
        today_jobs_count: 0,
        total_jobs_count: 280,
        is_active: true
      },
      'shubhamparmar_5616': {
        id: '11111111-1111-1111-1111-111111111109',
        name: 'Shubham Parmar',
        phone: '+91 70890 05616',
        locality: 'Vijay Nagar / Scheme 136',
        trade: 'Electrician',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.96,
        today_jobs_count: 0,
        total_jobs_count: 280,
        is_active: true
      }
    };

    if (fallbackTokens[cleanToken]) {
      return {
        valid: true,
        worker: fallbackTokens[cleanToken],
        tokenId: `fallback_${cleanToken}`
      };
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
