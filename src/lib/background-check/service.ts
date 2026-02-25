// Background check service layer
// Uses real TJSP scraper running on EC2 São Paulo
// Fallback: mock/simulation mode for development

import { validateCpfChecksum, type CpfValidationResult } from './cpf-validation'

const USE_MOCK = process.env.BACKGROUND_CHECK_MODE === 'mock'
const BGCHECK_API_URL = process.env.BGCHECK_API_URL || 'https://api.lardia.com.br/bgcheck'
const BGCHECK_SECRET = process.env.BGCHECK_SECRET || 'lardia-bgcheck-2026'

export interface BackgroundCheckRequest {
  candidateName: string
  candidateCpf: string
  candidateDob: string // YYYY-MM-DD
  lgpdConsent: boolean
}

export interface ProcessoRecord {
  numero: string
  classe?: string
  assunto?: string
}

export interface SourceResult {
  status: 'CLEAN' | 'HAS_RECORDS' | 'ERROR' | 'BLOCKED'
  count?: number
  processos?: ProcessoRecord[]
  error?: string
  note?: string
}

export interface BackgroundCheckResult {
  cpf_valid: boolean
  cpf_status: string
  name_match: boolean
  criminal_records: {
    has_records: boolean
    details: string
    count: number
    processos: ProcessoRecord[]
  }
  lawsuits: {
    has_lawsuits: boolean
    count: number
    processos: ProcessoRecord[]
  }
  sources: Record<string, SourceResult>
  summary: {
    overallStatus: 'CLEAR' | 'REVIEW_NEEDED'
    flags: Array<{ source: string; status: string; message: string }>
  }
  cpf_details: CpfValidationResult
  consultation_date: string
  duration_ms: number
  credit_score?: { status: string }
  labor_lawsuits?: {
    has_records: boolean
    count: number
    processos: ProcessoRecord[]
  }
  tjrj?: {
    has_records: boolean
    count: number
    processos: ProcessoRecord[]
  }
  ceis?: { status: string; count: number }
  cnep?: { status: string; count: number }
  pep?: { status: string; count: number }
  ceaf?: { status: string; count: number }
  tjmg?: {
    has_records: boolean
    count: number
    processos: ProcessoRecord[]
  }
  tjpr?: {
    has_records: boolean
    count: number
    processos: ProcessoRecord[]
  }
}

/**
 * Run a full background check for a candidate.
 * Requires LGPD consent to proceed.
 */
export async function runBackgroundCheck(
  request: BackgroundCheckRequest
): Promise<BackgroundCheckResult> {
  if (!request.lgpdConsent) {
    throw new Error('LGPD consent is required to run a background check')
  }

  if (!validateCpfChecksum(request.candidateCpf)) {
    throw new Error('CPF inválido')
  }

  if (USE_MOCK) {
    return runMockCheck(request)
  }

  return runRealCheck(request)
}

/**
 * Real mode: Calls EC2 São Paulo scraper API for TJSP background check.
 */
async function runRealCheck(
  request: BackgroundCheckRequest
): Promise<BackgroundCheckResult> {
  const cpf = request.candidateCpf.replace(/\D/g, '')
  
  const cpfResult: CpfValidationResult = {
    valid: validateCpfChecksum(cpf),
    status: 'regular', // TODO: add Receita Federal check when captcha solver works
    nameMatch: true,
    formatted: cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
    situationDate: new Date().toISOString().slice(0, 10),
    registeredName: request.candidateName,
  }

  // Call the EC2 scraper API
  const response = await fetch(`${BGCHECK_API_URL}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cpf,
      nome: request.candidateName,
      secret: BGCHECK_SECRET,
    }),
    signal: AbortSignal.timeout(120000), // 2 min timeout
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Background check API error: ${response.status} - ${errorBody}`)
  }

  const data = await response.json()

  // Merge all process records
  const allProcessos: ProcessoRecord[] = []
  let totalCount = 0
  
  for (const [, source] of Object.entries(data.sources || {})) {
    const s = source as SourceResult
    if (s.status === 'HAS_RECORDS' && s.processos) {
      allProcessos.push(...s.processos)
      totalCount += s.count || 0
    }
  }

  // Deduplicate by process number
  const uniqueProcessos = Array.from(
    new Map(allProcessos.map(p => [p.numero, p])).values()
  )

  const hasRecords = uniqueProcessos.length > 0

  return {
    cpf_valid: cpfResult.valid,
    cpf_status: cpfResult.status,
    name_match: cpfResult.nameMatch,
    criminal_records: {
      has_records: hasRecords,
      details: hasRecords
        ? `${uniqueProcessos.length} processo(s) encontrado(s) no TJSP`
        : 'Nenhum registro encontrado no TJSP',
      count: uniqueProcessos.length,
      processos: uniqueProcessos,
    },
    lawsuits: {
      has_lawsuits: hasRecords,
      count: uniqueProcessos.length,
      processos: uniqueProcessos,
    },
    sources: data.sources || {},
    summary: data.summary || { overallStatus: 'CLEAR', flags: [] },
    cpf_details: cpfResult,
    consultation_date: data.consultedAt || new Date().toISOString(),
    duration_ms: data.durationMs || 0,
    labor_lawsuits: data.sources?.trt2_trabalhista ? {
      has_records: data.sources.trt2_trabalhista.status === 'HAS_RECORDS',
      count: data.sources.trt2_trabalhista.count || 0,
      processos: (data.sources.trt2_trabalhista.processos || []).map((p: { numero: string }) => ({ numero: p.numero })),
    } : undefined,
    tjrj: data.sources?.tjrj ? {
      has_records: data.sources.tjrj.status === 'HAS_RECORDS',
      count: data.sources.tjrj.count || 0,
      processos: (data.sources.tjrj.processos || []).map((p: { numero: string }) => ({ numero: p.numero })),
    } : undefined,
    ceis: data.sources?.ceis ? { status: data.sources.ceis.status, count: data.sources.ceis.count || 0 } : undefined,
    cnep: data.sources?.cnep ? { status: data.sources.cnep.status, count: data.sources.cnep.count || 0 } : undefined,
    pep: data.sources?.pep ? { status: data.sources.pep.status, count: data.sources.pep.count || 0 } : undefined,
    ceaf: data.sources?.ceaf ? { status: data.sources.ceaf.status, count: data.sources.ceaf.count || 0 } : undefined,
    tjmg: data.sources?.tjmg ? {
      has_records: data.sources.tjmg.status === 'HAS_RECORDS',
      count: data.sources.tjmg.count || 0,
      processos: (data.sources.tjmg.processos || []).map((p: { numero: string }) => ({ numero: p.numero })),
    } : undefined,
    tjpr: data.sources?.tjpr ? {
      has_records: data.sources.tjpr.status === 'HAS_RECORDS',
      count: data.sources.tjpr.count || 0,
      processos: (data.sources.tjpr.processos || []).map((p: { numero: string }) => ({ numero: p.numero })),
    } : undefined,
  }
}

/**
 * Mock mode: Returns realistic sample data for development/MVP.
 */
async function runMockCheck(
  request: BackgroundCheckRequest
): Promise<BackgroundCheckResult> {
  const cpfResult: CpfValidationResult = {
    valid: validateCpfChecksum(request.candidateCpf),
    status: 'regular',
    nameMatch: true,
    formatted: request.candidateCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
    situationDate: new Date().toISOString().slice(0, 10),
    registeredName: request.candidateName,
  }

  await new Promise((resolve) => setTimeout(resolve, 1500))

  const digits = request.candidateCpf.replace(/\D/g, '')
  const seed = parseInt(digits.slice(-2))

  const hasCriminalRecords = seed >= 90
  const hasLawsuits = seed >= 85 && seed < 90
  const lawsuitCount = hasLawsuits ? (seed % 3) + 1 : 0

  return {
    cpf_valid: cpfResult.valid,
    cpf_status: cpfResult.status,
    name_match: cpfResult.nameMatch,
    criminal_records: {
      has_records: hasCriminalRecords,
      details: hasCriminalRecords
        ? 'Registros encontrados em consulta a bases publicas'
        : 'Nenhum registro encontrado',
      count: hasCriminalRecords ? 1 : 0,
      processos: [],
    },
    lawsuits: {
      has_lawsuits: hasLawsuits,
      count: lawsuitCount,
      processos: [],
    },
    sources: {},
    summary: {
      overallStatus: hasCriminalRecords || hasLawsuits ? 'REVIEW_NEEDED' : 'CLEAR',
      flags: [],
    },
    cpf_details: cpfResult,
    consultation_date: new Date().toISOString(),
    duration_ms: 1500,
  }
}
