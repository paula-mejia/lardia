'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { calculatePayroll, type PayrollBreakdown } from '@/lib/calc'
import { createClient } from '@/lib/supabase/client'
import { HelpCircle, ChevronDown, ChevronUp, Save, Check } from 'lucide-react'

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function InfoTip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="inline h-4 w-4 ml-1 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">
        {children}
      </TooltipContent>
    </Tooltip>
  )
}

function ResultRow({
  label,
  value,
  tip,
  variant = 'default',
  bold = false,
}: {
  label: string
  value: number
  tip?: string
  variant?: 'default' | 'earning' | 'deduction' | 'highlight'
  bold?: boolean
}) {
  const colorClass = {
    default: 'text-foreground',
    earning: 'text-emerald-600',
    deduction: 'text-red-500',
    highlight: 'text-primary',
  }[variant]

  return (
    <div className={`flex justify-between items-center py-1.5 ${bold ? 'font-semibold' : ''}`}>
      <span className="text-sm text-muted-foreground flex items-center">
        {label}
        {tip && <InfoTip>{tip}</InfoTip>}
      </span>
      <span className={`text-sm tabular-nums ${colorClass}`}>
        {variant === 'deduction' && value > 0 ? '- ' : ''}
        {formatBRL(value)}
      </span>
    </div>
  )
}

interface PayrollCalculatorProps {
  initialSalary?: number
  employeeId?: string
  employeeName?: string
  onSaved?: () => void
}

export default function PayrollCalculator({ initialSalary, employeeId, employeeName, onSaved }: PayrollCalculatorProps = {}) {
  const [salary, setSalary] = useState<string>(String(initialSalary || 1518))
  const [dependents, setDependents] = useState<string>('0')
  const [overtimeHours, setOvertimeHours] = useState<string>('0')
  const [absenceDays, setAbsenceDays] = useState<string>('0')
  const [dsrDays, setDsrDays] = useState<string>('0')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showINSSDetails, setShowINSSDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Month/year for saving
  const now = new Date()
  const [refMonth, setRefMonth] = useState<string>(String(now.getMonth() + 1))
  const [refYear, setRefYear] = useState<string>(String(now.getFullYear()))

  const result: PayrollBreakdown | null = useMemo(() => {
    const grossSalary = parseFloat(salary) || 0
    if (grossSalary <= 0) return null

    return calculatePayroll({
      grossSalary,
      dependents: parseInt(dependents) || 0,
      overtimeHours: parseFloat(overtimeHours) || 0,
      absenceDays: parseFloat(absenceDays) || 0,
      dsrAbsenceDays: parseFloat(dsrDays) || 0,
    })
  }, [salary, dependents, overtimeHours, absenceDays, dsrDays])

  async function handleSave() {
    if (!result || !employeeId) return
    setSaving(true)
    setSaveError(null)
    setSaved(false)

    const supabase = createClient()

    const { error } = await supabase
      .from('payroll_calculations')
      .upsert({
        employee_id: employeeId,
        reference_month: parseInt(refMonth),
        reference_year: parseInt(refYear),
        calculation_type: 'monthly',
        gross_salary: result.grossSalary,
        overtime_hours: parseFloat(overtimeHours) || 0,
        absence_days: parseFloat(absenceDays) || 0,
        dsr_absence_days: parseFloat(dsrDays) || 0,
        dependents: parseInt(dependents) || 0,
        overtime_pay: result.overtimePay,
        total_earnings: result.totalEarnings,
        inss_employee: result.inssEmployee,
        irrf: result.irrfEmployee,
        absence_deduction: result.absenceDeduction,
        dsr_deduction: result.dsrDeduction,
        other_deductions: result.otherDeductions,
        total_deductions: result.totalDeductions,
        net_salary: result.netSalary,
        inss_employer: result.inssEmployer,
        gilrat: result.gilrat,
        fgts_monthly: result.fgtsMonthly,
        fgts_anticipation: result.fgtsAnticipation,
        dae_total: result.daeTotal,
        tax_table_year: 2026,
        status: 'confirmed',
      }, {
        onConflict: 'employee_id,reference_month,reference_year,calculation_type',
      })

    if (error) {
      setSaveError('Erro ao salvar. Tente novamente.')
    } else {
      setSaved(true)
      onSaved?.()
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Calculadora de Folha</CardTitle>
          <CardDescription>
            {employeeName
              ? `Calcule a folha de pagamento de ${employeeName}`
              : 'Calcule a folha de pagamento da sua empregada doméstica'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {employeeId && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mês de referência</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={refMonth}
                  onChange={(e) => setRefMonth(e.target.value)}
                >
                  {months.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input
                  type="number"
                  value={refYear}
                  onChange={(e) => setRefYear(e.target.value)}
                  min="2024"
                  max="2030"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="salary">Salário bruto (R$)</Label>
            <Input
              id="salary"
              type="number"
              step="0.01"
              min="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="1518.00"
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Salário mínimo 2026: R$ 1.518,00
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependents">
              Dependentes (para IRRF)
              <InfoTip>
                Filhos até 21 anos (ou 24 se universitário) e cônjuge sem renda.
                Cada dependente reduz a base de cálculo do IRRF em R$ 189,59.
              </InfoTip>
            </Label>
            <Input
              id="dependents"
              type="number"
              min="0"
              value={dependents}
              onChange={(e) => setDependents(e.target.value)}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full justify-between"
          >
            Opções avançadas
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="overtime">
                    Horas extras
                    <InfoTip>
                      Hora extra = salário / 220 × 1,5 (50% adicional).
                      Limite: 2 horas extras por dia.
                    </InfoTip>
                  </Label>
                  <Input
                    id="overtime"
                    type="number"
                    min="0"
                    step="0.5"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="absences">
                    Faltas (dias)
                    <InfoTip>
                      Desconto = salário / 30 × dias de falta.
                      Sempre dividido por 30 (mês comercial), mesmo em meses com 31 ou 28 dias.
                    </InfoTip>
                  </Label>
                  <Input
                    id="absences"
                    type="number"
                    min="0"
                    value={absenceDays}
                    onChange={(e) => setAbsenceDays(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dsr">
                  DSR perdido (dias)
                  <InfoTip>
                    Descanso Semanal Remunerado. Se a empregada faltou durante a semana sem
                    justificativa, ela perde o direito ao DSR daquela semana. Cada DSR perdido = 1 dia de salário.
                  </InfoTip>
                </Label>
                <Input
                  id="dsr"
                  type="number"
                  min="0"
                  value={dsrDays}
                  onChange={(e) => setDsrDays(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {result && (
        <>
          {/* Employee View */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Contracheque</CardTitle>
                <Badge variant="outline">Empregada</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Vencimentos
              </p>
              <ResultRow label="Salário bruto" value={result.grossSalary} variant="earning" />
              {result.overtimePay > 0 && (
                <ResultRow
                  label="Horas extras"
                  value={result.overtimePay}
                  variant="earning"
                  tip="Calculado a 50% sobre a hora normal (salário / 220 × 1,5)"
                />
              )}
              {result.otherEarnings > 0 && (
                <ResultRow label="Outros vencimentos" value={result.otherEarnings} variant="earning" />
              )}

              <Separator className="my-3" />

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Descontos
              </p>
              <div>
                <div
                  className="flex justify-between items-center py-1.5 cursor-pointer"
                  onClick={() => setShowINSSDetails(!showINSSDetails)}
                >
                  <span className="text-sm text-muted-foreground flex items-center">
                    INSS (contribuição)
                    <InfoTip>
                      O INSS é calculado por faixas progressivas. Clique para ver o detalhamento.
                    </InfoTip>
                    {showINSSDetails ? (
                      <ChevronUp className="h-3 w-3 ml-1" />
                    ) : (
                      <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </span>
                  <span className="text-sm tabular-nums text-red-500">
                    - {formatBRL(result.inssEmployee)}
                  </span>
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
                  tip={`Base de cálculo: ${formatBRL(result.irrfBase)} (salário - INSS - dependentes)`}
                />
              )}
              {result.absenceDeduction > 0 && (
                <ResultRow label="Desconto de faltas" value={result.absenceDeduction} variant="deduction" />
              )}
              {result.dsrDeduction > 0 && (
                <ResultRow
                  label="DSR descontado"
                  value={result.dsrDeduction}
                  variant="deduction"
                  tip="Descanso Semanal Remunerado perdido por faltas na semana"
                />
              )}

              <Separator className="my-3" />

              <ResultRow
                label="Salário líquido"
                value={result.netSalary}
                variant="highlight"
                bold
              />
              <p className="text-xs text-muted-foreground mt-1">
                Valor que a empregada recebe na conta
              </p>
            </CardContent>
          </Card>

          {/* Employer View - DAE */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Guia DAE</CardTitle>
                <Badge variant="outline">Empregador</Badge>
              </div>
              <CardDescription>
                Valor que você paga ao governo mensalmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <ResultRow
                label="INSS empregada"
                value={result.daeBreakdown.inssEmployee}
                tip="Contribuição descontada do salário da empregada"
              />
              <ResultRow
                label="INSS patronal (8%)"
                value={result.daeBreakdown.inssEmployer}
                tip="Contribuição previdenciária do empregador. Não é descontada do salário."
              />
              <ResultRow
                label="Seguro acidente (GILRAT 0,8%)"
                value={result.daeBreakdown.gilrat}
                tip="Seguro contra acidentes de trabalho. Pago pelo empregador."
              />
              <ResultRow
                label="FGTS (8%)"
                value={result.daeBreakdown.fgtsMonthly}
                tip="Fundo de Garantia. Depositado na conta FGTS da empregada. Ela acessa ao ser demitida sem justa causa."
              />
              <ResultRow
                label="FGTS antecipação (3,2%)"
                value={result.daeBreakdown.fgtsAnticipation}
                tip="Antecipação da multa rescisória do FGTS. É um depósito mensal que substitui a multa de 40% na rescisão."
              />

              <Separator className="my-3" />

              <ResultRow
                label="Total DAE"
                value={result.daeTotal}
                variant="highlight"
                bold
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pague até o dia 7 de cada mês via código de barras ou PIX
              </p>

              <Separator className="my-3" />

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Custo total mensal</p>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted-foreground">Salário + DAE</span>
                  <span className="text-2xl font-bold tabular-nums">
                    {formatBRL(result.netSalary + result.daeTotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Salário líquido ({formatBRL(result.netSalary)}) + DAE ({formatBRL(result.daeTotal)})
                </p>
              </div>

              {/* Save button */}
              {employeeId && (
                <div className="pt-4">
                  {saveError && <p className="text-sm text-red-500 mb-2">{saveError}</p>}
                  <Button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className="w-full"
                  >
                    {saved ? (
                      <><Check className="h-4 w-4 mr-2" /> Salvo com sucesso</>
                    ) : saving ? (
                      'Salvando...'
                    ) : (
                      <><Save className="h-4 w-4 mr-2" /> Salvar folha de {months[parseInt(refMonth) - 1]} {refYear}</>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
