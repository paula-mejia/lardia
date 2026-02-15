import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProxyClient } from '@/lib/esocial/api-client'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

/**
 * GET /api/esocial/health
 * Checks the EC2 proxy health and returns connection status.
 * Used by the dashboard to show real-time green/red indicator.
 */
export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'esocial-health', RATE_LIMITS.api)
  if (rateLimited) return rateLimited

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const client = createProxyClient()
  if (!client) {
    return NextResponse.json(
      {
        status: 'disconnected',
        healthy: false,
        message: 'Proxy eSocial não configurado. Variáveis de ambiente ausentes.',
      },
      { status: 503 }
    )
  }

  const health = await client.checkHealth()

  return NextResponse.json({
    status: health.healthy ? 'connected' : 'disconnected',
    healthy: health.healthy,
    message: health.message,
    latencyMs: health.latencyMs,
    environment: client.getEnvironment(),
    timestamp: new Date().toISOString(),
  })
}
