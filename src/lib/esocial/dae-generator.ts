/**
 * DAE (Documento de Arrecadacao do eSocial) generator.
 * Simulated mode - generates mock DAE data for domestic employers.
 */

import { DaeRecord } from './events'
import { PayrollBreakdown } from '../calc/payroll'

interface EmployeePayrollResult {
  employeeId: string
  employeeName: string
  grossSalary: number
  payroll: PayrollBreakdown
}

/**
 * Calculate the DAE due date for a given month/year.
 * DAE is due on the 7th of the following month.
 * If the 7th falls on a weekend or holiday, move to the previous business day.
 */
export function calculateDaeDueDate(month: number, year: number): string {
  // DAE for month X is due on the 7th of month X+1
  let dueMonth = month + 1
  let dueYear = year
  if (dueMonth > 12) {
    dueMonth = 1
    dueYear += 1
  }

  const dueDate = new Date(dueYear, dueMonth - 1, 7)

  // Adjust for weekends (move to previous business day)
  const dayOfWeek = dueDate.getDay()
  if (dayOfWeek === 0) {
    // Sunday -> Friday
    dueDate.setDate(dueDate.getDate() - 2)
  } else if (dayOfWeek === 6) {
    // Saturday -> Friday
    dueDate.setDate(dueDate.getDate() - 1)
  }

  return formatDate(dueDate)
}

/**
 * Generate a mock barcode for DAE.
 * Real barcodes follow Febraban standard with check digits.
 */
export function generateMockBarcode(
  employerId: string,
  month: number,
  year: number,
  amount: number
): string {
  const amountStr = Math.round(amount * 100).toString().padStart(10, '0')
  const monthStr = String(month).padStart(2, '0')
  const yearStr = String(year)
  // Mock: 858 (revenue code) + segment + employer hash + amount + period + check digits
  const base = `85890000${amountStr}${yearStr}${monthStr}`
  const padding = '0'.repeat(44 - base.length)
  return `${base}${padding}`.slice(0, 44)
}

/**
 * Format barcode for display (groups of digits separated by spaces)
 */
export function formatBarcode(barcode: string): string {
  return barcode.replace(/(\d{11})(\d{11})(\d{11})(\d{11})/, '$1 $2 $3 $4')
}

/**
 * Generate DAE record from payroll results of all employees for a month.
 */
export function generateDae(
  employerId: string,
  month: number,
  year: number,
  employeeResults: EmployeePayrollResult[]
): DaeRecord {
  // Aggregate totals across all employees
  let totalInssEmpregado = 0
  let totalInssPatronal = 0
  let totalGilrat = 0
  let totalFgtsmensal = 0
  let totalFgtsAntecipacao = 0

  const employees = employeeResults.map((emp) => {
    const p = emp.payroll
    totalInssEmpregado += p.inssEmployee
    totalInssPatronal += p.inssEmployer
    totalGilrat += p.gilrat
    totalFgtsmensal += p.fgtsMonthly
    totalFgtsAntecipacao += p.fgtsAnticipation

    return {
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      grossSalary: emp.grossSalary,
      inssEmpregado: p.inssEmployee,
      daeContribution: p.daeTotal,
    }
  })

  const totalAmount = round(
    totalInssEmpregado + totalInssPatronal + totalGilrat + totalFgtsmensal + totalFgtsAntecipacao
  )

  const barcode = generateMockBarcode(employerId, month, year, totalAmount)
  const dueDate = calculateDaeDueDate(month, year)

  return {
    employerId,
    referenceMonth: month,
    referenceYear: year,
    totalAmount,
    dueDate,
    status: 'generated',
    barcode,
    breakdown: {
      inssEmpregado: round(totalInssEmpregado),
      inssPatronal: round(totalInssPatronal),
      gilrat: round(totalGilrat),
      fgtsmensal: round(totalFgtsmensal),
      fgtsAntecipacao: round(totalFgtsAntecipacao),
    },
    employees,
  }
}

/**
 * Check if a DAE is overdue based on current date.
 */
export function isDaeOverdue(dueDate: string): boolean {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
