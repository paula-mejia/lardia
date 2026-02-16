import { Card, CardContent } from '@/components/ui/card'
import {
  AlertTriangle,
  Calculator,
  FileText,
  Calendar,
  Clock,
  Shield,
} from 'lucide-react'

const problems = [
  {
    icon: AlertTriangle,
    title: 'eSocial obrigatório',
    desc: 'Todos os empregadores domésticos precisam declarar no eSocial. O sistema é confuso e qualquer campo errado trava tudo.',
  },
  {
    icon: Calculator,
    title: 'Cálculos complexos',
    desc: 'INSS progressivo, IRRF com deduções, FGTS, GILRAT, antecipação rescisória... cada mês é um quebra-cabeça.',
  },
  {
    icon: FileText,
    title: 'Guia DAE todo mês',
    desc: 'A guia DAE precisa ser gerada é paga até o dia 7. Atrasou? Multa automática com juros.',
  },
  {
    icon: Calendar,
    title: 'Férias, 13o, rescisão',
    desc: 'Cada evento tem regras proprias, prazos legais e cálculos especificos que mudam conforme o caso.',
  },
  {
    icon: Clock,
    title: 'Prazos que não esperam',
    desc: 'Dia 7 para DAE, aviso de férias com 30 dias, 1a parcela do 13o até novembro. Esqueceu? Problema.',
  },
  {
    icon: Shield,
    title: 'Risco trabalhista',
    desc: 'Contracheque errado, FGTS não depositado ou férias mal calculadas podem virar ação na Justiça do Trabalho.',
  },
]

export default function ProblemSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Contratar uma empregada doméstica no Brasil e complicado
          </h2>
          <p className="text-muted-foreground text-lg">
            São dezenas de obrigações legais, cálculos complexos e prazos
            apertados. Um erro pode gerar multas ou processos trabalhistas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {problems.map((item, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="pt-6">
                <item.icon className="h-8 w-8 text-amber-500 mb-3" />
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
