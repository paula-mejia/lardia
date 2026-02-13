// Recurring eSocial deadlines for domestic employers in Brazil

export type DeadlineType =
  | 'dae'
  | 'fgts'
  | 'esocial_closing'
  | 'vacation_notice'
  | 'thirteenth_1st'
  | 'thirteenth_2nd'
  | 'income_report'
  | 'dirf'

export interface DeadlineDefinition {
  type: DeadlineType
  label: string
  description: string
  color: string // tailwind bg class
}

export interface DeadlineInstance {
  type: DeadlineType
  label: string
  description: string
  color: string
  date: Date
  status: 'upcoming' | 'due_today' | 'past'
}

export const DEADLINE_DEFINITIONS: Record<DeadlineType, DeadlineDefinition> = {
  dae: {
    type: 'dae',
    label: 'Pagamento DAE',
    description:
      'Documento de Arrecadacao do eSocial. Recolhimento unificado de tributos e FGTS do empregado domestico. Vencimento no dia 7 de cada mes (ou proximo dia util).',
    color: 'bg-blue-500',
  },
  fgts: {
    type: 'fgts',
    label: 'FGTS Digital',
    description:
      'Recolhimento do FGTS pelo sistema FGTS Digital. Mesmo prazo do DAE: dia 7 de cada mes (ou proximo dia util).',
    color: 'bg-indigo-500',
  },
  esocial_closing: {
    type: 'esocial_closing',
    label: 'Fechamento eSocial',
    description:
      'Prazo para envio dos eventos periodicos (folha de pagamento) no eSocial. Dia 15 de cada mes.',
    color: 'bg-purple-500',
  },
  vacation_notice: {
    type: 'vacation_notice',
    label: 'Aviso de Ferias',
    description:
      'O empregador deve comunicar as ferias ao empregado com no minimo 30 dias de antecedencia.',
    color: 'bg-teal-500',
  },
  thirteenth_1st: {
    type: 'thirteenth_1st',
    label: '13o Salario (1a parcela)',
    description:
      'Primeira parcela do decimo terceiro salario. Deve ser paga ate 30 de novembro.',
    color: 'bg-orange-500',
  },
  thirteenth_2nd: {
    type: 'thirteenth_2nd',
    label: '13o Salario (2a parcela)',
    description:
      'Segunda parcela do decimo terceiro salario. Deve ser paga ate 20 de dezembro.',
    color: 'bg-red-500',
  },
  income_report: {
    type: 'income_report',
    label: 'Informe de Rendimentos',
    description:
      'Entrega do informe de rendimentos ao empregado para declaracao do IR. Prazo ate 28 de fevereiro.',
    color: 'bg-emerald-500',
  },
  dirf: {
    type: 'dirf',
    label: 'DIRF',
    description:
      'Declaracao do Imposto de Renda Retido na Fonte. Prazo ate 28 de fevereiro.',
    color: 'bg-green-500',
  },
}

// Brazilian national holidays (fixed dates). For a production app you'd use
// a proper holiday API or library, but these cover the main fixed holidays.
const FIXED_HOLIDAYS: Array<[number, number]> = [
  [1, 1],   // Confraternizacao Universal
  [4, 21],  // Tiradentes
  [5, 1],   // Dia do Trabalho
  [9, 7],   // Independencia
  [10, 12], // Nossa Senhora Aparecida
  [11, 2],  // Finados
  [11, 15], // Proclamacao da Republica
  [12, 25], // Natal
]

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

function isFixedHoliday(date: Date): boolean {
  const m = date.getMonth() + 1
  const d = date.getDate()
  return FIXED_HOLIDAYS.some(([hm, hd]) => hm === m && hd === d)
}

// Advance to next business day if weekend or fixed holiday
function nextBusinessDay(date: Date): Date {
  const d = new Date(date)
  while (isWeekend(d) || isFixedHoliday(d)) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

function getStatus(
  deadlineDate: Date,
  today: Date
): 'upcoming' | 'due_today' | 'past' {
  const dStr = deadlineDate.toISOString().slice(0, 10)
  const tStr = today.toISOString().slice(0, 10)
  if (dStr === tStr) return 'due_today'
  return deadlineDate > today ? 'upcoming' : 'past'
}

// Generate all deadline instances for a given year and month range
export function getDeadlinesForMonth(
  year: number,
  month: number, // 1-indexed
  today: Date = new Date()
): DeadlineInstance[] {
  const results: DeadlineInstance[] = []

  const addDeadline = (type: DeadlineType, date: Date) => {
    const def = DEADLINE_DEFINITIONS[type]
    results.push({
      ...def,
      date,
      status: getStatus(date, today),
    })
  }

  // DAE payment: day 7 (next business day if needed)
  const daeDate = nextBusinessDay(new Date(year, month - 1, 7))
  if (daeDate.getMonth() === month - 1) {
    addDeadline('dae', daeDate)
  }

  // FGTS Digital: same as DAE
  const fgtsDate = nextBusinessDay(new Date(year, month - 1, 7))
  if (fgtsDate.getMonth() === month - 1) {
    addDeadline('fgts', fgtsDate)
  }

  // eSocial monthly closing: day 15
  const esocialDate = new Date(year, month - 1, 15)
  addDeadline('esocial_closing', esocialDate)

  // 13th salary 1st installment: November 30
  if (month === 11) {
    addDeadline('thirteenth_1st', new Date(year, 10, 30))
  }

  // 13th salary 2nd installment: December 20
  if (month === 12) {
    addDeadline('thirteenth_2nd', new Date(year, 11, 20))
  }

  // Income report: February 28
  if (month === 2) {
    addDeadline('income_report', new Date(year, 1, 28))
  }

  // DIRF: February 28
  if (month === 2) {
    addDeadline('dirf', new Date(year, 1, 28))
  }

  return results.sort((a, b) => a.date.getTime() - b.date.getTime())
}

// Get deadlines for a date range (used for "next 30 days" view)
export function getDeadlinesInRange(
  start: Date,
  end: Date,
  today: Date = new Date()
): DeadlineInstance[] {
  const results: DeadlineInstance[] = []

  // Iterate over each month in range
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0)

  while (current <= endMonth) {
    const year = current.getFullYear()
    const month = current.getMonth() + 1
    const deadlines = getDeadlinesForMonth(year, month, today)

    for (const d of deadlines) {
      if (d.date >= start && d.date <= end) {
        results.push(d)
      }
    }

    current.setMonth(current.getMonth() + 1)
  }

  return results.sort((a, b) => a.date.getTime() - b.date.getTime())
}
