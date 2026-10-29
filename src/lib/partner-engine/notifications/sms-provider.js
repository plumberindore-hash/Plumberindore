/**
 * Production SMS Provider Adapter (Fast2SMS / Twilio)
 * PlumberIndore Partner Engine - Phase 7
 */

import { BaseNotificationProvider } from './base.js';

export class SMSProvider extends BaseNotificationProvider {
  constructor({
    apiKey = process.env.SMS_API_KEY || process.env.SMS_GATEWAY_API_KEY,
    senderId = process.env.SMS_SENDER_ID || 'PLMIND'
  } = {}) {
    super('SMS_GATEWAY');
    this.apiKey = apiKey;
    this.senderId = senderId;
    this.isConfigured = !!apiKey;
  }

  async sendMessage({ recipient, message }) {
    if (!this.isConfigured) {
      return { success: false, status: 'NOT_CONFIGURED', error: 'SMS API key missing in environment' };
    }

    const cleanNumber = String(recipient).replace(/\D/g, '').slice(-10);
    try {
      // Fast2SMS / Standard Indian DLT Gateway API call
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message,
          language: 'english',
          flash: 0,
          numbers: cleanNumber
        })
      });

      const data = await res.json();
      if (!res.ok || data.return === false) {
        return { success: false, status: 'FAILED', error: data.message || 'SMS send failed' };
      }

      const providerMessageId = data.request_id || `sms_${Date.now()}`;
      return { success: true, providerMessageId, status: 'SENT', recipient: cleanNumber };
    } catch (err) {
      return { success: false, status: 'FAILED', error: err.message };
    }
  }

  async sendTemplate({ recipient, templateId, variables = {} }) {
    let msg = `[PlumberIndore ${templateId}]`;
    for (const [k, v] of Object.entries(variables)) {
      msg += ` ${v}`;
    }
    return this.sendMessage({ recipient, message: msg });
  }

  async verifyWebhook() {
    return { isValid: false, eventId: '', status: 'FAILED', providerMessageId: '', error: 'SMS webhooks not supported' };
  }
}
