// Shared formatting utilities for calculator components

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDateBR(dateStr: string): string {
  return new Date(dateStr + 'T12:00').toLocaleDateString('pt-BR')
}
