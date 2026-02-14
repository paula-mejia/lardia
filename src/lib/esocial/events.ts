/**
 * eSocial event type definitions for domestic employers (Empregador Doméstico).
 * Based on eSocial simplified layout version 1.2.
 */

// Common types
export type EsocialEventStatus = 'draft' | 'submitted' | 'accepted' | 'rejected'
export type DaeStatus = 'generated' | 'paid' | 'overdue'

export interface EsocialEventBase {
  id?: string
  employerId: string
  employeeId?: string
  eventType: EsocialEventType
  status: EsocialEventStatus
  referenceMonth: number
  referenceYear: number
  createdAt?: string
  submittedAt?: string
  responseData?: Record<string, unknown>
}

export type EsocialEventType =
  | 'S-2200'
  | 'S-2206'
  | 'S-1200'
  | 'S-1210'
  | 'S-2230'
  | 'S-2250'
  | 'S-2299'
  | 'S-2300'

// S-2200: Cadastramento Inicial do Vinculo (employee admission)
export interface S2200Data {
  cpfTrabalhador: string
  nmTrabalhador: string
  dtNascimento: string // YYYY-MM-DD
  sexo: 'M' | 'F'
  grauInstrucao: string
  nmSoc?: string // social name
  paisNacionalidade: string
  endereco: {
    tipo: 'brasil' | 'exterior'
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cep: string
    codMunicipio: string
    uf: string
  }
  ctps?: {
    numero: string
    serie: string
    ufCtps: string
  }
  rg?: {
    numero: string
    orgaoEmissor: string
    dtExpedicao: string
  }
  dtAdmissao: string // YYYY-MM-DD
  tpRegJornada: number // 1=submetido a horario, 2=atividade externa, etc.
  qtdHrsSem: number // weekly hours
  vrSalario: number
  undSalario: number // 1=mensal, 2=hora, 5=diaria
  dscSalario?: string
  tpContr: number // 1=prazo indeterminado, 2=prazo determinado
  dtTermContr?: string // if fixed term
  localTrabalho: {
    tipo: 'empregadorDomestico'
    codMunicipio: string
    uf: string
  }
  dependentes?: Array<{
    tpDep: string
    nmDep: string
    dtNascDep: string
    cpfDep?: string
    depIRRF: boolean
    depSF: boolean
  }>
}

export interface S2200Event extends EsocialEventBase {
  eventType: 'S-2200'
  eventData: S2200Data
}

// S-2206: Alteracao Contratual (contract changes)
export interface S2206Data {
  cpfTrabalhador: string
  dtAlteracao: string // YYYY-MM-DD
  vrSalario?: number
  undSalario?: number
  dscSalario?: string
  tpRegJornada?: number
  qtdHrsSem?: number
  dscAlt?: string // description of changes
}

export interface S2206Event extends EsocialEventBase {
  eventType: 'S-2206'
  eventData: S2206Data
}

// S-1200: Remuneracao (monthly payroll)
export interface S1200Data {
  cpfTrabalhador: string
  perApur: string // YYYY-MM (reference period)
  ideEstabLot: {
    tpInsc: number // 1=CNPJ, 2=CPF
    nrInsc: string
  }
  remunPeriodo: {
    vrSalario: number
    horasExtras?: number
    vrHorasExtras?: number
    faltas?: number
    vrFaltas?: number
    dsrDescontado?: number
    vrDsr?: number
    outrosProventos?: number
    outrosDescontos?: number
    totalVencimentos: number
    totalDescontos: number
    totalLiquido: number
  }
  infoDescontos: {
    inssEmpregado: number
    irrfEmpregado: number
  }
  infoEmpregador: {
    inssPatronal: number
    gilrat: number
    fgtsmensal: number
    fgtsAntecipacao: number
    totalDae: number
  }
}

export interface S1200Event extends EsocialEventBase {
  eventType: 'S-1200'
  eventData: S1200Data
}

// S-1210: Pagamentos (payments)
export interface S1210Data {
  cpfTrabalhador: string
  dtPagamento: string // YYYY-MM-DD
  perRef: string // YYYY-MM
  vrLiquido: number
  tpPgto: number // 1=salario mensal, 2=ferias, 3=13o, etc.
  infoIRRF?: {
    vrBaseIRRF: number
    vrIRRF: number
  }
}

export interface S1210Event extends EsocialEventBase {
  eventType: 'S-1210'
  eventData: S1210Data
}

// S-2230: Afastamento Temporario (leave of absence)
export interface S2230Data {
  cpfTrabalhador: string
  dtIniAfast: string // YYYY-MM-DD
  dtFimAfast?: string // YYYY-MM-DD (null if ongoing)
  codMotAfast: string // reason code (e.g., '01'=doenca, '06'=maternidade)
  dscMotAfast?: string
  infoAtestado?: {
    codCID?: string
    qtdDiasAfast: number
    nmEmitente?: string
    crmEmitente?: string
  }
}

export interface S2230Event extends EsocialEventBase {
  eventType: 'S-2230'
  eventData: S2230Data
}

// S-2250: Aviso Previo
export interface S2250Data {
  cpfTrabalhador: string
  dtAvPrv: string // YYYY-MM-DD (notice date)
  dtPrevDeslig: string // YYYY-MM-DD (expected termination date)
  tpAvPrv: number // 1=dado pelo empregador, 2=dado pelo empregado
  observacao?: string
}

export interface S2250Event extends EsocialEventBase {
  eventType: 'S-2250'
  eventData: S2250Data
}

// S-2299: Desligamento (termination)
export interface S2299Data {
  cpfTrabalhador: string
  dtDeslig: string // YYYY-MM-DD
  mtvDeslig: string // termination reason code
  dtAvPrv?: string
  vrSaldoSalario: number
  vrFeriasVencidas?: number
  vrFeriasProporcional?: number
  vr13Proporcional?: number
  vrMultaFGTS?: number
  vrTotalRescisao: number
  pensaoAlim?: number
  observacao?: string
}

export interface S2299Event extends EsocialEventBase {
  eventType: 'S-2299'
  eventData: S2299Data
}

// S-2300: TSV - Inicio (Trabalhador Sem Vinculo - e.g., estagiarios)
export interface S2300Data {
  cpfTrabalhador: string
  nmTrabalhador: string
  dtNascimento: string
  dtInicio: string // YYYY-MM-DD
  codCategoria: number // e.g., 901=estagiario
  vrBolsa?: number
  natAtividade?: string
  dscAtividade?: string
}

export interface S2300Event extends EsocialEventBase {
  eventType: 'S-2300'
  eventData: S2300Data
}

// Union of all event types
export type EsocialEvent =
  | S2200Event
  | S2206Event
  | S1200Event
  | S1210Event
  | S2230Event
  | S2250Event
  | S2299Event
  | S2300Event

// DAE record
export interface DaeRecord {
  id?: string
  employerId: string
  referenceMonth: number
  referenceYear: number
  totalAmount: number
  dueDate: string // YYYY-MM-DD
  status: DaeStatus
  barcode: string
  generatedAt?: string
  paidAt?: string
  breakdown: {
    inssEmpregado: number
    inssPatronal: number
    gilrat: number
    fgtsmensal: number
    fgtsAntecipacao: number
  }
  employees: Array<{
    employeeId: string
    employeeName: string
    grossSalary: number
    inssEmpregado: number
    daeContribution: number
  }>
}

// Event type labels (Portuguese)
export const EVENT_TYPE_LABELS: Record<EsocialEventType, string> = {
  'S-2200': 'Cadastramento Inicial',
  'S-2206': 'Alteracao Contratual',
  'S-1200': 'Remuneracao',
  'S-1210': 'Pagamentos',
  'S-2230': 'Afastamento Temporario',
  'S-2250': 'Aviso Previo',
  'S-2299': 'Desligamento',
  'S-2300': 'TSV - Inicio',
}
