'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { trackEmployeeAdded } from '@/lib/analytics'
import { trackAuditEvent } from '@/lib/audit-client'
import { generateReferralCode, trackReferral } from '@/lib/referral'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  PersonalInfoStep,
  AddressStep,
  ContractStep,
  ScheduleStep,
  DEFAULT_VALUES,
  type EmployeeFormData,
} from '@/components/employee-form'

const TOTAL_STEPS = 4

export default function NewEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  const methods = useForm<EmployeeFormData>({ defaultValues: DEFAULT_VALUES })

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const data = methods.getValues()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Você precisa estar logado.')
      setLoading(false)
      return
    }

    // Get employer profile (must exist from onboarding step 1)
    const { data: employer } = await supabase
      .from('employers')
      .select('id, onboarding_completed')
      .eq('user_id', user.id)
      .single()

    if (!employer) {
      // No employer at all - redirect to onboarding
      window.location.href = '/dashboard/onboarding'
      return
    }

    const { error: empError } = await supabase
      .from('employees')
      .insert({
        employer_id: employer!.id,
        full_name: data.fullName,
        cpf: data.cpf.replace(/\D/g, ''),
        birth_date: data.birthDate || null,
        race: data.race || null,
        marital_status: data.maritalStatus || null,
        education_level: data.educationLevel || null,
        cep: data.cep.replace(/\D/g, '') || null,
        street: data.street || null,
        number: data.number || null,
        complement: data.complement || null,
        neighborhood: data.neighborhood || null,
        city: data.city || null,
        state: data.state || null,
        role: data.role,
        admission_date: data.admissionDate,
        contract_type: data.contractType,
        experience_days: data.contractType === 'experience' ? parseInt(data.experienceDays) : null,
        salary: parseFloat(data.salary),
        payment_frequency: data.paymentFrequency,
        schedule_type: data.scheduleType,
        weekly_hours: parseFloat(data.weeklyHours),
      })

    if (empError) {
      setError('Erro ao cadastrar empregada. Verifique os dados e tente novamente.')
      setLoading(false)
      return
    }

    trackEmployeeAdded()
    trackAuditEvent('employee_created', 'employee', { name: data.fullName, role: data.role })
    
    // If onboarding not complete, go back to continue onboarding
    if (!employer.onboarding_completed) {
      router.push('/dashboard/onboarding')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

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
            <p className="text-sm text-muted-foreground">Passo {step} de {TOTAL_STEPS}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        <FormProvider {...methods}>
          {step === 1 && <PersonalInfoStep onNext={() => setStep(2)} />}
          {step === 2 && <AddressStep onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <ContractStep onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {step === 4 && (
            <ScheduleStep
              onBack={() => setStep(3)}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          )}
        </FormProvider>
      </div>
    </div>
  )
}
