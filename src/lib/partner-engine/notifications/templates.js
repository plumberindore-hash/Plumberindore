/**
 * Notification Template Repository & Rendering Engine
 * PlumberIndore Partner Engine - Phase 7
 */

import { getAdminClient } from '../../supabase/admin.js';

export const DEFAULT_TEMPLATES = [
  // --- WORKER TEMPLATES ---
  {
    id: 'tpl_job_assigned_worker',
    title: 'New Job Assigned (Technician)',
    channel: 'WHATSAPP',
    recipient_type: 'WORKER',
    body_template: '🚨 *New Job Assigned* - Namaste {{worker_name}}! Job: #{{job_number}}\nIssue: {{issue}}\nArea: {{area}}\nAddress: {{address}}\nPriority: {{priority}}\nCustomer: {{customer_name}}\nOpen Console: {{worker_console_url}}',
    required_variables: ['job_number', 'issue', 'area', 'priority'],
    is_enabled: true
  },
  {
    id: 'tpl_job_reassigned_worker',
    title: 'Job Reassigned to Another Worker',
    channel: 'WHATSAPP',
    recipient_type: 'WORKER',
    body_template: 'ℹ️ Job #{{job_number}} has been reassigned to another technician by dispatch operations.',
    required_variables: ['job_number'],
    is_enabled: true
  },
  {
    id: 'tpl_job_cancelled_worker',
    title: 'Job Cancelled (Technician)',
    channel: 'WHATSAPP',
    recipient_type: 'WORKER',
    body_template: '❌ Job #{{job_number}} in {{area}} has been cancelled. You are now free for new dispatches.',
    required_variables: ['job_number', 'area'],
    is_enabled: true
  },
  {
    id: 'tpl_payment_verified_worker',
    title: 'Payment Verified (Technician)',
    channel: 'WHATSAPP',
    recipient_type: 'WORKER',
    body_template: '✅ *Payment Verified*: ₹{{amount}} received for Job #{{job_number}}. Your share of ₹{{payout}} has been credited.',
    required_variables: ['job_number', 'amount', 'payout'],
    is_enabled: true
  },
  {
    id: 'tpl_wallet_low_worker',
    title: 'Low Wallet Balance Alert',
    channel: 'WHATSAPP',
    recipient_type: 'WORKER',
    body_template: '⚠️ *Low Wallet Balance*: Your balance is ₹{{balance}}. Minimum ₹100 is required for new job assignments. Please recharge at office or UPI.',
    required_variables: ['balance'],
    is_enabled: true
  },

  // --- CUSTOMER TEMPLATES ---
  {
    id: 'tpl_booking_confirmed_customer',
    title: 'Booking Confirmed (Customer)',
    channel: 'WHATSAPP',
    recipient_type: 'CUSTOMER',
    body_template: '🔧 *PlumberIndore Booking Confirmed*: Job #{{job_number}} for {{issue}} at {{area}}. Track technician live: {{tracking_url}}',
    required_variables: ['job_number', 'issue', 'area', 'tracking_url'],
    is_enabled: true
  },
  {
    id: 'tpl_technician_assigned_customer',
    title: 'Technician Assigned (Customer)',
    channel: 'WHATSAPP',
    recipient_type: 'CUSTOMER',
    body_template: '👨‍🔧 *Technician Assigned* - Namaste {{customer_name}}! {{worker_name}} ({{worker_rating}}★) has been assigned for Job #{{job_number}}. Track status: {{tracking_url}}',
    required_variables: ['job_number', 'worker_name', 'tracking_url'],
    is_enabled: true
  },
  {
    id: 'tpl_technician_enroute_customer',
    title: 'Technician En Route (Customer)',
    channel: 'WHATSAPP',
    recipient_type: 'CUSTOMER',
    body_template: '🛵 Technician {{worker_name}} is on the way to your location in {{area}}. Track live: {{tracking_url}}',
    required_variables: ['worker_name', 'area', 'tracking_url'],
    is_enabled: true
  },
  {
    id: 'tpl_technician_arrived_customer',
    title: 'Technician Arrived (Customer)',
    channel: 'WHATSAPP',
    recipient_type: 'CUSTOMER',
    body_template: '📍 Technician {{worker_name}} has arrived at your address for Job #{{job_number}}. Please provide 4-digit start OTP.',
    required_variables: ['worker_name', 'job_number'],
    is_enabled: true
  },
  {
    id: 'tpl_payment_pending_customer',
    title: 'Payment Pending (Customer)',
    channel: 'WHATSAPP',
    recipient_type: 'CUSTOMER',
    body_template: '💳 *Invoice Ready*: Total ₹{{amount}} for Job #{{job_number}}. Pay online via UPI or cash to technician. Pay here: {{tracking_url}}',
    required_variables: ['amount', 'job_number', 'tracking_url'],
    is_enabled: true
  },
  {
    id: 'tpl_payment_verified_customer',
    title: 'Payment Receipt (Customer)',
    channel: 'WHATSAPP',
    recipient_type: 'CUSTOMER',
    body_template: '🎉 *Payment Received*: ₹{{amount}} verified for Job #{{job_number}}. Digital receipt: {{tracking_url}}',
    required_variables: ['amount', 'job_number', 'tracking_url'],
    is_enabled: true
  },
  {
    id: 'tpl_job_completed_customer',
    title: 'Job Completed & Feedback (Customer)',
    channel: 'WHATSAPP',
    recipient_type: 'CUSTOMER',
    body_template: '⭐ *Job Completed* for Job #{{job_number}}: Thank you for choosing PlumberIndore! View complete job summary and receipt: {{tracking_url}}',
    required_variables: ['job_number', 'tracking_url'],
    is_enabled: true
  },
  {
    id: 'tpl_job_cancelled_customer',
    title: 'Job Cancelled (Customer)',
    channel: 'WHATSAPP',
    recipient_type: 'CUSTOMER',
    body_template: 'ℹ️ Your booking #{{job_number}} has been cancelled. If you need any assistance, please call +91 92299 59827.',
    required_variables: ['job_number'],
    is_enabled: true
  }
];

let mockTemplates = DEFAULT_TEMPLATES.map(t => ({
  ...t,
  name: t.title,
  template_text: t.body_template,
  variables: t.required_variables
}));

const TEMPLATE_ALIASES = {
  'WORKER_JOB_ASSIGNED': 'tpl_job_assigned_worker',
  'WORKER_ACCEPT_REMINDER': 'tpl_job_assigned_worker',
  'WORKER_REASSIGNED': 'tpl_job_reassigned_worker',
  'WORKER_JOB_CANCELLED': 'tpl_job_cancelled_worker',
  'WORKER_PAYMENT_VERIFIED': 'tpl_payment_verified_worker',
  'CUSTOMER_TECHNICIAN_DISPATCHED': 'tpl_technician_assigned_customer',
  'CUSTOMER_JOB_STARTED': 'tpl_technician_arrived_customer',
  'CUSTOMER_PAYMENT_PENDING': 'tpl_payment_pending_customer',
  'CUSTOMER_PAYMENT_REMINDER': 'tpl_payment_pending_customer',
  'CUSTOMER_PAYMENT_VERIFIED': 'tpl_payment_verified_customer',
  'CUSTOMER_JOB_COMPLETED': 'tpl_job_completed_customer',
  'CUSTOMER_JOB_CANCELLED': 'tpl_job_cancelled_customer'
};

/**
 * Validates and safely renders template body with provided variables
 */
export function renderTemplate(templateOrId, variables = {}) {
  let targetId = typeof templateOrId === 'string' ? templateOrId : templateOrId?.id;
  if (TEMPLATE_ALIASES[targetId]) {
    targetId = TEMPLATE_ALIASES[targetId];
  }

  let template = typeof templateOrId === 'object' && templateOrId !== null
    ? templateOrId
    : mockTemplates.find(t => t.id === targetId || t.id === templateOrId);

  if (!template) {
    return {
      success: false,
      error: `Template not found: ${templateOrId}`,
      message: ''
    };
  }

  // Normalize variables across camelCase and snake_case
  const mergedVars = { ...variables };
  if (variables.workerName) mergedVars.worker_name = variables.workerName;
  if (variables.jobNumber) mergedVars.job_number = variables.jobNumber;
  if (variables.customerName) mergedVars.customer_name = variables.customerName;
  if (variables.customerPhone) mergedVars.customer_phone = variables.customerPhone;
  if (variables.trackingLink) mergedVars.tracking_url = variables.trackingLink;
  if (variables.locality) mergedVars.area = variables.locality;
  if (variables.technicianName) mergedVars.worker_name = variables.technicianName;
  if (variables.technicianPhone) mergedVars.worker_phone = variables.technicianPhone;
  if (!mergedVars.worker_rating) mergedVars.worker_rating = '4.9';
  if (!mergedVars.worker_console_url) mergedVars.worker_console_url = 'https://plumberindore.in/partner';
  if (!mergedVars.priority) mergedVars.priority = 'Normal';
  if (!mergedVars.tracking_url) mergedVars.tracking_url = 'https://plumberindore.in';

  // Validate required variables
  const missing = [];
  if (Array.isArray(template.required_variables)) {
    for (const v of template.required_variables) {
      if (mergedVars[v] === undefined || mergedVars[v] === null || String(mergedVars[v]).trim() === '') {
        missing.push(v);
      }
    }
  }

  if (missing.length > 0) {
    return {
      success: false,
      error: `Missing required variables for ${template.id}: ${missing.join(', ')}`,
      message: ''
    };
  }

  // Replace variables safely
  let rendered = template.body_template || template.template_text || '';
  for (const [key, val] of Object.entries(mergedVars)) {
    const safeVal = String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    rendered = rendered.replaceAll(`{{${key}}}`, safeVal);
  }

  return {
    success: true,
    templateId: template.id,
    title: template.title || template.name,
    channel: template.channel,
    renderedBody: rendered,
    message: rendered
  };
}

export async function getNotificationTemplates() {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('notification_templates').select('*');
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {}
  }
  return [...mockTemplates];
}

export async function getNotificationTemplate(id) {
  const templates = await getNotificationTemplates();
  return templates.find(t => t.id === id) || null;
}

export async function updateNotificationTemplate(id, fields) {
  const normFields = { ...fields };
  if (normFields.template_text && !normFields.body_template) {
    normFields.body_template = normFields.template_text;
  }
  if (normFields.body_template && !normFields.template_text) {
    normFields.template_text = normFields.body_template;
  }

  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .update({ ...normFields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        return { success: true, ...data, template: data };
      }
    } catch (e) {}
  }

  const idx = mockTemplates.findIndex(t => t.id === id);
  if (idx !== -1) {
    mockTemplates[idx] = { ...mockTemplates[idx], ...normFields, updated_at: new Date().toISOString() };
    return { success: true, ...mockTemplates[idx], template: mockTemplates[idx] };
  }
  return { success: false, error: 'Template not found' };
}
