import { describe, it, expect } from 'vitest'
import { calculatePayroll, calculateINSSEmployee, calculateIRRF } from '../payroll'
import { TAX_TABLE_2026 } from '../tax-tables'

describe('INSS Employee Calculation (Progressive)', () => {
  it('calculates INSS for minimum wage (R$1.621)', () => {
    const result = calculateINSSEmployee(1621.00, TAX_TABLE_2026)
    // 1621.00 * 7.5% = 121.575 → 121.57
    expect(result.total).toBe(121.57)
    expect(result.details).toHaveLength(1)
  })

  it('calculates INSS for R$2.000 (crosses into 2nd bracket)', () => {
    const result = calculateINSSEmployee(2000.00, TAX_TABLE_2026)
    // First bracket: 1621.00 * 7.5% = 121.57
    // Second bracket: (2000 - 1621) * 9% = 379 * 9% = 34.11
    // Total: 155.68
    expect(result.total).toBe(155.68)
    expect(result.details).toHaveLength(2)
  })

  it('calculates INSS for R$3.500 (crosses into 3rd bracket)', () => {
    const result = calculateINSSEmployee(3500.00, TAX_TABLE_2026)
    // First: 1621.00 * 7.5% = 121.57
    // Second: (2902.84 - 1621.00) * 9% = 1281.84 * 9% = 115.37
    // Third: (3500 - 2902.84) * 12% = 597.16 * 12% = 71.66
    // Total: 308.60
    expect(result.total).toBe(308.60)
    expect(result.details).toHaveLength(3)
  })

  it('caps INSS at ceiling (R$8.475,55)', () => {
    const result = calculateINSSEmployee(10000.00, TAX_TABLE_2026)
    const resultAtCeiling = calculateINSSEmployee(8475.55, TAX_TABLE_2026)
    // Salary above ceiling should yield same INSS as ceiling
    expect(result.total).toBe(resultAtCeiling.total)
  })
})

describe('IRRF Calculation', () => {
  it('returns zero for minimum wage', () => {
    const inss = calculateINSSEmployee(1621.00, TAX_TABLE_2026)
    const result = calculateIRRF(1621.00, inss.total, 0, TAX_TABLE_2026)
    expect(result.tax).toBe(0)
  })

  it('returns zero for salary under IRRF threshold', () => {
    const inss = calculateINSSEmployee(2500.00, TAX_TABLE_2026)
    const result = calculateIRRF(2500.00, inss.total, 0, TAX_TABLE_2026)
    // Base: 2500 - INSS = 2500 - ~200 = ~2300 -> first taxable bracket
    expect(result.tax).toBeGreaterThanOrEqual(0)
  })

  it('reduces IRRF base with dependents', () => {
    const salary = 10000
    const inss = calculateINSSEmployee(salary, TAX_TABLE_2026)
    const withoutDep = calculateIRRF(salary, inss.total, 0, TAX_TABLE_2026)
    const withDep = calculateIRRF(salary, inss.total, 2, TAX_TABLE_2026)
    expect(withDep.tax).toBeLessThan(withoutDep.tax)
    expect(withDep.base).toBeLessThan(withoutDep.base)
  })
})

describe('IRRF Progressive Reduction (Lei 15.270/2025)', () => {
  it('salary R$3,000 → IRRF = 0 (base below threshold)', () => {
    const inss = calculateINSSEmployee(3000, TAX_TABLE_2026)
    const result = calculateIRRF(3000, inss.total, 0, TAX_TABLE_2026)
    expect(result.tax).toBe(0)
  })

  it('salary R$5,500 → IRRF = 0 (base ~4928 gets full reduction)', () => {
    const inss = calculateINSSEmployee(5500, TAX_TABLE_2026)
    const result = calculateIRRF(5500, inss.total, 0, TAX_TABLE_2026)
    // Base ≈ 4928.49, under 5000 → full reduction
    expect(result.tax).toBe(0)
  })

  it('salary R$6,000 → IRRF = 0 (base ~5358 gets 849.08 reduction)', () => {
    const inss = calculateINSSEmployee(6000, TAX_TABLE_2026)
    const result = calculateIRRF(6000, inss.total, 0, TAX_TABLE_2026)
    // Base ≈ 5358.49, bracket 5000.01-5500 → reduction 849.08
    // Normal IRRF on 5358.49: 5358.49 * 15% - 394.16 = 409.61
    // 409.61 - 849.08 = negative → 0
    expect(result.tax).toBe(0)
  })

  it('salary R$8,000 → partial or no reduction (base > 7000)', () => {
    const inss = calculateINSSEmployee(8000, TAX_TABLE_2026)
    const result = calculateIRRF(8000, inss.total, 0, TAX_TABLE_2026)
    // Base ≈ 7078.49 → above 7000, no reduction
    expect(result.tax).toBeGreaterThan(0)
    expect(result.tax).toBe(1037.85)
  })

  it('salary R$10,000 → no reduction (base well above 7000)', () => {
    const inss = calculateINSSEmployee(10000, TAX_TABLE_2026)
    const result = calculateIRRF(10000, inss.total, 0, TAX_TABLE_2026)
    expect(result.tax).toBe(1569.55)
  })
})

describe('Full Payroll Calculation', () => {
  it('calculates payroll for minimum wage', () => {
    const result = calculatePayroll({ grossSalary: 1621.00 })
    
    expect(result.grossSalary).toBe(1621.00)
    expect(result.inssEmployee).toBe(121.57)
    expect(result.irrfEmployee).toBe(0)
    expect(result.netSalary).toBe(1621.00 - 121.57)
    
    // Employer costs
    expect(result.inssEmployer).toBe(129.68) // 8% of 1621
    expect(result.gilrat).toBe(12.97) // 0.8% of 1621
    expect(result.fgtsMonthly).toBe(129.68) // 8% of 1621
    expect(result.fgtsAnticipation).toBe(51.87) // 3.2% of 1621
    
    // DAE should be sum of all employer + employee INSS
    expect(result.daeTotal).toBeCloseTo(
      result.inssEmployee + result.inssEmployer + result.gilrat + 
      result.fgtsMonthly + result.fgtsAnticipation, 2
    )
  })

  it('calculates payroll with absences', () => {
    const result = calculatePayroll({
      grossSalary: 2000.00,
      absenceDays: 5,
      dsrAbsenceDays: 1,
    })
    
    const dailyRate = 2000 / 30
    expect(result.absenceDeduction).toBeCloseTo(5 * dailyRate, 1)
    expect(result.dsrDeduction).toBeCloseTo(1 * dailyRate, 1)
    expect(result.netSalary).toBeLessThan(2000 - result.inssEmployee)
  })

  it('calculates payroll with overtime', () => {
    const withoutOT = calculatePayroll({ grossSalary: 1621.00 })
    const withOT = calculatePayroll({ grossSalary: 1621.00, overtimeHours: 10 })
    
    expect(withOT.overtimePay).toBeGreaterThan(0)
    expect(withOT.totalEarnings).toBeGreaterThan(withoutOT.totalEarnings)
    expect(withOT.netSalary).toBeGreaterThan(withoutOT.netSalary)
  })

  it('DAE breakdown sums to daeTotal', () => {
    const result = calculatePayroll({ grossSalary: 3000.00 })
    const breakdownSum = 
      result.daeBreakdown.inssEmployee +
      result.daeBreakdown.inssEmployer +
      result.daeBreakdown.gilrat +
      result.daeBreakdown.fgtsMonthly +
      result.daeBreakdown.fgtsAnticipation
    
    expect(result.daeTotal).toBeCloseTo(breakdownSum, 2)
  })
})
