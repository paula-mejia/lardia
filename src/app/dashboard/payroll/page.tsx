import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PayrollClient from './payroll-client'

export default async function PayrollPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employer } = await supabase
    .from('employers')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single()

  if (!employer) redirect('/dashboard/onboarding')

  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, cpf, role, salary, admission_date, status')
    .eq('employer_id', employer.id)
    .eq('status', 'active')
    .order('full_name')

  return (
    <PayrollClient
      employees={employees || []}
      employerName={employer.full_name}
    />
  )
}
