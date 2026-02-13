/**
 * Tax tables for Brazilian domestic employer calculations.
 * Updated annually when government announces new rates.
 * 
 * Source: Receita Federal / Previdência Social
 * Current: 2026 values (effective January 2026)
 */

export interface INSSBracket {
  min: number
  max: number
  rate: number // percentage (e.g., 7.5 = 7.5%)
}

export interface IRRFBracket {
  min: number
  max: number
  rate: number // percentage
  deduction: number // R$ deduction
}

export interface TaxTable {
  year: number
  effectiveDate: string
  minimumWage: number
  inss: {
    employee: INSSBracket[]
    employer: {
      cpPatronal: number // 8% INSS patronal
      gilrat: number // 0.8% accident insurance (GILRAT/RAT)
    }
  }
  fgts: {
    monthly: number // 8%
    anticipation: number // 3.2% (antecipação multa rescisória)
  }
  irrf: {
    brackets: IRRFBracket[]
    dependentDeduction: number // per dependent
  }
  dae: Record<string, never>
}

/**
 * 2026 Tax Tables
 * Minimum wage: R$1.518,00 (confirmed for 2026)
 * INSS brackets updated per Portaria Interministerial
 */
export const TAX_TABLE_2026: TaxTable = {
  year: 2026,
  effectiveDate: '2026-01-01',
  minimumWage: 1518.00,
  inss: {
    employee: [
      { min: 0, max: 1518.00, rate: 7.5 },
      { min: 1518.01, max: 2793.88, rate: 9 },
      { min: 2793.89, max: 4190.83, rate: 12 },
      { min: 4190.84, max: 8157.41, rate: 14 },
    ],
    employer: {
      cpPatronal: 8,
      gilrat: 0.8,
    },
  },
  fgts: {
    monthly: 8,
    anticipation: 3.2,
  },
  irrf: {
    brackets: [
      { min: 0, max: 2259.20, rate: 0, deduction: 0 },
      { min: 2259.21, max: 2826.65, rate: 7.5, deduction: 169.44 },
      { min: 2826.66, max: 3751.05, rate: 15, deduction: 381.44 },
      { min: 3751.06, max: 4664.68, rate: 22.5, deduction: 662.77 },
      { min: 4664.69, max: Infinity, rate: 27.5, deduction: 896.00 },
    ],
    dependentDeduction: 189.59,
  },
  dae: {},
}

// Default to current year
export const CURRENT_TAX_TABLE = TAX_TABLE_2026

/**
 * Get tax table for a specific year.
 * Throws if year not available.
 */
export function getTaxTable(year: number): TaxTable {
  const tables: Record<number, TaxTable> = {
    2026: TAX_TABLE_2026,
  }
  const table = tables[year]
  if (!table) {
    throw new Error(`Tax table for year ${year} not available. Available: ${Object.keys(tables).join(', ')}`)
  }
  return table
}
