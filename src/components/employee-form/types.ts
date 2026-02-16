export interface EmployeeFormData {
  // Step 1: Personal
  fullName: string
  cpf: string
  birthDate: string
  race: string
  maritalStatus: string
  educationLevel: string

  // Step 2: Address
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string

  // Step 3: Contract
  role: string
  admissionDate: string
  contractType: string
  experienceDays: string
  salary: string
  paymentFrequency: string

  // Step 4: Schedule
  scheduleType: string
  weeklyHours: string
}

export const ROLES = [
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

export const DEFAULT_VALUES: EmployeeFormData = {
  fullName: '',
  cpf: '',
  birthDate: '',
  race: '',
  maritalStatus: '',
  educationLevel: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  role: ROLES[0],
  admissionDate: '',
  contractType: 'indeterminate',
  experienceDays: '90',
  salary: '1518',
  paymentFrequency: 'monthly',
  scheduleType: 'fixed',
  weeklyHours: '44',
}
