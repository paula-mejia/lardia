'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Shield, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

type Step = 'info' | 'consent' | 'processing'

export default function BackgroundCheckPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [dob, setDob] = useState('')
  const [consent, setConsent] = useState(false)

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
      setError('CPF deve ter 11 digitos')
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
      setError('O consentimento LGPD e obrigatorio')
      return
    }

    setError(null)
    setLoading(true)
    setStep('processing')

    try {
      const response = await fetch('/api/background-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: fullName.trim(),
          candidateCpf: cpf.replace(/\D/g, ''),
          candidateDob: dob,
          lgpdConsent: consent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar consulta')
      }

      // Navigate to results page with the check ID
      router.push(`/dashboard/background-check/results?id=${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setStep('consent')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Verificacao Pre-Contratacao</h1>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['Dados', 'Consentimento', 'Resultado'].map((label, i) => {
            const stepIndex = step === 'info' ? 0 : step === 'consent' ? 1 : 2
            const isActive = i <= stepIndex
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-2 flex-1 rounded-full ${
                    isActive ? 'bg-primary' : 'bg-muted'
                  }`}
                />
                <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Step 1: Candidate info */}
        {step === 'info' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Candidato</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitInfo} className="space-y-4">
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

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full">
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: LGPD Consent */}
        {step === 'consent' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consentimento LGPD</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium">Esta consulta ira verificar:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Validacao do CPF na Receita Federal</li>
                  <li>Antecedentes criminais em bases publicas</li>
                  <li>Processos judiciais civeis</li>
                  <li>Situacao de credito</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Importante
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  De acordo com a LGPD (Lei 13.709/2018), o candidato deve autorizar
                  esta consulta antes de ser realizada. O uso discriminatorio destas
                  informacoes e ilegal.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  O candidato autorizou esta consulta e esta ciente de quais dados serao verificados,
                  conforme exigido pela LGPD.
                </Label>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={handleRunCheck}
                  disabled={!consent || loading}
                  className="flex-1"
                >
                  Realizar Consulta
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Custo: R$99,90 por consulta
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              {loading ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <p className="text-lg font-medium">Consultando bases de dados...</p>
                  <p className="text-sm text-muted-foreground">
                    Isso pode levar alguns segundos
                  </p>
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
    </>
  )
}
