import { UserPlus, ClipboardList, ShieldCheck, Armchair } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    icon: UserPlus,
    step: 1,
    title: 'Cadastre-se',
    desc: 'Crie sua conta gratuita em menos de 2 minutos. Sem cartão de crédito.',
  },
  {
    icon: ClipboardList,
    step: 2,
    title: 'Registre seu empregado',
    desc: 'Informe os dados básicos: nome, CPF, salário e data de admissão.',
  },
  {
    icon: ShieldCheck,
    step: 3,
    title: 'Conecte o eSocial',
    desc: 'Autorize a LarDia via procuração eletrônica no eCAC. Processo guiado, 100% digital.',
  },
  {
    icon: Armchair,
    step: 4,
    title: 'Relaxe',
    desc: 'A LarDia cuida do resto: folha, DAE, prazos e contracheques no piloto automático.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl">
            Em 4 passos simples, você sai da confusão do eSocial para o piloto automático.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm"
            >
              {/* Icon with number badge */}
              <div className="relative mx-auto mb-6 w-fit">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-200">
                  <s.icon className="h-10 w-10 text-emerald-500" strokeWidth={1.5} />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-bold shadow-sm ring-2 ring-white">
                  {s.step}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3">{s.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Breadcrumb */}
        <p className="text-center text-sm text-muted-foreground mb-8">
          Cadastre-se <ArrowRight className="inline h-3 w-3 mx-1" /> Registre <ArrowRight className="inline h-3 w-3 mx-1" /> Conecte <ArrowRight className="inline h-3 w-3 mx-1" /> Relaxe
        </p>

        {/* CTA */}
        <div className="text-center">
          <Link href="/signup">
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white text-base px-8 h-12">
              Começar agora — é grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
