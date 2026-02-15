import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedEmployer, notFound, serverError } from '@/lib/api/response'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { generateDaePDF, DaePdfData } from '@/lib/pdf/dae'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = applyRateLimit(request, 'esocial-dae-pdf', RATE_LIMITS.api)
  if (rateLimited) return rateLimited

  try {
    const { id } = await params
    const { error, supabase, employer } = await getAuthenticatedEmployer()
    if (error) return error

    // Fetch employer details separately for PDF
    const { data: empDetails } = await supabase
      .from('employers')
      .select('full_name, cpf')
      .eq('id', employer.id)
      .single()

    const { data: dae } = await supabase
      .from('dae_records')
      .select('*')
      .eq('id', id)
      .eq('employer_id', employer.id)
      .single()

    if (!dae) {
      return notFound('DAE não encontrada')
    }

    const pdfData: DaePdfData = {
      employerName: empDetails?.full_name || 'Empregador',
      employerCpfCnpj: empDetails?.cpf || '',
      referenceMonth: dae.reference_month,
      referenceYear: dae.reference_year,
      dueDate: dae.due_date,
      totalAmount: dae.total_amount,
      barcode: dae.barcode,
      status: dae.status,
      breakdown: dae.breakdown || {
        inssEmpregado: 0,
        inssPatronal: 0,
        gilrat: 0,
        fgtsmensal: 0,
        fgtsAntecipacao: 0,
      },
      employees: dae.employees || [],
    }

    const pdfBuffer = generateDaePDF(pdfData, true)

    const filename = `DAE-${dae.reference_year}-${String(dae.reference_month).padStart(2, '0')}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('DAE PDF generation error:', err)
    return serverError('Erro ao gerar PDF da DAE')
  }
}
