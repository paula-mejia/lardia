import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle2 } from 'lucide-react'

/**
 * Processing / completion view shown while the background check runs.
 * @param props.loading - Whether the check is still in progress
 */
export function ProcessingStep({ loading }: { loading: boolean }) {
  return (
    <Card>
      <CardContent className="py-12 text-center space-y-4">
        {loading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium">Consultando bases de dados...</p>
            <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
            <p className="text-lg font-medium">Consulta finalizada!</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
