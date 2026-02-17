import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Step 2: Prompt to register the first domestic employee.
 * Contains a link to the employee creation page.
 */
export function StepFirstEmployee() {
  return (
    <div className="space-y-4 text-center py-4">
      <Users className="mx-auto h-12 w-12 text-primary" />
      <h3 className="text-lg font-semibold">Cadastre sua primeira empregada</h3>
      <p className="text-muted-foreground text-sm">
        Para começar a usar a LarDia, você precisa cadastrar pelo menos uma empregada doméstica.
        Pode fazer isso agora ou depois no painel principal.
      </p>
      <Button asChild className="mt-2">
        <a href="/dashboard/employees/new">
          <Users className="h-4 w-4 mr-2" />
          Cadastrar empregada
        </a>
      </Button>
      <p className="text-xs text-muted-foreground">
        Você pode pular esta etapa e cadastrar depois.
      </p>
    </div>
  )
}
