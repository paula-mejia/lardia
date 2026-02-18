import Navbar from '@/components/landing/navbar'
import HeroSection from '@/components/landing/hero-section'
import ProblemSection from '@/components/landing/problem-section'
import HowItWorksSection from '@/components/landing/how-it-works-section'
import CalculatorSection from '@/components/landing/calculator-section'
import FeaturesSection from '@/components/landing/features-section'
import PricingSection from '@/components/landing/pricing-section'
import FaqSection from '@/components/landing/faq-section'
import CtaSection from '@/components/landing/cta-section'
import Footer from '@/components/landing/footer'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LarDia',
  legalName: 'COCORA CONSULTORIA E SERVIÇOS ADMINISTRATIVOS LTDA',
  taxID: '46.728.966/0001-40',
  url: 'https://lardia.com.br',
  logo: 'https://lardia.com.br/icon-512.png',
  description:
    'Plataforma inteligente para empregadores domésticos. Folha de pagamento, férias, 13º e rescisão com 100% de precisão no eSocial.',
  sameAs: [],
}

const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LarDia',
  description:
    'Calculadora inteligente para empregador doméstico. Folha de pagamento, férias, 13º e rescisão com 100% de precisão no eSocial.',
  url: 'https://lardia.com.br',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: [
    {
      '@type': 'Offer',
      name: 'Grátis',
      price: '0',
      priceCurrency: 'BRL',
      description: 'Plano gratuito para empregadores domésticos',
    },
    {
      '@type': 'Offer',
      name: 'Básico',
      price: '29.90',
      priceCurrency: 'BRL',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '29.90',
        priceCurrency: 'BRL',
        billingDuration: 'P1M',
      },
      description: 'Plano Básico com funcionalidades essenciais',
    },
    {
      '@type': 'Offer',
      name: 'Completo',
      price: '49.90',
      priceCurrency: 'BRL',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '49.90',
        priceCurrency: 'BRL',
        billingDuration: 'P1M',
      },
      description: 'Plano Completo com todas as funcionalidades',
    },
  ],
  provider: {
    '@type': 'Organization',
    name: 'LarDia',
    url: 'https://lardia.com.br',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Início',
      item: 'https://lardia.com.br',
    },
  ],
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CalculatorSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
