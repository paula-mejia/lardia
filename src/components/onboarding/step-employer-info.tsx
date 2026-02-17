'use client'

import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { formatCPF, formatCEP } from '@/components/employee-form/format'
import type { EmployerFormData } from './types'

interface StepEmployerInfoProps {
  register: UseFormRegister<EmployerFormData>
  setValue: UseFormSetValue<EmployerFormData>
  watch: UseFormWatch<EmployerFormData>
  cepLoading: boolean
  onCepBlur: () => void
}

/**
 * Step 1: Employer personal info and address form fields.
 * Uses react-hook-form register/setValue for controlled inputs with formatting.
 */
export function StepEmployerInfo({
  register,
  setValue,
  watch,
  cepLoading,
  onCepBlur,
}: StepEmployerInfoProps) {
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
