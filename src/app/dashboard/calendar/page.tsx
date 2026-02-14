'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getDeadlinesForMonth,
  getDeadlinesInRange,
  DeadlineInstance,
  DEADLINE_DEFINITIONS,
} from '@/lib/deadlines'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

function statusStyles(status: DeadlineInstance['status']) {
  switch (status) {
    case 'due_today':
      return 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950'
    case 'upcoming':
      return 'bg-yellow-50 dark:bg-yellow-950'
    case 'past':
      return 'opacity-50'
  }
}

function statusBadge(status: DeadlineInstance['status']) {
  switch (status) {
    case 'due_today':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'upcoming':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'past':
      return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  }
}

function statusLabel(status: DeadlineInstance['status']) {
  switch (status) {
    case 'due_today':
      return 'Hoje'
    case 'upcoming':
      return 'Pendente'
    case 'past':
      return 'Passado'
  }
}

export default function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1) // 1-indexed
  const [selected, setSelected] = useState<DeadlineInstance | null>(null)

  const deadlines = useMemo(
    () => getDeadlinesForMonth(year, month, today),
    [year, month, today]
  )

  // Upcoming 30 days
  const upcoming = useMemo(() => {
    const start = new Date(today)
    const end = new Date(today)
    end.setDate(end.getDate() + 30)
    return getDeadlinesInRange(start, end, today)
  }, [today])

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const startOffset = firstDay.getDay() // 0=Sun

    const days: Array<{ day: number | null; deadlines: DeadlineInstance[] }> = []

    // Empty cells before first day
    for (let i = 0; i < startOffset; i++) {
      days.push({ day: null, deadlines: [] })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dayDeadlines = deadlines.filter(
        (dl) => dl.date.getDate() === d
      )
      days.push({ day: d, deadlines: dayDeadlines })
    }

    return days
  }, [year, month, deadlines])

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() + 1 &&
      year === today.getFullYear()
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Calendario de Obrigacoes</h1>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          {Object.values(DEADLINE_DEFINITIONS).map((def) => (
            <span key={def.type} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${def.color}`} />
              {def.label}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="border rounded-lg overflow-hidden mb-8">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 bg-muted">
            {WEEKDAY_NAMES.map((wd) => (
              <div
                key={wd}
                className="text-center text-xs font-medium py-2 text-muted-foreground"
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((cell, idx) => (
              <div
                key={idx}
                className={`min-h-[70px] border-t border-r p-1 text-sm ${
                  cell.day === null ? 'bg-muted/30' : ''
                } ${cell.day && isToday(cell.day) ? 'bg-accent/30' : ''}`}
              >
                {cell.day && (
                  <>
                    <span
                      className={`text-xs font-medium ${
                        isToday(cell.day) ? 'text-primary font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      {cell.day}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {cell.deadlines.map((dl, i) => (
                        <button
                          key={i}
                          onClick={() => setSelected(dl)}
                          className={`text-[10px] leading-tight px-1 py-0.5 rounded text-white truncate text-left ${dl.color} ${
                            dl.status === 'past' ? 'opacity-50' : ''
                          } hover:opacity-80 transition-opacity`}
                        >
                          {dl.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background rounded-lg shadow-lg p-6 max-w-md mx-4 w-full">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${selected.color}`} />
                  <h3 className="font-semibold text-lg">{selected.label}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {selected.date.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full mb-3 ${statusBadge(
                  selected.status
                )}`}
              >
                {statusLabel(selected.status)}
              </span>
              <p className="text-sm leading-relaxed">{selected.description}</p>
            </div>
          </div>
        )}

        {/* Upcoming 30 days */}
        <h2 className="text-lg font-semibold mb-3">Proximos 30 dias</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma obrigação nos próximos 30 dias.
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((dl, i) => (
              <button
                key={i}
                onClick={() => setSelected(dl)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors hover:bg-accent/50 ${statusStyles(
                  dl.status
                )}`}
              >
                <span className={`w-3 h-3 rounded-full shrink-0 ${dl.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{dl.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {dl.date.toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusBadge(
                    dl.status
                  )}`}
                >
                  {statusLabel(dl.status)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
