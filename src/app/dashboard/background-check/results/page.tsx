'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import type { BackgroundCheckResult } from '@/lib/background-check/service'

interface CheckRecord {
  id: string
  candidate_name: string
  candidate_cpf: string
  candidate_dob: string
  status: string
  results: BackgroundCheckResult | null
  created_at: string
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
  ) : (
    <XCircle className="h-5 w-5 text-red-600 shrink-0" />
  )
}

function CreditLight({ status }: { status: string }) {
  const colors = {
    limpo: { bg: 'bg-green-500', label: 'Limpo', ring: 'ring-green-200' },
    negativado: { bg: 'bg-red-500', label: 'Negativado', ring: 'ring-red-200' },
  }
  const config = colors[status as keyof typeof colors] || colors.limpo

  return (
    <div className="flex items-center gap-3">
      <div className={`h-4 w-4 rounded-full ${config.bg} ring-4 ${config.ring}`} />
      <span className="font-medium">{config.label}</span>
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCpfDisplay(cpf: string) {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export default function BackgroundCheckResultsPage() {
  return (
    <Suspense fallback={
      <div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BackgroundCheckResultsContent />
    </Suspense>
  )
}

function BackgroundCheckResultsContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [check, setCheck] = useState<CheckRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('ID da consulta não informado')
      setLoading(false)
      return
    }

    fetch(`/api/background-check/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Consulta não encontrada')
        return res.json()
      })
      .then((data) => setCheck(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDownloadPdf() {
    if (!check?.results) return
    const { generateBackgroundCheckPdf } = await import('@/lib/background-check/pdf')
    generateBackgroundCheckPdf(check)
  }

  if (loading) {
    return (
      <div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !check) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6 max-w-lg text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">{error || 'Consulta não encontrada'}</p>
          <Link href="/dashboard/background-check">
            <Button className="mt-4">Voltar</Button>
          </Link>
        </div>
      </div>
    )
  }

  const r = check.results

  return (
    <div>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/background-check/history">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Relatorio de Verificação</h1>
          </div>
        </div>

        {/* Candidate info card */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="font-semibold text-lg">{check.candidate_name}</p>
              <p className="text-sm text-muted-foreground">
                CPF: {formatCpfDisplay(check.candidate_cpf)}
              </p>
              <p className="text-sm text-muted-foreground">
                Consulta realizada em {formatDate(check.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        {!r ? (
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p>Resultados não disponiveis</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results */}
            <div className="space-y-3 mb-4">
              {/* CPF Status */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Situacao do CPF</p>
                      <p className="text-sm text-muted-foreground">Receita Federal</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon ok={r.cpf_status === 'regular'} />
                      <span className="font-medium capitalize">{r.cpf_status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Name match */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Conferencia de nome</p>
                      <p className="text-sm text-muted-foreground">Nome vinculado ao CPF</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon ok={r.name_match} />
                      <span className="font-medium">
                        {r.name_match ? 'Confere' : 'Divergente'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Criminal records */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Antecedentes criminais</p>
                      <p className="text-sm text-muted-foreground">Bases publicas federais e estaduais</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon ok={!r.criminal_records.has_records} />
                      <span className="font-medium">
                        {r.criminal_records.has_records
                          ? 'Registros encontrados'
                          : 'Nenhum registro encontrado'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lawsuits */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Processos judiciais</p>
                      <p className="text-sm text-muted-foreground">Tribunais de justica</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon ok={!r.lawsuits.has_lawsuits} />
                      <span className="font-medium">
                        {r.lawsuits.has_lawsuits
                          ? `${r.lawsuits.count} processo${r.lawsuits.count > 1 ? 's' : ''} encontrado${r.lawsuits.count > 1 ? 's' : ''}`
                          : 'Nenhum processo'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit score */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Situacao de credito</p>
                      <p className="text-sm text-muted-foreground">Consulta de restricoes</p>
                    </div>
                    <CreditLight status={r.credit_score.status} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Download PDF */}
            <Button onClick={handleDownloadPdf} variant="outline" className="w-full mb-4">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          </>
        )}

        {/* Disclaimer */}
        <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-2">
          <p>
            Este relatorio e informativo. A decisao de contratação é de responsabilidade
            do empregador.
          </p>
          <p>
            A existencia de registros não pode ser o único motivo para recusar uma
            contratação. O uso discriminatorio destas informações pode gerar
            responsabilidade legal.
          </p>
          <p>
            Dados consultados conforme LGPD (Lei 13.709/2018) com consentimento do candidato.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Link href="/dashboard/background-check" className="flex-1">
            <Button variant="outline" className="w-full">Nova Consulta</Button>
          </Link>
          <Link href="/dashboard/background-check/history" className="flex-1">
            <Button variant="outline" className="w-full">Histórico</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
