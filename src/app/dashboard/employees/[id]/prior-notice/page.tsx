import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PriorNoticePageClient from './prior-notice-page-client'

export default async function EmployeePriorNoticePage({
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
      employers!inner(user_id, full_name, cpf, address_city, address_state)
    `)
    .eq('id', id)
    .single()

  if (!employee) notFound()

  const employer = employee.employers as unknown as {
    full_name: string
    cpf: string
    address_city: string
    address_state: string
  }

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
          <p className="text-sm text-muted-foreground">Aviso Previo</p>
        </div>
      </div>

      <PriorNoticePageClient
        employeeName={employee.full_name}
        employeeCpf={employee.cpf || ''}
        employeeRole={employee.role || ''}
        admissionDate={employee.admission_date}
        employerName={employer.full_name || ''}
        employerCpf={employer.cpf || ''}
        city={employer.address_city ? `${employer.address_city}/${employer.address_state || ''}` : ''}
      />
    </div>
  )
}
