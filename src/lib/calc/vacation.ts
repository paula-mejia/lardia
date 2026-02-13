/**
 * Vacation (Ferias) calculation engine for Brazilian domestic workers.
 *
 * Rules:
 * - 30 days paid vacation after 12 months (periodo aquisitivo)
 * - 1/3 constitutional bonus (terco constitucional)
 * - Option to sell up to 10 days (abono pecuniario)
 * - INSS/IRRF deductions on vacation pay + 1/3
 * - FGTS due on vacation pay (8%)
 * - Payment deadline: 2 business days before vacation starts
 * - Absences reduce vacation days per CLT art. 130
 * - Proportional vacation on termination
 */

import { TaxTable, CURRENT_TAX_TABLE } from './tax-tables'
import { calculateINSSEmployee, calculateIRRF } from './payroll'

export interface VacationInput {
  monthlySalary: number
  absences: number // absences during the acquisition period
  daysSold: number // abono pecuniario (0-10)
  proportionalMonths?: number // 1-12 for proportional; undefined = full vacation
  dependents?: number
  vacationStartDate?: string // ISO date string, used for payment deadline
  taxTable?: TaxTable
}

export interface VacationBreakdown {
  // Entitlement
  totalVacationDays: number // after absence reduction
  daysEnjoyed: number // days actually taken off
  daysSold: number // abono pecuniario days

  // Vacation pay (salary portion for days enjoyed)
  vacationPay: number
  tercoConstitucional: number // 1/3 of vacationPay

  // Abono pecuniario (sold days)
  abonoPay: number
  abonoTerco: number // 1/3 of abonoPay

  // Gross totals
  totalGross: number // vacationPay + terco + abono + abonoTerco

  // Deductions (INSS/IRRF apply only to vacationPay + terco, NOT abono)
  inssBase: number
  inssEmployee: number
  inssEmployeeDetails: { bracket: string; amount: number }[]
  irrfEmployee: number
  irrfBase: number
  totalDeductions: number

  // Net
  netPayment: number

  // Employer costs
  fgtsDue: number // 8% on vacationPay + terco (not abono)

  // Deadline
  paymentDeadline: string | null // 2 days before vacation start

  // Proportional info
  isProportional: boolean
  proportionalMonths: number
}

/**
 * Determine vacation days based on absences per CLT art. 130.
 */
export function getVacationDaysByAbsences(absences: number): number {
  if (absences <= 5) return 30
  if (absences <= 14) return 24
  if (absences <= 23) return 18
  if (absences <= 32) return 12
  return 0
}

/**
 * Calculate payment deadline: 2 days before vacation start.
 */
export function getPaymentDeadline(vacationStartDate: string): string {
  const date = new Date(vacationStartDate + 'T12:00:00')
  date.setDate(date.getDate() - 2)
  return date.toISOString().split('T')[0]
}

/**
 * Calculate complete vacation breakdown.
 */
export function calculateVacation(input: VacationInput): VacationBreakdown {
  const table = input.taxTable || CURRENT_TAX_TABLE
  const {
    monthlySalary,
    absences,
    daysSold,
    proportionalMonths,
    dependents = 0,
    vacationStartDate,
  } = input

  const isProportional = proportionalMonths !== undefined && proportionalMonths < 12
  const months = isProportional ? proportionalMonths! : 12

  // Base vacation days from absences
  const fullVacationDays = getVacationDaysByAbsences(absences)

  // Proportional adjustment
  const totalVacationDays = isProportional
    ? round(fullVacationDays / 12 * months)
    : fullVacationDays

  // Clamp days sold
  const effectiveDaysSold = Math.min(daysSold, Math.floor(totalVacationDays / 3), 10)
  const daysEnjoyed = totalVacationDays - effectiveDaysSold

  // Daily rate
  const dailyRate = round(monthlySalary / 30)

  // Vacation pay for enjoyed days
  const vacationPay = round(daysEnjoyed * dailyRate)
  const tercoConstitucional = round(vacationPay / 3)

  // Abono pecuniario (sold days)
  const abonoPay = round(effectiveDaysSold * dailyRate)
  const abonoTerco = round(abonoPay / 3)

  // Total gross
  const totalGross = round(vacationPay + tercoConstitucional + abonoPay + abonoTerco)

  // INSS and IRRF apply to vacationPay + terco only (abono is exempt)
  const inssBase = round(vacationPay + tercoConstitucional)
  const inss = calculateINSSEmployee(inssBase, table)
  const irrf = calculateIRRF(inssBase, inss.total, dependents, table)

  const totalDeductions = round(inss.total + irrf.tax)
  const netPayment = round(totalGross - totalDeductions)

  // FGTS on vacation pay + terco (8%)
  const fgtsDue = round(inssBase * (table.fgts.monthly / 100))

  // Payment deadline
  const paymentDeadline = vacationStartDate
    ? getPaymentDeadline(vacationStartDate)
    : null

  return {
    totalVacationDays,
    daysEnjoyed,
    daysSold: effectiveDaysSold,

    vacationPay,
    tercoConstitucional,

    abonoPay,
    abonoTerco,

    totalGross,

    inssBase,
    inssEmployee: inss.total,
    inssEmployeeDetails: inss.details,
    irrfEmployee: irrf.tax,
    irrfBase: irrf.base,
    totalDeductions,

    netPayment,

    fgtsDue,

    paymentDeadline,

    isProportional,
    proportionalMonths: months,
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
