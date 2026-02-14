import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!employer) {
    return NextResponse.json({ checks: [] })
  }

  const { data: checks } = await supabase
    .from('background_checks')
    .select('id, candidate_name, candidate_cpf, status, created_at')
    .eq('employer_id', employer.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ checks: checks || [] })
}
