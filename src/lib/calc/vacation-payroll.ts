/**
 * Vacation Payroll calculation engine.
 * 
 * Generates contracheque and DAE for months affected by vacation.
 * Handles the common case where vacation crosses calendar months.
 */

import { TaxTable, CURRENT_TAX_TABLE } from './tax-tables'
import { calculateINSSEmployee, calculateIRRF } from './payroll'

export interface VacationPayrollInput {
  monthlySalary: number
  vacationStartDate: string      // ISO date: "2026-03-10"
  vacationDays: number           // 14-30
  sellDays?: number              // Abono pecuniário (0-10), default 0
  includeVT?: boolean
  dependents?: number
  taxTable?: TaxTable
}

export interface VacationPayrollMonth {
  month: string
  workedDays: number
  vacationDaysInMonth: number

  salaryForWorkedDays: number
  vacationPay: number
  tercoConstitucional: number
  abonoPay: number
  abonoTerco: number
  totalProventos: number

  inssEmployee: number
  inssEmployeeDetails: { bracket: string; amount: number }[]
  irrfEmployee: number
  valeTransporte: number
  totalDescontos: number

  netSalary: number

  inssPatronal: number
  gilrat: number
  fgtsMonthly: number
  fgtsAnticipation: number
  totalDAE: number

  totalEmployerCost: number
}

export interface VacationPayrollResult {
  months: VacationPayrollMonth[]
  summary: {
    totalProventos: number
    totalDescontos: number
    totalLiquido: number
    totalDAE: number
    totalEmployerCost: number
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Calculate vacation payroll for all affected months.
 */
export function calculateVacationPayroll(input: VacationPayrollInput): VacationPayrollResult {
  const {
    monthlySalary,
    vacationStartDate,
    vacationDays,
    sellDays = 0,
    includeVT = false,
    dependents = 0,
    taxTable = CURRENT_TAX_TABLE,
  } = input

  const enjoyedDays = vacationDays - sellDays
  const dailyRate = round(monthlySalary / 30)

  // Parse start date
  const startDate = new Date(vacationStartDate + 'T00:00:00Z')
  const startDay = startDate.getUTCDate()
  const startMonth = startDate.getUTCMonth() // 0-indexed
  const startYear = startDate.getUTCFullYear()

  // Calculate vacation days per month (commercial 30-day months)
  const monthsData: { year: number; month: number; vacDays: number; isFirst: boolean }[] = []

  const vacDaysInFirstMonth = Math.min(enjoyedDays, 30 - startDay + 1)
  const monthKey1 = startMonth
  monthsData.push({
    year: startYear,
    month: monthKey1,
    vacDays: vacDaysInFirstMonth,
    isFirst: true,
  })

  const remainingVacDays = enjoyedDays - vacDaysInFirstMonth
  if (remainingVacDays > 0) {
    let nextMonth = startMonth + 1
    let nextYear = startYear
    if (nextMonth > 11) { nextMonth = 0; nextYear++ }
    monthsData.push({
      year: nextYear,
      month: nextMonth,
      vacDays: remainingVacDays,
      isFirst: false,
    })
  }

  const months: VacationPayrollMonth[] = []

  for (const md of monthsData) {
    const workedDays = 30 - md.vacDays
    const monthStr = `${md.year}-${String(md.month + 1).padStart(2, '0')}`

    const salaryForWorkedDays = round(dailyRate * workedDays)
    const vacationPay = round(dailyRate * md.vacDays)
    const tercoConstitucional = round(vacationPay / 3)

    // Abono only in first month
    const abonoPay = md.isFirst ? round(dailyRate * sellDays) : 0
    const abonoTerco = md.isFirst ? round(abonoPay / 3) : 0

    const totalProventos = round(salaryForWorkedDays + vacationPay + tercoConstitucional + abonoPay + abonoTerco)

    // INSS base excludes abono
    const inssBase = round(salaryForWorkedDays + vacationPay + tercoConstitucional)
    const inss = calculateINSSEmployee(inssBase, taxTable)

    // IRRF base = total proventos - INSS - abono - abonoTerco
    const irrfGrossBase = round(totalProventos - abonoPay - abonoTerco)
    const irrf = calculateIRRF(irrfGrossBase, inss.total, dependents, taxTable)

    // VT: 6% of worked days salary
    const valeTransporte = includeVT ? round(salaryForWorkedDays * 0.06) : 0

    const totalDescontos = round(inss.total + irrf.tax + valeTransporte)
    const netSalary = round(totalProventos - totalDescontos)

    // DAE base = total proventos excluding abono
    const daeBase = round(totalProventos - abonoPay - abonoTerco)
    const inssPatronal = round(daeBase * (taxTable.inss.employer.cpPatronal / 100))
    const gilrat = round(daeBase * (taxTable.inss.employer.gilrat / 100))
    const fgtsMonthly = round(daeBase * (taxTable.fgts.monthly / 100))
    const fgtsAnticipation = round(daeBase * (taxTable.fgts.anticipation / 100))
    const totalDAE = round(inss.total + inssPatronal + gilrat + fgtsMonthly + fgtsAnticipation)

    const totalEmployerCost = round(daeBase + inssPatronal + gilrat + fgtsMonthly + fgtsAnticipation)

    months.push({
      month: monthStr,
      workedDays,
      vacationDaysInMonth: md.vacDays,
      salaryForWorkedDays,
      vacationPay,
      tercoConstitucional,
      abonoPay,
      abonoTerco,
      totalProventos,
      inssEmployee: inss.total,
      inssEmployeeDetails: inss.details,
      irrfEmployee: irrf.tax,
      valeTransporte,
      totalDescontos,
      netSalary,
      inssPatronal,
      gilrat,
      fgtsMonthly,
      fgtsAnticipation,
      totalDAE,
      totalEmployerCost,
    })
  }

  const summary = {
    totalProventos: round(months.reduce((s, m) => s + m.totalProventos, 0)),
    totalDescontos: round(months.reduce((s, m) => s + m.totalDescontos, 0)),
    totalLiquido: round(months.reduce((s, m) => s + m.netSalary, 0)),
    totalDAE: round(months.reduce((s, m) => s + m.totalDAE, 0)),
    totalEmployerCost: round(months.reduce((s, m) => s + m.totalEmployerCost, 0)),
  }

  return { months, summary }
}
