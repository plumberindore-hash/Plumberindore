import crypto from 'crypto';
import { getAdminClient } from '../supabase/admin.js';
import { calculateSplits } from './money.js';

export function getKolkataDateString(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

export function sanitizeJobForWorker(job) {
  if (!job) return null;
  return {
    id: job.id,
    job_number: job.job_number,
    customer_name: job.customer_name,
    customer_phone: job.customer_phone,
    address: job.address,
    locality: job.locality,
    issue: job.issue,
    service_category: job.service_category,
    status: job.status,
    total_paise: job.total_paise,
    commission_paise: job.commission_paise,
    worker_share_paise: job.worker_share_paise,
    payment_method: job.payment_method,
    payment_status: job.payment_status,
    start_otp: job.start_otp,
    end_otp: job.end_otp,
    created_at: job.created_at,
    assigned_at: job.assigned_at,
    started_at: job.started_at,
    completed_at: job.completed_at
  };
}

export async function getPlatformSettings() {
  const supabase = getAdminClient();
  if (!supabase) return { commission_percent: 10, minimum_worker_wallet_balance_paise: 50000 };
  try {
    const { data } = await supabase.from('settings').select('*');
    const settings = {};
    (data || []).forEach(row => {
      let val = row.value;
      if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch (e) {}
      }
      settings[row.key] = val;
    });
    return {
      commission_percent: Number(settings.commission_percent || 10),
      minimum_worker_wallet_balance_paise: Number(settings.minimum_worker_wallet_balance_paise || 50000),
      ...settings
    };
  } catch (e) {
    return { commission_percent: 10, minimum_worker_wallet_balance_paise: 50000 };
  }
}

export async function getFleet(filters = {}) {
  const supabase = getAdminClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from('workers')
      .select('*, tokens:worker_tokens(token, is_active, revoked_at), presence:worker_presence(status, last_heartbeat)')
      .order('wallet_balance_paise', { ascending: true });

    if (filters.locality && filters.locality !== 'All Areas') {
      query = query.ilike('locality', `%${filters.locality}%`);
    }
    if (filters.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(w => {
      const activeToken = w.tokens?.find(t => t.is_active && !t.revoked_at)?.token || w.tokens?.[0]?.token;
      return {
        ...w,
        token: activeToken || `${(w.name || 'worker').toLowerCase().replace(/[^a-z0-9]/g, '')}_${(w.phone || '9999').slice(-4)}`
      };
    });
  } catch (err) {
    console.error('Error fetching fleet from Supabase:', err.message);
    return [];
  }
}

export async function getTodaysHisab() {
  const supabase = getAdminClient();
  if (!supabase) {
    return { total_jobs: 0, gross_revenue_paise: 0, commission_paise: 0, worker_share_paise: 0, cash_collected_paise: 0, upi_collected_paise: 0 };
  }
  try {
    const todayKolkata = getKolkataDateString();
    const { data: jobs, error } = await supabase.from('jobs').select('*');
    if (error) throw error;

    const allJobs = jobs || [];
    const grossPaise = allJobs.reduce((sum, j) => sum + Number(j.total_paise || 0), 0);
    const commissionPaise = allJobs.reduce((sum, j) => sum + Number(j.commission_paise || calculateSplits(j.total_paise, 10).commissionPaise), 0);
    const workerSharePaise = grossPaise - commissionPaise;
    const cashPaise = allJobs.filter(j => (j.payment_method || '').toUpperCase().includes('CASH')).reduce((sum, j) => sum + Number(j.total_paise || 0), 0);
    const upiPaise = allJobs.filter(j => (j.payment_method || '').toUpperCase().includes('UPI')).reduce((sum, j) => sum + Number(j.total_paise || 0), 0);

    return {
      total_jobs: allJobs.length,
      gross_revenue_paise: grossPaise,
      commission_paise: commissionPaise,
      worker_share_paise: workerSharePaise,
      cash_collected_paise: cashPaise,
      upi_collected_paise: upiPaise
    };
  } catch (err) {
    console.error('Error calculating hisab from Supabase:', err.message);
    return { total_jobs: 0, gross_revenue_paise: 0, commission_paise: 0, worker_share_paise: 0, cash_collected_paise: 0, upi_collected_paise: 0 };
  }
}

export async function getJobs(filters = {}) {
  const supabase = getAdminClient();
  if (!supabase) return [];
  try {
    let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (filters.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }
    if (filters.worker_id) {
      query = query.eq('assigned_worker_id', filters.worker_id);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching jobs from Supabase:', err.message);
    return [];
  }
}

export async function getWorkerActiveJob(workerId) {
  const supabase = getAdminClient();
  if (!supabase || !workerId) return null;
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('assigned_worker_id', workerId)
      .not('status', 'in', '("COMPLETED","CANCELLED")')
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error('Error fetching worker active job:', err.message);
    return null;
  }
}

export async function getWorkerById(workerId) {
  const supabase = getAdminClient();
  if (!supabase || !workerId) return null;
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*, tokens:worker_tokens(token, is_active, revoked_at)')
      .eq('id', workerId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (err) {
    return null;
  }
}

export async function getJobById(jobId) {
  const supabase = getAdminClient();
  if (!supabase || !jobId) return null;
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (err) {
    return null;
  }
}

export async function globalAdminSearch(query = '') {
  const clean = (query || '').trim().toLowerCase();
  if (!clean) return { results: { workers: [], jobs: [], customers: [] } };

  const supabase = getAdminClient();
  if (!supabase) return { results: { workers: [], jobs: [], customers: [] } };

  try {
    const [workersRes, jobsRes] = await Promise.all([
      supabase.from('workers').select('id, name, phone, locality, status, service_category').or(`name.ilike.%${clean}%,phone.ilike.%${clean}%`).limit(5),
      supabase.from('jobs').select('id, job_number, customer_name, customer_phone, locality, issue, status, total_paise').or(`job_number.ilike.%${clean}%,customer_name.ilike.%${clean}%,customer_phone.ilike.%${clean}%`).limit(5)
    ]);

    const workers = workersRes.data || [];
    const jobs = jobsRes.data || [];
    const customers = jobs.map(j => ({ customer_name: j.customer_name, customer_phone: j.customer_phone }));

    return {
      results: {
        workers,
        jobs,
        customers
      }
    };
  } catch (err) {
    return { results: { workers: [], jobs: [], customers: [] } };
  }
}

export async function rechargeWorkerWallet(workerId, amountRupees, reason = 'Admin Top-Up', actor = 'Owner') {
  const supabase = getAdminClient();
  if (!supabase) throw new Error('Database unconfigured');
  const amountPaise = Math.round(Number(amountRupees || 0) * 100);

  const { data, error } = await supabase.rpc('recharge_worker_wallet', {
    p_worker_id: workerId,
    p_amount_paise: amountPaise,
    p_description: reason,
    p_actor: actor
  });

  if (error) throw error;
  return { success: true, balance_paise: data };
}

export async function getWalletTransactions(workerId = null) {
  const supabase = getAdminClient();
  if (!supabase) return [];
  try {
    let query = supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false }).limit(50);
    if (workerId) query = query.eq('worker_id', workerId);
    const { data } = await query;
    return data || [];
  } catch (e) {
    return [];
  }
}
