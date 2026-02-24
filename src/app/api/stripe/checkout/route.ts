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

  const body = await request.json()
  const { mode, priceId, metadata, successUrl, cancelUrl } = body

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lardia.com.br'

  // Get or create employer record (background check works even without full onboarding)
  let { data: employer } = await supabase
    .from('employers')
    .select('id, email, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!employer && mode === 'payment') {
    const { data: newEmployer } = await supabase
      .from('employers')
      .insert({
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email || 'Usuário',
        onboarding_completed: false,
      })
      .select('id, email, stripe_customer_id')
      .single()
    employer = newEmployer
  }

  // Get or create Stripe customer (works with or without employer record)
  let customerId = employer?.stripe_customer_id || null
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: employer?.email || user.email || undefined,
      metadata: {
        user_id: user.id,
        ...(employer ? { employer_id: employer.id } : {}),
      },
    })
    customerId = customer.id
    // Save customer ID if employer exists
    if (employer) {
      await supabase
        .from('employers')
        .update({ stripe_customer_id: customerId })
        .eq('id', employer.id)
    }
  }

  // One-time payment mode (background check - no employer required)
  if (mode === 'payment') {
    const bgPriceId = priceId || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BACKGROUND_CHECK

    if (!bgPriceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      success_url: successUrl || `${baseUrl}/dashboard/background-check?payment=success`,
      cancel_url: cancelUrl || `${baseUrl}/dashboard/background-check`,
      line_items: [{ price: bgPriceId, quantity: 1 }],
      metadata: {
        ...metadata,
        user_id: user.id,
        ...(employer ? { employer_id: employer.id } : {}),
      },
    } as Record<string, unknown>)

    await logAudit('background_check_payment', 'stripe', { sessionId: session.id, ...metadata }, request, null, employer?.id || null)

    return NextResponse.json({ url: session.url })
  }

  // Subscription mode (requires employer)
  if (!employer) {
    return NextResponse.json({ error: 'Complete o cadastro antes de assinar um plano' }, { status: 404 })
  }

  const subPriceId = priceId || process.env.STRIPE_PRICE_ID

  const lineItems = subPriceId
    ? [{ price: subPriceId, quantity: 1 }]
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
    success_url: successUrl || `${baseUrl}/dashboard?subscription=success`,
    cancel_url: cancelUrl || `${baseUrl}/dashboard/settings`,
    line_items: lineItems,
  } as Record<string, unknown>)

  await logAudit('subscription_created', 'stripe', { sessionId: session.id }, request, null, employer.id)

  return NextResponse.json({ url: session.url })
}
