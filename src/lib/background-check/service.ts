// Background check service layer
// MVP: Mock/simulation mode with realistic sample data
// Production: Integrate with BigDataCorp API (https://docs.bigdatacorp.com.br/)

import { queryCpfStatus, validateCpfChecksum, type CpfValidationResult } from './cpf-validation'

// Toggle between mock and real API mode
const USE_MOCK = process.env.BACKGROUND_CHECK_MODE !== 'production'

export interface BackgroundCheckRequest {
  candidateName: string
  candidateCpf: string
  candidateDob: string // YYYY-MM-DD
  lgpdConsent: boolean
}

export interface BackgroundCheckResult {
  cpf_valid: boolean
  cpf_status: string // "regular", "suspensa", "cancelada", etc.
  name_match: boolean
  criminal_records: {
    has_records: boolean
    details: string
  }
  lawsuits: {
    has_lawsuits: boolean
    count: number
  }
  credit_score: {
    status: string // "limpo", "negativado"
  }
  cpf_details: CpfValidationResult
  consultation_date: string
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
    throw new Error('CPF invalido')
  }

  if (USE_MOCK) {
    return runMockCheck(request)
  }

  return runRealCheck(request)
}

/**
 * Mock mode: Returns realistic sample data for development/MVP.
 * Uses real CPF validation algorithm, simulates everything else.
 */
async function runMockCheck(
  request: BackgroundCheckRequest
): Promise<BackgroundCheckResult> {
  // CPF validation is always real (algorithmic check)
  const cpfResult = await queryCpfStatus(request.candidateCpf, request.candidateName)

  // Simulate a small delay like a real API call
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate deterministic mock data based on CPF digits
  // This way the same CPF always returns the same results
  const digits = request.candidateCpf.replace(/\D/g, '')
  const seed = parseInt(digits.slice(-2))

  // ~10% chance of criminal records (based on last 2 digits)
  const hasCriminalRecords = seed >= 90

  // ~15% chance of lawsuits
  const hasLawsuits = seed >= 85 && seed < 90
  const lawsuitCount = hasLawsuits ? (seed % 3) + 1 : 0

  // ~20% chance of negative credit
  const isNegativado = seed >= 80 && seed < 85

  return {
    cpf_valid: cpfResult.valid,
    cpf_status: cpfResult.status,
    name_match: cpfResult.nameMatch,
    criminal_records: {
      has_records: hasCriminalRecords,
      details: hasCriminalRecords
        ? 'Registros encontrados em consulta a bases publicas'
        : 'Nenhum registro encontrado',
    },
    lawsuits: {
      has_lawsuits: hasLawsuits,
      count: lawsuitCount,
    },
    credit_score: {
      status: isNegativado ? 'negativado' : 'limpo',
    },
    cpf_details: cpfResult,
    consultation_date: new Date().toISOString(),
  }
}

/**
 * Real mode: Calls BigDataCorp API for full background check.
 * TODO: Implement when BigDataCorp account is set up.
 *
 * BigDataCorp API integration:
 * POST https://api.bigdatacorp.com.br/pessoas
 * Headers: { Authorization: "Bearer {BIGDATACORP_API_TOKEN}" }
 * Body: {
 *   "cpf": "12345678900",
 *   "datasets": ["basic_data", "criminal_records", "lawsuits", "credit_score"]
 * }
 *
 * Cost: ~R$3-8 per full query
 * Docs: https://docs.bigdatacorp.com.br/
 */
async function runRealCheck(
  request: BackgroundCheckRequest
): Promise<BackgroundCheckResult> {
  const cpfResult = await queryCpfStatus(request.candidateCpf, request.candidateName)

  // TODO: BigDataCorp API call
  // const response = await fetch('https://api.bigdatacorp.com.br/pessoas', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.BIGDATACORP_API_TOKEN}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     cpf: request.candidateCpf.replace(/\D/g, ''),
  //     datasets: ['basic_data', 'criminal_records', 'lawsuits', 'credit_score'],
  //   }),
  // })
  // const data = await response.json()
  // Map BigDataCorp response to our interface...

  // For now, fall back to mock
  return runMockCheck(request)
}
