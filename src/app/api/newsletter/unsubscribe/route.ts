import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const rateLimited = applyRateLimit(req, 'newsletter-unsub', RATE_LIMITS.public)
  if (rateLimited) return rateLimited
  try {
    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email obrigatório.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase().trim())

    if (error) {
      console.error('Newsletter unsubscribe error:', error)
      return NextResponse.json({ error: 'Erro ao cancelar inscrição.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição.' }, { status: 500 })
  }
}
