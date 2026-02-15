'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Shield,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  FileText,
  CreditCard,
  ClipboardList,
  Download,
  History,
} from 'lucide-react'
import Link from 'next/link'
import { trackBackgroundCheckStarted } from '@/lib/analytics'

type Step = 'intro' | 'info' | 'consent' | 'processing'

interface EmployeeOption {
  id: string
  full_name: string
  cpf: string
}

export default function BackgroundCheckPage() {
  const [step, setStep] = useState<Step>('intro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Employees for pre-fill
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')

  // Form state
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [dob, setDob] = useState('')
  const [consent, setConsent] = useState(false)

  // Load employees for pre-fill
  useEffect(() => {
    fetch('/api/employees?fields=id,full_name,cpf')
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []))
      .catch(() => {})
  }, [])

  function handleEmployeeSelect(employeeId: string) {
    setSelectedEmployeeId(employeeId)
    if (employeeId === '__manual__') {
      setFullName('')
      setCpf('')
      return
    }
    const emp = employees.find((e) => e.id === employeeId)
    if (emp) {
      setFullName(emp.full_name)
      handleCpfChange(emp.cpf)
    }
  }

  // Format CPF as user types
  function handleCpfChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    let formatted = digits
    if (digits.length > 3) formatted = digits.slice(0, 3) + '.' + digits.slice(3)
    if (digits.length > 6) formatted = formatted.slice(0, 7) + '.' + digits.slice(6)
    if (digits.length > 9) formatted = formatted.slice(0, 11) + '-' + digits.slice(9)
    setCpf(formatted)
  }

  function handleSubmitInfo(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Informe o nome completo do candidato')
      return
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF deve ter 11 dígitos')
      return
    }
    if (!dob) {
      setError('Informe a data de nascimento')
      return
    }

    setStep('consent')
  }

  async function handleRunCheck() {
    if (!consent) {
      setError('O consentimento LGPD é obrigatório')
      return
    }

    trackBackgroundCheckStarted()
    setError(null)
    setLoading(true)

    try {
      const checkoutResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'payment',
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BACKGROUND_CHECK,
          metadata: {
            type: 'background_check',
            candidateName: fullName.trim(),
            candidateCpf: cpf.replace(/\D/g, ''),
            candidateDob: dob,
          },
          successUrl: `${window.location.origin}/dashboard/background-check/processing?name=${encodeURIComponent(fullName.trim())}&cpf=${encodeURIComponent(cpf.replace(/\D/g, ''))}&dob=${encodeURIComponent(dob)}`,
          cancelUrl: `${window.location.origin}/dashboard/background-check`,
        }),
      })

      const checkoutData = await checkoutResponse.json()

      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.error || 'Erro ao iniciar pagamento')
      }

      if (checkoutData.url) {
        window.location.href = checkoutData.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  const howItWorksSteps = [
    { icon: <ClipboardList className="h-6 w-6" />, title: 'Insira os dados', description: 'Nome, CPF e data de nascimento do candidato' },
    { icon: <CreditCard className="h-6 w-6" />, title: 'Pague R$\u00A099,90', description: 'Pagamento único e seguro via cartão' },
    { icon: <Download className="h-6 w-6" />, title: 'Receba o relatório', description: 'Resultado completo em PDF em minutos' },
  ]

  const benefits = [
    { icon: <ShieldCheck className="h-5 w-5 text-emerald-700" />, text: 'Contrate com segurança' },
    { icon: <Clock className="h-5 w-5 text-emerald-700" />, text: 'Resultado em minutos' },
    { icon: <FileText className="h-5 w-5 text-emerald-700" />, text: 'Relatório completo em PDF' },
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Verificação Pré-Contratação</h1>
        </div>
        <Link href="/dashboard/background-check/history" className="ml-auto">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-1" />
            Histórico
          </Button>
        </Link>
      </div>

      {/* Intro / Landing */}
      {step === 'intro' && (
        <div className="space-y-6">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 space-y-3">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
                  Serviço Avulso
                </Badge>
                <h2 className="text-2xl font-bold tracking-tight">
                  Consulta de Antecedentes
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Verifique antecedentes criminais, processos judiciais e situação de crédito de candidatos antes de contratar. Proteja sua casa e sua família.
                </p>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-bold text-emerald-800 dark:text-emerald-400">R$&nbsp;99,90</span>
                  <span className="text-sm text-muted-foreground">por consulta</span>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <ShieldCheck className="h-12 w-12 text-emerald-700 dark:text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {benefits.map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-3 rounded-lg border p-4"
              >
                {b.icon}
                <span className="text-sm font-medium">{b.text}</span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Como funciona</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {howItWorksSteps.map((s, i) => (
                  <div key={s.title} className="flex flex-col items-center text-center gap-2 p-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-primary">
                      {s.icon}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-muted-foreground">{i + 1}.</span>
                      <span className="text-sm font-semibold">{s.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What's included */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">O que é verificado</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" /> Validação do CPF na Receita Federal</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" /> Antecedentes criminais em bases públicas</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" /> Processos judiciais cíveis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" /> Situação de crédito</li>
              </ul>
            </CardContent>
          </Card>

          {/* CTA */}
          <Button size="lg" className="w-full text-base" onClick={() => setStep('info')}>
            Iniciar Consulta — R$&nbsp;99,90
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Este é um serviço avulso. Cada consulta é cobrada separadamente e não faz parte da assinatura.
          </p>
        </div>
      )}

      {/* Step: Candidate info */}
      {step === 'info' && (
        <div className="space-y-4">
          {/* Price reminder */}
          <div className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Custo desta consulta</span>
            <Badge className="bg-amber-600 hover:bg-amber-600 text-white text-sm">R$&nbsp;99,90</Badge>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {['Dados', 'Consentimento', 'Pagamento'].map((label, i) => {
              const stepIndex = step === 'info' ? 0 : step === 'consent' ? 1 : 2
              const isActive = i <= stepIndex
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`h-2 flex-1 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                  <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Candidato</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitInfo} className="space-y-4">
                {/* Pre-fill from employees */}
                {employees.length > 0 && (
                  <div className="space-y-2">
                    <Label>Preencher a partir de empregado cadastrado</Label>
                    <Select value={selectedEmployeeId} onValueChange={handleEmployeeSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar empregado (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__manual__">Inserir manualmente</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Nome completo do candidato"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Data de nascimento</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep('intro')} className="flex-1">
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Continuar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: LGPD Consent */}
      {step === 'consent' && (
        <div className="space-y-4">
          {/* Price reminder */}
          <div className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Custo desta consulta</span>
            <Badge className="bg-amber-600 hover:bg-amber-600 text-white text-sm">R$&nbsp;99,90</Badge>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {['Dados', 'Consentimento', 'Pagamento'].map((label, i) => {
              const stepIndex = 1
              const isActive = i <= stepIndex
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`h-2 flex-1 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                  <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consentimento LGPD</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium">Esta consulta irá verificar:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Validação do CPF na Receita Federal</li>
                  <li>Antecedentes criminais em bases públicas</li>
                  <li>Processos judiciais cíveis</li>
                  <li>Situação de crédito</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Importante</p>
                <p className="text-amber-700 dark:text-amber-300">
                  De acordo com a LGPD (Lei 13.709/2018), o candidato deve autorizar
                  esta consulta antes de ser realizada. O uso discriminatório destas
                  informações é ilegal.
                </p>
              </div>

              <div className="bg-muted/50 border rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium">📱 Mensagem de consentimento para enviar ao candidato:</p>
                <div className="bg-background border rounded-md p-3 text-xs leading-relaxed italic">
                  &quot;Olá! Como parte do processo de contratação, precisamos realizar uma verificação pré-contratação que inclui: validação de CPF, antecedentes criminais, processos judiciais cíveis e situação de crédito. De acordo com a LGPD (Lei 13.709/2018), precisamos da sua autorização. Você autoriza a realização desta consulta? Responda SIM para autorizar.&quot;
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const msg = encodeURIComponent('Olá! Como parte do processo de contratação, precisamos realizar uma verificação pré-contratação que inclui: validação de CPF, antecedentes criminais, processos judiciais cíveis e situação de crédito. De acordo com a LGPD (Lei 13.709/2018), precisamos da sua autorização. Você autoriza a realização desta consulta? Responda SIM para autorizar.')
                    window.open(`https://wa.me/?text=${msg}`, '_blank')
                  }}
                  className="text-emerald-700 hover:text-emerald-800 text-xs font-medium underline"
                >
                  Enviar via WhatsApp →
                </button>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  O candidato autorizou esta consulta e está ciente de quais dados serão verificados,
                  conforme exigido pela LGPD.
                </Label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleRunCheck} disabled={!consent || loading} className="flex-1">
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processando...</>
                  ) : (
                    'Pagar e Realizar Consulta'
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Ao continuar, você será redirecionado para o pagamento de <strong>R$&nbsp;99,90</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            {loading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-lg font-medium">Consultando bases de dados...</p>
                <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                <p className="text-lg font-medium">Consulta finalizada!</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
