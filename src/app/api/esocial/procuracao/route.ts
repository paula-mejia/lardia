import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Valid procuracao statuses
const VALID_STATUSES = ['not_started', 'pending_verification', 'active'] as const
type ProcuracaoStatus = (typeof VALID_STATUSES)[number]

/**
 * GET /api/esocial/procuracao
 * Returns the current procuracao_status for the authenticated employer.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: employer, error } = await supabase
      .from('employers')
      .select('procuracao_status')
      .eq('user_id', user.id)
      .single()

    if (error || !employer) {
      return NextResponse.json({ error: 'Empregador não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ status: employer.procuracao_status ?? 'not_started' })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * POST /api/esocial/procuracao
 * Updates the employer's procuracao_status.
 * Body: { status: 'pending_verification' | 'active' }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const newStatus = body.status as ProcuracaoStatus

    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('employers')
      .update({ procuracao_status: newStatus })
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 })
    }

    return NextResponse.json({ status: newStatus })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
