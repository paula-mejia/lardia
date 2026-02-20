'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle, AlertTriangle, Clock, Users, FileText,
  ArrowLeft, Play, Receipt, Eye, Wifi, WifiOff,
  ChevronRight, CalendarDays,
} from 'lucide-react'

interface DashboardData {
  connection: { connected: boolean; connectedAt: string | null }
  summary: {
    employees: number
    eventsGenerated: number
    eventsSent: number
    eventsPending: number
    eventsError: number
    dae: { status: string; dueDate: string; totalAmount: number } | null
  }
  timeline: {
    month: number
    year: number
    eventsTotal: number
    eventsSent: number
    status: 'ok' | 'pendente' | 'atrasado' | 'vazio'
    daeStatus: string | null
  }[]
  nextActions: { label: string; type: 'warning' | 'info' | 'action' }[]
  currentMonth: number
  currentYear: number
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-6" />
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-32 bg-muted rounded-lg mt-4" />
    </div>
  )
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function statusIcon(status: string) {
  switch (status) {
    case 'ok': return <CheckCircle className="h-4 w-4 text-emerald-500" />
    case 'pendente': return <Clock className="h-4 w-4 text-yellow-600" />
    case 'atrasado': return <AlertTriangle className="h-4 w-4 text-red-600" />
    default: return <div className="h-4 w-4 rounded-full bg-muted" />
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'ok': return <Badge className="bg-emerald-100 text-emerald-600 text-xs">Tudo ok</Badge>
    case 'pendente': return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pendente</Badge>
    case 'atrasado': return <Badge className="bg-red-100 text-red-800 text-xs">Atrasado</Badge>
    default: return <Badge variant="secondary" className="text-xs">Sem dados</Badge>
  }
}

export default function ESocialDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/esocial/dashboard')
      .then(r => {
        if (!r.ok) throw new Error('Erro ao carregar dados')
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <p className="text-red-600">{error || 'Erro ao carregar dashboard'}</p>
      </div>
    )
  }

  const { connection, summary, timeline, nextActions, currentMonth, currentYear } = data

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">eSocial</h1>
          <p className="text-sm text-muted-foreground">
            Painel de conformidade — {monthNames[currentMonth - 1]} {currentYear}
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connection.connected ? (
                <>
                  <Wifi className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-medium text-sm">Procuração ativa</p>
                    <p className="text-xs text-muted-foreground">
                      Conectado desde {connection.connectedAt
                        ? new Date(connection.connectedAt).toLocaleDateString('pt-BR')
                        : '—'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Não conectado</p>
                    <p className="text-xs text-muted-foreground">Conecte a procuração para operar</p>
                  </div>
                </>
              )}
            </div>
            <Link href={connection.connected ? '/dashboard/esocial/status' : '/dashboard/esocial/connect'}>
              <Button variant="outline" size="sm">
                {connection.connected ? 'Ver status' : 'Conectar'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{summary.employees}</p>
            <p className="text-xs text-muted-foreground">Empregados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{summary.eventsGenerated}</p>
            <p className="text-xs text-muted-foreground">Eventos gerados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold">{summary.eventsSent}</p>
            <p className="text-xs text-muted-foreground">Enviados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Receipt className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            {summary.dae ? (
              <>
                <p className="text-2xl font-bold">
                  R$ {summary.dae.totalAmount.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-xs text-muted-foreground">
                  DAE — {summary.dae.status === 'pago' ? 'Pago' : 'Pendente'}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">DAE</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Actions */}
      {nextActions.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Próximas ações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nextActions.map((action, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
                  action.type === 'warning'
                    ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
                    : 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                }`}
              >
                {action.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                {action.label}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ações rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/esocial/process">
              <Button size="sm" className="gap-1">
                <Play className="h-3 w-3" /> Processar mês
              </Button>
            </Link>
            <Link href="/dashboard/esocial/dae">
              <Button size="sm" variant="outline" className="gap-1">
                <Receipt className="h-3 w-3" /> Gerar DAE
              </Button>
            </Link>
            <Link href="/dashboard/esocial/events">
              <Button size="sm" variant="outline" className="gap-1">
                <Eye className="h-3 w-3" /> Ver eventos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Últimos 6 meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeline.map((m) => (
              <div
                key={`${m.year}-${m.month}`}
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {statusIcon(m.status)}
                  <span className="text-sm font-medium">
                    {monthNames[m.month - 1]} {m.year}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {m.eventsTotal > 0
                      ? `${m.eventsSent}/${m.eventsTotal} enviados`
                      : 'Sem eventos'}
                  </span>
                  {statusLabel(m.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
