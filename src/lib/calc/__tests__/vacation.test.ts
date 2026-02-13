import { describe, it, expect } from 'vitest'
import {
  calculateVacation,
  getVacationDaysByAbsences,
  getPaymentDeadline,
} from '../vacation'
import { TAX_TABLE_2026 } from '../tax-tables'

const table = TAX_TABLE_2026

describe('getVacationDaysByAbsences', () => {
  it('returns 30 days for 0-5 absences', () => {
    expect(getVacationDaysByAbsences(0)).toBe(30)
    expect(getVacationDaysByAbsences(5)).toBe(30)
  })

  it('returns 24 days for 6-14 absences', () => {
    expect(getVacationDaysByAbsences(6)).toBe(24)
    expect(getVacationDaysByAbsences(14)).toBe(24)
  })

  it('returns 18 days for 15-23 absences', () => {
    expect(getVacationDaysByAbsences(15)).toBe(18)
    expect(getVacationDaysByAbsences(23)).toBe(18)
  })

  it('returns 12 days for 24-32 absences', () => {
    expect(getVacationDaysByAbsences(24)).toBe(12)
    expect(getVacationDaysByAbsences(32)).toBe(12)
  })

  it('returns 0 days for 33+ absences', () => {
    expect(getVacationDaysByAbsences(33)).toBe(0)
    expect(getVacationDaysByAbsences(50)).toBe(0)
  })
})

describe('getPaymentDeadline', () => {
  it('returns 2 days before vacation start', () => {
    expect(getPaymentDeadline('2026-03-10')).toBe('2026-03-08')
    expect(getPaymentDeadline('2026-01-03')).toBe('2026-01-01')
  })
})

describe('calculateVacation', () => {
  describe('full vacation, no absences, no abono', () => {
    it('calculates correctly for minimum wage', () => {
      const result = calculateVacation({
        monthlySalary: 1518,
        absences: 0,
        daysSold: 0,
        taxTable: table,
      })

      expect(result.totalVacationDays).toBe(30)
      expect(result.daysEnjoyed).toBe(30)
      expect(result.daysSold).toBe(0)
      expect(result.vacationPay).toBe(1518)
      expect(result.tercoConstitucional).toBe(506)
      expect(result.abonoPay).toBe(0)
      expect(result.abonoTerco).toBe(0)
      expect(result.totalGross).toBe(2024)
      expect(result.isProportional).toBe(false)
      expect(result.proportionalMonths).toBe(12)
    })
  })

  describe('abono pecuniario (selling days)', () => {
    it('calculates correctly when selling 10 days', () => {
      const result = calculateVacation({
        monthlySalary: 3000,
        absences: 0,
        daysSold: 10,
        taxTable: table,
      })

      const dailyRate = 100 // 3000/30
      expect(result.totalVacationDays).toBe(30)
      expect(result.daysEnjoyed).toBe(20)
      expect(result.daysSold).toBe(10)
      expect(result.vacationPay).toBe(2000) // 20 * 100
      expect(result.tercoConstitucional).toBeCloseTo(666.67, 1)
      expect(result.abonoPay).toBe(1000) // 10 * 100
      expect(result.abonoTerco).toBeCloseTo(333.33, 1)
      // INSS/IRRF only on vacationPay + terco
      expect(result.inssBase).toBeCloseTo(2666.67, 1)
    })

    it('limits sold days to max 10', () => {
      const result = calculateVacation({
        monthlySalary: 3000,
        absences: 0,
        daysSold: 15,
        taxTable: table,
      })
      expect(result.daysSold).toBe(10)
    })
  })

  describe('proportional vacation', () => {
    it('calculates 6/12 proportional correctly', () => {
      const result = calculateVacation({
        monthlySalary: 1518,
        absences: 0,
        daysSold: 0,
        proportionalMonths: 6,
        taxTable: table,
      })

      expect(result.totalVacationDays).toBe(15) // 30/12*6
      expect(result.isProportional).toBe(true)
      expect(result.proportionalMonths).toBe(6)
      expect(result.vacationPay).toBe(759) // 15 * 50.6
    })
  })

  describe('absence reductions', () => {
    it('reduces to 24 days with 10 absences', () => {
      const result = calculateVacation({
        monthlySalary: 1518,
        absences: 10,
        daysSold: 0,
        taxTable: table,
      })
      expect(result.totalVacationDays).toBe(24)
    })

    it('reduces to 0 days with 33+ absences', () => {
      const result = calculateVacation({
        monthlySalary: 1518,
        absences: 35,
        daysSold: 0,
        taxTable: table,
      })
      expect(result.totalVacationDays).toBe(0)
      expect(result.vacationPay).toBe(0)
      expect(result.netPayment).toBe(0)
    })
  })

  describe('INSS and IRRF deductions', () => {
    it('deducts INSS progressively on vacation + terco', () => {
      const result = calculateVacation({
        monthlySalary: 3000,
        absences: 0,
        daysSold: 0,
        taxTable: table,
      })

      // inssBase = 3000 + 1000 = 4000
      expect(result.inssBase).toBe(4000)
      expect(result.inssEmployee).toBeGreaterThan(0)
      expect(result.inssEmployeeDetails.length).toBeGreaterThan(1)
    })

    it('deducts IRRF when base is high enough', () => {
      const result = calculateVacation({
        monthlySalary: 5000,
        absences: 0,
        daysSold: 0,
        dependents: 0,
        taxTable: table,
      })

      // vacationPay=5000, terco=1666.67, inssBase=6666.67
      expect(result.irrfEmployee).toBeGreaterThan(0)
    })

    it('applies no IRRF for low salary', () => {
      const result = calculateVacation({
        monthlySalary: 1518,
        absences: 0,
        daysSold: 0,
        taxTable: table,
      })

      expect(result.irrfEmployee).toBe(0)
    })
  })

  describe('FGTS', () => {
    it('calculates 8% FGTS on vacation + terco', () => {
      const result = calculateVacation({
        monthlySalary: 3000,
        absences: 0,
        daysSold: 0,
        taxTable: table,
      })

      expect(result.fgtsDue).toBe(result.inssBase * 0.08)
    })
  })

  describe('payment deadline', () => {
    it('shows deadline when vacation start date provided', () => {
      const result = calculateVacation({
        monthlySalary: 1518,
        absences: 0,
        daysSold: 0,
        vacationStartDate: '2026-07-01',
        taxTable: table,
      })

      expect(result.paymentDeadline).toBe('2026-06-29')
    })

    it('returns null when no start date', () => {
      const result = calculateVacation({
        monthlySalary: 1518,
        absences: 0,
        daysSold: 0,
        taxTable: table,
      })

      expect(result.paymentDeadline).toBeNull()
    })
  })
})
