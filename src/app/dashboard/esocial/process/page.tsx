'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Loader2, CheckCircle2, XCircle, ArrowLeft, FileText,
  Wifi, WifiOff, RefreshCw, AlertTriangle, Users
} from 'lucide-react'
import Link from 'next/link'

interface EmployeeResult {
  employeeId: string
  employeeName: string
  cpf: string
  grossSalary: number
  status: string
  payroll?: {
    netSalary: number
    inssEmployee: number
    irrfEmployee: number
    daeTotal: number
    totalEarnings: number
    totalDeductions: number
    inssEmployer: number
    gilrat: number
    fgtsMonthly: number
    fgtsAnticipation: number
  }
  error?: string
}

interface DaeResult {
  totalAmount: number
  dueDate: string
  barcode: string
  breakdown: {
    inssEmpregado: number
    inssPatronal: number
    gilrat: number
    fgtsmensal: number
    fgtsAntecipacao: number
  }
  employees: Array<{
    employeeName: string
    grossSalary: number
    inssEmpregado: number
    daeContribution: number
  }>
}

interface ProcessingResult {
  status: string
  totalEventsGenerated: number
  totalDaeValue: number
  errors: string[]
  employees: EmployeeResult[]
  dae?: DaeResult
  processedAt?: string
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function maskCPF(cpf: string): string {
  if (!cpf || cpf.length < 11) return cpf
  return `${cpf.slice(0, 3)}.***.**${cpf.slice(-2)}`
}

export default function EsocialProcessPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string; salary: number }>>([])
  const [loading, setLoading] = useState(true)
  const [proxyConnected, setProxyConnected] = useState(false)
  const [proxyTesting, setProxyTesting] = useState(false)
  const [proxyStatus, setProxyStatus] = useState<string | null>(null)

  async function testProxy() {
    setProxyTesting(true)
    setProxyStatus(null)
    try {
      const res = await fetch('/api/esocial/proxy?action=test')
      const data = await res.json()
      setProxyConnected(data.connected === true)
      setProxyStatus(
        data.connected
          ? 'Conectado ao eSocial via servidor São Paulo'
          : data.error || 'Falha na conexão com o proxy'
      )
    } catch {
      setProxyConnected(false)
      setProxyStatus('Erro ao testar conexão')
    } finally {
      setProxyTesting(false)
    }
  }

  useEffect(() => {
    testProxy()
  }, [])

  useEffect(() => {
    async function loadEmployees() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: employer } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!employer) return

      const { data } = await supabase
        .from('employees')
        .select('id, full_name, salary')
        .eq('employer_id', employer.id)
        .eq('status', 'active')

      setEmployees(data || [])
      setLoading(false)
    }
    loadEmployees()
  }, [])

  async function handleProcess() {
    setProcessing(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/esocial/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setProcessing(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const completedCount = result?.employees.filter((e) => e.status === 'completed').length || 0
  const errorCount = result?.employees.filter((e) => e.status === 'error').length || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Processamento Mensal eSocial</h1>
          <p className="text-muted-foreground">Gerar eventos S-1200, S-1210 e DAE</p>
        </div>
        {!proxyConnected && (
          <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-800 border-amber-300">
            Simulado
          </Badge>
        )}
      </div>

      {/* Proxy connection status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {proxyConnected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {proxyStatus || 'Verificando conexão...'}
                </p>
                {!proxyConnected && proxyStatus && (
                  <p className="text-xs text-muted-foreground">
                    Modo simulado ativo como fallback
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={testProxy} disabled={proxyTesting}>
              {proxyTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Testar Conexão'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Month/Year selector */}
      <Card>
        <CardHeader>
          <CardTitle>Período de referência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês</label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((name, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleProcess} disabled={processing || employees.length === 0} size="lg">
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Processar mês'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress indicator */}
      {processing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Processando folha de pagamento...</p>
                <p className="text-sm text-blue-700">
                  Calculando encargos e gerando eventos para {employees.length} empregado(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results summary */}
      {result && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Empregados</p>
                <p className="text-2xl font-bold">{result.employees.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eventos gerados</p>
                <p className="text-2xl font-bold text-blue-700">{result.totalEventsGenerated}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor DAE</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatBRL(result.totalDaeValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {errorCount > 0 ? (
                    <Badge variant="destructive">{errorCount} erro(s)</Badge>
                  ) : (
                    <Badge className="bg-green-600">Concluído</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee list with results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Empregados ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <p className="text-muted-foreground">Nenhum empregado ativo encontrado.</p>
          ) : (
            <div className="space-y-2">
              {employees.map((emp) => {
                const empResult = result?.employees.find((e) => e.employeeId === emp.id)
                return (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Salário: {formatBRL(emp.salary)}
                      </p>
                      {empResult?.payroll && empResult.status === 'completed' && (
                        <div className="text-xs text-muted-foreground mt-1 space-x-3">
                          <span>INSS: {formatBRL(empResult.payroll.inssEmployee)}</span>
                          {empResult.payroll.irrfEmployee > 0 && (
                            <span>IRRF: {formatBRL(empResult.payroll.irrfEmployee)}</span>
                          )}
                          <span>FGTS: {formatBRL(empResult.payroll.fgtsMonthly)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {empResult && (
                        <>
                          {empResult.status === 'completed' && empResult.payroll && (
                            <span className="text-sm font-medium text-green-700">
                              Líquido: {formatBRL(empResult.payroll.netSalary)}
                            </span>
                          )}
                          {empResult.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : empResult.status === 'error' ? (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-5 w-5 text-red-500" />
                              <span className="text-xs text-red-500">{empResult.error}</span>
                            </div>
                          ) : empResult.status === 'processing' ? (
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                          ) : (
                            <Badge variant="secondary">Pendente</Badge>
                          )}
                        </>
                      )}
                      {!empResult && !result && (
                        <Badge variant="outline">Aguardando</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error with retry */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">Erro no processamento</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={handleProcess}
                  disabled={processing}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing errors list */}
      {result && result.errors.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800 text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Erros durante o processamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {result.errors.map((err, i) => (
                <li key={i} className="text-sm text-amber-700">• {err}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* DAE Summary */}
      {result?.dae && (
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                DAE - {MONTHS[month - 1]} {year}
              </CardTitle>
              {!proxyConnected && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                  Simulado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor total</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatBRL(result.dae.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencimento</p>
                <p className="text-lg font-medium">
                  {new Date(result.dae.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Composição da DAE</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">INSS Empregado:</span>
                <span className="text-right">{formatBRL(result.dae.breakdown.inssEmpregado)}</span>
                <span className="text-muted-foreground">INSS Patronal:</span>
                <span className="text-right">{formatBRL(result.dae.breakdown.inssPatronal)}</span>
                <span className="text-muted-foreground">GILRAT (Seguro Acidente):</span>
                <span className="text-right">{formatBRL(result.dae.breakdown.gilrat)}</span>
                <span className="text-muted-foreground">FGTS Mensal:</span>
                <span className="text-right">{formatBRL(result.dae.breakdown.fgtsmensal)}</span>
                <span className="text-muted-foreground">FGTS Antecipação:</span>
                <span className="text-right">{formatBRL(result.dae.breakdown.fgtsAntecipacao)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatBRL(result.dae.totalAmount)}</span>
              </div>
            </div>

            {/* Per-employee DAE breakdown */}
            {result.dae.employees.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">Contribuição por empregado</h4>
                {result.dae.employees.map((emp, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span>{emp.employeeName}</span>
                    <span className="font-medium">{formatBRL(emp.daeContribution)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Mock barcode */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-xs text-muted-foreground mb-1">Código de barras (simulado)</p>
              <p className="font-mono text-sm tracking-wider">{result.dae.barcode}</p>
              <div className="mt-2 h-12 bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_5px,#fff_5px,#fff_8px)] rounded" />
            </div>

            <div className="flex gap-2">
              <Link href="/dashboard/esocial/dae">
                <Button variant="outline">Ver histórico de DAEs</Button>
              </Link>
              <Link href="/dashboard/esocial/status">
                <Button variant="outline">Ver status mensal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
