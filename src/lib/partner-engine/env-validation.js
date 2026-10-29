/**
 * Production Environment Validation & Security Health System
 * PlumberIndore Partner Engine - Phase 8 Production Hardening
 *
 * Evaluates production readiness across all subsystems without exposing secrets.
 * Enforces fail-safe configurations and detects unsafe production flags.
 */

import { isServiceRoleKeyValid } from '../supabase/admin.js';

export const CONFIG_STATUS = {
  CONFIGURED: 'CONFIGURED',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  DISABLED: 'DISABLED',
  UNSAFE_CONFIGURATION: 'UNSAFE_CONFIGURATION',
  TEST_MODE: 'TEST_MODE'
};

/**
 * Validates the complete environment configuration safely.
 * Returns structured diagnostics with masked/boolean status only.
 * NEVER exposes secret values.
 */
export function validateEnvironment(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';
  const issues = [];
  const warnings = [];

  // 1. Supabase Infrastructure Check
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_KEY;

  let supabaseStatus = CONFIG_STATUS.CONFIGURED;
  if (!supabaseUrl || !anonKey) {
    supabaseStatus = CONFIG_STATUS.NOT_CONFIGURED;
    issues.push('Missing Supabase public URL or anon key');
  }

  const hasRealServiceRole = isServiceRoleKeyValid(serviceRoleKey);

  if (!hasRealServiceRole) {
    if (isProduction) {
      supabaseStatus = CONFIG_STATUS.UNSAFE_CONFIGURATION;
      issues.push('Production requires valid SUPABASE_SERVICE_ROLE_KEY for server operations and atomic RPCs');
    } else {
      warnings.push('SUPABASE_SERVICE_ROLE_KEY missing; server operations running in standalone fallback');
    }
  }

  // Check for dangerous client exposure
  const publicEnvKeys = Object.keys(env).filter(k => k.startsWith('NEXT_PUBLIC_'));
  for (const k of publicEnvKeys) {
    const l = k.toLowerCase();
    if (l.includes('service_role') || l.includes('secret') || l.includes('private_key')) {
      supabaseStatus = CONFIG_STATUS.UNSAFE_CONFIGURATION;
      issues.push(`SECURITY VIOLATION: "${k}" exposes secret to browser bundle`);
    }
  }

  // 2. Payments Subsystem Check (Razorpay)
  const paymentsEnabled = env.PAYMENTS_ENABLED === 'true';
  const paymentProvider = (env.PAYMENT_PROVIDER || 'TEST').toUpperCase();
  const paymentKeyId = env.PAYMENT_KEY_ID || env.RAZORPAY_KEY_ID;
  const paymentKeySecret = env.PAYMENT_KEY_SECRET || env.RAZORPAY_KEY_SECRET;
  const paymentWebhookSecret = env.PAYMENT_WEBHOOK_SECRET || env.RAZORPAY_WEBHOOK_SECRET;

  let paymentsStatus = CONFIG_STATUS.DISABLED;
  if (!paymentsEnabled) {
    paymentsStatus = CONFIG_STATUS.DISABLED;
  } else if (paymentProvider === 'RAZORPAY') {
    if (paymentKeyId && paymentKeySecret && paymentWebhookSecret) {
      paymentsStatus = CONFIG_STATUS.CONFIGURED;
    } else {
      paymentsStatus = CONFIG_STATUS.UNSAFE_CONFIGURATION;
      issues.push('PAYMENTS_ENABLED=true with RAZORPAY but PAYMENT_KEY_ID, PAYMENT_KEY_SECRET, or PAYMENT_WEBHOOK_SECRET missing');
    }
  } else if (paymentProvider === 'TEST') {
    if (isProduction && env.PAYMENT_PROVIDER_ALLOW_TEST !== 'true') {
      paymentsStatus = CONFIG_STATUS.UNSAFE_CONFIGURATION;
      issues.push('PAYMENTS_ENABLED=true with TEST provider is forbidden in production');
    } else {
      paymentsStatus = CONFIG_STATUS.TEST_MODE;
      warnings.push('Payments running in isolated TEST mode');
    }
  } else {
    paymentsStatus = CONFIG_STATUS.NOT_CONFIGURED;
    issues.push(`Unknown PAYMENT_PROVIDER: "${paymentProvider}"`);
  }

  // 3. WhatsApp Notifications Subsystem Check
  const notificationsEnabled = env.NOTIFICATIONS_ENABLED === 'true';
  const notificationProvider = (env.NOTIFICATION_PROVIDER || 'TEST').toUpperCase();
  const waAccessToken = env.WHATSAPP_ACCESS_TOKEN;
  const waPhoneId = env.WHATSAPP_PHONE_NUMBER_ID;
  const waWebhookSecret = env.WHATSAPP_WEBHOOK_SECRET;

  let whatsappStatus = CONFIG_STATUS.DISABLED;
  if (!notificationsEnabled) {
    whatsappStatus = CONFIG_STATUS.DISABLED;
  } else if (notificationProvider === 'WHATSAPP' || env.WHATSAPP_ENABLED === 'true') {
    if (waAccessToken && waPhoneId) {
      whatsappStatus = CONFIG_STATUS.CONFIGURED;
    } else {
      whatsappStatus = CONFIG_STATUS.NOT_CONFIGURED;
      if (isProduction) {
        issues.push('WhatsApp enabled but WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing');
      }
    }
  } else if (notificationProvider === 'TEST') {
    if (isProduction && env.NOTIFICATION_PROVIDER_ALLOW_TEST !== 'true') {
      whatsappStatus = CONFIG_STATUS.UNSAFE_CONFIGURATION;
      issues.push('NOTIFICATIONS_ENABLED=true with TEST provider is forbidden in production');
    } else {
      whatsappStatus = CONFIG_STATUS.TEST_MODE;
    }
  }

  // 4. SMS Subsystem Check
  const smsApiKey = env.SMS_API_KEY || env.SMS_GATEWAY_API_KEY;
  let smsStatus = CONFIG_STATUS.DISABLED;
  if (!notificationsEnabled || env.SMS_ENABLED === 'false') {
    smsStatus = CONFIG_STATUS.DISABLED;
  } else if (smsApiKey) {
    smsStatus = CONFIG_STATUS.CONFIGURED;
  } else if (env.SMS_ENABLED === 'true') {
    smsStatus = CONFIG_STATUS.NOT_CONFIGURED;
  }

  // 5. Cron & Background Automation Check
  const cronSecret = env.CRON_SECRET;
  let cronStatus = CONFIG_STATUS.CONFIGURED;
  if (!cronSecret) {
    cronStatus = isProduction ? CONFIG_STATUS.UNSAFE_CONFIGURATION : CONFIG_STATUS.NOT_CONFIGURED;
    if (isProduction) {
      issues.push('CRON_SECRET missing in production; scheduled automation endpoint unprotected');
    } else {
      warnings.push('CRON_SECRET not set; local cron triggers unauthenticated');
    }
  } else if (cronSecret.length < 16) {
    cronStatus = CONFIG_STATUS.UNSAFE_CONFIGURATION;
    warnings.push('CRON_SECRET has low entropy (recommended >= 16 characters)');
  }

  // 6. Admin Authentication Secret Check
  const adminSecret = env.ADMIN_SECRET_KEY || env.ADMIN_KEY;
  let adminAuthStatus = CONFIG_STATUS.CONFIGURED;
  if (!adminSecret) {
    adminAuthStatus = isProduction ? CONFIG_STATUS.UNSAFE_CONFIGURATION : CONFIG_STATUS.NOT_CONFIGURED;
    if (isProduction) {
      issues.push('ADMIN_SECRET_KEY missing in production; administrative programmatic bypass/access unavailable');
    } else {
      warnings.push('ADMIN_SECRET_KEY missing; using local session cookies only');
    }
  }

  // Determine overall readiness certification classification
  let certification = 'GO-LIVE READY';
  if (isProduction && !hasRealServiceRole) {
    certification = 'NOT GO-LIVE READY';
  } else if (issues.length > 0) {
    const criticalCodeOrSecurityIssues = issues.filter(
      i => !i.includes('PAYMENTS_ENABLED') && 
           !i.includes('WhatsApp enabled') && 
           !i.includes('CRON_SECRET')
    );

    if (criticalCodeOrSecurityIssues.length > 0) {
      certification = 'NOT GO-LIVE READY';
    } else {
      certification = 'CONDITIONALLY GO-LIVE READY';
    }
  } else if (paymentsStatus !== CONFIG_STATUS.CONFIGURED || whatsappStatus !== CONFIG_STATUS.CONFIGURED) {
    certification = 'CONDITIONALLY GO-LIVE READY';
  }

  return {
    isProduction,
    certification,
    subsystems: {
      supabase: {
        status: supabaseStatus,
        hasServiceRole: hasRealServiceRole,
        urlConfigured: Boolean(supabaseUrl)
      },
      payments: {
        status: paymentsStatus,
        enabled: paymentsEnabled,
        provider: paymentProvider,
        hasKeyId: Boolean(paymentKeyId),
        hasKeySecret: Boolean(paymentKeySecret),
        hasWebhookSecret: Boolean(paymentWebhookSecret)
      },
      whatsapp: {
        status: whatsappStatus,
        enabled: notificationsEnabled && (notificationProvider === 'WHATSAPP' || env.WHATSAPP_ENABLED === 'true'),
        hasAccessToken: Boolean(waAccessToken),
        hasPhoneId: Boolean(waPhoneId),
        hasWebhookSecret: Boolean(waWebhookSecret)
      },
      sms: {
        status: smsStatus,
        enabled: notificationsEnabled && env.SMS_ENABLED === 'true',
        hasApiKey: Boolean(smsApiKey)
      },
      cron: {
        status: cronStatus,
        hasSecret: Boolean(cronSecret)
      },
      adminAuth: {
        status: adminAuthStatus,
        hasSecret: Boolean(adminSecret)
      }
    },
    issues,
    warnings,
    validatedAt: new Date().toISOString()
  };
}
