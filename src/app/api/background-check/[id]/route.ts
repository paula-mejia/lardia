import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    return NextResponse.json({ error: 'Empregador nao encontrado' }, { status: 404 })
  }

  // RLS ensures employer can only see their own checks,
  // but we add the filter explicitly too
  const { data: check, error } = await supabase
    .from('background_checks')
    .select('*')
    .eq('id', id)
    .eq('employer_id', employer.id)
    .single()

  if (error || !check) {
    return NextResponse.json({ error: 'Consulta nao encontrada' }, { status: 404 })
  }

  return NextResponse.json(check)
}
