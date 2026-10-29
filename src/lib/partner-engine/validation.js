import { z } from 'zod';

/**
 * Dispatch New Job validation schema
 */
export const DispatchJobSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerPhone: z.string().min(10, 'Must be at least 10 digits'),
  customerWhatsapp: z.string().optional().nullable(),
  locality: z.string().min(2, 'Please select or specify a locality'),
  address: z.string().min(5, 'Full doorstep address is required (min 5 characters)'),
  issue: z.string().min(3, 'Issue description is required'),
  serviceCategory: z.string().default('Plumber'),
  priority: z.enum(['Normal', 'High', 'Emergency', 'Urgent', 'NORMAL', 'HIGH', 'URGENT']).default('Normal'),
  preferredTime: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  preferredWorkerId: z.string().optional().nullable()
});

/**
 * Wallet Recharge validation schema
 */
export const RechargeWalletSchema = z.object({
  workerId: z.string().uuid('Invalid worker ID'),
  amountRupees: z.number().positive('Recharge amount must be greater than zero'),
  paymentMethod: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Other']).default('Cash'),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

/**
 * OTP Verification validation schema
 */
export const VerifyOtpSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  otp: z.string().regex(/^\d{4}$/, 'OTP must be exactly 4 digits'),
  workerToken: z.string().optional()
});

/**
 * Job Service Selection schema
 */
export const ServiceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  ratePaise: z.number().int().nonnegative(),
  quantity: z.number().int().positive().default(1),
  isPart: z.boolean().default(false)
});

export const SaveJobServicesSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  services: z.array(ServiceItemSchema)
});

/**
 * Job Completion & Settlement schema
 */
export const CompleteJobSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  endOtp: z.string().regex(/^\d{4}$/, 'Completion OTP must be exactly 4 digits'),
  paymentMethod: z.enum(['CASH', 'UPI']).default('CASH'),
  workerToken: z.string().optional()
});

/**
 * Payment schemas
 */
export const CreatePaymentOrderSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required')
});

export const RefundPaymentSchema = z.object({
  amountPaise: z.number().int().positive().optional(),
  reason: z.string().min(3, 'Refund reason must be at least 3 characters').optional()
});

/**
 * Utility validators
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
}

export function normalizePhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  return phone;
}

export function validateOtp(otp) {
  if (!otp) return false;
  const str = String(otp).trim();
  return /^\d{4,6}$/.test(str);
}

export function validatePincode(pincode) {
  if (!pincode) return false;
  const str = String(pincode).trim();
  return /^\d{6}$/.test(str);
}
