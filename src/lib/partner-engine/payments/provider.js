/**
 * Payment Provider Abstraction Interface & Factory
 * PlumberIndore Partner Engine - Phase 6
 */

import { BasePaymentProvider } from './base.js';
import { TestPaymentProvider } from './test-provider.js';
import { RazorpayPaymentProvider } from './razorpay-provider.js';

export { BasePaymentProvider };

/**
 * Factory to retrieve the active payment provider based on environment configuration
 * @returns {BasePaymentProvider}
 */
export function getPaymentProvider() {
  const providerName = (process.env.PAYMENT_PROVIDER || 'TEST').toUpperCase();
  const paymentsEnabled = process.env.PAYMENTS_ENABLED === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  const unconfiguredProvider = {
    name: 'UNCONFIGURED',
    isConfigured: false,
    createPaymentOrder: async () => {
      throw new Error('Live payment gateway credentials not configured. UPI payments are currently disabled.');
    },
    getPaymentStatus: async () => ({ status: 'NOT_CONFIGURED', amountPaise: 0, currency: 'INR' }),
    fetchPaymentStatus: async () => ({ status: 'NOT_CONFIGURED', amountPaise: 0, currency: 'INR' }),
    verifyWebhook: async () => ({ isValid: false, eventId: '', eventType: '' }),
    verifyWebhookSignature: () => false,
    refundPayment: async () => { throw new Error('Live payments not enabled'); },
    processRefund: async () => { throw new Error('Live payments not enabled'); },
    verifyAmount: () => false
  };

  // 1. In production, strict guards against test simulation and unconfigured credentials
  if (isProduction) {
    if (!paymentsEnabled && providerName !== 'TEST_ALLOW_PROD') {
      return unconfiguredProvider;
    }

    if (providerName === 'RAZORPAY') {
      const keyId = process.env.PAYMENT_KEY_ID || process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.PAYMENT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
      const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!keyId || !keySecret) {
        return unconfiguredProvider;
      }

      return new RazorpayPaymentProvider({
        keyId,
        keySecret,
        webhookSecret: webhookSecret || keySecret
      });
    }

    if (providerName !== 'TEST_ALLOW_PROD') {
      return unconfiguredProvider;
    }
  }

  // 2. Razorpay Provider (Development)
  if (providerName === 'RAZORPAY') {
    const keyId = process.env.PAYMENT_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.PAYMENT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!keyId || !keySecret) {
      console.warn('[PaymentProvider] Live credentials missing, falling back to TestPaymentProvider for local dev');
      return new TestPaymentProvider();
    }

    return new RazorpayPaymentProvider({
      keyId,
      keySecret,
      webhookSecret: webhookSecret || keySecret
    });
  }

  // 3. Test Provider (Development / Automated Tests)
  return new TestPaymentProvider();
}
