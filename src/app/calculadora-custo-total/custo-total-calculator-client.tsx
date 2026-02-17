'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, DollarSign, PieChart } from 'lucide-react'
import { REGIONAL_WAGES_2026, getEffectiveMinimumWage, CURRENT_TAX_TABLE } from '@/lib/calc/tax-tables'
import { formatBRL, InfoTip, ResultRow } from '@/components/calculator'

function round(v: number): number {
  return Math.round(v * 100) / 100
}

interface TotalCostBreakdown {
  // Monthly recurring
  salary: number
  inssPatronal: number
  gilrat: number
  fgtsMonthly: number
  fgtsAnticipacao: number
  valeTransporteEmployer: number
  monthlyTotal: number

  // Annual extras
  thirteenthSalary: number
  thirteenthINSSPatronal: number
  thirteenthGILRAT: number
  thirteenthFGTS: number
  thirteenthFGTSAnticipacao: number
  vacationPay: number // salary + 1/3
  vacationINSSPatronal: number
  vacationGILRAT: number
  vacationFGTS: number
  vacationFGTSAnticipacao: number

  // Totals
  annualRecurring: number
  annualExtras: number
  annualTotal: number
  monthlyAverage: number
}

function calculateTotalCost(
  grossSalary: number,
  hasVT: boolean,
  vtValue: number,
): TotalCostBreakdown {
  const table = CURRENT_TAX_TABLE
  const cpPatronal = table.inss.employer.cpPatronal / 100
  const gilratRate = table.inss.employer.gilrat / 100
  const fgtsRate = table.fgts.monthly / 100
  const fgtsAnticRate = table.fgts.anticipation / 100

  // Monthly charges on salary
  const inssPatronal = round(grossSalary * cpPatronal)
  const gilrat = round(grossSalary * gilratRate)
  const fgtsMonthly = round(grossSalary * fgtsRate)
  const fgtsAnticipacao = round(grossSalary * fgtsAnticRate)

  // VT: employer pays the VT value minus 6% employee deduction (max 6% of salary)
  const vtEmployeeDeduction = hasVT ? Math.min(round(grossSalary * 0.06), vtValue) : 0
  const valeTransporteEmployer = hasVT ? round(Math.max(vtValue - vtEmployeeDeduction, 0)) : 0

  const monthlyTotal = round(grossSalary + inssPatronal + gilrat + fgtsMonthly + fgtsAnticipacao + valeTransporteEmployer)
  const annualRecurring = round(monthlyTotal * 12)

  // 13th salary
  const thirteenthSalary = grossSalary
  const thirteenthINSSPatronal = round(grossSalary * cpPatronal)
  const thirteenthGILRAT = round(grossSalary * gilratRate)
  const thirteenthFGTS = round(grossSalary * fgtsRate)
  const thirteenthFGTSAnticipacao = round(grossSalary * fgtsAnticRate)

  // Vacation: salary + 1/3
  const vacationBase = round(grossSalary + grossSalary / 3)
  const vacationPay = vacationBase
  const vacationINSSPatronal = round(vacationBase * cpPatronal)
  const vacationGILRAT = round(vacationBase * gilratRate)
  const vacationFGTS = round(vacationBase * fgtsRate)
  const vacationFGTSAnticipacao = round(vacationBase * fgtsAnticRate)

  const annualExtras = round(
    thirteenthSalary + thirteenthINSSPatronal + thirteenthGILRAT + thirteenthFGTS + thirteenthFGTSAnticipacao +
    vacationPay + vacationINSSPatronal + vacationGILRAT + vacationFGTS + vacationFGTSAnticipacao
  )

  const annualTotal = round(annualRecurring + annualExtras)
  const monthlyAverage = round(annualTotal / 12)

  return {
    salary: grossSalary,
    inssPatronal,
    gilrat,
    fgtsMonthly,
    fgtsAnticipacao,
    valeTransporteEmployer,
    monthlyTotal,
    thirteenthSalary,
    thirteenthINSSPatronal,
    thirteenthGILRAT,
    thirteenthFGTS,
    thirteenthFGTSAnticipacao,
    vacationPay,
    vacationINSSPatronal,
    vacationGILRAT,
    vacationFGTS,
    vacationFGTSAnticipacao,
    annualRecurring,
    annualExtras,
    annualTotal,
    monthlyAverage,
  }
}

export default function CustoTotalCalculatorClient() {
  const [selectedState, setSelectedState] = useState('')
  const [salary, setSalary] = useState(String(CURRENT_TAX_TABLE.minimumWage))
  const [hasVT, setHasVT] = useState('false')
  const [vtValue, setVtValue] = useState('220')

  const result = useMemo(() => {
    const s = parseFloat(salary) || 0
    if (s <= 0) return null
    return calculateTotalCost(s, hasVT === 'true', parseFloat(vtValue) || 0)
  }, [salary, hasVT, vtValue])

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-500" />
              Custo Total — Empregada Doméstica 2026
            </h1>
            <p className="text-sm text-muted-foreground">Simulador completo com todos os encargos</p>
          </div>
        </div>

        {/* Explanation */}
        <Card className="mb-6 border-emerald-200 bg-emerald-50/30">
          <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
            <p>
              O custo total de uma empregada doméstica vai <strong>muito além do salário</strong>.
              Inclui INSS patronal (8%), GILRAT (0,8%), FGTS (8%), antecipação da multa rescisória (3,2%),
              vale-transporte, 13° salário e férias + 1/3.
            </p>
            <p>
              Use este simulador para entender o <strong>custo real mensal e anual</strong> de manter
              uma empregada doméstica registrada no eSocial.
            </p>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Dados para simulação</CardTitle>
            <CardDescription>Informe o salário e benefícios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <select
                value={selectedState}
                onChange={(e) => {
                  const st = e.target.value
                  setSelectedState(st)
                  const { wage } = getEffectiveMinimumWage(st || undefined)
                  setSalary(String(wage))
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Outros estados (Nacional)</option>
                {REGIONAL_WAGES_2026.map(r => (
                  <option key={r.state} value={r.state}>{r.stateName} ({r.state})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Salário bruto mensal (R$)</Label>
              <Input type="number" step="0.01" min="0" value={salary} onChange={(e) => setSalary(e.target.value)} className="text-lg" />
              <p className="text-xs text-muted-foreground">
                Mínimo nacional 2026: {formatBRL(CURRENT_TAX_TABLE.minimumWage)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Vale-transporte
                <InfoTip>O empregador paga o VT e desconta até 6% do salário da empregada. Aqui calculamos o custo líquido do empregador.</InfoTip>
              </Label>
              <select
                value={hasVT}
                onChange={(e) => setHasVT(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="false">Não fornece VT</option>
                <option value="true">Sim, fornece VT</option>
              </select>
            </div>

            {hasVT === 'true' && (
              <div className="space-y-2">
                <Label>Valor mensal do VT (R$)</Label>
                <Input type="number" step="0.01" min="0" value={vtValue} onChange={(e) => setVtValue(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Custo líquido do empregador: {formatBRL(Math.max((parseFloat(vtValue) || 0) - Math.min((parseFloat(salary) || 0) * 0.06, parseFloat(vtValue) || 0), 0))}
                  {' '}(VT - 6% do salário)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <>
            {/* Monthly breakdown */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Custo Mensal Recorrente</CardTitle>
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>O que você paga todo mês (× 12)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <ResultRow label="Salário bruto" value={result.salary} />
                <ResultRow label="INSS patronal (8%)" value={result.inssPatronal} tip="Contribuição previdenciária do empregador" />
                <ResultRow label="GILRAT (0,8%)" value={result.gilrat} tip="Seguro contra acidentes de trabalho" />
                <ResultRow label="FGTS (8%)" value={result.fgtsMonthly} tip="Fundo de Garantia por Tempo de Serviço" />
                <ResultRow label="FGTS antecipação (3,2%)" value={result.fgtsAnticipacao} tip="Antecipação da multa rescisória de 40%" />
                {result.valeTransporteEmployer > 0 && (
                  <ResultRow label="Vale-transporte (líquido)" value={result.valeTransporteEmployer} tip="Valor do VT menos 6% descontado do salário" />
                )}
                <Separator className="my-3" />
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium">Total mensal</span>
                    <span className="text-xl font-bold tabular-nums">{formatBRL(result.monthlyTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Annual extras */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Custos Anuais Extras</CardTitle>
                <CardDescription>13° salário e férias + encargos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">13° Salário</p>
                <ResultRow label="13° salário" value={result.thirteenthSalary} />
                <ResultRow label="INSS patronal" value={result.thirteenthINSSPatronal} />
                <ResultRow label="GILRAT" value={result.thirteenthGILRAT} />
                <ResultRow label="FGTS" value={result.thirteenthFGTS} />
                <ResultRow label="FGTS antecipação" value={result.thirteenthFGTSAnticipacao} />

                <Separator className="my-3" />

                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Férias + 1/3</p>
                <ResultRow label="Férias + 1/3 constitucional" value={result.vacationPay} />
                <ResultRow label="INSS patronal" value={result.vacationINSSPatronal} />
                <ResultRow label="GILRAT" value={result.vacationGILRAT} />
                <ResultRow label="FGTS" value={result.vacationFGTS} />
                <ResultRow label="FGTS antecipação" value={result.vacationFGTSAnticipacao} />

                <Separator className="my-3" />
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium">Total extras anuais</span>
                    <span className="text-xl font-bold tabular-nums">{formatBRL(result.annualExtras)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grand total */}
            <Card className="mb-6 border-emerald-300">
              <CardContent className="py-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Recorrente (12 meses)</span>
                  <span className="text-lg tabular-nums">{formatBRL(result.annualRecurring)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Extras (13° + férias)</span>
                  <span className="text-lg tabular-nums">{formatBRL(result.annualExtras)}</span>
                </div>
                <Separator />
                <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">Custo total anual</span>
                    <span className="text-2xl font-bold text-emerald-600 tabular-nums">{formatBRL(result.annualTotal)}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-t pt-2">
                    <span className="text-sm font-medium">Média mensal</span>
                    <span className="text-xl font-bold text-emerald-600 tabular-nums">{formatBRL(result.monthlyAverage)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O custo real é <strong>{round((result.monthlyAverage / result.salary - 1) * 100)}% acima</strong> do salário bruto
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* CTA */}
        <Card className="border-emerald-300 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardContent className="py-6 text-center space-y-3">
            <h2 className="text-xl font-bold">Automatize o eSocial com a LarDia</h2>
            <p className="text-emerald-100 text-sm">
              Calcule folha, férias, 13° e gere guias DAE automaticamente. Sem planilhas, sem dor de cabeça.
            </p>
            <Link href="/signup">
              <Button variant="secondary" size="lg" className="mt-2">
                Comece grátis <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
