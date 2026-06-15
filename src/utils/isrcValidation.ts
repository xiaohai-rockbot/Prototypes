// Standard ISRC format: CC-XXX-YY-NNNNN (dashes optional)
const ISRC_PATTERN = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$|^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/;

export type ISRCValidationStatus = 'empty' | 'valid' | 'invalid';

export function validateISRC(value: string): ISRCValidationStatus {
  if (!value.trim()) return 'empty';
  return ISRC_PATTERN.test(value.trim().toUpperCase()) ? 'valid' : 'invalid';
}
