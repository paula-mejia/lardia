import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Calculator, Plug, ShieldCheck, Clock, HeadphonesIcon } from 'lucide-react'

const benefits = [
  {
    icon: BookOpen,
    title: '31+ páginas de FAQ',
    desc: 'Base de conhecimento completa sobre eSocial doméstico, com respostas para todas as suas dúvidas.',
  },
  {
    icon: Calculator,
    title: 'Calculadoras gratuitas',
    desc: 'Folha, férias, 13º e rescisão. Calcule tudo sem cadastro, sem limite de uso.',
  },
  {
    icon: Plug,
    title: 'Integração eSocial',
    desc: 'Envio de eventos e geração da DAE direto pelo sistema, sem precisar acessar o portal do governo.',
  },
  {
    icon: ShieldCheck,
    title: 'Conformidade garantida',
    desc: 'Tabelas de INSS, IRRF e salário mínimo sempre atualizadas. Cálculos 100% dentro da lei.',
  },
  {
    icon: Clock,
    title: '5 minutos por mês',
    desc: 'No lugar de horas quebrando a cabeça no eSocial, você resolve tudo em poucos cliques.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Suporte humanizado',
    desc: 'Dúvida? Fale com a gente por WhatsApp. Sem robô, sem fila.',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Por que empregadores escolhem a LarDia
          </h2>
          <p className="text-muted-foreground text-lg">
            Criada por quem entende a dor de gerenciar empregado doméstico no
            Brasil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((item, i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                  <item.icon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
