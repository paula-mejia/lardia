import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_SOURCES = ['landing', 'blog', 'simulator', 'faq'] as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, source } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email obrigatorio.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalido.' }, { status: 400 })
    }

    const validSource = VALID_SOURCES.includes(source) ? source : 'landing'

    // Upsert: if email exists and was unsubscribed, re-subscribe
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          source: validSource,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        { onConflict: 'email' }
      )

    if (error) {
      console.error('Newsletter subscribe error:', error)
      return NextResponse.json({ error: 'Erro ao cadastrar email.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisicao.' }, { status: 500 })
  }
}
