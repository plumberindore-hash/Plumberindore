import { getAdminClient } from '../lib/supabase/admin.js';

export const ADMIN_NOTIFICATION_EMAIL = process.env.BUSINESS_NOTIFICATION_EMAIL || 'plumberindore@gmail.com';
export const ADMIN_BACKUP_EMAIL = process.env.ADMIN_BACKUP_NOTIFICATION_EMAIL || 'patidaransh275@gmail.com';
export const ADMIN_NOTIFICATION_RECIPIENTS = [ADMIN_NOTIFICATION_EMAIL, ADMIN_BACKUP_EMAIL];

const PRIMARY_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'plumberindore@gmail.com';
const PRIMARY_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Plumber Indore';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Strict email format validator
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Normalizes email input into Brevo recipient objects: [{ email, name }]
 */
function normalizeRecipients(input) {
  if (!input) return [];
  const list = Array.isArray(input) ? input : [input];
  const normalized = [];

  for (const item of list) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (isValidEmail(trimmed)) {
        normalized.push({ email: trimmed });
      }
    } else if (item && typeof item === 'object' && item.email) {
      const trimmed = String(item.email).trim();
      if (isValidEmail(trimmed)) {
        normalized.push({
          email: trimmed,
          ...(item.name ? { name: String(item.name).trim() } : {})
        });
      }
    }
  }

  return normalized;
}

/**
 * Normalizes a single reply-to email
 */
function normalizeReplyTo(input) {
  if (!input) return undefined;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return isValidEmail(trimmed) ? { email: trimmed } : undefined;
  }
  if (typeof input === 'object' && input.email) {
    const trimmed = String(input.email).trim();
    return isValidEmail(trimmed)
      ? { email: trimmed, ...(input.name ? { name: String(input.name).trim() } : {}) }
      : undefined;
  }
  return undefined;
}

/**
 * Logs transactional email outcome to Supabase email_logs table
 */
async function logEmailToSupabase({ recipient, subject, emailType, status, messageId, errorMessage }) {
  try {
    const supabase = getAdminClient();
    if (!supabase) return;

    await supabase.from('email_logs').insert({
      recipient,
      subject,
      email_type: emailType || 'transactional',
      status, // 'sent' or 'failed'
      message_id: messageId || null,
      error_message: errorMessage || null
    });
  } catch (err) {
    // Non-blocking catch for database logging errors
    console.warn('[Brevo Supabase Log Notice] Could not write to email_logs:', err?.message || err);
  }
}

/**
 * Core function to send transactional emails via Brevo v3 REST API
 * 
 * @param {Object} options
 * @param {string|string[]|Object|Object[]} options.to - Recipient(s)
 * @param {string} options.subject - Subject line
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content fallback
 * @param {string|Object} [options.replyTo] - Reply-To address
 * @param {string|string[]} [options.cc] - Carbon copy recipients
 * @param {string|string[]} [options.bcc] - Blind carbon copy recipients
 * @param {Object} [options.sender] - Custom sender object { name, email }
 * @param {string} [options.emailType] - Type of email for audit logging
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  cc,
  bcc,
  sender,
  emailType = 'transactional'
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('[Brevo Config Warning] BREVO_API_KEY is not defined in environment variables. Email will not be dispatched.');
    return {
      success: false,
      error: 'BREVO_API_KEY is missing from environment.'
    };
  }

  const recipients = normalizeRecipients(to);
  if (recipients.length === 0) {
    console.warn('[Brevo Validation Warning] No valid recipient email addresses provided to sendEmail.');
    return {
      success: false,
      error: 'No valid recipient email address found.'
    };
  }

  const senderObj = {
    name: sender?.name || PRIMARY_SENDER_NAME,
    email: sender?.email || PRIMARY_SENDER_EMAIL
  };

  const payload = {
    sender: senderObj,
    to: recipients,
    subject: subject || 'Plumber Indore Notification',
    htmlContent: html || `<p>${text || ''}</p>`,
    ...(text ? { textContent: text } : {}),
    ...(replyTo ? { replyTo: normalizeReplyTo(replyTo) } : {}),
    ...(cc ? { cc: normalizeRecipients(cc) } : {}),
    ...(bcc ? { bcc: normalizeRecipients(bcc) } : {})
  };

  const recipientString = recipients.map(r => r.email).join(', ');

  try {
    console.log(`[Brevo Request] Dispatching transactional email to ${recipientString} (Subject: "${subject}")...`);

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.message || `Brevo HTTP error ${response.status}: ${response.statusText}`;
      console.error(`[Brevo Dispatch Error for ${recipientString}]:`, JSON.stringify(data, null, 2));

      await logEmailToSupabase({
        recipient: recipientString,
        subject,
        emailType,
        status: 'failed',
        errorMessage: errorMsg
      });

      return {
        success: false,
        error: errorMsg,
        details: data
      };
    }

    console.log(`[Brevo Response Success] Delivered to ${recipientString} | Message ID: ${data?.messageId}`);

    await logEmailToSupabase({
      recipient: recipientString,
      subject,
      emailType,
      status: 'sent',
      messageId: data?.messageId
    });

    return {
      success: true,
      data: {
        messageId: data?.messageId,
        recipient: recipientString
      }
    };

  } catch (err) {
    console.error(`[Brevo Exception] Unexpected exception delivering email to ${recipientString}:`, err);

    await logEmailToSupabase({
      recipient: recipientString,
      subject,
      emailType,
      status: 'failed',
      errorMessage: err?.message || String(err)
    });

    return {
      success: false,
      error: err?.message || 'Unexpected network error dispatching Brevo email.'
    };
  }
}

/**
 * Convenience helper for admin alerts.
 * Routes to both plumberindore@gmail.com and patidaransh275@gmail.com by default.
 */
export async function sendNotificationEmail({ subject, html, replyTo = ADMIN_NOTIFICATION_EMAIL, to, emailType = 'admin_alert' }) {
  return sendEmail({
    to: to || ADMIN_NOTIFICATION_RECIPIENTS,
    subject,
    html,
    replyTo,
    emailType
  });
}

export default {
  sendEmail,
  sendNotificationEmail,
  isValidEmail,
  ADMIN_NOTIFICATION_EMAIL,
  ADMIN_BACKUP_EMAIL,
  ADMIN_NOTIFICATION_RECIPIENTS
};
