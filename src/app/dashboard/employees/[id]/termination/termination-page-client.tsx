'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { calculateTermination } from '@/lib/calc'
import type { TerminationBreakdown, TerminationType } from '@/lib/calc'
import { createClient } from '@/lib/supabase/client'
import { Save, Check, FileText } from 'lucide-react'
import { formatBRL, InfoTip, ResultRow } from '@/components/calculator'
import { generateTerminationReportPDF } from '@/lib/pdf/termination-report'

interface Props {
  initialSalary: number
  employeeId: string
  employeeName: string
  employeeCpf: string
  employeeRole: string
  admissionDate: string
  employerName: string
  employerCpf: string
}

export default function TerminationPageClient({
  initialSalary, employeeId, employeeName, employeeCpf, employeeRole,
  admissionDate, employerName, employerCpf,
}: Props) {
  const today = new Date().toISOString().split('T')[0]

  const [terminationType, setTerminationType] = useState<TerminationType>('sem_justa_causa')
  const [salary, setSalary] = useState<string>(String(initialSalary))
  const [terminationDate, setTerminationDate] = useState<string>(today)
  const [dependents, setDependents] = useState<string>('0')
  const [fgtsBalance, setFgtsBalance] = useState<string>('0')
  const [accruedVacationPeriods, setAccruedVacationPeriods] = useState<string>('0')
  const [workedNoticePeriod, setWorkedNoticePeriod] = useState(false)
  const [employeeGaveNotice, setEmployeeGaveNotice] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const result: TerminationBreakdown | null = useMemo(() => {
    const s = parseFloat(salary) || 0
    if (s <= 0 || !terminationDate) return null
    return calculateTermination({
      terminationType,
      lastSalary: s,
      admissionDate,
      terminationDate,
      dependents: parseInt(dependents) || 0,
      fgtsBalance: parseFloat(fgtsBalance) || 0,
      accruedVacationPeriods: parseInt(accruedVacationPeriods) || 0,
      workedNoticePeriod,
      employeeGaveNotice,
    })
  }, [terminationType, salary, admissionDate, terminationDate, dependents, fgtsBalance, accruedVacationPeriods, workedNoticePeriod, employeeGaveNotice])

  const handleSave = useCallback(async () => {
    if (!result) return
    setSaving(true)
    setSaveError(null)
    setSaved(false)

    const supabase = createClient()
    const termDate = new Date(terminationDate + 'T12:00')

    const { error } = await supabase
      .from('payroll_calculations')
      .upsert({
        employee_id: employeeId,
        reference_month: termDate.getMonth() + 1,
        reference_year: termDate.getFullYear(),
        calculation_type: 'termination',
        gross_salary: parseFloat(salary),
        overtime_hours: 0,
        absence_days: 0,
        dsr_absence_days: 0,
        dependents: parseInt(dependents) || 0,
        overtime_pay: 0,
        total_earnings: result.totalEarnings,
        inss_employee: result.inssEmployee,
        irrf: result.irrfEmployee,
        absence_deduction: 0,
        dsr_deduction: 0,
        other_deductions: result.avisoPrevioDeduction,
        total_deductions: result.totalDeductions,
        net_salary: result.netAmount,
        inss_employer: 0,
        gilrat: 0,
        fgts_monthly: result.fgtsOnTermination,
        fgts_anticipation: 0,
        dae_total: 0,
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
  }, [result, employeeId, terminationDate, salary, dependents])

  const handleGenerateTRCT = useCallback(() => {
    if (!result) return
    generateTerminationReportPDF({
      employerName,
      employerCpf,
      employeeName,
      employeeCpf,
      employeeRole,
      admissionDate,
      terminationDate,
      salary: parseFloat(salary) || 0,
      breakdown: result,
    })
  }, [result, employerName, employerCpf, employeeName, employeeCpf, employeeRole, admissionDate, terminationDate, salary])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Rescisão</CardTitle>
          <CardDescription>
            Calcule o TRCT (Termo de Rescisão) de {employeeName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de rescisão</Label>
            <Select value={terminationType} onValueChange={(v) => setTerminationType(v as TerminationType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem_justa_causa">Dispensa sem justa causa</SelectItem>
                <SelectItem value="pedido_demissao">Pedido de demissão</SelectItem>
                <SelectItem value="justa_causa">Dispensa por justa causa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryTerm">Último salário (R$)</Label>
              <Input
                id="salaryTerm"
                type="number"
                step="0.01"
                min="0"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termDate">Data de desligamento</Label>
              <Input
                id="termDate"
                type="date"
                value={terminationDate}
                onChange={(e) => setTerminationDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Data de admissão
              </Label>
              <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3">
                <span className="text-sm">
                  {new Date(admissionDate + 'T12:00').toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="depTerm">Dependentes (IRRF)</Label>
              <Input
                id="depTerm"
                type="number"
                min="0"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fgtsBalance">
                Saldo FGTS estimado (R$)
                <InfoTip>
                  Valor total depositado de FGTS ao longo do contrato.
                  Usado para calcular a multa de 40%.
                </InfoTip>
              </Label>
              <Input
                id="fgtsBalance"
                type="number"
                step="0.01"
                min="0"
                value={fgtsBalance}
                onChange={(e) => setFgtsBalance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accruedVac">
                Férias vencidas (períodos)
                <InfoTip>
                  Periodos aquisitivos completos sem férias gozadas (0, 1 ou 2).
                </InfoTip>
              </Label>
              <Input
                id="accruedVac"
                type="number"
                min="0"
                max="2"
                value={accruedVacationPeriods}
                onChange={(e) => setAccruedVacationPeriods(e.target.value)}
              />
            </div>
          </div>

          {terminationType === 'sem_justa_causa' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="workedNotice"
                checked={workedNoticePeriod}
                onCheckedChange={(checked) => setWorkedNoticePeriod(!!checked)}
              />
              <Label htmlFor="workedNotice" className="text-sm">
                Aviso prévio trabalhado (não indenizado)
              </Label>
            </div>
          )}

          {terminationType === 'pedido_demissao' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gaveNotice"
                checked={employeeGaveNotice}
                onCheckedChange={(checked) => setEmployeeGaveNotice(!!checked)}
              />
              <Label htmlFor="gaveNotice" className="text-sm">
                Empregada cumpriu aviso prévio de 30 dias
              </Label>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Verbas rescisórias */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Verbas Rescisorias</CardTitle>
                <Badge variant="outline">{result.terminationTypeLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Proventos
              </p>

              <ResultRow
                label={`Saldo de salário (${result.saldoSalarioDays} dias)`}
                value={result.saldoSalario}
                variant="earning"
                tip="Dias trabalhados no mês do desligamento"
              />

              {result.avisoPrevio > 0 && (
                <ResultRow
                  label={`Aviso prévio indenizado (${result.avisoPrevioDays} dias)`}
                  value={result.avisoPrevio}
                  variant="earning"
                  tip={`30 dias + 3 dias por ano trabalhado. ${result.yearsWorked} ano(s) = ${result.avisoPrevioDays} dias`}
                />
              )}

              {result.thirteenthProportional > 0 && (
                <ResultRow
                  label={`13o proporcional (${result.thirteenthMonths}/12 avos)`}
                  value={result.thirteenthProportional}
                  variant="earning"
                />
              )}

              {result.vacationProportional > 0 && (
                <>
                  <ResultRow
                    label={`Férias proporcionais (${result.vacationProportionalMonths}/12 avos)`}
                    value={result.vacationProportional}
                    variant="earning"
                  />
                  <ResultRow
                    label="1/3 constitucional (férias proporcionais)"
                    value={result.vacationProportionalOneThird}
                    variant="earning"
                  />
                </>
              )}

              {result.accruedVacation > 0 && (
                <>
                  <ResultRow
                    label={`Férias vencidas (${result.accruedVacationPeriods} período${result.accruedVacationPeriods > 1 ? 's' : ''})`}
                    value={result.accruedVacation}
                    variant="earning"
                  />
                  <ResultRow
                    label="1/3 constitucional (férias vencidas)"
                    value={result.accruedVacationOneThird}
                    variant="earning"
                  />
                </>
              )}

              <Separator className="my-2" />
              <ResultRow label="Total de proventos" value={result.totalEarnings} bold variant="highlight" />
            </CardContent>
          </Card>

          {/* Descontos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Descontos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <ResultRow
                label="INSS"
                value={result.inssEmployee}
                variant="deduction"
                tip={`Base de cálculo: ${formatBRL(result.inssBase)}`}
              />

              {result.irrfEmployee > 0 && (
                <ResultRow
                  label="IRRF"
                  value={result.irrfEmployee}
                  variant="deduction"
                  tip={`Base de cálculo: ${formatBRL(result.irrfBase)}`}
                />
              )}

              {result.avisoPrevioDeduction > 0 && (
                <ResultRow
                  label="Desconto aviso prévio (não cumprido)"
                  value={result.avisoPrevioDeduction}
                  variant="deduction"
                  tip="Empregada não cumpriu os 30 dias de aviso prévio"
                />
              )}

              <Separator className="my-2" />
              <ResultRow label="Total de descontos" value={result.totalDeductions} bold variant="deduction" />
            </CardContent>
          </Card>

          {/* FGTS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">FGTS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <ResultRow
                label="FGTS sobre verbas rescisórias (8%)"
                value={result.fgtsOnTermination}
                tip="8% sobre saldo de salário + aviso prévio indenizado + 13o proporcional"
              />
              <ResultRow
                label="Saldo FGTS informado"
                value={result.fgtsBalance}
              />

              {result.fgtsPenalty > 0 && (
                <>
                  <Separator className="my-2" />
                  <ResultRow
                    label="Multa rescisória (40%)"
                    value={result.fgtsPenalty}
                    variant="earning"
                    bold
                    tip={`40% sobre o saldo total de FGTS (${formatBRL(result.fgtsBalance + result.fgtsOnTermination)})`}
                  />
                </>
              )}

              <Separator className="my-2" />
              <ResultRow label="Total FGTS a depositar" value={result.totalFgts} bold variant="highlight" />
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de proventos</span>
                  <span className="text-sm font-medium tabular-nums">{formatBRL(result.totalEarnings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de descontos</span>
                  <span className="text-sm font-medium tabular-nums text-red-500">- {formatBRL(result.totalDeductions)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Valor líquido</span>
                  <span className="text-lg font-bold tabular-nums">{formatBRL(result.netAmount)}</span>
                </div>
                {result.fgtsPenalty > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">+ Multa FGTS 40%</span>
                      <span className="text-sm font-medium tabular-nums text-emerald-500">{formatBRL(result.fgtsPenalty)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total a receber</span>
                      <span className="text-lg font-bold tabular-nums">{formatBRL(result.totalToReceive)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Save */}
              <div className="pt-4">
                {saveError && <p className="text-sm text-red-500 mb-2">{saveError}</p>}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className="flex-1"
                  >
                    {saved ? (
                      <><Check className="h-4 w-4 mr-2" /> Salvo com sucesso</>
                    ) : saving ? (
                      'Salvando...'
                    ) : (
                      <><Save className="h-4 w-4 mr-2" /> Salvar rescisão</>
                    )}
                  </Button>
                  <Button
                    onClick={handleGenerateTRCT}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" /> Gerar TRCT
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
