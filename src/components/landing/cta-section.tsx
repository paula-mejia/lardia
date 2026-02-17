import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CtaSection() {
  return (
    <section className="py-16 md:py-24 bg-emerald-500 dark:bg-emerald-600">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-4">
          Comece hoje a gerenciar seu empregado doméstico dentro da lei
        </h2>
        <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8">
          Sem planilha, sem contador, sem estresse. Cadastre-se grátis e
          coloque o eSocial no piloto automático hoje mesmo.
        </p>
        <Link href="/signup">
          <Button size="lg" variant="secondary" className="text-base px-8">
            Começar grátis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
