/**
 * Isolated Test Payment Provider for Development & Automated Testing
 * PlumberIndore Partner Engine - Phase 6
 * Tagged strictly with TEST_ONLY verification source.
 */

import crypto from 'crypto';
import { BasePaymentProvider } from './base.js';

export const TEST_WEBHOOK_SECRET = 'pi_test_webhook_secret_key_84595';

export class TestPaymentProvider extends BasePaymentProvider {
  constructor() {
    super('TEST_PROVIDER');
    this.name = 'test_gateway';
    this.mockOrders = new Map();
    this.webhookSecret = TEST_WEBHOOK_SECRET;
    this.secret = TEST_WEBHOOK_SECRET;
  }

  async createPaymentOrder({ jobId, jobNumber, amountPaise, currency = 'INR', customerName, customerPhone }) {
    const timestamp = Date.now();
    const providerOrderId = `order_test_${timestamp}_${Math.floor(1000 + Math.random() * 9000)}`;
    const providerReference = `REF-${jobNumber || 'JOB'}-${timestamp.toString().slice(-4)}`;
    const rupees = (Number(amountPaise) / 100).toFixed(0);

    const upiIntentString = `upi://pay?pa=plumberindore@okaxis&pn=PlumberIndore&am=${rupees}&cu=INR&tn=Job-${jobNumber || '1028'}`;
    const paymentUrl = `https://test-pay.plumberindore.in/pay/${providerOrderId}`;

    const orderData = {
      providerOrderId,
      providerReference,
      jobId,
      jobNumber,
      amountPaise: Number(amountPaise),
      currency: currency.toUpperCase(),
      customerName,
      customerPhone,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.mockOrders.set(providerOrderId, orderData);

    return {
      providerOrderId,
      providerReference,
      paymentUrl,
      upiIntentString,
      upiQrPayload: upiIntentString,
      upiQrDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiIntentString)}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      metadata: {
        verificationSource: 'TEST_ONLY',
        testEnvironment: true
      }
    };
  }

  async getPaymentStatus(providerOrderId, providerPaymentId = null) {
    const order = this.mockOrders.get(providerOrderId);
    if (!order) {
      return {
        status: 'PENDING',
        amountPaise: 0,
        currency: 'INR',
        providerPaymentId: null
      };
    }

    return {
      status: order.status,
      amountPaise: order.amountPaise,
      currency: order.currency,
      providerPaymentId: order.providerPaymentId || `pay_test_${Date.now()}`
    };
  }

  async fetchPaymentStatus({ providerOrderId, providerPaymentId } = {}) {
    const res = await this.getPaymentStatus(providerOrderId, providerPaymentId);
    return {
      status: res.status === 'VERIFIED' ? 'PAID' : res.status,
      amountPaise: res.amountPaise,
      currency: res.currency,
      providerPaymentId: res.providerPaymentId
    };
  }

  /**
   * Validates webhook signature with timing safety and replay protection
   */
  verifyWebhookSignature(rawBody, signature, headers = {}) {
    if (!rawBody || !signature) return false;

    // Replay protection: check timestamp header if present
    const tsHeader = headers['x-webhook-timestamp'] || headers['x-razorpay-timestamp'];
    if (tsHeader) {
      const tsNum = Number(tsHeader);
      const nowSec = Math.floor(Date.now() / 1000);
      if (isNaN(tsNum) || Math.abs(nowSec - tsNum) > 300) {
        return false; // Replay window exceeded (+/- 300s)
      }
    }

    // Try computing signature both with timestamp prefix and without
    const candidates = [];
    if (tsHeader) {
      candidates.push(
        crypto.createHmac('sha256', this.webhookSecret).update(`${tsHeader}.${rawBody}`).digest('hex')
      );
    }
    candidates.push(
      crypto.createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex')
    );

    const sigBuffer = Buffer.from(signature);

    for (const expected of candidates) {
      const expBuffer = Buffer.from(expected);
      if (sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer)) {
        return true;
      }
    }

    return false;
  }

  async verifyWebhook({ rawBody, signature, headers = {} }) {
    const isValid = this.verifyWebhookSignature(rawBody, signature, headers);
    if (!isValid) {
      return { isValid: false, eventId: '', eventType: '', error: 'Invalid HMAC signature or expired timestamp' };
    }

    let parsed;
    try {
      parsed = JSON.parse(rawBody);
    } catch (e) {
      return { isValid: false, eventId: '', eventType: '', error: 'Invalid JSON' };
    }

    const eventId = parsed.event_id || `evt_${Date.now()}`;
    const eventType = parsed.event || parsed.event_type || 'payment.captured';
    const payload = parsed.payload || parsed.data || parsed;

    const providerOrderId = payload.provider_order_id || payload.order_id;
    const providerPaymentId = payload.provider_payment_id || payload.payment_id || `pay_test_${Date.now()}`;
    const amountPaise = payload.amount_paise !== undefined ? Number(payload.amount_paise) : (payload.amount ? Math.round(Number(payload.amount) * 100) : undefined);
    const currency = (payload.currency || 'INR').toUpperCase();

    if (providerOrderId && this.mockOrders.has(providerOrderId)) {
      const order = this.mockOrders.get(providerOrderId);
      if (eventType === 'payment.captured') {
        order.status = 'VERIFIED';
        order.providerPaymentId = providerPaymentId;
      } else if (eventType === 'payment.failed') {
        order.status = 'FAILED';
      }
    }

    return {
      isValid: true,
      eventId,
      eventType,
      providerOrderId,
      providerPaymentId,
      amountPaise,
      currency,
      metadata: {
        verificationSource: 'TEST_ONLY',
        rawPayload: payload
      }
    };
  }

  async refundPayment({ providerPaymentId, amountPaise, reason }) {
    return {
      refundId: `rfnd_test_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      status: 'REFUNDED',
      amountPaise: Number(amountPaise),
      reason,
      processedAt: new Date().toISOString()
    };
  }

  async processRefund(params) {
    return this.refundPayment(params);
  }
}
