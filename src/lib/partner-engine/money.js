/**
 * Integer-Safe Money Calculations (Paise representation)
 * 1 Rupee = 100 Paise
 */

/**
 * Converts integer paise to formatted INR string (e.g. 14900 -> "₹149")
 */
export function formatPaise(paise, includeDecimals = false) {
  const amount = Number(paise || 0) / 100;
  if (includeDecimals) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // If whole rupees, format without decimals
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Converts rupees number or string to integer paise
 */
export function toPaise(rupees) {
  const num = typeof rupees === 'string' ? parseFloat(rupees.replace(/[^\d.-]/g, '')) : Number(rupees);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Calculates platform commission and worker payout integer-safely
 * Guarantees commissionPaise + workerPayoutPaise === grossPaise
 */
export function calculateSplits(grossPaise, commissionPercent = 10) {
  const gross = Math.max(0, Number(grossPaise || 0));
  const validPercent = Math.min(100, Math.max(0, Number(commissionPercent != null ? commissionPercent : 10)));
  const rate = validPercent / 100;
  const commission = Math.round(gross * rate);
  const workerPayout = gross - commission;
  return {
    grossPaise: gross,
    commissionPaise: commission,
    workerPayoutPaise: workerPayout
  };
}

/**
 * Parses integer amount in paise safely
 */
export function parsePaise(value) {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}
