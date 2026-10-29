/**
 * PlumberIndore Partner Engine Constants
 * Matches official branding & design guidelines
 */

export const BRAND_COLORS = {
  darkNavy: '#0F1B33',
  secondaryNavy: '#16233D',
  brandYellow: '#FFB21A',
  brandOrange: '#F59E0B',
  successGreen: '#16B879',
  dangerRed: '#EF4444',
  lightBackground: '#F5F8FC',
  white: '#FFFFFF',
  text: '#0F172A',
  mutedText: '#64748B',
  border: '#E2E8F0'
};

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  WORKER: 'WORKER'
};

export const WORKER_STATUS = {
  ONLINE_FREE: 'ONLINE_FREE',
  BUSY: 'BUSY',
  OFFLINE: 'OFFLINE'
};

export const JOB_STATUS = {
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  ARRIVED: 'ARRIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const INDORE_LOCALITIES = [
  'Vijay Nagar',
  'Palasia',
  'Bhanwarkuan',
  'Rau',
  'Scheme No. 54',
  'Scheme No. 78',
  'Bhawarkua',
  'Sudama Nagar',
  'Annapurna',
  'Rajendra Nagar',
  'Bijalpur',
  'Khatiwala Tank',
  'Bicholi Mardana',
  'Other'
];

export const SERVICE_CATEGORIES = [
  'Plumber',
  'Electrician',
  'AC Repair',
  'Appliance',
  'Carpenter',
  'Pest Control'
];

export const COMMISSION_PERCENTAGE = 0.10; // 10% Platform
export const WORKER_PERCENTAGE = 0.90;     // 90% Technician
export const DEFAULT_INSPECTION_FEE_PAISE = 29900; // ₹299
export const LOW_WALLET_THRESHOLD_PAISE = 10000;    // ₹100
