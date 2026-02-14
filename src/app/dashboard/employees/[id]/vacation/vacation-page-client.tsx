'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { calculateVacation, type VacationBreakdown } from '@/lib/calc/vacation'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, Save, Check, AlertCircle } from 'lucide-react'
import { formatBRL, formatDateBR, InfoTip, ResultRow } from '@/components/calculator'

interface Props {
  initialSalary: number
  employeeId: string
  employeeName: string
  admissionDate: string
}

export default function VacationPageClient({
  initialSalary, employeeId, employeeName, admissionDate,
}: Props) {
  const [salary, setSalary] = useState<string>(String(initialSalary))
  const [absences, setAbsences] = useState<string>('0')
  const [daysSold, setDaysSold] = useState<string>('0')
  const [dependents, setDependents] = useState<string>('0')
  const [vacationStartDate, setVacationStartDate] = useState<string>('')
  const [showINSSDetails, setShowINSSDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const result: VacationBreakdown | null = useMemo(() => {
    const s = parseFloat(salary) || 0
    if (s <= 0) return null
    return calculateVacation({
      monthlySalary: s,
      absences: parseInt(absences) || 0,
      daysSold: parseInt(daysSold) || 0,
      dependents: parseInt(dependents) || 0,
      vacationStartDate: vacationStartDate || undefined,
    })
  }, [salary, absences, daysSold, dependents, vacationStartDate])

  const handleSave = useCallback(async () => {
    if (!result) return
    setSaving(true)
    setSaveError(null)
    setSaved(false)

    const supabase = createClient()
    const now = new Date()

    const { error } = await supabase
      .from('payroll_calculations')
      .upsert({
        employee_id: employeeId,
        reference_month: now.getMonth() + 1,
        reference_year: now.getFullYear(),
        calculation_type: 'vacation',
        gross_salary: result.totalGross,
        overtime_hours: 0,
        absence_days: parseInt(absences) || 0,
        dsr_absence_days: 0,
        dependents: parseInt(dependents) || 0,
        overtime_pay: 0,
        total_earnings: result.totalGross,
        inss_employee: result.inssEmployee,
        irrf: result.irrfEmployee,
        absence_deduction: 0,
        dsr_deduction: 0,
        other_deductions: 0,
        total_deductions: result.totalDeductions,
        net_salary: result.netPayment,
        inss_employer: 0,
        gilrat: 0,
        fgts_monthly: result.fgtsDue,
        fgts_anticipation: 0,
        dae_total: result.inssEmployee + result.fgtsDue,
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
  }, [result, employeeId, absences, dependents])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Ferias</CardTitle>
          <CardDescription>
            Calcule as ferias de {employeeName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryVac">Salario bruto (R$)</Label>
              <Input
                id="salaryVac"
                type="number"
                step="0.01"
                min="0"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacStart">
                Inicio das ferias
                <InfoTip>Data de inicio das ferias. O pagamento deve ser feito 2 dias antes.</InfoTip>
              </Label>
              <Input
                id="vacStart"
                type="date"
                value={vacationStartDate}
                onChange={(e) => setVacationStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="absVac">
                Faltas
                <InfoTip>Faltas no periodo aquisitivo. Reduz os dias de ferias conforme art. 130 da CLT.</InfoTip>
              </Label>
              <Input
                id="absVac"
                type="number"
                min="0"
                value={absences}
                onChange={(e) => setAbsences(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysSold">
                Dias vendidos
                <InfoTip>Abono pecuniario: venda de ate 10 dias de ferias.</InfoTip>
              </Label>
              <Input
                id="daysSold"
                type="number"
                min="0"
                max="10"
                value={daysSold}
                onChange={(e) => setDaysSold(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depVac">Dependentes</Label>
              <Input
                id="depVac"
                type="number"
                min="0"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Admissao: {formatDateBR(admissionDate)}
          </p>
        </CardContent>
      </Card>

      {result && result.totalVacationDays === 0 && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Com {absences} faltas, a empregada perdeu o direito a ferias neste periodo.
            </p>
          </CardContent>
        </Card>
      )}

      {result && result.totalVacationDays > 0 && (
        <>
          {/* Entitlement + Pay */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Calculo das ferias</CardTitle>
                <Badge variant="outline">{result.totalVacationDays} dias de direito</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <ResultRow
                label={`Ferias gozadas (${result.daysEnjoyed} dias)`}
                value={result.vacationPay}
                variant="earning"
              />
              <ResultRow
                label="Terco constitucional (1/3)"
                value={result.tercoConstitucional}
                variant="earning"
                tip="Adicional de 1/3 sobre o valor das ferias, garantido pela Constituicao."
              />

              {result.daysSold > 0 && (
                <>
                  <Separator className="my-2" />
                  <ResultRow
                    label={`Abono pecuniario (${result.daysSold} dias vendidos)`}
                    value={result.abonoPay}
                    variant="earning"
                    tip="Valor dos dias vendidos. Isento de INSS e IRRF."
                  />
                  <ResultRow
                    label="Terco sobre abono"
                    value={result.abonoTerco}
                    variant="earning"
                  />
                </>
              )}

              <Separator className="my-2" />
              <ResultRow label="Total bruto" value={result.totalGross} bold variant="highlight" />
            </CardContent>
          </Card>

          {/* Deductions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Descontos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div>
                <div
                  className="flex justify-between items-center py-1.5 cursor-pointer"
                  onClick={() => setShowINSSDetails(!showINSSDetails)}
                >
                  <span className="text-sm text-muted-foreground flex items-center">
                    INSS
                    <InfoTip>Calculado sobre ferias + terco constitucional. Abono pecuniario e isento.</InfoTip>
                    {showINSSDetails ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </span>
                  <span className="text-sm tabular-nums text-red-500">- {formatBRL(result.inssEmployee)}</span>
                </div>
                {showINSSDetails && (
                  <div className="ml-4 space-y-1 mb-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Base INSS</span>
                      <span>{formatBRL(result.inssBase)}</span>
                    </div>
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
                  tip={`Base de calculo IRRF: ${formatBRL(result.irrfBase)}`}
                />
              )}

              <Separator className="my-2" />
              <ResultRow label="Total descontos" value={result.totalDeductions} bold variant="deduction" />
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
                  <span className="text-sm font-medium">Valor liquido a pagar</span>
                  <span className="text-lg font-bold tabular-nums">{formatBRL(result.netPayment)}</span>
                </div>

                {result.paymentDeadline && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Prazo de pagamento</span>
                    <Badge variant="secondary">{formatDateBR(result.paymentDeadline)}</Badge>
                  </div>
                )}

                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    FGTS a recolher (8%)
                    <InfoTip>FGTS sobre ferias + terco. Recolhido pelo empregador via DAE.</InfoTip>
                  </span>
                  <span className="text-sm font-medium tabular-nums">{formatBRL(result.fgtsDue)}</span>
                </div>
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
                    <><Save className="h-4 w-4 mr-2" /> Salvar ferias</>
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
