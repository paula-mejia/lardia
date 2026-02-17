'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepIndicator } from './step-indicator'
import { PriceReminder } from './price-reminder'
import { formatCpf } from './utils'
import type { EmployeeOption, CandidateData } from './types'

interface CandidateInfoFormProps {
  /** Called when the user submits valid candidate data. */
  onSubmit: (data: CandidateData) => void
  /** Called when the user clicks "Voltar". */
  onBack: () => void
  /** Pre-existing candidate data to populate the form. */
  initialData?: CandidateData
}

/**
 * Form step that collects candidate name, CPF and date of birth.
 * Optionally pre-fills from an existing employee record.
 */
export function CandidateInfoForm({ onSubmit, onBack, initialData }: CandidateInfoFormProps) {
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [fullName, setFullName] = useState(initialData?.fullName ?? '')
  const [cpf, setCpf] = useState(initialData?.cpf ?? '')
  const [dob, setDob] = useState(initialData?.dob ?? '')
  const [error, setError] = useState<string | null>(null)

  // Load employees for the pre-fill dropdown
  useEffect(() => {
    fetch('/api/employees?fields=id,full_name,cpf')
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []))
      .catch(() => {})
  }, [])

  /** Handle employee selection and auto-fill fields. */
  function handleEmployeeSelect(employeeId: string) {
    setSelectedEmployeeId(employeeId)
    if (employeeId === '__manual__') {
      setFullName('')
      setCpf('')
      return
    }
    const emp = employees.find((e) => e.id === employeeId)
    if (emp) {
      setFullName(emp.full_name)
      setCpf(formatCpf(emp.cpf))
    }
  }

  /** Validate and advance. */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Informe o nome completo do candidato')
      return
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF deve ter 11 dígitos')
      return
    }
    if (!dob) {
      setError('Informe a data de nascimento')
      return
    }

    onSubmit({ fullName, cpf, dob })
  }

  return (
    <div className="space-y-4">
      <PriceReminder />
      <StepIndicator currentStep="info" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados do Candidato</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {employees.length > 0 && (
              <div className="space-y-2">
                <Label>Preencher a partir de empregado cadastrado</Label>
                <Select value={selectedEmployeeId} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar empregado (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__manual__">Inserir manualmente</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                placeholder="Nome completo do candidato"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Data de nascimento</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Voltar
              </Button>
              <Button type="submit" className="flex-1">
                Continuar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
