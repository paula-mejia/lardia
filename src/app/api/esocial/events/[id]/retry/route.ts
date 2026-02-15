import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Verify the event belongs to this employer and is in error state
    const { data: event } = await supabase
      .from('esocial_events')
      .select('id, status, event_type, event_data')
      .eq('id', id)
      .eq('employer_id', employer.id)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    if (event.status !== 'erro') {
      return NextResponse.json({ error: 'Apenas eventos com erro podem ser reenviados' }, { status: 400 })
    }

    // Update status to pendente for retry
    const { error: updateError } = await supabase
      .from('esocial_events')
      .update({ status: 'pendente', submitted_at: null })
      .eq('id', id)

    if (updateError) {
      console.error('Retry update error:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar evento' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Evento marcado para reenvio' })
  } catch (error) {
    console.error('Retry API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
