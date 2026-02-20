import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/config'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'stripe-checkout', RATE_LIMITS.api)
  if (rateLimited) return rateLimited
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('id, email, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!employer) {
    return NextResponse.json({ error: 'Employer not found' }, { status: 404 })
  }

  // Get or create Stripe customer
  let customerId = employer.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: employer.email || user.email || undefined,
      metadata: { employer_id: employer.id, user_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('employers')
      .update({ stripe_customer_id: customerId })
      .eq('id', employer.id)
  }

  // Use env price ID or create inline
  const priceId = process.env.STRIPE_PRICE_ID
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [{
        price_data: {
          currency: 'brl',
          product_data: { name: 'LarDia Pro - Gestao de Folha' },
          unit_amount: 2990, // R$29.90
          recurring: { interval: 'month' as const },
        },
        quantity: 1,
      }]

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    success_url: `${baseUrl}/dashboard?subscription=success`,
    cancel_url: `${baseUrl}/dashboard/settings`,
    line_items: lineItems,
  } as Record<string, unknown>)

  await logAudit('subscription_created', 'stripe', { sessionId: session.id }, request, null, employer.id)

  return NextResponse.json({ url: session.url })
}
