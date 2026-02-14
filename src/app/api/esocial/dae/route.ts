import { NextRequest } from 'next/server'
import { getAuthenticatedEmployer, success, serverError } from '@/lib/api/response'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'esocial-dae', RATE_LIMITS.api)
  if (rateLimited) return rateLimited
  try {
    const { error, supabase, employer } = await getAuthenticatedEmployer()
    if (error) return error

    const { data: daes } = await supabase
      .from('dae_records')
      .select('*')
      .eq('employer_id', employer.id)
      .order('reference_year', { ascending: false })
      .order('reference_month', { ascending: false })

    return success(daes || [])
  } catch (err) {
    console.error('DAE fetch error:', err)
    return serverError('Erro ao buscar DAEs')
  }
}
