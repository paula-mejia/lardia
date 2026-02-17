import { describe, it, expect } from 'vitest'
import { calculateThirteenth, calculateMonthsWorked } from '../thirteenth'
import { TAX_TABLE_2026 } from '../tax-tables'

describe('calculateMonthsWorked', () => {
  it('returns 12 for employee hired previous year', () => {
    expect(calculateMonthsWorked(new Date('2025-03-15'), 2026)).toBe(12)
  })

  it('returns 12 for employee hired Jan 1', () => {
    expect(calculateMonthsWorked(new Date('2026-01-01'), 2026)).toBe(12)
  })

  it('returns 11 for employee hired Jan 16 (missed first month)', () => {
    expect(calculateMonthsWorked(new Date('2026-01-16'), 2026)).toBe(11)
  })

  it('returns 11 for employee hired Feb 1', () => {
    expect(calculateMonthsWorked(new Date('2026-02-01'), 2026)).toBe(11)
  })

  it('returns 6 for employee hired Jul 1', () => {
    expect(calculateMonthsWorked(new Date('2026-07-01'), 2026)).toBe(6)
  })

  it('returns 1 for employee hired Dec 1', () => {
    expect(calculateMonthsWorked(new Date('2026-12-01'), 2026)).toBe(1)
  })

  it('returns 0 for employee hired Dec 20', () => {
    expect(calculateMonthsWorked(new Date('2026-12-20'), 2026)).toBe(0)
  })
})

describe('calculateThirteenth', () => {
  it('calculates full 13th for 12 months at minimum wage', () => {
    const result = calculateThirteenth({
      monthlySalary: 1621.00,
      monthsWorked: 12,
      taxTable: TAX_TABLE_2026,
    })

    // Full year = full salary as base
    expect(result.proportionalBase).toBe(1621.00)
    expect(result.totalBase).toBe(1621.00)

    // 1st installment: 50% = 810.50
    expect(result.firstInstallment).toBe(810.50)

    // 2nd installment gross: 810.50
    expect(result.secondInstallmentGross).toBe(810.50)

    // INSS on full base (1621) = 121.57
    expect(result.inssEmployee).toBe(121.57)

    // No IRRF at minimum wage
    expect(result.irrfEmployee).toBe(0)

    // 2nd installment net: 810.50 - 121.57 = 688.93
    expect(result.secondInstallmentNet).toBe(688.93)

    // Total employee receives: 810.50 + 688.93 = 1499.43
    expect(result.totalEmployeePay).toBe(1499.43)
  })

  it('calculates proportional 13th for 6 months', () => {
    const result = calculateThirteenth({
      monthlySalary: 1621.00,
      monthsWorked: 6,
      taxTable: TAX_TABLE_2026,
    })

    // 6/12 of salary
    expect(result.proportionalBase).toBe(810.50)
    expect(result.firstInstallment).toBe(405.25)
  })

  it('calculates 13th with higher salary (IRRF applicable)', () => {
    const result = calculateThirteenth({
      monthlySalary: 5000.00,
      monthsWorked: 12,
      taxTable: TAX_TABLE_2026,
    })

    expect(result.totalBase).toBe(5000.00)
    expect(result.firstInstallment).toBe(2500.00)
    expect(result.inssEmployee).toBeGreaterThan(0)
    expect(result.irrfEmployee).toBeGreaterThan(0)
    expect(result.secondInstallmentNet).toBeLessThan(2500.00)
  })

  it('reduces IRRF with dependents', () => {
    const withoutDep = calculateThirteenth({
      monthlySalary: 5000.00,
      monthsWorked: 12,
    })
    const withDep = calculateThirteenth({
      monthlySalary: 5000.00,
      monthsWorked: 12,
      dependents: 2,
    })

    expect(withDep.irrfEmployee).toBeLessThan(withoutDep.irrfEmployee)
    expect(withDep.secondInstallmentNet).toBeGreaterThan(withoutDep.secondInstallmentNet)
  })

  it('first installment has zero deductions', () => {
    const result = calculateThirteenth({
      monthlySalary: 3000.00,
      monthsWorked: 12,
    })

    // First installment is exactly 50% of base, no deductions
    expect(result.firstInstallment).toBe(1500.00)
  })
})
