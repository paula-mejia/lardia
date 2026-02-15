import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calculator,
  Calendar,
  Bell,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Search,
  UserCheck,
  Scale,
  ClipboardList,
  Zap,
  Star,
  Menu,
  X,
} from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/logo'
import PayrollCalculator from '@/components/payroll-calculator'
import { ReferralBanner, ReferralSection } from '@/components/referral-banner'
import NewsletterSignup from '@/components/newsletter-signup'
import MobileNav from '@/components/mobile-nav'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ReferralBanner />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-9" />
          </Link>
          <MobileNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-sky-50 dark:from-emerald-950/20 dark:to-sky-950/20" />
        <div className="relative container mx-auto px-4 py-20 md:py-32 text-center">
          <Badge variant="secondary" className="mb-6">
            Para empregadores domésticos no Brasil
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            eSocial sem erro,
            <br />
            <span className="text-emerald-500 dark:text-emerald-400">sem estresse</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Gestão completa do eSocial doméstico: folha de pagamento, guia DAE,
            fechamento mensal e todas as obrigações no piloto automático.
            Você cuida da sua família, a LarDia cuida do resto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Comece agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#calculadora">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                Testar calculadora grátis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Contratar uma empregada doméstica no Brasil e complicado
            </h2>
            <p className="text-muted-foreground text-lg">
              São dezenas de obrigações legais, cálculos complexos e prazos
              apertados. Um erro pode gerar multas ou processos trabalhistas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                icon: AlertTriangle,
                title: 'eSocial obrigatório',
                desc: 'Todos os empregadores domésticos precisam declarar no eSocial. O sistema é confuso e qualquer campo errado trava tudo.',
              },
              {
                icon: Calculator,
                title: 'Cálculos complexos',
                desc: 'INSS progressivo, IRRF com deduções, FGTS, GILRAT, antecipação rescisória... cada mês é um quebra-cabeça.',
              },
              {
                icon: FileText,
                title: 'Guia DAE todo mês',
                desc: 'A guia DAE precisa ser gerada é paga até o dia 7. Atrasou? Multa automática com juros.',
              },
              {
                icon: Calendar,
                title: 'Férias, 13o, rescisão',
                desc: 'Cada evento tem regras proprias, prazos legais e cálculos especificos que mudam conforme o caso.',
              },
              {
                icon: Clock,
                title: 'Prazos que não esperam',
                desc: 'Dia 7 para DAE, aviso de férias com 30 dias, 1a parcela do 13o até novembro. Esqueceu? Problema.',
              },
              {
                icon: Shield,
                title: 'Risco trabalhista',
                desc: 'Contracheque errado, FGTS não depositado ou férias mal calculadas podem virar ação na Justiça do Trabalho.',
              },
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <item.icon className="h-8 w-8 text-amber-500 mb-3" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* eSocial Management Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-4">Novidade</Badge>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Gestão completa do eSocial
            </h2>
            <p className="text-muted-foreground text-lg">
              A LarDia cuida do envio mensal, geração da DAE e controle de prazos.
              Você não precisa mais de um contador para manter tudo em dia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {[
              {
                icon: ClipboardList,
                step: '1',
                title: 'Cadastro',
                desc: 'Cadastre sua empregada com os dados básicos. A LarDia configura tudo no eSocial para você.',
              },
              {
                icon: UserCheck,
                step: '2',
                title: 'Procuração',
                desc: 'Autorize a LarDia a enviar eventos no eSocial em seu nome com uma procuração digital simples.',
              },
              {
                icon: Zap,
                step: '3',
                title: 'Automacao',
                desc: 'Pronto. Todo mês a folha é fechada, os eventos são enviados e a guia DAE é gerada automaticamente.',
              },
            ].map((item, i) => (
              <Card key={i} className="border shadow-sm text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-white text-xs font-bold mb-2">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Connector arrows (visible on md+) */}
          <div className="hidden md:flex justify-center items-center gap-2 -mt-8 mb-8">
            <p className="text-sm text-muted-foreground font-medium">
              Cadastro → Procuração → Automacao
            </p>
          </div>

          <div className="text-center">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Quero automatizar meu eSocial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculadora" className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <Badge variant="secondary" className="mb-4">Gratis, sem cadastro</Badge>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Calcule a folha agora mesmo
            </h2>
            <p className="text-muted-foreground text-lg">
              Veja quanto custa manter uma empregada doméstica registrada.
              Salário líquido, INSS, FGTS e valor da guia DAE, tudo calculado
              em tempo real.
            </p>
          </div>
          <PayrollCalculator />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Tudo que você precisa, num so lugar
            </h2>
            <p className="text-muted-foreground text-lg">
              A LarDia automatiza os cálculos e te lembra de cada obrigação.
              Você so precisa pagar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Calculator,
                title: 'Cálculo automático',
                desc: 'Folha mensal, férias, 13o salário e rescisão calculados com precisão. Sempre atualizado com as tabelas vigentes de INSS, IRRF e salário mínimo.',
              },
              {
                icon: Calendar,
                title: 'Calendário de obrigações',
                desc: 'Veja todas as datas importantes do mês: vencimento da DAE, aviso de férias, parcelas do 13o. Nunca mais perca um prazo.',
              },
              {
                icon: Bell,
                title: 'Alertas e lembretes',
                desc: 'Receba notificações antes de cada prazo. DAE vencendo, férias se aproximando, 13o chegando. Tudo no seu tempo.',
              },
              {
                icon: FileText,
                title: 'Contracheque pronto',
                desc: 'Gere o contracheque da sua empregada com um clique. Formatado, correto e pronto para imprimir ou enviar por WhatsApp.',
              },
            ].map((item, i) => (
              <Card key={i} className="border shadow-sm">
                <CardContent className="pt-6 flex gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Background Check Section */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Verificação de antecedentes
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Contrate com segurança. Antes de admitir, verifique antecedentes
              criminais, processos judiciais e validação de CPF do candidato.
              Tudo online, com resultado em minutos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              {[
                { icon: Shield, label: 'Antecedentes criminais' },
                { icon: Scale, label: 'Processos judiciais' },
                { icon: UserCheck, label: 'Validação de CPF' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4">
                  <item.icon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-4xl font-bold">99,90</span>
                <span className="text-muted-foreground">por consulta</span>
              </div>
            </div>

            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Verificar agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Mais de 500 empregadores confiam na LarDia
            </h2>
            <p className="text-muted-foreground text-lg">
              Empregadores em todo o Brasil usam a LarDia para simplificar
              o eSocial doméstico e evitar dores de cabeça.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'Maria S.',
                city: 'São Paulo, SP',
                text: 'Antes da LarDia eu pagava um contador so para o eSocial. Agora faco tudo sozinha em 5 minutos por mês.',
              },
              {
                name: 'Roberto L.',
                city: 'Rio de Janeiro, RJ',
                text: 'Os alertas de prazo já me salvaram de multas varias vezes. Vale cada centavo.',
              },
              {
                name: 'Ana C.',
                city: 'Belo Horizonte, MG',
                text: 'A verificação de antecedentes me deu tranquilidade para contratar. Recomendo muito.',
              },
            ].map((item, i) => (
              <Card key={i} className="border shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">&ldquo;{item.text}&rdquo;</p>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.city}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-muted-foreground text-lg">
              Comece grátis com as calculadoras ou desbloqueie a gestão completa do eSocial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="border shadow-sm">
              <CardContent className="pt-8 pb-8">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Gratis
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold">0</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">para sempre</p>

                <ul className="text-left space-y-3 mb-8">
                  {[
                    'Calculadora de folha',
                    'Calculadora de 13o salário',
                    'Calculadora de férias',
                    'Calculadora de rescisão',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="#calculadora">
                  <Button variant="outline" size="lg" className="w-full text-base">
                    Usar grátis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Basic Tier */}
            <Card className="border shadow-sm">
              <CardContent className="pt-8 pb-8">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Basico
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold">29,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">por empregada</p>

                <ul className="text-left space-y-3 mb-8">
                  {[
                    'Tudo do plano Gratis',
                    'Dashboard de empregados',
                    'Calendário de obrigações',
                    'Contracheque em PDF',
                    'Alertas por e-mail',
                    'Histórico de cálculos',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/signup">
                  <Button variant="outline" size="lg" className="w-full text-base">
                    Comecar agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Complete Tier */}
            <Card className="border-2 border-emerald-600 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Recomendado</Badge>
              </div>
              <CardContent className="pt-8 pb-8">
                <p className="text-sm font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wide mb-2">
                  Completo
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold">49,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">por empregada</p>

                <ul className="text-left space-y-3 mb-8">
                  {[
                    'Tudo do plano Basico',
                    'Gestão eSocial automatizada',
                    'Geração de DAE',
                    'Fechamento mensal automático',
                    'Notificações por WhatsApp',
                    'Suporte prioritario',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/signup">
                  <Button size="lg" className="w-full text-base">
                    Comecar agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  7 dias grátis. Cancele quando quiser.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup source="landing" />

      {/* Referral */}
      <ReferralSection />

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-emerald-500 dark:bg-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Chega de dor de cabeça com eSocial
          </h2>
          <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8">
            Cadastre sua empregada, informe o salário e deixe a LarDia cuidar
            de todo o resto. Simples assim.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-base px-8">
              Criar conta grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <p className="font-bold text-lg mb-2">LarDia</p>
              <p className="text-sm text-muted-foreground">
                eSocial sem erro, sem estresse.
              </p>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Produto</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#calculadora" className="hover:text-foreground transition-colors">Calculadora</Link></li>
                <li><Link href="/simulador" className="hover:text-foreground transition-colors">Simulador</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Precos</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Conta</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Criar conta</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/termos" className="hover:text-foreground transition-colors">Termos de uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-xs text-muted-foreground">
            &copy; 2026 LarDia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}
