/**
 * Production WhatsApp Cloud API Provider Adapter
 * PlumberIndore Partner Engine - Phase 7
 */

import crypto from 'crypto';
import { BaseNotificationProvider } from './base.js';

export class WhatsAppProvider extends BaseNotificationProvider {
  constructor({
    accessToken = process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID,
    webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET,
    appSecret = process.env.WHATSAPP_APP_SECRET
  } = {}) {
    super('WHATSAPP_CLOUD');
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.webhookSecret = webhookSecret;
    this.appSecret = appSecret || webhookSecret;
    this.isConfigured = !!(accessToken && phoneNumberId);
  }

  async sendMessage({ recipient, message }) {
    if (!this.isConfigured) {
      return { success: false, status: 'NOT_CONFIGURED', error: 'WhatsApp credentials missing' };
    }

    const cleanTo = this.normalizeRecipient(recipient, 'WHATSAPP').replace('+', '');
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'text',
          text: { preview_url: false, body: message }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: 'FAILED', error: data.error?.message || 'WhatsApp send failed' };
      }

      const providerMessageId = data.messages?.[0]?.id || `wa_${Date.now()}`;
      return { success: true, providerMessageId, status: 'SENT', recipient: cleanTo };
    } catch (err) {
      return { success: false, status: 'FAILED', error: err.message };
    }
  }

  async sendTemplate({ recipient, templateId, variables = {} }) {
    if (!this.isConfigured) {
      return { success: false, status: 'NOT_CONFIGURED', error: 'WhatsApp credentials missing' };
    }

    const cleanTo = this.normalizeRecipient(recipient, 'WHATSAPP').replace('+', '');
    const parameters = Object.values(variables).map(val => ({ type: 'text', text: String(val) }));

    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'template',
          template: {
            name: templateId,
            language: { code: 'en_US' },
            components: parameters.length > 0 ? [{ type: 'body', parameters }] : []
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: 'FAILED', error: data.error?.message || 'WhatsApp template failed' };
      }

      const providerMessageId = data.messages?.[0]?.id || `wa_${Date.now()}`;
      return { success: true, providerMessageId, status: 'SENT', recipient: cleanTo };
    } catch (err) {
      return { success: false, status: 'FAILED', error: err.message };
    }
  }

  async verifyWebhook(rawBody, signature, headers = {}) {
    if (!this.appSecret || !signature) {
      return { isValid: false, eventId: '', status: 'FAILED', providerMessageId: '', error: 'Missing signature or appSecret' };
    }

    // Meta sends sha256=... in x-hub-signature-256
    const cleanSig = signature.startsWith('sha256=') ? signature.slice(7) : signature;
    const expected = crypto.createHmac('sha256', this.appSecret).update(rawBody).digest('hex');

    const sigBuf = Buffer.from(cleanSig);
    const expBuf = Buffer.from(expected);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { isValid: false, eventId: '', status: 'FAILED', providerMessageId: '', error: 'Signature mismatch' };
    }

    try {
      const parsed = JSON.parse(rawBody);
      const entry = parsed.entry?.[0]?.changes?.[0]?.value;
      const statusObj = entry?.statuses?.[0];
      const providerMessageId = statusObj?.id || '';
      const status = (statusObj?.status || 'DELIVERED').toUpperCase();

      return {
        isValid: true,
        eventId: statusObj?.id || `evt_${Date.now()}`,
        status: status === 'FAILED' ? 'FAILED' : (status === 'READ' ? 'READ' : 'DELIVERED'),
        providerMessageId,
        rawPayload: parsed
      };
    } catch (e) {
      return { isValid: false, eventId: '', status: 'FAILED', providerMessageId: '', error: 'Malformed payload' };
    }
  }
}
