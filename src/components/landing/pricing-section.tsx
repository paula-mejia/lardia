import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const freeTierFeatures = [
  'Calculadora de folha',
  'Calculadora de 13º salário',
  'Calculadora de férias',
  'Calculadora de rescisão',
]

const basicTierFeatures = [
  'Tudo do plano Grátis',
  'Dashboard de empregados',
  'Calendário de obrigações',
  'Contracheque em PDF',
  'Alertas por e-mail',
  'Histórico de cálculos',
]

const completeTierFeatures = [
  'Tudo do plano Básico',
  'Gestão eSocial automatizada',
  'Geração de DAE',
  'Fechamento mensal automático',
  'Notificações por WhatsApp',
  'Suporte prioritário',
]

export default function PricingSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-muted-foreground text-lg">
            Comece grátis com as calculadoras ou desbloqueie a gestão completa
            do eSocial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {/* Free Tier */}
          <Card className="border shadow-sm">
            <CardContent className="pt-8 pb-8">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Grátis
              </p>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-5xl font-bold">0</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">para sempre</p>

              <ul className="text-left space-y-3 mb-8">
                {freeTierFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="#calculadora">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base"
                >
                  Usar grátis
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Basic Tier */}
          <Card className="border shadow-sm">
            <CardContent className="pt-8 pb-8">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Básico
              </p>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-5xl font-bold">29,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                por empregado
              </p>

              <ul className="text-left space-y-3 mb-8">
                {basicTierFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base"
                >
                  Começar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Complete Tier */}
          <Card className="border-2 border-emerald-500 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                Mais popular
              </Badge>
            </div>
            <CardContent className="pt-8 pb-8">
              <p className="text-sm font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wide mb-2">
                Completo
              </p>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-5xl font-bold">49,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                por empregado
              </p>

              <ul className="text-left space-y-3 mb-8">
                {completeTierFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button size="lg" className="w-full text-base">
                  Começar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                7 dias grátis · Cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
