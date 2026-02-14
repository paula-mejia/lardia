import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Circle, Clock, FileText, Wifi, WifiOff } from 'lucide-react'
import Link from 'next/link'

// Get the deadline for DAE payment (7th of next month, or next business day)
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

  const now = new Date()
  const currentMonth = getMonthName(now)
  const deadline = getNextDeadline()
  const daysLeft = getDaysUntil(deadline)

  // Mock obligations status - in production, this would come from the DB
  const obligations = [
    {
      id: 'folha',
      label: 'Folha de pagamento fechada',
      done: false,
    },
    {
      id: 'dae_generated',
      label: 'DAE gerada',
      done: false,
    },
    {
      id: 'dae_paid',
      label: 'DAE paga',
      done: false,
    },
  ]

  // Mock history
  const history = [
    {
      date: '2026-01-07',
      action: 'DAE de janeiro/2026 paga',
      status: 'success' as const,
    },
    {
      date: '2026-01-05',
      action: 'DAE de janeiro/2026 gerada',
      status: 'success' as const,
    },
    {
      date: '2025-12-30',
      action: 'Folha de dezembro/2025 fechada',
      status: 'success' as const,
    },
  ]

  return (
    <>
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
            <p className="text-sm text-muted-foreground capitalize">
              {currentMonth}
            </p>
          </div>
        </div>

        {/* Deadline countdown */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Proximo vencimento DAE</p>
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
                      ? 'Conectado ao eSocial via servidor Sao Paulo'
                      : 'Desconectado do servidor eSocial'}
                  </p>
                  {proxyCheckedAt && (
                    <p className="text-xs text-muted-foreground">
                      Ultima verificação: {proxyCheckedAt}
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

        {/* Obligations checklist */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Obrigacoes do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {obligations.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      item.done ? 'text-muted-foreground line-through' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historico de ações</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma acao registrada ainda.
              </p>
            ) : (
              <ul className="space-y-3">
                {history.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
