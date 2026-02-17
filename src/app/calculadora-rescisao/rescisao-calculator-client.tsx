'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, FileX2 } from 'lucide-react'
import { calculateTermination, type TerminationBreakdown, type TerminationType } from '@/lib/calc'
import { REGIONAL_WAGES_2026, getEffectiveMinimumWage, CURRENT_TAX_TABLE } from '@/lib/calc/tax-tables'
import { formatBRL, InfoTip, ResultRow } from '@/components/calculator'

const TERMINATION_TYPES: { value: TerminationType; label: string; description: string }[] = [
  { value: 'sem_justa_causa', label: 'Dispensa sem justa causa', description: 'Empregador demite sem motivo' },
  { value: 'justa_causa', label: 'Dispensa por justa causa', description: 'Demissão por falta grave' },
  { value: 'pedido_demissao', label: 'Pedido de demissão', description: 'Empregada pede para sair' },
]

export default function RescisaoCalculatorClient() {
  const [selectedState, setSelectedState] = useState('')
  const [salary, setSalary] = useState(String(CURRENT_TAX_TABLE.minimumWage))
  const [terminationType, setTerminationType] = useState<TerminationType>('sem_justa_causa')
  const [admissionDate, setAdmissionDate] = useState('2024-01-15')
  const [terminationDate, setTerminationDate] = useState('2026-02-15')
  const [workedNotice, setWorkedNotice] = useState('false')
  const [employeeGaveNotice, setEmployeeGaveNotice] = useState('true')
  const [fgtsBalance, setFgtsBalance] = useState('0')
  const [accruedVacationPeriods, setAccruedVacationPeriods] = useState('0')
  const [dependents, setDependents] = useState('0')

  const result: TerminationBreakdown | null = useMemo(() => {
    const s = parseFloat(salary) || 0
    if (s <= 0 || !admissionDate || !terminationDate) return null
    if (new Date(terminationDate) <= new Date(admissionDate)) return null

    return calculateTermination({
      terminationType,
      lastSalary: s,
      admissionDate,
      terminationDate,
      dependents: parseInt(dependents) || 0,
      fgtsBalance: parseFloat(fgtsBalance) || 0,
      accruedVacationPeriods: parseInt(accruedVacationPeriods) || 0,
      workedNoticePeriod: workedNotice === 'true',
      employeeGaveNotice: employeeGaveNotice === 'true',
    })
  }, [salary, terminationType, admissionDate, terminationDate, dependents, fgtsBalance, accruedVacationPeriods, workedNotice, employeeGaveNotice])

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
              <FileX2 className="h-6 w-6 text-emerald-500" />
              Calculadora de Rescisão 2026
            </h1>
            <p className="text-sm text-muted-foreground">Empregada doméstica — CLT + eSocial</p>
          </div>
        </div>

        {/* Explanation */}
        <Card className="mb-6 border-emerald-200 bg-emerald-50/30">
          <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
            <p>
              A rescisão do contrato de trabalho doméstico envolve diversas verbas: <strong>saldo de salário</strong>,
              <strong> aviso prévio</strong>, <strong>férias proporcionais + 1/3</strong>, <strong>13° proporcional</strong> e <strong>multa do FGTS</strong>.
            </p>
            <p>
              Os valores variam conforme o <strong>tipo de desligamento</strong> e o <strong>tempo de serviço</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Dados para cálculo</CardTitle>
            <CardDescription>Informe os dados do desligamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de rescisão</Label>
              <select
                value={terminationType}
                onChange={(e) => setTerminationType(e.target.value as TerminationType)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {TERMINATION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {TERMINATION_TYPES.find(t => t.value === terminationType)?.description}
              </p>
            </div>

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
              <Label>Último salário bruto (R$)</Label>
              <Input type="number" step="0.01" min="0" value={salary} onChange={(e) => setSalary(e.target.value)} className="text-lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de admissão</Label>
                <Input type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data de desligamento</Label>
                <Input type="date" value={terminationDate} onChange={(e) => setTerminationDate(e.target.value)} />
              </div>
            </div>

            {terminationType === 'sem_justa_causa' && (
              <div className="space-y-2">
                <Label>
                  Aviso prévio
                  <InfoTip>Se indenizado, o empregador paga o período sem que a empregada trabalhe.</InfoTip>
                </Label>
                <select
                  value={workedNotice}
                  onChange={(e) => setWorkedNotice(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="false">Indenizado (empregador paga)</option>
                  <option value="true">Trabalhado</option>
                </select>
              </div>
            )}

            {terminationType === 'pedido_demissao' && (
              <div className="space-y-2">
                <Label>
                  Empregada cumpriu aviso prévio?
                  <InfoTip>Se não cumpriu, o empregador pode descontar 30 dias de salário.</InfoTip>
                </Label>
                <select
                  value={employeeGaveNotice}
                  onChange={(e) => setEmployeeGaveNotice(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="true">Sim, cumpriu 30 dias</option>
                  <option value="false">Não cumpriu (desconto)</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Saldo FGTS estimado (R$)
                  <InfoTip>Valor acumulado na conta FGTS. Usado para calcular a multa de 40%.</InfoTip>
                </Label>
                <Input type="number" step="0.01" min="0" value={fgtsBalance} onChange={(e) => setFgtsBalance(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>
                  Períodos de férias vencidas
                  <InfoTip>Períodos completos de férias ainda não tiradas (0, 1 ou 2).</InfoTip>
                </Label>
                <select
                  value={accruedVacationPeriods}
                  onChange={(e) => setAccruedVacationPeriods(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="0">0</option>
                  <option value="1">1 período</option>
                  <option value="2">2 períodos</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dependentes (para IRRF)</Label>
              <Input type="number" min="0" value={dependents} onChange={(e) => setDependents(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resultado da Rescisão</CardTitle>
              <CardDescription>{result.terminationTypeLabel} — {result.yearsWorked} ano(s) de serviço</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Verbas Rescisórias</p>
              <ResultRow label={`Saldo de salário (${result.saldoSalarioDays} dias)`} value={result.saldoSalario} variant="earning" />
              {result.avisoPrevio > 0 && (
                <ResultRow
                  label={`Aviso prévio ${result.avisoPrevioIndemnizado ? 'indenizado' : 'trabalhado'} (${result.avisoPrevioDays} dias)`}
                  value={result.avisoPrevio}
                  variant="earning"
                />
              )}
              {result.thirteenthProportional > 0 && (
                <ResultRow label={`13° proporcional (${result.thirteenthMonths}/12)`} value={result.thirteenthProportional} variant="earning" />
              )}
              {result.vacationProportional > 0 && (
                <ResultRow label={`Férias proporcionais (${result.vacationProportionalMonths}/12)`} value={result.vacationProportional} variant="earning" />
              )}
              {result.vacationProportionalOneThird > 0 && (
                <ResultRow label="1/3 férias proporcionais" value={result.vacationProportionalOneThird} variant="earning" />
              )}
              {result.accruedVacation > 0 && (
                <>
                  <ResultRow label={`Férias vencidas (${result.accruedVacationPeriods} período(s))`} value={result.accruedVacation} variant="earning" />
                  <ResultRow label="1/3 férias vencidas" value={result.accruedVacationOneThird} variant="earning" />
                </>
              )}
              <ResultRow label="Total verbas" value={result.totalEarnings} bold />

              <Separator className="my-3" />

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Descontos</p>
              <ResultRow label="INSS" value={result.inssEmployee} variant="deduction" tip={`Base: ${formatBRL(result.inssBase)}`} />
              {result.irrfEmployee > 0 && (
                <ResultRow label="IRRF" value={result.irrfEmployee} variant="deduction" />
              )}
              {result.avisoPrevioDeduction > 0 && (
                <ResultRow label="Aviso prévio não cumprido" value={result.avisoPrevioDeduction} variant="deduction" />
              )}
              <ResultRow label="Total descontos" value={result.totalDeductions} variant="deduction" bold />

              <Separator className="my-3" />

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">FGTS</p>
              <ResultRow label="FGTS sobre rescisão (8%)" value={result.fgtsOnTermination} />
              {result.fgtsPenalty > 0 && (
                <ResultRow
                  label="Multa FGTS (40%)"
                  value={result.fgtsPenalty}
                  variant="earning"
                  tip="40% sobre o saldo total do FGTS (depósitos + 8% da rescisão)"
                />
              )}

              <Separator className="my-3" />

              <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium">Valor líquido da rescisão</span>
                  <span className="text-2xl font-bold text-emerald-600 tabular-nums">{formatBRL(result.netAmount)}</span>
                </div>
                {result.fgtsPenalty > 0 && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">+ Multa FGTS (paga via Caixa)</span>
                    <span className="text-sm font-semibold tabular-nums">{formatBRL(result.fgtsPenalty)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline border-t pt-2">
                  <span className="text-sm font-medium">Total a receber</span>
                  <span className="text-2xl font-bold text-emerald-600 tabular-nums">{formatBRL(result.totalToReceive)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="border-emerald-300 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardContent className="py-6 text-center space-y-3">
            <h2 className="text-xl font-bold">Automatize o eSocial com a LarDia</h2>
            <p className="text-emerald-100 text-sm">
              Gere o TRCT, guias DAE e toda a documentação de rescisão em minutos.
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
