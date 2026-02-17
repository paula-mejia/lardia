import { UserPlus, ClipboardList, PartyPopper } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    step: '1',
    title: 'Cadastre-se em 2 minutos',
    desc: 'Crie sua conta grátis. Sem cartão de crédito, sem burocracia.',
  },
  {
    icon: ClipboardList,
    step: '2',
    title: 'Registre seu empregado',
    desc: 'Preencha os dados do seu empregado doméstico e pronto.',
  },
  {
    icon: PartyPopper,
    step: '3',
    title: 'Relaxe, a LarDia cuida do resto',
    desc: 'Folha, DAE, férias, 13º — tudo calculado e enviado automaticamente.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground text-lg">
            Três passos para nunca mais se preocupar com o eSocial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <s.icon className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-emerald-500 dark:text-emerald-400">
                Passo {s.step}
              </span>
              <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
