import { Card, CardContent } from '@/components/ui/card'
import {
  Calculator,
  FileText,
  Bell,
  Receipt,
  Palmtree,
  Gift,
} from 'lucide-react'

const features = [
  {
    icon: Calculator,
    title: 'Cálculo automático da folha',
    desc: 'INSS progressivo, IRRF, FGTS e GILRAT calculados com precisão. Sempre atualizado com as tabelas vigentes.',
  },
  {
    icon: Receipt,
    title: 'Geração de DAE',
    desc: 'A guia DAE gerada automaticamente todo mês, pronta para pagar. Sem entrar no eSocial.',
  },
  {
    icon: Bell,
    title: 'Alertas de vencimento',
    desc: 'Notificações antes de cada prazo: DAE, férias, 13º. Nunca mais pague multa por esquecimento.',
  },
  {
    icon: FileText,
    title: 'Contracheques em PDF',
    desc: 'Gere o contracheque com um clique. Formatado, correto e pronto para imprimir ou enviar por WhatsApp.',
  },
  {
    icon: Palmtree,
    title: 'Férias e rescisão',
    desc: 'Cálculo completo de férias (inclusive proporcionais) e rescisão com todos os verbas, sem erro.',
  },
  {
    icon: Gift,
    title: '13º salário',
    desc: 'Primeira e segunda parcela calculadas automaticamente nos prazos legais, com todos os descontos.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Tudo que você precisa, num só lugar
          </h2>
          <p className="text-muted-foreground text-lg">
            A LarDia automatiza os cálculos e te lembra de cada obrigação.
            Você só precisa pagar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
