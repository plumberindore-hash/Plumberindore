/**
 * Base Notification Provider Interface Specification
 * PlumberIndore Partner Engine - Phase 7
 */

export class BaseNotificationProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Normalizes phone number or address for the designated channel
   * @param {string} recipient 
   * @param {string} channel 
   * @returns {string}
   */
  normalizeRecipient(recipient, channel = 'WHATSAPP') {
    if (!recipient) return '';
    const digits = String(recipient).replace(/\D/g, '');
    if (channel === 'WHATSAPP' || channel === 'SMS') {
      if (digits.length === 10) return `+91${digits}`;
      if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
      if (recipient.startsWith('+')) return recipient;
      return `+91${digits}`;
    }
    return String(recipient).trim();
  }

  /**
   * Sends a rendered text message
   * @param {Object} params
   * @param {string} params.channel - 'WHATSAPP' | 'SMS' | 'IN_APP' | 'EMAIL'
   * @param {string} params.recipient
   * @param {string} params.message
   * @param {string} [params.templateId]
   * @param {Record<string, any>} [params.metadata]
   * @returns {Promise<{ success: boolean, providerMessageId: string, status: string, error?: string }>}
   */
  async sendMessage(params) {
    throw new Error('sendMessage must be implemented by concrete NotificationProvider');
  }

  /**
   * Sends a pre-registered template message
   * @param {Object} params
   * @param {string} params.channel
   * @param {string} params.recipient
   * @param {string} params.templateId
   * @param {Record<string, any>} params.variables
   * @param {Record<string, any>} [params.metadata]
   * @returns {Promise<{ success: boolean, providerMessageId: string, status: string, error?: string }>}
   */
  async sendTemplate(params) {
    throw new Error('sendTemplate must be implemented by concrete NotificationProvider');
  }

  /**
   * Retrieves authoritative message delivery status from gateway
   * @param {string} providerMessageId
   * @returns {Promise<{ status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'UNKNOWN', error?: string }>}
   */
  async getDeliveryStatus(providerMessageId) {
    throw new Error('getDeliveryStatus must be implemented by concrete NotificationProvider');
  }

  /**
   * Verifies incoming webhook signature from provider
   * @param {string} rawBody
   * @param {string} signature
   * @param {Record<string, string>} headers
   * @returns {Promise<{ isValid: boolean, eventId: string, status: string, providerMessageId: string, error?: string }>}
   */
  async verifyWebhook(rawBody, signature, headers = {}) {
    throw new Error('verifyWebhook must be implemented by concrete NotificationProvider');
  }
}
