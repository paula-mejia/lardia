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

  it('returns 0 for employee hired after reference year', () => {
    expect(calculateMonthsWorked(new Date('2027-06-01'), 2026)).toBe(0)
  })

  it('returns correct months for mid-year hire on the 15th', () => {
    // Jun 15 = counts Jun + Jul-Dec = 1 + 6 = 7
    expect(calculateMonthsWorked(new Date('2026-06-15'), 2026)).toBe(7)
  })

  it('returns correct months for mid-year hire on the 16th', () => {
    // Jun 16 = does not count Jun, Jul-Dec = 6
    expect(calculateMonthsWorked(new Date('2026-06-16'), 2026)).toBe(6)
  })
})

describe('calculateThirteenth', () => {
  it('calculates full 13th for 12 months at minimum wage', () => {
    const result = calculateThirteenth({
      monthlySalary: 1621.00,
      monthsWorked: 12,
      taxTable: TAX_TABLE_2026,
    })

    expect(result.proportionalBase).toBe(1621.00)
    expect(result.totalBase).toBe(1621.00)
    expect(result.firstInstallment).toBe(810.50)
    expect(result.secondInstallmentGross).toBe(810.50)

    // INSS on full base (1621) = 7.5% of 1621 = 121.57
    expect(result.inssEmployee).toBe(121.57)
    expect(result.irrfEmployee).toBe(0)

    // 2nd installment net: 810.50 - 121.57 = 688.93
    expect(result.secondInstallmentNet).toBe(688.93)
    expect(result.totalEmployeePay).toBe(1499.43)
  })

  it('calculates proportional 13th for 6 months', () => {
    const result = calculateThirteenth({
      monthlySalary: 1621.00,
      monthsWorked: 6,
      taxTable: TAX_TABLE_2026,
    })

    expect(result.proportionalBase).toBe(810.50)
    expect(result.firstInstallment).toBe(405.25)
    expect(result.secondInstallmentGross).toBe(405.25)
  })

  it('calculates FGTS per installment at 8%', () => {
    const result = calculateThirteenth({
      monthlySalary: 3000.00,
      monthsWorked: 12,
      taxTable: TAX_TABLE_2026,
    })

    // Each installment = 1500
    expect(result.fgtsFirstInstallment).toBe(120.00) // 8% of 1500
    expect(result.fgtsSecondInstallment).toBe(120.00) // 8% of 1500
    expect(result.fgtsMonthly).toBe(240.00) // total
  })

  it('calculates FGTS per installment for proportional 13th', () => {
    const result = calculateThirteenth({
      monthlySalary: 2400.00,
      monthsWorked: 6,
      taxTable: TAX_TABLE_2026,
    })

    // Proportional base = 2400/12*6 = 1200
    // First installment = 600, second = 600
    expect(result.fgtsFirstInstallment).toBe(48.00) // 8% of 600
    expect(result.fgtsSecondInstallment).toBe(48.00)
    expect(result.fgtsMonthly).toBe(96.00)
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

  it('INSS and IRRF calculated on full 13th base, not just 2nd installment', () => {
    const result = calculateThirteenth({
      monthlySalary: 5000.00,
      monthsWorked: 12,
      taxTable: TAX_TABLE_2026,
    })

    // INSS should be calculated on full 5000, not 2500
    // Progressive brackets applied to full base
    // Must be greater than what 2500 alone would produce
    const inssOn2500 = 1621 * 0.075 + (2500 - 1621) * 0.09
    expect(result.inssEmployee).toBeGreaterThan(Math.round(inssOn2500 * 100) / 100)
    // And match the known value from the engine
    expect(result.inssEmployee).toBe(501.51)
  })

  it('includes employer costs', () => {
    const result = calculateThirteenth({
      monthlySalary: 2000.00,
      monthsWorked: 12,
      taxTable: TAX_TABLE_2026,
    })

    expect(result.inssEmployer).toBe(160.00) // 8% of 2000
    expect(result.gilrat).toBe(16.00) // 0.8% of 2000
    expect(result.fgtsAnticipation).toBe(64.00) // 3.2% of 2000
  })
})
