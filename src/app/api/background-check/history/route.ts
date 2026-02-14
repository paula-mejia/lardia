import { getAuthenticatedEmployer, success } from '@/lib/api/response'

export async function GET() {
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
