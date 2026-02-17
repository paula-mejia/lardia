import type { Step } from './types'

const LABELS = ['Dados', 'Consentimento', 'Pagamento'] as const

/**
 * Horizontal progress bar showing which wizard step the user is on.
 * @param props.currentStep - The active step identifier
 */
export function StepIndicator({ currentStep }: { currentStep: Step }) {
  const stepIndex = currentStep === 'info' ? 0 : currentStep === 'consent' ? 1 : 2

  return (
    <div className="flex items-center gap-2">
      {LABELS.map((label, i) => {
        const isActive = i <= stepIndex
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`h-2 flex-1 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`} />
            <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
