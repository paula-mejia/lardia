'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  FileText,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

interface DaeRecord {
  id: string
  reference_month: number
  reference_year: number
  total_amount: number
  due_date: string
  status: string
  barcode: string
  generated_at: string
  paid_at: string | null
  breakdown: {
    inssEmpregado: number
    inssPatronal: number
    gilrat: number
    fgtsmensal: number
    fgtsAntecipacao: number
    irrf?: number
    seguroAcidente?: number
  }
  employees: Array<{
    employeeName: string
    grossSalary: number
    inssEmpregado: number
    daeContribution: number
  }>
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function getEffectiveStatus(status: string, dueDate: string): string {
  if (status === 'paid') return 'paid'
  const due = new Date(dueDate + 'T23:59:59')
  if (due < new Date()) return 'overdue'
  return 'generated'
}

function StatusBadge({ status, dueDate }: { status: string; dueDate: string }) {
  const effective = getEffectiveStatus(status, dueDate)
  switch (effective) {
    case 'paid':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Paga
        </Badge>
      )
    case 'overdue':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Vencida
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 border-amber-300">
          <Clock className="h-3 w-3" />
          Pendente
        </Badge>
      )
  }
}

function DaeCard({ dae }: { dae: DaeRecord }) {
  const [expanded, setExpanded] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadPdf(e: React.MouseEvent) {
    e.stopPropagation()
    setDownloading(true)
    try {
      const res = await fetch(`/api/esocial/dae/${dae.id}/pdf`)
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DAE-${dae.reference_year}-${String(dae.reference_month).padStart(2, '0')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: open in new tab
      window.open(`/api/esocial/dae/${dae.id}/pdf`, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  const effective = getEffectiveStatus(dae.status, dae.due_date)
  const borderColor =
    effective === 'paid'
      ? 'border-l-green-500'
      : effective === 'overdue'
        ? 'border-l-red-500'
        : 'border-l-amber-500'

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${borderColor}`}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="pt-6">
        {/* Summary row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-lg p-2">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-base">
                {MONTHS[dae.reference_month - 1]} {dae.reference_year}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Vencimento: {formatDateBR(dae.due_date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-xl">{formatBRL(dae.total_amount)}</p>
            </div>
            <StatusBadge status={dae.status} dueDate={dae.due_date} />
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded breakdown */}
        {expanded && (
          <div className="mt-5 pt-4 border-t space-y-5">
            {/* Cost breakdown */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Composição do Recolhimento
              </h4>
              <div className="space-y-2">
                <BreakdownRow label="INSS Empregado" value={dae.breakdown.inssEmpregado} />
                <BreakdownRow label="INSS Patronal (8%)" value={dae.breakdown.inssPatronal} />
                <BreakdownRow label="GILRAT / Seguro Acidente (0,8%)" value={dae.breakdown.gilrat} />
                <BreakdownRow label="FGTS Mensal (8%)" value={dae.breakdown.fgtsmensal} />
                <BreakdownRow label="FGTS Antecipação (3,2%)" value={dae.breakdown.fgtsAntecipacao} />
                {dae.breakdown.irrf != null && dae.breakdown.irrf > 0 && (
                  <BreakdownRow label="IRRF" value={dae.breakdown.irrf} />
                )}
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>Total</span>
                  <span>{formatBRL(dae.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Employee detail */}
            {dae.employees && dae.employees.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Empregados
                </h4>
                <div className="space-y-1">
                  {dae.employees.map((emp, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm py-2 px-3 rounded-md bg-muted/50"
                    >
                      <span className="font-medium">{emp.employeeName}</span>
                      <div className="flex gap-4 text-muted-foreground">
                        <span>Salário: {formatBRL(emp.grossSalary)}</span>
                        <span className="font-medium text-foreground">
                          DAE: {formatBRL(emp.daeContribution)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Barcode */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Código de Barras (Linha Digitável)
              </p>
              <p className="font-mono text-sm tracking-[0.15em] text-center">
                {dae.barcode.replace(/(\d{12})(\d{12})(\d{12})(\d{12})/, '$1 $2 $3 $4')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Baixar PDF
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{formatBRL(value)}</span>
    </div>
  )
}

export default function DaeHistoryPage() {
  const [daes, setDaes] = useState<DaeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDaes() {
      try {
        const res = await fetch('/api/esocial/dae')
        if (res.ok) {
          const data = await res.json()
          setDaes(data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    loadDaes()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Summary stats
  const totalPending = daes.filter(
    (d) => getEffectiveStatus(d.status, d.due_date) === 'generated'
  )
  const totalOverdue = daes.filter(
    (d) => getEffectiveStatus(d.status, d.due_date) === 'overdue'
  )
  const totalPaid = daes.filter(
    (d) => getEffectiveStatus(d.status, d.due_date) === 'paid'
  )

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Guias DAE</h1>
          <p className="text-muted-foreground">
            Documento de Arrecadação do eSocial
          </p>
        </div>
      </div>

      {/* Summary cards */}
      {daes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{totalPending.length}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-red-600">{totalOverdue.length}</p>
              <p className="text-xs text-muted-foreground">Vencidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-green-600">{totalPaid.length}</p>
              <p className="text-xs text-muted-foreground">Pagas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DAE list */}
      {daes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma DAE gerada ainda.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Processe a folha de pagamento para gerar a guia de recolhimento.
            </p>
            <Link href="/dashboard/esocial/process">
              <Button className="mt-4">Processar Folha</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {daes.map((dae) => (
            <DaeCard key={dae.id} dae={dae} />
          ))}
        </div>
      )}
    </div>
  )
}
