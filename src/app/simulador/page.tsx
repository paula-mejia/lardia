import type { Metadata } from 'next'
import SimuladorClient from './simulador-client'

export const metadata: Metadata = {
  title: 'Quanto custa contratar uma empregada domestica? | Simulador Lardia',
  description:
    'Descubra o custo total de contratar uma empregada domestica em 2026. Simule salario, INSS, FGTS, ferias, 13o e todos os encargos. Calculadora gratuita.',
  keywords: [
    'quanto custa empregada domestica',
    'custo empregada domestica',
    'simulador empregada domestica',
    'encargos empregada domestica',
    'custo total empregada domestica 2026',
    'INSS empregada domestica',
    'FGTS empregada domestica',
    'eSocial domestico',
  ],
  openGraph: {
    title: 'Quanto custa contratar uma empregada domestica em 2026?',
    description:
      'Simulador gratuito: descubra o custo real com salario, INSS, FGTS, ferias e 13o. Resultado instantaneo.',
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
  name: 'Simulador de Custo de Empregada Domestica',
  description:
    'Calculadora gratuita para simular o custo total de contratar uma empregada domestica no Brasil em 2026.',
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
