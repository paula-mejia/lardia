'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import NewsletterSignup from '@/components/newsletter-signup'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowRight,
  Calculator,
  DollarSign,
  TrendingUp,
  PieChart,
} from 'lucide-react'
import { CURRENT_TAX_TABLE } from '@/lib/calc/tax-tables'

// ---- Calculation helpers ----

function round(v: number): number {
  return Math.round(v * 100) / 100
}

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface AnnualCostBreakdown {
  // Monthly recurring (x12)
  annualSalary: number
  annualINSSPatronal: number
  annualGILRAT: number
  annualFGTS: number
  annualFGTSAnticipacao: number
  // 13th salary
  thirteenthSalary: number
  thirteenthINSS: number
  thirteenthGILRAT: number
  thirteenthFGTS: number
  thirteenthFGTSAnticipacao: number
  // Vacation
  vacationPay: number // salary + 1/3
  vacationINSS: number
  vacationGILRAT: number
  vacationFGTS: number
  vacationFGTSAnticipacao: number
  // Totals
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

  // 12 months
  const annualSalary = round(grossSalary * 12)
  const annualINSSPatronal = round(grossSalary * cpPatronal * 12)
  const annualGILRAT = round(grossSalary * gilrat * 12)
  const annualFGTS = round(grossSalary * fgts * 12)
  const annualFGTSAnticipacao = round(grossSalary * fgtsAntic * 12)

  // 13th salary
  const thirteenthSalary = round(grossSalary)
  const thirteenthINSS = round(grossSalary * cpPatronal)
  const thirteenthGILRAT = round(grossSalary * gilrat)
  const thirteenthFGTS = round(grossSalary * fgts)
  const thirteenthFGTSAnticipacao = round(grossSalary * fgtsAntic)

  // Vacation: salary + 1/3 constitutional bonus
  const vacationPay = round(grossSalary + grossSalary / 3)
  const vacationINSS = round(vacationPay * cpPatronal)
  const vacationGILRAT = round(vacationPay * gilrat)
  const vacationFGTS = round(vacationPay * fgts)
  const vacationFGTSAnticipacao = round(vacationPay * fgtsAntic)

  // Sum all salary portions (what employee receives)
  const totalSalaryPortion = round(annualSalary + thirteenthSalary + vacationPay)

  // Sum all charges (employer-only costs)
  const totalChargesPortion = round(
    annualINSSPatronal +
      annualGILRAT +
      annualFGTS +
      annualFGTSAnticipacao +
      thirteenthINSS +
      thirteenthGILRAT +
      thirteenthFGTS +
      thirteenthFGTSAnticipacao +
      vacationINSS +
      vacationGILRAT +
      vacationFGTS +
      vacationFGTSAnticipacao
  )

  const totalAnnual = round(totalSalaryPortion + totalChargesPortion)
  const monthlyAverage = round(totalAnnual / 12)

  return {
    annualSalary,
    annualINSSPatronal,
    annualGILRAT,
    annualFGTS,
    annualFGTSAnticipacao,
    thirteenthSalary,
    thirteenthINSS,
    thirteenthGILRAT,
    thirteenthFGTS,
    thirteenthFGTSAnticipacao,
    vacationPay,
    vacationINSS,
    vacationGILRAT,
    vacationFGTS,
    vacationFGTSAnticipacao,
    totalAnnual,
    totalSalaryPortion,
    totalChargesPortion,
    monthlyAverage,
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
  const [salaryInput, setSalaryInput] = useState('1518')
  const salary = useMemo(() => {
    const parsed = parseFloat(salaryInput.replace(/\./g, '').replace(',', '.'))
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed
  }, [salaryInput])

  const cost = useMemo(() => (salary > 0 ? calculateAnnualCost(salary) : null), [salary])

  const minimumWage = CURRENT_TAX_TABLE.minimumWage
  const salaryMultiple = cost ? (cost.totalAnnual / minimumWage).toFixed(1) : '0'
  const salaryPct = cost && cost.totalAnnual > 0 ? ((cost.totalSalaryPortion / cost.totalAnnual) * 100).toFixed(1) : '0'
  const chargesPct = cost && cost.totalAnnual > 0 ? ((cost.totalChargesPortion / cost.totalAnnual) * 100).toFixed(1) : '0'

  const barItems: BarItem[] = cost
    ? [
        {
          label: 'Salários (12 meses)',
          value: cost.annualSalary,
          color: '#047857',
        },
        {
          label: 'INSS Patronal (8%)',
          value: cost.annualINSSPatronal + cost.thirteenthINSS + cost.vacationINSS,
          color: '#0891b2',
        },
        {
          label: 'GILRAT (0,8%)',
          value: cost.annualGILRAT + cost.thirteenthGILRAT + cost.vacationGILRAT,
          color: '#6366f1',
        },
        {
          label: 'FGTS (8%)',
          value: cost.annualFGTS + cost.thirteenthFGTS + cost.vacationFGTS,
          color: '#d97706',
        },
        {
          label: 'FGTS Antecipação (3,2%)',
          value: cost.annualFGTSAnticipacao + cost.thirteenthFGTSAnticipacao + cost.vacationFGTSAnticipacao,
          color: '#e11d48',
        },
        {
          label: '13o Salário',
          value: cost.thirteenthSalary,
          color: '#7c3aed',
        },
        {
          label: 'Férias (salário + 1/3)',
          value: cost.vacationPay,
          color: '#0d9488',
        },
      ]
    : []

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            LarDia
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/simulador"
              className="text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors"
            >
              Simulador
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Comece agora</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-sky-50 dark:from-emerald-950/20 dark:to-sky-950/20" />
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          <Badge variant="secondary" className="mb-4">
            Simulador gratuito 2026
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Quanto custa contratar
            <br />
            <span className="text-emerald-700 dark:text-emerald-400">
              uma empregada doméstica?
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Descubra o custo real incluindo salário, INSS, FGTS, férias, 13o e
            todos os encargos obrigatórios. Resultado instantâneo.
          </p>
        </div>
      </section>

      {/* Salary input */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
            <CardContent className="pt-6">
              <Label htmlFor="salary" className="text-base font-semibold mb-2 block">
                Salário bruto mensal (R$)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="salary"
                  type="text"
                  inputMode="decimal"
                  className="pl-9 text-xl h-12"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  placeholder="1518"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Salário mínimo 2026: {formatBRL(minimumWage)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results */}
      {cost && salary > 0 && (
        <>
          {/* Summary cards */}
          <section className="pb-8 md:pb-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <Card className="border shadow-sm bg-emerald-50 dark:bg-emerald-950/20">
                  <CardContent className="pt-6 text-center">
                    <Calculator className="h-6 w-6 text-emerald-700 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Custo mensal medio
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-emerald-800 dark:text-emerald-400">
                      {formatBRL(cost.monthlyAverage)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm bg-sky-50 dark:bg-sky-950/20">
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="h-6 w-6 text-sky-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Custo anual total
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-sky-700 dark:text-sky-400">
                      {formatBRL(cost.totalAnnual)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm bg-violet-50 dark:bg-violet-950/20">
                  <CardContent className="pt-6 text-center">
                    <PieChart className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Equivale a
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-violet-700 dark:text-violet-400">
                      {salaryMultiple} salários mínimos
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Salary vs charges comparison */}
          <section className="pb-8 md:pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <Card className="border shadow-sm">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Para onde vai o dinheiro?
                  </h2>
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
                      <span>
                        Salário da empregada: {formatBRL(cost.totalSalaryPortion)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <span>
                        Impostos e encargos: {formatBRL(cost.totalChargesPortion)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Detailed breakdown chart */}
          <section className="pb-8 md:pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <Card className="border shadow-sm">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-6">
                    Composicao do custo anual
                  </h2>
                  <CostBar items={barItems} total={cost.totalAnnual} />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Detailed table */}
          <section className="pb-8 md:pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <Card className="border shadow-sm">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Detalhamento completo
                  </h2>

                  <div className="space-y-6">
                    {/* Monthly recurring */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Custos mensais (x12)
                      </h3>
                      <div className="space-y-2">
                        <Row label="Salário bruto" value={cost.annualSalary} />
                        <Row label="INSS Patronal (8%)" value={cost.annualINSSPatronal} />
                        <Row label="GILRAT (0,8%)" value={cost.annualGILRAT} />
                        <Row label="FGTS (8%)" value={cost.annualFGTS} />
                        <Row label="FGTS Antecipação (3,2%)" value={cost.annualFGTSAnticipacao} />
                      </div>
                    </div>

                    <Separator />

                    {/* 13th salary */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        13o Salário
                      </h3>
                      <div className="space-y-2">
                        <Row label="13o salário (integral)" value={cost.thirteenthSalary} />
                        <Row label="INSS Patronal sobre 13o" value={cost.thirteenthINSS} />
                        <Row label="GILRAT sobre 13o" value={cost.thirteenthGILRAT} />
                        <Row label="FGTS sobre 13o" value={cost.thirteenthFGTS} />
                        <Row label="FGTS Antecipação sobre 13o" value={cost.thirteenthFGTSAnticipacao} />
                      </div>
                    </div>

                    <Separator />

                    {/* Vacation */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Férias
                      </h3>
                      <div className="space-y-2">
                        <Row label="Férias (salário + 1/3)" value={cost.vacationPay} />
                        <Row label="INSS Patronal sobre férias" value={cost.vacationINSS} />
                        <Row label="GILRAT sobre férias" value={cost.vacationGILRAT} />
                        <Row label="FGTS sobre férias" value={cost.vacationFGTS} />
                        <Row label="FGTS Antecipação sobre férias" value={cost.vacationFGTSAnticipacao} />
                      </div>
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg font-bold">Total anual</span>
                      <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                        {formatBRL(cost.totalAnnual)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Newsletter */}
          <NewsletterSignup source="simulator" />

          {/* CTA */}
          <section className="py-12 md:py-16 bg-emerald-700 dark:bg-emerald-800">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Gerencie tudo isso automaticamente com LarDia
              </h2>
              <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8">
                Folha de pagamento, guia DAE, férias, 13o e eSocial no piloto
                automático. Você so precisa informar o salário.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="text-base px-8">
                  Criar conta grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <p className="font-bold text-lg mb-2">LarDia</p>
              <p className="text-sm text-muted-foreground">
                eSocial sem erro, sem estresse.
              </p>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Produto</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/#calculadora" className="hover:text-foreground transition-colors">
                    Calculadora
                  </Link>
                </li>
                <li>
                  <Link href="/simulador" className="hover:text-foreground transition-colors">
                    Simulador
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Conta</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-foreground transition-colors">
                    Criar conta
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/termos" className="hover:text-foreground transition-colors">
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="hover:text-foreground transition-colors">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-xs text-muted-foreground">
            &copy; 2026 LarDia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}

// Helper row component for the detail table
function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{formatBRL(value)}</span>
    </div>
  )
}
