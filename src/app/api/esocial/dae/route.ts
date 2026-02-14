import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
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

    const { data: daes } = await supabase
      .from('dae_records')
      .select('*')
      .eq('employer_id', employer.id)
      .order('reference_year', { ascending: false })
      .order('reference_month', { ascending: false })

    return NextResponse.json(daes || [])
  } catch (error) {
    console.error('DAE fetch error:', error)
    return NextResponse.json({ error: 'Erro ao buscar DAEs' }, { status: 500 })
  }
}
