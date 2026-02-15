import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const PROXY_URL = process.env.ESOCIAL_PROXY_URL
const PROXY_API_KEY = process.env.ESOCIAL_PROXY_API_KEY

/**
 * Server-side proxy route for eSocial API calls.
 * Keeps the proxy API key server-side only.
 * Actions: test, send, query, ecac-test
 */
export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'esocial-proxy', RATE_LIMITS.api)
  if (rateLimited) return rateLimited
  const auth = await checkAuth()
  if (auth) return auth

  const action = request.nextUrl.searchParams.get('action')

  if (!PROXY_URL || !PROXY_API_KEY) {
    return NextResponse.json(
      { connected: false, error: 'Proxy not configured' },
      { status: 503 }
    )
  }

  try {
    if (action === 'test') {
      const res = await fetch(`${PROXY_URL}/api/esocial/test`, {
        headers: { 'x-api-key': PROXY_API_KEY },
        signal: AbortSignal.timeout(10000),
      })
      const data = await res.json()
      return NextResponse.json({ connected: res.ok, ...data })
    }

    if (action === 'ecac-test') {
      const res = await fetch(`${PROXY_URL}/api/ecac/test`, {
        headers: { 'x-api-key': PROXY_API_KEY },
        signal: AbortSignal.timeout(10000),
      })
      const data = await res.json()
      return NextResponse.json({ connected: res.ok, ...data })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: `Proxy unreachable: ${(error as Error).message}` },
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
      { success: false, error: 'Proxy not configured' },
      { status: 503 }
    )
  }

  const action = request.nextUrl.searchParams.get('action')
  const body = await request.json()

  try {
    if (action === 'send') {
      const res = await fetch(`${PROXY_URL}/api/esocial/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': PROXY_API_KEY,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      })
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    if (action === 'query') {
      const res = await fetch(`${PROXY_URL}/api/esocial/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': PROXY_API_KEY,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      })
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Proxy unreachable: ${(error as Error).message}` },
      { status: 502 }
    )
  }
}

async function checkAuth(): Promise<NextResponse | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }
  return null
}
