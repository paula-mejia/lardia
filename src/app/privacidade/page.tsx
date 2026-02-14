import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Politica de Privacidade
          </h1>
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

          <p className="text-sm leading-relaxed text-muted-foreground">
            Esta Politica de Privacidade descreve como a Lardia coleta, usa,
            armazena e protege seus dados pessoais, em conformidade com a Lei
            Geral de Protecao de Dados (LGPD - Lei 13.709/2018).
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Dados que Coletamos</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Coletamos os seguintes dados pessoais:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                <strong>Dados do empregador:</strong> nome, email, CPF, endereco
              </li>
              <li>
                <strong>Dados do empregado:</strong> nome completo, CPF, data de
                nascimento, endereco, dados bancarios, cargo, salario, data de
                admissao
              </li>
              <li>
                <strong>Dados financeiros:</strong> informacoes de salario,
                descontos, beneficios, historico de folha de pagamento
              </li>
              <li>
                <strong>Dados de uso:</strong> logs de acesso, acoes realizadas
                na plataforma
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Como Usamos seus Dados</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Utilizamos seus dados para as seguintes finalidades:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Calcular folha de pagamento, ferias, 13o salario e rescisao</li>
              <li>Enviar informacoes ao eSocial em nome do empregador</li>
              <li>Gerar guias DAE para pagamento</li>
              <li>Enviar lembretes sobre prazos e obrigacoes</li>
              <li>Processar pagamentos da assinatura</li>
              <li>Melhorar nossos servicos e experiencia do usuario</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Armazenamento de Dados</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Seus dados sao armazenados de forma segura utilizando os servicos
              da Supabase, com as seguintes medidas de protecao:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Criptografia em transito (TLS/SSL)</li>
              <li>Criptografia em repouso (AES-256)</li>
              <li>Acesso restrito por autenticacao e autorizacao (RLS)</li>
              <li>Backups regulares</li>
              <li>Servidores localizados nos Estados Unidos (Supabase)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Compartilhamento com Terceiros</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Compartilhamos dados com os seguintes parceiros, apenas na medida
              necessaria para a prestacao dos servicos:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                <strong>Stripe, Inc.:</strong> processamento de pagamentos.
                Recebe dados de cobranca (email, dados do cartao). Veja a{' '}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 underline"
                >
                  politica de privacidade da Stripe
                </a>
              </li>
              <li>
                <strong>BigDataCorp:</strong> verificacao de antecedentes. Recebe
                CPF e nome do empregado para consulta
              </li>
              <li>
                <strong>eSocial / Receita Federal:</strong> envio de obrigacoes
                trabalhistas conforme procuracao eletronica
              </li>
              <li>
                <strong>Supabase:</strong> armazenamento de dados (infraestrutura)
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nao vendemos, alugamos ou compartilhamos seus dados pessoais para
              fins de marketing ou publicidade.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Seus Direitos (LGPD)</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Conforme a LGPD, voce tem os seguintes direitos sobre seus dados
              pessoais:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                <strong>Acesso:</strong> solicitar uma copia de todos os dados
                que temos sobre voce
              </li>
              <li>
                <strong>Correcao:</strong> solicitar a correcao de dados
                incompletos ou incorretos
              </li>
              <li>
                <strong>Exclusao:</strong> solicitar a exclusao dos seus dados
                pessoais
              </li>
              <li>
                <strong>Portabilidade:</strong> solicitar a transferencia dos
                seus dados para outro servico
              </li>
              <li>
                <strong>Revogacao do consentimento:</strong> retirar o
                consentimento para o tratamento dos dados a qualquer momento
              </li>
              <li>
                <strong>Informacao:</strong> ser informado sobre com quem seus
                dados sao compartilhados
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para exercer qualquer desses direitos, envie um email para{' '}
              <a
                href="mailto:privacidade@lardia.com.br"
                className="text-emerald-600 underline"
              >
                privacidade@lardia.com.br
              </a>
              . Responderemos em ate 15 dias uteis.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Retencao de Dados</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Mantemos seus dados pelos seguintes periodos:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                <strong>Conta ativa:</strong> enquanto sua conta estiver ativa e
                o servico em uso
              </li>
              <li>
                <strong>Apos cancelamento:</strong> 90 dias para permitir
                reativacao
              </li>
              <li>
                <strong>Obrigacoes legais:</strong> dados trabalhistas sao
                mantidos por 5 anos conforme legislacao vigente
              </li>
              <li>
                <strong>Apos exclusao:</strong> dados sao removidos
                permanentemente em ate 30 dias, exceto quando houver obrigacao
                legal de retencao
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Cookies</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Utilizamos cookies essenciais para o funcionamento da plataforma:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                <strong>Cookies de sessao:</strong> para manter voce logado na
                plataforma
              </li>
              <li>
                <strong>Cookies de preferencias:</strong> para salvar suas
                preferencias de interface
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nao utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Contato</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para questoes sobre privacidade ou protecao de dados, entre em
              contato:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>
                Email:{' '}
                <a
                  href="mailto:privacidade@lardia.com.br"
                  className="text-emerald-600 underline"
                >
                  privacidade@lardia.com.br
                </a>
              </li>
              <li>
                Encarregado de Protecao de Dados (DPO): A ser nomeado
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Alteracoes</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Esta politica pode ser atualizada periodicamente. Notificaremos
              voce sobre alteracoes significativas por email. A versao mais
              recente estara sempre disponivel nesta pagina.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
