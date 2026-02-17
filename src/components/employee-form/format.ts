/**
 * Format a CPF string with dots and dash (e.g., 123.456.789-00).
 * Strips non-digit characters and limits to 11 digits.
 * @param value - Raw CPF input
 * @returns Formatted CPF string
 */
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

/**
 * Format a Brazilian phone number with parentheses and dash (e.g., (11) 99999-8888).
 * @param value - Raw phone input
 * @returns Formatted phone string
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/**
 * Format a Brazilian CEP (postal code) with dash (e.g., 01234-567).
 * @param value - Raw CEP input
 * @returns Formatted CEP string
 */
export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}
