import ThirteenthCalculator from '@/components/thirteenth-calculator'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DecimoTerceiroPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">13º Salário</h1>
            <p className="text-sm text-muted-foreground">Calcule as duas parcelas do décimo terceiro</p>
          </div>
        </div>
        <ThirteenthCalculator />
      </div>
    </main>
  )
}
