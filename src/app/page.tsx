import { ReferralBanner, ReferralSection } from '@/components/referral-banner'
import NewsletterSignup from '@/components/newsletter-signup'
import Navbar from '@/components/landing/navbar'
import HeroSection from '@/components/landing/hero-section'
import ProblemSection from '@/components/landing/problem-section'
import EsocialSection from '@/components/landing/esocial-section'
import CalculatorSection from '@/components/landing/calculator-section'
import FeaturesSection from '@/components/landing/features-section'
import BackgroundCheckSection from '@/components/landing/background-check-section'
import TestimonialsSection from '@/components/landing/testimonials-section'
import PricingSection from '@/components/landing/pricing-section'
import CtaSection from '@/components/landing/cta-section'
import Footer from '@/components/landing/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ReferralBanner />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <EsocialSection />
      <CalculatorSection />
      <FeaturesSection />
      <BackgroundCheckSection />
      <TestimonialsSection />
      <PricingSection />
      <NewsletterSignup source="landing" />
      <ReferralSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
