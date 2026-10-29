/**
 * Production Razorpay / UPI Gateway Adapter
 * PlumberIndore Partner Engine - Phase 6
 */

import crypto from 'crypto';
import { BasePaymentProvider } from './base.js';

export class RazorpayPaymentProvider extends BasePaymentProvider {
  constructor({ keyId, keySecret, webhookSecret }) {
    super('RAZORPAY');
    this.name = 'razorpay';
    this.keyId = keyId;
    this.keySecret = keySecret;
    this.webhookSecret = webhookSecret || keySecret;
    this.secret = this.webhookSecret;
  }

  async createPaymentOrder({ jobId, jobNumber, amountPaise, currency = 'INR', customerName, customerPhone, notes = '' }) {
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const orderPayload = {
      amount: Number(amountPaise), // Razorpay accepts amounts in paise
      currency: currency.toUpperCase(),
      receipt: `PI-${jobNumber || jobId.slice(0, 8)}`,
      notes: {
        job_id: jobId,
        job_number: jobNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        notes
      }
    };

    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Razorpay order creation failed: ${errText}`);
      }

      const orderData = await response.json();
      const rupees = (Number(amountPaise) / 100).toFixed(0);
      const upiIntentString = `upi://pay?pa=plumberindore@okaxis&pn=PlumberIndore&am=${rupees}&cu=INR&tn=Job-${jobNumber || '1028'}`;

      return {
        providerOrderId: orderData.id,
        providerReference: orderData.receipt,
        upiIntentString,
        upiQrPayload: upiIntentString,
        upiQrDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiIntentString)}`,
        paymentUrl: orderData.short_url || null,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        metadata: {
          rawOrder: orderData,
          verificationSource: 'GATEWAY_API'
        }
      };
    } catch (err) {
      console.error('[RazorpayPaymentProvider createPaymentOrder error]:', err.message);
      throw err;
    }
  }

  async getPaymentStatus(providerOrderId, providerPaymentId = null) {
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

    try {
      const url = providerPaymentId 
        ? `https://api.razorpay.com/v1/payments/${providerPaymentId}`
        : `https://api.razorpay.com/v1/orders/${providerOrderId}`;

      const res = await fetch(url, {
        headers: { 'Authorization': authHeader }
      });

      if (!res.ok) {
        return { status: 'PENDING', amountPaise: 0, currency: 'INR' };
      }

      const data = await res.json();
      let status = 'PENDING';
      if (data.status === 'captured' || data.status === 'paid') status = 'VERIFIED';
      else if (data.status === 'failed') status = 'FAILED';
      else if (data.status === 'expired') status = 'EXPIRED';

      return {
        status,
        amountPaise: Number(data.amount || 0),
        currency: (data.currency || 'INR').toUpperCase(),
        providerPaymentId: data.id || providerPaymentId
      };
    } catch (err) {
      console.warn('[RazorpayPaymentProvider getPaymentStatus error]:', err.message);
      return { status: 'PENDING', amountPaise: 0, currency: 'INR' };
    }
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

  verifyWebhookSignature(rawBody, signature, headers = {}) {
    if (!rawBody || !signature) return false;

    // Check replay tolerance (+/- 300s)
    const tsHeader = headers['x-razorpay-timestamp'] || headers['x-webhook-timestamp'];
    if (tsHeader) {
      const tsNum = Number(tsHeader);
      const nowSec = Math.floor(Date.now() / 1000);
      if (isNaN(tsNum) || Math.abs(nowSec - tsNum) > 300) {
        return false;
      }
    }

    const expected = crypto.createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');
    const sigBuffer = Buffer.from(signature);
    const expBuffer = Buffer.from(expected);

    return sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer);
  }

  async verifyWebhook({ rawBody, signature, headers = {} }) {
    if (!this.verifyWebhookSignature(rawBody, signature, headers)) {
      return { isValid: false, eventId: '', eventType: '', error: 'Signature mismatch or expired timestamp' };
    }

    let parsed;
    try {
      parsed = JSON.parse(rawBody);
    } catch (e) {
      return { isValid: false, eventId: '', eventType: '', error: 'Invalid JSON payload' };
    }

    const eventId = parsed.event_id || headers['x-razorpay-event-id'] || `evt_${Date.now()}`;
    const eventType = parsed.event || 'payment.captured';
    const paymentEntity = parsed.payload?.payment?.entity || {};
    const orderEntity = parsed.payload?.order?.entity || {};

    const providerOrderId = paymentEntity.order_id || orderEntity.id;
    const providerPaymentId = paymentEntity.id;
    const amountPaise = paymentEntity.amount !== undefined ? Number(paymentEntity.amount) : undefined;
    const currency = (paymentEntity.currency || 'INR').toUpperCase();

    return {
      isValid: true,
      eventId,
      eventType,
      providerOrderId,
      providerPaymentId,
      amountPaise,
      currency,
      metadata: {
        verificationSource: 'GATEWAY_WEBHOOK',
        rawEntity: paymentEntity
      }
    };
  }

  async refundPayment({ providerPaymentId, amountPaise, reason }) {
    const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1/payments/${providerPaymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: Number(amountPaise),
        notes: { reason }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Refund failed: ${errText}`);
    }

    const data = await res.json();
    return {
      refundId: data.id,
      status: 'REFUNDED'
    };
  }

  async processRefund(params) {
    return this.refundPayment(params);
  }
}
