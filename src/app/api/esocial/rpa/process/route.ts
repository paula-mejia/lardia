import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startDAEProcessing, startFolhaProcessing } from '@/lib/esocial/rpa-api-client'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { month, year, mode = 'full-dae' } = body

    // Get employer CPF
    const { data: employer } = await supabase
      .from('employers')
      .select('id, cpf, full_name')
      .eq('user_id', user.id)
      .single()

    if (!employer?.cpf) {
      return NextResponse.json({ error: 'CPF do empregador não encontrado' }, { status: 404 })
    }

    // Start RPA job
    const job = mode === 'folha-only'
      ? await startFolhaProcessing(employer.cpf, year, month)
      : await startDAEProcessing(employer.cpf, year, month)

    await logAudit(
      'esocial_rpa_started',
      'esocial',
      { jobId: job.jobId, month, year, mode, cpf: employer.cpf },
      request,
      null,
      employer.id
    )

    return NextResponse.json({
      jobId: job.jobId,
      status: job.status,
      message: job.message,
    })
  } catch (error) {
    console.error('RPA process error:', error)
    return NextResponse.json(
      { error: 'Erro ao iniciar processamento no eSocial' },
      { status: 500 }
    )
  }
}
