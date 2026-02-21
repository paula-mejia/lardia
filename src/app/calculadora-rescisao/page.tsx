import type { Metadata } from 'next'
import RescisaoCalculatorClient from './rescisao-calculator-client'
import Navbar from '@/components/landing/navbar'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Calculadora de Rescisão da Empregada Doméstica 2026 | LarDia',
  description:
    'Calcule a rescisão da empregada doméstica em 2026. Simule demissão sem justa causa, pedido de demissão, justa causa e acordo mútuo. Gratuito e atualizado.',
  keywords: [
    'calculadora rescisão empregada doméstica',
    'rescisão empregada doméstica 2026',
    'demissão empregada doméstica',
    'FGTS multa empregada doméstica',
    'aviso prévio empregada doméstica',
    'TRCT empregada doméstica',
  ],
  openGraph: {
    title: 'Calculadora de Rescisão da Empregada Doméstica 2026',
    description:
      'Simule todos os tipos de rescisão: sem justa causa, justa causa, pedido de demissão e acordo mútuo. Resultado instantâneo.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://lardia.com.br/calculadora-rescisao',
    siteName: 'LarDia',
  },
  alternates: {
    canonical: 'https://lardia.com.br/calculadora-rescisao',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Rescisão da Empregada Doméstica 2026',
  description:
    'Calculadora gratuita de rescisão para empregada doméstica. Calcula saldo de salário, aviso prévio, férias proporcionais, 13° e FGTS.',
  url: 'https://lardia.com.br/calculadora-rescisao',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
  provider: { '@type': 'Organization', name: 'LarDia', url: 'https://lardia.com.br' },
}

export default function CalculadoraRescisaoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <RescisaoCalculatorClient />
      <Footer />
    </>
  )
}
