import { Badge } from '@/components/ui/badge'

/**
 * Amber banner reminding the user of the per-check cost.
 */
export function PriceReminder() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Custo desta consulta</span>
      <Badge className="bg-amber-600 hover:bg-amber-600 text-white text-sm">R$&nbsp;99,90</Badge>
    </div>
  )
}
