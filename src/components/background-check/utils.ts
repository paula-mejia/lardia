/**
 * Format a raw digit string as a CPF (xxx.xxx.xxx-xx).
 * @param value - Raw or partially formatted input
 * @returns Formatted CPF string
 */
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  let formatted = digits
  if (digits.length > 3) formatted = digits.slice(0, 3) + '.' + digits.slice(3)
  if (digits.length > 6) formatted = formatted.slice(0, 7) + '.' + digits.slice(6)
  if (digits.length > 9) formatted = formatted.slice(0, 11) + '-' + digits.slice(9)
  return formatted
}
