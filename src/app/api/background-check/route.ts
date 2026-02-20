import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runBackgroundCheck } from '@/lib/background-check/service'
import { validateCpfChecksum } from '@/lib/background-check/cpf-validation'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'background-check', RATE_LIMITS.backgroundCheck)
  if (rateLimited) return rateLimited
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!employer) {
    return NextResponse.json({ error: 'Empregador não encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { candidateName, candidateCpf, candidateDob, lgpdConsent } = body

  // Validate input
  if (!candidateName || !candidateCpf || !candidateDob) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  if (!lgpdConsent) {
    return NextResponse.json({ error: 'Consentimento LGPD obrigatório' }, { status: 400 })
  }

  if (!validateCpfChecksum(candidateCpf)) {
    return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
  }

  try {
    // Create the background check record
    const { data: check, error: insertError } = await supabase
      .from('background_checks')
      .insert({
        employer_id: employer.id,
        candidate_name: candidateName,
        candidate_cpf: candidateCpf,
        candidate_dob: candidateDob,
        status: 'pending',
        paid: false, // MVP: skip payment for now
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Erro ao criar consulta' }, { status: 500 })
    }

    // Run the background check (mock mode for MVP)
    const results = await runBackgroundCheck({
      candidateName,
      candidateCpf,
      candidateDob,
      lgpdConsent: true,
    })

    // Update with results
    const { error: updateError } = await supabase
      .from('background_checks')
      .update({
        status: 'completed',
        results,
      })
      .eq('id', check.id)

    if (updateError) {
      console.error('Update error:', updateError)
    }

    await logAudit('background_check_requested', 'background-check', { checkId: check.id, candidateName }, request, null, employer.id)

    return NextResponse.json({ id: check.id, status: 'completed' })
  } catch (err) {
    console.error('Background check error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
