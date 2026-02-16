'use client'

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useCepLookup } from '@/hooks/use-cep-lookup'
import { formatCEP } from './format'
import type { EmployeeFormData } from './types'

interface AddressStepProps {
  onNext: () => void
  onBack: () => void
}

export function AddressStep({ onNext, onBack }: AddressStepProps) {
  const { register, watch, setValue } = useFormContext<EmployeeFormData>()
  const cep = watch('cep')
  const lookupCep = useCepLookup<EmployeeFormData>(setValue)

  return (
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
              onChange={(e) => setValue('cep', formatCEP(e.target.value))}
              onBlur={() => lookupCep(cep)}
              placeholder="00000-000"
              className="w-40"
            />
            <Button variant="outline" size="sm" onClick={() => lookupCep(cep)}>
              Buscar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="street">Rua</Label>
            <Input id="street" {...register('street')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input id="number" {...register('number')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input id="complement" {...register('complement')} placeholder="Apto, bloco, etc." />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input id="neighborhood" {...register('neighborhood')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" {...register('city')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">UF</Label>
            <Input id="state" {...register('state')} maxLength={2} className="uppercase" />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>Voltar</Button>
          <Button onClick={onNext}>Próximo</Button>
        </div>
      </CardContent>
    </Card>
  )
}
