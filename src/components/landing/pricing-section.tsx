'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Grátis',
    price: '0',
    period: 'para sempre',
    subtitle: '',
    features: [
      'Calculadoras de folha, férias, 13º e rescisão',
      'Tabelas atualizadas 2026',
    ],
    cta: 'Usar calculadoras',
    href: '/calculadora',
    highlighted: false,
    solid: false,
  },
  {
    name: 'Básico',
    price: '29,90',
    period: '/mês',
    subtitle: 'Para quem quer organizar',
    features: [
      'Tudo do plano Grátis',
      'Dashboard completo',
      'Calendário de obrigações',
      'Contracheques em PDF',
      'Alertas por e-mail',
      'Histórico de pagamentos',
    ],
    cta: 'Escolher Básico',
    href: '/signup',
    highlighted: false,
    solid: false,
  },
  {
    name: 'Completo',
    price: '49,90',
    period: '/mês',
    subtitle: 'Tranquilidade total',
    features: [
      'Tudo do plano Básico',
      'Gestão eSocial automatizada',
      'Geração de guia DAE',
      'Fechamento mensal automático',
      'Notificações via WhatsApp',
      '1 verificação de antecedentes inclusa',
      'Suporte prioritário',
    ],
    cta: 'Começar teste grátis',
    href: '/signup',
    highlighted: true,
    solid: true,
  },
]

export default function PricingSection() {
  const [isAnual, setIsAnual] = useState(false)

  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-4">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-muted-foreground text-lg">
            Comece grátis com as calculadoras ou desbloqueie a gestão completa
            do eSocial.
          </p>
        </div>

        {/* Mensal / Anual toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span
            className={`text-sm font-medium ${!isAnual ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Mensal
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isAnual}
            onClick={() => setIsAnual(!isAnual)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isAnual ? 'bg-emerald-500' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                isAnual ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${isAnual ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Anual
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`shadow-sm relative ${
                plan.highlighted
                  ? 'border-2 border-emerald-500 shadow-lg'
                  : 'border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 uppercase text-xs tracking-wide">
                    Mais Popular
                  </Badge>
                </div>
              )}
              <CardContent className="pt-8 pb-8">
                <p
                  className={`text-sm font-medium uppercase tracking-wide mb-1 ${
                    plan.highlighted
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {plan.name}
                </p>
                {plan.subtitle && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.subtitle}
                  </p>
                )}
                {!plan.subtitle && <div className="mb-4" />}

                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period !== 'para sempre' && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {plan.period === 'para sempre' ? 'para sempre' : ''}
                </p>

                {isAnual && plan.price !== '0' && (
                  <p className="text-xs text-emerald-600 font-medium mb-4 text-center">
                    Em breve
                  </p>
                )}

                <ul className="text-left space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      {feature === '1 verificação de antecedentes inclusa' ? (
                        <Link href="/verificacao-antecedentes" className="underline underline-offset-2 hover:text-emerald-600">
                          {feature}
                        </Link>
                      ) : (
                        feature
                      )}
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    variant={plan.solid ? 'default' : 'outline'}
                    size="lg"
                    className={`w-full text-base ${
                      plan.solid
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : ''
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
                {plan.highlighted && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    7 dias grátis · Cancele quando quiser
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
