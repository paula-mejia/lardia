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
  ChevronDown,
  ChevronUp,
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

// ===== Source metadata =====

interface SourceMeta {
  label: string
  subtitle: string
  group: 'tribunais_estaduais' | 'tribunais_trabalhistas' | 'sancoes' | 'outros'
}

const SOURCE_META: Record<string, SourceMeta> = {
  tjsp_1grau_cpf:    { label: 'TJSP 1ª instância (CPF)',  subtitle: 'Tribunal de Justiça de São Paulo', group: 'tribunais_estaduais' },
  tjsp_1grau_nome:   { label: 'TJSP 1ª instância (Nome)', subtitle: 'Tribunal de Justiça de São Paulo', group: 'tribunais_estaduais' },
  tjsp_2grau:        { label: 'TJSP 2ª instância',        subtitle: 'Tribunal de Justiça de São Paulo', group: 'tribunais_estaduais' },
  tjrj:              { label: 'TJRJ',                      subtitle: 'Tribunal de Justiça do Rio de Janeiro', group: 'tribunais_estaduais' },
  tjmg:              { label: 'TJMG',                      subtitle: 'Tribunal de Justiça de Minas Gerais', group: 'tribunais_estaduais' },
  tjpr:              { label: 'TJPR',                      subtitle: 'Tribunal de Justiça do Paraná', group: 'tribunais_estaduais' },
  tjba:              { label: 'TJBA',                      subtitle: 'Tribunal de Justiça da Bahia', group: 'tribunais_estaduais' },
  tjpe:              { label: 'TJPE',                      subtitle: 'Tribunal de Justiça de Pernambuco', group: 'tribunais_estaduais' },
  tjdft:             { label: 'TJDFT',                     subtitle: 'Tribunal de Justiça do Distrito Federal', group: 'tribunais_estaduais' },
  tjma:              { label: 'TJMA',                      subtitle: 'Tribunal de Justiça do Maranhão', group: 'tribunais_estaduais' },
  trt2_trabalhista:  { label: 'TRT-2',                     subtitle: 'São Paulo', group: 'tribunais_trabalhistas' },
  trt4_trabalhista:  { label: 'TRT-4',                     subtitle: 'Rio Grande do Sul', group: 'tribunais_trabalhistas' },
  trt5_trabalhista:  { label: 'TRT-5',                     subtitle: 'Bahia', group: 'tribunais_trabalhistas' },
  trt6_trabalhista:  { label: 'TRT-6',                     subtitle: 'Pernambuco', group: 'tribunais_trabalhistas' },
  trt8_trabalhista:  { label: 'TRT-8',                     subtitle: 'Pará / Amapá', group: 'tribunais_trabalhistas' },
  trt9_trabalhista:  { label: 'TRT-9',                     subtitle: 'Paraná', group: 'tribunais_trabalhistas' },
  trt10_trabalhista: { label: 'TRT-10',                    subtitle: 'DF / Tocantins', group: 'tribunais_trabalhistas' },
  trt11_trabalhista: { label: 'TRT-11',                    subtitle: 'Amazonas / Roraima', group: 'tribunais_trabalhistas' },
  trt14_trabalhista: { label: 'TRT-14',                    subtitle: 'Rondônia / Acre', group: 'tribunais_trabalhistas' },
  tst:               { label: 'TST',                       subtitle: 'Tribunal Superior do Trabalho', group: 'tribunais_trabalhistas' },
  ceis:              { label: 'CEIS',                       subtitle: 'Empresas Inidôneas e Suspensas', group: 'sancoes' },
  cnep:              { label: 'CNEP',                       subtitle: 'Empresas Punidas', group: 'sancoes' },
  ceaf:              { label: 'CEAF',                       subtitle: 'Expulsões da Administração Federal', group: 'sancoes' },
  pep:               { label: 'PEP',                        subtitle: 'Pessoa Politicamente Exposta', group: 'sancoes' },
  ofac_sdn:          { label: 'OFAC SDN',                   subtitle: 'Sanções dos EUA', group: 'sancoes' },
  un_sanctions:      { label: 'ONU Sanções',                subtitle: 'Lista Consolidada das Nações Unidas', group: 'sancoes' },
  receita_cpf:       { label: 'Receita Federal',            subtitle: 'Situação Cadastral do CPF', group: 'outros' },
}

const GROUP_LABELS: Record<string, string> = {
  tribunais_estaduais: 'Tribunais Estaduais',
  tribunais_trabalhistas: 'Tribunais Trabalhistas',
  sancoes: 'Listas de Sanções',
  outros: 'Outros',
}

const GROUP_ORDER = ['tribunais_estaduais', 'tribunais_trabalhistas', 'sancoes', 'outros'] as const

// ===== Helpers =====

function StatusIcon({ status }: { status: string }) {
  if (status === 'CLEAN' || status === 'NOT_PEP' || status === 'REGULAR') {
    return <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
  }
  if (status === 'HAS_RECORDS' || status === 'IS_PEP' || status === 'SUSPENDED' || status === 'CANCELLED') {
    return <XCircle className="h-5 w-5 text-red-600 shrink-0" />
  }
  if (status === 'ERROR' || status === 'CAPTCHA_BLOCKED' || status === 'UNAVAILABLE') {
    return <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
  }
  return <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
}

function statusLabel(s: { status: string; count?: number; situacao?: string; note?: string; error?: string }) {
  if (s.status === 'CLEAN' || s.status === 'NOT_PEP') return 'Nada consta'
  if (s.status === 'REGULAR') return 'Regular'
  if (s.status === 'SUSPENDED') return s.situacao || 'Suspensa'
  if (s.status === 'CANCELLED') return s.situacao || 'Cancelada'
  if (s.status === 'HAS_RECORDS') return `${s.count ?? 0} registro${(s.count ?? 0) > 1 ? 's' : ''}`
  if (s.status === 'IS_PEP') return `PEP — ${s.count ?? 0} registro${(s.count ?? 0) > 1 ? 's' : ''}`
  if (s.status === 'CAPTCHA_BLOCKED') return 'Captcha bloqueou'
  if (s.status === 'UNAVAILABLE') return 'Indisponível'
  if (s.status === 'ERROR') return s.error ? `Erro: ${s.error.slice(0, 40)}` : 'Erro'
  return s.status
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatCpfDisplay(cpf: string) {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// ===== Source card =====

function SourceCard({ sourceKey, data }: { sourceKey: string; data: Record<string, unknown> }) {
  const meta = SOURCE_META[sourceKey]
  if (!meta) return null
  const s = data as { status: string; count?: number; situacao?: string; note?: string; error?: string }
  return (
    <div className="flex items-center justify-between py-3 px-4">
      <div className="min-w-0">
        <p className="font-medium text-sm">{meta.label}</p>
        <p className="text-xs text-muted-foreground truncate">{meta.subtitle}</p>
      </div>
      <div className="flex items-center gap-2 text-right whitespace-nowrap shrink-0 ml-3">
        <StatusIcon status={s.status} />
        <span className="text-sm font-medium">{statusLabel(s)}</span>
      </div>
    </div>
  )
}

// ===== Collapsible group =====

function SourceGroup({ groupKey, sources }: { groupKey: string; sources: Array<{ key: string; data: Record<string, unknown> }> }) {
  const [open, setOpen] = useState(true)
  if (sources.length === 0) return null

  const hasIssues = sources.some(s => {
    const st = (s.data as { status: string }).status
    return st === 'HAS_RECORDS' || st === 'IS_PEP' || st === 'SUSPENDED' || st === 'CANCELLED'
  })
  const errorCount = sources.filter(s => {
    const st = (s.data as { status: string }).status
    return st === 'ERROR' || st === 'CAPTCHA_BLOCKED' || st === 'UNAVAILABLE'
  }).length
  const cleanCount = sources.length - errorCount - sources.filter(s => {
    const st = (s.data as { status: string }).status
    return st === 'HAS_RECORDS' || st === 'IS_PEP' || st === 'SUSPENDED' || st === 'CANCELLED'
  }).length

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{GROUP_LABELS[groupKey] || groupKey}</span>
          <span className="text-xs text-muted-foreground">({sources.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {hasIssues && <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Atenção</span>}
          {!hasIssues && cleanCount === sources.length && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Limpo</span>}
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="divide-y">
          {sources.map(s => (
            <SourceCard key={s.key} sourceKey={s.key} data={s.data} />
          ))}
        </div>
      )}
    </Card>
  )
}

// ===== Main page =====

export default function BackgroundCheckResultsPage() {
  return (
    <Suspense fallback={<div><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
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
    if (!id) { setError('ID da consulta não informado'); setLoading(false); return }
    fetch(`/api/background-check/${id}`)
      .then(async (res) => { if (!res.ok) throw new Error('Consulta não encontrada'); return res.json() })
      .then((data) => setCheck(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDownloadPdf() {
    if (!check?.results) return
    const { generateBackgroundCheckPdf } = await import('@/lib/background-check/pdf')
    generateBackgroundCheckPdf(check)
  }

  if (loading) return <div><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  if (error || !check) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6 max-w-lg text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">{error || 'Consulta não encontrada'}</p>
          <Link href="/dashboard/background-check"><Button className="mt-4">Voltar</Button></Link>
        </div>
      </div>
    )
  }

  const r = check.results
  const sources = r?.sources || {}

  // Group sources
  const grouped: Record<string, Array<{ key: string; data: Record<string, unknown> }>> = {}
  for (const g of GROUP_ORDER) grouped[g] = []

  for (const [key, data] of Object.entries(sources)) {
    const meta = SOURCE_META[key]
    if (!meta) continue
    grouped[meta.group]?.push({ key, data: data as Record<string, unknown> })
  }

  // Count totals
  const totalSources = Object.keys(sources).filter(k => SOURCE_META[k]).length
  const issueCount = Object.values(sources).filter(s => {
    const st = (s as { status: string }).status
    return st === 'HAS_RECORDS' || st === 'IS_PEP' || st === 'SUSPENDED' || st === 'CANCELLED'
  }).length

  return (
    <div>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/background-check/history">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Relatório de Verificação</h1>
          </div>
        </div>

        {/* Candidate info */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="font-semibold text-lg">{check.candidate_name}</p>
              <p className="text-sm text-muted-foreground">CPF: {formatCpfDisplay(check.candidate_cpf)}</p>
              <p className="text-sm text-muted-foreground">Consulta realizada em {formatDate(check.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        {!r ? (
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p>Resultados não disponíveis</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary banner */}
            <Card className={`mb-4 border-2 ${issueCount > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  {issueCount > 0
                    ? <XCircle className="h-6 w-6 text-red-600 shrink-0" />
                    : <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />}
                  <div>
                    <p className="font-semibold">
                      {issueCount > 0
                        ? `${issueCount} fonte${issueCount > 1 ? 's' : ''} com registros`
                        : 'Nada consta em nenhuma fonte'}
                    </p>
                    <p className="text-sm text-muted-foreground">{totalSources} fontes consultadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grouped source cards */}
            <div className="space-y-3 mb-4">
              {GROUP_ORDER.map(g => (
                <SourceGroup key={g} groupKey={g} sources={grouped[g]} />
              ))}
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
          <p>Este relatório é informativo. A decisão de contratação é de responsabilidade do empregador.</p>
          <p>A existência de registros não pode ser o único motivo para recusar uma contratação. O uso discriminatório destas informações pode gerar responsabilidade legal.</p>
          <p>Dados consultados conforme LGPD (Lei 13.709/2018) com consentimento do candidato.</p>
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
