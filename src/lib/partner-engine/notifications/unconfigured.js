/**
 * Unconfigured Notification Provider
 * PlumberIndore Partner Engine - Phase 7
 * Prevents silent fake delivery when production credentials are absent.
 */

import { BaseNotificationProvider } from './base.js';

export class UnconfiguredNotificationProvider extends BaseNotificationProvider {
  constructor(channel = 'WHATSAPP') {
    super(`UNCONFIGURED_${channel.toUpperCase()}`);
    this.channel = channel;
    this.isConfigured = false;
  }

  async sendMessage({ recipient, message }) {
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      transient: false,
      error: `Live notification provider credentials for ${this.channel} are not configured in environment.`
    };
  }

  async sendTemplate({ recipient, templateId, variables }) {
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      transient: false,
      error: `Live notification provider credentials for ${this.channel} are not configured in environment.`
    };
  }

  async getDeliveryStatus(providerMessageId) {
    return {
      status: 'UNKNOWN',
      error: 'Provider not configured'
    };
  }

  async verifyWebhook(rawBody, signature, headers = {}) {
    return {
      isValid: false,
      eventId: '',
      status: 'FAILED',
      providerMessageId: '',
      error: 'Provider not configured'
    };
  }
}
