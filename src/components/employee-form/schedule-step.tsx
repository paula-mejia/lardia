'use client'

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { InfoTip } from '@/components/ui/info-tip'
import type { EmployeeFormData } from './types'

interface ScheduleStepProps {
  onBack: () => void
  onSubmit: () => void
  loading: boolean
  error: string | null
}

export function ScheduleStep({ onBack, onSubmit, loading, error }: ScheduleStepProps) {
  const { register, watch, setValue } = useFormContext<EmployeeFormData>()
  const scheduleType = watch('scheduleType')
  const weeklyHours = watch('weeklyHours')
  const fullName = watch('fullName')
  const cpf = watch('cpf')
  const role = watch('role')
  const admissionDate = watch('admissionDate')
  const salary = watch('salary')
  const contractType = watch('contractType')
  const experienceDays = watch('experienceDays')

  return (
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
          <Select value={scheduleType} onValueChange={(v) => setValue('scheduleType', v)}>
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
            {...register('weeklyHours')}
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
          <Button variant="outline" onClick={onBack}>Voltar</Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Cadastrar empregada'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
