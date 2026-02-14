import type { Metadata } from 'next'
import SimuladorClient from './simulador-client'

export const metadata: Metadata = {
  title: 'Quanto custa contratar uma empregada doméstica? | Simulador Lardia',
  description:
    'Descubra o custo total de contratar uma empregada doméstica em 2026. Simule salário, INSS, FGTS, férias, 13o e todos os encargos. Calculadora gratuita.',
  keywords: [
    'quanto custa empregada doméstica',
    'custo empregada doméstica',
    'simulador empregada doméstica',
    'encargos empregada doméstica',
    'custo total empregada doméstica 2026',
    'INSS empregada doméstica',
    'FGTS empregada doméstica',
    'eSocial doméstico',
  ],
  openGraph: {
    title: 'Quanto custa contratar uma empregada doméstica em 2026?',
    description:
      'Simulador gratuito: descubra o custo real com salário, INSS, FGTS, férias e 13o. Resultado instantâneo.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://lardia.com.br/simulador',
    siteName: 'Lardia',
  },
  alternates: {
    canonical: 'https://lardia.com.br/simulador',
  },
}

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Simulador de Custo de Empregada Doméstica',
  description:
    'Calculadora gratuita para simular o custo total de contratar uma empregada doméstica no Brasil em 2026.',
  url: 'https://lardia.com.br/simulador',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
  },
  provider: {
    '@type': 'Organization',
    name: 'Lardia',
    url: 'https://lardia.com.br',
  },
}

export default function SimuladorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SimuladorClient />
    </>
  )
}
