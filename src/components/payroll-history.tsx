'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { History, ChevronDown, ChevronUp, Loader2, FileDown } from 'lucide-react'
import { generatePayslipPDF } from '@/lib/pdf/payslip'
import { trackPdfDownloaded } from '@/lib/analytics'
import { calculatePayroll } from '@/lib/calc'

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface PayrollRecord {
  id: string
  reference_month: number
  reference_year: number
  calculation_type: string
  gross_salary: number
  net_salary: number
  inss_employee: number
  inss_employer: number
  irrf: number
  gilrat: number
  fgts_monthly: number
  fgts_anticipation: number
  dae_total: number
  dependents: number
  overtime_hours: number
  overtime_pay: number
  absence_days: number
  absence_deduction: number
  dsr_absence_days: number
  dsr_deduction: number
  total_earnings: number
  total_deductions: number
  other_deductions: number
  status: string
  created_at: string
}

function DetailRow({ label, value, variant }: { label: string; value: number; variant?: 'deduction' | 'earning' | 'highlight' }) {
  const color = variant === 'deduction' ? 'text-red-500' : variant === 'earning' ? 'text-emerald-500' : variant === 'highlight' ? 'text-primary font-semibold' : ''
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm tabular-nums ${color}`}>
        {variant === 'deduction' && value > 0 ? '- ' : ''}{formatBRL(value)}
      </span>
    </div>
  )
}

function CalculationDetail({ record }: { record: PayrollRecord }) {
  return (
    <div className="space-y-3 pt-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vencimentos</p>
      <DetailRow label="Salário bruto" value={record.gross_salary} variant="earning" />
      {record.overtime_pay > 0 && <DetailRow label="Horas extras" value={record.overtime_pay} variant="earning" />}

      <Separator />
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descontos</p>
      <DetailRow label="INSS (contribuição)" value={record.inss_employee} variant="deduction" />
      {record.irrf > 0 && <DetailRow label="IRRF" value={record.irrf} variant="deduction" />}
      {record.absence_deduction > 0 && <DetailRow label="Faltas" value={record.absence_deduction} variant="deduction" />}
      {record.dsr_deduction > 0 && <DetailRow label="DSR descontado" value={record.dsr_deduction} variant="deduction" />}

      <Separator />
      <DetailRow label="Salário líquido" value={record.net_salary} variant="highlight" />

      <Separator />
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Guia DAE (empregador)</p>
      <DetailRow label="INSS patronal (8%)" value={record.inss_employer} />
      <DetailRow label="GILRAT (0,8%)" value={record.gilrat} />
      <DetailRow label="FGTS (8%)" value={record.fgts_monthly} />
      <DetailRow label="FGTS antecipação (3,2%)" value={record.fgts_anticipation} />
      <Separator />
      <DetailRow label="Total DAE" value={record.dae_total} variant="highlight" />

      <div className="bg-muted/50 rounded-lg p-3 mt-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted-foreground">Custo total mensal</span>
          <span className="text-lg font-bold tabular-nums">
            {formatBRL(record.net_salary + record.dae_total)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap text-xs text-muted-foreground pt-1">
        {record.dependents > 0 && <Badge variant="secondary">{record.dependents} dependente(s)</Badge>}
        {record.overtime_hours > 0 && <Badge variant="secondary">{record.overtime_hours}h extras</Badge>}
        {record.absence_days > 0 && <Badge variant="secondary">{record.absence_days} falta(s)</Badge>}
      </div>
    </div>
  )
}

interface PayrollHistoryProps {
  employeeId: string
  employeeName: string
  employeeCpf: string
  employerName: string
  refreshKey?: number
}

export default function PayrollHistory({ employeeId, employeeName, employeeCpf, employerName, refreshKey }: PayrollHistoryProps) {
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('payroll_calculations')
      .select('*')
      .eq('employee_id', employeeId)
      .order('reference_year', { ascending: false })
      .order('reference_month', { ascending: false })
      .order('created_at', { ascending: false })

    setRecords((data as PayrollRecord[]) || [])
    setLoading(false)
  }, [employeeId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch + setState pattern, safe in practice
    void fetchHistory()
  }, [fetchHistory, refreshKey])

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando histórico...</span>
        </CardContent>
      </Card>
    )
  }

  if (records.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <History className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum cálculo salvo ainda</p>
          <p className="text-xs text-muted-foreground mt-1">
            Faca um cálculo acima e clique em &quot;Salvar&quot; para criar o histórico
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de cálculos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {records.map((record) => {
          const isExpanded = expandedId === record.id
          const monthLabel = MONTH_NAMES[record.reference_month - 1]
          const dateStr = new Date(record.created_at).toLocaleDateString('pt-BR')

          return (
            <div key={record.id} className="border rounded-lg p-3">
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto hover:bg-transparent"
                onClick={() => setExpandedId(isExpanded ? null : record.id)}
              >
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {monthLabel} {record.reference_year}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Salvo em {dateStr}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatBRL(record.net_salary)}</p>
                    <p className="text-xs text-muted-foreground">líquido</p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </Button>
              {isExpanded && (
                <>
                  <CalculationDetail record={record} />
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        const breakdown = calculatePayroll({
                          grossSalary: record.gross_salary,
                          dependents: record.dependents,
                          overtimeHours: record.overtime_hours,
                          absenceDays: record.absence_days,
                          dsrAbsenceDays: record.dsr_absence_days,
                        })
                        trackPdfDownloaded('payslip')
                        generatePayslipPDF({
                          employerName,
                          employeeName,
                          employeeCpf,
                          referenceMonth: record.reference_month,
                          referenceYear: record.reference_year,
                          breakdown,
                        })
                      }}
                    >
                      <FileDown className="h-4 w-4 mr-2" /> Baixar PDF
                    </Button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
