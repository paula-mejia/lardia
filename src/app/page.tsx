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
} from 'lucide-react'
import Link from 'next/link'
import PayrollCalculator from '@/components/payroll-calculator'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Lardia
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Comece agora</Button>
            </Link>
          </div>
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
            <span className="text-emerald-600 dark:text-emerald-400">sem estresse</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Folha de pagamento, obrigações e guias da sua empregada doméstica
            calculadas automaticamente. Você cuida da sua família, a Lardia cuida
            do eSocial.
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
                Testar calculadora gratis
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
              Contratar uma empregada domestica no Brasil e complicado
            </h2>
            <p className="text-muted-foreground text-lg">
              Sao dezenas de obrigacoes legais, calculos complexos e prazos
              apertados. Um erro pode gerar multas ou processos trabalhistas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                icon: AlertTriangle,
                title: 'eSocial obrigatorio',
                desc: 'Todos os empregadores domesticos precisam declarar no eSocial. O sistema e confuso e qualquer campo errado trava tudo.',
              },
              {
                icon: Calculator,
                title: 'Calculos complexos',
                desc: 'INSS progressivo, IRRF com deducoes, FGTS, GILRAT, antecipacao rescisoria... cada mes e um quebra-cabeca.',
              },
              {
                icon: FileText,
                title: 'Guia DAE todo mes',
                desc: 'A guia DAE precisa ser gerada e paga ate o dia 7. Atrasou? Multa automatica com juros.',
              },
              {
                icon: Calendar,
                title: 'Ferias, 13o, rescisao',
                desc: 'Cada evento tem regras proprias, prazos legais e calculos especificos que mudam conforme o caso.',
              },
              {
                icon: Clock,
                title: 'Prazos que nao esperam',
                desc: 'Dia 7 para DAE, aviso de ferias com 30 dias, 1a parcela do 13o ate novembro. Esqueceu? Problema.',
              },
              {
                icon: Shield,
                title: 'Risco trabalhista',
                desc: 'Contracheque errado, FGTS nao depositado ou ferias mal calculadas podem virar acao na Justica do Trabalho.',
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

      {/* Calculator Section */}
      <section id="calculadora" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <Badge variant="secondary" className="mb-4">Gratis, sem cadastro</Badge>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Calcule a folha agora mesmo
            </h2>
            <p className="text-muted-foreground text-lg">
              Veja quanto custa manter uma empregada domestica registrada.
              Salario liquido, INSS, FGTS e valor da guia DAE, tudo calculado
              em tempo real.
            </p>
          </div>
          <PayrollCalculator />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Tudo que voce precisa, num so lugar
            </h2>
            <p className="text-muted-foreground text-lg">
              A Lardia automatiza os calculos e te lembra de cada obrigacao.
              Voce so precisa pagar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Calculator,
                title: 'Calculo automatico',
                desc: 'Folha mensal, ferias, 13o salario e rescisao calculados com precisao. Sempre atualizado com as tabelas vigentes de INSS, IRRF e salario minimo.',
              },
              {
                icon: Calendar,
                title: 'Calendario de obrigacoes',
                desc: 'Veja todas as datas importantes do mes: vencimento da DAE, aviso de ferias, parcelas do 13o. Nunca mais perca um prazo.',
              },
              {
                icon: Bell,
                title: 'Alertas e lembretes',
                desc: 'Receba notificacoes antes de cada prazo. DAE vencendo, ferias se aproximando, 13o chegando. Tudo no seu tempo.',
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
                    <item.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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

      {/* Pricing Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Simples e acessivel
            </h2>
            <p className="text-muted-foreground mb-8">
              Menos do que um cafe por dia para nunca mais se preocupar com eSocial.
            </p>

            <Card className="border-2 border-emerald-500 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Plano unico
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold">29,90</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">por empregada</p>

                <ul className="text-left space-y-3 mb-8">
                  {[
                    'Calculo automatico da folha mensal',
                    'Ferias, 13o e rescisao',
                    'Calendario de obrigacoes',
                    'Alertas por e-mail e WhatsApp',
                    'Contracheque formatado',
                    'Historico completo de pagamentos',
                    'Suporte por WhatsApp',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/signup">
                  <Button size="lg" className="w-full text-base">
                    Comece agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  7 dias gratis. Cancele quando quiser.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-emerald-600 dark:bg-emerald-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Chega de dor de cabeca com eSocial
          </h2>
          <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8">
            Cadastre sua empregada, informe o salario e deixe a Lardia cuidar
            de todo o resto. Simples assim.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-base px-8">
              Criar conta gratis
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
              <p className="font-bold text-lg mb-2">Lardia</p>
              <p className="text-sm text-muted-foreground">
                eSocial sem erro, sem estresse.
              </p>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Produto</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#calculadora" className="hover:text-foreground transition-colors">Calculadora</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Funcionalidades</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Precos</Link></li>
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
                <li><Link href="#" className="hover:text-foreground transition-colors">Termos de uso</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-xs text-muted-foreground">
            &copy; 2026 Lardia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}
