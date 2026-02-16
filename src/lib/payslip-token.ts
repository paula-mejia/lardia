import { createClient } from '@/lib/supabase/server'

/**
 * Generate a unique token for payslip confirmation and store it in DB.
 */
export async function generatePayslipToken(
  employeeId: string,
  employerId: string,
  month: string // YYYY-MM
): Promise<string> {
  const token = crypto.randomUUID()
  const supabase = await createClient()

  const { error } = await supabase.from('payslip_confirmations').insert({
    employee_id: employeeId,
    employer_id: employerId,
    month,
    token,
  })

  if (error) throw new Error(`Failed to create payslip token: ${error.message}`)
  return token
}

/**
 * Verify a token and return associated data.
 */
export async function verifyPayslipToken(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payslip_confirmations')
    .select('id, employee_id, employer_id, month, confirmed_at, employees(full_name)')
    .eq('token', token)
    .single()

  if (error || !data) return null
  return data
}

/**
 * Confirm receipt of payslip.
 */
export async function confirmPayslip(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payslip_confirmations')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('token', token)
    .is('confirmed_at', null)
    .select('id, confirmed_at')
    .single()

  if (error) return null
  return data
}
