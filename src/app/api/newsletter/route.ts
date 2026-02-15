import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_SOURCES = ['landing', 'blog', 'simulator', 'calculator', 'faq'] as const

export async function POST(req: NextRequest) {
  const rateLimited = applyRateLimit(req, 'newsletter', RATE_LIMITS.public)
  if (rateLimited) return rateLimited
  try {
    const body = await req.json()
    const { email, name, source, lgpdConsent } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email obrigatório.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
    }

    if (!lgpdConsent) {
      return NextResponse.json(
        { error: 'É necessário aceitar a política de privacidade.' },
        { status: 400 }
      )
    }

    const validSource = VALID_SOURCES.includes(source) ? source : 'landing'
    const normalizedEmail = email.toLowerCase().trim()

    // Upsert: if email exists and was unsubscribed, re-subscribe
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          name: name?.trim() || null,
          source: validSource,
          status: 'active',
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
          lgpd_consent_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )

    if (error) {
      console.error('Newsletter subscribe error:', error)
      return NextResponse.json({ error: 'Erro ao cadastrar email.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição.' }, { status: 500 })
  }
}
