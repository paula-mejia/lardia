/**
 * Termination (Rescisao) calculation engine for Brazilian domestic workers.
 *
 * Supports three termination types:
 * - sem_justa_causa: Dismissal without cause
 * - pedido_demissao: Employee resignation
 * - justa_causa: Dismissal with cause
 *
 * Calculates all TRCT (Termo de Rescisao) line items including
 * saldo de salario, aviso previo, 13th proportional, vacation,
 * FGTS, INSS, and IRRF as applicable.
 */

import { TaxTable, CURRENT_TAX_TABLE } from './tax-tables'
import { calculateINSSEmployee, calculateIRRF } from './payroll'

export type TerminationType = 'sem_justa_causa' | 'pedido_demissao' | 'justa_causa'

export interface TerminationInput {
  terminationType: TerminationType
  lastSalary: number
  admissionDate: string // YYYY-MM-DD
  terminationDate: string // YYYY-MM-DD
  dependents?: number
  fgtsBalance?: number // estimated total FGTS balance
  accruedVacationPeriods?: number // complete vacation periods not yet taken (0, 1, or 2)
  workedNoticePeriod?: boolean // only for sem_justa_causa: if true, aviso previo is worked (not indemnified)
  employeeGaveNotice?: boolean // only for pedido_demissao: if true, no deduction
  taxTable?: TaxTable
}

export interface TerminationBreakdown {
  terminationType: TerminationType
  terminationTypeLabel: string

  // Dates and periods
  admissionDate: string
  terminationDate: string
  yearsWorked: number
  monthsWorked: number // total months for proportional calculations

  // Earnings (Verbas rescisorias)
  saldoSalario: number
  saldoSalarioDays: number
  avisoPrevio: number
  avisoPrevioDays: number
  avisoPrevioIndemnizado: boolean
  thirteenthProportional: number
  thirteenthMonths: number
  vacationProportional: number
  vacationProportionalMonths: number
  vacationProportionalOneThird: number
  accruedVacation: number
  accruedVacationOneThird: number
  accruedVacationPeriods: number
  totalEarnings: number

  // Deductions
  inssEmployee: number
  inssBase: number
  irrfEmployee: number
  irrfBase: number
  avisoPrevioDeduction: number // for pedido_demissao when employee did not give notice
  totalDeductions: number

  // FGTS
  fgtsOnTermination: number // 8% on saldo salario + aviso previo indemnizado + 13th
  fgtsBalance: number // input balance
  fgtsPenalty: number // 40% penalty (only sem_justa_causa)
  totalFgts: number

  // Net amounts
  netAmount: number // totalEarnings - totalDeductions
  totalToReceive: number // netAmount + fgtsPenalty (penalty is paid separately but included in total)
}

/**
 * Calculate the number of days worked in the final month.
 */
export function calculateSaldoDays(terminationDate: string): number {
  const d = new Date(terminationDate + 'T12:00')
  return d.getDate()
}

/**
 * Calculate aviso previo days: 30 base + 3 per year worked, max 90 days.
 */
export function calculateAvisoPrevioDays(admissionDate: string, terminationDate: string): number {
  const adm = new Date(admissionDate + 'T12:00')
  const term = new Date(terminationDate + 'T12:00')

  let years = term.getFullYear() - adm.getFullYear()
  if (
    term.getMonth() < adm.getMonth() ||
    (term.getMonth() === adm.getMonth() && term.getDate() < adm.getDate())
  ) {
    years--
  }
  years = Math.max(0, years)

  const days = 30 + years * 3
  return Math.min(days, 90)
}

/**
 * Calculate months for proportional 13th in the termination year.
 * A month counts if the employee worked 15+ days in it.
 * For sem_justa_causa with indemnified aviso previo, the projected
 * end date is used (aviso previo period counts).
 */
export function calculateProportionalThirteenthMonths(
  admissionDate: string,
  terminationDate: string,
  projectedEndDate?: string
): number {
  const effectiveEnd = projectedEndDate || terminationDate
  const endDate = new Date(effectiveEnd + 'T12:00')
  const admDate = new Date(admissionDate + 'T12:00')

  const year = endDate.getFullYear()

  // If admitted after this year, 0 months
  if (admDate.getFullYear() > year) return 0

  const startMonth = admDate.getFullYear() === year ? admDate.getMonth() : 0
  const endMonth = endDate.getMonth()

  let months = 0
  for (let m = startMonth; m <= endMonth; m++) {
    if (m === admDate.getMonth() && admDate.getFullYear() === year) {
      // First month: counts if started on or before 15th
      if (admDate.getDate() <= 15) months++
    } else if (m === endDate.getMonth()) {
      // Last month: counts if worked 15+ days
      if (endDate.getDate() >= 15) months++
    } else {
      months++
    }
  }

  return months
}

/**
 * Calculate months for proportional vacation.
 * Counts months from last vacation anniversary to termination date.
 */
export function calculateVacationProportionalMonths(
  admissionDate: string,
  terminationDate: string
): number {
  const adm = new Date(admissionDate + 'T12:00')
  const term = new Date(terminationDate + 'T12:00')

  // Find last anniversary
  let lastAnniversary = new Date(adm)
  while (true) {
    const next = new Date(lastAnniversary)
    next.setFullYear(next.getFullYear() + 1)
    if (next > term) break
    lastAnniversary = next
  }

  // Count months from last anniversary to termination
  let months = 0
  const cursor = new Date(lastAnniversary)
  while (cursor < term) {
    const nextMonth = new Date(cursor)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    if (nextMonth <= term) {
      months++
      cursor.setMonth(cursor.getMonth() + 1)
    } else {
      // Partial last month: count if 15+ days
      const daysInPartial = Math.ceil((term.getTime() - cursor.getTime()) / (1000 * 60 * 60 * 24))
      if (daysInPartial >= 15) months++
      break
    }
  }

  return months
}

/**
 * Calculate complete years worked for aviso previo.
 */
function calculateYearsWorked(admissionDate: string, terminationDate: string): number {
  const adm = new Date(admissionDate + 'T12:00')
  const term = new Date(terminationDate + 'T12:00')
  let years = term.getFullYear() - adm.getFullYear()
  if (
    term.getMonth() < adm.getMonth() ||
    (term.getMonth() === adm.getMonth() && term.getDate() < adm.getDate())
  ) {
    years--
  }
  return Math.max(0, years)
}

/**
 * Calculate projected end date adding aviso previo days.
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/**
 * Calculate complete termination (rescisao).
 */
export function calculateTermination(input: TerminationInput): TerminationBreakdown {
  const table = input.taxTable || CURRENT_TAX_TABLE
  const {
    terminationType,
    lastSalary,
    admissionDate,
    terminationDate,
    dependents = 0,
    fgtsBalance = 0,
    accruedVacationPeriods = 0,
    workedNoticePeriod = false,
    employeeGaveNotice = true,
  } = input

  const dailyRate = round(lastSalary / 30)
  const yearsWorked = calculateYearsWorked(admissionDate, terminationDate)

  // --- Saldo de salario (all types) ---
  const saldoDays = calculateSaldoDays(terminationDate)
  const saldoSalario = round(saldoDays * dailyRate)

  // --- Aviso previo ---
  let avisoPrevioDays = 0
  let avisoPrevio = 0
  let avisoPrevioIndemnizado = false
  let avisoPrevioDeduction = 0
  let projectedEndDate: string | undefined

  if (terminationType === 'sem_justa_causa') {
    avisoPrevioDays = calculateAvisoPrevioDays(admissionDate, terminationDate)
    if (!workedNoticePeriod) {
      // Indemnified: employer pays
      avisoPrevio = round(dailyRate * avisoPrevioDays)
      avisoPrevioIndemnizado = true
      projectedEndDate = addDays(terminationDate, avisoPrevioDays)
    }
    // If worked, aviso previo was already included in regular salary, no extra payment
  } else if (terminationType === 'pedido_demissao') {
    // Employee must give 30 days notice or employer deducts
    if (!employeeGaveNotice) {
      avisoPrevioDeduction = round(dailyRate * 30)
      avisoPrevioDays = 30
    }
  }
  // justa_causa: no aviso previo

  // --- 13th proportional ---
  let thirteenthMonths = 0
  let thirteenthProportional = 0
  if (terminationType !== 'justa_causa') {
    thirteenthMonths = calculateProportionalThirteenthMonths(
      admissionDate,
      terminationDate,
      projectedEndDate
    )
    thirteenthProportional = round(lastSalary / 12 * thirteenthMonths)
  }

  // --- Vacation proportional + 1/3 ---
  let vacationProportionalMonths = 0
  let vacationProportional = 0
  let vacationProportionalOneThird = 0
  if (terminationType !== 'justa_causa') {
    vacationProportionalMonths = calculateVacationProportionalMonths(admissionDate, terminationDate)
    vacationProportional = round(lastSalary / 12 * vacationProportionalMonths)
    vacationProportionalOneThird = round(vacationProportional / 3)
  }

  // --- Accrued vacation + 1/3 (all types) ---
  const accruedVacation = round(lastSalary * accruedVacationPeriods)
  const accruedVacationOneThird = round(accruedVacation / 3)

  // --- Total earnings ---
  const totalEarnings = round(
    saldoSalario +
    avisoPrevio +
    thirteenthProportional +
    vacationProportional +
    vacationProportionalOneThird +
    accruedVacation +
    accruedVacationOneThird
  )

  // --- INSS and IRRF ---
  // INSS applies to: saldo de salario + aviso previo (if worked) + 13th proportional
  // Vacation amounts are exempt from INSS
  // For indemnified aviso previo, it is also exempt from INSS
  const inssBase = round(
    saldoSalario +
    (terminationType === 'sem_justa_causa' && workedNoticePeriod ? lastSalary : 0) +
    thirteenthProportional
  )
  const inss = calculateINSSEmployee(inssBase, table)

  // IRRF base: inssBase - INSS - dependents deduction
  const irrf = calculateIRRF(inssBase, inss.total, dependents, table)

  // --- Total deductions ---
  const totalDeductions = round(inss.total + irrf.tax + avisoPrevioDeduction)

  // --- FGTS ---
  // FGTS 8% on: saldo de salario + aviso previo indemnizado + 13th proportional
  const fgtsBase = round(saldoSalario + avisoPrevio + thirteenthProportional)
  const fgtsOnTermination = round(fgtsBase * 0.08)

  const totalFgtsBalance = round(fgtsBalance + fgtsOnTermination)

  let fgtsPenalty = 0
  if (terminationType === 'sem_justa_causa') {
    fgtsPenalty = round(totalFgtsBalance * 0.40)
  }

  const totalFgts = round(fgtsOnTermination + fgtsPenalty)

  // --- Net ---
  const netAmount = round(totalEarnings - totalDeductions)
  const totalToReceive = round(netAmount + fgtsPenalty)

  const typeLabels: Record<TerminationType, string> = {
    sem_justa_causa: 'Dispensa sem justa causa',
    pedido_demissao: 'Pedido de demissão',
    justa_causa: 'Dispensa por justa causa',
  }

  const totalMonths = yearsWorked * 12 +
    calculateVacationProportionalMonths(admissionDate, terminationDate)

  return {
    terminationType,
    terminationTypeLabel: typeLabels[terminationType],

    admissionDate,
    terminationDate,
    yearsWorked,
    monthsWorked: totalMonths,

    saldoSalario,
    saldoSalarioDays: saldoDays,
    avisoPrevio,
    avisoPrevioDays,
    avisoPrevioIndemnizado,
    thirteenthProportional,
    thirteenthMonths,
    vacationProportional,
    vacationProportionalMonths,
    vacationProportionalOneThird,
    accruedVacation,
    accruedVacationOneThird,
    accruedVacationPeriods,
    totalEarnings,

    inssEmployee: inss.total,
    inssBase,
    irrfEmployee: irrf.tax,
    irrfBase: irrf.base,
    avisoPrevioDeduction,
    totalDeductions,

    fgtsOnTermination,
    fgtsBalance: fgtsBalance,
    fgtsPenalty,
    totalFgts,

    netAmount,
    totalToReceive,
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
