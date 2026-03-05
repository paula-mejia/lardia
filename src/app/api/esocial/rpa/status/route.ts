import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getJobStatus, getDownloadUrl } from '@/lib/esocial/rpa-api-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const jobId = request.nextUrl.searchParams.get('jobId')
    if (!jobId) {
      return NextResponse.json({ error: 'jobId é obrigatório' }, { status: 400 })
    }

    const status = await getJobStatus(jobId)

    // Add download URLs if files are available
    const response: Record<string, unknown> = { ...status }
    if (status.result?.dae?.filename) {
      response.daeDownloadUrl = getDownloadUrl(status.result.dae.filename)
    }
    if (status.result?.recibos?.filename) {
      response.recibosDownloadUrl = getDownloadUrl(status.result.recibos.filename)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('RPA status error:', error)
    return NextResponse.json(
      { error: 'Erro ao consultar status do processamento' },
      { status: 500 }
    )
  }
}
