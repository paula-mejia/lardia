/**
 * Payroll calculation engine for Brazilian domestic employers.
 * 
 * Calculates:
 * - INSS employee contribution (progressive brackets)
 * - INSS employer contribution (CP Patronal + GILRAT)
 * - FGTS (monthly + anticipation)
 * - IRRF (when applicable)
 * - DAE total (monthly payment guide)
 * - Net salary
 * 
 * All calculations use progressive rates per Brazilian labor law.
 */

import { TaxTable, CURRENT_TAX_TABLE } from './tax-tables'

export interface PayrollInput {
  grossSalary: number
  dependents?: number // number of dependents for IRRF
  overtimeHours?: number
  overtimeRate?: number // default 1.5 (50% adicional)
  absenceDays?: number
  dsrAbsenceDays?: number // DSR days lost due to absences
  otherDeductions?: number
  otherEarnings?: number
  taxTable?: TaxTable
}

export interface PayrollBreakdown {
  // Earnings (Vencimentos)
  grossSalary: number
  overtimePay: number
  otherEarnings: number
  totalEarnings: number

  // Employee deductions (Descontos)
  inssEmployee: number
  inssEmployeeDetails: { bracket: string; amount: number }[]
  irrfEmployee: number
  irrfBase: number // base de cálculo IRRF
  absenceDeduction: number
  dsrDeduction: number
  otherDeductions: number
  totalDeductions: number

  // Net salary
  netSalary: number

  // Employer costs (not deducted from employee)
  inssEmployer: number // CP Patronal (8%)
  gilrat: number // 0.8% accident insurance
  fgtsMonthly: number // 8%
  fgtsAnticipation: number // 3.2%
  
  // DAE total (what employer pays to government monthly)
  daeTotal: number
  daeBreakdown: {
    inssEmployee: number
    inssEmployer: number
    gilrat: number
    fgtsMonthly: number
    fgtsAnticipation: number
  }

  // Total employer cost
  totalEmployerCost: number // salary + DAE
}

/**
 * Calculate INSS employee contribution using progressive brackets.
 * Each bracket applies only to the portion of salary within that range.
 */
export function calculateINSSEmployee(
  salary: number,
  table: TaxTable = CURRENT_TAX_TABLE
): { total: number; details: { bracket: string; amount: number }[] } {
  let remaining = salary
  let total = 0
  const details: { bracket: string; amount: number }[] = []

  for (const bracket of table.inss.employee) {
    if (remaining <= 0) break

    const bracketSize = bracket.max - (bracket.min > 0 ? bracket.min - 0.01 : 0)
    const taxableInBracket = Math.min(remaining, bracketSize)
    const contribution = round(taxableInBracket * (bracket.rate / 100))

    if (contribution > 0) {
      details.push({
        bracket: `${formatBRL(bracket.min)} - ${bracket.max === Infinity ? '∞' : formatBRL(bracket.max)} (${bracket.rate}%)`,
        amount: contribution,
      })
      total += contribution
    }

    remaining -= taxableInBracket
  }

  return { total: round(total), details }
}

/**
 * Calculate IRRF (income tax) after INSS deduction.
 * Base = salary - INSS - (dependents * deduction per dependent)
 */
export function calculateIRRF(
  salary: number,
  inssDeduction: number,
  dependents: number = 0,
  table: TaxTable = CURRENT_TAX_TABLE
): { tax: number; base: number } {
  const base = round(salary - inssDeduction - (dependents * table.irrf.dependentDeduction))

  if (base <= 0) return { tax: 0, base: 0 }

  for (const bracket of table.irrf.brackets) {
    if (base >= bracket.min && base <= bracket.max) {
      const tax = round(base * (bracket.rate / 100) - bracket.deduction)
      return { tax: Math.max(0, tax), base }
    }
  }

  // Shouldn't reach here, but safety
  const lastBracket = table.irrf.brackets[table.irrf.brackets.length - 1]
  const tax = round(base * (lastBracket.rate / 100) - lastBracket.deduction)
  return { tax: Math.max(0, tax), base }
}

/**
 * Calculate complete monthly payroll.
 */
export function calculatePayroll(input: PayrollInput): PayrollBreakdown {
  const table = input.taxTable || CURRENT_TAX_TABLE
  const {
    grossSalary,
    dependents = 0,
    overtimeHours = 0,
    overtimeRate = 1.5,
    absenceDays = 0,
    dsrAbsenceDays = 0,
    otherDeductions = 0,
    otherEarnings = 0,
  } = input

  // Daily rate (always divide by 30 - commercial month)
  const dailyRate = round(grossSalary / 30)
  
  // Hourly rate (220 hours/month for full-time, or proportional)
  const hourlyRate = round(grossSalary / 220)

  // Overtime pay
  const overtimePay = round(overtimeHours * hourlyRate * overtimeRate)

  // Absence deduction
  const absenceDeduction = round(absenceDays * dailyRate)
  
  // DSR deduction (lost rest days due to absences)
  const dsrDeduction = round(dsrAbsenceDays * dailyRate)

  // Total earnings
  const totalEarnings = round(grossSalary + overtimePay + otherEarnings)
  
  // Base for calculations (after absence deductions)
  const calcBase = round(totalEarnings - absenceDeduction - dsrDeduction)

  // INSS employee (progressive)
  const inss = calculateINSSEmployee(calcBase, table)

  // IRRF
  const irrf = calculateIRRF(calcBase, inss.total, dependents, table)

  // Total deductions
  const totalDeductions = round(
    inss.total + irrf.tax + absenceDeduction + dsrDeduction + otherDeductions
  )

  // Net salary
  const netSalary = round(totalEarnings - totalDeductions)

  // Employer costs
  const inssEmployer = round(calcBase * (table.inss.employer.cpPatronal / 100))
  const gilrat = round(calcBase * (table.inss.employer.gilrat / 100))
  const fgtsMonthly = round(calcBase * (table.fgts.monthly / 100))
  const fgtsAnticipation = round(calcBase * (table.fgts.anticipation / 100))

  // DAE total
  const daeTotal = round(inss.total + inssEmployer + gilrat + fgtsMonthly + fgtsAnticipation)

  // Total employer cost
  const totalEmployerCost = round(calcBase + inssEmployer + gilrat + fgtsMonthly + fgtsAnticipation)

  return {
    grossSalary,
    overtimePay,
    otherEarnings,
    totalEarnings,

    inssEmployee: inss.total,
    inssEmployeeDetails: inss.details,
    irrfEmployee: irrf.tax,
    irrfBase: irrf.base,
    absenceDeduction,
    dsrDeduction,
    otherDeductions,
    totalDeductions,

    netSalary,

    inssEmployer,
    gilrat,
    fgtsMonthly,
    fgtsAnticipation,

    daeTotal,
    daeBreakdown: {
      inssEmployee: inss.total,
      inssEmployer,
      gilrat,
      fgtsMonthly,
      fgtsAnticipation,
    },

    totalEmployerCost,
  }
}

// Utility functions
function round(value: number): number {
  return Math.round(value * 100) / 100
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
