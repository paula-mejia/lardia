'use client'

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InfoTip } from '@/components/ui/info-tip'
import { ROLES, type EmployeeFormData } from './types'

interface ContractStepProps {
  onNext: () => void
  onBack: () => void
}

export function ContractStep({ onNext, onBack }: ContractStepProps) {
  const { register, watch, setValue } = useFormContext<EmployeeFormData>()
  const role = watch('role')
  const admissionDate = watch('admissionDate')
  const salary = watch('salary')
  const contractType = watch('contractType')
  const experienceDays = watch('experienceDays')
  const paymentFrequency = watch('paymentFrequency')

  const canAdvance = admissionDate && parseFloat(salary) > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados contratuais</CardTitle>
        <CardDescription>Informações do contrato de trabalho</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Cargo</Label>
          <Select value={role} onValueChange={(v) => setValue('role', v)}>
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
              {...register('admissionDate')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salário (R$) *</Label>
            <Input
              id="salary"
              type="number"
              step="0.01"
              min="0"
              {...register('salary')}
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
          <Select value={contractType} onValueChange={(v) => setValue('contractType', v)}>
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
            <Select value={experienceDays} onValueChange={(v) => setValue('experienceDays', v)}>
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
          <Select value={paymentFrequency} onValueChange={(v) => setValue('paymentFrequency', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="biweekly">Quinzenal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>Voltar</Button>
          <Button onClick={onNext} disabled={!canAdvance}>Próximo</Button>
        </div>
      </CardContent>
    </Card>
  )
}
