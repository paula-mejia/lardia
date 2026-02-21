'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft, RefreshCw, ChevronDown, ChevronUp, Loader2, FileText,
} from 'lucide-react'

interface ESocialEvent {
  id: string
  event_type: string
  status: string
  reference_month: number
  reference_year: number
  event_data: Record<string, unknown> | null
  created_at: string
  submitted_at: string | null
  employee_id: string | null
}

const EVENT_TYPES = [
  'S-1200', 'S-1210', 'S-2200', 'S-2206', 'S-2230', 'S-2250', 'S-2299', 'S-2300',
]

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'erro', label: 'Erro' },
  { value: 'processando', label: 'Processando' },
]

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function statusBadge(status: string) {
  switch (status) {
    case 'pendente':
      return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
    case 'enviado':
      return <Badge className="bg-emerald-100 text-emerald-600">Enviado</Badge>
    case 'erro':
      return <Badge className="bg-red-100 text-red-800">Erro</Badge>
    case 'processando':
      return <Badge className="bg-blue-100 text-blue-800">Processando</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function EventsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-muted rounded-lg" />
      ))}
    </div>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<ESocialEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const now = new Date()
  const [filterMonth, setFilterMonth] = useState<string>('')
  const [filterYear, setFilterYear] = useState<string>(String(now.getFullYear()))
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')

  const fetchEvents = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterMonth) params.set('month', filterMonth)
    if (filterYear) params.set('year', filterYear)
    if (filterStatus) params.set('status', filterStatus)
    if (filterType) params.set('type', filterType)

    fetch(`/api/esocial/events?${params}`)
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [filterMonth, filterYear, filterStatus, filterType])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  async function handleRetry(eventId: string) {
    setRetrying(eventId)
    try {
      const res = await fetch(`/api/esocial/events/${eventId}/retry`, { method: 'POST' })
      if (res.ok) {
        setEvents(prev => prev.map(e =>
          e.id === eventId ? { ...e, status: 'pendente' } : e
        ))
      }
    } catch {
      // ignore
    } finally {
      setRetrying(null)
    }
  }

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i)

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/esocial">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Eventos eSocial</h1>
          <p className="text-sm text-muted-foreground">
            Histórico e gerenciamento de eventos
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={filterMonth} onValueChange={v => setFilterMonth(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {monthNames.map((name, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={v => setFilterType(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {EVENT_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={v => setFilterStatus(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Eventos ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <EventsSkeleton />
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum evento encontrado com os filtros selecionados.
            </p>
          ) : (
            <div className="space-y-1">
              {events.map(event => (
                <div key={event.id} className="border rounded-lg">
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className="shrink-0 font-mono text-xs">
                        {event.event_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground truncate">
                        {monthNames[event.reference_month - 1]} {event.reference_year}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(event.status)}
                      {expandedId === event.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedId === event.id && (
                    <div className="px-4 pb-4 border-t bg-muted/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">ID</p>
                          <p className="font-mono text-xs">{event.id}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Criado em</p>
                          <p>{new Date(event.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                        {event.submitted_at && (
                          <div>
                            <p className="text-muted-foreground">Enviado em</p>
                            <p>{new Date(event.submitted_at).toLocaleString('pt-BR')}</p>
                          </div>
                        )}
                        {event.employee_id && (
                          <div>
                            <p className="text-muted-foreground">Empregado ID</p>
                            <p className="font-mono text-xs">{event.employee_id}</p>
                          </div>
                        )}
                      </div>

                      {event.event_data && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-1">Dados do evento</p>
                          <pre className="text-xs bg-background border rounded p-3 overflow-x-auto max-h-60">
                            {JSON.stringify(event.event_data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {event.status === 'erro' && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetry(event.id)}
                            disabled={retrying === event.id}
                            className="gap-1"
                          >
                            {retrying === event.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                            Reenviar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
