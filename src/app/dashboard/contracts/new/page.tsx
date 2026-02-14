'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import { generateEmploymentContractPDF } from '@/lib/pdf/employment-contract'
import type { ContractData } from '@/lib/pdf/employment-contract'
import { trackContractGenerated, trackPdfDownloaded } from '@/lib/analytics'

const JOB_FUNCTIONS = [
  'Empregado(a) domestico(a)',
  'Cozinheiro(a)',
  'Baba',
  'Motorista particular',
  'Jardineiro(a)',
  'Cuidador(a)',
]

interface Employee {
  id: string
  full_name: string
  cpf: string
  ctps_number: string
  address_street: string
  address_number: string
  address_neighborhood: string
  address_city: string
  address_state: string
  address_cep: string
  role: string
  salary: number
  admission_date: string
}

interface Employer {
  id: string
  full_name: string
  cpf: string
  address_street: string
  address_number: string
  address_neighborhood: string
  address_city: string
  address_state: string
  address_cep: string
}

export default function NewContractPage() {
  const router = useRouter()
  const supabase = createClient()

  const [employer, setEmployer] = useState<Employer | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    employerName: '',
    employerCpf: '',
    employerAddress: '',
    employeeName: '',
    employeeCpf: '',
    employeeCtps: '',
    employeeAddress: '',
    jobFunction: '',
    workLocation: '',
    hoursPerDay: 8,
    daysPerWeek: 6,
    startTime: '08:00',
    endTime: '17:00',
    breakTime: '1 hora',
    salary: 0,
    paymentDay: 5,
    startDate: '',
    contractType: 'indeterminado' as 'indeterminado' | 'determinado',
    endDate: '',
    valeTransporte: true,
    otherBenefits: '',
    trialPeriod: true,
    trialDays: 45,
    city: '',
    contractDate: new Date().toISOString().split('T')[0],
  })

  // Load employer and employees data
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: emp } = await supabase
        .from('employers')
        .select('id, full_name, cpf, address_street, address_number, address_neighborhood, address_city, address_state, address_cep')
        .eq('user_id', user.id)
        .single()

      if (emp) {
        setEmployer(emp)
        const address = [emp.address_street, emp.address_number, emp.address_neighborhood, emp.address_city, emp.address_state].filter(Boolean).join(', ')
        setForm(prev => ({
          ...prev,
          employerName: emp.full_name || '',
          employerCpf: emp.cpf || '',
          employerAddress: address,
          workLocation: address,
          city: emp.address_city || '',
        }))

        const { data: emps } = await supabase
          .from('employees')
          .select('id, full_name, cpf, ctps_number, address_street, address_number, address_neighborhood, address_city, address_state, address_cep, role, salary, admission_date')
          .eq('employer_id', emp.id)
          .eq('status', 'active')
          .order('full_name')

        if (emps) setEmployees(emps)
      }
    }
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fill employee data when selected
  function handleEmployeeSelect(employeeId: string) {
    setSelectedEmployeeId(employeeId)
    const emp = employees.find(e => e.id === employeeId)
    if (emp) {
      const address = [emp.address_street, emp.address_number, emp.address_neighborhood, emp.address_city, emp.address_state].filter(Boolean).join(', ')
      setForm(prev => ({
        ...prev,
        employeeName: emp.full_name || '',
        employeeCpf: emp.cpf || '',
        employeeCtps: emp.ctps_number || '',
        employeeAddress: address,
        jobFunction: emp.role || '',
        salary: emp.salary || 0,
        startDate: emp.admission_date || '',
      }))
    }
  }

  function updateForm(field: string, value: string | number | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleGenerateContract() {
    setSaving(true)
    try {
      const contractData: ContractData = { ...form }

      // Save to database
      if (employer && selectedEmployeeId) {
        await supabase.from('employment_contracts').insert({
          employer_id: employer.id,
          employee_id: selectedEmployeeId,
          contract_data: contractData,
          status: 'draft',
        })
      }

      // Generate and download PDF
      trackContractGenerated()
      trackPdfDownloaded('employment_contract')
      generateEmploymentContractPDF(contractData)

      router.push('/dashboard/contracts')
    } catch (err) {
      console.error('Error generating contract:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/contracts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Novo Contrato de Trabalho</h1>
            <p className="text-sm text-muted-foreground">Preencha os dados para gerar o contrato</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Employee selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Selecionar Empregado(a)</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedEmployeeId} onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um empregado cadastrado" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Employer data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do Empregador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Nome completo</Label>
                <Input value={form.employerName} onChange={e => updateForm('employerName', e.target.value)} />
              </div>
              <div>
                <Label>CPF</Label>
                <Input value={form.employerCpf} onChange={e => updateForm('employerCpf', e.target.value)} />
              </div>
              <div>
                <Label>Endereco</Label>
                <Input value={form.employerAddress} onChange={e => updateForm('employerAddress', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Employee data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do Empregado(a)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Nome completo</Label>
                <Input value={form.employeeName} onChange={e => updateForm('employeeName', e.target.value)} />
              </div>
              <div>
                <Label>CPF</Label>
                <Input value={form.employeeCpf} onChange={e => updateForm('employeeCpf', e.target.value)} />
              </div>
              <div>
                <Label>CTPS (numero)</Label>
                <Input value={form.employeeCtps} onChange={e => updateForm('employeeCtps', e.target.value)} />
              </div>
              <div>
                <Label>Endereco</Label>
                <Input value={form.employeeAddress} onChange={e => updateForm('employeeAddress', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Contract details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Funcao</Label>
                <Select value={form.jobFunction} onValueChange={v => updateForm('jobFunction', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a funcao" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_FUNCTIONS.map(fn => (
                      <SelectItem key={fn} value={fn}>{fn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Local de trabalho</Label>
                <Input value={form.workLocation} onChange={e => updateForm('workLocation', e.target.value)} />
              </div>
              <div>
                <Label>Data de inicio</Label>
                <Input type="date" value={form.startDate} onChange={e => updateForm('startDate', e.target.value)} />
              </div>
              <div>
                <Label>Tipo de contrato</Label>
                <Select value={form.contractType} onValueChange={v => updateForm('contractType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indeterminado">Prazo indeterminado</SelectItem>
                    <SelectItem value="determinado">Prazo determinado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.contractType === 'determinado' && (
                <div>
                  <Label>Data de termino</Label>
                  <Input type="date" value={form.endDate} onChange={e => updateForm('endDate', e.target.value)} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Jornada de Trabalho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Horas por dia</Label>
                  <Input type="number" value={form.hoursPerDay} onChange={e => updateForm('hoursPerDay', Number(e.target.value))} />
                </div>
                <div>
                  <Label>Dias por semana</Label>
                  <Input type="number" value={form.daysPerWeek} onChange={e => updateForm('daysPerWeek', Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Horario de entrada</Label>
                  <Input type="time" value={form.startTime} onChange={e => updateForm('startTime', e.target.value)} />
                </div>
                <div>
                  <Label>Horario de saida</Label>
                  <Input type="time" value={form.endTime} onChange={e => updateForm('endTime', e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Intervalo para refeicao</Label>
                <Input value={form.breakTime} onChange={e => updateForm('breakTime', e.target.value)} placeholder="Ex: 1 hora" />
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Remuneracao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Salario mensal (R$)</Label>
                <Input type="number" step="0.01" value={form.salary} onChange={e => updateForm('salary', Number(e.target.value))} />
              </div>
              <div>
                <Label>Dia do pagamento</Label>
                <Input type="number" min={1} max={31} value={form.paymentDay} onChange={e => updateForm('paymentDay', Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Beneficios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="valeTransporte"
                  checked={form.valeTransporte}
                  onCheckedChange={v => updateForm('valeTransporte', !!v)}
                />
                <Label htmlFor="valeTransporte">Vale-transporte</Label>
              </div>
              <div>
                <Label>Outros beneficios</Label>
                <Input value={form.otherBenefits} onChange={e => updateForm('otherBenefits', e.target.value)} placeholder="Ex: Vale-alimentacao, plano de saude" />
              </div>
            </CardContent>
          </Card>

          {/* Trial period */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Periodo de Experiencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="trialPeriod"
                  checked={form.trialPeriod}
                  onCheckedChange={v => updateForm('trialPeriod', !!v)}
                />
                <Label htmlFor="trialPeriod">Incluir periodo de experiencia</Label>
              </div>
              {form.trialPeriod && (
                <div>
                  <Label>Dias de experiencia</Label>
                  <Select value={String(form.trialDays)} onValueChange={v => updateForm('trialDays', Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="45">45 dias</SelectItem>
                      <SelectItem value="90">90 dias (45 + 45)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location and date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Local e Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Cidade</Label>
                <Input value={form.city} onChange={e => updateForm('city', e.target.value)} />
              </div>
              <div>
                <Label>Data do contrato</Label>
                <Input type="date" value={form.contractDate} onChange={e => updateForm('contractDate', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Generate button */}
          <Button
            onClick={handleGenerateContract}
            disabled={saving || !form.employeeName || !form.employerName}
            className="w-full"
            size="lg"
          >
            <FileText className="h-4 w-4 mr-2" />
            {saving ? 'Gerando...' : 'Gerar Contrato'}
          </Button>
        </div>
      </div>
    </>
  )
}
