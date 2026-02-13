import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PayrollPageClient from './payroll-page-client'

export default async function EmployeePayrollPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: employee } = await supabase
    .from('employees')
    .select(`
      id, full_name, cpf, salary, role, admission_date,
      employer_id,
      employers!inner(user_id, full_name)
    `)
    .eq('id', id)
    .single()

  if (!employee) notFound()

  const employer = employee.employers as unknown as { user_id: string; full_name: string }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{employee.full_name}</h1>
            <p className="text-sm text-muted-foreground">{employee.role}</p>
          </div>
        </div>

        <PayrollPageClient
          initialSalary={employee.salary}
          employeeId={employee.id}
          employeeName={employee.full_name}
          employeeCpf={employee.cpf}
          employerName={employer.full_name}
        />
      </div>
    </main>
  )
}
