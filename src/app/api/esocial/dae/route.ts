import { getAuthenticatedEmployer, success, serverError } from '@/lib/api/response'

export async function GET() {
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
