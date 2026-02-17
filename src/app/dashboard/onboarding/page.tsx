'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useCepLookup } from '@/hooks/use-cep-lookup'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  User, Users, Bell, Rocket,
  ArrowRight, ArrowLeft, Check, Loader2,
} from 'lucide-react'
import {
  StepEmployerInfo,
  StepFirstEmployee,
  StepNotifications,
  StepTour,
  EMPLOYER_FORM_DEFAULTS,
  NOTIFICATION_DEFAULTS,
  STEPS,
} from '@/components/onboarding'
import type { EmployerFormData, NotificationPrefs } from '@/components/onboarding'

const STEP_ICONS = { User, Users, Bell, Rocket } as const

/**
 * Onboarding wizard page. Guides new employers through account setup
 * in four steps: personal info, first employee, notifications, and product tour.
 */
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const { register, setValue, watch, reset, getValues } = useForm<EmployerFormData>({
    defaultValues: EMPLOYER_FORM_DEFAULTS,
  })

  const lookupCep = useCepLookup<EmployerFormData>(setValue)

  const [prefs, setPrefs] = useState<NotificationPrefs>(NOTIFICATION_DEFAULTS)

  // Load existing employer data
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) {
        reset({
          full_name: data.full_name || '',
          cpf: data.cpf || '',
          cep: data.cep || '',
          street: data.street || '',
          number: data.number || '',
          complement: data.complement || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
        })
        setPrefs({
          notify_deadlines: data.notify_deadlines ?? true,
          notify_updates: data.notify_updates ?? true,
        })
      }
    }
    load()
  }, [reset])

  /** CEP auto-fill via ViaCEP */
  async function handleCepBlur() {
    await lookupCep(getValues('cep'))
  }

  /** Persist employer data to Supabase (upsert) */
  async function upsertEmployer(extra: Record<string, unknown> = {}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    const form = getValues()
    const employerData = {
      full_name: form.full_name,
      cpf: form.cpf.replace(/\D/g, ''),
      cep: form.cep.replace(/\D/g, ''),
      street: form.street,
      number: form.number,
      complement: form.complement,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      ...extra,
    }

    const { data: existing } = await supabase
      .from('employers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return supabase.from('employers').update(employerData).eq('user_id', user.id)
    }
    return supabase.from('employers').insert({ ...employerData, user_id: user.id })
  }

  async function handleFinish() {
    setSaving(true)
    try {
      const { error } = await upsertEmployer({
        notify_deadlines: prefs.notify_deadlines,
        notify_updates: prefs.notify_updates,
        onboarding_completed: true,
      }) || {}
      if (error) {
        console.error('Onboarding save error:', error)
        alert('Erro ao salvar: ' + (error as Error).message)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const cpf = watch('cpf')
  const fullName = watch('full_name')
  const isStep1Valid = fullName.trim().length > 0 && cpf.replace(/\D/g, '').length === 11
  const canNext = step === 0 ? isStep1Valid : true
  const isLast = step === STEPS.length - 1
  const StepIcon = STEP_ICONS[STEPS[step].icon]

  return (
    <div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Bem-vindo à LarDia!</CardTitle>
          <CardDescription>Vamos configurar sua conta em poucos passos.</CardDescription>
          {/* Progress bar */}
          <div className="flex gap-1 pt-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
            <StepIcon className="h-4 w-4" />
            <span>Passo {step + 1} de {STEPS.length}: {STEPS[step].label}</span>
          </div>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <StepEmployerInfo
              register={register}
              setValue={setValue}
              watch={watch}
              cepLoading={false}
              onCepBlur={handleCepBlur}
            />
          )}
          {step === 1 && <StepFirstEmployee />}
          {step === 2 && <StepNotifications prefs={prefs} setPrefs={setPrefs} />}
          {step === 3 && <StepTour />}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            {isLast ? (
              <Button onClick={handleFinish} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                Concluir
              </Button>
            ) : (
              <Button onClick={async () => {
                if (step === 0) await upsertEmployer()
                setStep(s => s + 1)
              }} disabled={!canNext}>
                Próximo
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
