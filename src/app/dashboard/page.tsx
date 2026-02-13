import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'
import { EmployeeList } from '@/components/employee-list'
import { Button } from '@/components/ui/button'
import { Plus, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get employer profile
  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Get employees if employer exists
  let employees: Array<{
    id: string
    full_name: string
    role: string
    salary: number
    admission_date: string
    status: string
  }> = []

  if (employer) {
    const { data } = await supabase
      .from('employees')
      .select('id, full_name, role, salary, admission_date, status')
      .eq('employer_id', employer.id)
      .order('created_at', { ascending: false })

    employees = data || []
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lardia</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <Link href="/dashboard/calendar">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              Calendario
            </Button>
          </Link>
        </div>

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
              Você ainda não cadastrou nenhuma empregada.
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
    </main>
  )
}
