/** Step identifiers for the background check wizard. */
export type Step = 'intro' | 'info' | 'consent' | 'processing'

/** Minimal employee data used for the pre-fill dropdown. */
export interface EmployeeOption {
  id: string
  full_name: string
  cpf: string
}

/** Candidate data collected in the info step. */
export interface CandidateData {
  fullName: string
  cpf: string
  dob: string
}
