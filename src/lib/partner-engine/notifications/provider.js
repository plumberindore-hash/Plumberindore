/**
 * Notification Provider Factory
 * PlumberIndore Partner Engine - Phase 7
 */

import { BaseNotificationProvider } from './base.js';
import { UnconfiguredNotificationProvider } from './unconfigured.js';
import { TestNotificationProvider } from './test-provider.js';
import { WhatsAppProvider } from './whatsapp-provider.js';
import { SMSProvider } from './sms-provider.js';

export {
  BaseNotificationProvider,
  UnconfiguredNotificationProvider,
  TestNotificationProvider,
  WhatsAppProvider,
  SMSProvider
};

let singletonTestProvider = null;

export function getNotificationProvider(channel = 'WHATSAPP') {
  const normalizedChannel = String(channel).toUpperCase();
  const providerConfig = (process.env.NOTIFICATION_PROVIDER || 'TEST').toUpperCase();
  const notificationsEnabled = process.env.NOTIFICATIONS_ENABLED === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Production Mode: strict guard against unconfigured providers and test simulation
  if (isProduction) {
    if (!notificationsEnabled && providerConfig !== 'TEST_ALLOW_PROD') {
      return new UnconfiguredNotificationProvider(normalizedChannel);
    }

    if (normalizedChannel === 'WHATSAPP' || providerConfig === 'WHATSAPP') {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
      const appSecret = process.env.WHATSAPP_APP_SECRET;

      if (!accessToken || !phoneNumberId) {
        return new UnconfiguredNotificationProvider('WHATSAPP');
      }

      return new WhatsAppProvider({ accessToken, phoneNumberId, webhookSecret, appSecret });
    }

    if (normalizedChannel === 'SMS' || providerConfig === 'SMS') {
      const apiKey = process.env.SMS_API_KEY;
      const senderId = process.env.SMS_SENDER_ID;
      if (!apiKey) {
        return new UnconfiguredNotificationProvider('SMS');
      }
      return new SMSProvider({ apiKey, senderId });
    }

    if (providerConfig !== 'TEST_ALLOW_PROD') {
      return new UnconfiguredNotificationProvider(normalizedChannel);
    }
  }

  // 2. Development / Testing Mode
  if (providerConfig === 'WHATSAPP' && process.env.WHATSAPP_ACCESS_TOKEN) {
    return new WhatsAppProvider({
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET,
      appSecret: process.env.WHATSAPP_APP_SECRET
    });
  }

  if (providerConfig === 'SMS' && process.env.SMS_API_KEY) {
    return new SMSProvider({
      apiKey: process.env.SMS_API_KEY,
      senderId: process.env.SMS_SENDER_ID
    });
  }

  // Default to isolated test provider in dev/test environment
  if (!singletonTestProvider || singletonTestProvider.channel !== normalizedChannel) {
    singletonTestProvider = new TestNotificationProvider(normalizedChannel);
  }
  return singletonTestProvider;
}
