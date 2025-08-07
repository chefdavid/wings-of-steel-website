/**
 * Utility functions for phone number formatting
 */

/**
 * Format phone number for display as (111) 555-5555
 * @param phone - Raw phone number string
 * @returns Formatted phone number
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle different lengths
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Handle 11 digits (with country code)
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Default for 10 digits
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Format phone number as user types (for input fields)
 * @param value - Current input value
 * @returns Formatted phone number for input
 */
export function formatPhoneInput(value: string): string {
  if (!value) return '';
  
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 10 digits for US phone numbers
  const limitedDigits = digits.slice(0, 10);
  
  // Format as user types
  if (limitedDigits.length <= 3) {
    return limitedDigits;
  } else if (limitedDigits.length <= 6) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  } else {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  }
}

/**
 * Remove formatting from phone number to get just digits
 * @param phone - Formatted phone number
 * @returns Digits only
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Validate US phone number
 * @param phone - Phone number to validate
 * @returns true if valid 10-digit US phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const digits = cleanPhoneNumber(phone);
  return digits.length === 10 && digits[0] !== '0' && digits[0] !== '1';
}

/**
 * Handle phone input change with automatic formatting
 * @param value - New input value
 * @param onChange - Callback to update the field
 */
export function handlePhoneChange(value: string, onChange: (formatted: string) => void): void {
  const formatted = formatPhoneInput(value);
  onChange(formatted);
}