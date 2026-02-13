'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { calculateThirteenth, type ThirteenthBreakdown } from '@/lib/calc'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function InfoTip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="inline h-4 w-4 ml-1 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">{children}</TooltipContent>
    </Tooltip>
  )
}

function ResultRow({
  label, value, tip, variant = 'default', bold = false,
}: {
  label: string; value: number; tip?: string
  variant?: 'default' | 'earning' | 'deduction' | 'highlight'; bold?: boolean
}) {
  const colorClass = {
    default: 'text-foreground', earning: 'text-emerald-600',
    deduction: 'text-red-500', highlight: 'text-primary',
  }[variant]
  return (
    <div className={`flex justify-between items-center py-1.5 ${bold ? 'font-semibold' : ''}`}>
      <span className="text-sm text-muted-foreground flex items-center">
        {label}{tip && <InfoTip>{tip}</InfoTip>}
      </span>
      <span className={`text-sm tabular-nums ${colorClass}`}>
        {variant === 'deduction' && value > 0 ? '- ' : ''}{formatBRL(value)}
      </span>
    </div>
  )
}

interface Props {
  initialSalary?: number
}

export default function ThirteenthCalculator({ initialSalary }: Props = {}) {
  const [salary, setSalary] = useState<string>(String(initialSalary || 1518))
  const [monthsWorked, setMonthsWorked] = useState<string>('12')
  const [dependents, setDependents] = useState<string>('0')
  const [showINSSDetails, setShowINSSDetails] = useState(false)

  const result: ThirteenthBreakdown | null = useMemo(() => {
    const s = parseFloat(salary) || 0
    const m = parseInt(monthsWorked) || 0
    if (s <= 0 || m <= 0 || m > 12) return null
    return calculateThirteenth({
      monthlySalary: s,
      monthsWorked: m,
      dependents: parseInt(dependents) || 0,
    })
  }, [salary, monthsWorked, dependents])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Calculadora de 13º Salário</CardTitle>
          <CardDescription>
            Calcule as duas parcelas do décimo terceiro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salary13">Salário bruto (R$)</Label>
            <Input
              id="salary13"
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
              <Label htmlFor="months">
                Meses trabalhados
                <InfoTip>
                  Quantidade de meses trabalhados no ano. Conta o mês se a empregada 
                  trabalhou 15 dias ou mais naquele mês. Se trabalhou o ano todo, são 12.
                </InfoTip>
              </Label>
              <Input
                id="months"
                type="number"
                min="1"
                max="12"
                value={monthsWorked}
                onChange={(e) => setMonthsWorked(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dep13">Dependentes (IRRF)</Label>
              <Input
                id="dep13"
                type="number"
                min="0"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Base */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Base de cálculo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <ResultRow
                label={`Proporcional (${result.monthsWorked}/12 avos)`}
                value={result.proportionalBase}
                tip={`${formatBRL(result.monthlySalary)} ÷ 12 × ${result.monthsWorked} meses`}
              />
              {result.averageOvertimePay > 0 && (
                <ResultRow label="Média de horas extras" value={result.averageOvertimePay} />
              )}
              <Separator className="my-2" />
              <ResultRow label="Base total do 13º" value={result.totalBase} bold variant="highlight" />
            </CardContent>
          </Card>

          {/* 1st Installment */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">1ª Parcela (Adiantamento)</CardTitle>
                <Badge variant="outline">Até 30/nov</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <ResultRow
                label="50% da base"
                value={result.firstInstallment}
                variant="earning"
                tip="Primeira parcela: metade do 13º, sem nenhum desconto"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Sem descontos de INSS ou IRRF. Pague até 30 de novembro.
              </p>
            </CardContent>
          </Card>

          {/* 2nd Installment */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">2ª Parcela (Final)</CardTitle>
                <Badge variant="outline">Até 20/dez</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <ResultRow label="Valor bruto" value={result.secondInstallmentGross} variant="earning" />

              <Separator className="my-2" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Descontos
              </p>

              <div>
                <div
                  className="flex justify-between items-center py-1.5 cursor-pointer"
                  onClick={() => setShowINSSDetails(!showINSSDetails)}
                >
                  <span className="text-sm text-muted-foreground flex items-center">
                    INSS (sobre base total)
                    <InfoTip>
                      O INSS do 13º é calculado sobre o valor total (base completa), 
                      mas descontado apenas na 2ª parcela.
                    </InfoTip>
                    {showINSSDetails ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </span>
                  <span className="text-sm tabular-nums text-red-500">- {formatBRL(result.inssEmployee)}</span>
                </div>
                {showINSSDetails && (
                  <div className="ml-4 space-y-1 mb-2">
                    {result.inssEmployeeDetails.map((d, i) => (
                      <div key={i} className="flex justify-between text-xs text-muted-foreground">
                        <span>{d.bracket}</span>
                        <span>{formatBRL(d.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {result.irrfEmployee > 0 && (
                <ResultRow
                  label="IRRF"
                  value={result.irrfEmployee}
                  variant="deduction"
                  tip={`Base de cálculo IRRF: ${formatBRL(result.irrfBase)} (base total - INSS - dependentes)`}
                />
              )}

              <Separator className="my-2" />
              <ResultRow label="2ª parcela líquida" value={result.secondInstallmentNet} bold variant="highlight" />
              <p className="text-xs text-muted-foreground mt-1">
                Pague até 20 de dezembro
              </p>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">1ª parcela (nov)</span>
                  <span className="text-sm font-medium tabular-nums">{formatBRL(result.firstInstallment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">2ª parcela líquida (dez)</span>
                  <span className="text-sm font-medium tabular-nums">{formatBRL(result.secondInstallmentNet)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total que a empregada recebe</span>
                  <span className="text-lg font-bold tabular-nums">{formatBRL(result.totalEmployeePay)}</span>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Custos do empregador
                </p>
                <ResultRow label="INSS patronal (8%)" value={result.inssEmployer} />
                <ResultRow label="GILRAT (0,8%)" value={result.gilrat} />
                <ResultRow label="FGTS (8%)" value={result.fgtsMonthly} />
                <ResultRow label="FGTS antecipação (3,2%)" value={result.fgtsAnticipation} />
                <Separator className="my-2" />
                <ResultRow label="Custo total do empregador" value={result.totalEmployerCost} bold variant="highlight" />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
