/**
 * In-memory rate limiter using a Map.
 * Keys expire after their window passes. Stale entries are cleaned every 5 minutes.
 * Suitable for single-instance deployments (not shared across serverless invocations).
 */

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

/** Preset rate limit configurations for different route categories. */
export const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 60_000 } as RateLimitConfig,
  api: { maxRequests: 30, windowMs: 60_000 } as RateLimitConfig,
  dashboard: { maxRequests: 60, windowMs: 60_000 } as RateLimitConfig,
  public: { maxRequests: 20, windowMs: 60_000 } as RateLimitConfig,
  backgroundCheck: { maxRequests: 3, windowMs: 3_600_000 } as RateLimitConfig,
} as const

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check if a request is within the rate limit for a given key.
 * @param key - Unique identifier (e.g., "api:192.168.1.1")
 * @param config - Rate limit configuration (max requests and window)
 * @returns Whether the request is allowed, remaining quota, and reset time
 */
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

/**
 * Extract client IP address from request headers (x-forwarded-for or x-real-ip).
 * @param request - Incoming HTTP request
 * @returns IP address string, or 'unknown' if not available
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

import { NextResponse } from 'next/server'

/**
 * Apply rate limiting to a request. Returns a 429 JSON response if the limit
 * is exceeded, or null if the request is allowed.
 * @param request - Incoming HTTP request
 * @param prefix - Key prefix for namespacing (e.g., 'auth', 'api')
 * @param config - Rate limit configuration
 * @param userId - Optional user ID (falls back to IP-based limiting)
 * @returns NextResponse with 429 status if rate limited, or null if allowed
 */
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
