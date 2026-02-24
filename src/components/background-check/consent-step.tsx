'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { StepIndicator } from './step-indicator'
import { PriceReminder } from './price-reminder'
import type { CandidateData } from './types'
import { trackBackgroundCheckStarted } from '@/lib/analytics'

interface ConsentStepProps {
  /** Candidate data collected in the previous step. */
  candidate: CandidateData
  /** Called when the user clicks "Voltar". */
  onBack: () => void
}

const CONSENT_MSG =
  'Olá! Como parte do processo de contratação, precisamos realizar uma verificação pré-contratação que inclui: validação de CPF, antecedentes criminais, processos judiciais cíveis e situação de crédito. De acordo com a LGPD (Lei 13.709/2018), precisamos da sua autorização. Você autoriza a realização desta consulta? Responda SIM para autorizar.'

/**
 * LGPD consent step — shows what will be checked, provides a WhatsApp
 * template message and requires an explicit consent checkbox before payment.
 */
export function ConsentStep({ candidate, onBack }: ConsentStepProps) {
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Initiate Stripe checkout for the background check. */
  async function handleRunCheck() {
    if (!consent) {
      setError('O consentimento LGPD é obrigatório')
      return
    }

    trackBackgroundCheckStarted()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/background-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidate.fullName.trim(),
          candidateCpf: candidate.cpf.replace(/\D/g, ''),
          candidateDob: candidate.dob,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao iniciar pagamento')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <PriceReminder />
      <StepIndicator currentStep="consent" />

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
              &quot;{CONSENT_MSG}&quot;
            </div>
            <button
              type="button"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(CONSENT_MSG)}`, '_blank')}
              className="text-emerald-500 hover:text-emerald-600 text-xs font-medium underline"
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
            <Button variant="outline" onClick={onBack} className="flex-1">
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
  )
}
