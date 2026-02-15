import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/config'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// Creates a Stripe checkout session for a one-time background check payment (R$99.90)
export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'stripe-bg-check', RATE_LIMITS.backgroundCheck)
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    success_url: `${baseUrl}/dashboard/background-check?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard/background-check?payment=cancelled`,
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Verificação Pré-Contratação',
            description: 'Consulta de antecedentes, processos judiciais e situação cadastral',
          },
          unit_amount: 9990, // R$99.90
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: 'background_check',
      employer_id: employer.id,
    },
  } as Record<string, unknown>)

  return NextResponse.json({ url: session.url })
}
