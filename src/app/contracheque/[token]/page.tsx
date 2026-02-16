import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PayslipConfirmClient from './confirm-client'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-')
  const idx = parseInt(m, 10) - 1
  return `${MONTH_NAMES[idx] || m}/${year}`
}

export default async function PayslipConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('payslip_confirmations')
    .select(`
      id, month, confirmed_at, token,
      employees(full_name),
      payroll_calculations(net_salary)
    `)
    .eq('token', token)
    .single()

  if (!data) notFound()

  const employee = data.employees as unknown as { full_name: string } | null
  // payroll_calculations might not exist or might be array
  const payroll = Array.isArray(data.payroll_calculations)
    ? data.payroll_calculations[0]
    : data.payroll_calculations
  const netSalary = (payroll as { net_salary?: number } | null)?.net_salary

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <PayslipConfirmClient
        token={token}
        employeeName={employee?.full_name || 'Empregado(a)'}
        monthLabel={formatMonthLabel(data.month)}
        netSalary={netSalary ?? null}
        initialConfirmedAt={data.confirmed_at}
      />
    </div>
  )
}
