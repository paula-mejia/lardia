import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import VacationPageClient from './vacation-page-client'

export default async function EmployeeVacationPage({
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
      id, full_name, salary, role, admission_date,
      employer_id,
      employers!inner(user_id)
    `)
    .eq('id', id)
    .single()

  if (!employee) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/employees/${id}/payroll`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{employee.full_name}</h1>
          <p className="text-sm text-muted-foreground">Ferias</p>
        </div>
      </div>

      <VacationPageClient
        initialSalary={employee.salary}
        employeeId={employee.id}
        employeeName={employee.full_name}
        admissionDate={employee.admission_date}
      />
    </div>
  )
}
