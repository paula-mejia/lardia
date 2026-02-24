import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/config'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'stripe-bgcheck', RATE_LIMITS.api)
  if (rateLimited) return rateLimited

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { candidateName, candidateCpf, candidateDob } = body

  if (!candidateName || !candidateCpf || !candidateDob) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  // Get or create employer
  let { data: employer } = await supabase
    .from('employers')
    .select('id, email, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!employer) {
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

  if (!employer) {
    return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 500 })
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

  // Price ID from server-side env (not NEXT_PUBLIC)
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BACKGROUND_CHECK
    || process.env.STRIPE_PRICE_ID_BACKGROUND_CHECK

  if (!priceId) {
    return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lardia.com.br'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    success_url: `${baseUrl}/dashboard/background-check/processing?name=${encodeURIComponent(candidateName)}&cpf=${encodeURIComponent(candidateCpf)}&dob=${encodeURIComponent(candidateDob)}`,
    cancel_url: `${baseUrl}/dashboard/background-check`,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      type: 'background_check',
      candidateName,
      candidateCpf,
      candidateDob,
      employer_id: employer.id,
      user_id: user.id,
    },
  } as Record<string, unknown>)

  await logAudit('background_check_payment', 'stripe', {
    sessionId: session.id,
    candidateName,
  }, request, null, employer.id)

  return NextResponse.json({ url: session.url })
}
