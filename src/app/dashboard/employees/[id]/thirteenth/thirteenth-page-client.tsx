'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { calculateThirteenth, calculateMonthsWorked, type ThirteenthBreakdown } from '@/lib/calc'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, Save, Check } from 'lucide-react'
import { formatBRL, InfoTip, ResultRow } from '@/components/calculator'

interface Props {
  initialSalary: number
  employeeId: string
  employeeName: string
  admissionDate: string
}

export default function ThirteenthPageClient({
  initialSalary, employeeId, employeeName, admissionDate,
}: Props) {
  const now = new Date()
  const currentYear = now.getFullYear()

  const [salary, setSalary] = useState<string>(String(initialSalary))
  const [refYear, setRefYear] = useState<string>(String(currentYear))
  const [dependents, setDependents] = useState<string>('0')
  const [showINSSDetails, setShowINSSDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const monthsWorked = useMemo(() => {
    const year = parseInt(refYear) || currentYear
    return calculateMonthsWorked(new Date(admissionDate + 'T12:00'), year)
  }, [admissionDate, refYear, currentYear])

  const result: ThirteenthBreakdown | null = useMemo(() => {
    const s = parseFloat(salary) || 0
    if (s <= 0 || monthsWorked <= 0) return null
    return calculateThirteenth({
      monthlySalary: s,
      monthsWorked,
      dependents: parseInt(dependents) || 0,
    })
  }, [salary, monthsWorked, dependents])

  const handleSave = useCallback(async () => {
    if (!result) return
    setSaving(true)
    setSaveError(null)
    setSaved(false)

    const supabase = createClient()
    const year = parseInt(refYear) || currentYear

    const { error } = await supabase
      .from('payroll_calculations')
      .upsert({
        employee_id: employeeId,
        reference_month: 13, // convention: month 13 = décimo terceiro
        reference_year: year,
        calculation_type: 'thirteenth',
        gross_salary: result.totalBase,
        overtime_hours: 0,
        absence_days: 0,
        dsr_absence_days: 0,
        dependents: parseInt(dependents) || 0,
        overtime_pay: 0,
        total_earnings: result.totalBase,
        inss_employee: result.inssEmployee,
        irrf: result.irrfEmployee,
        absence_deduction: 0,
        dsr_deduction: 0,
        other_deductions: 0,
        total_deductions: result.inssEmployee + result.irrfEmployee,
        net_salary: result.totalEmployeePay,
        inss_employer: result.inssEmployer,
        gilrat: result.gilrat,
        fgts_monthly: result.fgtsMonthly,
        fgts_anticipation: result.fgtsAnticipation,
        dae_total: result.inssEmployee + result.inssEmployer + result.gilrat + result.fgtsMonthly + result.fgtsAnticipation,
        tax_table_year: 2026,
        status: 'confirmed',
      }, {
        onConflict: 'employee_id,reference_month,reference_year,calculation_type',
      })

    if (error) {
      setSaveError('Erro ao salvar. Tente novamente.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }, [result, employeeId, refYear, currentYear, dependents])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">13º Salário</CardTitle>
          <CardDescription>
            Calcule as duas parcelas do décimo terceiro de {employeeName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="refYear">Ano de referência</Label>
              <Input
                id="refYear"
                type="number"
                min="2024"
                max="2030"
                value={refYear}
                onChange={(e) => setRefYear(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Meses trabalhados
                <InfoTip>
                  O 13º salário é calculado com base nos meses que o empregado terá
                  trabalhado até dezembro do ano de referência. Se admitido em fevereiro,
                  por exemplo, serão 11 meses (fev-dez). Conta o mês se trabalhou 15 dias ou mais.
                </InfoTip>
              </Label>
              <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3">
                <span className="text-lg font-medium">{monthsWorked}</span>
                <span className="text-sm text-muted-foreground ml-1">/ 12</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Admissão: {new Date(admissionDate + 'T12:00').toLocaleDateString('pt-BR')}
              </p>
              <p className="text-xs text-muted-foreground">
                {(parseInt(refYear) || currentYear) >= currentYear
                  ? `Projeção até dezembro de ${parseInt(refYear) || currentYear}`
                  : 'Ano completo'}
              </p>
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
                tip={`${formatBRL(result.monthlySalary)} / 12 x ${result.monthsWorked} meses`}
              />
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
              <ResultRow
                label="FGTS sobre 1ª parcela (8%)"
                value={result.fgtsFirstInstallment}
                tip="O empregador recolhe 8% de FGTS sobre cada parcela separadamente"
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
              <ResultRow
                label="FGTS sobre 2ª parcela (8%)"
                value={result.fgtsSecondInstallment}
                tip="O empregador recolhe 8% de FGTS sobre cada parcela separadamente"
              />
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
                <ResultRow label="FGTS total (8%)" value={result.fgtsMonthly}
                  tip={`1ª parcela: ${formatBRL(result.fgtsFirstInstallment)} + 2ª parcela: ${formatBRL(result.fgtsSecondInstallment)}`}
                />
                <ResultRow label="FGTS antecipação (3,2%)" value={result.fgtsAnticipation} />
                <Separator className="my-2" />
                <ResultRow label="Custo total do empregador" value={result.totalEmployerCost} bold variant="highlight" />
              </div>

              {/* Save button */}
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
                    <><Save className="h-4 w-4 mr-2" /> Salvar 13º de {refYear}</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
