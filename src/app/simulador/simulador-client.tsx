'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowRight,
  Calculator,
  TrendingUp,
  PieChart,
  Info,
  Minus,
  Plus,
} from 'lucide-react'
import { CURRENT_TAX_TABLE } from '@/lib/calc/tax-tables'
import { calculatePayroll } from '@/lib/calc/payroll'
import { cn } from '@/lib/utils'
import Navbar from '@/components/landing/navbar'
import Footer from '@/components/landing/footer'

// ---- Calculation helpers ----

function round(v: number): number {
  return Math.round(v * 100) / 100
}

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface AnnualCostBreakdown {
  annualSalary: number
  annualINSSPatronal: number
  annualGILRAT: number
  annualFGTS: number
  annualFGTSAnticipacao: number
  thirteenthSalary: number
  thirteenthINSS: number
  thirteenthGILRAT: number
  thirteenthFGTS: number
  thirteenthFGTSAnticipacao: number
  vacationPay: number
  vacationINSS: number
  vacationGILRAT: number
  vacationFGTS: number
  vacationFGTSAnticipacao: number
  totalAnnual: number
  totalSalaryPortion: number
  totalChargesPortion: number
  monthlyAverage: number
}

function calculateAnnualCost(grossSalary: number): AnnualCostBreakdown {
  const table = CURRENT_TAX_TABLE
  const cpPatronal = table.inss.employer.cpPatronal / 100
  const gilrat = table.inss.employer.gilrat / 100
  const fgts = table.fgts.monthly / 100
  const fgtsAntic = table.fgts.anticipation / 100

  const annualSalary = round(grossSalary * 12)
  const annualINSSPatronal = round(grossSalary * cpPatronal * 12)
  const annualGILRAT = round(grossSalary * gilrat * 12)
  const annualFGTS = round(grossSalary * fgts * 12)
  const annualFGTSAnticipacao = round(grossSalary * fgtsAntic * 12)

  const thirteenthSalary = round(grossSalary)
  const thirteenthINSS = round(grossSalary * cpPatronal)
  const thirteenthGILRAT = round(grossSalary * gilrat)
  const thirteenthFGTS = round(grossSalary * fgts)
  const thirteenthFGTSAnticipacao = round(grossSalary * fgtsAntic)

  const vacationPay = round(grossSalary + grossSalary / 3)
  const vacationINSS = round(vacationPay * cpPatronal)
  const vacationGILRAT = round(vacationPay * gilrat)
  const vacationFGTS = round(vacationPay * fgts)
  const vacationFGTSAnticipacao = round(vacationPay * fgtsAntic)

  const totalSalaryPortion = round(annualSalary + thirteenthSalary + vacationPay)
  const totalChargesPortion = round(
    annualINSSPatronal + annualGILRAT + annualFGTS + annualFGTSAnticipacao +
    thirteenthINSS + thirteenthGILRAT + thirteenthFGTS + thirteenthFGTSAnticipacao +
    vacationINSS + vacationGILRAT + vacationFGTS + vacationFGTSAnticipacao
  )

  const totalAnnual = round(totalSalaryPortion + totalChargesPortion)
  const monthlyAverage = round(totalAnnual / 12)

  return {
    annualSalary, annualINSSPatronal, annualGILRAT, annualFGTS, annualFGTSAnticipacao,
    thirteenthSalary, thirteenthINSS, thirteenthGILRAT, thirteenthFGTS, thirteenthFGTSAnticipacao,
    vacationPay, vacationINSS, vacationGILRAT, vacationFGTS, vacationFGTSAnticipacao,
    totalAnnual, totalSalaryPortion, totalChargesPortion, monthlyAverage,
  }
}

// ---- Bar chart component ----

interface BarItem {
  label: string
  value: number
  color: string
}

function CostBar({ items, total }: { items: BarItem[]; total: number }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const pct = total > 0 ? (item.value / total) * 100 : 0
        return (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">
                {formatBRL(item.value)}{' '}
                <span className="text-muted-foreground">({pct.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---- Main component ----

export default function SimuladorClient() {
  const [salaryInput, setSalaryInput] = useState('1621')
  const [sliderValue, setSliderValue] = useState(1621)
  const [view, setView] = useState<'monthly' | 'annual'>('monthly')
  const [includeVT, setIncludeVT] = useState(false)
  const [dependents, setDependents] = useState(0)

  const salary = useMemo(() => {
    const parsed = parseFloat(salaryInput.replace(/\./g, '').replace(',', '.'))
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed
  }, [salaryInput])

  const cost = useMemo(() => (salary > 0 ? calculateAnnualCost(salary) : null), [salary])
  const monthly = useMemo(
    () => (salary > 0 ? calculatePayroll({ grossSalary: salary, dependents }) : null),
    [salary, dependents]
  )

  const minimumWage = CURRENT_TAX_TABLE.minimumWage
  const salaryMultiple = cost ? (cost.totalAnnual / minimumWage).toFixed(1) : '0'
  const salaryPct = cost && cost.totalAnnual > 0 ? ((cost.totalSalaryPortion / cost.totalAnnual) * 100).toFixed(1) : '0'
  const chargesPct = cost && cost.totalAnnual > 0 ? ((cost.totalChargesPortion / cost.totalAnnual) * 100).toFixed(1) : '0'

  const barItems: BarItem[] = cost
    ? [
        { label: 'Salários (12 meses)', value: cost.annualSalary, color: '#10B981' },
        { label: 'INSS Patronal (8%)', value: cost.annualINSSPatronal + cost.thirteenthINSS + cost.vacationINSS, color: '#0891b2' },
        { label: 'GILRAT (0,8%)', value: cost.annualGILRAT + cost.thirteenthGILRAT + cost.vacationGILRAT, color: '#6366f1' },
        { label: 'FGTS (8%)', value: cost.annualFGTS + cost.thirteenthFGTS + cost.vacationFGTS, color: '#d97706' },
        { label: 'FGTS Antecipação (3,2%)', value: cost.annualFGTSAnticipacao + cost.thirteenthFGTSAnticipacao + cost.vacationFGTSAnticipacao, color: '#e11d48' },
        { label: '13o Salário', value: cost.thirteenthSalary, color: '#7c3aed' },
        { label: 'Férias (salário + 1/3)', value: cost.vacationPay, color: '#0d9488' },
      ]
    : []

  const vtDiscount = monthly ? round(monthly.grossSalary * 0.06) : 0
  const netWithVT = monthly ? round(monthly.netSalary - (includeVT ? vtDiscount : 0)) : 0

  const handleSalaryInputChange = (val: string) => {
    setSalaryInput(val)
    const parsed = parseFloat(val.replace(/\./g, '').replace(',', '.'))
    if (!isNaN(parsed) && parsed >= 1621 && parsed <= 10000) {
      setSliderValue(parsed)
    }
  }

  const handleSliderChange = (val: number) => {
    setSliderValue(val)
    setSalaryInput(val.toString())
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page header */}
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
            Simulador gratuito 2026
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
            Simulador de Custo —{' '}
            <span className="text-emerald-500">Empregado Doméstico</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Calcule salário líquido, encargos patronais e o valor da guia DAE em segundos.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
          {/* Left column - Inputs */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Card className="border bg-white shadow-sm">
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Dados do Contrato</h2>
                    <Separator className="mb-4" />
                  </div>

                  {/* Salary */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="salary" className="text-sm font-medium">Salário Bruto</Label>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-xs">
                        Mínimo 2026: R$ 1.621
                      </Badge>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
                      <Input
                        id="salary"
                        type="text"
                        inputMode="decimal"
                        className="pl-10 text-lg h-11 bg-gray-50 border-gray-200"
                        value={salaryInput}
                        onChange={(e) => handleSalaryInputChange(e.target.value)}
                        placeholder="1621"
                      />
                    </div>
                    <input
                      type="range"
                      min={1621}
                      max={10000}
                      step={1}
                      value={sliderValue}
                      onChange={(e) => handleSliderChange(Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:shadow-md"
                      style={{
                        background: `linear-gradient(to right, #10B981 0%, #10B981 ${((sliderValue - 1621) / (10000 - 1621)) * 100}%, #e5e7eb ${((sliderValue - 1621) / (10000 - 1621)) * 100}%, #e5e7eb 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 1.621</span>
                      <span>R$ 10.000</span>
                    </div>
                  </div>

                  {/* Vale Transporte toggle */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Vale Transporte</p>
                        <p className="text-xs text-muted-foreground">Desconto de até 6% do salário</p>
                      </div>
                      <button
                        onClick={() => setIncludeVT(!includeVT)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          includeVT ? 'bg-emerald-500' : 'bg-gray-300'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            includeVT ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Dependents */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Dependentes (IRRF)</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDependents(Math.max(0, dependents - 1))}
                        className="h-8 w-8 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">{dependents}</span>
                      <button
                        onClick={() => setDependents(dependents + 1)}
                        className="h-8 w-8 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {/* Info note */}
                  <div className="flex gap-2 p-3 bg-blue-50 rounded-lg">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      Esta simulação considera o regime de tempo integral (44h semanais). Para regime parcial, os valores podem variar.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right column - Results */}
          <div className="lg:col-span-8">
            {salary > 0 && monthly && cost ? (
              <div className="space-y-6">
                {/* View toggle */}
                <div className="flex bg-white border rounded-lg p-1 w-fit">
                  <button
                    className={cn(
                      'py-2 px-5 rounded-md text-sm font-medium transition-colors',
                      view === 'monthly' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setView('monthly')}
                  >
                    Mensal
                  </button>
                  <button
                    className={cn(
                      'py-2 px-5 rounded-md text-sm font-medium transition-colors',
                      view === 'annual' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setView('annual')}
                  >
                    Anual
                  </button>
                </div>

                {/* Monthly view */}
                {view === 'monthly' && (
                  <Tabs defaultValue="visao-geral" className="space-y-6">
                    <TabsList className="bg-white border">
                      <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
                      <TabsTrigger value="detalhamento-dae">Detalhamento DAE</TabsTrigger>
                    </TabsList>

                    {/* Tab: Visão Geral */}
                    <TabsContent value="visao-geral" className="space-y-6">
                      {/* Hero cost card */}
                      <Card className="border-2 border-emerald-200 bg-emerald-50">
                        <CardContent className="pt-6 text-center">
                          <p className="text-sm font-medium text-emerald-700 uppercase tracking-wide mb-1">
                            Custo Total Mensal Estimado
                          </p>
                          <p className="text-3xl md:text-4xl font-bold text-emerald-700">
                            {formatBRL(monthly.totalEmployerCost)}{' '}
                            <span className="text-lg font-normal text-emerald-600">/mês</span>
                          </p>
                          <p className="text-sm text-emerald-600 mt-2">
                            Valor aproximado incluindo salário base + encargos patronais (DAE).
                          </p>
                        </CardContent>
                      </Card>

                      {/* Two side-by-side cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Employee receives */}
                        <Card className="border bg-white shadow-sm">
                          <CardContent className="pt-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                              O que o empregado recebe
                            </h3>
                            <div className="space-y-3">
                              <Row label="Salário Bruto" value={monthly.grossSalary} />
                              <Row label="(-) INSS" value={monthly.inssEmployee} negative />
                              <Row label="(-) IRRF" value={monthly.irrfEmployee} negative />
                              {includeVT && (
                                <Row label="(-) Vale Transporte" value={vtDiscount} negative />
                              )}
                              <Separator />
                              <div className="flex justify-between items-center pt-1">
                                <span className="font-semibold">Salário Líquido</span>
                                <span className="font-bold text-lg text-emerald-600">{formatBRL(netWithVT)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Employer pays (DAE) */}
                        <Card className="border bg-white shadow-sm">
                          <CardContent className="pt-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                              O que você paga (DAE)
                            </h3>
                            <div className="space-y-3">
                              <Row label="FGTS (8%)" value={monthly.fgtsMonthly} />
                              <Row label="FGTS Comp. (3,2%)" value={monthly.fgtsAnticipation} />
                              <Row label="INSS Patronal (8%)" value={monthly.inssEmployer} />
                              <Row label="Seguro GILRAT (0,8%)" value={monthly.gilrat} />
                              <Separator />
                              <div className="flex justify-between items-center pt-1">
                                <span className="font-semibold">Total Guia DAE</span>
                                <span className="font-bold text-lg text-sky-600">{formatBRL(monthly.daeTotal)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Tab: Detalhamento DAE */}
                    <TabsContent value="detalhamento-dae" className="space-y-6">
                      <Card className="border bg-white shadow-sm">
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-semibold mb-1">Composição da Guia DAE</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Entenda cada valor que compõe o Documento de Arrecadação do eSocial (DAE).
                          </p>

                          <div className="space-y-4">
                            <DaeItem
                              title="FGTS — Fundo de Garantia"
                              description="Depósito mensal de 8% do salário na conta vinculada do trabalhador."
                              value={monthly.fgtsMonthly}
                            />
                            <DaeItem
                              title="FGTS Compensatório — Multa"
                              description="Antecipação de 3,2% da multa rescisória (substitui os 40% na demissão)."
                              value={monthly.fgtsAnticipation}
                            />
                            <DaeItem
                              title="INSS Patronal"
                              description="Contribuição previdenciária do empregador: 8% sobre o salário bruto."
                              value={monthly.inssEmployer}
                            />
                            <DaeItem
                              title="Seguro Acidente — GILRAT"
                              description="Seguro contra acidentes de trabalho: 0,8% sobre o salário bruto."
                              value={monthly.gilrat}
                            />
                            <DaeItem
                              title="INSS do Empregado *"
                              description="Contribuição previdenciária descontada do salário do funcionário (alíquota progressiva)."
                              value={monthly.inssEmployee}
                            />
                            <DaeItem
                              title="IRRF do Empregado *"
                              description="Imposto de renda retido na fonte, quando aplicável."
                              value={monthly.irrfEmployee}
                            />

                            <Separator />

                            <div className="flex justify-between items-center py-2">
                              <span className="text-lg font-bold">Valor Total da Guia</span>
                              <span className="text-lg font-bold text-emerald-600">
                                {formatBRL(round(monthly.daeTotal + monthly.inssEmployee + monthly.irrfEmployee))}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground italic">
                              * Valores descontados do funcionário mas pagos na guia única.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}

                {/* Annual view */}
                {view === 'annual' && (
                  <div className="space-y-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="border bg-white shadow-sm">
                        <CardContent className="pt-6 text-center">
                          <Calculator className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">Custo mensal médio</p>
                          <p className="text-2xl font-bold text-emerald-600">{formatBRL(cost.monthlyAverage)}</p>
                        </CardContent>
                      </Card>
                      <Card className="border bg-white shadow-sm">
                        <CardContent className="pt-6 text-center">
                          <TrendingUp className="h-6 w-6 text-sky-600 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">Custo anual total</p>
                          <p className="text-2xl font-bold text-sky-700">{formatBRL(cost.totalAnnual)}</p>
                        </CardContent>
                      </Card>
                      <Card className="border bg-white shadow-sm">
                        <CardContent className="pt-6 text-center">
                          <PieChart className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">Equivale a</p>
                          <p className="text-2xl font-bold text-violet-700">{salaryMultiple} salários mínimos</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Salary vs charges */}
                    <Card className="border bg-white shadow-sm">
                      <CardContent className="pt-6">
                        <h2 className="text-lg font-semibold mb-4">Para onde vai o dinheiro?</h2>
                        <div className="flex rounded-full overflow-hidden h-8 mb-4">
                          <div
                            className="bg-emerald-600 flex items-center justify-center text-white text-xs font-medium transition-all duration-500"
                            style={{ width: `${salaryPct}%` }}
                          >
                            {salaryPct}%
                          </div>
                          <div
                            className="bg-amber-500 flex items-center justify-center text-white text-xs font-medium transition-all duration-500"
                            style={{ width: `${chargesPct}%` }}
                          >
                            {chargesPct}%
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-emerald-600" />
                            <span>Salário: {formatBRL(cost.totalSalaryPortion)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-amber-500" />
                            <span>Encargos: {formatBRL(cost.totalChargesPortion)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cost breakdown chart */}
                    <Card className="border bg-white shadow-sm">
                      <CardContent className="pt-6">
                        <h2 className="text-lg font-semibold mb-6">Composição do custo anual</h2>
                        <CostBar items={barItems} total={cost.totalAnnual} />
                      </CardContent>
                    </Card>

                    {/* Detailed table */}
                    <Card className="border bg-white shadow-sm">
                      <CardContent className="pt-6">
                        <h2 className="text-lg font-semibold mb-4">Detalhamento completo</h2>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Custos mensais (x12)</h3>
                            <div className="space-y-2">
                              <Row label="Salário bruto" value={cost.annualSalary} />
                              <Row label="INSS Patronal (8%)" value={cost.annualINSSPatronal} />
                              <Row label="GILRAT (0,8%)" value={cost.annualGILRAT} />
                              <Row label="FGTS (8%)" value={cost.annualFGTS} />
                              <Row label="FGTS Antecipação (3,2%)" value={cost.annualFGTSAnticipacao} />
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">13o Salário</h3>
                            <div className="space-y-2">
                              <Row label="13o salário (integral)" value={cost.thirteenthSalary} />
                              <Row label="INSS Patronal sobre 13o" value={cost.thirteenthINSS} />
                              <Row label="GILRAT sobre 13o" value={cost.thirteenthGILRAT} />
                              <Row label="FGTS sobre 13o" value={cost.thirteenthFGTS} />
                              <Row label="FGTS Antecipação sobre 13o" value={cost.thirteenthFGTSAnticipacao} />
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Férias</h3>
                            <div className="space-y-2">
                              <Row label="Férias (salário + 1/3)" value={cost.vacationPay} />
                              <Row label="INSS Patronal sobre férias" value={cost.vacationINSS} />
                              <Row label="GILRAT sobre férias" value={cost.vacationGILRAT} />
                              <Row label="FGTS sobre férias" value={cost.vacationFGTS} />
                              <Row label="FGTS Antecipação sobre férias" value={cost.vacationFGTSAnticipacao} />
                            </div>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center py-2">
                            <span className="text-lg font-bold">Total anual</span>
                            <span className="text-lg font-bold text-emerald-500">{formatBRL(cost.totalAnnual)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* CTA Banner */}
                <Card className="border-0 bg-emerald-500 text-white shadow-lg">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Quer automatizar tudo isso?</h3>
                        <p className="text-emerald-100 text-sm">
                          A LarDia gera a folha, calcula os impostos e envia as guias direto no seu WhatsApp todo mês.
                        </p>
                      </div>
                      <Link href="/signup">
                        <Button variant="secondary" size="lg" className="whitespace-nowrap">
                          Começar teste grátis
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Aviso legal */}
                <p className="text-xs text-muted-foreground text-center px-4">
                  Esta calculadora é uma ferramenta de simulação baseada nas tabelas vigentes (estimativa 2026).
                  Os valores reais podem variar centavos devido a arredondamentos oficiais do sistema eSocial.
                  Fatores como horas extras, adicional noturno, faltas e salário família não estão incluídos nesta simulação básica.
                </p>
              </div>
            ) : (
              <Card className="border bg-white shadow-sm">
                <CardContent className="py-16 text-center">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Insira o salário bruto para ver a simulação
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

// Helper row component
function Row({ label, value, negative }: { label: string; value: number; negative?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', negative && value > 0 && 'text-red-500')}>
        {negative && value > 0 ? `- ${formatBRL(value)}` : formatBRL(value)}
      </span>
    </div>
  )
}

// DAE detail item component
function DaeItem({ title, description, value }: { title: string; description: string; value: number }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <span className="text-sm font-semibold whitespace-nowrap">{formatBRL(value)}</span>
    </div>
  )
}
