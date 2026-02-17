import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, CreditCard, XCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const trustBadges = [
  { icon: CreditCard, text: 'Sem cartão de crédito' },
  { icon: XCircle, text: 'Cancele quando quiser' },
  { icon: MessageCircle, text: 'Suporte por WhatsApp' },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-sky-50 dark:from-emerald-950/20 dark:to-sky-950/20" />
      <div className="relative container mx-auto px-4 py-20 md:py-32 text-center">
        <Badge variant="secondary" className="mb-6">
          Para empregadores domésticos no Brasil
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Pare de arriscar multas
          <br />
          <span className="text-emerald-500 dark:text-emerald-400">
            com o eSocial doméstico
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Folha de pagamento, guia DAE, férias, 13º e rescisão calculados
          automaticamente. Você cuida da sua família, a LarDia cuida do eSocial.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto text-base px-8">
              Começar grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/calculadora">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base px-8"
            >
              Calcular salário
            </Button>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
          {trustBadges.map((badge, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <badge.icon className="h-4 w-4 text-emerald-500" />
              {badge.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
