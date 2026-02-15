// Shared types for the LarDia application

// Database entity types
export interface Employer {
  id: string
  user_id: string
  full_name: string
  email: string | null
  cpf: string | null
  phone: string | null
  address: string | null
  onboarding_completed: boolean
  subscription_status: SubscriptionStatus
  stripe_customer_id: string | null
  referral_code: string | null
  referral_bonus_months: number
  esocial_connected: boolean
  esocial_connected_at: string | null
  created_at: string
}

export type SubscriptionStatus =
  | 'none'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'

export interface Employee {
  id: string
  employer_id: string
  full_name: string
  cpf: string
  role: string
  salary: number
  admission_date: string
  status: EmployeeStatus
  created_at: string
}

export type EmployeeStatus =
  | 'active'
  | 'on_vacation'
  | 'on_leave'
  | 'terminated'

export interface BackgroundCheck {
  id: string
  employer_id: string
  candidate_name: string
  candidate_cpf: string
  candidate_dob: string
  status: 'pending' | 'completed' | 'failed'
  paid: boolean
  results: Record<string, unknown> | null
  created_at: string
}

export interface Contract {
  id: string
  employer_id: string
  employee_id: string
  contract_type: string
  start_date: string
  end_date: string | null
  status: 'active' | 'terminated'
  created_at: string
}

export interface ESocialEvent {
  id: string
  employer_id: string
  employee_id: string
  event_type: string
  event_data: Record<string, unknown>
  status: string
  reference_month: number
  reference_year: number
  submitted_at: string | null
  created_at: string
}

export interface DAERecord {
  id: string
  employer_id: string
  reference_month: number
  reference_year: number
  total_amount: number
  due_date: string
  status: string
  barcode: string | null
  breakdown: Record<string, unknown>
  employees: Record<string, unknown>[]
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referee_id: string | null
  status: 'pending' | 'completed' | 'rewarded'
  completed_at: string | null
  created_at: string
}

// Component prop types
export interface EmployeeListItem {
  id: string
  full_name: string
  role: string
  salary: number
  admission_date: string
  status: string
}
