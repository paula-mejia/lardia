'use client'

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InfoTip } from '@/components/ui/info-tip'
import { formatCPF } from './format'
import type { EmployeeFormData } from './types'

interface PersonalInfoStepProps {
  onNext: () => void
}

export function PersonalInfoStep({ onNext }: PersonalInfoStepProps) {
  const { register, watch, setValue } = useFormContext<EmployeeFormData>()
  const fullName = watch('fullName')
  const cpf = watch('cpf')
  const race = watch('race')
  const maritalStatus = watch('maritalStatus')
  const educationLevel = watch('educationLevel')

  const canAdvance = fullName.trim() && cpf.replace(/\D/g, '').length === 11

  return (
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
            {...register('fullName')}
            placeholder="Maria da Silva"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setValue('cpf', formatCPF(e.target.value))}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthdate">Data de nascimento</Label>
            <Input
              id="birthdate"
              type="date"
              {...register('birthDate')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Raça/Cor
            <InfoTip>Autodeclarado pela empregada, conforme exigência do eSocial.</InfoTip>
          </Label>
          <Select value={race} onValueChange={(v) => setValue('race', v)}>
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
            <Select value={maritalStatus} onValueChange={(v) => setValue('maritalStatus', v)}>
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
            <Select value={educationLevel} onValueChange={(v) => setValue('educationLevel', v)}>
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
          <Button onClick={onNext} disabled={!canAdvance}>
            Próximo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
