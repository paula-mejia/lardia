'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { calculatePayroll, type PayrollBreakdown } from '@/lib/calc'
import { CURRENT_TAX_TABLE } from '@/lib/calc/tax-tables'
import { formatBRL } from '@/components/calculator'
import {
  ChevronLeft, ChevronRight, ChevronDown,
  MessageCircle, Printer, FileDown, Send,
} from 'lucide-react'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface Employee {
  id: string
  full_name: string
  cpf: string
  role: string
  salary: number
  admission_date: string
  status: string
}

interface Props {
  employees: Employee[]
  employerName: string
}

function getDaeDeadline(month: number, year: number): string {
  // DAE due on 7th of the following month
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  return `07/${String(nextMonth).padStart(2, '0')}/${nextYear}`
}

function getMonthsWorkedSinceAdmission(admissionDate: string, refMonth: number, refYear: number): number {
  const admission = new Date(admissionDate)
  const admYear = admission.getFullYear()
  const admMonth = admission.getMonth() + 1 // 1-based
  if (refYear < admYear || (refYear === admYear && refMonth < admMonth)) return 0
  const months = (refYear - admYear) * 12 + (refMonth - admMonth) + 1
  return Math.min(months, 12)
}

export default function PayrollClient({ employees, employerName }: Props) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-based
  const [year, setYear] = useState(now.getFullYear())
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({})

  const payrolls = useMemo(() => {
    return employees.map((emp) => {
      const breakdown = calculatePayroll({ grossSalary: emp.salary })
      return { employee: emp, breakdown }
    })
  }, [employees])

  const totalDae = useMemo(() => {
    return payrolls.reduce((sum, p) => sum + p.breakdown.daeTotal, 0)
  }, [payrolls])

  const daeDeadline = getDaeDeadline(month, year)

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function toggleCard(id: string) {
    setOpenCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT COLUMN */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Folha de Pagamento</h1>
          <p className="text-muted-foreground">Gerencie pagamentos, DAE e recibos.</p>
        </div>

        {/* Month selector */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold min-w-[200px] text-center">
            {MONTHS[month - 1]} {year}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Resumo da Competência */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-base">Resumo da Competência</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vencimento da DAE: {daeDeadline}
            </p>
          </CardContent>
        </Card>

        {/* Employee cards */}
        {payrolls.map(({ employee: emp, breakdown }) => (
          <EmployeePayrollCard
            key={emp.id}
            employee={emp}
            breakdown={breakdown}
            isOpen={!!openCards[emp.id]}
            onToggle={() => toggleCard(emp.id)}
          />
        ))}

        {payrolls.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhum empregado ativo encontrado.
            </CardContent>
          </Card>
        )}

        {/* Bottom status */}
        <div className="flex items-center justify-between p-6 border rounded-lg bg-muted/30">
          <p className="text-sm font-medium">
            Status: <span className="text-emerald-600">Competência Aberta</span>
          </p>
          <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
            Fechar Folha de {MONTHS[month - 1]}
          </Button>
        </div>
      </div>

      {/* RIGHT COLUMN (sidebar) */}
      <div className="space-y-6">
        {/* Guia DAE */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6 space-y-4">
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Documento de Arrecadação do eSocial
            </p>
            <h3 className="text-sm font-medium text-gray-300">Guia DAE</h3>
            <p className="text-3xl font-bold">{formatBRL(totalDae)}</p>
            <p className="text-sm text-gray-400">Vence em {daeDeadline}</p>
            <div className="flex flex-col gap-2 pt-2">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white w-full">
                <FileDown className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar para mim (Zap)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progresso Anual */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Progresso Anual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {employees.map((emp) => {
              const avos = getMonthsWorkedSinceAdmission(emp.admission_date, month, year)
              return (
                <div key={`ferias-${emp.id}`} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>Férias ({emp.full_name.split(' ')[0]})</span>
                    <span className="text-muted-foreground">{avos}/12 avos</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(avos / 12) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {employees.map((emp) => {
              const avos = getMonthsWorkedSinceAdmission(emp.admission_date, month, year)
              return (
                <div key={`13-${emp.id}`} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>13° Salário ({emp.full_name.split(' ')[0]})</span>
                    <span className="text-muted-foreground">{avos}/12 avos</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(avos / 12) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ── Employee expandable card ── */

function EmployeePayrollCard({
  employee,
  breakdown,
  isOpen,
  onToggle,
}: {
  employee: Employee
  breakdown: PayrollBreakdown
  isOpen: boolean
  onToggle: () => void
}) {
  const inssRate = ((breakdown.inssEmployee / breakdown.grossSalary) * 100).toFixed(1)
  const vtRate = '6' // standard vale-transporte deduction %

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-6 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold">{employee.full_name}</p>
                <p className="text-sm text-muted-foreground">{employee.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Salário Líquido</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatBRL(breakdown.netSalary)}
                </p>
              </div>
              <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                Pendente
              </Badge>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-6 pb-6 pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Detalhes do Empregado */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Detalhes do Empregado
                </h4>
                <DetailRow label="Salário Base" value={formatBRL(breakdown.grossSalary)} />
                <DetailRow label={`(-) INSS ${inssRate}%`} value={`- ${formatBRL(breakdown.inssEmployee)}`} className="text-red-500" />
                <DetailRow label={`(-) Vale Transporte ${vtRate}%`} value={`- ${formatBRL(breakdown.grossSalary * 0.06)}`} className="text-red-500" />
                <div className="border-t pt-2">
                  <DetailRow label="Total Líquido" value={formatBRL(breakdown.netSalary)} className="text-emerald-600 font-bold" />
                </div>
              </div>

              {/* Custos do Empregador */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Custos do Empregador
                </h4>
                <DetailRow label="FGTS 8%" value={formatBRL(breakdown.fgtsMonthly)} />
                <DetailRow label="INSS Patronal 8%" value={formatBRL(breakdown.inssEmployer)} />
                <DetailRow label="Seguro Acidente 0,8%" value={formatBRL(breakdown.gilrat)} />
                <DetailRow label="Reserva Rescisória 3,2%" value={formatBRL(breakdown.fgtsAnticipation)} />
                <div className="border-t pt-2">
                  <DetailRow
                    label="Total Encargos"
                    value={formatBRL(breakdown.fgtsMonthly + breakdown.inssEmployer + breakdown.gilrat + breakdown.fgtsAnticipation)}
                    className="font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button size="sm" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function DetailRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={className}>{value}</span>
    </div>
  )
}
