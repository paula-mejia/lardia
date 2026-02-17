'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, Palmtree } from 'lucide-react'
import { calculateVacation, type VacationBreakdown } from '@/lib/calc'
import { REGIONAL_WAGES_2026, getEffectiveMinimumWage, CURRENT_TAX_TABLE } from '@/lib/calc/tax-tables'
import { formatBRL, InfoTip, ResultRow } from '@/components/calculator'

export default function FeriasCalculatorClient() {
  const [selectedState, setSelectedState] = useState('')
  const [salary, setSalary] = useState(String(CURRENT_TAX_TABLE.minimumWage))
  const [monthsWorked, setMonthsWorked] = useState('12')
  const [daysSold, setDaysSold] = useState('0')
  const [dependents, setDependents] = useState('0')

  const result: VacationBreakdown | null = useMemo(() => {
    const s = parseFloat(salary) || 0
    if (s <= 0) return null
    const months = parseInt(monthsWorked) || 12
    return calculateVacation({
      monthlySalary: s,
      absences: 0,
      daysSold: parseInt(daysSold) || 0,
      proportionalMonths: months < 12 ? months : undefined,
      dependents: parseInt(dependents) || 0,
    })
  }, [salary, monthsWorked, daysSold, dependents])

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
              <Palmtree className="h-6 w-6 text-emerald-500" />
              Calculadora de Férias 2026
            </h1>
            <p className="text-sm text-muted-foreground">Empregada doméstica — CLT + eSocial</p>
          </div>
        </div>

        {/* Explanation */}
        <Card className="mb-6 border-emerald-200 bg-emerald-50/30">
          <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
            <p>
              A empregada doméstica tem direito a <strong>30 dias de férias</strong> após 12 meses de trabalho
              (período aquisitivo), acrescidos de <strong>1/3 constitucional</strong>.
            </p>
            <p>
              É possível vender até <strong>10 dias</strong> (abono pecuniário) e dividir as férias em até 3 períodos.
              O pagamento deve ser feito até 2 dias antes do início.
            </p>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Dados para cálculo</CardTitle>
            <CardDescription>Informe os dados abaixo para simular as férias</CardDescription>
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
              {selectedState && (() => {
                const info = getEffectiveMinimumWage(selectedState)
                return info.isRegional && info.regional ? (
                  <p className="text-xs text-emerald-600">
                    Piso regional: {formatBRL(info.regional.wage)}
                    {!info.regional.confirmed && ' (valor 2025, atualização pendente)'}
                  </p>
                ) : null
              })()}
            </div>

            <div className="space-y-2">
              <Label>Salário bruto mensal (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Meses trabalhados
                  <InfoTip>Para férias proporcionais, informe menos de 12 meses.</InfoTip>
                </Label>
                <select
                  value={monthsWorked}
                  onChange={(e) => setMonthsWorked(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m} {m === 12 ? '(férias completas)' : m === 1 ? 'mês' : 'meses'}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>
                  Abono pecuniário
                  <InfoTip>Venda de até 10 dias de férias. O valor do abono não sofre desconto de INSS/IRRF.</InfoTip>
                </Label>
                <select
                  value={daysSold}
                  onChange={(e) => setDaysSold(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="0">Não vender dias</option>
                  <option value="10">Vender 10 dias</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Dependentes (para IRRF)
                <InfoTip>Cada dependente reduz a base do IRRF em {formatBRL(CURRENT_TAX_TABLE.irrf.dependentDeduction)}.</InfoTip>
              </Label>
              <Input
                type="number"
                min="0"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resultado das Férias</CardTitle>
              {result.isProportional && (
                <CardDescription>Férias proporcionais — {result.proportionalMonths}/12 avos</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Vencimentos</p>
              <ResultRow label="Férias base" value={result.vacationPay} variant="earning" tip={`${result.daysEnjoyed} dias de gozo`} />
              <ResultRow label="1/3 constitucional" value={result.tercoConstitucional} variant="earning" tip="Adicional de 1/3 sobre as férias" />
              {result.abonoPay > 0 && (
                <>
                  <ResultRow label="Abono pecuniário" value={result.abonoPay} variant="earning" tip={`${result.daysSold} dias vendidos`} />
                  <ResultRow label="1/3 do abono" value={result.abonoTerco} variant="earning" />
                </>
              )}
              <Separator className="my-3" />

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Descontos</p>
              <ResultRow label="INSS" value={result.inssEmployee} variant="deduction" tip={`Base: ${formatBRL(result.inssBase)}`} />
              {result.irrfEmployee > 0 && (
                <ResultRow label="IRRF" value={result.irrfEmployee} variant="deduction" tip={`Base: ${formatBRL(result.irrfBase)}`} />
              )}

              <Separator className="my-3" />

              <ResultRow label="Total bruto" value={result.totalGross} bold />
              <ResultRow label="Total descontos" value={result.totalDeductions} variant="deduction" bold />

              <Separator className="my-3" />

              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium">Férias líquidas</span>
                  <span className="text-2xl font-bold text-emerald-600 tabular-nums">{formatBRL(result.netPayment)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Valor que a empregada recebe</p>
              </div>

              <div className="mt-3">
                <ResultRow label="FGTS sobre férias (empregador)" value={result.fgtsDue} tip="8% sobre férias + 1/3. Pago pelo empregador via DAE." />
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="border-emerald-300 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardContent className="py-6 text-center space-y-3">
            <h2 className="text-xl font-bold">Automatize o eSocial com a LarDia</h2>
            <p className="text-emerald-100 text-sm">
              Gere guias DAE, contracheques e férias em poucos cliques. Sem burocracia.
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
