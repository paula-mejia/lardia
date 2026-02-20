import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processMonthlyPayroll } from '@/lib/esocial/monthly-processor'
import { applyRateLimit } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'esocial-process', { windowMs: 60000, maxRequests: 1 })
  if (rateLimited) return rateLimited

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const now = new Date()
    const month = body.month || now.getMonth() + 1
    const year = body.year || now.getFullYear()

    if (month < 1 || month > 12 || year < 2020 || year > 2030) {
      return NextResponse.json({ error: 'Mês ou ano inválido' }, { status: 400 })
    }

    // Get employer
    const { data: employer } = await supabase
      .from('employers')
      .select('id, cpf, full_name')
      .eq('user_id', user.id)
      .single()

    if (!employer) {
      return NextResponse.json({ error: 'Empregador não encontrado' }, { status: 404 })
    }

    // Check for existing events this month (prevent duplicates)
    const { data: existingEvents } = await supabase
      .from('esocial_events')
      .select('id')
      .eq('employer_id', employer.id)
      .eq('reference_month', month)
      .eq('reference_year', year)
      .limit(1)

    if (existingEvents && existingEvents.length > 0) {
      return NextResponse.json(
        { error: `Já existem eventos processados para ${String(month).padStart(2, '0')}/${year}. Exclua os eventos existentes para reprocessar.` },
        { status: 409 }
      )
    }

    // Get active employees
    const { data: employees } = await supabase
      .from('employees')
      .select('id, full_name, cpf, salary, dependents')
      .eq('employer_id', employer.id)
      .eq('status', 'active')

    if (!employees || employees.length === 0) {
      return NextResponse.json({ error: 'Nenhum empregado ativo encontrado' }, { status: 400 })
    }

    // Process payroll for all employees
    const result = processMonthlyPayroll(
      employer.id,
      employer.cpf || '',
      month,
      year,
      employees.map((e) => ({
        id: e.id,
        name: e.full_name,
        cpf: e.cpf,
        grossSalary: e.salary,
        dependents: e.dependents || 0,
      }))
    )

    // Store all events (S-1200 + S-1210) in esocial_events
    const eventInserts = result.events.map((event) => ({
      employer_id: employer.id,
      employee_id: event.employeeId,
      event_type: event.eventType,
      event_data: event.eventData,
      status: 'draft' as const,
      reference_month: month,
      reference_year: year,
    }))

    if (eventInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('esocial_events')
        .insert(eventInserts)

      if (insertError) {
        console.error('Error inserting events:', insertError)
        return NextResponse.json({ error: 'Erro ao salvar eventos no banco de dados' }, { status: 500 })
      }
    }

    // Store DAE record
    let daeInsertFailed = false
    if (result.dae) {
      const { error: daeError } = await supabase.from('dae_records').insert({
        employer_id: employer.id,
        reference_month: month,
        reference_year: year,
        total_amount: result.dae.totalAmount,
        due_date: result.dae.dueDate,
        status: result.dae.status,
        barcode: result.dae.barcode,
        breakdown: result.dae.breakdown,
        employees: result.dae.employees,
      })

      if (daeError) {
        console.error('Error inserting DAE:', daeError)
        daeInsertFailed = true
      }
    }

    await logAudit(
      'esocial_monthly_processed',
      'esocial',
      {
        month,
        year,
        employeeCount: employees.length,
        eventCount: result.totalEventsGenerated,
        daeTotal: result.totalDaeValue,
        errors: result.errors,
      },
      request,
      null,
      employer.id
    )

    return NextResponse.json({
      status: result.status,
      month: result.month,
      year: result.year,
      totalEventsGenerated: result.totalEventsGenerated,
      totalDaeValue: result.totalDaeValue,
      errors: result.errors,
      employees: result.employees.map((e) => ({
        employeeId: e.employeeId,
        employeeName: e.employeeName,
        cpf: e.cpf,
        grossSalary: e.grossSalary,
        status: e.status,
        payroll: e.payroll ? {
          netSalary: e.payroll.netSalary,
          inssEmployee: e.payroll.inssEmployee,
          irrfEmployee: e.payroll.irrfEmployee,
          daeTotal: e.payroll.daeTotal,
          totalEarnings: e.payroll.totalEarnings,
          totalDeductions: e.payroll.totalDeductions,
          inssEmployer: e.payroll.inssEmployer,
          gilrat: e.payroll.gilrat,
          fgtsMonthly: e.payroll.fgtsMonthly,
          fgtsAnticipation: e.payroll.fgtsAnticipation,
        } : undefined,
        error: e.error,
      })),
      dae: result.dae ? {
        totalAmount: result.dae.totalAmount,
        dueDate: result.dae.dueDate,
        barcode: result.dae.barcode,
        breakdown: result.dae.breakdown,
        employees: result.dae.employees,
      } : undefined,
      processedAt: result.processedAt,
      warnings: daeInsertFailed ? ['Eventos gerados com sucesso, mas houve erro ao salvar o DAE. Tente reprocessar.'] : [],
    })
  } catch (error) {
    console.error('eSocial processing error:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar folha' },
      { status: 500 }
    )
  }
}
