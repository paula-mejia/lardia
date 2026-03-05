/**
 * RPA API Client
 * Connects to the Lardia eSocial RPA API running on EC2
 * Handles real eSocial portal automation via Gov.BR + Playwright
 */

const RPA_API_URL = process.env.RPA_API_URL || 'https://api.lardia.com.br/esocial'
const RPA_API_KEY = process.env.RPA_API_KEY || 'lardia-2026-secret'

interface RpaJobResponse {
  jobId: string
  status: string
  message: string
}

interface RpaJobStatus {
  id: string
  cpf: string
  year: number
  month: number
  actions: string[]
  status: 'queued' | 'processing' | 'completed' | 'error'
  step?: string
  empId?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  failedAt?: string
  result?: {
    folha?: {
      status: string
      workers: Array<{
        name: string
        vencimentos: string
        descontos: string
        liquido: string
        dataPagamento: string
      }>
    }
    steps?: Array<{
      step: string
      status?: string
      success?: boolean
      skipped?: boolean
      reason?: string
      total?: string
      vencimento?: string
    }>
    daePreview?: {
      total: string | null
      vencimento: string | null
      values: Record<string, string>
    }
    dae?: {
      success: boolean
      filepath?: string
      filename?: string
      size?: number
      message?: string
    }
    recibos?: {
      success: boolean
      filepath?: string
      filename?: string
      size?: number
      message?: string
    }
  }
  error?: string | null
}

interface ProcuracaoValidation {
  cpf: string
  valid: boolean
  empId?: string
  message: string
}

interface EmployeeList {
  cpf: string
  empId: string
  employees: Array<{
    name: string
    cpf: string
    status: string
  }>
}

async function rpaFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${RPA_API_URL}${path}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': RPA_API_KEY,
      ...options.headers,
    },
  })
}

/**
 * Check if the RPA API is healthy
 */
export async function checkRpaHealth(): Promise<{ status: string; version: string }> {
  const res = await rpaFetch('/health')
  return res.json()
}

/**
 * Validate that a procuração exists and is active for a CPF
 */
export async function validateProcuracao(cpf: string): Promise<ProcuracaoValidation> {
  const res = await rpaFetch('/api/validate-procuracao', {
    method: 'POST',
    body: JSON.stringify({ cpf }),
  })
  return res.json()
}

/**
 * Get list of employees from eSocial portal for a CPF
 */
export async function getEmployeesFromPortal(cpf: string): Promise<EmployeeList> {
  const res = await rpaFetch('/api/employees', {
    method: 'POST',
    body: JSON.stringify({ cpf }),
  })
  return res.json()
}

/**
 * Start a full DAE processing job
 * Returns job ID for polling
 */
export async function startDAEProcessing(
  cpf: string,
  year: number,
  month: number
): Promise<RpaJobResponse> {
  const res = await rpaFetch('/api/process-folha', {
    method: 'POST',
    body: JSON.stringify({
      cpf,
      year,
      month,
      actions: ['full-dae'],
    }),
  })
  return res.json()
}

/**
 * Start folha-only processing (no encerrar, no DAE)
 */
export async function startFolhaProcessing(
  cpf: string,
  year: number,
  month: number
): Promise<RpaJobResponse> {
  const res = await rpaFetch('/api/process-folha', {
    method: 'POST',
    body: JSON.stringify({
      cpf,
      year,
      month,
      actions: ['folha'],
    }),
  })
  return res.json()
}

/**
 * Poll job status
 */
export async function getJobStatus(jobId: string): Promise<RpaJobStatus> {
  const res = await rpaFetch(`/api/jobs/${jobId}`)
  return res.json()
}

/**
 * Get download URL for a generated file
 */
export function getDownloadUrl(filename: string): string {
  return `${RPA_API_URL}/api/download/${filename}?apiKey=${RPA_API_KEY}`
}

/**
 * Poll a job until it completes or fails
 * @param jobId - Job ID to poll
 * @param onProgress - Callback for progress updates
 * @param maxWaitMs - Maximum wait time (default: 5 minutes)
 * @param intervalMs - Polling interval (default: 5 seconds)
 */
export async function waitForJob(
  jobId: string,
  onProgress?: (status: RpaJobStatus) => void,
  maxWaitMs = 300000,
  intervalMs = 5000
): Promise<RpaJobStatus> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getJobStatus(jobId)
    onProgress?.(status)

    if (status.status === 'completed' || status.status === 'error') {
      return status
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error('Job timed out')
}
