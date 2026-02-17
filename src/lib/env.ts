/**
 * Type-safe environment variable access with validation.
 * Separates public (client-safe) and server-only env vars.
 */

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env.local file or deployment environment.`
    )
  }
  return value
}

function optional(name: string, fallback = ''): string {
  return process.env[name] || fallback
}

// Public env vars (available on client)
export const env = {
  supabase: {
    url: required('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  },
  stripe: {
    publishableKey: optional('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  },
  siteUrl: optional('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
} as const

// Server-only env vars (never import this on client side)
export const serverEnv = {
  supabase: {
    serviceRoleKey: optional('SUPABASE_SERVICE_ROLE_KEY'),
  },
  stripe: {
    secretKey: optional('STRIPE_SECRET_KEY'),
    webhookSecret: optional('STRIPE_WEBHOOK_SECRET'),
    priceId: optional('STRIPE_PRICE_ID'),
  },
  sentry: {
    dsn: optional('SENTRY_DSN'),
  },
} as const
