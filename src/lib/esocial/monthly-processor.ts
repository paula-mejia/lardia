/**
 * Monthly eSocial processing engine.
 * Processes all employees for a given month, generates S-1200 + S-1210 events and DAE.
 */

import { buildS1200FromPayroll } from './event-builder'
import { buildS1210 } from './event-builder'
import { generateDae } from './dae-generator'
import { EsocialEvent, S1210Data, DaeRecord } from './events'
import { PayrollBreakdown } from '../calc/payroll'

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'error'

export interface EmployeeProcessingResult {
  employeeId: string
  employeeName: string
  cpf: string
  grossSalary: number
  status: ProcessingStatus
  s1200Event?: EsocialEvent
  s1210Event?: EsocialEvent
  payroll?: PayrollBreakdown
  error?: string
}

export interface MonthlyProcessingResult {
  month: number
  year: number
  employerId: string
  status: ProcessingStatus
  employees: EmployeeProcessingResult[]
  dae?: DaeRecord
  events: EsocialEvent[]
  totalEventsGenerated: number
  totalDaeValue: number
  errors: string[]
  processedAt?: string
}

export interface EmployeeInput {
  id: string
  name: string
  cpf: string
  grossSalary: number
  dependents?: number
  overtimeHours?: number
  absenceDays?: number
  dsrAbsenceDays?: number
  otherEarnings?: number
  otherDeductions?: number
}

/**
 * Calculate payment date for a given month/year.
 * Payment is on the 5th business day of the following month.
 * Simplified: use the 5th of next month, adjusted for weekends.
 */
function calculatePaymentDate(month: number, year: number): string {
  let payMonth = month + 1
  let payYear = year
  if (payMonth > 12) {
    payMonth = 1
    payYear += 1
  }
  const date = new Date(payYear, payMonth - 1, 5)
  const day = date.getDay()
  if (day === 0) date.setDate(date.getDate() + 1)
  else if (day === 6) date.setDate(date.getDate() + 2)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Process monthly payroll for all employees.
 * Generates S-1200 (remuneração) and S-1210 (pagamento) events plus DAE.
 */
export function processMonthlyPayroll(
  employerId: string,
  employerCpf: string,
  month: number,
  year: number,
  employees: EmployeeInput[],
  onProgress?: (employeeId: string, status: ProcessingStatus) => void
): MonthlyProcessingResult {
  const result: MonthlyProcessingResult = {
    month,
    year,
    employerId,
    status: 'processing',
    employees: [],
    events: [],
    totalEventsGenerated: 0,
    totalDaeValue: 0,
    errors: [],
  }

  const payrollResults: Array<{
    employeeId: string
    employeeName: string
    grossSalary: number
    payroll: PayrollBreakdown
  }> = []

  const paymentDate = calculatePaymentDate(month, year)
  const perRef = `${year}-${String(month).padStart(2, '0')}`

  for (const emp of employees) {
    onProgress?.(emp.id, 'processing')

    const empResult: EmployeeProcessingResult = {
      employeeId: emp.id,
      employeeName: emp.name,
      cpf: emp.cpf,
      grossSalary: emp.grossSalary,
      status: 'pending',
    }

    try {
      // Generate S-1200 (remuneração)
      const { event: s1200Event, payroll } = buildS1200FromPayroll(
        employerId,
        emp.id,
        employerCpf,
        emp.cpf,
        emp.grossSalary,
        month,
        year,
        {
          dependents: emp.dependents,
          overtimeHours: emp.overtimeHours,
          absenceDays: emp.absenceDays,
          dsrAbsenceDays: emp.dsrAbsenceDays,
          otherEarnings: emp.otherEarnings,
          otherDeductions: emp.otherDeductions,
        }
      )

      s1200Event.status = 'draft'

      // Generate S-1210 (pagamento)
      const s1210Data: S1210Data = {
        cpfTrabalhador: emp.cpf,
        dtPagamento: paymentDate,
        perRef,
        vrLiquido: payroll.netSalary,
        tpPgto: 1, // salário mensal
        infoIRRF: payroll.irrfEmployee > 0 ? {
          vrBaseIRRF: payroll.irrfBase,
          vrIRRF: payroll.irrfEmployee,
        } : undefined,
      }

      const s1210Event = buildS1210(employerId, emp.id, s1210Data, month, year)
      s1210Event.status = 'draft'

      empResult.s1200Event = s1200Event
      empResult.s1210Event = s1210Event
      empResult.payroll = payroll
      empResult.status = 'completed'

      result.events.push(s1200Event, s1210Event)
      payrollResults.push({
        employeeId: emp.id,
        employeeName: emp.name,
        grossSalary: emp.grossSalary,
        payroll,
      })

      onProgress?.(emp.id, 'completed')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
      empResult.status = 'error'
      empResult.error = errorMsg
      result.errors.push(`${emp.name}: ${errorMsg}`)
      onProgress?.(emp.id, 'error')
    }

    result.employees.push(empResult)
  }

  // Generate DAE aggregating all costs
  if (payrollResults.length > 0) {
    result.dae = generateDae(employerId, month, year, payrollResults)
    result.totalDaeValue = result.dae.totalAmount
  }

  result.totalEventsGenerated = result.events.length

  const allErrors = result.employees.every((e) => e.status === 'error')
  result.status = allErrors ? 'error' : 'completed'
  result.processedAt = new Date().toISOString()

  return result
}

/**
 * Get month name in Portuguese
 */
export function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return months[month - 1] || ''
}
