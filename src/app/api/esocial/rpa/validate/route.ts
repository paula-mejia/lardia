import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateProcuracao } from '@/lib/esocial/rpa-api-client'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: employer } = await supabase
      .from('employers')
      .select('id, cpf, full_name')
      .eq('user_id', user.id)
      .single()

    if (!employer?.cpf) {
      return NextResponse.json({ error: 'CPF do empregador não encontrado' }, { status: 404 })
    }

    const result = await validateProcuracao(employer.cpf)

    // Update employer record with procuracao status
    if (result.valid && result.empId) {
      await supabase
        .from('employers')
        .update({
          esocial_emp_id: result.empId,
          procuracao_valid: true,
          procuracao_validated_at: new Date().toISOString(),
        })
        .eq('id', employer.id)
    }

    await logAudit(
      'esocial_procuracao_validated',
      'esocial',
      { cpf: employer.cpf, valid: result.valid, empId: result.empId },
      request,
      null,
      employer.id
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Procuracao validation error:', error)
    return NextResponse.json(
      { error: 'Erro ao validar procuração' },
      { status: 500 }
    )
  }
}
