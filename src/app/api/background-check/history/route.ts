import { NextRequest } from 'next/server'
import { getAuthenticatedEmployer, success } from '@/lib/api/response'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'bg-check-history', RATE_LIMITS.api)
  if (rateLimited) return rateLimited
  const { error, supabase, employer } = await getAuthenticatedEmployer()
  if (error) {
    // Return empty list for unauthenticated (graceful degradation)
    return success({ checks: [] })
  }

  const { data: checks } = await supabase
    .from('background_checks')
    .select('id, candidate_name, candidate_cpf, status, created_at')
    .eq('employer_id', employer!.id)
    .order('created_at', { ascending: false })

  return success({ checks: checks || [] })
}
