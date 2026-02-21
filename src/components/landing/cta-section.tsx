import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CtaSection() {
  return (
    <section className="py-16 md:py-24 bg-emerald-500 dark:bg-emerald-600">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6">
          Comece hoje a gerenciar seu empregado doméstico dentro da lei
        </h2>
        <p className="text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
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
