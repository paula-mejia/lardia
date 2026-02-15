import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { ESOCIAL_PROXY_ERRORS } from '@/lib/esocial/api-client'

const PROXY_URL = process.env.ESOCIAL_PROXY_URL?.replace(/\/+$/, '')
const PROXY_API_KEY = process.env.ESOCIAL_PROXY_API_KEY

/** Default timeout for proxy requests (ms) */
const DEFAULT_TIMEOUT = 30000
/** Timeout for health/test requests (ms) */
const TEST_TIMEOUT = 10000

/**
 * Server-side proxy route for eSocial API calls.
 * Keeps the proxy API key server-side only.
 * Forwards requests to the EC2 proxy in São Paulo.
 *
 * GET actions: health, test
 * POST actions: send, query
 */
export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'esocial-proxy', RATE_LIMITS.api)
  if (rateLimited) return rateLimited
  const auth = await checkAuth()
  if (auth) return auth

  if (!PROXY_URL || !PROXY_API_KEY) {
    return NextResponse.json(
      { connected: false, error: 'Proxy eSocial não configurado' },
      { status: 503 }
    )
  }

  const action = request.nextUrl.searchParams.get('action')

  try {
    if (action === 'health' || action === 'test') {
      const res = await fetch(`${PROXY_URL}/health`, {
        headers: { 'x-api-key': PROXY_API_KEY },
        signal: AbortSignal.timeout(TEST_TIMEOUT),
      })
      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('json') ? await res.json() : { status: await res.text() }
      return NextResponse.json({ connected: res.ok, healthy: res.ok, ...data as object })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    const message = classifyError(error as Error)
    return NextResponse.json(
      { connected: false, healthy: false, error: message },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'esocial-proxy', RATE_LIMITS.api)
  if (rateLimited) return rateLimited
  const auth = await checkAuth()
  if (auth) return auth

  if (!PROXY_URL || !PROXY_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Proxy eSocial não configurado' },
      { status: 503 }
    )
  }

  const action = request.nextUrl.searchParams.get('action')
  const body = await request.json()

  // Determine environment path
  const env = (body.environment === 'production') ? 'producao' : 'producaorestrita'

  try {
    if (action === 'send') {
      const res = await fetch(`${PROXY_URL}/esocial/${env}/enviarLoteEventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': PROXY_API_KEY,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      })

      if (res.status === 401 || res.status === 403) {
        return NextResponse.json(
          { success: false, error: ESOCIAL_PROXY_ERRORS.AUTH_ERROR },
          { status: 502 }
        )
      }

      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    if (action === 'query') {
      const res = await fetch(`${PROXY_URL}/esocial/${env}/consultarLoteEventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': PROXY_API_KEY,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      })

      if (res.status === 401 || res.status === 403) {
        return NextResponse.json(
          { success: false, error: ESOCIAL_PROXY_ERRORS.AUTH_ERROR },
          { status: 502 }
        )
      }

      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    const message = classifyError(error as Error)
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    )
  }
}

async function checkAuth(): Promise<NextResponse | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  return null
}

/** Classify errors into Portuguese user-facing messages */
function classifyError(error: Error): string {
  const msg = error.message.toLowerCase()
  if (msg.includes('timeout') || msg.includes('abort')) return ESOCIAL_PROXY_ERRORS.TIMEOUT
  if (msg.includes('econnrefused') || msg.includes('enotfound')) return ESOCIAL_PROXY_ERRORS.PROXY_DOWN
  if (msg.includes('cert') || msg.includes('ssl') || msg.includes('tls')) return ESOCIAL_PROXY_ERRORS.CERTIFICATE_ERROR
  return ESOCIAL_PROXY_ERRORS.PROXY_DOWN
}
