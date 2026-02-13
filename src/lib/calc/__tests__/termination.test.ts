import { describe, test, expect } from 'vitest'
import {
  calculateTermination,
  calculateSaldoDays,
  calculateAvisoPrevioDays,
  calculateProportionalThirteenthMonths,
  calculateVacationProportionalMonths,
} from '../termination'
import type { TerminationInput } from '../termination'

describe('termination helpers', () => {
  test('calculateSaldoDays returns day of month', () => {
    expect(calculateSaldoDays('2026-01-15')).toBe(15)
    expect(calculateSaldoDays('2026-03-01')).toBe(1)
    expect(calculateSaldoDays('2026-02-28')).toBe(28)
  })

  test('calculateAvisoPrevioDays: 30 base + 3/year, max 90', () => {
    // Less than 1 year
    expect(calculateAvisoPrevioDays('2025-06-01', '2026-01-15')).toBe(30)
    // 2 complete years
    expect(calculateAvisoPrevioDays('2024-01-01', '2026-02-01')).toBe(36)
    // 20 years -> would be 90, capped
    expect(calculateAvisoPrevioDays('2006-01-01', '2026-02-01')).toBe(90)
    // Exactly 1 year
    expect(calculateAvisoPrevioDays('2025-01-15', '2026-01-15')).toBe(33)
  })

  test('calculateProportionalThirteenthMonths', () => {
    // Started Jan 10, terminated Jun 20 -> 6 months (Jan-Jun, Jun has 20 days >= 15)
    expect(calculateProportionalThirteenthMonths('2025-01-10', '2026-06-20')).toBe(6)
    // Started in previous year, terminated Feb 10 -> Jan full + Feb (10 < 15) = 1
    expect(calculateProportionalThirteenthMonths('2025-01-01', '2026-02-10')).toBe(1)
  })

  test('calculateVacationProportionalMonths', () => {
    // Admitted 2025-01-01, terminated 2026-04-20
    // Last anniversary: 2026-01-01, months Jan-Apr: Jan, Feb, Mar full + Apr partial (20 >= 15) = 4
    expect(calculateVacationProportionalMonths('2025-01-01', '2026-04-20')).toBe(4)
  })
})

describe('calculateTermination - sem justa causa', () => {
  const base: TerminationInput = {
    terminationType: 'sem_justa_causa',
    lastSalary: 3000,
    admissionDate: '2024-01-15',
    terminationDate: '2026-02-15',
    dependents: 0,
    fgtsBalance: 5000,
    accruedVacationPeriods: 1,
    workedNoticePeriod: false,
  }

  test('calculates all components', () => {
    const r = calculateTermination(base)

    expect(r.terminationType).toBe('sem_justa_causa')
    expect(r.saldoSalarioDays).toBe(15)
    expect(r.saldoSalario).toBe(1500) // 3000/30 * 15

    // Aviso previo: 2 years worked -> 30 + 6 = 36 days
    expect(r.avisoPrevioDays).toBe(36)
    expect(r.avisoPrevioIndemnizado).toBe(true)
    expect(r.avisoPrevio).toBe(3600) // 100/day * 36

    // 13th proportional should be > 0
    expect(r.thirteenthProportional).toBeGreaterThan(0)

    // Vacation proportional should be > 0
    expect(r.vacationProportional).toBeGreaterThan(0)
    expect(r.vacationProportionalOneThird).toBe(
      Math.round(r.vacationProportional / 3 * 100) / 100
    )

    // Accrued vacation: 1 period
    expect(r.accruedVacation).toBe(3000)
    expect(r.accruedVacationOneThird).toBe(1000)

    // FGTS penalty
    expect(r.fgtsPenalty).toBeGreaterThan(0)
    const expectedFgtsOnTerm = Math.round((r.saldoSalario + r.avisoPrevio + r.thirteenthProportional) * 0.08 * 100) / 100
    expect(r.fgtsOnTermination).toBe(expectedFgtsOnTerm)

    // 40% on total balance
    const totalBalance = Math.round((5000 + expectedFgtsOnTerm) * 100) / 100
    expect(r.fgtsPenalty).toBe(Math.round(totalBalance * 0.40 * 100) / 100)

    // INSS and IRRF should be calculated
    expect(r.inssEmployee).toBeGreaterThan(0)

    // Net amount
    expect(r.netAmount).toBe(
      Math.round((r.totalEarnings - r.totalDeductions) * 100) / 100
    )
    expect(r.totalToReceive).toBe(
      Math.round((r.netAmount + r.fgtsPenalty) * 100) / 100
    )
  })

  test('worked notice period gives no aviso previo payment', () => {
    const r = calculateTermination({ ...base, workedNoticePeriod: true })
    expect(r.avisoPrevio).toBe(0)
    expect(r.avisoPrevioIndemnizado).toBe(false)
  })
})

describe('calculateTermination - pedido de demissao', () => {
  const base: TerminationInput = {
    terminationType: 'pedido_demissao',
    lastSalary: 2500,
    admissionDate: '2024-06-01',
    terminationDate: '2026-02-10',
    dependents: 0,
    fgtsBalance: 3000,
    accruedVacationPeriods: 0,
    employeeGaveNotice: true,
  }

  test('no aviso previo, no FGTS penalty', () => {
    const r = calculateTermination(base)

    expect(r.terminationType).toBe('pedido_demissao')
    expect(r.avisoPrevio).toBe(0)
    expect(r.fgtsPenalty).toBe(0)
    expect(r.avisoPrevioDeduction).toBe(0)

    // Has 13th proportional and vacation proportional
    expect(r.thirteenthProportional).toBeGreaterThan(0)
    expect(r.vacationProportional).toBeGreaterThanOrEqual(0)

    // No accrued vacation
    expect(r.accruedVacation).toBe(0)
  })

  test('deducts aviso previo when employee did not give notice', () => {
    const r = calculateTermination({ ...base, employeeGaveNotice: false })
    expect(r.avisoPrevioDeduction).toBeGreaterThan(0)
    // 30 days * daily rate
    // 30 days deduction at daily rate
    expect(r.avisoPrevioDeduction).toBeCloseTo(2500, 0)
  })
})

describe('calculateTermination - justa causa', () => {
  const base: TerminationInput = {
    terminationType: 'justa_causa',
    lastSalary: 2000,
    admissionDate: '2023-03-01',
    terminationDate: '2026-02-20',
    dependents: 0,
    fgtsBalance: 4000,
    accruedVacationPeriods: 1,
  }

  test('only saldo salario + accrued vacation', () => {
    const r = calculateTermination(base)

    expect(r.terminationType).toBe('justa_causa')

    // Saldo de salario
    expect(r.saldoSalarioDays).toBe(20)
    expect(r.saldoSalario).toBeCloseTo(1333.33, 0)

    // No aviso previo
    expect(r.avisoPrevio).toBe(0)
    expect(r.avisoPrevioDays).toBe(0)

    // No 13th proportional
    expect(r.thirteenthProportional).toBe(0)

    // No vacation proportional
    expect(r.vacationProportional).toBe(0)
    expect(r.vacationProportionalOneThird).toBe(0)

    // Has accrued vacation + 1/3
    expect(r.accruedVacation).toBe(2000)
    expect(r.accruedVacationOneThird).toBe(Math.round(2000 / 3 * 100) / 100)

    // No FGTS penalty
    expect(r.fgtsPenalty).toBe(0)
  })
})
