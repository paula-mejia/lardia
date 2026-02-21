'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'

const faqs = [
  {
    q: 'Preciso de cartão de crédito para criar a conta?',
    a: 'Não. Você pode criar sua conta e usar as calculadoras gratuitamente, sem informar nenhum dado de pagamento.',
  },
  {
    q: 'A LarDia substitui um contador?',
    a: 'Para a maioria dos empregadores domésticos, sim. A LarDia automatiza os cálculos, gera a DAE e controla os prazos do eSocial. Em casos mais complexos, recomendamos consultar um profissional.',
  },
  {
    q: 'Como funciona a integração com o eSocial?',
    a: 'No plano Completo, a LarDia envia os eventos mensais diretamente ao eSocial e gera a guia DAE automaticamente. Você só precisa autorizar via procuração digital.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Não há fidelidade nem multa por cancelamento. Você pode cancelar seu plano a qualquer momento pelo painel.',
  },
  {
    q: 'Os cálculos estão sempre atualizados?',
    a: 'Sim. As tabelas de INSS, IRRF e salário mínimo são atualizadas assim que publicadas pelo governo. Você não precisa se preocupar com isso.',
  },
  {
    q: 'Posso cadastrar mais de um empregado?',
    a: 'Sim. Nos planos pagos, cada empregado adicional é cobrado separadamente. Não há limite de empregados.',
  },
]

export default function FaqSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl">
            Tire suas principais dúvidas sobre a LarDia.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="text-emerald-500 hover:text-emerald-600 font-medium text-sm underline underline-offset-4"
            >
              Ver todas as perguntas →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
