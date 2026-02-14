import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processMonthlyPayroll } from '@/lib/esocial/monthly-processor'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { month, year } = await request.json()

    if (!month || !year) {
      return NextResponse.json({ error: 'Mes e ano obrigatorios' }, { status: 400 })
    }

    // Get employer
    const { data: employer } = await supabase
      .from('employers')
      .select('id, cpf, full_name')
      .eq('user_id', user.id)
      .single()

    if (!employer) {
      return NextResponse.json({ error: 'Empregador nao encontrado' }, { status: 404 })
    }

    // Get active employees
    const { data: employees } = await supabase
      .from('employees')
      .select('id, full_name, cpf, salary')
      .eq('employer_id', employer.id)
      .eq('status', 'active')

    if (!employees || employees.length === 0) {
      return NextResponse.json({ error: 'Nenhum empregado ativo encontrado' }, { status: 400 })
    }

    // Process payroll
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
      }))
    )

    // Save events to database
    for (const event of result.events) {
      await supabase.from('esocial_events').insert({
        employer_id: employer.id,
        employee_id: event.employeeId,
        event_type: event.eventType,
        event_data: event.eventData,
        status: event.status,
        reference_month: month,
        reference_year: year,
        submitted_at: event.submittedAt,
      })
    }

    // Save DAE record
    if (result.dae) {
      await supabase.from('dae_records').insert({
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
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('eSocial processing error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar folha' },
      { status: 500 }
    )
  }
}
