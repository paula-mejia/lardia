'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Shield, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface CheckSummary {
  id: string
  candidate_name: string
  candidate_cpf: string
  status: string
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatCpfMasked(cpf: string) {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return `***.***.${d.slice(6, 9)}-${d.slice(9)}`
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    completed: { label: 'Concluida', variant: 'default' },
    pending: { label: 'Pendente', variant: 'secondary' },
    failed: { label: 'Falhou', variant: 'destructive' },
  }
  const config = map[status] || map.pending
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default function BackgroundCheckHistoryPage() {
  const [checks, setChecks] = useState<CheckSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/background-check/history')
      .then((res) => res.json())
      .then((data) => setChecks(data.checks || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Histórico de Verificações</h1>
            </div>
          </div>
          <Link href="/dashboard/background-check">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : checks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                Nenhuma verificação realizada ainda.
              </p>
              <Link href="/dashboard/background-check">
                <Button>Realizar Primeira Consulta</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {checks.map((check) => (
              <Link
                key={check.id}
                href={`/dashboard/background-check/results?id=${check.id}`}
              >
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{check.candidate_name}</p>
                        <p className="text-sm text-muted-foreground">
                          CPF: {formatCpfMasked(check.candidate_cpf)} | {formatDate(check.created_at)}
                        </p>
                      </div>
                      {statusBadge(check.status)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
