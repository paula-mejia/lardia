'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

const ANNUAL_DISCOUNT = 0.20 // 20% off

interface Plan {
  name: string
  monthlyPrice: number // 0 for free
  subtitle: string
  features: string[]
  cta: string
  href: string
  highlighted: boolean
  solid: boolean
}

const plans: Plan[] = [
  {
    name: 'Grátis',
    monthlyPrice: 0,
    subtitle: '',
    features: [
      'Calculadoras de folha, férias, 13º e rescisão',
      'Tabelas atualizadas 2026',
    ],
    cta: 'Usar calculadoras',
    href: '/simulador',
    highlighted: false,
    solid: false,
  },
  {
    name: 'Básico',
    monthlyPrice: 29.90,
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
    monthlyPrice: 49.90,
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

function formatPrice(value: number): string {
  const [intPart, decPart] = value.toFixed(2).split('.')
  return `${intPart},${decPart}`
}

function formatPriceInt(value: number): { integer: string; decimal: string } {
  const [intPart, decPart] = value.toFixed(2).split('.')
  return { integer: intPart, decimal: decPart }
}

export default function PricingSection() {
  const [isAnual, setIsAnual] = useState(false)

  return (
    <section className="py-16 md:py-24">
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
          <button
            type="button"
            onClick={() => setIsAnual(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !isAnual
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
            }`}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setIsAnual(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              isAnual
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
            }`}
          >
            Anual
            <span className={`text-xs font-bold ${isAnual ? 'text-emerald-100' : 'text-emerald-600'}`}>
              -20%
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan) => {
            const isFree = plan.monthlyPrice === 0
            const effectiveMonthly = isAnual && !isFree
              ? Math.round(plan.monthlyPrice * (1 - ANNUAL_DISCOUNT) * 100) / 100
              : plan.monthlyPrice
            const annualTotal = isAnual && !isFree
              ? Math.round(effectiveMonthly * 12 * 100) / 100
              : 0
            const { integer, decimal } = isFree
              ? { integer: '0', decimal: '00' }
              : formatPriceInt(effectiveMonthly)

            return (
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
                {isAnual && !isFree && (
                  <div className="absolute top-2 right-3">
                    <Badge variant="outline" className="bg-white text-emerald-600 border-emerald-300 text-xs">
                      🔥 Economize 20%
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

                  {/* Price display */}
                  <div className="text-center mb-1">
                    {isAnual && !isFree && (
                      <p className="text-sm text-muted-foreground line-through mb-1">
                        R$ {formatPrice(plan.monthlyPrice)}/mês
                      </p>
                    )}
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <span className="text-5xl font-bold">{integer}</span>
                      <span className="text-xl font-bold">,{decimal}</span>
                      {!isFree && (
                        <span className="text-muted-foreground ml-1">/mês</span>
                      )}
                    </div>
                  </div>

                  {/* Annual total or free label */}
                  <div className="text-center mb-6 min-h-[2.5rem]">
                    {isFree ? (
                      <p className="text-sm text-muted-foreground">para sempre</p>
                    ) : isAnual ? (
                      <p className="text-sm text-muted-foreground">
                        Pague <span className="font-semibold text-foreground">R$ {formatPrice(annualTotal)}</span> à vista (pix/boleto/cartão)
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">&nbsp;</p>
                    )}
                  </div>

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
            )
          })}
        </div>
      </div>
    </section>
  )
}
