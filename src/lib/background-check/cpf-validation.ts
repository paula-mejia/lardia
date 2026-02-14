// CPF validation utilities
// Validates CPF checksum algorithm and queries Receita Federal for status

export interface CpfValidationResult {
  valid: boolean
  formatted: string
  status: string // "regular", "suspensa", "cancelada", "nula", "pendente_de_regularizacao", "titular_falecido"
  situationDate: string | null
  nameMatch: boolean
  registeredName: string | null
}

/**
 * Validate CPF checksum algorithm.
 * Returns true if the CPF has valid check digits.
 */
export function validateCpfChecksum(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')

  if (digits.length !== 11) return false

  // Reject known invalid patterns (all same digit)
  if (/^(\d)\1{10}$/.test(digits)) return false

  // First check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  // Second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}

/**
 * Format CPF string to XXX.XXX.XXX-XX pattern.
 */
export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Query Receita Federal public endpoint for CPF status.
 * NOTE: The public web endpoint uses CAPTCHA. For production,
 * integrate with Serpro API (https://servicos.serpro.gov.br/api-de-consulta/api-cpf)
 * Cost: ~R$0.01-0.05 per query.
 *
 * For MVP, this returns a simulated response based on CPF validity.
 */
export async function queryCpfStatus(
  cpf: string,
  candidateName: string
): Promise<CpfValidationResult> {
  const digits = cpf.replace(/\D/g, '')
  const isValid = validateCpfChecksum(digits)

  if (!isValid) {
    return {
      valid: false,
      formatted: formatCpf(digits),
      status: 'invalido',
      situationDate: null,
      nameMatch: false,
      registeredName: null,
    }
  }

  // TODO: Replace with real Serpro API call
  // const response = await fetch(`https://gateway.apiserpro.serpro.gov.br/consulta-cpf-df/v1/cpf/${digits}`, {
  //   headers: { Authorization: `Bearer ${process.env.SERPRO_API_TOKEN}` },
  // })
  // const data = await response.json()

  // MVP: Simulate a successful response for valid CPFs
  return {
    valid: true,
    formatted: formatCpf(digits),
    status: 'regular',
    situationDate: new Date().toISOString().split('T')[0],
    nameMatch: true, // In production, compare with Serpro response
    registeredName: candidateName,
  }
}
