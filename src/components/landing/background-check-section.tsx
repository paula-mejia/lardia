import { Button } from '@/components/ui/button'
import { Search, Shield, Scale, UserCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const checks = [
  { icon: Shield, label: 'Antecedentes criminais' },
  { icon: Scale, label: 'Processos judiciais' },
  { icon: UserCheck, label: 'Validação de CPF' },
]

export default function BackgroundCheckSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
            <Search className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Verificação de antecedentes
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Contrate com segurança. Antes de admitir, verifique antecedentes
            criminais, processos judiciais e validação de CPF do candidato.
            Tudo online, com resultado em minutos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            {checks.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4">
                <item.icon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-sm text-muted-foreground">R$</span>
              <span className="text-4xl font-bold">99,90</span>
              <span className="text-muted-foreground">por consulta</span>
            </div>
          </div>

          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Verificar agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
