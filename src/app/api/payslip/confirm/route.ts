import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Service role client - bypasses RLS for token-based confirmation
function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(request: NextRequest) {
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  // Check if already confirmed
  const { data: existing } = await supabase
    .from('payslip_confirmations')
    .select('id, confirmed_at')
    .eq('token', token)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
  }

  if (existing.confirmed_at) {
    return NextResponse.json({
      already_confirmed: true,
      confirmed_at: existing.confirmed_at,
    })
  }

  const { data, error } = await supabase
    .from('payslip_confirmations')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('token', token)
    .is('confirmed_at', null)
    .select('confirmed_at')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Erro ao confirmar' }, { status: 500 })
  }

  return NextResponse.json({ confirmed_at: data.confirmed_at })
}
