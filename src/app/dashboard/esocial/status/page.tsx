import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Circle, Clock, FileText, Wifi, WifiOff } from 'lucide-react'
import Link from 'next/link'

function getNextDeadline(): Date {
  const now = new Date()
  const deadline = new Date(now.getFullYear(), now.getMonth() + 1, 7)
  return deadline
}

function getDaysUntil(date: Date): number {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  'S-1200': 'Remuneração',
  'S-1210': 'Pagamento',
  'S-2200': 'Cadastramento',
  'S-2206': 'Alteração Contratual',
  'S-2230': 'Afastamento',
  'S-2250': 'Aviso Prévio',
  'S-2299': 'Desligamento',
  'S-2300': 'TSV',
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  draft: { label: 'Rascunho', variant: 'outline' },
  submitted: { label: 'Enviado', variant: 'default' },
  accepted: { label: 'Aceito', variant: 'default' },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
}

export default async function ESocialStatusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('id, esocial_connected')
    .eq('user_id', user.id)
    .single()

  if (!employer?.esocial_connected) {
    redirect('/dashboard/esocial')
  }

  // Current month data
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const currentMonthName = getMonthName(now)
  const deadline = getNextDeadline()
  const daysLeft = getDaysUntil(deadline)

  // Check proxy status
  let proxyConnected = false
  let proxyCheckedAt: string | null = null
  const proxyUrl = process.env.ESOCIAL_PROXY_URL
  const proxyKey = process.env.ESOCIAL_PROXY_API_KEY
  if (proxyUrl && proxyKey) {
    try {
      const res = await fetch(`${proxyUrl}/api/esocial/test`, {
        headers: { 'x-api-key': proxyKey },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      })
      proxyConnected = res.ok
      if (res.ok) {
        proxyCheckedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      }
    } catch {
      proxyConnected = false
    }
  }

  // Fetch real events for current month
  const { data: events } = await supabase
    .from('esocial_events')
    .select('id, event_type, status, employee_id, created_at, submitted_at')
    .eq('employer_id', employer.id)
    .eq('reference_month', currentMonth)
    .eq('reference_year', currentYear)
    .order('created_at', { ascending: false })

  // Fetch DAE for current month
  const { data: daeRecords } = await supabase
    .from('dae_records')
    .select('id, total_amount, due_date, status, breakdown')
    .eq('employer_id', employer.id)
    .eq('reference_month', currentMonth)
    .eq('reference_year', currentYear)
    .order('created_at', { ascending: false })
    .limit(1)

  const dae = daeRecords?.[0] || null

  // Fetch recent events across all months for history
  const { data: recentEvents } = await supabase
    .from('esocial_events')
    .select('id, event_type, status, reference_month, reference_year, created_at')
    .eq('employer_id', employer.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Derive obligations from real data
  const hasS1200 = events?.some((e) => e.event_type === 'S-1200') || false
  const hasS1210 = events?.some((e) => e.event_type === 'S-1210') || false
  const hasDae = !!dae
  const daePaid = dae?.status === 'paid'

  const obligations = [
    { id: 'folha', label: 'Folha de pagamento processada (S-1200)', done: hasS1200 },
    { id: 'pagamento', label: 'Eventos de pagamento gerados (S-1210)', done: hasS1210 },
    { id: 'dae_generated', label: 'DAE gerada', done: hasDae },
    { id: 'dae_paid', label: 'DAE paga', done: daePaid },
  ]

  const MONTHS = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ]

  // Build history from real events
  const history = (recentEvents || []).map((e) => ({
    date: e.created_at,
    action: `${EVENT_TYPE_LABELS[e.event_type] || e.event_type} de ${MONTHS[(e.reference_month || 1) - 1]}/${e.reference_year}`,
    status: e.status as string,
  }))

  // Event summary for current month
  const eventsByType: Record<string, number> = {}
  for (const e of events || []) {
    eventsByType[e.event_type] = (eventsByType[e.event_type] || 0) + 1
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/esocial">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Status Mensal</h1>
          <p className="text-sm text-muted-foreground capitalize">{currentMonthName}</p>
        </div>
      </div>

      {/* Deadline countdown */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Próximo vencimento DAE</p>
                <p className="text-xs text-muted-foreground">
                  {deadline.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <Badge
              variant={daysLeft <= 3 ? 'destructive' : 'secondary'}
              className="text-sm"
            >
              {daysLeft === 0
                ? 'Vence hoje!'
                : daysLeft === 1
                  ? '1 dia restante'
                  : `${daysLeft} dias restantes`}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Proxy status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {proxyConnected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {proxyConnected
                    ? 'Conectado ao eSocial via servidor São Paulo'
                    : 'Desconectado do servidor eSocial'}
                </p>
                {proxyCheckedAt && (
                  <p className="text-xs text-muted-foreground">
                    Última verificação: {proxyCheckedAt}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={proxyConnected ? 'default' : 'destructive'}>
              {proxyConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Event summary for current month */}
      {(events?.length || 0) > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Eventos do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(eventsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{EVENT_TYPE_LABELS[type] || type}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Total: {events?.length || 0} evento(s)
            </p>
          </CardContent>
        </Card>
      )}

      {/* DAE value if exists */}
      {dae && (
        <Card className="mb-6 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor da DAE</p>
                <p className="text-2xl font-bold text-green-700">{formatBRL(dae.total_amount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Vencimento: {new Date(dae.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Badge variant={dae.status === 'paid' ? 'default' : dae.status === 'overdue' ? 'destructive' : 'secondary'}>
                {dae.status === 'paid' ? 'Paga' : dae.status === 'overdue' ? 'Vencida' : 'Gerada'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Obligations checklist */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Obrigações do mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {obligations.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span className={`text-sm ${item.done ? 'text-muted-foreground line-through' : ''}`}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          {!hasS1200 && (
            <div className="mt-4">
              <Link href="/dashboard/esocial/process">
                <Button size="sm">Processar folha agora</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History from real data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico recente</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum evento registrado ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {history.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{item.action}</p>
                      <Badge variant={STATUS_LABELS[item.status]?.variant || 'secondary'} className="text-xs">
                        {STATUS_LABELS[item.status]?.label || item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.date ? new Date(item.date).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
