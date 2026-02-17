/** Shared formatting utilities for calculator components. */

/**
 * Format a number as Brazilian Real currency (e.g., R$ 1.234,56).
 * @param value - Numeric value to format
 * @returns Formatted BRL currency string
 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/**
 * Format an ISO date string (YYYY-MM-DD) to Brazilian format (DD/MM/YYYY).
 * @param dateStr - ISO date string
 * @returns Formatted date string in pt-BR locale
 */
export function formatDateBR(dateStr: string): string {
  return new Date(dateStr + 'T12:00').toLocaleDateString('pt-BR')
}
