'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCepLookup } from '@/hooks/use-cep-lookup'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  User, Users, Bell, Rocket,
  ArrowRight, ArrowLeft, Check, Loader2
} from 'lucide-react'

// -- Helpers --

function formatCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatCEP(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

// -- Types --

interface EmployerForm {
  full_name: string
  cpf: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

interface NotificationPrefs {
  notify_deadlines: boolean
  notify_updates: boolean
}

const STEPS = [
  { label: 'Dados do empregador', icon: User },
  { label: 'Primeira empregada', icon: Users },
  { label: 'Notificações', icon: Bell },
  { label: 'Conheca a LarDia', icon: Rocket },
]

// -- Step Components --

function StepEmployerInfo({
  form, setForm, cepLoading, onCepBlur
}: {
  form: EmployerForm
  setForm: (f: EmployerForm) => void
  cepLoading: boolean
  onCepBlur: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="full_name">Nome completo</Label>
        <Input
          id="full_name"
          value={form.full_name}
          onChange={e => setForm({ ...form, full_name: e.target.value })}
          placeholder="Maria da Silva"
        />
      </div>
      <div>
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          value={form.cpf}
          onChange={e => setForm({ ...form, cpf: formatCPF(e.target.value) })}
          placeholder="000.000.000-00"
        />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div>
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={form.cep}
            onChange={e => setForm({ ...form, cep: formatCEP(e.target.value) })}
            onBlur={onCepBlur}
            placeholder="00000-000"
          />
        </div>
        {cepLoading && <Loader2 className="animate-spin mt-7 h-5 w-5 text-muted-foreground" />}
      </div>
      <div>
        <Label htmlFor="street">Rua</Label>
        <Input
          id="street"
          value={form.street}
          onChange={e => setForm({ ...form, street: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            value={form.number}
            onChange={e => setForm({ ...form, number: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            value={form.complement}
            onChange={e => setForm({ ...form, complement: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            value={form.neighborhood}
            onChange={e => setForm({ ...form, neighborhood: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={form.city}
            onChange={e => setForm({ ...form, city: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="state">UF</Label>
          <Input
            id="state"
            value={form.state}
            onChange={e => setForm({ ...form, state: e.target.value })}
            maxLength={2}
          />
        </div>
      </div>
    </div>
  )
}

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

function StepNotifications({
  prefs, setPrefs
}: {
  prefs: NotificationPrefs
  setPrefs: (p: NotificationPrefs) => void
}) {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id="notify_deadlines"
          checked={prefs.notify_deadlines}
          onCheckedChange={v => setPrefs({ ...prefs, notify_deadlines: !!v })}
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
          checked={prefs.notify_updates}
          onCheckedChange={v => setPrefs({ ...prefs, notify_updates: !!v })}
        />
        <div>
          <Label htmlFor="notify_updates" className="font-medium">Novidades da LarDia</Label>
          <p className="text-sm text-muted-foreground">
            Fique por dentro de novas funcionalidades e atualizacoes.
          </p>
        </div>
      </div>
    </div>
  )
}

function StepTour() {
  const features = [
    { icon: '📊', title: 'Folha de pagamento', desc: 'Calcule salários com todos os descontos automaticamente.' },
    { icon: '🏖️', title: 'Férias', desc: 'Controle períodos de férias e calcule valores com precisão.' },
    { icon: '🎄', title: '13o salário', desc: 'Cálculo automático das parcelas do décimo terceiro.' },
    { icon: '📅', title: 'Calendário', desc: 'Acompanhe prazos e datas importantes do eSocial.' },
    { icon: '📄', title: 'Rescisão', desc: 'Simulação completa de rescisão contratual.' },
  ]

  return (
    <div className="space-y-4 py-2">
      <p className="text-sm text-muted-foreground text-center mb-4">
        Conhega as principais funcionalidades da LarDia:
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

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const { lookup: lookupCep, loading: cepLoading } = useCepLookup()

  const [form, setForm] = useState<EmployerForm>({
    full_name: '', cpf: '', cep: '', street: '', number: '',
    complement: '', neighborhood: '', city: '', state: ''
  })

  const [prefs, setPrefs] = useState<NotificationPrefs>({
    notify_deadlines: true,
    notify_updates: true,
  })

  // Load existing employer data if any
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
        setForm({
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
  }, [])

  // ViaCEP lookup
  async function handleCepBlur() {
    const result = await lookupCep(form.cep)
    if (result) {
      setForm(prev => ({
        ...prev,
        street: result.street || prev.street,
        neighborhood: result.neighborhood || prev.neighborhood,
        city: result.city || prev.city,
        state: result.state || prev.state,
      }))
    }
  }

  async function handleFinish() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Try update first (if employer already exists), then insert
      const { data: existing } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', user.id)
        .single()

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
        notify_deadlines: prefs.notify_deadlines,
        notify_updates: prefs.notify_updates,
        onboarding_completed: true,
      }

      let error
      if (existing) {
        const result = await supabase
          .from('employers')
          .update(employerData)
          .eq('user_id', user.id)
        error = result.error
      } else {
        const result = await supabase
          .from('employers')
          .insert({ ...employerData, user_id: user.id })
        error = result.error
      }

      if (error) {
        console.error('Onboarding save error:', error)
        alert('Erro ao salvar: ' + error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const isStep1Valid = form.full_name.trim().length > 0 && form.cpf.replace(/\D/g, '').length === 11
  const canNext = step === 0 ? isStep1Valid : true
  const isLast = step === STEPS.length - 1

  // Save employer data when leaving step 1 (so it persists even if user navigates away)
  async function saveEmployerData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('employers')
      .select('id')
      .eq('user_id', user.id)
      .single()

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
    }

    if (existing) {
      await supabase.from('employers').update(employerData).eq('user_id', user.id)
    } else {
      await supabase.from('employers').insert({ ...employerData, user_id: user.id })
    }
  }

  return (
    <div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Bem-vindo a LarDia!</CardTitle>
          <CardDescription>Vamos configurar sua conta em poucos passos.</CardDescription>
          {/* Progress */}
          <div className="flex gap-1 pt-3">
            {STEPS.map((s, i) => (
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
              form={form}
              setForm={setForm}
              cepLoading={cepLoading}
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
                if (step === 0) await saveEmployerData()
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
