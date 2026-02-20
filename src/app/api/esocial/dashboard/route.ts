import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: employer } = await supabase
      .from('employers')
      .select('id, esocial_connected, esocial_connected_at, cpf, full_name')
      .eq('user_id', user.id)
      .single()

    if (!employer) {
      return NextResponse.json({ error: 'Empregador não encontrado' }, { status: 404 })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Count active employees
    const { count: employeeCount } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('employer_id', employer.id)
      .eq('status', 'active')

    // Current month events
    const { data: currentEvents } = await supabase
      .from('esocial_events')
      .select('id, status, event_type')
      .eq('employer_id', employer.id)
      .eq('reference_month', currentMonth)
      .eq('reference_year', currentYear)

    const events = currentEvents || []
    const eventsGenerated = events.length
    const eventsSent = events.filter(e => e.status === 'enviado').length
    const eventsPending = events.filter(e => e.status === 'pendente').length
    const eventsError = events.filter(e => e.status === 'erro').length

    // Current month DAE
    const { data: currentDae } = await supabase
      .from('dae_records')
      .select('id, status, due_date, total_amount')
      .eq('employer_id', employer.id)
      .eq('reference_month', currentMonth)
      .eq('reference_year', currentYear)
      .single()

    // Last 6 months timeline
    const timeline = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()

      const { data: monthEvents } = await supabase
        .from('esocial_events')
        .select('id, status')
        .eq('employer_id', employer.id)
        .eq('reference_month', m)
        .eq('reference_year', y)

      const { data: monthDae } = await supabase
        .from('dae_records')
        .select('id, status, due_date')
        .eq('employer_id', employer.id)
        .eq('reference_month', m)
        .eq('reference_year', y)
        .single()

      const me = monthEvents || []
      const hasError = me.some(e => e.status === 'erro')
      const hasPending = me.some(e => e.status === 'pendente')
      const daeOverdue = monthDae?.status === 'pendente' && monthDae?.due_date && new Date(monthDae.due_date) < now

      let monthStatus: 'ok' | 'pendente' | 'atrasado' | 'vazio' = 'vazio'
      if (me.length > 0) {
        if (hasError || daeOverdue) monthStatus = 'atrasado'
        else if (hasPending) monthStatus = 'pendente'
        else monthStatus = 'ok'
      }

      timeline.push({
        month: m,
        year: y,
        eventsTotal: me.length,
        eventsSent: me.filter(e => e.status === 'enviado').length,
        status: monthStatus,
        daeStatus: monthDae?.status || null,
      })
    }

    // Next actions
    const nextActions: { label: string; type: 'warning' | 'info' | 'action' }[] = []

    if (eventsGenerated === 0 && (employeeCount || 0) > 0) {
      const monthName = now.toLocaleString('pt-BR', { month: 'long' })
      nextActions.push({ label: `Processar folha de ${monthName}`, type: 'action' })
    }
    if (eventsPending > 0) {
      nextActions.push({ label: `${eventsPending} evento(s) pendente(s) de envio`, type: 'warning' })
    }
    if (eventsError > 0) {
      nextActions.push({ label: `${eventsError} evento(s) com erro - reenviar`, type: 'warning' })
    }
    if (!currentDae && eventsGenerated > 0) {
      nextActions.push({ label: 'Gerar DAE do mês', type: 'action' })
    }
    if (currentDae?.due_date) {
      const dueDate = new Date(currentDae.due_date)
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue <= 7 && daysUntilDue > 0 && currentDae.status === 'pendente') {
        nextActions.push({ label: `DAE vence em ${daysUntilDue} dia(s)`, type: 'warning' })
      } else if (daysUntilDue <= 0 && currentDae.status === 'pendente') {
        nextActions.push({ label: 'DAE vencido!', type: 'warning' })
      }
    }
    if (!employer.esocial_connected) {
      nextActions.push({ label: 'Conectar eSocial (procuração)', type: 'action' })
    }

    return NextResponse.json({
      connection: {
        connected: employer.esocial_connected ?? false,
        connectedAt: employer.esocial_connected_at,
      },
      summary: {
        employees: employeeCount || 0,
        eventsGenerated,
        eventsSent,
        eventsPending,
        eventsError,
        dae: currentDae ? {
          status: currentDae.status,
          dueDate: currentDae.due_date,
          totalAmount: currentDae.total_amount,
        } : null,
      },
      timeline,
      nextActions,
      currentMonth,
      currentYear,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
