import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
        </div>

        <div className="prose prose-sm max-w-none space-y-6">
          <p className="text-sm text-muted-foreground">
            Ultima atualizacao: 14 de fevereiro de 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Identificacao da Empresa</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A plataforma Lardia e operada por{' '}
              <strong>COCORA CONSULTORIA E SERVIÇOS ADMINISTRATIVOS LTDA</strong>,
              inscrita no CNPJ sob o nº{' '}
              <strong>46.728.966/0001-40</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Descricao do Servico</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Lardia e uma plataforma digital que oferece ferramentas de
              calculo de folha de pagamento e gestao de obrigacoes do eSocial
              para empregadores domesticos no Brasil. Nossos servicos incluem:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Calculadora de folha de pagamento (salario, ferias, 13o, rescisao)</li>
              <li>Geracao automatizada de guias DAE</li>
              <li>Integracao com o eSocial via procuracao eletronica</li>
              <li>Calendario de obrigacoes e lembretes</li>
              <li>Verificacao de antecedentes (via parceiros)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Responsabilidades do Usuario</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ao utilizar a Lardia, voce se compromete a:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Fornecer informacoes verdadeiras e atualizadas sobre empregados e salarios</li>
              <li>Manter suas credenciais de acesso em sigilo</li>
              <li>Revisar os calculos e documentos gerados antes de submete-los</li>
              <li>Cumprir todas as obrigacoes legais como empregador domestico</li>
              <li>Manter a procuracao eletronica ativa enquanto utilizar o servico de gestao eSocial</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Responsabilidades e Limitacoes da Lardia</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Lardia se compromete a fornecer calculos precisos baseados na
              legislacao trabalhista vigente. No entanto:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                A Lardia nao substitui assessoria juridica ou contabil
                profissional
              </li>
              <li>
                Nao nos responsabilizamos por informacoes incorretas fornecidas
                pelo usuario
              </li>
              <li>
                Atualizacoes na legislacao serao incorporadas o mais rapido
                possivel, mas pode haver um periodo de ajuste
              </li>
              <li>
                A disponibilidade do servico depende de sistemas de terceiros
                (eSocial, gov.br, Receita Federal)
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Procuracao Eletronica</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para utilizar a funcionalidade de gestao do eSocial, o usuario deve
              cadastrar uma procuracao eletronica no eCAC autorizando a Lardia.
              O usuario entende que:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                A procuracao autoriza a Lardia a enviar e consultar informacoes
                no eSocial em nome do empregador
              </li>
              <li>
                A procuracao pode ser revogada a qualquer momento pelo usuario
                diretamente no eCAC
              </li>
              <li>
                A Lardia utilizara a procuracao exclusivamente para os servicos
                contratados
              </li>
              <li>
                A revogacao da procuracao implica na impossibilidade de prestar
                os servicos de gestao eSocial
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Tratamento de Dados</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os dados pessoais coletados sao tratados conforme nossa{' '}
              <Link href="/privacidade" className="text-emerald-600 underline">
                Politica de Privacidade
              </Link>
              , em conformidade com a Lei Geral de Protecao de Dados (LGPD - Lei
              13.709/2018).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Pagamento</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os pagamentos sao processados pela Stripe, Inc. Ao contratar um
              plano pago, voce concorda com:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Cobranca recorrente mensal conforme o plano escolhido</li>
              <li>O periodo de teste gratuito de 7 dias, quando aplicavel</li>
              <li>
                Os dados de pagamento sao armazenados e processados
                exclusivamente pela Stripe
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Cancelamento</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Voce pode cancelar sua assinatura a qualquer momento. Ao cancelar:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>O acesso continua ate o final do periodo ja pago</li>
              <li>Nao ha reembolso proporcional do periodo restante</li>
              <li>Seus dados serao mantidos por 90 dias apos o cancelamento</li>
              <li>
                A procuracao eletronica deve ser revogada manualmente pelo
                usuario no eCAC
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Limitacao de Responsabilidade</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Lardia nao sera responsavel por danos indiretos, incidentais,
              especiais ou consequenciais decorrentes do uso ou impossibilidade
              de uso do servico. Nossa responsabilidade total esta limitada ao
              valor pago pelo usuario nos ultimos 12 meses.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Em caso de erros em calculos que resultem em prejuizo ao usuario,
              a Lardia se compromete a corrigir o erro e auxiliar na
              regularizacao junto aos orgaos competentes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Alteracoes nos Termos</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Lardia pode alterar estes termos a qualquer momento. Usuarios
              serao notificados por email sobre alteracoes significativas. O uso
              continuado do servico apos a notificacao constitui aceitacao dos
              novos termos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Foro e Legislacao Aplicavel</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Estes termos sao regidos pelas leis da Republica Federativa do
              Brasil. Fica eleito o foro da comarca de Sao Paulo/SP para dirimir
              quaisquer controversias.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Contato</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Em caso de duvidas sobre estes termos, entre em contato pelo email:{' '}
              <a
                href="mailto:contato@lardia.com.br"
                className="text-emerald-600 underline"
              >
                contato@lardia.com.br
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
