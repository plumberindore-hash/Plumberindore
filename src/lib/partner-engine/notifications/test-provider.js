/**
 * Isolated Test Notification Provider
 * PlumberIndore Partner Engine - Phase 7
 * Strictly tagged with TEST_ONLY metadata and deterministic HMAC-SHA256 webhooks.
 */

import crypto from 'crypto';
import { BaseNotificationProvider } from './base.js';

export const TEST_NOTIFICATION_WEBHOOK_SECRET = 'pi_test_notification_secret_84595';

export class TestNotificationProvider extends BaseNotificationProvider {
  constructor(channel = 'WHATSAPP') {
    super(`TEST_${channel.toUpperCase()}`);
    this.channel = channel;
    this.isConfigured = true;
    this.sentMessages = [];
    this.secret = TEST_NOTIFICATION_WEBHOOK_SECRET;
  }

  getDeliveries() {
    return [...this.sentMessages];
  }

  generateSignature(rawBody) {
    return crypto.createHmac('sha256', this.secret).update(rawBody).digest('hex');
  }

  verifyWebhookSignature(rawBody, signature, headers = {}) {
    if (!rawBody || !signature) {
      return { valid: false, reason: 'Missing rawBody or signature' };
    }
    const cleanSig = signature.startsWith('sha256=') ? signature.slice(7) : signature;
    const expected = crypto.createHmac('sha256', this.secret).update(rawBody).digest('hex');
    const sigBuf = Buffer.from(cleanSig);
    const expBuf = Buffer.from(expected);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, reason: 'Invalid HMAC signature' };
    }
    return { valid: true };
  }

  async sendMessage({ recipient, message, to, text, templateId, metadata = {} }) {
    const finalRecipient = this.normalizeRecipient(recipient || to, this.channel);
    const finalMessage = message || text;
    const providerMessageId = `test_msg_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const record = {
      providerMessageId,
      channel: this.channel,
      recipient: finalRecipient,
      to: finalRecipient,
      message: finalMessage,
      text: finalMessage,
      templateId,
      status: 'SENT',
      testOnly: true,
      sentAt: new Date().toISOString(),
      metadata: {
        ...metadata,
        verificationSource: 'TEST_ONLY'
      }
    };

    this.sentMessages.push(record);

    return {
      success: true,
      providerMessageId,
      status: 'SENT',
      testOnly: true,
      recipient: record.recipient
    };
  }

  async sendTemplate({ recipient, templateId, variables = {}, metadata = {} }) {
    let rendered = `[Template: ${templateId}]`;
    for (const [k, v] of Object.entries(variables)) {
      rendered += ` ${k}=${v}`;
    }

    return this.sendMessage({
      recipient,
      message: rendered,
      templateId,
      metadata: {
        ...metadata,
        variables,
        verificationSource: 'TEST_ONLY'
      }
    });
  }

  async getDeliveryStatus(providerMessageId) {
    const found = this.sentMessages.find(m => m.providerMessageId === providerMessageId);
    if (!found) {
      return { status: 'UNKNOWN', error: 'Message not found' };
    }
    return { status: found.status };
  }

  generateWebhookSignature(payload) {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return this.generateSignature(raw);
  }

  /**
   * Timing-safe webhook verification with replay protection
   */
  async verifyWebhook(rawBody, signature, headers = {}) {
    if (!rawBody || !signature) {
      return { isValid: false, eventId: '', status: 'FAILED', providerMessageId: '', error: 'Missing rawBody or signature' };
    }

    const raw = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);

    // Replay protection window (+/- 300s)
    let tsHeader = headers['x-webhook-timestamp'] || headers['x-timestamp'];
    if (!tsHeader) {
      try {
        const parsedCandidate = typeof rawBody === 'object' ? rawBody : JSON.parse(raw);
        if (parsedCandidate && parsedCandidate.timestamp) {
          tsHeader = parsedCandidate.timestamp;
        }
      } catch (e) {}
    }

    if (tsHeader) {
      const tsNum = Number(tsHeader);
      const nowSec = Math.floor(Date.now() / 1000);
      if (isNaN(tsNum) || Math.abs(nowSec - tsNum) > 300) {
        return { isValid: false, eventId: '', status: 'FAILED', providerMessageId: '', error: 'Webhook timestamp expired (replay protection)' };
      }
    }

    const cleanSig = signature.startsWith('sha256=') ? signature.slice(7) : signature;
    const expected = crypto.createHmac('sha256', this.secret).update(raw).digest('hex');
    const sigBuf = Buffer.from(cleanSig);
    const expBuf = Buffer.from(expected);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { isValid: false, eventId: '', status: 'FAILED', providerMessageId: '', error: 'Invalid HMAC-SHA256 signature' };
    }

    let parsed;
    try {
      parsed = typeof rawBody === 'object' ? rawBody : JSON.parse(raw);
    } catch (e) {
      return { isValid: false, eventId: '', status: 'FAILED', providerMessageId: '', error: 'Invalid JSON payload' };
    }

    const eventId = parsed.event_id || `evt_${Date.now()}`;
    const providerMessageId = parsed.provider_message_id || parsed.message_id || '';
    const status = (parsed.status || 'DELIVERED').toUpperCase();

    // Update in-memory message status if present
    const messageRecord = this.sentMessages.find(m => m.providerMessageId === providerMessageId);
    if (messageRecord) {
      messageRecord.status = status;
      if (status === 'DELIVERED') messageRecord.deliveredAt = new Date().toISOString();
    }

    return {
      isValid: true,
      eventId,
      status,
      providerMessageId,
      rawPayload: parsed
    };
  }
}
