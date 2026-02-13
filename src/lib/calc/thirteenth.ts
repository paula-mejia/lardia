/**
 * 13th Salary (Décimo Terceiro) calculation engine.
 * 
 * Brazilian law requires two installments:
 * - 1st installment: paid by November 30 (50% of salary, no deductions)
 * - 2nd installment: paid by December 20 (50% minus INSS and IRRF)
 * 
 * Proportional calculation: salary / 12 * months worked
 * A month counts if the employee worked 15+ days in that month.
 */

import { TaxTable, CURRENT_TAX_TABLE } from './tax-tables'
import { calculateINSSEmployee, calculateIRRF } from './payroll'

export interface ThirteenthInput {
  monthlySalary: number
  monthsWorked: number // 1-12 (months with 15+ days worked)
  dependents?: number
  averageOvertimePay?: number // monthly average of overtime, if applicable
  taxTable?: TaxTable
}

export interface ThirteenthBreakdown {
  // Base calculation
  monthlySalary: number
  monthsWorked: number
  proportionalBase: number // salary / 12 * monthsWorked
  averageOvertimePay: number
  totalBase: number // proportionalBase + averageOvertimePay

  // 1st installment (adiantamento - November)
  firstInstallment: number // 50% of totalBase, no deductions
  firstInstallmentDeadline: string

  // 2nd installment (final - December)
  secondInstallmentGross: number // remaining 50%
  inssEmployee: number
  inssEmployeeDetails: { bracket: string; amount: number }[]
  irrfEmployee: number
  irrfBase: number
  secondInstallmentNet: number
  secondInstallmentDeadline: string

  // FGTS per installment (8% on each)
  fgtsFirstInstallment: number
  fgtsSecondInstallment: number

  // Employer costs on full 13th
  inssEmployer: number
  gilrat: number
  fgtsMonthly: number // total FGTS (first + second)
  fgtsAnticipation: number

  // Totals
  totalEmployeePay: number // firstInstallment + secondInstallmentNet
  totalEmployerCost: number // totalBase + employer contributions
}

/**
 * Calculate months worked based on admission date.
 * A month counts if the employee worked 15+ days in it.
 */
export function calculateMonthsWorked(admissionDate: Date, referenceYear: number): number {
  const admYear = admissionDate.getFullYear()
  const admMonth = admissionDate.getMonth() // 0-indexed

  // If admitted before this year, full 12 months
  if (admYear < referenceYear) return 12

  // If admitted this year
  if (admYear === referenceYear) {
    const admDay = admissionDate.getDate()
    // First month counts if started on or before the 15th
    const firstMonthCounts = admDay <= 15 ? 1 : 0
    const fullMonthsAfter = 12 - admMonth - 1 // months after admission month
    return firstMonthCounts + fullMonthsAfter
  }

  // Admitted after reference year
  return 0
}

/**
 * Calculate complete 13th salary (both installments).
 */
export function calculateThirteenth(input: ThirteenthInput): ThirteenthBreakdown {
  const table = input.taxTable || CURRENT_TAX_TABLE
  const {
    monthlySalary,
    monthsWorked,
    dependents = 0,
    averageOvertimePay = 0,
  } = input

  // Proportional base
  const proportionalBase = round(monthlySalary / 12 * monthsWorked)
  const totalBase = round(proportionalBase + averageOvertimePay)

  // 1st installment: 50% of total base, no deductions
  const firstInstallment = round(totalBase / 2)

  // 2nd installment: total base - first installment
  const secondInstallmentGross = round(totalBase - firstInstallment)

  // INSS is calculated on the FULL 13th base (not just 2nd installment)
  // but deducted only from the 2nd installment
  const inss = calculateINSSEmployee(totalBase, table)

  // IRRF on 13th salary (separate from monthly, uses full 13th base)
  const irrf = calculateIRRF(totalBase, inss.total, dependents, table)

  // 2nd installment net
  const secondInstallmentNet = round(secondInstallmentGross - inss.total - irrf.tax)

  // FGTS on each installment (8% on each)
  const fgtsFirstInstallment = round(firstInstallment * (table.fgts.monthly / 100))
  const fgtsSecondInstallment = round(secondInstallmentGross * (table.fgts.monthly / 100))

  // Employer costs (on full 13th base)
  const inssEmployer = round(totalBase * (table.inss.employer.cpPatronal / 100))
  const gilrat = round(totalBase * (table.inss.employer.gilrat / 100))
  const fgtsMonthly = round(fgtsFirstInstallment + fgtsSecondInstallment)
  const fgtsAnticipation = round(totalBase * (table.fgts.anticipation / 100))

  return {
    monthlySalary,
    monthsWorked,
    proportionalBase,
    averageOvertimePay,
    totalBase,

    firstInstallment,
    firstInstallmentDeadline: '30 de novembro',

    secondInstallmentGross,
    inssEmployee: inss.total,
    inssEmployeeDetails: inss.details,
    irrfEmployee: irrf.tax,
    irrfBase: irrf.base,
    secondInstallmentNet,
    secondInstallmentDeadline: '20 de dezembro',

    fgtsFirstInstallment,
    fgtsSecondInstallment,

    inssEmployer,
    gilrat,
    fgtsMonthly,
    fgtsAnticipation,

    totalEmployeePay: round(firstInstallment + secondInstallmentNet),
    totalEmployerCost: round(totalBase + inssEmployer + gilrat + fgtsMonthly + fgtsAnticipation),
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
