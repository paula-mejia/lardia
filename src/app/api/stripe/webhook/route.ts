import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'

// Use service role for webhook - no user session available
function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.customer && session.subscription) {
        await supabase
          .from('employers')
          .update({ subscription_status: 'active' })
          .eq('stripe_customer_id', session.customer as string)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const statusMap: Record<string, string> = {
        active: 'active',
        trialing: 'trialing',
        past_due: 'past_due',
        canceled: 'canceled',
        unpaid: 'past_due',
      }
      const mapped = statusMap[subscription.status] || 'none'
      await supabase
        .from('employers')
        .update({ subscription_status: mapped })
        .eq('stripe_customer_id', subscription.customer as string)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('employers')
        .update({ subscription_status: 'canceled' })
        .eq('stripe_customer_id', subscription.customer as string)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.customer) {
        await supabase
          .from('employers')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
