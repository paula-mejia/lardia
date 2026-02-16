import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, UserCheck, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    icon: ClipboardList,
    step: '1',
    title: 'Cadastro',
    desc: 'Cadastre sua empregada com os dados básicos. A LarDia configura tudo no eSocial para você.',
  },
  {
    icon: UserCheck,
    step: '2',
    title: 'Procuração',
    desc: 'Autorize a LarDia a enviar eventos no eSocial em seu nome com uma procuração digital simples.',
  },
  {
    icon: Zap,
    step: '3',
    title: 'Automacao',
    desc: 'Pronto. Todo mês a folha é fechada, os eventos são enviados e a guia DAE é gerada automaticamente.',
  },
]

export default function EsocialSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="secondary" className="mb-4">Novidade</Badge>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Gestão completa do eSocial
          </h2>
          <p className="text-muted-foreground text-lg">
            A LarDia cuida do envio mensal, geração da DAE e controle de prazos.
            Você não precisa mais de um contador para manter tudo em dia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
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

        {/* Connector arrows (visible on md+) */}
        <div className="hidden md:flex justify-center items-center gap-2 -mt-8 mb-8">
          <p className="text-sm text-muted-foreground font-medium">
            Cadastro → Procuração → Automacao
          </p>
        </div>

        <div className="text-center">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Quero automatizar meu eSocial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
