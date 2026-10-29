import crypto from 'crypto';
import { getAdminClient } from '../supabase/admin.js';
import { calculateSplits, calculateJobTotal } from './money.js';
import { getPaymentProvider } from './payments/provider.js';
import {
  enqueueNotification,
  createCustomerTrackingToken,
  formatCustomerFacingTechnicianName,
  runAutomationChecks,
  generateDailyReport,
  getAllNotificationJobs,
  getAllNotificationDeliveries,
  getWorkerNotifications as getWorkerNotificationsHelper,
  markNotificationRead as markNotificationReadHelper
} from './notifications/queue.js';

export const SERVICE_AREAS = [
  'Vijay Nagar', 'Palasia', 'Bhanwarkuan', 'Rau', 'Scheme No. 54',
  'Scheme No. 78', 'Sudama Nagar', 'Annapurna', 'Bengali Square',
  'Geeta Bhawan', 'Mahalaxmi Nagar', 'Rajendra Nagar'
];

export const SERVICE_CATALOG = [
  { id: 'srv-1', name: 'Tap Leakage Repair & Washer Replacement', category: 'Taps & Mixers', pricePaise: 14900, isPart: false },
  { id: 'srv-2', name: 'Wall Mixer Repair & Diagnostics', category: 'Taps & Mixers', pricePaise: 24900, isPart: false },
  { id: 'srv-3', name: 'New Tap / Faucet Installation', category: 'Taps & Mixers', pricePaise: 19900, isPart: false },
  { id: 'srv-4', name: 'Ceramic Brass Cartridge (Replacement)', category: 'Spare Parts', pricePaise: 19900, isPart: true },
  { id: 'srv-5', name: 'Heavy Duty SS Flexible Hose (24-inch)', category: 'Spare Parts', pricePaise: 14900, isPart: true },
  { id: 'srv-6', name: 'Flush Tank / Cistern Internal Overhaul', category: 'Toilets & Sanitary', pricePaise: 34900, isPart: false },
  { id: 'srv-7', name: 'Flush Valve Syphon Replacement Set', category: 'Spare Parts', pricePaise: 29900, isPart: true },
  { id: 'srv-8', name: 'Wash Basin Waste Coupling & Trap Repair', category: 'Basins & Sinks', pricePaise: 24900, isPart: false },
  { id: 'srv-9', name: 'Drain Blockage Removal (Mechanical Snaking)', category: 'Drainage', pricePaise: 39900, isPart: false },
  { id: 'srv-10', name: 'Concealed Pipeline Leakage Detection', category: 'Pipelines', pricePaise: 49900, isPart: false }
];

export function generateSecureOtp() {
  return String(crypto.randomInt(1000, 10000));
}

export function timingSafeOtpMatch(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const cleanA = a.trim();
  const cleanB = b.trim();
  if (cleanA.length === 0 || cleanB.length === 0) return false;
  if (cleanA.length !== cleanB.length) return false;
  const bufA = Buffer.from(cleanA);
  const bufB = Buffer.from(cleanB);
  return crypto.timingSafeEqual(bufA, bufB);
}

export function getKolkataDateString(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

export function isProductionPersistenceEnforced() {
  return process.env.NODE_ENV === 'production' && process.env.ALLOW_STANDALONE_DEV !== 'true';
}

export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 12 && digits.startsWith('91')) {
    const raw = digits.slice(2);
    return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
  }
  return String(phone).trim();
}

export function validatePhoneNumber(phone) {
  if (!phone) return { valid: false, message: 'Phone number is required.' };
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10 || (digits.length === 12 && digits.startsWith('91'))) {
    return { valid: true };
  }
  return { valid: false, message: 'Please enter a valid 10-digit mobile number.' };
}

export function sanitizeJobForWorker(job) {
  if (!job) return null;
  const sanitized = { ...job };
  delete sanitized.start_otp;
  delete sanitized.end_otp;
  return sanitized;
}

// In-memory fallbacks
let mockWorkers = [
  { id: '11111111-1111-1111-1111-111111111125', name: 'Ansh Patidar', phone: '+91 93435 05454', locality: 'All over Indore', status: 'ONLINE_FREE', wallet_balance_paise: 50000, rating: 4.99, today_jobs_count: 0, total_jobs_count: 520, is_active: true, last_seen_at: new Date().toISOString(), token: 'ansh_5454' },
  { id: '11111111-1111-1111-1111-111111111101', name: 'Ajay Mahajan', phone: '+91 84595 59141', locality: 'Rau / Bhawarkua', status: 'ONLINE_FREE', wallet_balance_paise: 50000, rating: 4.96, today_jobs_count: 0, total_jobs_count: 610, is_active: true, last_seen_at: new Date().toISOString(), token: 'ajay_9141' },
  { id: '11111111-1111-1111-1111-111111111102', name: 'Pankaj Sharma', phone: '+91 98267 43299', locality: 'Bicholi Mardana', status: 'ONLINE_FREE', wallet_balance_paise: 50000, rating: 4.94, today_jobs_count: 0, total_jobs_count: 390, is_active: true, last_seen_at: new Date().toISOString(), token: 'pankaj_4329' },
  { id: '11111111-1111-1111-1111-111111111103', name: 'Saurabh Electrician', phone: '+91 78697 09526', locality: 'Vijay Nagar', status: 'ONLINE_FREE', wallet_balance_paise: 50000, rating: 4.98, today_jobs_count: 0, total_jobs_count: 420, is_active: true, last_seen_at: new Date().toISOString(), token: 'saurabh_9526' },
  { id: '11111111-1111-1111-1111-111111111104', name: 'Saifee Khozema', phone: '+91 98267 27487', locality: 'Khatiwala Tank', status: 'ONLINE_FREE', wallet_balance_paise: 50000, rating: 4.97, today_jobs_count: 0, total_jobs_count: 380, is_active: true, last_seen_at: new Date().toISOString(), token: 'saifee_7487' },
  { id: '11111111-1111-1111-1111-111111111105', name: 'Vansh Budhlani', phone: '+91 95898 18490', locality: 'Sudama Nagar', status: 'ONLINE_FREE', wallet_balance_paise: 50000, rating: 4.96, today_jobs_count: 0, total_jobs_count: 340, is_active: true, last_seen_at: new Date().toISOString(), token: 'vansh_8490' },
  { id: '11111111-1111-1111-1111-111111111106', name: 'Ramiz', phone: '+91 92299 59827', locality: 'Annapurna', status: 'ONLINE_FREE', wallet_balance_paise: 50000, rating: 4.96, today_jobs_count: 0, total_jobs_count: 320, is_active: true, last_seen_at: new Date().toISOString(), token: 'ramiz_9827' },
  { id: '11111111-1111-1111-1111-111111111107', name: 'Aman Meena', phone: '+91 70895 98182', locality: 'Indore', status: 'ONLINE_FREE', wallet_balance_paise: 50000, rating: 4.97, today_jobs_count: 0, total_jobs_count: 450, is_active: true, last_seen_at: new Date().toISOString(), token: 'aman_8182' },
  { id: '11111111-1111-1111-1111-111111111191', name: 'Ramesh Kumar', phone: '+91 98765 43210', locality: 'Vijay Nagar', status: 'ONLINE_FREE', wallet_balance_paise: 48500, rating: 4.96, today_jobs_count: 2, total_jobs_count: 142, is_active: true, last_seen_at: new Date().toISOString(), token: 'ramesh_4821' },
  { id: '11111111-1111-1111-1111-111111111192', name: 'Suresh Patel', phone: '+91 84595 59141', locality: 'Palasia', status: 'BUSY', wallet_balance_paise: 8200, rating: 4.88, today_jobs_count: 1, total_jobs_count: 98, is_active: true, last_seen_at: new Date().toISOString(), token: 'suresh_8821' },
  { id: '11111111-1111-1111-1111-111111111193', name: 'Rajesh Yadav', phone: '+91 76543 21098', locality: 'Rau', status: 'OFFLINE', wallet_balance_paise: 21000, rating: 4.75, today_jobs_count: 0, total_jobs_count: 84, is_active: true, last_seen_at: new Date(Date.now() - 3600000).toISOString(), token: 'rajesh_7654' }
];

let mockJobs = [];
let mockPayments = [];
let mockTransactions = [];
let mockSettings = {
  minimum_worker_wallet_balance_paise: 10000,
  platform_commission_percent: 10,
  worker_accept_reminder_minutes: 10,
  job_escalation_minutes: 30,
  customer_payment_reminder_minutes: 15,
  job_stale_minutes: 60,
  notification_retry_limit: 3
};
let otpAttempts = {};
let inFlightSettlements = new Set();
let mockNotifications = [];
let mockAuditLogs = [];
let mockWebhookEvents = [];

export async function getPlatformSettings() {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('settings').select('*');
      if (data && data.length > 0) {
        const s = {};
        data.forEach(row => {
          let v = row.value;
          try { v = JSON.parse(v); } catch (e) {}
          s[row.key] = v;
        });
        return {
          platform_commission_percent: Number(s.commission_percent ?? s.platform_commission_percent ?? 10),
          minimum_worker_wallet_balance_paise: Number(s.minimum_worker_wallet_balance_paise ?? 10000),
          worker_accept_reminder_minutes: Number(s.worker_accept_reminder_minutes ?? 10),
          job_escalation_minutes: Number(s.job_escalation_minutes ?? 30),
          customer_payment_reminder_minutes: Number(s.customer_payment_reminder_minutes ?? 15),
          job_stale_minutes: Number(s.job_stale_minutes ?? 60),
          notification_retry_limit: Number(s.notification_retry_limit ?? 3),
          ...s
        };
      }
    } catch (e) {}
  }
  return { ...mockSettings };
}

export async function updatePlatformSettings(newSettings = {}) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      for (const [key, val] of Object.entries(newSettings)) {
        await supabase.from('settings').upsert({ key, value: JSON.stringify(val), updated_at: new Date().toISOString() });
      }
    } catch (e) {}
  }
  mockSettings = { ...mockSettings, ...newSettings };
  return mockSettings;
}

export async function getFleet(filters = {}) {
  const supabase = getAdminClient();
  if (supabase) {
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
      if (!error && data && data.length > 0) {
        return data.map(w => {
          const activeToken = w.tokens?.find(t => t.is_active && !t.revoked_at)?.token || w.tokens?.[0]?.token;
          return {
            ...w,
            token: activeToken || `${(w.name || 'worker').toLowerCase().replace(/[^a-z0-9]/g, '')}_${(w.phone || '9999').slice(-4)}`
          };
        });
      }
    } catch (e) {}
  }

  let list = [...mockWorkers];
  if (filters.locality && filters.locality !== 'All Areas') {
    list = list.filter(w => (w.locality || '').toLowerCase().includes(filters.locality.toLowerCase()));
  }
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter(w => w.status === filters.status);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(w => (w.name || '').toLowerCase().includes(s) || (w.phone || '').includes(s));
  }
  return list;
}

export async function getDashboardMetrics() {
  const fleet = await getFleet();
  const total = fleet.length;
  const busy = fleet.filter(w => w.status === 'BUSY').length;
  const available = fleet.filter(w => w.status === 'ONLINE_FREE').length;
  const totalWalletPaise = fleet.reduce((sum, w) => sum + Number(w.wallet_balance_paise || 0), 0);
  const lowBalance = fleet.filter(w => Number(w.wallet_balance_paise || 0) < 10000).length;

  return {
    totalTechnicians: total,
    currentlyBusy: busy,
    available,
    totalWalletPaise,
    lowBalanceCount: lowBalance
  };
}

export async function getTodaysHisab() {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data: jobs, error } = await supabase.from('jobs').select('*');
      if (!error && jobs) {
        const grossPaise = jobs.reduce((sum, j) => sum + Number(j.total_paise || 0), 0);
        const commissionPaise = jobs.reduce((sum, j) => sum + Number(j.commission_paise || calculateSplits(j.total_paise, 10).commissionPaise), 0);
        const workerSharePaise = grossPaise - commissionPaise;
        const cashPaise = jobs.filter(j => (j.payment_method || '').toUpperCase().includes('CASH')).reduce((sum, j) => sum + Number(j.total_paise || 0), 0);
        const upiPaise = jobs.filter(j => (j.payment_method || '').toUpperCase().includes('UPI')).reduce((sum, j) => sum + Number(j.total_paise || 0), 0);

        return {
          total_jobs: jobs.length,
          completed_jobs_count: jobs.filter(j => j.status === 'COMPLETED').length,
          gross_revenue_paise: grossPaise,
          commission_paise: commissionPaise,
          worker_share_paise: workerSharePaise,
          cash_collected_paise: cashPaise,
          upi_collected_paise: upiPaise
        };
      }
    } catch (e) {}
  }

  const jobs = mockJobs.filter(j => j.status === 'COMPLETED');
  const gross = jobs.reduce((sum, j) => sum + (j.total_paise || 0), 0);
  const commission = jobs.reduce((sum, j) => sum + (j.commission_paise || 0), 0);
  return {
    total_jobs: jobs.length,
    completed_jobs_count: jobs.length,
    gross_revenue_paise: gross,
    commission_paise: commission,
    worker_share_paise: gross - commission,
    cash_collected_paise: jobs.filter(j => j.payment_method === 'CASH').reduce((sum, j) => sum + (j.total_paise || 0), 0),
    upi_collected_paise: jobs.filter(j => j.payment_method === 'UPI').reduce((sum, j) => sum + (j.total_paise || 0), 0)
  };
}

export async function getJobs(filters = {}) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (filters.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters.worker_id) {
        query = query.eq('assigned_worker_id', filters.worker_id);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }

  let list = [...mockJobs];
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter(j => j.status === filters.status);
  }
  if (filters.worker_id) {
    list = list.filter(j => j.assigned_worker_id === filters.worker_id);
  }
  return list;
}

export async function getJobById(jobId) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle();
      if (!error && data) return data;
    } catch (e) {}
  }
  return mockJobs.find(j => j.id === jobId) || null;
}

export async function getWorkerById(workerId) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*, tokens:worker_tokens(token, is_active, revoked_at)')
        .eq('id', workerId)
        .maybeSingle();
      if (!error && data) return data;
    } catch (e) {}
  }
  return mockWorkers.find(w => w.id === workerId) || null;
}

export async function getWorkerActiveJob(workerId) {
  const supabase = getAdminClient();
  if (supabase && workerId) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_worker_id', workerId)
        .not('status', 'in', '("COMPLETED","CANCELLED")')
        .order('created_at', { ascending: false })
        .maybeSingle();
      if (!error && data) return sanitizeJobForWorker(data);
    } catch (e) {}
  }
  const job = mockJobs.find(j => j.assigned_worker_id === workerId && !['COMPLETED', 'CANCELLED'].includes(j.status));
  return sanitizeJobForWorker(job);
}

export async function dispatchJob(data, actor = 'Owner') {
  const supabase = getAdminClient();
  const jobNumber = `PI-${Math.floor(1000 + Math.random() * 9000)}`;
  const assignedWorkerId = data.preferredWorkerId || data.workerId || null;

  if (assignedWorkerId) {
    const worker = mockWorkers.find(w => w.id === assignedWorkerId);
    if (worker) {
      if (worker.status === 'SUSPENDED' || worker.is_suspended) {
        throw new Error('Cannot assign job to a suspended technician');
      }
      if (Number(worker.wallet_balance_paise || 0) < 10000) {
        throw new Error(`Technician wallet balance (${worker.wallet_balance_paise} paise) is below minimum required threshold (10000 paise)`);
      }
    }
  }

  const newJobId = `job-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  let trackingToken = null;
  let trackingUrl = null;
  try {
    const tokenObj = await createCustomerTrackingToken(newJobId);
    trackingToken = tokenObj?.secureToken || null;
    trackingUrl = tokenObj?.trackingUrl || null;
  } catch (e) {}

  const newJob = {
    id: newJobId,
    job_number: jobNumber,
    customer_name: data.customerName?.trim() || 'Customer',
    customer_phone: normalizePhoneNumber(data.customerPhone),
    customer_whatsapp: data.customerWhatsapp ? normalizePhoneNumber(data.customerWhatsapp) : normalizePhoneNumber(data.customerPhone),
    locality: data.locality || 'Vijay Nagar',
    address: data.address?.trim() || '',
    issue: data.issue?.trim() || 'Plumbing Service',
    service_category: data.serviceCategory || 'Plumber',
    priority: data.priority || 'Normal',
    preferred_time: data.preferredTime || 'Immediate',
    notes: data.notes || '',
    status: assignedWorkerId ? 'ASSIGNED' : 'NEW',
    assigned_worker_id: assignedWorkerId,
    subtotal_paise: 0,
    inspection_fee_paise: 29900,
    waiver_paise: 0,
    total_paise: 29900,
    start_otp: generateSecureOtp(),
    end_otp: generateSecureOtp(),
    tracking_token: trackingToken,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data: dbJob, error } = await supabase.from('jobs').insert(newJob).select().single();
      if (!error && dbJob) {
        if (assignedWorkerId) {
          await supabase.from('workers').update({ status: 'BUSY' }).eq('id', assignedWorkerId).catch(() => null);
          const worker = mockWorkers.find(w => w.id === assignedWorkerId);
          try {
            await enqueueNotification({
              idempotencyKey: `JOB_ASSIGNED:${dbJob.id}:${assignedWorkerId}`,
              jobId: dbJob.id,
              workerId: assignedWorkerId,
              recipientType: 'WORKER',
              recipientPhone: worker?.phone,
              recipientName: worker?.name,
              channel: 'WHATSAPP',
              notificationType: 'JOB_ASSIGNED',
              templateId: 'WORKER_JOB_ASSIGNED',
              variables: {
                workerName: worker?.name || 'Technician',
                jobNumber: dbJob.job_number,
                locality: dbJob.locality,
                issue: dbJob.issue,
                customerName: dbJob.customer_name,
                customerPhone: dbJob.customer_phone,
                address: dbJob.address
              }
            });

            await enqueueNotification({
              idempotencyKey: `CUSTOMER_DISPATCH:${dbJob.id}`,
              jobId: dbJob.id,
              recipientType: 'CUSTOMER',
              recipientPhone: dbJob.customer_phone,
              recipientName: dbJob.customer_name,
              channel: 'WHATSAPP',
              notificationType: 'TECHNICIAN_DISPATCHED',
              templateId: 'CUSTOMER_TECHNICIAN_DISPATCHED',
              variables: {
                customerName: dbJob.customer_name,
                technicianName: formatCustomerFacingTechnicianName(worker?.name),
                technicianPhone: worker?.phone,
                jobNumber: dbJob.job_number,
                trackingLink: `https://plumberindore.in${trackingUrl || '/track/' + dbJob.id}`
              }
            });
          } catch (e) {}
        }
        return { success: true, job: dbJob, message: 'Job dispatched successfully' };
      }
    } catch (e) {}
  }

  if (assignedWorkerId) {
    const w = mockWorkers.find(x => x.id === assignedWorkerId);
    if (w) w.status = 'BUSY';
    try {
      await enqueueNotification({
        idempotencyKey: `JOB_ASSIGNED:${newJob.id}:${assignedWorkerId}`,
        jobId: newJob.id,
        workerId: assignedWorkerId,
        recipientType: 'WORKER',
        recipientPhone: w?.phone,
        recipientName: w?.name,
        channel: 'WHATSAPP',
        notificationType: 'JOB_ASSIGNED',
        templateId: 'WORKER_JOB_ASSIGNED',
        variables: {
          workerName: w?.name || 'Technician',
          jobNumber: newJob.job_number,
          locality: newJob.locality,
          issue: newJob.issue,
          customerName: newJob.customer_name,
          customerPhone: newJob.customer_phone,
          address: newJob.address
        }
      });

      await enqueueNotification({
        idempotencyKey: `CUSTOMER_DISPATCH:${newJob.id}`,
        jobId: newJob.id,
        recipientType: 'CUSTOMER',
        recipientPhone: newJob.customer_phone,
        recipientName: newJob.customer_name,
        channel: 'WHATSAPP',
        notificationType: 'TECHNICIAN_DISPATCHED',
        templateId: 'CUSTOMER_TECHNICIAN_DISPATCHED',
        variables: {
          customerName: newJob.customer_name,
          technicianName: formatCustomerFacingTechnicianName(w?.name),
          technicianPhone: w?.phone,
          jobNumber: newJob.job_number,
          trackingLink: `https://plumberindore.in${trackingUrl || '/track/' + newJob.id}`
        }
      });
    } catch (e) {}
  }
  mockJobs.unshift(newJob);
  return { success: true, job: newJob, message: 'Job dispatched successfully' };
}

export async function startJobWithOtp(jobId, otp, workerId = null) {
  const cleanOtp = String(otp || '').trim();
  const supabase = getAdminClient();
  const nowIso = new Date().toISOString();

  if (supabase) {
    try {
      const { data: job, error } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle();
      if (!error && job) {
        if (workerId && job.assigned_worker_id && job.assigned_worker_id !== workerId) {
          return { success: false, message: 'Unauthorized: You are not assigned to this job.' };
        }
        if (['COMPLETED', 'CANCELLED'].includes(job.status)) {
          return { success: false, message: `Job is already in ${job.status} state.` };
        }
        if (!timingSafeOtpMatch(cleanOtp, job.start_otp)) {
          return { success: false, message: 'Invalid Start OTP. Please check with customer.' };
        }
        const { data: updated } = await supabase.from('jobs').update({
          status: 'IN_PROGRESS',
          started_at: nowIso,
          start_otp_verified_at: nowIso,
          updated_at: nowIso
        }).eq('id', jobId).select().single();

        try {
          if (job.customer_phone) {
            const assignedWorker = mockWorkers.find(w => w.id === job.assigned_worker_id);
            await enqueueNotification({
              idempotencyKey: `JOB_STARTED:${job.id}`,
              jobId: job.id,
              recipientType: 'CUSTOMER',
              recipientPhone: job.customer_phone,
              recipientName: job.customer_name,
              channel: 'WHATSAPP',
              notificationType: 'JOB_STARTED',
              templateId: 'CUSTOMER_JOB_STARTED',
              variables: {
                customerName: job.customer_name || 'Customer',
                jobNumber: job.job_number || 'PI-JOB',
                technicianName: formatCustomerFacingTechnicianName(assignedWorker?.name || 'Technician')
              }
            });
          }
        } catch (e) {}

        return { success: true, message: 'Job started successfully.', status: 'IN_PROGRESS', job: updated };
      }
    } catch (e) {}
  }

  const job = mockJobs.find(j => j.id === jobId);
  if (!job) return { success: false, message: 'Job not found' };

  if (workerId && job.assigned_worker_id !== workerId) {
    return { success: false, message: 'Unauthorized: You are not assigned to this job.' };
  }
  if (!['ASSIGNED', 'EN_ROUTE', 'ARRIVED'].includes(job.status)) {
    return { success: false, message: `Job is already in ${job.status} state.` };
  }

  const attemptKey = `${jobId}_start`;
  otpAttempts[attemptKey] = (otpAttempts[attemptKey] || 0) + 1;
  if (otpAttempts[attemptKey] > 5) {
    return { success: false, message: 'Maximum OTP verification attempts exceeded (5/5). Session locked for security.' };
  }

  if (!timingSafeOtpMatch(cleanOtp, job.start_otp)) {
    return { success: false, message: 'Invalid Start OTP. Please check with customer.' };
  }

  job.status = 'IN_PROGRESS';
  job.started_at = nowIso;

  try {
    if (job.customer_phone) {
      const assignedWorker = mockWorkers.find(w => w.id === job.assigned_worker_id);
      await enqueueNotification({
        idempotencyKey: `JOB_STARTED:${job.id}`,
        jobId: job.id,
        recipientType: 'CUSTOMER',
        recipientPhone: job.customer_phone,
        recipientName: job.customer_name,
        channel: 'WHATSAPP',
        notificationType: 'JOB_STARTED',
        templateId: 'CUSTOMER_JOB_STARTED',
        variables: {
          customerName: job.customer_name || 'Customer',
          jobNumber: job.job_number || 'PI-JOB',
          technicianName: formatCustomerFacingTechnicianName(assignedWorker?.name || 'Technician')
        }
      });
    }
  } catch (e) {}

  return { success: true, message: 'Job started successfully.', status: 'IN_PROGRESS' };
}

export async function saveJobServices(jobId, selectedServices = []) {
  const catalogMap = new Map(SERVICE_CATALOG.map(c => [c.id, c.pricePaise]));
  const verifiedServices = selectedServices.map(s => ({
    ...s,
    ratePaise: catalogMap.has(s.id) ? catalogMap.get(s.id) : (s.ratePaise || 0),
    quantity: Math.max(1, Number(s.quantity || 1))
  }));

  const subtotalPaise = verifiedServices.reduce((sum, s) => sum + (s.ratePaise * s.quantity), 0);
  const inspectionFeePaise = 29900;
  const isWaived = subtotalPaise > 0;
  const waiverPaise = isWaived ? inspectionFeePaise : 0;
  const totalPaise = isWaived ? subtotalPaise : inspectionFeePaise;
  const splits = calculateSplits(totalPaise, 10);

  const supabase = getAdminClient();
  if (supabase) {
    try {
      await supabase.from('jobs').update({
        status: 'PAYMENT_PENDING',
        subtotal_paise: subtotalPaise,
        inspection_fee_paise: inspectionFeePaise,
        waiver_paise: waiverPaise,
        total_paise: totalPaise,
        commission_paise: splits.commissionPaise,
        worker_share_paise: splits.workerSharePaise,
        updated_at: new Date().toISOString()
      }).eq('id', jobId);
    } catch (e) {}
  }

  const job = mockJobs.find(j => j.id === jobId);
  if (job) {
    job.status = 'PAYMENT_PENDING';
    job.subtotal_paise = subtotalPaise;
    job.inspection_fee_paise = inspectionFeePaise;
    job.waiver_paise = waiverPaise;
    job.total_paise = totalPaise;
    job.commission_paise = splits.commissionPaise;
    job.worker_share_paise = splits.workerSharePaise;
    job.services = verifiedServices;
  }

  try {
    let targetJob = job;
    if (!targetJob && supabase) {
      const { data } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle();
      if (data) targetJob = data;
    }
    if (targetJob?.customer_phone) {
      await enqueueNotification({
        idempotencyKey: `PAYMENT_PENDING:${jobId}`,
        jobId: jobId,
        recipientType: 'CUSTOMER',
        recipientPhone: targetJob.customer_phone,
        recipientName: targetJob.customer_name,
        channel: 'WHATSAPP',
        notificationType: 'PAYMENT_PENDING',
        templateId: 'CUSTOMER_PAYMENT_PENDING',
        variables: {
          customerName: targetJob.customer_name || 'Customer',
          jobNumber: targetJob.job_number || 'PI-JOB',
          amount: `₹${(totalPaise / 100).toFixed(2)}`,
          paymentLink: `https://plumberindore.in/track/${jobId}`
        }
      });
    }
  } catch (e) {}

  return {
    success: true,
    totals: { subtotalPaise, inspectionFeePaise, waiverPaise, totalPaise, isInspectionWaived: isWaived },
    commissionPaise: splits.commissionPaise,
    workerSharePaise: splits.workerSharePaise
  };
}

export async function completeJobAndSettle(jobId, endOtp, paymentMethod = 'CASH', actor = 'Worker', workerId = null) {
  if (!jobId) return { success: false, message: 'Job ID is required.' };
  if (inFlightSettlements.has(jobId)) {
    return { success: false, message: 'Settlement already in progress for this job.' };
  }
  inFlightSettlements.add(jobId);

  try {
    const cleanOtp = String(endOtp || '').trim();
    const nowIso = new Date().toISOString();
    const supabase = getAdminClient();

    if (supabase) {
      try {
        const { data: job, error } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle();
        if (!error && job) {
          if (job.status === 'COMPLETED') return { success: false, message: 'Job is already completed.' };
          if (workerId && job.assigned_worker_id && job.assigned_worker_id !== workerId) {
            return { success: false, message: 'Unauthorized: You are not assigned to this job.' };
          }
          if (!timingSafeOtpMatch(cleanOtp, job.end_otp)) {
            return { success: false, message: 'Invalid completion OTP.' };
          }

          const splits = calculateSplits(job.total_paise, 10);
          const wId = workerId || job.assigned_worker_id;

          if (wId) {
            const { data: worker } = await supabase.from('workers').select('wallet_balance_paise').eq('id', wId).single();
            const prevBal = Number(worker?.wallet_balance_paise || 0);
            const delta = paymentMethod === 'CASH' ? -splits.commissionPaise : splits.workerSharePaise;
            const newBal = prevBal + delta;

            await supabase.from('workers').update({ wallet_balance_paise: newBal, status: 'ONLINE_FREE' }).eq('id', wId);
            await supabase.from('wallets').update({ balance_paise: newBal, updated_at: nowIso }).eq('worker_id', wId);
            await supabase.from('wallet_transactions').insert({
              worker_id: wId,
              amount_paise: delta,
              balance_after_paise: newBal,
              type: paymentMethod === 'CASH' ? 'COMMISSION_DEBIT' : 'JOB_EARNING',
              description: `Settlement for Job #${job.job_number} (${paymentMethod})`
            }).catch(() => null);
          }

          await supabase.from('jobs').update({
            status: 'COMPLETED',
            payment_method: paymentMethod,
            payment_status: 'PAID',
            payment_at: nowIso,
            completed_at: nowIso,
            end_otp_verified_at: nowIso,
            updated_at: nowIso
          }).eq('id', jobId);

          return {
            success: true,
            message: 'Job completed and settled successfully.',
            job_id: jobId,
            total_paise: job.total_paise,
            commission_paise: splits.commissionPaise,
            worker_share_paise: splits.workerSharePaise
          };
        }
      } catch (e) {}
    }

    const job = mockJobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Job not found' };
    if (workerId && job.assigned_worker_id && job.assigned_worker_id !== workerId) {
      return { success: false, message: 'Unauthorized: You are not assigned to this job.' };
    }
    if (job.status === 'COMPLETED') return { success: false, message: 'Job is already completed.' };
    if (!['IN_PROGRESS', 'PAYMENT_PENDING'].includes(job.status)) {
      return { success: false, message: `Cannot complete a job that has not been started. Current state: ${job.status}` };
    }

    if (paymentMethod === 'UPI') {
      const verified = mockPayments.find(p => p.job_id === jobId && p.status === 'VERIFIED');
      if (!verified) {
        return { success: false, message: 'UPI payment has not been verified by gateway webhook or API. Cannot complete job.' };
      }
    }

    const attemptKey = `${jobId}_end`;
    otpAttempts[attemptKey] = (otpAttempts[attemptKey] || 0) + 1;
    if (otpAttempts[attemptKey] > 5) {
      return { success: false, message: 'Maximum completion OTP attempts exceeded (5/5). Session locked for security.' };
    }

    if (!timingSafeOtpMatch(cleanOtp, job.end_otp)) {
      return { success: false, message: 'Invalid completion OTP.' };
    }

    if (paymentMethod === 'CASH') {
      let cashPay = mockPayments.find(p => p.job_id === jobId && p.status === 'VERIFIED');
      if (!cashPay) {
        cashPay = {
          id: `pay_cash_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          job_id: jobId,
          provider: 'cash',
          provider_order_id: `cash_order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          provider_payment_id: null,
          amount_paise: job.total_paise,
          currency: 'INR',
          status: 'VERIFIED',
          verification_source: 'MANUAL_CASH_CONFIRMATION',
          webhook_event_id: null,
          attempt_number: 1,
          upi_qr_payload: null,
          upi_qr_data_url: null,
          expires_at: null,
          created_at: nowIso,
          verified_at: nowIso,
          failed_at: null,
          expired_at: null,
          refunded_at: null,
          confirmed_by_worker: true,
          cash_confirmation_at: nowIso,
          metadata: { note: 'Cash collected by technician on site' }
        };
        mockPayments.push(cashPay);
        if (supabase) {
          try {
            await supabase.from('payments').insert(cashPay);
          } catch (e) {}
        }
      }
    }

    const splits = calculateSplits(job.total_paise, 10);
    const worker = mockWorkers.find(w => w.id === job.assigned_worker_id);
    if (worker) {
      if (paymentMethod === 'CASH') {
        worker.wallet_balance_paise -= splits.commissionPaise;
      } else {
        worker.wallet_balance_paise += splits.workerSharePaise;
      }
      worker.status = 'ONLINE_FREE';
      worker.today_jobs_count += 1;
    }

    job.status = 'COMPLETED';
    job.payment_method = paymentMethod;
    job.payment_status = 'PAID';
    job.completed_at = nowIso;
    job.commission_paise = splits.commissionPaise;
    job.worker_share_paise = splits.workerSharePaise;

    try {
      if (job.customer_phone) {
        await enqueueNotification({
          idempotencyKey: `JOB_COMPLETED:${job.id}`,
          jobId: job.id,
          recipientType: 'CUSTOMER',
          recipientPhone: job.customer_phone,
          recipientName: job.customer_name,
          channel: 'WHATSAPP',
          notificationType: 'JOB_COMPLETED',
          templateId: 'CUSTOMER_JOB_COMPLETED',
          variables: {
            customerName: job.customer_name || 'Customer',
            jobNumber: job.job_number,
            ratingLink: `https://plumberindore.in/track/${job.id}`
          }
        });
      }
    } catch (e) {}

    return {
      success: true,
      message: 'Job completed and settled successfully.',
      job_id: jobId,
      total_paise: job.total_paise,
      commission_paise: splits.commissionPaise,
      worker_share_paise: splits.workerSharePaise
    };
  } finally {
    inFlightSettlements.delete(jobId);
  }
}

export async function rechargeWorkerWallet(workerId, amountRupees, paymentMethod = 'CASH', referenceId = null, reason = 'Admin Top-Up', actor = 'Owner') {
  const amountPaise = Math.round(Number(amountRupees || 0) * 100);
  const nowIso = new Date().toISOString();
  const desc = typeof referenceId === 'string' && referenceId.includes('Audit') ? referenceId : (typeof reason === 'string' ? reason : 'Wallet Recharge');
  const supabase = getAdminClient();

  if (supabase) {
    try {
      const { data: worker, error } = await supabase.from('workers').select('wallet_balance_paise').eq('id', workerId).maybeSingle();
      if (!error && worker) {
        const prevBal = Number(worker.wallet_balance_paise || 0);
        const newBal = prevBal + amountPaise;
        await supabase.from('workers').update({ wallet_balance_paise: newBal }).eq('id', workerId);
        await supabase.from('wallets').update({ balance_paise: newBal }).eq('worker_id', workerId);
        const { data: tx } = await supabase.from('wallet_transactions').insert({
          worker_id: workerId,
          amount_paise: amountPaise,
          balance_after_paise: newBal,
          type: 'RECHARGE',
          direction: 'CREDIT',
          description: desc,
          payment_method: paymentMethod,
          created_at: nowIso
        }).select().maybeSingle();
        return {
          success: true,
          message: 'Wallet recharged successfully.',
          previous_balance_paise: prevBal,
          balance_paise: newBal,
          new_balance_paise: newBal,
          transaction_id: tx?.id || `tx-${Date.now()}`
        };
      }
    } catch (e) {}
  }

  const worker = mockWorkers.find(w => w.id === workerId);
  if (!worker) return { success: false, message: 'Worker not found' };

  const prevBalance = worker.wallet_balance_paise;
  worker.wallet_balance_paise += amountPaise;

  const tx = {
    id: `tx-${Date.now()}`,
    worker_id: workerId,
    type: 'RECHARGE',
    amount_paise: amountPaise,
    direction: 'CREDIT',
    balance_after_paise: worker.wallet_balance_paise,
    description: `Wallet Recharge via ${paymentMethod}`,
    payment_method: paymentMethod,
    reference: referenceId,
    created_by: actor,
    created_at: nowIso
  };
  mockTransactions = [tx, ...mockTransactions];

  return {
    success: true,
    message: 'Wallet recharged successfully.',
    previous_balance_paise: prevBalance,
    balance_paise: worker.wallet_balance_paise,
    new_balance_paise: worker.wallet_balance_paise,
    transaction_id: tx.id
  };
}

export async function getWalletTransactions(workerId = null) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      let query = supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false }).limit(50);
      if (workerId) query = query.eq('worker_id', workerId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  return workerId ? mockTransactions.filter(t => t.worker_id === workerId) : mockTransactions;
}

export async function globalAdminSearch(query = '') {
  const clean = (query || '').trim().toLowerCase();
  if (!clean) return { results: { workers: [], jobs: [], customers: [] }, workers: [], jobs: [], customers: [] };

  const supabase = getAdminClient();
  if (supabase) {
    try {
      const [workersRes, jobsRes] = await Promise.all([
        supabase.from('workers').select('id, name, phone, locality, status, service_category').or(`name.ilike.%${clean}%,phone.ilike.%${clean}%`).limit(5),
        supabase.from('jobs').select('id, job_number, customer_name, customer_phone, locality, issue, status, total_paise').or(`job_number.ilike.%${clean}%,customer_name.ilike.%${clean}%,customer_phone.ilike.%${clean}%`).limit(5)
      ]);
      if (!workersRes.error && !jobsRes.error && ((workersRes.data && workersRes.data.length > 0) || (jobsRes.data && jobsRes.data.length > 0))) {
        const workers = workersRes.data || [];
        const jobs = jobsRes.data || [];
        const customers = jobs.map(j => ({ customer_name: j.customer_name, customer_phone: j.customer_phone }));
        return {
          results: { workers, jobs, customers },
          workers,
          jobs,
          customers
        };
      }
    } catch (e) {}
  }

  const workers = mockWorkers.filter(w => (w.name || '').toLowerCase().includes(clean) || (w.phone || '').includes(clean));
  const jobs = mockJobs.filter(j => (j.job_number || '').toLowerCase().includes(clean) || (j.customer_name || '').toLowerCase().includes(clean));
  const customers = jobs.map(j => ({ customer_name: j.customer_name, customer_phone: j.customer_phone }));
  return {
    results: { workers, jobs, customers },
    workers,
    jobs,
    customers
  };
}

export async function logAudit(entry) {
  const audit = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  mockAuditLogs.unshift(audit);
  const supabase = getAdminClient();
  if (supabase) {
    try {
      await supabase.from('audit_logs').insert(audit);
    } catch (e) {}
  }
  return audit;
}

export async function createPaymentOrderForJob(jobId, options = {}) {
  const job = await getJobById(jobId);
  if (!job) return { success: false, message: 'Job not found' };

  if (Number(job.total_paise || 0) <= 0) {
    return { success: false, message: 'Job total amount must be greater than zero' };
  }

  const existingVerified = mockPayments.find(p => p.job_id === job.id && p.status === 'VERIFIED');
  if (existingVerified) {
    return { success: false, message: 'Job already has a verified payment' };
  }

  const provider = getPaymentProvider();
  let orderResult;
  try {
    orderResult = await provider.createPaymentOrder({
      jobId: job.id,
      jobNumber: job.job_number,
      amountPaise: job.total_paise,
      currency: 'INR',
      customerName: job.customer_name,
      customerPhone: job.customer_phone
    });
  } catch (err) {
    return { success: false, message: err.message };
  }

  const existingPayments = mockPayments.filter(p => p.job_id === job.id);
  const attemptNumber = existingPayments.length + 1;

  const paymentRecord = {
    id: `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    job_id: job.id,
    provider: provider.name,
    provider_order_id: orderResult.providerOrderId,
    provider_payment_id: null,
    amount_paise: job.total_paise,
    currency: 'INR',
    status: 'PENDING',
    verification_source: null,
    webhook_event_id: null,
    attempt_number: attemptNumber,
    upi_qr_payload: orderResult.upiQrPayload,
    upi_qr_data_url: orderResult.upiQrDataUrl,
    expires_at: orderResult.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    verified_at: null,
    failed_at: null,
    expired_at: null,
    refunded_at: null,
    confirmed_by_worker: false,
    metadata: {
      jobNumber: job.job_number,
      customerName: job.customer_name,
      ...(options.metadata || {})
    }
  };

  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('payments').insert(paymentRecord).select().maybeSingle();
      if (!error && data) {
        paymentRecord.id = data.id;
      }
    } catch (e) {}
  }

  mockPayments.unshift(paymentRecord);

  const memJob = mockJobs.find(j => j.id === job.id);
  if (memJob && memJob.status === 'IN_PROGRESS') {
    memJob.status = 'PAYMENT_PENDING';
  }

  await logAudit({
    actor: options.actor || 'Worker',
    action: 'PAYMENT_ORDER_CREATED',
    entity_type: 'payment',
    entity_id: paymentRecord.id,
    details: {
      job_id: job.id,
      amount_paise: job.total_paise,
      provider: provider.name,
      provider_order_id: orderResult.providerOrderId
    }
  });

  return { success: true, payment: paymentRecord };
}

export async function pollPaymentStatus(paymentId) {
  let payment = mockPayments.find(p => p.id === paymentId || p.provider_order_id === paymentId);
  if (!payment) return { success: false, message: 'Payment not found' };

  if (payment.status === 'VERIFIED') {
    return { success: true, payment, verified: true };
  }

  if (['REFUNDED', 'FAILED', 'EXPIRED'].includes(payment.status)) {
    return { success: true, payment, verified: false, terminal: true };
  }

  if (payment.expires_at && new Date() > new Date(payment.expires_at)) {
    payment.status = 'EXPIRED';
    payment.expired_at = new Date().toISOString();
    await logAudit({
      actor: 'System',
      action: 'PAYMENT_EXPIRED',
      entity_type: 'payment',
      entity_id: payment.id,
      details: { job_id: payment.job_id }
    });
    return { success: true, payment, verified: false, expired: true };
  }

  const provider = getPaymentProvider();
  try {
    const statusResult = await provider.fetchPaymentStatus({
      providerOrderId: payment.provider_order_id,
      providerPaymentId: payment.provider_payment_id
    });

    if (statusResult.status === 'PAID') {
      const verifyRes = await verifyPayment(payment.id, {
        provider_payment_id: statusResult.providerPaymentId,
        verification_source: 'POLLING'
      });
      return { success: true, payment: verifyRes.payment || payment, verified: true };
    } else if (statusResult.status === 'FAILED') {
      payment.status = 'FAILED';
      payment.failed_at = new Date().toISOString();
      return { success: true, payment, verified: false, failed: true };
    }
  } catch (err) {
    return { success: true, payment, verified: false, error: err.message };
  }

  return { success: true, payment, verified: false };
}

export async function verifyPayment(paymentId, details = {}) {
  const payment = mockPayments.find(p => p.id === paymentId || p.provider_order_id === paymentId);
  if (!payment) return { success: false, message: 'Payment not found' };

  if (payment.status === 'VERIFIED') {
    return { success: true, payment, already_verified: true };
  }

  if (['REFUNDED', 'FAILED', 'EXPIRED'].includes(payment.status)) {
    return { success: false, message: `Cannot verify payment in terminal status: ${payment.status}` };
  }

  const existingVerified = mockPayments.find(p => p.job_id === payment.job_id && p.status === 'VERIFIED' && p.id !== payment.id);
  if (existingVerified) {
    payment.status = 'DUPLICATE_PAYMENT_REVIEW';
    payment.metadata = {
      ...payment.metadata,
      duplicate_flag: true,
      duplicate_with_payment_id: existingVerified.id,
      flagged_at: new Date().toISOString()
    };
    await logAudit({
      actor: details.actor || 'System',
      action: 'DUPLICATE_PAYMENT_DETECTED',
      entity_type: 'payment',
      entity_id: payment.id,
      details: {
        job_id: payment.job_id,
        existing_verified_id: existingVerified.id,
        amount_paise: payment.amount_paise
      }
    });
    return {
      success: false,
      duplicate_review: true,
      message: 'Job already has a verified payment. Payment flagged for duplicate review.',
      payment
    };
  }

  const supabase = getAdminClient();
  if (supabase) {
    try {
      await supabase.from('payments').update({
        status: 'VERIFIED',
        verified_at: new Date().toISOString(),
        verification_source: details.verification_source || 'WEBHOOK',
        provider_payment_id: details.provider_payment_id || null,
        webhook_event_id: details.webhook_event_id || null
      }).eq('id', payment.id);
    } catch (e) {}
  }

  payment.status = 'VERIFIED';
  payment.verified_at = new Date().toISOString();
  payment.verification_source = details.verification_source || 'WEBHOOK';
  if (details.provider_payment_id) payment.provider_payment_id = details.provider_payment_id;
  if (details.webhook_event_id) payment.webhook_event_id = details.webhook_event_id;

  const job = mockJobs.find(j => j.id === payment.job_id);
  if (job) {
    job.payment_method = 'UPI';
    if (job.status === 'IN_PROGRESS' || job.status === 'ARRIVED') {
      job.status = 'PAYMENT_PENDING';
    }
  }

  await logAudit({
    actor: details.actor || 'GatewayWebhook',
    action: 'PAYMENT_VERIFIED',
    entity_type: 'payment',
    entity_id: payment.id,
    details: {
      job_id: payment.job_id,
      amount_paise: payment.amount_paise,
      provider_payment_id: payment.provider_payment_id,
      verification_source: payment.verification_source
    }
  });

  try {
    if (job?.customer_phone) {
      await enqueueNotification({
        idempotencyKey: `PAYMENT_VERIFIED_CUST:${payment.id}`,
        jobId: payment.job_id,
        recipientType: 'CUSTOMER',
        recipientPhone: job.customer_phone,
        recipientName: job.customer_name,
        channel: 'WHATSAPP',
        notificationType: 'PAYMENT_VERIFIED',
        templateId: 'CUSTOMER_PAYMENT_VERIFIED',
        variables: {
          customerName: job.customer_name || 'Customer',
          amount: `₹${(payment.amount_paise / 100).toFixed(2)}`,
          jobNumber: job.job_number || 'PI-JOB'
        }
      });
    }

    if (job?.assigned_worker_id) {
      const worker = mockWorkers.find(w => w.id === job.assigned_worker_id);
      if (worker?.phone) {
        await enqueueNotification({
          idempotencyKey: `PAYMENT_VERIFIED_WORKER:${payment.id}`,
          jobId: payment.job_id,
          workerId: worker.id,
          recipientType: 'WORKER',
          recipientPhone: worker.phone,
          recipientName: worker.name,
          channel: 'WHATSAPP',
          notificationType: 'PAYMENT_VERIFIED',
          templateId: 'WORKER_PAYMENT_VERIFIED',
          variables: {
            workerName: worker.name,
            amount: `₹${(payment.amount_paise / 100).toFixed(2)}`,
            jobNumber: job.job_number || 'PI-JOB'
          }
        });
      }
    }
  } catch (e) {}

  return { success: true, payment };
}

export async function processWebhookEvent(rawBody, signature, headers = {}) {
  const provider = getPaymentProvider();

  const isValid = provider.verifyWebhookSignature(rawBody, signature, headers);
  if (!isValid) {
    await logAudit({
      actor: 'System',
      action: 'PAYMENT_WEBHOOK_SIGNATURE_INVALID',
      entity_type: 'payment_webhook',
      entity_id: 'unknown',
      details: { provider: provider.name, signature: signature ? 'provided' : 'missing' }
    });
    return { success: false, error: 'Invalid webhook signature' };
  }

  let parsed;
  try {
    parsed = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  } catch (e) {
    return { success: false, error: 'Malformed JSON payload' };
  }

  const eventId = parsed.event_id || parsed.id || headers['x-razorpay-event-id'] || headers['x-webhook-event-id'] || `evt_${Date.now()}`;
  const eventType = parsed.event || parsed.event_type || 'payment.captured';

  const alreadyProcessed = mockWebhookEvents.find(e => e.provider === provider.name && e.event_id === eventId);
  if (alreadyProcessed) {
    return { success: true, duplicate: true, message: 'Event already processed', event_id: eventId };
  }

  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data: dbEvent } = await supabase
        .from('payment_webhook_events')
        .select('id')
        .eq('provider', provider.name)
        .eq('event_id', eventId)
        .maybeSingle();
      if (dbEvent) {
        return { success: true, duplicate: true, message: 'Event already processed', event_id: eventId };
      }
    } catch (e) {}
  }

  const paymentEntity = parsed.payload?.payment?.entity || parsed.data?.payment || parsed.data || {};
  const orderId = paymentEntity.order_id || parsed.order_id || parsed.provider_order_id;
  const paymentId = paymentEntity.id || parsed.payment_id || parsed.provider_payment_id;
  const amountPaise = paymentEntity.amount !== undefined ? Number(paymentEntity.amount) :
                      (paymentEntity.amount_paise !== undefined ? Number(paymentEntity.amount_paise) : Number(parsed.amount_paise || 0));
  const currency = paymentEntity.currency || parsed.currency || 'INR';

  const webhookLog = {
    id: `wh_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    provider: provider.name,
    event_id: eventId,
    event_type: eventType,
    signature,
    payload: parsed,
    status: 'PROCESSING',
    created_at: new Date().toISOString()
  };
  mockWebhookEvents.push(webhookLog);

  if (supabase) {
    try {
      await supabase.from('payment_webhook_events').insert(webhookLog);
    } catch (e) {}
  }

  const payment = mockPayments.find(p => p.provider_order_id === orderId || p.id === orderId);
  if (!payment) {
    webhookLog.status = 'ORPHAN_ORDER';
    return { success: false, error: `No matching payment found for order: ${orderId}` };
  }

  if (currency !== 'INR') {
    webhookLog.status = 'CURRENCY_MISMATCH';
    await logAudit({
      actor: 'System',
      action: 'PAYMENT_CURRENCY_MISMATCH',
      entity_type: 'payment',
      entity_id: payment.id,
      details: { expected: 'INR', received: currency }
    });
    return { success: false, error: `Invalid currency: received ${currency}, expected INR` };
  }

  if (amountPaise !== payment.amount_paise) {
    webhookLog.status = 'AMOUNT_MISMATCH';
    await logAudit({
      actor: 'System',
      action: 'PAYMENT_AMOUNT_MISMATCH',
      entity_type: 'payment',
      entity_id: payment.id,
      details: { expected: payment.amount_paise, received: amountPaise }
    });
    return { success: false, error: `Amount mismatch: expected ${payment.amount_paise} paise, received ${amountPaise} paise` };
  }

  if (['payment.captured', 'payment.authorized', 'order.paid', 'PAYMENT_CAPTURED'].includes(eventType)) {
    const verifyRes = await verifyPayment(payment.id, {
      provider_payment_id: paymentId,
      verification_source: 'WEBHOOK',
      webhook_event_id: eventId
    });

    if (verifyRes.success) {
      webhookLog.status = 'PROCESSED';
      return { success: true, event_id: eventId, verified: true, payment_id: payment.id };
    } else if (verifyRes.duplicate_review) {
      webhookLog.status = 'DUPLICATE_REVIEW';
      return { success: false, duplicate_review: true, event_id: eventId, message: verifyRes.message };
    } else {
      webhookLog.status = 'VERIFY_FAILED';
      return { success: false, error: verifyRes.message };
    }
  } else if (['payment.failed', 'PAYMENT_FAILED'].includes(eventType)) {
    payment.status = 'FAILED';
    payment.failed_at = new Date().toISOString();
    webhookLog.status = 'FAILED_EVENT';
    return { success: true, event_id: eventId, failed: true };
  }

  webhookLog.status = 'IGNORED';
  return { success: true, event_id: eventId, ignored: true };
}

export async function expirePayment(paymentId) {
  const payment = mockPayments.find(p => p.id === paymentId || p.provider_order_id === paymentId);
  if (!payment) return { success: false, message: 'Payment not found' };

  if (payment.status !== 'PENDING') {
    return { success: false, message: `Cannot expire payment with status ${payment.status}` };
  }

  payment.status = 'EXPIRED';
  payment.expired_at = new Date().toISOString();

  await logAudit({
    actor: 'System',
    action: 'PAYMENT_EXPIRED',
    entity_type: 'payment',
    entity_id: payment.id,
    details: { job_id: payment.job_id }
  });

  return { success: true, payment };
}

export async function requestRefund(paymentId, { amount_paise, reason, initiated_by = 'Owner' } = {}) {
  const payment = mockPayments.find(p => p.id === paymentId || p.provider_order_id === paymentId);
  if (!payment) return { success: false, message: 'Payment not found' };

  if (payment.status !== 'VERIFIED') {
    return { success: false, message: 'Only verified payments can be refunded' };
  }

  const refundPaise = amount_paise || payment.amount_paise;
  const provider = getPaymentProvider();

  let refundResult;
  try {
    refundResult = await provider.processRefund({
      providerPaymentId: payment.provider_payment_id,
      amountPaise: refundPaise,
      reason: reason || 'Customer cancellation/dispute'
    });
  } catch (err) {
    return { success: false, message: err.message };
  }

  payment.status = 'REFUNDED';
  payment.refunded_at = new Date().toISOString();
  payment.metadata = {
    ...payment.metadata,
    refund_id: refundResult.refundId,
    refund_reason: reason,
    refund_amount_paise: refundPaise,
    refund_initiated_by: initiated_by
  };

  const supabase = getAdminClient();
  if (supabase) {
    try {
      await supabase.from('payments').update({
        status: 'REFUNDED',
        refunded_at: payment.refunded_at,
        metadata: payment.metadata
      }).eq('id', payment.id);
    } catch (e) {}
  }

  await logAudit({
    actor: initiated_by,
    action: 'PAYMENT_REFUNDED',
    entity_type: 'payment',
    entity_id: payment.id,
    details: {
      amount_paise: refundPaise,
      reason,
      refund_id: refundResult.refundId
    }
  });

  return { success: true, payment, refund: refundResult };
}

export async function getPaymentById(paymentId) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, job:jobs(*)')
        .eq('id', paymentId)
        .maybeSingle();
      if (!error && data) return data;
    } catch (e) {}
  }

  const found = mockPayments.find(p => p.id === paymentId || p.provider_order_id === paymentId);
  if (!found) return null;
  const job = mockJobs.find(j => j.id === found.job_id);
  return { ...found, job: job || null };
}

export async function getJobPayments(jobId) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  return mockPayments.filter(p => p.job_id === jobId);
}

export async function getAllPayments(filters = {}) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      let query = supabase
        .from('payments')
        .select('*, job:jobs(id, job_number, customer_name, customer_phone)')
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters.provider && filters.provider !== 'ALL') {
        query = query.eq('provider', filters.provider);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }

  let list = [...mockPayments];
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter(p => p.status === filters.status);
  }
  if (filters.provider && filters.provider !== 'ALL') {
    list = list.filter(p => p.provider === filters.provider);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(p =>
      (p.id && p.id.toLowerCase().includes(s)) ||
      (p.provider_order_id && p.provider_order_id.toLowerCase().includes(s)) ||
      (p.provider_payment_id && p.provider_payment_id.toLowerCase().includes(s)) ||
      (p.job_id && p.job_id.toLowerCase().includes(s))
    );
  }

  return list.map(p => {
    const job = mockJobs.find(j => j.id === p.job_id);
    return {
      ...p,
      job: job ? { id: job.id, job_number: job.job_number, customer_name: job.customer_name, customer_phone: job.customer_phone } : null
    };
  });
}

export async function getPaymentReconciliation() {
  const payments = await getAllPayments();
  const jobs = await getJobs({ status: 'ALL' });

  const onlineVerified = payments.filter(p => p.status === 'VERIFIED' && p.provider !== 'cash');
  const cashVerified = payments.filter(p => p.status === 'VERIFIED' && p.provider === 'cash');
  const duplicateReview = payments.filter(p => p.status === 'DUPLICATE_PAYMENT_REVIEW');
  const refunded = payments.filter(p => p.status === 'REFUNDED');
  const pending = payments.filter(p => p.status === 'PENDING');
  const failed = payments.filter(p => p.status === 'FAILED');

  const onlineVerifiedPaise = onlineVerified.reduce((sum, p) => sum + Number(p.amount_paise || 0), 0);
  const cashVerifiedPaise = cashVerified.reduce((sum, p) => sum + Number(p.amount_paise || 0), 0);
  const totalVerifiedPaise = onlineVerifiedPaise + cashVerifiedPaise;

  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');
  const completedJobsPaise = completedJobs.reduce((sum, j) => sum + Number(j.total_paise || 0), 0);

  const discrepancyPaise = totalVerifiedPaise - completedJobsPaise;

  return {
    onlineVerifiedCount: onlineVerified.length,
    onlineVerifiedPaise,
    cashVerifiedCount: cashVerified.length,
    cashVerifiedPaise,
    totalVerifiedPaise,
    completedJobsCount: completedJobs.length,
    completedJobsPaise,
    discrepancyPaise,
    duplicateReviewCount: duplicateReview.length,
    refundedCount: refunded.length,
    refundedPaise: refunded.reduce((sum, p) => sum + Number(p.amount_paise || 0), 0),
    pendingCount: pending.length,
    failedCount: failed.length
  };
}

export async function getDailyOwnerReport(dateStr = getKolkataDateString()) {
  const jobs = await getJobs({ status: 'ALL' });
  const workers = await getFleet();
  const alerts = await getOperationalAlerts();
  const rep = generateDailyReport(dateStr, jobs, workers, alerts);
  const hisab = await getTodaysHisab();
  const recon = await getPaymentReconciliation();
  return {
    ...rep,
    hisab,
    reconciliation: recon
  };
}

export async function getAuditLogs() {
  return mockAuditLogs.length > 0 ? mockAuditLogs : [{ id: 'audit-1', action: 'SYSTEM_BOOT', timestamp: new Date().toISOString() }];
}

export async function getWorkerNotifications(workerId, unreadOnly = false) {
  return getWorkerNotificationsHelper(workerId, unreadOnly);
}

export async function markNotificationRead(notificationId) {
  return markNotificationReadHelper(notificationId);
}

export async function createWorker(workerData, actor = 'Owner') {
  const supabase = getAdminClient();
  const phoneValidation = validatePhoneNumber(workerData.phone);
  if (!phoneValidation.valid) {
    return { success: false, error: phoneValidation.message };
  }

  const phone = normalizePhoneNumber(workerData.phone);
  const whatsapp_number = workerData.whatsapp ? normalizePhoneNumber(workerData.whatsapp) : (workerData.whatsappNumber ? normalizePhoneNumber(workerData.whatsappNumber) : phone);
  const name = workerData.name?.trim();
  const locality = workerData.locality || 'Vijay Nagar';
  const service_category = workerData.serviceCategory || (Array.isArray(workerData.service_categories) ? workerData.service_categories[0] : 'plumber');
  const initialBalancePaise = workerData.initial_wallet_balance_paise !== undefined
    ? Number(workerData.initial_wallet_balance_paise)
    : workerData.initialBalancePaise !== undefined
      ? Number(workerData.initialBalancePaise)
      : Math.round(Number(workerData.initialBalanceRupees || 500) * 100);

  const assigned_areas = Array.isArray(workerData.assigned_areas) ? workerData.assigned_areas : (Array.isArray(workerData.assignedAreas) ? workerData.assignedAreas : [locality]);
  const service_categories = Array.isArray(workerData.service_categories) ? workerData.service_categories : (Array.isArray(workerData.serviceCategories) ? workerData.serviceCategories : [service_category]);

  const newWorker = {
    name,
    phone,
    whatsapp_number,
    address: workerData.address?.trim() || null,
    emergency_contact: workerData.emergency_contact?.trim() || workerData.emergencyContact?.trim() || null,
    locality,
    assigned_areas,
    service_category,
    service_categories,
    notes: workerData.notes?.trim() || null,
    joining_date: workerData.joiningDate || getKolkataDateString(),
    wallet_balance_paise: initialBalancePaise,
    status: 'ONLINE_FREE',
    rating: 4.95,
    today_jobs_count: 0,
    total_jobs_count: 0,
    is_active: true,
    is_suspended: false,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('workers').insert(newWorker).select().single();
      if (!error && data) {
        await supabase.from('wallets').insert({
          worker_id: data.id,
          balance_paise: initialBalancePaise,
          updated_at: new Date().toISOString()
        }).catch(() => null);

        const tokenStr = `${name.toLowerCase().replace(/[^a-z]/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;
        await supabase.from('worker_tokens').insert({
          worker_id: data.id,
          token: tokenStr,
          is_active: true,
          created_at: new Date().toISOString()
        }).catch(() => null);

        return { success: true, worker: { ...data, token: tokenStr } };
      }
    } catch (e) {}
  }

  const mockId = `worker-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const tokenStr = `${name.toLowerCase().replace(/[^a-z]/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;
  const created = {
    id: mockId,
    ...newWorker,
    token: tokenStr
  };
  mockWorkers = [created, ...mockWorkers];
  return { success: true, worker: created };
}

export async function updateWorker(workerId, updateData, actor = 'Owner') {
  const supabase = getAdminClient();
  const fields = { ...updateData };
  if (fields.phone) fields.phone = normalizePhoneNumber(fields.phone);
  if (fields.whatsapp) fields.whatsapp_number = normalizePhoneNumber(fields.whatsapp);
  if (fields.whatsappNumber) {
    fields.whatsapp_number = normalizePhoneNumber(fields.whatsappNumber);
    delete fields.whatsappNumber;
  }
  fields.updated_at = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('workers')
        .update(fields)
        .eq('id', workerId)
        .select()
        .single();
      if (!error && data) return { success: true, worker: data };
    } catch (e) {}
  }

  const worker = mockWorkers.find(w => w.id === workerId);
  if (!worker) return { success: false, message: 'Worker not found' };
  Object.assign(worker, fields);
  return { success: true, worker };
}

export async function suspendWorker(workerId, reason = 'Administrative Suspension', actor = 'Owner') {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('workers')
        .update({ status: 'SUSPENDED', is_suspended: true, is_active: false, updated_at: new Date().toISOString() })
        .eq('id', workerId)
        .select()
        .single();
      if (!error && data) return { success: true, message: 'Technician suspended successfully.', worker: data };
    } catch (e) {}
  }

  const worker = mockWorkers.find(w => w.id === workerId);
  if (!worker) return { success: false, message: 'Worker not found' };
  worker.status = 'SUSPENDED';
  worker.is_suspended = true;
  worker.is_active = false;
  return { success: true, message: 'Technician suspended successfully.', worker };
}

export async function unsuspendWorker(workerId, actor = 'Owner') {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('workers')
        .update({ status: 'ONLINE_FREE', is_suspended: false, is_active: true, updated_at: new Date().toISOString() })
        .eq('id', workerId)
        .select()
        .single();
      if (!error && data) return { success: true, message: 'Technician reinstated.', worker: data };
    } catch (e) {}
  }

  const worker = mockWorkers.find(w => w.id === workerId);
  if (!worker) return { success: false, message: 'Worker not found' };
  worker.status = 'ONLINE_FREE';
  worker.is_suspended = false;
  worker.is_active = true;
  return { success: true, message: 'Technician reinstated.', worker };
}

export async function generateWorkerToken(workerId, actor = 'Owner') {
  const supabase = getAdminClient();
  const tokenStr = `pi_${Math.random().toString(36).substring(2, 8)}_${Math.floor(1000 + Math.random() * 9000)}`;

  if (supabase) {
    try {
      await supabase
        .from('worker_tokens')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('worker_id', workerId);

      const { data, error } = await supabase.from('worker_tokens').insert({
        worker_id: workerId,
        token: tokenStr,
        is_active: true,
        created_at: new Date().toISOString()
      }).select().single();

      if (!error && data) {
        return { success: true, token: tokenStr, accessUrl: `/partner/${tokenStr}` };
      }
    } catch (e) {}
  }

  const worker = mockWorkers.find(w => w.id === workerId);
  if (worker) {
    worker.token = tokenStr;
  }
  return { success: true, token: tokenStr, accessUrl: `/partner/${tokenStr}` };
}

export async function revokeWorkerToken(workerId, actor = 'Owner') {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      await supabase
        .from('worker_tokens')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('worker_id', workerId);
    } catch (e) {}
  }

  const worker = mockWorkers.find(w => w.id === workerId);
  if (worker) {
    worker.token = null;
  }
  return { success: true, message: 'Token revoked successfully.' };
}

export async function reassignJob(jobId, newWorkerId, reason = 'Dispatcher Reassignment', actor = 'Owner') {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();
      if (job && (job.status === 'COMPLETED' || job.status === 'CANCELLED')) {
        return { success: false, message: `Cannot reassign job in ${job.status} state.` };
      }
    } catch (e) {}
  }

  const job = mockJobs.find(j => j.id === jobId);
  if (!job) return { success: false, message: 'Job not found' };
  if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
    return { success: false, message: `Cannot reassign job in ${job.status} state.` };
  }

  const newWorker = mockWorkers.find(w => w.id === newWorkerId);
  if (!newWorker) return { success: false, message: 'New technician not found' };
  if (!newWorker.is_active || newWorker.is_suspended || newWorker.status === 'SUSPENDED') {
    return { success: false, message: 'New technician is suspended or inactive.' };
  }

  if (job.assigned_worker_id && job.assigned_worker_id !== newWorkerId) {
    const oldWorker = mockWorkers.find(w => w.id === job.assigned_worker_id);
    if (oldWorker) {
      oldWorker.status = 'ONLINE_FREE';
    }
  }

  newWorker.status = 'BUSY';
  job.reassigned_from_worker_id = job.assigned_worker_id;
  job.assigned_worker_id = newWorkerId;
  job.assigned_worker = newWorker;
  job.status = 'ASSIGNED';
  job.reassigned_reason = reason;
  job.reassigned_at = new Date().toISOString();

  try {
    await enqueueNotification({
      idempotencyKey: `WORKER_REASSIGNED:${job.id}:${newWorkerId}`,
      jobId: job.id,
      workerId: newWorkerId,
      recipientType: 'WORKER',
      recipientPhone: newWorker?.phone,
      recipientName: newWorker?.name,
      channel: 'WHATSAPP',
      notificationType: 'WORKER_REASSIGNED',
      templateId: 'WORKER_JOB_ASSIGNED',
      variables: {
        workerName: newWorker?.name || 'Technician',
        jobNumber: job.job_number,
        locality: job.locality,
        issue: job.issue,
        customerName: job.customer_name,
        customerPhone: job.customer_phone,
        address: job.address
      }
    });
  } catch (e) {}

  return { success: true, message: 'Job successfully reassigned.', job };
}

export async function cancelJob(jobId, reason = 'CUSTOMER_CANCELLED', actor = 'Owner') {
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) return { success: false, message: 'Job not found' };
  if (job.status === 'COMPLETED') {
    return { success: false, message: 'Cannot cancel a completed job with settled financials.' };
  }

  const prevWorkerId = job.assigned_worker_id;
  if (prevWorkerId) {
    const worker = mockWorkers.find(w => w.id === prevWorkerId);
    if (worker) {
      worker.status = 'ONLINE_FREE';
    }
  }

  job.status = 'CANCELLED';
  job.cancellation_reason = reason;
  job.cancelled_by = actor;
  job.cancelled_at = new Date().toISOString();

  try {
    if (prevWorkerId) {
      const worker = mockWorkers.find(w => w.id === prevWorkerId);
      await enqueueNotification({
        idempotencyKey: `WORKER_CANCEL:${job.id}:${prevWorkerId}`,
        jobId: job.id,
        workerId: prevWorkerId,
        recipientType: 'WORKER',
        recipientPhone: worker?.phone,
        recipientName: worker?.name,
        channel: 'WHATSAPP',
        notificationType: 'JOB_CANCELLED',
        templateId: 'WORKER_JOB_CANCELLED',
        variables: {
          workerName: worker?.name || 'Technician',
          jobNumber: job.job_number,
          reason: reason || 'Customer request'
        }
      });
    }

    if (job.customer_phone) {
      await enqueueNotification({
        idempotencyKey: `CUSTOMER_CANCEL:${job.id}`,
        jobId: job.id,
        recipientType: 'CUSTOMER',
        recipientPhone: job.customer_phone,
        recipientName: job.customer_name,
        channel: 'WHATSAPP',
        notificationType: 'JOB_CANCELLED',
        templateId: 'CUSTOMER_JOB_CANCELLED',
        variables: {
          customerName: job.customer_name || 'Customer',
          jobNumber: job.job_number,
          reason: reason || 'Cancelled per request'
        }
      });
    }
  } catch (e) {}

  return { success: true, message: 'Job cancelled successfully.', job };
}

let adminServiceCatalog = [...SERVICE_CATALOG.map(s => ({ ...s, is_active: true }))];

export async function getServiceCatalogAdmin() {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('service_catalog').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  return adminServiceCatalog;
}

export async function createServiceCatalogItem(data, actor = 'Owner') {
  const item = {
    id: `srv-${Date.now()}`,
    name: data.name?.trim() || 'Service',
    category: data.category || 'Plumbing',
    pricePaise: data.pricePaise || Math.round(Number(data.priceRupees || 149) * 100),
    isPart: !!data.isPart,
    is_active: true
  };
  adminServiceCatalog.push(item);
  return { success: true, item };
}

export async function toggleServiceCatalogItem(id, isActive, actor = 'Owner') {
  const item = adminServiceCatalog.find(s => s.id === id);
  if (item) {
    item.is_active = isActive;
  }
  return { success: true, item };
}

let mockAlerts = [
  {
    id: 'alt-1',
    severity: 'HIGH',
    category: 'LOW_WALLET',
    title: 'Low Wallet Balance: Suresh Patel',
    description: 'Suresh Patel wallet is ₹82.00 (below minimum ₹100.00). Recharge required for next dispatch.',
    related_worker_id: '11111111-1111-1111-1111-111111111192',
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  }
];

export async function getOperationalAlerts(filters = {}) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      let query = supabase.from('operational_alerts').select('*').order('created_at', { ascending: false });
      if (filters.status && filters.status !== 'ALL') query = query.eq('status', filters.status);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  if (filters.status && filters.status !== 'ALL') {
    return mockAlerts.filter(a => a.status === filters.status);
  }
  return mockAlerts;
}

export async function resolveAlert(alertId, actor = 'Owner') {
  const alert = mockAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.status = 'RESOLVED';
    alert.resolved_by = actor;
    alert.resolved_at = new Date().toISOString();
  }
  return { success: true };
}

export async function dismissAlert(alertId, actor = 'Owner') {
  const alert = mockAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.status = 'DISMISSED';
    alert.resolved_by = actor;
    alert.resolved_at = new Date().toISOString();
  }
  return { success: true };
}

export async function createOperationalAlert(data, actor = 'System') {
  const existingActive = mockAlerts.find(
    a => a.status === 'ACTIVE' &&
         a.category === data.category &&
         (data.related_job_id ? a.related_job_id === data.related_job_id : true)
  );
  if (existingActive) {
    return { created: false, alert: existingActive };
  }

  const alert = {
    id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    severity: data.severity || 'MEDIUM',
    category: data.category || 'GENERAL',
    title: data.title || 'Operational Notice',
    description: data.description || '',
    related_worker_id: data.related_worker_id || null,
    related_job_id: data.related_job_id || null,
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  };

  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data: dbAlert, error } = await supabase.from('operational_alerts').insert(alert).select().single();
      if (!error && dbAlert) return { created: true, alert: dbAlert };
    } catch (e) {}
  }

  mockAlerts.unshift(alert);
  return { created: true, alert };
}

let mockTickets = [];

export async function getSupportTickets(filters = {}) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      if (filters.status && filters.status !== 'ALL') query = query.eq('status', filters.status);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  if (filters.status && filters.status !== 'ALL') {
    return mockTickets.filter(t => t.status === filters.status);
  }
  return mockTickets;
}

export async function createSupportTicket(data, actor = 'Owner') {
  const ticket = {
    id: `tic-${Date.now()}`,
    ticket_number: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
    category: data.category || 'OTHER',
    subject: data.subject || data.title || 'Support Note',
    title: data.title || data.subject || 'Support Note',
    description: data.description?.trim() || '',
    priority: data.priority || 'NORMAL',
    status: 'OPEN',
    related_worker_id: data.workerId || null,
    related_job_id: data.jobId || null,
    created_by: actor,
    created_at: new Date().toISOString()
  };
  mockTickets.push(ticket);
  return { success: true, ticket };
}

export async function getDataHealthReport() {
  const [fleet, jobs, transactions, hisab] = await Promise.all([
    getFleet(),
    getJobs({ status: 'ALL' }),
    getWalletTransactions(),
    getTodaysHisab()
  ]);

  const orphanJobs = jobs.filter(j => j.assigned_worker_id && !fleet.find(w => w.id === j.assigned_worker_id));
  const reconciliationDifference = (hisab.gross_revenue_paise || 0) - ((hisab.commission_paise || 0) + (hisab.worker_share_paise || 0));

  return {
    timestamp: new Date().toISOString(),
    status: reconciliationDifference === 0 && orphanJobs.length === 0 ? 'HEALTHY' : 'WARNING',
    metrics: {
      totalWorkers: fleet.length,
      totalJobs: jobs.length,
      totalTransactions: transactions.length
    },
    diagnostics: {
      orphanJobsCount: orphanJobs.length,
      reconciliationDifferencePaise: reconciliationDifference,
      reconciliationDiscrepancyPaise: reconciliationDifference,
      isReconciliationBalanced: reconciliationDifference === 0
    }
  };
}

export async function getOperationalAnalytics(range = 'today') {
  const [fleet, jobs] = await Promise.all([
    getFleet(),
    getJobs({ status: 'ALL' })
  ]);

  const completed = jobs.filter(j => j.status === 'COMPLETED');
  const cancelled = jobs.filter(j => j.status === 'CANCELLED');
  const active = jobs.filter(j => ['ASSIGNED', 'IN_PROGRESS', 'PAYMENT_PENDING'].includes(j.status));

  const totalGrossPaise = completed.reduce((sum, j) => sum + Number(j.total_paise || 0), 0);
  const totalCommissionPaise = completed.reduce((sum, j) => sum + Number(j.commission_paise || 0), 0);
  const totalPayoutPaise = completed.reduce((sum, j) => sum + Number(j.worker_share_paise || 0), 0);

  const areaCounts = {};
  jobs.forEach(j => {
    const loc = j.locality || 'Vijay Nagar';
    areaCounts[loc] = (areaCounts[loc] || 0) + 1;
  });

  const categoryCounts = {};
  jobs.forEach(j => {
    const cat = j.service_category || 'Plumber';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return {
    range,
    timezone: 'Asia/Kolkata',
    kpis: {
      totalJobs: jobs.length,
      completedJobs: completed.length,
      cancelledJobs: cancelled.length,
      activeJobs: active.length,
      totalGrossPaise,
      totalCommissionPaise,
      totalPayoutPaise
    },
    areaDistribution: areaCounts,
    categoryDistribution: categoryCounts,
    fleetSummary: {
      totalTechnicians: fleet.length,
      onlineFree: fleet.filter(w => w.status === 'ONLINE_FREE').length,
      busy: fleet.filter(w => w.status === 'BUSY').length,
      offline: fleet.filter(w => w.status === 'OFFLINE').length,
      suspended: fleet.filter(w => w.status === 'SUSPENDED').length
    }
  };
}

export const rechargeWallet = rechargeWorkerWallet;
export const getWorkers = getFleet;

export async function runAutomation() {
  const settings = await getPlatformSettings();
  const jobs = await getJobs({ status: 'ALL' });
  const workers = await getFleet();
  return runAutomationChecks({
    jobs,
    workers,
    createAlert: createOperationalAlert,
    settings
  });
}

export {
  getAllNotificationJobs,
  getAllNotificationDeliveries
};
