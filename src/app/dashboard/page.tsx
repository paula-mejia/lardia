import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployeeList } from '@/components/employee-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { EmployeeListItem } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get employer profile
  const { data: employer } = await supabase
    .from('employers')
    .select('id, onboarding_completed')
    .eq('user_id', user.id)
    .single()

  // Redirect to onboarding if not completed
  if (!employer?.onboarding_completed) {
    redirect('/dashboard/onboarding')
  }

  // Get employees if employer exists
  let employees: EmployeeListItem[] = []

  if (employer) {
    const { data } = await supabase
      .from('employees')
      .select('id, full_name, role, salary, admission_date, status')
      .eq('employer_id', employer.id)
      .order('created_at', { ascending: false })

    employees = data || []
  }

  return (
    <div className="max-w-2xl">
      {/* Employees section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Empregadas</h2>
        <Link href="/dashboard/employees/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Cadastrar
          </Button>
        </Link>
      </div>

      {employees.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Voce ainda nao cadastrou nenhuma empregada.
          </p>
          <Link href="/dashboard/employees/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar primeira empregada
            </Button>
          </Link>
        </div>
      ) : (
        <EmployeeList employees={employees} />
      )}
    </div>
  )
}
