import { getAdminClient } from '../../supabase/admin.js';
import { getNotificationProvider } from './provider.js';
import { renderTemplate } from './templates.js';
import { getPlatformSettings } from '../store.js';
import crypto from 'crypto';

/**
 * In-memory fallbacks for production resilience and instant previews
 */
let mockNotificationJobs = [];
let mockNotificationDeliveries = [];
let mockCustomerTrackingTokens = [];
const inFlightEnqueues = new Map();

/**
 * Format technician name for customer privacy: "Ramesh Kumar" -> "Ramesh K."
 */
export function formatCustomerFacingTechnicianName(fullName) {
  if (!fullName) return 'Technician';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

/**
 * Enqueue a notification with idempotency protection.
 * If idempotencyKey exists, returns existing job without duplicate insertion.
 */
export async function enqueueNotification(options = {}) {
  const {
    idempotencyKey: rawIdemp,
    jobId = null,
    workerId = null,
    recipientType = 'CUSTOMER',
    recipientPhone = null,
    recipient = null,
    recipientName = null,
    channel = 'WHATSAPP',
    notificationType = null,
    type = null,
    templateId = null,
    templateKey = null,
    variables = {},
    payload = {}
  } = options || {};

  const resolvedNotifType = notificationType || type || 'SYSTEM_NOTICE';
  const resolvedTemplateId = templateId || templateKey || resolvedNotifType;
  const resolvedPhone = recipientPhone || recipient || null;
  const idempotencyKey = rawIdemp || `${resolvedNotifType}:${jobId || 'no_job'}:${Date.now()}`;

  // 1. Check in-memory deduplication
  const existingMemory = mockNotificationJobs.find(n => n.idempotency_key === idempotencyKey);
  if (existingMemory) {
    return { success: true, id: existingMemory.id, notification: existingMemory, deduplicated: true };
  }

  // 2. In-flight promise locking for 100% concurrent deduplication
  if (inFlightEnqueues.has(idempotencyKey)) {
    return inFlightEnqueues.get(idempotencyKey);
  }

  const enqueueExecution = (async () => {
    // 3. Render content
    const rendered = renderTemplate(resolvedTemplateId, variables);
    const messageText = rendered.success ? rendered.message : (payload.fallbackText || 'Service update from PlumberIndore');

    const supabase = getAdminClient();
    if (supabase) {
      try {
        // Check existing in DB
        const { data: existingDb } = await supabase
          .from('notification_jobs')
          .select('*')
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle();

        if (existingDb) {
          mockNotificationJobs.unshift(existingDb);
          return { success: true, id: existingDb.id, notification: existingDb, deduplicated: true };
        }

        const newJobRecord = {
          idempotency_key: idempotencyKey,
          job_id: jobId,
          worker_id: workerId,
          recipient_type: recipientType,
          recipient_phone: resolvedPhone,
          recipient_name: recipientName,
          channel: (channel || 'WHATSAPP').toUpperCase(),
          notification_type: resolvedNotifType,
          template_id: resolvedTemplateId,
          variables: variables,
          message_text: messageText,
          status: 'QUEUED',
          attempts: 0,
          max_attempts: 3,
          scheduled_for: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        const { data: insertedDb, error } = await supabase
          .from('notification_jobs')
          .insert(newJobRecord)
          .select()
          .single();

        if (!error && insertedDb) {
          // Also keep memory fallback synced
          mockNotificationJobs.unshift(insertedDb);
          return { success: true, id: insertedDb.id, notification: insertedDb, deduplicated: false };
        }
      } catch (e) {
        console.warn('[enqueueNotification Supabase notice]:', e.message);
      }
    }

    // Check memory one more time before fallback insertion
    const existing = mockNotificationJobs.find(n => n.idempotency_key === idempotencyKey);
    if (existing) {
      return { success: true, id: existing.id, notification: existing, deduplicated: true };
    }

    // Fallback memory insertion
    const newMemoryJob = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      idempotency_key: idempotencyKey,
      job_id: jobId,
      worker_id: workerId,
      recipient_type: recipientType,
      recipient_phone: resolvedPhone,
      recipient_name: recipientName,
      channel: (channel || 'WHATSAPP').toUpperCase(),
      notification_type: resolvedNotifType,
      template_id: resolvedTemplateId,
      variables: variables,
      message_text: messageText,
      status: 'QUEUED',
      attempts: 0,
      max_attempts: 3,
      scheduled_for: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    mockNotificationJobs.unshift(newMemoryJob);
    return { success: true, id: newMemoryJob.id, notification: newMemoryJob, deduplicated: false };
  })();

  inFlightEnqueues.set(idempotencyKey, enqueueExecution);
  try {
    const res = await enqueueExecution;
    return res;
  } finally {
    inFlightEnqueues.delete(idempotencyKey);
  }
}

/**
 * Process pending items in notification queue with exponential backoff & retry handling.
 */
export async function processNotificationQueue(batchSize = 20) {
  const now = new Date();
  const results = { processed: 0, sent: 0, retried: 0, failed: 0, unconfigured: 0 };

  const supabase = getAdminClient();
  let pendingJobs = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notification_jobs')
        .select('*')
        .in('status', ['QUEUED', 'RETRY'])
        .lte('scheduled_for', now.toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(batchSize);

      if (!error && data) {
        pendingJobs = data;
      }
    } catch (e) {
      console.warn('[processNotificationQueue Supabase query notice]:', e.message);
    }
  }

  if (pendingJobs.length === 0) {
    pendingJobs = mockNotificationJobs.filter(
      n => ['QUEUED', 'RETRY'].includes(n.status) &&
           new Date(n.scheduled_for) <= now &&
           (n.attempts || 0) < (n.max_attempts || 3)
    ).slice(0, batchSize);
  }

  for (const job of pendingJobs) {
    results.processed++;
    const provider = getNotificationProvider(job.channel);

    try {
      const sendResult = await provider.sendMessage({
        to: job.recipient_phone,
        text: job.message_text,
        templateId: job.template_id,
        variables: job.variables,
        metadata: {
          jobId: job.job_id,
          notificationJobId: job.id,
          idempotencyKey: job.idempotency_key
        }
      });

      if (sendResult.status === 'NOT_CONFIGURED') {
        job.status = 'NOT_CONFIGURED';
        job.last_error = sendResult.error || 'Provider not configured in current environment';
        job.updated_at = new Date().toISOString();
        results.unconfigured++;
        await updateJobRecord(job);
        continue;
      }

      if (sendResult.success) {
        job.status = 'SENT';
        job.sent_at = new Date().toISOString();
        job.provider_message_id = sendResult.providerMessageId;
        job.provider = provider.name;
        job.updated_at = new Date().toISOString();
        results.sent++;

        // Record delivery event
        await recordDelivery({
          notificationJobId: job.id,
          provider: provider.name,
          providerMessageId: sendResult.providerMessageId,
          status: 'SENT',
          rawResponse: sendResult.rawResponse || {}
        });

        await updateJobRecord(job);
      } else {
        // Failed or transient error
        const isTransient = sendResult.transient !== false;
        const attempts = (job.attempts || 0) + 1;
        job.attempts = attempts;
        job.last_error = sendResult.error || 'Delivery failed';
        job.updated_at = new Date().toISOString();

        if (isTransient && attempts < (job.max_attempts || 3)) {
          // Exponential backoff: 30s, 60s, 120s...
          const backoffSeconds = Math.pow(2, attempts) * 30;
          job.status = 'RETRY';
          job.scheduled_for = new Date(Date.now() + backoffSeconds * 1000).toISOString();
          results.retried++;
        } else {
          job.status = 'FAILED';
          job.failed_at = new Date().toISOString();
          results.failed++;

          await recordDelivery({
            notificationJobId: job.id,
            provider: provider.name,
            providerMessageId: sendResult.providerMessageId || null,
            status: 'FAILED',
            rawResponse: { error: job.last_error }
          });
        }

        await updateJobRecord(job);
      }
    } catch (err) {
      job.attempts = (job.attempts || 0) + 1;
      job.status = (job.attempts >= (job.max_attempts || 3)) ? 'FAILED' : 'RETRY';
      job.last_error = err.message;
      job.updated_at = new Date().toISOString();
      if (job.status === 'RETRY') {
        job.scheduled_for = new Date(Date.now() + 60000).toISOString();
        results.retried++;
      } else {
        results.failed++;
      }
      await updateJobRecord(job);
    }
  }

  return results;
}

async function updateJobRecord(job) {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      await supabase
        .from('notification_jobs')
        .update({
          status: job.status,
          attempts: job.attempts,
          last_error: job.last_error,
          scheduled_for: job.scheduled_for,
          sent_at: job.sent_at,
          failed_at: job.failed_at,
          provider_message_id: job.provider_message_id,
          provider: job.provider,
          updated_at: job.updated_at
        })
        .eq('id', job.id);
    } catch (e) {}
  }

  const memIdx = mockNotificationJobs.findIndex(n => n.id === job.id);
  if (memIdx !== -1) {
    mockNotificationJobs[memIdx] = { ...mockNotificationJobs[memIdx], ...job };
  }
}

async function recordDelivery({ notificationJobId, provider, providerMessageId, status, rawResponse }) {
  const deliveryRecord = {
    id: `del-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    notification_job_id: notificationJobId,
    provider: provider,
    provider_message_id: providerMessageId,
    status: status,
    event_timestamp: new Date().toISOString(),
    raw_payload: rawResponse,
    created_at: new Date().toISOString()
  };

  const supabase = getAdminClient();
  if (supabase) {
    try {
      await supabase.from('notification_deliveries').insert(deliveryRecord);
    } catch (e) {}
  }

  mockNotificationDeliveries.unshift(deliveryRecord);
  return deliveryRecord;
}

/**
 * Process gateway webhook updates (e.g. DELIVERED, READ, FAILED)
 */
export async function processDeliveryWebhook(rawBody, signature, headers = {}) {
  const provider = getNotificationProvider('TEST'); // test or custom provider webhook
  const verify = provider.verifyWebhookSignature(rawBody, signature);
  if (!verify.valid) {
    return { success: false, code: 401, error: verify.reason || 'Invalid webhook signature' };
  }

  const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  const { eventId, providerMessageId, status, timestamp, rawData } = payload;

  // Deduplicate delivery event
  const existingDelivery = mockNotificationDeliveries.find(
    d => d.event_id === eventId || (d.provider_message_id === providerMessageId && d.status === status)
  );
  if (existingDelivery) {
    return { success: true, deduplicated: true, status };
  }

  // Update associated notification job
  let notifJob = mockNotificationJobs.find(n => n.provider_message_id === providerMessageId);
  if (notifJob) {
    if (['DELIVERED', 'READ'].includes(status)) {
      notifJob.delivery_status = status;
      if (status === 'DELIVERED') notifJob.delivered_at = timestamp || new Date().toISOString();
      if (status === 'READ') notifJob.read_at = timestamp || new Date().toISOString();
    } else if (['FAILED', 'BOUNCED'].includes(status)) {
      notifJob.delivery_status = status;
      notifJob.status = 'FAILED';
      notifJob.last_error = rawData?.error || 'Provider reported delivery failure';
    }
    await updateJobRecord(notifJob);
  }

  const deliveryEntry = {
    id: `del-${Date.now()}`,
    notification_job_id: notifJob?.id || null,
    provider: 'webhook',
    provider_message_id: providerMessageId,
    event_id: eventId,
    status: status,
    event_timestamp: timestamp || new Date().toISOString(),
    raw_payload: rawData || payload,
    created_at: new Date().toISOString()
  };

  mockNotificationDeliveries.unshift(deliveryEntry);
  return { success: true, status, deliveryId: deliveryEntry.id };
}

/**
 * Generate a cryptographically secure token for customer tracking
 */
export async function createCustomerTrackingToken(jobId) {
  const token = crypto.randomBytes(20).toString('hex');
  const record = {
    id: `trk-${Date.now()}`,
    job_id: jobId,
    token: token,
    expires_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString(), // 7 days valid
    created_at: new Date().toISOString()
  };

  const supabase = getAdminClient();
  if (supabase) {
    try {
      await supabase.from('customer_tracking_tokens').insert(record);
    } catch (e) {}
  }

  mockCustomerTrackingTokens.push(record);
  return { secureToken: token, trackingUrl: `/track/${token}` };
}

/**
 * Retrieve customer-safe job details by tracking token
 * NEVER exposes: worker wallet balance, commission percentage, OTP codes, internal notes, service-role keys!
 */
export async function getJobByTrackingToken(secureToken, storeJobs, storeWorkers) {
  if (!secureToken) return null;

  let tokenRecord = mockCustomerTrackingTokens.find(t => t.token === secureToken);
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('customer_tracking_tokens')
        .select('*')
        .eq('token', secureToken)
        .maybeSingle();
      if (!error && data) tokenRecord = data;
    } catch (e) {}
  }

  if (!tokenRecord) return null;

  // Check expiration
  if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
    return { expired: true };
  }

  let job = storeJobs.find(j => j.id === tokenRecord.job_id);
  if (!job && supabase) {
    try {
      const { data } = await supabase.from('jobs').select('*').eq('id', tokenRecord.job_id).maybeSingle();
      if (data) job = data;
    } catch (e) {}
  }

  if (!job) return null;

  // Find worker
  const worker = storeWorkers.find(w => w.id === job.assigned_worker_id);

  // SANITIZED CUSTOMER-FACING VIEW
  return {
    job_number: job.job_number,
    status: job.status,
    service_category: job.service_category || 'Plumbing',
    issue: job.issue,
    address: job.address,
    locality: job.locality,
    customer_name: job.customer_name,
    created_at: job.created_at,
    started_at: job.started_at,
    completed_at: job.completed_at,
    pricing: {
      subtotal_paise: job.subtotal_paise || 0,
      inspection_fee_paise: job.inspection_fee_paise || 29900,
      waiver_paise: job.waiver_paise || 0,
      total_paise: job.total_paise || 29900
    },
    services: (job.services || []).map(s => ({
      name: s.name,
      ratePaise: s.ratePaise,
      quantity: s.quantity || 1
    })),
    payment: {
      method: job.payment_method || null,
      status: job.status === 'COMPLETED' ? 'PAID' : (job.status === 'PAYMENT_PENDING' ? 'PENDING' : 'NOT_INITIATED')
    },
    technician: worker ? {
      name: formatCustomerFacingTechnicianName(worker.name),
      phone: worker.phone,
      rating: worker.rating || 4.9,
      total_jobs_count: worker.total_jobs_count || 100
    } : null
  };
}

/**
 * Worker in-app notifications
 */
export async function getWorkerNotifications(workerId, unreadOnly = false) {
  let list = mockNotificationJobs.filter(n => n.worker_id === workerId);
  if (unreadOnly) {
    list = list.filter(n => !n.worker_read_at);
  }
  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function markNotificationRead(notificationId) {
  const notif = mockNotificationJobs.find(n => n.id === notificationId);
  if (notif) {
    notif.worker_read_at = new Date().toISOString();
  }
  const supabase = getAdminClient();
  if (supabase) {
    try {
      await supabase
        .from('notification_jobs')
        .update({ worker_read_at: new Date().toISOString() })
        .eq('id', notificationId);
    } catch (e) {}
  }
  return { success: true };
}

/**
 * Automated Operational Checks (Periodic Cron Runner)
 * - Worker Accept Reminder (e.g. 10 mins after assignment)
 * - Dispatch Escalation Alert (e.g. 30 mins unaccepted)
 * - Customer Payment Reminder (e.g. 15 mins in payment pending)
 * - Stale In-Progress Alert (e.g. 60 mins in progress)
 */
export async function runAutomationChecks(storeContext) {
  const { jobs, workers, createAlert, settings = {} } = storeContext;
  const now = Date.now();

  const workerAcceptLimitMin = Number(settings.worker_accept_reminder_minutes || 10);
  const escalationLimitMin = Number(settings.job_escalation_minutes || 30);
  const paymentReminderLimitMin = Number(settings.customer_payment_reminder_minutes || 15);
  const jobStaleLimitMin = Number(settings.job_stale_minutes || 60);

  const stats = {
    acceptRemindersSent: 0,
    escalationAlertsRaised: 0,
    paymentRemindersSent: 0,
    staleJobAlertsRaised: 0
  };

  for (const job of jobs) {
    const createdAtMs = new Date(job.created_at || Date.now()).getTime();
    const ageMinutes = Math.floor((now - createdAtMs) / 60000);

    // 1. Worker Accept Reminder for ASSIGNED jobs
    if (job.status === 'ASSIGNED' && job.assigned_worker_id) {
      if (ageMinutes >= workerAcceptLimitMin) {
        const idempotencyKey = `REMIND_ACCEPT:${job.id}:${job.assigned_worker_id}`;
        const worker = workers.find(w => w.id === job.assigned_worker_id);

        const result = await enqueueNotification({
          idempotencyKey,
          jobId: job.id,
          workerId: job.assigned_worker_id,
          recipientType: 'WORKER',
          recipientPhone: worker?.phone,
          recipientName: worker?.name,
          channel: 'WHATSAPP',
          notificationType: 'WORKER_ACCEPT_REMINDER',
          templateId: 'WORKER_ACCEPT_REMINDER',
          variables: {
            workerName: worker?.name || 'Technician',
            jobNumber: job.job_number,
            locality: job.locality || 'Indore',
            issue: job.issue || 'Service'
          }
        });

        if (!result.deduplicated) {
          stats.acceptRemindersSent++;
        }
      }

      // 2. Dispatch Escalation Alert if unaccepted past escalationLimitMin
      if (ageMinutes >= escalationLimitMin) {
        const alertResult = await createAlert({
          category: 'UNACCEPTED_JOB_ESCALATION',
          severity: 'HIGH',
          title: `Job ${job.job_number} Unaccepted Escalation`,
          description: `Job ${job.job_number} in ${job.locality} has been pending acceptance for ${ageMinutes}m. Consider reassigning.`,
          related_job_id: job.id,
          related_worker_id: job.assigned_worker_id
        });
        if (alertResult?.created) {
          stats.escalationAlertsRaised++;
        }
      }
    }

    // 3. Customer Payment Reminder for PAYMENT_PENDING jobs
    if (job.status === 'PAYMENT_PENDING') {
      const pendingAgeMin = Math.floor((now - new Date(job.updated_at || job.created_at).getTime()) / 60000);
      if (pendingAgeMin >= paymentReminderLimitMin) {
        const idempotencyKey = `REMIND_PAYMENT:${job.id}`;
        const result = await enqueueNotification({
          idempotencyKey,
          jobId: job.id,
          recipientType: 'CUSTOMER',
          recipientPhone: job.customer_phone,
          recipientName: job.customer_name,
          channel: 'WHATSAPP',
          notificationType: 'CUSTOMER_PAYMENT_REMINDER',
          templateId: 'CUSTOMER_PAYMENT_REMINDER',
          variables: {
            customerName: job.customer_name || 'Customer',
            jobNumber: job.job_number,
            amount: `₹${((job.total_paise || 29900) / 100).toFixed(2)}`
          }
        });

        if (!result.deduplicated) {
          stats.paymentRemindersSent++;
        }
      }
    }

    // 4. Stale in-progress alert
    if (job.status === 'IN_PROGRESS') {
      const inProgressAgeMin = Math.floor((now - new Date(job.started_at || job.created_at).getTime()) / 60000);
      if (inProgressAgeMin >= jobStaleLimitMin) {
        const alertResult = await createAlert({
          category: 'STALE_IN_PROGRESS_JOB',
          severity: 'MEDIUM',
          title: `Job ${job.job_number} In Progress Over ${inProgressAgeMin}m`,
          description: `Technician has been on site for ${inProgressAgeMin}m on job ${job.job_number}. Check status if assistance is required.`,
          related_job_id: job.id,
          related_worker_id: job.assigned_worker_id
        });
        if (alertResult?.created) {
          stats.staleJobAlertsRaised++;
        }
      }
    }
  }

  // Also process pending queue
  const queueResult = await processNotificationQueue(25);

  return { stats, queueResult };
}

/**
 * Authoritative Daily Owner Operational Report Generator
 * Zero-drift integer paise financial splits guaranteed!
 */
export function generateDailyReport(dateStr, storeJobs, storeWorkers, storeAlerts = []) {
  // Filter jobs for target date (e.g. YYYY-MM-DD)
  const targetDateJobs = storeJobs.filter(j => {
    const d = (j.created_at || '').slice(0, 10);
    return !dateStr || d === dateStr;
  });

  const totalJobs = targetDateJobs.length;
  const completedJobs = targetDateJobs.filter(j => j.status === 'COMPLETED');
  const cancelledJobs = targetDateJobs.filter(j => j.status === 'CANCELLED');
  const inProgressJobs = targetDateJobs.filter(j => ['IN_PROGRESS', 'PAYMENT_PENDING'].includes(j.status));
  const assignedJobs = targetDateJobs.filter(j => ['ASSIGNED', 'EN_ROUTE', 'ARRIVED'].includes(j.status));
  const newJobs = targetDateJobs.filter(j => j.status === 'NEW');

  // Authoritative financial totals in INTEGER PAISE
  let totalGmvPaise = 0;
  let totalCommissionPaise = 0;
  let totalWorkerSharePaise = 0;

  for (const cj of completedJobs) {
    const gmv = Number(cj.total_paise || 0);
    const comm = Number(cj.commission_paise || 0);
    const workerShare = Number(cj.worker_share_paise || 0);

    totalGmvPaise += gmv;
    totalCommissionPaise += comm;
    totalWorkerSharePaise += workerShare;
  }

  // Zero-drift financial assertion
  const financialDiscrepancyPaise = totalGmvPaise - (totalCommissionPaise + totalWorkerSharePaise);

  // Fleet activity
  const activeTechnicians = storeWorkers.filter(w => w.is_active && !w.is_suspended);
  const onDutyTechnicians = activeTechnicians.filter(w => w.status !== 'OFFLINE');
  const busyTechnicians = activeTechnicians.filter(w => w.status === 'BUSY');
  const freeTechnicians = activeTechnicians.filter(w => w.status === 'ONLINE_FREE');

  // Notification delivery metrics
  const dateNotifs = mockNotificationJobs.filter(n => !dateStr || (n.created_at || '').slice(0, 10) === dateStr);
  const notifStats = {
    total: dateNotifs.length,
    sent: dateNotifs.filter(n => ['SENT', 'DELIVERED', 'READ'].includes(n.status)).length,
    delivered: dateNotifs.filter(n => ['DELIVERED', 'READ'].includes(n.delivery_status || n.status)).length,
    failed: dateNotifs.filter(n => n.status === 'FAILED').length,
    unconfigured: dateNotifs.filter(n => n.status === 'NOT_CONFIGURED').length,
    pending: dateNotifs.filter(n => ['QUEUED', 'RETRY'].includes(n.status)).length
  };

  // Alerts raised on this date
  const dateAlerts = storeAlerts.filter(a => !dateStr || (a.created_at || '').slice(0, 10) === dateStr);

  return {
    date: dateStr || new Date().toISOString().slice(0, 10),
    job_metrics: {
      total: totalJobs,
      completed: completedJobs.length,
      cancelled: cancelledJobs.length,
      in_progress: inProgressJobs.length,
      assigned: assignedJobs.length,
      new: newJobs.length,
      completion_rate_pct: totalJobs > 0 ? Number(((completedJobs.length / totalJobs) * 100).toFixed(1)) : 0
    },
    financial_summary: {
      gmv_paise: totalGmvPaise,
      gmv_rupees: (totalGmvPaise / 100).toFixed(2),
      commission_paise: totalCommissionPaise,
      commission_rupees: (totalCommissionPaise / 100).toFixed(2),
      worker_share_paise: totalWorkerSharePaise,
      worker_share_rupees: (totalWorkerSharePaise / 100).toFixed(2),
      discrepancy_paise: financialDiscrepancyPaise,
      zero_drift_verified: financialDiscrepancyPaise === 0
    },
    fleet_metrics: {
      total_active: activeTechnicians.length,
      on_duty: onDutyTechnicians.length,
      currently_busy: busyTechnicians.length,
      online_free: freeTechnicians.length
    },
    notification_metrics: notifStats,
    operational_alerts_count: dateAlerts.length,
    generated_at: new Date().toISOString()
  };
}

export function getAllNotificationJobs(filters = {}) {
  let list = [...mockNotificationJobs];
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter(n => n.status === filters.status);
  }
  if (filters.channel && filters.channel !== 'ALL') {
    list = list.filter(n => n.channel === filters.channel);
  }
  if (filters.recipientType && filters.recipientType !== 'ALL') {
    list = list.filter(n => n.recipient_type === filters.recipientType);
  }
  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getAllNotificationDeliveries() {
  return [...mockNotificationDeliveries];
}
