import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployeeCards } from '@/components/employee-cards'
import type { EmployeeListItem } from '@/types'

export default async function EmployeesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('id, onboarding_completed')
    .eq('user_id', user.id)
    .single()

  if (!employer?.onboarding_completed) {
    redirect('/dashboard/onboarding')
  }

  let employees: EmployeeListItem[] = []

  if (employer) {
    const { data } = await supabase
      .from('employees')
      .select('id, full_name, role, salary, admission_date, status')
      .eq('employer_id', employer.id)
      .order('created_at', { ascending: false })

    employees = data || []
  }

  return <EmployeeCards employees={employees} />
}
