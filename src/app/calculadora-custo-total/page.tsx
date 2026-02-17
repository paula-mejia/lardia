import type { Metadata } from 'next'
import CustoTotalCalculatorClient from './custo-total-calculator-client'

export const metadata: Metadata = {
  title: 'Quanto Custa uma Empregada Doméstica em 2026 - Simulador Completo | LarDia',
  description:
    'Descubra o custo total anual de uma empregada doméstica em 2026. Inclui salário, INSS, FGTS, férias, 13° e vale-transporte. Simulador gratuito e atualizado.',
  keywords: [
    'quanto custa empregada doméstica 2026',
    'custo total empregada doméstica',
    'encargos empregada doméstica',
    'INSS patronal empregada doméstica',
    'FGTS empregada doméstica',
    'simulador custo empregada doméstica',
    'DAE empregada doméstica',
  ],
  openGraph: {
    title: 'Quanto Custa uma Empregada Doméstica em 2026? — Simulador Completo',
    description:
      'Simulador gratuito com todos os encargos: INSS, FGTS, férias, 13°, vale-transporte. Veja o custo real mensal e anual.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://lardia.com.br/calculadora-custo-total',
    siteName: 'LarDia',
  },
  alternates: {
    canonical: 'https://lardia.com.br/calculadora-custo-total',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Simulador de Custo Total de Empregada Doméstica 2026',
  description:
    'Calculadora gratuita para simular o custo total anual de uma empregada doméstica no Brasil em 2026, incluindo todos os encargos.',
  url: 'https://lardia.com.br/calculadora-custo-total',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
  provider: { '@type': 'Organization', name: 'LarDia', url: 'https://lardia.com.br' },
}

export default function CalculadoraCustoTotalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CustoTotalCalculatorClient />
    </>
  )
}
