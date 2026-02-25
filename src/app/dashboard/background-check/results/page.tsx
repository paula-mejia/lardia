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
          <div className="flex items-center gap-2 text-right whitespace-nowrap">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Relatório de Verificação</h1>
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
                      <p className="font-medium">Situação do CPF</p>
                      <p className="text-sm text-muted-foreground">Receita Federal</p>
                    </div>
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
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
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
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
                      <p className="text-sm text-muted-foreground">Tribunal de Justiça de São Paulo</p>
                    </div>
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
                      <StatusIcon ok={!r.criminal_records.has_records} />
                      <span className="font-medium">
                        {r.criminal_records.has_records
                          ? 'Registros encontrados'
                          : 'Nada consta'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lawsuits - Cível */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Processos cíveis</p>
                      <p className="text-sm text-muted-foreground">Tribunal de Justiça de São Paulo</p>
                    </div>
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
                      <StatusIcon ok={!r.lawsuits.has_lawsuits} />
                      <span className="font-medium">
                        {r.lawsuits.has_lawsuits
                          ? `${r.lawsuits.count} processo${r.lawsuits.count > 1 ? 's' : ''}`
                          : 'Nada consta'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lawsuits - Trabalhista */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Processos trabalhistas</p>
                      <p className="text-sm text-muted-foreground">TRT 2ª Região - São Paulo</p>
                    </div>
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
                      <StatusIcon ok={!r.labor_lawsuits?.has_records} />
                      <span className="font-medium">
                        {r.labor_lawsuits?.has_records
                          ? `${r.labor_lawsuits.count} processo${r.labor_lawsuits.count > 1 ? 's' : ''}`
                          : 'Nada consta'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TJRJ */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Processos cíveis - RJ</p>
                      <p className="text-sm text-muted-foreground">Tribunal de Justiça do Rio de Janeiro</p>
                    </div>
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
                      <StatusIcon ok={!r.tjrj?.has_records} />
                      <span className="font-medium">
                        {r.tjrj?.has_records
                          ? `${r.tjrj.count} processo${r.tjrj.count > 1 ? 's' : ''}`
                          : 'Nada consta'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TJMG */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Processos cíveis - MG</p>
                      <p className="text-sm text-muted-foreground">Tribunal de Justiça de Minas Gerais</p>
                    </div>
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
                      <StatusIcon ok={!r.tjmg?.has_records} />
                      <span className="font-medium">
                        {r.tjmg?.has_records
                          ? `${r.tjmg.count} processo${r.tjmg.count > 1 ? 's' : ''}`
                          : 'Nada consta'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TJPR */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Processos cíveis - PR</p>
                      <p className="text-sm text-muted-foreground">Tribunal de Justiça do Paraná</p>
                    </div>
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
                      <StatusIcon ok={!r.tjpr?.has_records} />
                      <span className="font-medium">
                        {r.tjpr?.has_records
                          ? `${r.tjpr.count} processo${r.tjpr.count > 1 ? 's' : ''}`
                          : 'Nada consta'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CEIS */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sanções governamentais</p>
                      <p className="text-sm text-muted-foreground">CEIS - Empresas Inidôneas e Suspensas</p>
                    </div>
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
                      <StatusIcon ok={r.ceis?.status !== 'HAS_RECORDS'} />
                      <span className="font-medium">
                        {r.ceis?.status === 'HAS_RECORDS'
                          ? `${r.ceis.count} registro${r.ceis.count > 1 ? 's' : ''}`
                          : 'Nada consta'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CNEP */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Empresas punidas</p>
                      <p className="text-sm text-muted-foreground">CNEP - Cadastro Nacional</p>
                    </div>
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
                      <StatusIcon ok={r.cnep?.status !== 'HAS_RECORDS'} />
                      <span className="font-medium">
                        {r.cnep?.status === 'HAS_RECORDS'
                          ? `${r.cnep.count} registro${r.cnep.count > 1 ? 's' : ''}`
                          : 'Nada consta'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CEAF */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Expulsões federais</p>
                      <p className="text-sm text-muted-foreground">CEAF - Administração Federal</p>
                    </div>
                    <div className="flex items-center gap-2 text-right whitespace-nowrap">
                      <StatusIcon ok={r.ceaf?.status !== 'HAS_RECORDS'} />
                      <span className="font-medium">
                        {r.ceaf?.status === 'HAS_RECORDS'
                          ? `${r.ceaf.count} registro${r.ceaf.count > 1 ? 's' : ''}`
                          : 'Nada consta'}
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
                      <p className="font-medium">Situação de crédito</p>
                      <p className="text-sm text-muted-foreground">Consulta de restricoes</p>
                    </div>
                    <CreditLight status={r.credit_score?.status ?? 'unavailable'} />
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
            Este relatório é informativo. A decisão de contratação é de responsabilidade
            do empregador.
          </p>
          <p>
            A existencia de registros não pode ser o único motivo para recusar uma
            contratação. O uso discriminatório destas informações pode gerar
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
