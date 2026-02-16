'use client'

import { formatBRL } from './format'
export { InfoTip } from '@/components/ui/info-tip'
import { InfoTip } from '@/components/ui/info-tip'

export function ResultRow({
  label,
  value,
  tip,
  variant = 'default',
  bold = false,
}: {
  label: string
  value: number
  tip?: string
  variant?: 'default' | 'earning' | 'deduction' | 'highlight'
  bold?: boolean
}) {
  const colorClass = {
    default: 'text-foreground',
    earning: 'text-emerald-500',
    deduction: 'text-red-500',
    highlight: 'text-primary',
  }[variant]

  return (
    <div className={`flex justify-between items-center py-1.5 ${bold ? 'font-semibold' : ''}`}>
      <span className="text-sm text-muted-foreground flex items-center">
        {label}{tip && <InfoTip>{tip}</InfoTip>}
      </span>
      <span className={`text-sm tabular-nums ${colorClass}`}>
        {variant === 'deduction' && value > 0 ? '- ' : ''}{formatBRL(value)}
      </span>
    </div>
  )
}
