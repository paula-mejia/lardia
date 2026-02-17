'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useCepLookup } from '@/hooks/use-cep-lookup'
import { useApi } from '@/hooks/use-api'
import { formatCPF, formatCEP } from '@/components/employee-form/format'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  User, Users, Bell, Rocket,
  ArrowRight, ArrowLeft, Check, Loader2
} from 'lucide-react'

// -- Types --

interface OnboardingForm {
  full_name: string
  cpf: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  notify_deadlines: boolean
  notify_updates: boolean
}

const STEPS = [
  { label: 'Dados do empregador', icon: User },
  { label: 'Primeira empregada', icon: Users },
  { label: 'Notificações', icon: Bell },
  { label: 'Conheça a LarDia', icon: Rocket },
] as const

// -- Step Components --

/**
 * Employer personal info and address fields.
 */
function StepEmployerInfo({
  register,
  watch,
  setValue,
  cepLoading,
  onCepBlur,
}: {
  register: ReturnType<typeof useForm<OnboardingForm>>['register']
  watch: ReturnType<typeof useForm<OnboardingForm>>['watch']
  setValue: ReturnType<typeof useForm<OnboardingForm>>['setValue']
  cepLoading: boolean
  onCepBlur: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="full_name">Nome completo</Label>
        <Input
          id="full_name"
          {...register('full_name')}
          placeholder="Maria da Silva"
        />
      </div>
      <div>
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          value={watch('cpf')}
          onChange={e => setValue('cpf', formatCPF(e.target.value))}
          placeholder="000.000.000-00"
        />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div>
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={watch('cep')}
            onChange={e => setValue('cep', formatCEP(e.target.value))}
            onBlur={onCepBlur}
            placeholder="00000-000"
          />
        </div>
        {cepLoading && <Loader2 className="animate-spin mt-7 h-5 w-5 text-muted-foreground" />}
      </div>
      <div>
        <Label htmlFor="street">Rua</Label>
        <Input id="street" {...register('street')} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="number">Número</Label>
          <Input id="number" {...register('number')} />
        </div>
        <div>
          <Label htmlFor="complement">Complemento</Label>
          <Input id="complement" {...register('complement')} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input id="neighborhood" {...register('neighborhood')} />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" {...register('city')} />
        </div>
        <div>
          <Label htmlFor="state">UF</Label>
          <Input id="state" {...register('state')} maxLength={2} />
        </div>
      </div>
    </div>
  )
}

/**
 * Prompt to register the first domestic employee.
 */
function StepFirstEmployee() {
  return (
    <div className="space-y-4 text-center py-4">
      <Users className="mx-auto h-12 w-12 text-primary" />
      <h3 className="text-lg font-semibold">Cadastre sua primeira empregada</h3>
      <p className="text-muted-foreground text-sm">
        Para começar a usar a LarDia, você precisa cadastrar pelo menos uma empregada doméstica.
        Pode fazer isso agora ou depois no painel principal.
      </p>
      <Button asChild className="mt-2">
        <a href="/dashboard/employees/new">
          <Users className="h-4 w-4 mr-2" />
          Cadastrar empregada
        </a>
      </Button>
      <p className="text-xs text-muted-foreground">
        Você pode pular esta etapa e cadastrar depois.
      </p>
    </div>
  )
}

/**
 * Notification preference toggles.
 */
function StepNotifications({
  watch,
  setValue,
}: {
  watch: ReturnType<typeof useForm<OnboardingForm>>['watch']
  setValue: ReturnType<typeof useForm<OnboardingForm>>['setValue']
}) {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id="notify_deadlines"
          checked={watch('notify_deadlines')}
          onCheckedChange={v => setValue('notify_deadlines', !!v)}
        />
        <div>
          <Label htmlFor="notify_deadlines" className="font-medium">Prazos e vencimentos</Label>
          <p className="text-sm text-muted-foreground">
            Receba lembretes sobre datas importantes do eSocial, FGTS e INSS.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox
          id="notify_updates"
          checked={watch('notify_updates')}
          onCheckedChange={v => setValue('notify_updates', !!v)}
        />
        <div>
          <Label htmlFor="notify_updates" className="font-medium">Novidades da LarDia</Label>
          <p className="text-sm text-muted-foreground">
            Fique por dentro de novas funcionalidades e atualizações.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Quick tour of LarDia features.
 */
function StepTour() {
  const features = [
    { icon: '📊', title: 'Folha de pagamento', desc: 'Calcule salários com todos os descontos automaticamente.' },
    { icon: '🏖️', title: 'Férias', desc: 'Controle períodos de férias e calcule valores com precisão.' },
    { icon: '🎄', title: '13º salário', desc: 'Cálculo automático das parcelas do décimo terceiro.' },
    { icon: '📅', title: 'Calendário', desc: 'Acompanhe prazos e datas importantes do eSocial.' },
    { icon: '📄', title: 'Rescisão', desc: 'Simulação completa de rescisão contratual.' },
  ]

  return (
    <div className="space-y-4 py-2">
      <p className="text-sm text-muted-foreground text-center mb-4">
        Conheça as principais funcionalidades da LarDia:
      </p>
      {features.map(f => (
        <div key={f.title} className="flex items-start gap-3 p-3 rounded-lg border">
          <span className="text-2xl">{f.icon}</span>
          <div>
            <p className="font-medium text-sm">{f.title}</p>
            <p className="text-xs text-muted-foreground">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// -- Main Page --

/**
 * Onboarding wizard page. Collects employer data, notification preferences,
 * and presents a feature tour before redirecting to the dashboard.
 */
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  const { register, watch, setValue, getValues, reset } = useForm<OnboardingForm>({
    defaultValues: {
      full_name: '', cpf: '', cep: '', street: '', number: '',
      complement: '', neighborhood: '', city: '', state: '',
      notify_deadlines: true, notify_updates: true,
    },
  })

  const lookupCep = useCepLookup<OnboardingForm>(setValue)
  const [cepLoading, setCepLoading] = useState(false)

  /** Upsert employer data to Supabase. */
  const saveEmployer = useCallback(async (data: Partial<OnboardingForm> & { onboarding_completed?: boolean }) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const payload = {
      full_name: data.full_name,
      cpf: data.cpf?.replace(/\D/g, ''),
      cep: data.cep?.replace(/\D/g, ''),
      street: data.street,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      ...(data.notify_deadlines !== undefined && { notify_deadlines: data.notify_deadlines }),
      ...(data.notify_updates !== undefined && { notify_updates: data.notify_updates }),
      ...(data.onboarding_completed !== undefined && { onboarding_completed: data.onboarding_completed }),
    }

    const { data: existing } = await supabase
      .from('employers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const { error } = existing
      ? await supabase.from('employers').update(payload).eq('user_id', user.id)
      : await supabase.from('employers').insert({ ...payload, user_id: user.id })

    if (error) throw new Error(error.message)
    return true
  }, [])

  const { execute: executeSave, loading: saving } = useApi(saveEmployer as (...args: unknown[]) => Promise<boolean>)

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
          notify_deadlines: data.notify_deadlines ?? true,
          notify_updates: data.notify_updates ?? true,
        })
      }
    }
    load()
  }, [reset])

  /** Handle CEP blur to auto-fill address fields. */
  async function handleCepBlur() {
    setCepLoading(true)
    try {
      await lookupCep(getValues('cep'))
    } finally {
      setCepLoading(false)
    }
  }

  /** Finish onboarding: save all data and redirect to dashboard. */
  async function handleFinish() {
    const values = getValues()
    const result = await executeSave({ ...values, onboarding_completed: true } as any)
    if (result) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  /** Save employer data when leaving step 0. */
  async function handleNextFromStep0() {
    const values = getValues()
    await executeSave(values as any)
    setStep(s => s + 1)
  }

  const fullName = watch('full_name')
  const cpf = watch('cpf')
  const isStep1Valid = fullName.trim().length > 0 && cpf.replace(/\D/g, '').length === 11
  const canNext = step === 0 ? isStep1Valid : true
  const isLast = step === STEPS.length - 1

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
            {(() => { const Icon = STEPS[step].icon; return <Icon className="h-4 w-4" /> })()}
            <span>Passo {step + 1} de {STEPS.length}: {STEPS[step].label}</span>
          </div>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <StepEmployerInfo
              register={register}
              watch={watch}
              setValue={setValue}
              cepLoading={cepLoading}
              onCepBlur={handleCepBlur}
            />
          )}
          {step === 1 && <StepFirstEmployee />}
          {step === 2 && <StepNotifications watch={watch} setValue={setValue} />}
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
              <Button
                onClick={step === 0 ? handleNextFromStep0 : () => setStep(s => s + 1)}
                disabled={!canNext}
              >
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
