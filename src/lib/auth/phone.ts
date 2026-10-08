/**
 * Normalizes Ghanaian and international phone numbers into standard E.164 format.
 * Examples:
 *   "0241234567" -> "+233241234567"
 *   "233241234567" -> "+233241234567"
 *   "+233241234567" -> "+233241234567"
 */
export function normalizePhoneNumber(rawPhone: string, defaultCountryCode = '233'): string {
  let cleaned = rawPhone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = defaultCountryCode + cleaned.substring(1);
  } else if (!cleaned.startsWith(defaultCountryCode) && cleaned.length === 9) {
    cleaned = defaultCountryCode + cleaned;
  }

  return `+${cleaned}`;
}

/**
 * Validates whether a phone number string meets basic mobile format criteria.
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // Matches +233 followed by 9 digits
  return /^\+233[0-9]{9}$/.test(normalized);
}

/**
 * Masks phone numbers for display in responses/logs.
 * Example: "+233241234567" -> "+23324****567"
 */
export function maskPhoneNumber(phone: string): string {
  if (phone.length < 10) return '***';
  return `${phone.substring(0, 6)}****${phone.substring(phone.length - 3)}`;
}