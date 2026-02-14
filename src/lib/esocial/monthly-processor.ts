/**
 * Monthly eSocial processing queue.
 * Processes all employees for a given month, generates S-1200 events and DAE.
 */

import { buildS1200FromPayroll } from './event-builder'
import { generateDae } from './dae-generator'
import { EsocialEvent, DaeRecord } from './events'
import { PayrollBreakdown } from '../calc/payroll'

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'error'

export interface EmployeeProcessingResult {
  employeeId: string
  employeeName: string
  cpf: string
  grossSalary: number
  status: ProcessingStatus
  event?: EsocialEvent
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
  processedAt?: string
  error?: string
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
 * Process monthly payroll for all employees.
 * Generates S-1200 events and DAE in simulation mode.
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
  }

  const payrollResults: Array<{
    employeeId: string
    employeeName: string
    grossSalary: number
    payroll: PayrollBreakdown
  }> = []

  // Process each employee
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
      const { event, payroll } = buildS1200FromPayroll(
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

      // In simulation mode, auto-accept the event
      event.status = 'accepted'
      event.submittedAt = new Date().toISOString()

      empResult.event = event
      empResult.payroll = payroll
      empResult.status = 'completed'

      result.events.push(event)
      payrollResults.push({
        employeeId: emp.id,
        employeeName: emp.name,
        grossSalary: emp.grossSalary,
        payroll,
      })

      onProgress?.(emp.id, 'completed')
    } catch (err) {
      empResult.status = 'error'
      empResult.error = err instanceof Error ? err.message : 'Erro desconhecido'
      onProgress?.(emp.id, 'error')
    }

    result.employees.push(empResult)
  }

  // Generate DAE if we have any successful payroll results
  if (payrollResults.length > 0) {
    result.dae = generateDae(employerId, month, year, payrollResults)
  }

  // Set overall status
  const hasErrors = result.employees.some((e) => e.status === 'error')
  const allErrors = result.employees.every((e) => e.status === 'error')
  result.status = allErrors ? 'error' : hasErrors ? 'completed' : 'completed'
  result.processedAt = new Date().toISOString()

  return result
}

/**
 * Get month name in Portuguese
 */
export function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return months[month - 1] || ''
}
