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
            Ultima atualização: 14 de fevereiro de 2026
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
            <h2 className="text-xl font-semibold">1. Descricao do Serviço</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Lardia e uma plataforma digital que oferece ferramentas de
              cálculo de folha de pagamento e gestão de obrigações do eSocial
              para empregadores domésticos no Brasil. Nossos serviços incluem:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Calculadora de folha de pagamento (salário, férias, 13o, rescisão)</li>
              <li>Geracao automatizada de guias DAE</li>
              <li>Integração com o eSocial via procuração eletrônica</li>
              <li>Calendario de obrigações e lembretes</li>
              <li>Verificação de antecedentes (via parceiros)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Responsabilidades do Usuario</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ao utilizar a Lardia, você se compromete a:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Fornecer informações verdadeiras e atualizadas sobre empregados e salarios</li>
              <li>Manter suas credenciais de acesso em sigilo</li>
              <li>Revisar os cálculos e documentos gerados antes de submete-los</li>
              <li>Cumprir todas as obrigações legais como empregador doméstico</li>
              <li>Manter a procuração eletrônica ativa enquanto utilizar o serviço de gestão eSocial</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Responsabilidades e Limitacoes da Lardia</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Lardia se compromete a fornecer cálculos precisos baseados na
              legislação trabalhista vigente. No entanto:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                A Lardia não substitui assessoria juridica ou contabil
                profissional
              </li>
              <li>
                Não nos responsabilizamos por informações incorretas fornecidas
                pelo usuário
              </li>
              <li>
                Atualizacoes na legislação serão incorporadas o mais rapido
                possível, mas pode haver um período de ajuste
              </li>
              <li>
                A disponibilidade do serviço depende de sistemas de terceiros
                (eSocial, gov.br, Receita Federal)
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Procuração Eletrônica</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para utilizar a funcionalidade de gestão do eSocial, o usuário deve
              cadastrar uma procuração eletrônica no eCAC autorizando a Lardia.
              O usuário entende que:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                A procuração autoriza a Lardia a enviar e consultar informações
                no eSocial em nome do empregador
              </li>
              <li>
                A procuração pode ser revogada a qualquer momento pelo usuário
                diretamente no eCAC
              </li>
              <li>
                A Lardia utilizará a procuração exclusivamente para os serviços
                contratados
              </li>
              <li>
                A revogação da procuração implica na impossibilidade de prestar
                os serviços de gestão eSocial
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Tratamento de Dados</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os dados pessoais coletados são tratados conforme nossa{' '}
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
              Os pagamentos são processados pela Stripe, Inc. Ao contratar um
              plano pago, você concorda com:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Cobranca recorrente mensal conforme o plano escolhido</li>
              <li>O período de teste gratuito de 7 dias, quando aplicavel</li>
              <li>
                Os dados de pagamento são armazenados e processados
                exclusivamente pela Stripe
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Cancelamento</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Você pode cancelar sua assinatura a qualquer momento. Ao cancelar:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>O acesso continua até o final do período já pago</li>
              <li>Não ha reembolso proporcional do período restante</li>
              <li>Seus dados serão mantidos por 90 dias após o cancelamento</li>
              <li>
                A procuração eletrônica deve ser revogada manualmente pelo
                usuário no eCAC
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Limitacao de Responsabilidade</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Lardia não será responsável por danos indiretos, incidentais,
              especiais ou consequenciais decorrentes do uso ou impossibilidade
              de uso do serviço. Nossa responsabilidade total esta limitada ao
              valor pago pelo usuário nos ultimos 12 meses.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Em caso de erros em cálculos que resultem em prejuizo ao usuário,
              a Lardia se compromete a corrigir o erro e auxiliar na
              regularizacao junto aos orgaos competentes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Alteracoes nos Termos</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Lardia pode alterar estes termos a qualquer momento. Usuarios
              serão notificados por email sobre alterações significativas. O uso
              continuado do serviço após a notificação constitui aceitação dos
              novos termos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Foro e Legislacao Aplicavel</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Estes termos são regidos pelas leis da Republica Federativa do
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
