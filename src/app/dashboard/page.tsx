import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Receipt, Users, AlertTriangle, ArrowRight,
  CheckCircle2, FileText, DollarSign, Wifi, WifiOff,
} from 'lucide-react'

function getGreeting(): string {
  const hour = new Date().getUTCHours() - 3 // BRT approx
  const h = hour < 0 ? hour + 24 : hour
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: employer } = await supabase
    .from('employers')
    .select('id, full_name, onboarding_completed, esocial_connected, esocial_connected_at')
    .eq('user_id', user.id)
    .single()

  if (!employer?.onboarding_completed) redirect('/dashboard/onboarding')

  // Fetch employees
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, status, admission_date, salary')
    .eq('employer_id', employer.id)
    .order('created_at', { ascending: false })

  const activeEmployees = (employees || []).filter(e => e.status === 'active')

  // Fetch recent audit logs
  const { data: recentLogs } = await supabase
    .from('audit_logs')
    .select('id, action, details, created_at')
    .eq('employer_id', employer.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Build alerts
  const alerts: { text: string; type: 'urgent' | 'info' }[] = []
  for (const emp of activeEmployees) {
    if (emp.admission_date) {
      const admission = new Date(emp.admission_date)
      const now = new Date()
      // vacation due after 12 months
      const vacationDue = new Date(admission)
      vacationDue.setFullYear(vacationDue.getFullYear() + 1)
      const daysUntilVacation = Math.ceil((vacationDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilVacation > 0 && daysUntilVacation <= 60) {
        alerts.push({ text: `Férias de ${emp.full_name.split(' ')[0]} vencendo em ${daysUntilVacation} dias`, type: daysUntilVacation <= 30 ? 'urgent' : 'info' })
      }
    }
  }
  if (!employer.esocial_connected) {
    alerts.push({ text: 'eSocial não conectado', type: 'urgent' })
  }

  // Next DAE (placeholder - real DAE data would come from esocial tables)
  const totalSalaries = activeEmployees.reduce((s, e) => s + (e.salary || 0), 0)
  const estimatedDae = totalSalaries * 0.08 // approximate INSS employer portion
  const now = new Date()
  const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 7) // 7th of next month
  const refMonth = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const firstName = employer.full_name?.split(' ')[0] || 'Empregador'
  const greeting = getGreeting()

  const actionLabels: Record<string, { label: string; icon: 'receipt' | 'file' | 'dollar' | 'check' }> = {
    'dae_pdf_generated': { label: 'DAE gerada', icon: 'receipt' },
    'contract_generated': { label: 'Contrato gerado', icon: 'file' },
    'payroll_calculated': { label: 'Folha calculada', icon: 'dollar' },
    'payroll_saved': { label: 'Recibo salvo', icon: 'dollar' },
    'employee_created': { label: 'Empregado cadastrado', icon: 'check' },
    'employee_updated': { label: 'Dados atualizados', icon: 'check' },
    'esocial_event_submitted': { label: 'Evento eSocial enviado', icon: 'check' },
    'esocial_monthly_processed': { label: 'Mensal eSocial processado', icon: 'check' },
    'pdf_generated': { label: 'Recibo gerado', icon: 'file' },
  }

  const iconMap = {
    receipt: <Receipt className="h-4 w-4 text-emerald-500" />,
    file: <FileText className="h-4 w-4 text-blue-500" />,
    dollar: <DollarSign className="h-4 w-4 text-amber-500" />,
    check: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  }

  return (
    <div className="max-w-6xl space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {greeting}, {firstName}!
        </h1>
        <p className="text-muted-foreground text-lg mt-1">
          Aqui está o resumo dos seus empregados hoje.
        </p>
      </div>

      {/* Top 3 cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Próximo Vencimento */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Receipt className="h-4 w-4" />
            <span className="text-sm font-medium">Próximo Vencimento</span>
          </div>
          {activeEmployees.length > 0 ? (
            <>
              <p className="text-4xl font-extrabold tracking-tight">{formatCurrency(estimatedDae)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ref. {refMonth} · Vence {formatDate(dueDate.toISOString())}
              </p>
              <Link href="/dashboard/esocial/dae" className="mt-4 block">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                  Pagar Agora
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Cadastre um empregado para ver valores.</p>
          )}
        </Card>

        {/* Empregados Ativos */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Empregados Ativos</span>
          </div>
          <p className="text-4xl font-extrabold tracking-tight">{activeEmployees.length}</p>
          {activeEmployees.length > 0 && (
            <div className="flex -space-x-2 mt-3">
              {activeEmployees.slice(0, 5).map((emp) => (
                <div
                  key={emp.id}
                  className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium flex items-center justify-center border-2 border-white"
                  title={emp.full_name}
                >
                  {getInitials(emp.full_name)}
                </div>
              ))}
              {activeEmployees.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center border-2 border-white">
                  +{activeEmployees.length - 5}
                </div>
              )}
            </div>
          )}
          <Link href="/dashboard/employees" className="mt-4 block">
            <Button variant="outline" className="w-full">
              Gerenciar Empregados
            </Button>
          </Link>
        </Card>

        {/* Alertas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Alertas</span>
          </div>
          {alerts.length > 0 ? (
            <ul className="space-y-2">
              {alerts.slice(0, 4).map((alert, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${alert.type === 'urgent' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  {alert.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum alerta no momento. 🎉</p>
          )}
        </Card>
      </div>

      {/* Bottom two columns */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Atividades Recentes */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-base">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentLogs && recentLogs.length > 0 ? (
              <ul className="space-y-4">
                {recentLogs.map((log) => {
                  const info = actionLabels[log.action] || { label: log.action, icon: 'check' as const }
                  return (
                    <li key={log.id} className="flex items-start gap-3">
                      <div className="mt-0.5">{iconMap[info.icon]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{info.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(log.created_at)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
            )}
          </CardContent>
        </Card>

        {/* Status eSocial */}
        <Card className="p-6 bg-slate-900 text-white border-slate-800">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-base text-white">Status eSocial</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <div className="flex items-center gap-2">
              {employer.esocial_connected ? (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-400">eSocial Conectado</span>
                </>
              ) : (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="text-sm font-medium text-red-400">eSocial Desconectado</span>
                </>
              )}
            </div>

            <div className="text-sm text-slate-400 space-y-1">
              <p>
                Última sincronização:{' '}
                {employer.esocial_connected_at
                  ? formatDate(employer.esocial_connected_at)
                  : '—'}
              </p>
              <p>
                Procuração:{' '}
                <Badge variant="outline" className={employer.esocial_connected ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-400'}>
                  {employer.esocial_connected ? 'Ativa' : 'Pendente'}
                </Badge>
              </p>
            </div>

            <Link href="/dashboard/esocial">
              <Button variant="outline" size="sm" className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                Ver Detalhes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
