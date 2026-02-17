import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, ClipboardList, Coffee, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    icon: UserPlus,
    step: '1',
    title: 'Cadastre-se',
    desc: 'Crie sua conta gratuita em menos de 2 minutos. Sem cartão de crédito.',
  },
  {
    icon: ClipboardList,
    step: '2',
    title: 'Registre seu empregado',
    desc: 'Informe os dados básicos: nome, CPF, salário e data de admissão.',
  },
  {
    icon: ShieldCheck,
    step: '3',
    title: 'Conecte o eSocial',
    desc: 'Autorize a LarDia via procuração eletrônica no eCAC. Processo guiado, 100% digital.',
  },
  {
    icon: Coffee,
    step: '4',
    title: 'Relaxe',
    desc: 'A LarDia cuida do resto: folha, DAE, prazos e contracheques no piloto automático.',
  },
]

export default function EsocialSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground text-lg">
            Em 4 passos simples, você sai da confusão do eSocial para o piloto
            automático.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          {steps.map((item, i) => (
            <Card key={i} className="border shadow-sm text-center">
              <CardContent className="pt-6">
                <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-white text-xs font-bold mb-2">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="hidden md:flex justify-center items-center gap-2 -mt-8 mb-8">
          <p className="text-sm text-muted-foreground font-medium">
            Cadastre-se → Registre → Conecte → Relaxe
          </p>
        </div>

        <div className="text-center">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Começar agora — é grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
