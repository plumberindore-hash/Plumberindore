/**
 * Base Payment Provider Interface specification
 * Concrete implementations: RazorpayPaymentProvider, TestPaymentProvider
 */
export class BasePaymentProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Creates an order with the payment gateway
   */
  async createPaymentOrder(params) {
    throw new Error('createPaymentOrder must be implemented by payment provider');
  }

  /**
   * Retrieves authoritative payment status from gateway
   */
  async getPaymentStatus(providerOrderId, providerPaymentId = null) {
    throw new Error('getPaymentStatus must be implemented by payment provider');
  }

  /**
   * Verifies incoming webhook authenticity
   */
  async verifyWebhook(params) {
    throw new Error('verifyWebhook must be implemented by payment provider');
  }

  /**
   * Issues refund through the payment gateway
   */
  async refundPayment(params) {
    throw new Error('refundPayment must be implemented by payment provider');
  }
}
