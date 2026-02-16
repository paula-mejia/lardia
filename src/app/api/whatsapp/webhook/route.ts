import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { validateBrazilianPhone } from '@/lib/whatsapp'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'

// Service role client for webhook (no user session)
function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

// Twilio sends webhook as application/x-www-form-urlencoded
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const from = formData.get('From') as string | null // e.g. whatsapp:+5511999998888
    const body = (formData.get('Body') as string | null)?.trim().toLowerCase() || ''

    if (!from) {
      return new NextResponse('<Response></Response>', {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Extract phone number from whatsapp:+XXXXX format
    const phoneRaw = from.replace('whatsapp:', '')
    const normalizedPhone = validateBrazilianPhone(phoneRaw)

    if (!normalizedPhone) {
      return new NextResponse('<Response></Response>', {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Check for confirmation keywords
    const confirmationKeywords = ['sim', 'confirmo', 'confirmado', 'ok']
    const isConfirmation = confirmationKeywords.some((kw) => body.includes(kw))

    if (!isConfirmation) {
      // Not a confirmation message — ignore for now
      return new NextResponse('<Response></Response>', {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const supabase = getServiceSupabase()

    // Find employee by phone number
    const { data: employee } = await supabase
      .from('employees')
      .select('id, full_name, employer_id, phone')
      .eq('phone', normalizedPhone)
      .single()

    if (!employee) {
      // Try without the +55 prefix variations
      const { data: employeeAlt } = await supabase
        .from('employees')
        .select('id, full_name, employer_id, phone')
        .ilike('phone', `%${normalizedPhone.slice(-11)}%`)
        .single()

      if (!employeeAlt) {
        return new NextResponse('<Response></Response>', {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        })
      }

      // Use the alternative match
      return await processConfirmation(supabase, employeeAlt, normalizedPhone)
    }

    return await processConfirmation(supabase, employee, normalizedPhone)
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}

async function processConfirmation(
  supabase: ReturnType<typeof getServiceSupabase>,
  employee: { id: string; full_name: string; employer_id: string; phone: string | null },
  phoneNumber: string
) {
  // Current month as YYYY-MM
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Check if already confirmed this month
  const { data: existing } = await supabase
    .from('payslip_confirmations')
    .select('id')
    .eq('employee_id', employee.id)
    .eq('month', month)
    .single()

  if (existing) {
    // Already confirmed
    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  // Record confirmation
  await supabase.from('payslip_confirmations').insert({
    employee_id: employee.id,
    employer_id: employee.employer_id,
    month,
    confirmed_at: new Date().toISOString(),
    phone_number: phoneNumber,
  })

  // Notify employer
  const { data: employer } = await supabase
    .from('employers')
    .select('phone, full_name')
    .eq('id', employee.employer_id)
    .single()

  if (employer?.phone) {
    const msg = `✅ ${employee.full_name} confirmou o recebimento do salário de ${month}`
    await sendWhatsAppMessage(employer.phone, msg)
  }

  return new NextResponse('<Response></Response>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}
