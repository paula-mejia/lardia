/** Form data for employer onboarding step */
export interface EmployerFormData {
  full_name: string
  cpf: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

/** Notification preferences for onboarding */
export interface NotificationPrefs {
  notify_deadlines: boolean
  notify_updates: boolean
}

export const EMPLOYER_FORM_DEFAULTS: EmployerFormData = {
  full_name: '',
  cpf: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
}

export const NOTIFICATION_DEFAULTS: NotificationPrefs = {
  notify_deadlines: true,
  notify_updates: true,
}

export const STEPS = [
  { label: 'Dados do empregador', icon: 'User' as const },
  { label: 'Primeira empregada', icon: 'Users' as const },
  { label: 'Notificações', icon: 'Bell' as const },
  { label: 'Conheça a LarDia', icon: 'Rocket' as const },
] as const
