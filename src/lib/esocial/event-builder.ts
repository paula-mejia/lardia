/**
 * eSocial event builder - transforms Lardia internal data into eSocial event format.
 * Includes validation and mock XML generation.
 */

import {
  S2200Data, S2206Data, S1200Data, S1210Data,
  S2230Data, S2250Data, S2299Data, S2300Data,
  EsocialEvent, EsocialEventType
} from './events'
import { calculatePayroll, PayrollBreakdown } from '../calc/payroll'

// Validation error
export class EventValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message)
    this.name = 'EventValidationError'
  }
}

// Validate CPF format (11 digits)
function validateCPF(cpf: string): boolean {
  return /^\d{11}$/.test(cpf.replace(/\D/g, ''))
}

// Validate date format YYYY-MM-DD
function validateDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date))
}

// Validate required fields
function requireField(value: unknown, field: string): void {
  if (value === undefined || value === null || value === '') {
    throw new EventValidationError(field, `Campo obrigatorio: ${field}`)
  }
}

/**
 * Build S-2200 event (employee admission)
 */
export function buildS2200(
  employerId: string,
  employeeId: string,
  data: S2200Data,
  month: number,
  year: number
): EsocialEvent {
  requireField(data.cpfTrabalhador, 'cpfTrabalhador')
  requireField(data.nmTrabalhador, 'nmTrabalhador')
  requireField(data.dtAdmissao, 'dtAdmissao')
  requireField(data.vrSalario, 'vrSalario')

  if (!validateCPF(data.cpfTrabalhador)) {
    throw new EventValidationError('cpfTrabalhador', 'CPF invalido')
  }
  if (!validateDate(data.dtAdmissao)) {
    throw new EventValidationError('dtAdmissao', 'Data de admissao invalida')
  }

  return {
    employerId,
    employeeId,
    eventType: 'S-2200',
    eventData: data,
    status: 'draft',
    referenceMonth: month,
    referenceYear: year,
  }
}

/**
 * Build S-2206 event (contract change)
 */
export function buildS2206(
  employerId: string,
  employeeId: string,
  data: S2206Data,
  month: number,
  year: number
): EsocialEvent {
  requireField(data.cpfTrabalhador, 'cpfTrabalhador')
  requireField(data.dtAlteracao, 'dtAlteracao')

  if (!validateCPF(data.cpfTrabalhador)) {
    throw new EventValidationError('cpfTrabalhador', 'CPF invalido')
  }

  return {
    employerId,
    employeeId,
    eventType: 'S-2206',
    eventData: data,
    status: 'draft',
    referenceMonth: month,
    referenceYear: year,
  }
}

/**
 * Build S-1200 event (monthly payroll) from payroll calculation
 */
export function buildS1200FromPayroll(
  employerId: string,
  employeeId: string,
  employerCpf: string,
  employeeCpf: string,
  grossSalary: number,
  month: number,
  year: number,
  options?: {
    overtimeHours?: number
    absenceDays?: number
    dsrAbsenceDays?: number
    dependents?: number
    otherEarnings?: number
    otherDeductions?: number
  }
): { event: EsocialEvent; payroll: PayrollBreakdown } {
  const payroll = calculatePayroll({
    grossSalary,
    dependents: options?.dependents,
    overtimeHours: options?.overtimeHours,
    absenceDays: options?.absenceDays,
    dsrAbsenceDays: options?.dsrAbsenceDays,
    otherEarnings: options?.otherEarnings,
    otherDeductions: options?.otherDeductions,
  })

  const perApur = `${year}-${String(month).padStart(2, '0')}`

  const data: S1200Data = {
    cpfTrabalhador: employeeCpf,
    perApur,
    ideEstabLot: {
      tpInsc: 2, // CPF for domestic employer
      nrInsc: employerCpf,
    },
    remunPeriodo: {
      vrSalario: payroll.grossSalary,
      horasExtras: options?.overtimeHours,
      vrHorasExtras: payroll.overtimePay || undefined,
      faltas: options?.absenceDays,
      vrFaltas: payroll.absenceDeduction || undefined,
      dsrDescontado: options?.dsrAbsenceDays,
      vrDsr: payroll.dsrDeduction || undefined,
      outrosProventos: payroll.otherEarnings || undefined,
      outrosDescontos: payroll.otherDeductions || undefined,
      totalVencimentos: payroll.totalEarnings,
      totalDescontos: payroll.totalDeductions,
      totalLiquido: payroll.netSalary,
    },
    infoDescontos: {
      inssEmpregado: payroll.inssEmployee,
      irrfEmpregado: payroll.irrfEmployee,
    },
    infoEmpregador: {
      inssPatronal: payroll.inssEmployer,
      gilrat: payroll.gilrat,
      fgtsmensal: payroll.fgtsMonthly,
      fgtsAntecipacao: payroll.fgtsAnticipation,
      totalDae: payroll.daeTotal,
    },
  }

  return {
    event: {
      employerId,
      employeeId,
      eventType: 'S-1200',
      eventData: data,
      status: 'draft',
      referenceMonth: month,
      referenceYear: year,
    },
    payroll,
  }
}

/**
 * Build S-1210 event (payment)
 */
export function buildS1210(
  employerId: string,
  employeeId: string,
  data: S1210Data,
  month: number,
  year: number
): EsocialEvent {
  requireField(data.cpfTrabalhador, 'cpfTrabalhador')
  requireField(data.dtPagamento, 'dtPagamento')
  requireField(data.vrLiquido, 'vrLiquido')

  return {
    employerId,
    employeeId,
    eventType: 'S-1210',
    eventData: data,
    status: 'draft',
    referenceMonth: month,
    referenceYear: year,
  }
}

/**
 * Build S-2230 event (leave of absence)
 */
export function buildS2230(
  employerId: string,
  employeeId: string,
  data: S2230Data,
  month: number,
  year: number
): EsocialEvent {
  requireField(data.cpfTrabalhador, 'cpfTrabalhador')
  requireField(data.dtIniAfast, 'dtIniAfast')
  requireField(data.codMotAfast, 'codMotAfast')

  return {
    employerId,
    employeeId,
    eventType: 'S-2230',
    eventData: data,
    status: 'draft',
    referenceMonth: month,
    referenceYear: year,
  }
}

/**
 * Build S-2250 event (prior notice)
 */
export function buildS2250(
  employerId: string,
  employeeId: string,
  data: S2250Data,
  month: number,
  year: number
): EsocialEvent {
  requireField(data.cpfTrabalhador, 'cpfTrabalhador')
  requireField(data.dtAvPrv, 'dtAvPrv')
  requireField(data.dtPrevDeslig, 'dtPrevDeslig')

  return {
    employerId,
    employeeId,
    eventType: 'S-2250',
    eventData: data,
    status: 'draft',
    referenceMonth: month,
    referenceYear: year,
  }
}

/**
 * Build S-2299 event (termination)
 */
export function buildS2299(
  employerId: string,
  employeeId: string,
  data: S2299Data,
  month: number,
  year: number
): EsocialEvent {
  requireField(data.cpfTrabalhador, 'cpfTrabalhador')
  requireField(data.dtDeslig, 'dtDeslig')
  requireField(data.mtvDeslig, 'mtvDeslig')

  return {
    employerId,
    employeeId,
    eventType: 'S-2299',
    eventData: data,
    status: 'draft',
    referenceMonth: month,
    referenceYear: year,
  }
}

/**
 * Build S-2300 event (worker without employment bond)
 */
export function buildS2300(
  employerId: string,
  data: S2300Data,
  month: number,
  year: number
): EsocialEvent {
  requireField(data.cpfTrabalhador, 'cpfTrabalhador')
  requireField(data.dtInicio, 'dtInicio')

  return {
    employerId,
    eventType: 'S-2300',
    eventData: data,
    status: 'draft',
    referenceMonth: month,
    referenceYear: year,
  }
}

/**
 * Generate mock eSocial XML representation for an event.
 * In production, this would generate the actual XML per eSocial XSD schemas.
 */
export function generateEventXML(event: EsocialEvent): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>'
  const eventTag = event.eventType.replace('-', '')

  return `${xmlHeader}
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/${eventTag}/v1_2_0">
  <evtInfo>
    <ideEvento>
      <tpAmb>2</tpAmb><!-- 2 = producao restrita (simulacao) -->
      <procEmi>1</procEmi>
      <verProc>lardia-1.0.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>2</tpInsc><!-- CPF -->
      <nrInsc>${event.employerId}</nrInsc>
    </ideEmpregador>
  </evtInfo>
  <eventData>
    ${JSON.stringify(event.eventData, null, 2).split('\n').map(l => `    ${l}`).join('\n')}
  </eventData>
</eSocial>`
}
