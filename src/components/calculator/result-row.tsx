'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { formatBRL } from './format'

export function InfoTip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="inline h-4 w-4 ml-1 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">{children}</TooltipContent>
    </Tooltip>
  )
}

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
    earning: 'text-emerald-600',
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
