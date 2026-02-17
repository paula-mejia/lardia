import Stripe from 'stripe'

/**
 * Get a server-side Stripe client instance.
 * Returns null if STRIPE_SECRET_KEY is not configured.
 * Only use in API routes or server components — never on the client.
 * @returns Stripe instance or null
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.warn('STRIPE_SECRET_KEY not set - Stripe features disabled')
    return null
  }
  return new Stripe(key, { apiVersion: '2026-01-28.clover' })
}

/**
 * Client-side Stripe.js loader. Lazily initializes and caches the Stripe promise.
 * Returns null if the publishable key is not configured.
 */
let stripePromise: ReturnType<typeof import('@stripe/stripe-js').loadStripe> | null = null

export function getStripeJs() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set')
      return null
    }
    // Dynamic import to avoid loading on server
    stripePromise = import('@stripe/stripe-js').then(({ loadStripe }) => loadStripe(key))
  }
  return stripePromise
}
