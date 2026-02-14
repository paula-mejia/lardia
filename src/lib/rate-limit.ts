// In-memory rate limiter using a Map
// Keys expire after their window passes

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

// Preset limits
export const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 60_000 } as RateLimitConfig,
  api: { maxRequests: 30, windowMs: 60_000 } as RateLimitConfig,
  public: { maxRequests: 20, windowMs: 60_000 } as RateLimitConfig,
  backgroundCheck: { maxRequests: 3, windowMs: 3_600_000 } as RateLimitConfig,
} as const

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs }
  }

  entry.count++
  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt }
}

// Helper to extract IP from request headers
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

// Helper that returns a 429 Response if rate limited, or null if allowed
import { NextResponse } from 'next/server'

export function applyRateLimit(
  request: Request,
  prefix: string,
  config: RateLimitConfig,
  userId?: string
): NextResponse | null {
  const ip = getClientIp(request)
  const key = `${prefix}:${userId || ip}`
  const result = checkRateLimit(key, config)

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Muitas requisicoes. Tente novamente mais tarde.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetAt),
        },
      }
    )
  }

  return null
}
