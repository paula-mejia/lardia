import type { Metadata } from 'next'
import ThirteenthCalculator from '@/components/thirteenth-calculator'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Calculadora de 13º Salário da Empregada Doméstica 2026',
  description:
    'Calcule o 13º salário da empregada doméstica em 2026. Simule a 1ª e 2ª parcela com descontos de INSS e IRRF. Grátis e atualizado.',
  openGraph: {
    title: 'Calculadora de 13º Salário da Empregada Doméstica 2026',
    description:
      'Simule as duas parcelas do décimo terceiro com descontos de INSS e IRRF. Resultado instantâneo.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://lardia.com.br/calculadoras/decimo-terceiro',
    siteName: 'LarDia',
  },
  alternates: {
    canonical: 'https://lardia.com.br/calculadoras/decimo-terceiro',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de 13º Salário da Empregada Doméstica 2026',
  description:
    'Calculadora gratuita de 13º salário para empregada doméstica com INSS e IRRF.',
  url: 'https://lardia.com.br/calculadoras/decimo-terceiro',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
  provider: { '@type': 'Organization', name: 'LarDia', url: 'https://lardia.com.br' },
}

export default function DecimoTerceiroPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">13º Salário</h1>
            <p className="text-sm text-muted-foreground">Calcule as duas parcelas do décimo terceiro</p>
          </div>
        </div>
        <ThirteenthCalculator />
      </div>
    </main>
    </>
  )
}
