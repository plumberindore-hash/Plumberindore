/**
 * Production Safe Logger for PlumberIndore Partner Engine
 * Automatically scrubs sensitive fields (OTP, tokens, secrets, passwords)
 * Formats structured logs for Vercel Logs, Axiom, or Datadog
 */

const SENSITIVE_KEYS = new Set([
  'otp',
  'start_otp',
  'end_otp',
  'otp_code',
  'token',
  'worker_token',
  'password',
  'secret',
  'service_role',
  'service_role_key',
  'authorization',
  'cookie',
  'api_key'
]);

/**
 * Recursively sanitizes objects to ensure zero credential or OTP leaks in logs
 */
function sanitizeData(data, depth = 0) {
  if (!data || depth > 4) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, depth + 1));
  }

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('otp') || lowerKey.includes('secret') || lowerKey.includes('token')) {
      clean[key] = '[REDACTED_CONFIDENTIAL]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeData(value, depth + 1);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export const logger = {
  info(event, details = {}) {
    const payload = {
      level: 'INFO',
      event,
      timestamp: new Date().toISOString(),
      ...sanitizeData(details)
    };
    console.log(JSON.stringify(payload));
  },

  warn(event, details = {}) {
    const payload = {
      level: 'WARN',
      event,
      timestamp: new Date().toISOString(),
      ...sanitizeData(details)
    };
    console.warn(JSON.stringify(payload));
  },

  error(event, error, details = {}) {
    const payload = {
      level: 'ERROR',
      event,
      message: error?.message || String(error),
      code: error?.code,
      timestamp: new Date().toISOString(),
      ...sanitizeData(details)
    };
    console.error(JSON.stringify(payload));
  },

  security(event, details = {}) {
    const payload = {
      level: 'SECURITY_AUDIT',
      event,
      timestamp: new Date().toISOString(),
      ...sanitizeData(details)
    };
    console.warn(JSON.stringify(payload));
  }
};
