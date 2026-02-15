import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: employer } = await supabase
      .from('employers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!employer) {
      return NextResponse.json({ error: 'Empregador não encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const eventType = searchParams.get('event_type')

    let query = supabase
      .from('esocial_events')
      .select('id, employer_id, employee_id, event_type, event_data, status, reference_month, reference_year, submitted_at, created_at')
      .eq('employer_id', employer.id)
      .order('created_at', { ascending: false })

    if (month) query = query.eq('reference_month', parseInt(month))
    if (year) query = query.eq('reference_year', parseInt(year))
    if (status) query = query.eq('status', status)
    if (eventType) query = query.eq('event_type', eventType)

    const { data: events, error } = await query.limit(200)

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json({ error: 'Erro ao buscar eventos' }, { status: 500 })
    }

    return NextResponse.json({ events: events || [] })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
