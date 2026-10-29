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
