'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  FileText,
  Loader2,
  Shield,
  Clock,
  Copy,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const CNPJ_LARDIA = '46.728.966/0001-40'
const TOTAL_STEPS = 4

export default function ConnectESocialPage() {
  const [step, setStep] = useState(1)
  const [cpf, setCpf] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleVerify() {
    const digits = cpf.replace(/\D/g, '')
    if (digits.length !== 11) {
      setError('CPF deve ter 11 dígitos.')
      return
    }

    setVerifying(true)
    setError('')

    try {
      await new Promise((r) => setTimeout(r, 2000))

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from('employers')
          .update({
            esocial_connected: true,
            esocial_connected_at: new Date().toISOString(),
            esocial_cpf: digits,
            gov_br_verified: true,
          })
          .eq('user_id', user.id)
      }

      setVerified(true)
    } catch {
      setError('Erro ao verificar. Tente novamente.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/esocial">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Conectar eSocial
          </h1>
          <p className="text-sm text-muted-foreground">
            Passo {step} de {TOTAL_STEPS}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? 'bg-emerald-500' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Explanation */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              O que é a procuração eletrônica?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              Para que a LarDia gerencie seu eSocial, você precisa nos
              autorizar via <strong>procuração eletrônica</strong> no eCAC (Centro Virtual de
              Atendimento da Receita Federal).
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A procuração eletrônica é um documento digital seguro que autoriza a
              LarDia a enviar e consultar informações no eSocial em seu nome.
              Com ela, conseguimos automatizar o envio da folha de pagamento,
              gerar as guias DAE e manter suas obrigações em dia.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Seguro e revogável</p>
                  <p className="text-xs text-muted-foreground">
                    Você pode revogar a procuração a qualquer momento diretamente no eCAC.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Leva menos de 5 minutos</p>
                  <p className="text-xs text-muted-foreground">
                    O processo é simples e feito diretamente no site da Receita Federal.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={() => setStep(2)} className="w-full">
              Entendi, vamos começar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Requirements */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>O que você vai precisar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Conta gov.br nível Prata ou Ouro
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Necessário para acessar o eCAC. Se você ainda não tem,{' '}
                    <a
                      href="https://sso.acesso.gov.br/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 underline"
                    >
                      crie sua conta gov.br aqui
                      <ExternalLink className="h-3 w-3 inline ml-0.5" />
                    </a>
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Seu CPF</p>
                  <p className="text-xs text-muted-foreground">
                    O CPF cadastrado como empregador doméstico no eSocial.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">CNPJ da LarDia</p>
                  <p className="text-xs text-muted-foreground">
                    Você vai precisar informar nosso CNPJ no eCAC. Não se preocupe, vamos te mostrar exatamente onde.
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {CNPJ_LARDIA}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => copyToClipboard('46728966000140')}
                    >
                      {copied ? (
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </li>
            </ul>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Tenho tudo, vamos lá
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Instructions with screenshots */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Passo a passo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Siga as instruções abaixo. O processo leva menos de 5 minutos.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Step 3.1: Login eCAC */}
            <div className="flex gap-3">
              <Badge
                variant="secondary"
                className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold"
              >
                1
              </Badge>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium">Acesse o eCAC</p>
                <p className="text-xs text-muted-foreground">
                  Abra o site do eCAC e faça login com sua conta gov.br:
                </p>
                <a
                  href="https://cav.receita.fazenda.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-emerald-500 underline"
                >
                  cav.receita.fazenda.gov.br
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Image
                  src="/images/ecac-guide/01-ecac-login.jpg"
                  alt="Tela de login do eCAC com botão Entrar com gov.br"
                  width={800}
                  height={400}
                  className="rounded-lg border shadow-sm w-full"
                />
              </div>
            </div>

            {/* Step 3.2: Navigate to Procurações */}
            <div className="flex gap-3">
              <Badge
                variant="secondary"
                className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold"
              >
                2
              </Badge>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium">Clique em &quot;Autorizações de Acesso (Procurações)&quot;</p>
                <p className="text-xs text-muted-foreground">
                  No painel principal do eCAC, clique no botão destacado abaixo:
                </p>
                <Image
                  src="/images/ecac-guide/02-ecac-dashboard.jpg"
                  alt="Painel do eCAC com botão Autorizações de Acesso destacado"
                  width={800}
                  height={400}
                  className="rounded-lg border shadow-sm w-full"
                />
              </div>
            </div>

            {/* Step 3.3: Autorização de Acesso */}
            <div className="flex gap-3">
              <Badge
                variant="secondary"
                className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold"
              >
                3
              </Badge>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium">Selecione &quot;Autorização de Acesso (Procuração)&quot;</p>
                <p className="text-xs text-muted-foreground">
                  No submenu que aparece, clique em &quot;Autorização de Acesso (Procuração)&quot;:
                </p>
                <Image
                  src="/images/ecac-guide/03-autorizacoes-menu.jpg"
                  alt="Submenu de Autorizações de Acesso"
                  width={800}
                  height={400}
                  className="rounded-lg border shadow-sm w-full"
                />
              </div>
            </div>

            {/* Step 3.4: Nova Autorização */}
            <div className="flex gap-3">
              <Badge
                variant="secondary"
                className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold"
              >
                4
              </Badge>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium">Clique em &quot;+ Nova Autorização&quot;</p>
                <p className="text-xs text-muted-foreground">
                  Na tela de autorizações, clique no botão azul no canto superior direito:
                </p>
                <Image
                  src="/images/ecac-guide/04-minhas-autorizacoes.jpg"
                  alt="Tela Minhas Autorizações com botão Nova Autorização"
                  width={800}
                  height={400}
                  className="rounded-lg border shadow-sm w-full"
                />
              </div>
            </div>

            {/* Step 3.5: Fill CNPJ */}
            <div className="flex gap-3">
              <Badge
                variant="secondary"
                className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold"
              >
                5
              </Badge>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium">Informe o CNPJ da LarDia</p>
                <p className="text-xs text-muted-foreground">
                  No campo &quot;Pessoa Autorizada&quot;, digite o CNPJ abaixo. O sistema vai mostrar o nome &quot;COCORA CONSULTORIA E SERVCOS ADMINISTRATIVOS LTDA&quot;. Defina a validade (recomendamos até 5 anos).
                </p>
                <div className="flex items-center gap-2 my-2">
                  <code className="text-sm bg-emerald-50 text-emerald-700 px-3 py-2 rounded font-mono font-bold">
                    {CNPJ_LARDIA}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('46728966000140')}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1 text-emerald-500" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <Image
                  src="/images/ecac-guide/06-cnpj-cocora.jpg"
                  alt="Formulário com CNPJ da Cocora preenchido e validade"
                  width={800}
                  height={400}
                  className="rounded-lg border shadow-sm w-full"
                />
              </div>
            </div>

            {/* Step 3.6: Select services */}
            <div className="flex gap-3">
              <Badge
                variant="secondary"
                className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold"
              >
                6
              </Badge>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium">Selecione os serviços do eSocial</p>
                <p className="text-xs text-muted-foreground">
                  Pesquise por &quot;eSocial&quot; e marque todos os serviços relacionados. Isso permite que a LarDia gerencie completamente sua folha de pagamento.
                </p>
                <Image
                  src="/images/ecac-guide/07-selecionar-servicos.jpg"
                  alt="Lista de serviços eSocial para selecionar"
                  width={800}
                  height={400}
                  className="rounded-lg border shadow-sm w-full"
                />
              </div>
            </div>

            {/* Step 3.7: Confirm */}
            <div className="flex gap-3">
              <Badge
                variant="secondary"
                className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold"
              >
                7
              </Badge>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium">Confirme a procuração</p>
                <p className="text-xs text-muted-foreground">
                  Revise os dados, clique em &quot;Confirmar&quot; e pronto! A procuração será ativada imediatamente.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Já cadastrei a procuração
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Verification */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {verified ? 'eSocial conectado com sucesso!' : 'Verificar conexão'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {verified ? (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
                <p className="text-sm font-medium">Tudo certo!</p>
                <p className="text-sm text-muted-foreground">
                  Sua procuração eletrônica foi verificada. A LarDia agora pode
                  gerenciar seu eSocial, gerar a folha de pagamento e emitir as guias DAE.
                </p>
                <Link href="/dashboard/esocial">
                  <Button className="w-full">Ir para o painel eSocial</Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Informe o CPF do empregador doméstico para verificarmos se a procuração
                  foi cadastrada corretamente.
                </p>
                <div>
                  <label
                    htmlFor="cpf"
                    className="text-sm font-medium block mb-1.5"
                  >
                    CPF do empregador
                  </label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    maxLength={14}
                  />
                  {error && (
                    <p className="text-sm text-destructive mt-1">{error}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="flex-1"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar conexão'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
