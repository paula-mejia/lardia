'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Download, Loader2 } from 'lucide-react'
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
  }
  employees: Array<{
    employeeName: string
    grossSalary: number
    inssEmpregado: number
    daeContribution: number
  }>
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'generated':
      return <Badge variant="secondary">Gerada</Badge>
    case 'paid':
      return <Badge className="bg-green-100 text-green-800 border-green-300">Paga</Badge>
    case 'overdue':
      return <Badge variant="destructive">Vencida</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function DaeHistoryPage() {
  const [daes, setDaes] = useState<DaeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDae, setSelectedDae] = useState<DaeRecord | null>(null)

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

  function handleDownloadPdf(dae: DaeRecord) {
    // Generate a simple text-based summary as PDF placeholder
    const content = [
      `DAE - ${MONTHS[dae.reference_month - 1]} ${dae.reference_year}`,
      `Status: ${dae.status}`,
      `Valor Total: ${formatBRL(dae.total_amount)}`,
      `Vencimento: ${new Date(dae.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}`,
      `Codigo de barras: ${dae.barcode}`,
      '',
      'Composicao:',
      `  INSS Empregado: ${formatBRL(dae.breakdown.inssEmpregado)}`,
      `  INSS Patronal: ${formatBRL(dae.breakdown.inssPatronal)}`,
      `  GILRAT: ${formatBRL(dae.breakdown.gilrat)}`,
      `  FGTS Mensal: ${formatBRL(dae.breakdown.fgtsmensal)}`,
      `  FGTS Antecipacao: ${formatBRL(dae.breakdown.fgtsAntecipacao)}`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dae-${dae.reference_year}-${String(dae.reference_month).padStart(2, '0')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Historico de DAEs</h1>
          <p className="text-muted-foreground">Todas as guias de recolhimento geradas</p>
        </div>
        <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-800 border-amber-300">
          Simulado
        </Badge>
      </div>

      {daes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma DAE gerada ainda.</p>
            <Link href="/dashboard/esocial/process">
              <Button className="mt-4">Processar folha</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {daes.map((dae) => (
            <Card
              key={dae.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedDae?.id === dae.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedDae(selectedDae?.id === dae.id ? null : dae)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {MONTHS[dae.reference_month - 1]} {dae.reference_year}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {new Date(dae.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatBRL(dae.total_amount)}</p>
                    </div>
                    {getStatusBadge(dae.status)}
                  </div>
                </div>

                {/* Expanded details */}
                {selectedDae?.id === dae.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">INSS Empregado:</span>
                      <span className="text-right">{formatBRL(dae.breakdown.inssEmpregado)}</span>
                      <span className="text-muted-foreground">INSS Patronal:</span>
                      <span className="text-right">{formatBRL(dae.breakdown.inssPatronal)}</span>
                      <span className="text-muted-foreground">GILRAT:</span>
                      <span className="text-right">{formatBRL(dae.breakdown.gilrat)}</span>
                      <span className="text-muted-foreground">FGTS Mensal:</span>
                      <span className="text-right">{formatBRL(dae.breakdown.fgtsmensal)}</span>
                      <span className="text-muted-foreground">FGTS Antecipacao:</span>
                      <span className="text-right">{formatBRL(dae.breakdown.fgtsAntecipacao)}</span>
                    </div>

                    {dae.employees && dae.employees.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Empregados</h4>
                        {dae.employees.map((emp, i) => (
                          <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                            <span>{emp.employeeName}</span>
                            <span className="text-muted-foreground">
                              {formatBRL(emp.grossSalary)} | DAE: {formatBRL(emp.daeContribution)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Barcode */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Codigo de barras (simulado)</p>
                      <p className="font-mono text-sm tracking-wider">{dae.barcode}</p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadPdf(dae)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar resumo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
