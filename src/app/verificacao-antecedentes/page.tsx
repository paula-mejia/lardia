import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Scale, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'Verificação de Antecedentes para Empregada Doméstica | LarDia',
  description:
    'Verifique antecedentes criminais e processos judiciais antes de contratar. Resultado em minutos. R$99,90 por consulta.',
}

const checks = [
  {
    icon: Shield,
    title: 'Antecedentes criminais',
    description: 'Consulta em bases de dados oficiais de todos os estados.',
  },
  {
    icon: Scale,
    title: 'Processos judiciais',
    description:
      'Verificação de ações na Justiça do Trabalho, Cível e Criminal.',
  },
  {
    icon: UserCheck,
    title: 'Validação de CPF',
    description:
      'Confirmação de dados cadastrais junto à Receita Federal.',
  },
]

const steps = [
  {
    number: '1',
    title: 'Informe o CPF',
    description: 'Digite o CPF do candidato que deseja verificar.',
  },
  {
    number: '2',
    title: 'Processamos a consulta',
    description:
      'Nossa tecnologia consulta múltiplas bases de dados em segundos.',
  },
  {
    number: '3',
    title: 'Receba o resultado',
    description:
      'Relatório completo enviado por e-mail e disponível no seu painel.',
  },
]

const faqs = [
  {
    question: 'Quanto tempo demora o resultado?',
    answer: 'O resultado é gerado em até 5 minutos após a consulta.',
  },
  {
    question: 'As informações são confiáveis?',
    answer:
      'Consultamos bases oficiais dos tribunais e da Receita Federal.',
  },
  {
    question: 'Posso verificar qualquer pessoa?',
    answer:
      'Sim, desde que você tenha o CPF e uma razão legítima (como processo de contratação).',
  },
  {
    question: 'Preciso ser assinante?',
    answer:
      'Não. A verificação está disponível avulsa por R$99,90. Assinantes do plano Completo ganham 1 consulta inclusa.',
  },
]

export default function VerificacaoAntecedentesPage() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-background py-20 md:py-28">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Contrate com segurança
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            Verifique antecedentes criminais e processos judiciais do seu
            candidato antes de admitir. Resultado em minutos, 100% online.
          </p>
          <Badge
            variant="secondary"
            className="text-base px-4 py-2 font-semibold"
          >
            R$ 99,90 por consulta
          </Badge>
        </div>
      </section>

      {/* What we check */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            O que verificamos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {checks.map((item) => (
              <Card key={item.title} className="text-center">
                <CardContent className="pt-8 pb-6">
                  <item.icon className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500 text-white text-xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 py-6"
            >
              Verificar agora
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
            Disponível para assinantes do plano Completo (1 consulta inclusa) ou
            avulso por R$99,90.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-muted/40">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Perguntas frequentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Ainda não tem conta?
          </p>
          <Link href="/signup">
            <Button
              variant="outline"
              size="lg"
              className="text-base"
            >
              Começar grátis
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
