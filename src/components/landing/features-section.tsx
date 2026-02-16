import { Card, CardContent } from '@/components/ui/card'
import { Calculator, Calendar, Bell, FileText } from 'lucide-react'

const features = [
  {
    icon: Calculator,
    title: 'Cálculo automático',
    desc: 'Folha mensal, férias, 13o salário e rescisão calculados com precisão. Sempre atualizado com as tabelas vigentes de INSS, IRRF e salário mínimo.',
  },
  {
    icon: Calendar,
    title: 'Calendário de obrigações',
    desc: 'Veja todas as datas importantes do mês: vencimento da DAE, aviso de férias, parcelas do 13o. Nunca mais perca um prazo.',
  },
  {
    icon: Bell,
    title: 'Alertas e lembretes',
    desc: 'Receba notificações antes de cada prazo. DAE vencendo, férias se aproximando, 13o chegando. Tudo no seu tempo.',
  },
  {
    icon: FileText,
    title: 'Contracheque pronto',
    desc: 'Gere o contracheque da sua empregada com um clique. Formatado, correto e pronto para imprimir ou enviar por WhatsApp.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Tudo que você precisa, num so lugar
          </h2>
          <p className="text-muted-foreground text-lg">
            A LarDia automatiza os cálculos e te lembra de cada obrigação.
            Você so precisa pagar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((item, i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="pt-6 flex gap-4">
                <div className="shrink-0 h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
