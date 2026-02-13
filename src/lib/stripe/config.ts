import Stripe from 'stripe'

// Server-side Stripe client - only use in API routes / server components
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.warn('STRIPE_SECRET_KEY not set - Stripe features disabled')
    return null
  }
  return new Stripe(key, { apiVersion: '2026-01-28.clover' })
}

// Client-side Stripe loader
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
