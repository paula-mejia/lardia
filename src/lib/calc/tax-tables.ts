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
 * 
 * Sources:
 * - Minimum wage: Decreto D12797 (23/12/2025) - R$1.621,00
 * - INSS: Portaria Interministerial MPS/MF Nº 13 (09/01/2026)
 * - IRRF: Lei nº 15.191 (11/08/2025) + Lei nº 15.270 (26/11/2025)
 *   Receita Federal: gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026
 */
export const TAX_TABLE_2026: TaxTable = {
  year: 2026,
  effectiveDate: '2026-01-01',
  minimumWage: 1621.00,
  inss: {
    employee: [
      { min: 0, max: 1621.00, rate: 7.5 },
      { min: 1621.01, max: 2902.84, rate: 9 },
      { min: 2902.85, max: 4354.27, rate: 12 },
      { min: 4354.28, max: 8475.55, rate: 14 },
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
      { min: 0, max: 2428.80, rate: 0, deduction: 0 },
      { min: 2428.81, max: 2826.65, rate: 7.5, deduction: 182.16 },
      { min: 2826.66, max: 3751.05, rate: 15, deduction: 394.16 },
      { min: 3751.06, max: 4664.68, rate: 22.5, deduction: 675.49 },
      { min: 4664.69, max: Infinity, rate: 27.5, deduction: 908.73 },
    ],
    dependentDeduction: 189.59,
  },
  dae: {},
}

// Default to current year
export const CURRENT_TAX_TABLE = TAX_TABLE_2026

/**
 * Regional minimum wages (Pisos Regionais) for 2026.
 * States with their own floor wages for domestic workers.
 * 
 * Sources:
 * - SP: CCT vigente R$1.643,62 (contempladas) / Lei Estadual R$1.804,00 (não contempladas). 2026 pendente.
 * - PR: R$2.181,63 (Faixa 1, vigente 2026)
 * - SC: R$1.730,00 (2025, 2026 pendente publicação)
 * - RS: R$1.789,04 (2025, 2026 pendente publicação)
 * - RJ: Usa nacional (R$1.621,00) - piso regional não superou nacional para domésticas
 * 
 * Rule: employer must pay whichever is HIGHER between national and regional.
 */
export interface RegionalWage {
  state: string
  stateName: string
  wage: number
  year: number
  confirmed: boolean // true if officially published for 2026
  note?: string
}

export const REGIONAL_WAGES_2026: RegionalWage[] = [
  { state: 'SP', stateName: 'São Paulo', wage: 1804.00, year: 2026, confirmed: false, note: 'Valor 2025 (Lei Estadual). CCT pode definir valor diferente. Atualização prevista para maio/junho 2026.' },
  { state: 'PR', stateName: 'Paraná', wage: 2181.63, year: 2026, confirmed: true },
  { state: 'SC', stateName: 'Santa Catarina', wage: 1730.00, year: 2026, confirmed: false, note: 'Valor 2025. Publicação 2026 pendente.' },
  { state: 'RS', stateName: 'Rio Grande do Sul', wage: 1789.04, year: 2026, confirmed: false, note: 'Valor 2025. Publicação 2026 pendente.' },
]

/**
 * Get effective minimum wage for a given state.
 * Returns regional wage if higher than national, otherwise national.
 */
export function getEffectiveMinimumWage(state?: string, table: TaxTable = CURRENT_TAX_TABLE): { wage: number; isRegional: boolean; regional?: RegionalWage } {
  if (!state) return { wage: table.minimumWage, isRegional: false }
  
  const regional = REGIONAL_WAGES_2026.find(r => r.state === state.toUpperCase())
  if (regional && regional.wage > table.minimumWage) {
    return { wage: regional.wage, isRegional: true, regional }
  }
  return { wage: table.minimumWage, isRegional: false }
}

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
