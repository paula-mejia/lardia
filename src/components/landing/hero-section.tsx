import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-sky-50 dark:from-emerald-950/20 dark:to-sky-950/20" />
      <div className="relative container mx-auto px-4 py-20 md:py-32 text-center">
        <Badge variant="secondary" className="mb-6">
          Para empregadores domésticos no Brasil
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          eSocial sem erro,
          <br />
          <span className="text-emerald-500 dark:text-emerald-400">sem estresse</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Gestão completa do eSocial doméstico: folha de pagamento, guia DAE,
          fechamento mensal e todas as obrigações no piloto automático.
          Você cuida da sua família, a LarDia cuida do resto.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto text-base px-8">
              Comece agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#calculadora">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
              Testar calculadora grátis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
