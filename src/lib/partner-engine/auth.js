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
    // Supabase auth check failed
  }

  // 3. Check for Admin Secret in headers (for API / background tasks)
  try {
    const { headers } = await import('next/headers');
    const headerList = headers();
    const adminSecret = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY;
    const headerKey = headerList.get('x-admin-key');
    const authHeader = headerList.get('authorization');

    if (adminSecret && (headerKey === adminSecret || (authHeader && authHeader === `Bearer ${adminSecret}`))) {
      return {
        user: { id: 'admin-header', email: 'admin@plumberindore.in', name: 'Authorized Admin', role: 'OWNER' },
        role: 'OWNER',
        isOwner: true
      };
    }
  } catch (e) {
    // headers check skipped
  }

  // Fallback for local inspection in development
  if (process.env.NODE_ENV === 'development') {
    return {
      user: { id: 'dev-owner', email: 'owner@plumberindore.in', name: 'Dev Operations Owner', role: 'OWNER' },
      role: 'OWNER',
      isOwner: true
    };
  }

  return null;
}

/**
 * Validates a Worker's token for mobile partner console access
 */
export async function validateWorkerToken(tokenString) {
  if (!tokenString || typeof tokenString !== 'string') {
    return { valid: false, reason: 'MISSING_TOKEN' };
  }

  const cleanToken = tokenString.trim();
  const supabase = getAdminClient();

  if (supabase) {
    try {
      // Query worker_tokens joined with workers
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

  // Verified Fleet Fallback Tokens (Active in production & development when DB tokens are not yet provisioned)
  const fallbackTokens = {
      'ramesh_4821': {
        id: '11111111-1111-1111-1111-111111111191',
        name: 'Ramesh Kumar',
        phone: '+91 98765 43210',
        locality: 'Vijay Nagar',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 48500,
        rating: 4.96,
        today_jobs_count: 2,
        total_jobs_count: 142,
        is_active: true
      },
      'suresh_8821': {
        id: '11111111-1111-1111-1111-111111111192',
        name: 'Suresh Patel',
        phone: '+91 84595 59141',
        locality: 'Palasia',
        status: 'BUSY',
        wallet_balance_paise: 8200,
        rating: 4.88,
        today_jobs_count: 1,
        total_jobs_count: 98,
        is_active: true
      },
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
      'ansh_0545': {
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
      },
      'suraj_7485': {
        id: '11111111-1111-1111-1111-111111111110',
        name: 'Suraj Kevat',
        phone: '+91 99776 37485',
        locality: 'Indore / Dewas / Ujjain',
        trade: 'Plumbing',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.95,
        today_jobs_count: 0,
        total_jobs_count: 350,
        is_active: true
      },
      'surajkevat_7485': {
        id: '11111111-1111-1111-1111-111111111110',
        name: 'Suraj Kevat',
        phone: '+91 99776 37485',
        locality: 'Indore / Dewas / Ujjain',
        trade: 'Plumbing',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.95,
        today_jobs_count: 0,
        total_jobs_count: 350,
        is_active: true
      },
      'shekhar_8634': {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Shekhar Parmar',
        phone: '+91 99933 28634',
        locality: 'Bijalpur / Rajendra Nagar / Khandwa Road',
        trade: 'Plumbing',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.96,
        today_jobs_count: 0,
        total_jobs_count: 290,
        is_active: true
      },
      'shekharparmar_8634': {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Shekhar Parmar',
        phone: '+91 99933 28634',
        locality: 'Bijalpur / Rajendra Nagar / Khandwa Road',
        trade: 'Plumbing',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.96,
        today_jobs_count: 0,
        total_jobs_count: 290,
        is_active: true
      },
      'yogesh_8230': {
        id: '11111111-1111-1111-1111-111111111112',
        name: 'Yogesh Mahajan',
        phone: '+91 76202 88230',
        locality: 'Bholaram Ustad Marg / Bhawarkua / Palasia / Vijay Nagar',
        trade: 'Plumbing',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.97,
        today_jobs_count: 0,
        total_jobs_count: 360,
        is_active: true
      },
      'yogeshmahajan_8230': {
        id: '11111111-1111-1111-1111-111111111112',
        name: 'Yogesh Mahajan',
        phone: '+91 76202 88230',
        locality: 'Bholaram Ustad Marg / Bhawarkua / Palasia / Vijay Nagar',
        trade: 'Plumbing',
        status: 'ONLINE_FREE',
        wallet_balance_paise: 50000,
        rating: 4.97,
        today_jobs_count: 0,
        total_jobs_count: 360,
        is_active: true
      }
    };

    const matchedWorker = fallbackTokens[cleanToken] || fallbackTokens[cleanToken.toLowerCase()];
    if (matchedWorker) {
      return {
        valid: true,
        worker: matchedWorker,
        tokenId: `fallback_${cleanToken.toLowerCase()}`
      };
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