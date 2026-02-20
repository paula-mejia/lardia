/**
 * DAE (Documento de Arrecadação do eSocial) generator.
 * Generates DAE data for domestic employers with all required tax components.
 *
 * Components calculated:
 * - INSS empregado (progressive brackets)
 * - INSS patronal (CP Patronal 8%)
 * - GILRAT (0.8% accident insurance)
 * - FGTS mensal (8%)
 * - FGTS antecipação rescisória (3.2%)
 * - IRRF (when applicable)
 * - Seguro acidente de trabalho (included in GILRAT)
 */

import { DaeRecord } from './events'
import { PayrollBreakdown } from '../calc/payroll'

export interface EmployeePayrollResult {
  employeeId: string
  employeeName: string
  grossSalary: number
  payroll: PayrollBreakdown
}

export interface DaeEmployeeDetail {
  employeeId: string
  employeeName: string
  grossSalary: number
  inssEmpregado: number
  inssPatronal: number
  gilrat: number
  fgtsMonthly: number
  fgtsAnticipation: number
  irrf: number
  daeContribution: number
}

/**
 * Calculate the DAE due date for a given competência (month/year).
 * DAE is due on the 7th of the following month.
 * If the 7th falls on a weekend or holiday, move to the previous business day.
 */
export function calculateDaeDueDate(month: number, year: number): string {
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
    dueDate.setDate(dueDate.getDate() - 2) // Sunday -> Friday
  } else if (dayOfWeek === 6) {
    dueDate.setDate(dueDate.getDate() - 1) // Saturday -> Friday
  }

  return formatDate(dueDate)
}

/**
 * Generate a mock Febraban-format barcode for DAE (48 digits).
 *
 * Structure (simplified mock based on Febraban arrecadação):
 * - Segment 8 (arrecadação): "858"
 * - Módulo 10 identifier: "9"
 * - Amount (11 digits, cents)
 * - Employer hash (8 digits from ID)
 * - Reference period YYYYMM (6 digits)
 * - Sequential/filler (16 digits)
 * - Check digits (4 digits, mod-10 per field)
 *
 * Total: 48 digits (displayed as 4 groups of 12 with spaces)
 */
export function generateDaeBarcode(
  employerId: string,
  month: number,
  year: number,
  amount: number
): string {
  const amountCents = Math.round(amount * 100).toString().padStart(11, '0')
  const monthStr = String(month).padStart(2, '0')
  const yearStr = String(year)
  const employerHash = hashEmployerId(employerId).padStart(8, '0')
  const sequential = '0001' // simplified sequential number

  // Build 4 fields of 11 digits each, then add mod-10 check to each
  const field1 = `85890000${amountCents.slice(0, 3)}`  // 11 digits
  const field2 = `${amountCents.slice(3)}${employerHash.slice(0, 3)}` // 11 digits
  const field3Full = `${employerHash.slice(3)}${yearStr}${monthStr}`.padEnd(11, '0')
  const field4 = `${sequential}0000000`.slice(0, 11)

  // Add mod-10 check digit to each field
  const f1 = field1 + mod10(field1)
  const f2 = field2 + mod10(field2)
  const f3 = field3Full + mod10(field3Full)
  const f4 = field4 + mod10(field4)

  return `${f1}${f2}${f3}${f4}`
}

/**
 * Compute Febraban mod-10 check digit for a numeric string.
 */
function mod10(digits: string): string {
  let sum = 0
  let multiplier = 2
  for (let i = digits.length - 1; i >= 0; i--) {
    let product = parseInt(digits[i]) * multiplier
    if (product >= 10) {
      product = Math.floor(product / 10) + (product % 10)
    }
    sum += product
    multiplier = multiplier === 2 ? 1 : 2
  }
  const remainder = sum % 10
  return remainder === 0 ? '0' : String(10 - remainder)
}

/**
 * Simple hash of employer ID to 8 numeric digits.
 */
function hashEmployerId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString().padStart(8, '0').slice(0, 8)
}

/**
 * Format 48-digit barcode for display (4 groups of 12).
 */
export function formatBarcode(barcode: string): string {
  return barcode.replace(/(\d{12})(\d{12})(\d{12})(\d{12})/, '$1 $2 $3 $4')
}

/**
 * Generate DAE record from payroll results of all employees for a month.
 * Aggregates all tax components across employees.
 */
export function generateDae(
  employerId: string,
  month: number,
  year: number,
  employeeResults: EmployeePayrollResult[]
): DaeRecord {
  let totalInssEmpregado = 0
  let totalInssPatronal = 0
  let totalGilrat = 0
  let totalFgtsmensal = 0
  let totalFgtsAntecipacao = 0
  let totalIrrf = 0

  const employees: DaeEmployeeDetail[] = employeeResults.map((emp) => {
    const p = emp.payroll
    totalInssEmpregado += p.inssEmployee
    totalInssPatronal += p.inssEmployer
    totalGilrat += p.gilrat
    totalFgtsmensal += p.fgtsMonthly
    totalFgtsAntecipacao += p.fgtsAnticipation
    totalIrrf += p.irrfEmployee

    return {
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      grossSalary: emp.grossSalary,
      inssEmpregado: p.inssEmployee,
      inssPatronal: p.inssEmployer,
      gilrat: p.gilrat,
      fgtsMonthly: p.fgtsMonthly,
      fgtsAnticipation: p.fgtsAnticipation,
      irrf: p.irrfEmployee,
      daeContribution: p.daeTotal,
    }
  })

  // DAE total includes IRRF when applicable
  const totalAmount = round(
    totalInssEmpregado +
      totalInssPatronal +
      totalGilrat +
      totalFgtsmensal +
      totalFgtsAntecipacao +
      totalIrrf
  )

  const barcode = generateDaeBarcode(employerId, month, year, totalAmount)
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
      irrf: round(totalIrrf),
      seguroAcidente: round(totalGilrat), // Seguro acidente = GILRAT for domestic employers
    },
    employees: employees.map((e) => ({
      employeeId: e.employeeId,
      employeeName: e.employeeName,
      grossSalary: e.grossSalary,
      inssEmpregado: e.inssEmpregado,
      daeContribution: e.daeContribution,
    })),
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

/**
 * Determine effective DAE status considering due date.
 */
export function getEffectiveDaeStatus(
  status: string,
  dueDate: string
): 'generated' | 'paid' | 'overdue' {
  if (status === 'paid') return 'paid'
  if (isDaeOverdue(dueDate)) return 'overdue'
  return 'generated'
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
