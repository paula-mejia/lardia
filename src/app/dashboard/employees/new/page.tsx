'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { trackEmployeeAdded } from '@/lib/analytics'
import { trackAuditEvent } from '@/lib/audit-client'
import { generateReferralCode, trackReferral } from '@/lib/referral'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function InfoTip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="inline h-4 w-4 ml-1 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">{children}</TooltipContent>
    </Tooltip>
  )
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

const ROLES = [
  'Empregado(a) doméstico(a) nos serviços gerais',
  'Babá',
  'Cozinheiro(a)',
  'Motorista particular',
  'Jardineiro(a)',
  'Cuidador(a) de idosos',
  'Passadeira/Lavadeira',
  'Arrumador(a)',
  'Faxineiro(a)',
]

export default function NewEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  // Step 1: Personal data
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [race, setRace] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [educationLevel, setEducationLevel] = useState('')

  // Step 2: Address
  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  // Step 3: Contract
  const [role, setRole] = useState(ROLES[0])
  const [admissionDate, setAdmissionDate] = useState('')
  const [contractType, setContractType] = useState('indeterminate')
  const [experienceDays, setExperienceDays] = useState('90')
  const [salary, setSalary] = useState('1518')
  const [paymentFrequency, setPaymentFrequency] = useState('monthly')

  // Step 4: Work schedule
  const [scheduleType, setScheduleType] = useState('fixed')
  const [weeklyHours, setWeeklyHours] = useState('44')

  async function lookupCEP() {
    if (cep.replace(/\D/g, '').length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setStreet(data.logradouro || '')
        setNeighborhood(data.bairro || '')
        setCity(data.localidade || '')
        setState(data.uf || '')
      }
    } catch { /* ignore */ }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Você precisa estar logado.')
      setLoading(false)
      return
    }

    // Get or create employer profile
    let { data: employer } = await supabase
      .from('employers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!employer) {
      const { data: newEmployer, error: empError } = await supabase
        .from('employers')
        .insert({
          user_id: user.id,
          full_name: user.email || 'Empregador',
          cpf: '000.000.000-00',
          email: user.email,
          referral_code: generateReferralCode(),
        })
        .select('id')
        .single()

      if (empError) {
        setError('Erro ao criar perfil de empregador.')
        setLoading(false)
        return
      }
      employer = newEmployer

      // Track referral if user signed up with a ref code
      const refCode = localStorage.getItem('lardia_ref')
        || user.user_metadata?.referral_code
      if (refCode && newEmployer) {
        await trackReferral(refCode, newEmployer.id)
        localStorage.removeItem('lardia_ref')
      }
    }

    // Create employee
    const { error: empError } = await supabase
      .from('employees')
      .insert({
        employer_id: employer!.id,
        full_name: fullName,
        cpf: cpf.replace(/\D/g, ''),
        birth_date: birthDate || null,
        race: race || null,
        marital_status: maritalStatus || null,
        education_level: educationLevel || null,
        cep: cep.replace(/\D/g, '') || null,
        street: street || null,
        number: number || null,
        complement: complement || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
        role,
        admission_date: admissionDate,
        contract_type: contractType,
        experience_days: contractType === 'experience' ? parseInt(experienceDays) : null,
        salary: parseFloat(salary),
        payment_frequency: paymentFrequency,
        schedule_type: scheduleType,
        weekly_hours: parseFloat(weeklyHours),
      })

    if (empError) {
      setError('Erro ao cadastrar empregada. Verifique os dados e tente novamente.')
      setLoading(false)
      return
    }

    trackEmployeeAdded()
    trackAuditEvent('employee_created', 'employee', { name: fullName, role })
    router.push('/dashboard')
    router.refresh()
  }

  const canAdvanceStep1 = fullName.trim() && cpf.replace(/\D/g, '').length === 11
  const canAdvanceStep3 = admissionDate && parseFloat(salary) > 0
  const totalSteps = 4

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Cadastrar empregada</h1>
            <p className="text-sm text-muted-foreground">Passo {step} de {totalSteps}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        {/* Step 1: Personal Data */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Dados pessoais</CardTitle>
              <CardDescription>Informações básicas da empregada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Maria da Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Data de nascimento</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Raça/Cor
                  <InfoTip>Autodeclarado pela empregada, conforme exigência do eSocial.</InfoTip>
                </Label>
                <Select value={race} onValueChange={setRace}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branca">Branca</SelectItem>
                    <SelectItem value="preta">Preta</SelectItem>
                    <SelectItem value="parda">Parda</SelectItem>
                    <SelectItem value="amarela">Amarela</SelectItem>
                    <SelectItem value="indigena">Indígena</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado civil</Label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      <SelectItem value="uniao_estavel">União estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Escolaridade</Label>
                  <Select value={educationLevel} onValueChange={setEducationLevel}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fundamental_incompleto">Fundamental incompleto</SelectItem>
                      <SelectItem value="fundamental">Fundamental completo</SelectItem>
                      <SelectItem value="medio_incompleto">Médio incompleto</SelectItem>
                      <SelectItem value="medio">Médio completo</SelectItem>
                      <SelectItem value="superior_incompleto">Superior incompleto</SelectItem>
                      <SelectItem value="superior">Superior completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} disabled={!canAdvanceStep1}>
                  Próximo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Endereço da empregada</CardTitle>
              <CardDescription>Residência do trabalhador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    id="cep"
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    onBlur={lookupCEP}
                    placeholder="00000-000"
                    className="w-40"
                  />
                  <Button variant="outline" size="sm" onClick={lookupCEP}>
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input id="complement" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, bloco, etc." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} className="uppercase" />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                <Button onClick={() => setStep(3)}>Próximo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contract */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Dados contratuais</CardTitle>
              <CardDescription>Informações do contrato de trabalho</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admission">Data de admissão *</Label>
                  <Input
                    id="admission"
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salário (R$) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Tipo de contrato
                  <InfoTip>
                    Prazo indeterminado: contrato sem data de término. 
                    Experiência: permite testar a empregada por até 90 dias. Se não funcionar, a rescisão é mais barata (sem aviso prévio).
                  </InfoTip>
                </Label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indeterminate">Prazo indeterminado</SelectItem>
                    <SelectItem value="experience">Experiência (até 90 dias)</SelectItem>
                    <SelectItem value="fixed_term">Prazo determinado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {contractType === 'experience' && (
                <div className="space-y-2">
                  <Label>Período de experiência</Label>
                  <Select value={experienceDays} onValueChange={setExperienceDays}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="45">45 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Frequência de pagamento</Label>
                <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="biweekly">Quinzenal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                <Button onClick={() => setStep(4)} disabled={!canAdvanceStep3}>Próximo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Work Schedule */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Jornada de trabalho</CardTitle>
              <CardDescription>Horários e carga horária semanal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Tipo de jornada
                  <InfoTip>
                    Horário fixo: segunda a sexta (ou sábado), com horários definidos.
                    12×36: trabalha 12h, folga 36h.
                  </InfoTip>
                </Label>
                <Select value={scheduleType} onValueChange={setScheduleType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Horário fixo</SelectItem>
                    <SelectItem value="12x36">12×36</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">
                  Horas semanais
                  <InfoTip>
                    Máximo: 44 horas semanais (8h/dia de seg-sex + 4h sábado).
                    Jornada parcial: até 25 horas semanais.
                    Intervalo obrigatório: 1h para jornada &gt; 6h, 15min para jornada ≤ 6h.
                  </InfoTip>
                </Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="1"
                  max="44"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Jornada padrão: 44h (seg-sex 8h + sáb 4h)
                </p>
              </div>

              <Separator />

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="font-medium text-sm">Resumo do cadastro</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Nome:</span>
                  <span>{fullName}</span>
                  <span className="text-muted-foreground">CPF:</span>
                  <span>{cpf}</span>
                  <span className="text-muted-foreground">Cargo:</span>
                  <span>{role}</span>
                  <span className="text-muted-foreground">Admissão:</span>
                  <span>{admissionDate ? new Date(admissionDate + 'T12:00').toLocaleDateString('pt-BR') : '-'}</span>
                  <span className="text-muted-foreground">Salário:</span>
                  <span>R$ {parseFloat(salary || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-muted-foreground">Contrato:</span>
                  <span>{contractType === 'indeterminate' ? 'Prazo indeterminado' : contractType === 'experience' ? `Experiência (${experienceDays} dias)` : 'Prazo determinado'}</span>
                  <span className="text-muted-foreground">Jornada:</span>
                  <span>{weeklyHours}h semanais</span>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(3)}>Voltar</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Salvando...' : 'Cadastrar empregada'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
