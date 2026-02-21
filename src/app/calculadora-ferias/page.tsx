import type { Metadata } from 'next'
import FeriasCalculatorClient from './ferias-calculator-client'
import Navbar from '@/components/landing/navbar'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Calculadora de Férias da Empregada Doméstica 2026 | LarDia',
  description:
    'Calcule as férias da empregada doméstica em 2026. Simule férias completas ou proporcionais, abono pecuniário, 1/3 constitucional, INSS e IRRF. Grátis e atualizado.',
  keywords: [
    'calculadora férias empregada doméstica',
    'férias empregada doméstica 2026',
    'cálculo férias doméstica',
    'abono pecuniário empregada doméstica',
    '1/3 constitucional férias',
    'INSS férias doméstica',
  ],
  openGraph: {
    title: 'Calculadora de Férias da Empregada Doméstica 2026',
    description:
      'Simule férias completas ou proporcionais, com abono pecuniário, INSS e IRRF. Resultado instantâneo e gratuito.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://lardia.com.br/calculadora-ferias',
    siteName: 'LarDia',
  },
  alternates: {
    canonical: 'https://lardia.com.br/calculadora-ferias',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Férias da Empregada Doméstica 2026',
  description:
    'Calculadora gratuita de férias para empregada doméstica. Calcula férias completas, proporcionais, abono pecuniário, INSS e IRRF.',
  url: 'https://lardia.com.br/calculadora-ferias',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
  provider: { '@type': 'Organization', name: 'LarDia', url: 'https://lardia.com.br' },
}

export default function CalculadoraFeriasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <FeriasCalculatorClient />
      <Footer />
    </>
  )
}
