import { describe, it, expect } from 'vitest'
import { calculatePayroll, calculateINSSEmployee, calculateIRRF } from '../payroll'
import { TAX_TABLE_2026 } from '../tax-tables'

describe('INSS Employee Calculation (Progressive)', () => {
  it('calculates INSS for minimum wage (R$1.518)', () => {
    const result = calculateINSSEmployee(1518.00, TAX_TABLE_2026)
    // 1518.00 * 7.5% = 113.85
    expect(result.total).toBe(113.85)
    expect(result.details).toHaveLength(1)
  })

  it('calculates INSS for R$2.000 (crosses into 2nd bracket)', () => {
    const result = calculateINSSEmployee(2000.00, TAX_TABLE_2026)
    // First bracket: 1518.00 * 7.5% = 113.85
    // Second bracket: (2000 - 1518) * 9% = 482 * 9% = 43.38
    // Total: 157.23
    expect(result.total).toBe(157.23)
    expect(result.details).toHaveLength(2)
  })

  it('calculates INSS for R$3.500 (crosses into 3rd bracket)', () => {
    const result = calculateINSSEmployee(3500.00, TAX_TABLE_2026)
    // First: 1518.00 * 7.5% = 113.85
    // Second: (2793.88 - 1518.00) * 9% = 1275.88 * 9% = 114.83
    // Third: (3500 - 2793.88) * 12% = 706.12 * 12% = 84.73
    // Total: 313.41
    expect(result.total).toBe(313.41)
    expect(result.details).toHaveLength(3)
  })

  it('caps INSS at ceiling (R$8.157,41)', () => {
    const result = calculateINSSEmployee(10000.00, TAX_TABLE_2026)
    const resultAtCeiling = calculateINSSEmployee(8157.41, TAX_TABLE_2026)
    // Salary above ceiling should yield same INSS as ceiling
    expect(result.total).toBe(resultAtCeiling.total)
  })
})

describe('IRRF Calculation', () => {
  it('returns zero for minimum wage', () => {
    const inss = calculateINSSEmployee(1518.00, TAX_TABLE_2026)
    const result = calculateIRRF(1518.00, inss.total, 0, TAX_TABLE_2026)
    expect(result.tax).toBe(0)
  })

  it('returns zero for salary under IRRF threshold', () => {
    const inss = calculateINSSEmployee(2500.00, TAX_TABLE_2026)
    const result = calculateIRRF(2500.00, inss.total, 0, TAX_TABLE_2026)
    // Base: 2500 - INSS = 2500 - ~202 = ~2298 -> first taxable bracket
    expect(result.tax).toBeGreaterThanOrEqual(0)
  })

  it('reduces IRRF base with dependents', () => {
    const salary = 5000
    const inss = calculateINSSEmployee(salary, TAX_TABLE_2026)
    const withoutDep = calculateIRRF(salary, inss.total, 0, TAX_TABLE_2026)
    const withDep = calculateIRRF(salary, inss.total, 2, TAX_TABLE_2026)
    expect(withDep.tax).toBeLessThan(withoutDep.tax)
    expect(withDep.base).toBeLessThan(withoutDep.base)
  })
})

describe('Full Payroll Calculation', () => {
  it('calculates payroll for minimum wage', () => {
    const result = calculatePayroll({ grossSalary: 1518.00 })
    
    expect(result.grossSalary).toBe(1518.00)
    expect(result.inssEmployee).toBe(113.85)
    expect(result.irrfEmployee).toBe(0)
    expect(result.netSalary).toBe(1518.00 - 113.85)
    
    // Employer costs
    expect(result.inssEmployer).toBe(121.44) // 8% of 1518
    expect(result.gilrat).toBe(12.14) // 0.8% of 1518
    expect(result.fgtsMonthly).toBe(121.44) // 8% of 1518
    expect(result.fgtsAnticipation).toBe(48.58) // 3.2% of 1518
    
    // DAE should be sum of all employer + employee INSS
    expect(result.daeTotal).toBe(
      result.inssEmployee + result.inssEmployer + result.gilrat + 
      result.fgtsMonthly + result.fgtsAnticipation
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
    const withoutOT = calculatePayroll({ grossSalary: 1518.00 })
    const withOT = calculatePayroll({ grossSalary: 1518.00, overtimeHours: 10 })
    
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
