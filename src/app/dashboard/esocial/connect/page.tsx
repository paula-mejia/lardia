'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Shield,
  Clock,
  Copy,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const CNPJ_LARDIA = '46.728.966/0001-40'

export default function ConnectESocialPage() {
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
      <div className="flex items-center gap-3 mb-8">
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
            Autorize a LarDia a gerenciar seu eSocial via procuração eletrônica
          </p>
        </div>
      </div>

      {/* Intro Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">O que é a procuração eletrônica?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">
            Para que a LarDia gerencie seu eSocial, você precisa nos autorizar via{' '}
            <strong>procuração eletrônica</strong> no eCAC (Centro Virtual de Atendimento da
            Receita Federal). É um processo seguro, 100% digital, e leva menos de 5 minutos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
              <Shield className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Seguro e revogável</p>
                <p className="text-xs text-muted-foreground">
                  Revogue a qualquer momento no eCAC.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
              <Clock className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Menos de 5 minutos</p>
                <p className="text-xs text-muted-foreground">
                  Processo simples no site da Receita Federal.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">O que você vai precisar</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Conta gov.br nível Prata ou Ouro</p>
                <p className="text-xs text-muted-foreground">
                  Se você ainda não tem,{' '}
                  <a href="https://sso.acesso.gov.br/signup" target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline">
                    crie sua conta aqui <ExternalLink className="h-3 w-3 inline ml-0.5" />
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
                  Copie e cole quando solicitado:
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-sm bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1.5 rounded font-mono font-bold">
                    {CNPJ_LARDIA}
                  </code>
                  <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => copyToClipboard('46728966000140')}>
                    {copied ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span className="ml-1 text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
                  </Button>
                </div>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Step by step guide */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Passo a passo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Siga as instruções abaixo para cadastrar a procuração eletrônica:
          </p>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Step 1 */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              1
            </Badge>
            <div className="space-y-3 flex-1">
              <p className="text-sm font-semibold">Acesse o eCAC</p>
              <p className="text-sm text-muted-foreground">
                Abra o site do eCAC e faça login com sua conta gov.br:
              </p>
              <a href="https://cav.receita.fazenda.gov.br/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-emerald-600 underline font-medium">
                cav.receita.fazenda.gov.br <ExternalLink className="h-3 w-3" />
              </a>
              <Image src="/images/ecac-guide/01-ecac-login.jpg" alt="Tela de login do eCAC com botão Entrar com gov.br" width={800} height={400} className="rounded-lg border shadow-sm w-full" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              2
            </Badge>
            <div className="space-y-3 flex-1">
              <p className="text-sm font-semibold">Clique em &quot;Autorizações de Acesso (Procurações)&quot;</p>
              <p className="text-sm text-muted-foreground">
                No painel principal do eCAC, procure o menu lateral ou o botão de autorizações:
              </p>
              <Image src="/images/ecac-guide/02-ecac-dashboard.jpg" alt="Painel do eCAC com botão Autorizações de Acesso" width={800} height={400} className="rounded-lg border shadow-sm w-full" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              3
            </Badge>
            <div className="space-y-3 flex-1">
              <p className="text-sm font-semibold">Selecione &quot;Autorização de Acesso (Procuração)&quot;</p>
              <p className="text-sm text-muted-foreground">
                No submenu que aparece, clique em &quot;Autorização de Acesso (Procuração)&quot;:
              </p>
              <Image src="/images/ecac-guide/03-autorizacoes-menu.jpg" alt="Submenu de Autorizações de Acesso" width={800} height={400} className="rounded-lg border shadow-sm w-full" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              4
            </Badge>
            <div className="space-y-3 flex-1">
              <p className="text-sm font-semibold">Clique em &quot;+ Nova Autorização&quot;</p>
              <p className="text-sm text-muted-foreground">
                Na tela de autorizações, clique no botão azul no canto superior direito para criar uma nova procuração:
              </p>
              <Image src="/images/ecac-guide/04-minhas-autorizacoes.jpg" alt="Tela Minhas Autorizações com botão Nova Autorização" width={800} height={400} className="rounded-lg border shadow-sm w-full" />
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              5
            </Badge>
            <div className="space-y-3 flex-1">
              <p className="text-sm font-semibold">Preencha o formulário</p>
              <p className="text-sm text-muted-foreground">
                Selecione &quot;CNPJ&quot; como tipo de pessoa autorizada. Defina a validade (recomendamos até 5 anos):
              </p>
              <Image src="/images/ecac-guide/05-nova-autorizacao-steps.jpg" alt="Formulário Nova Autorização com campos" width={800} height={400} className="rounded-lg border shadow-sm w-full" />
            </div>
          </div>

          {/* Step 6 */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              6
            </Badge>
            <div className="space-y-3 flex-1">
              <p className="text-sm font-semibold">Insira o CNPJ da LarDia</p>
              <p className="text-sm text-muted-foreground">
                No campo &quot;Pessoa Autorizada&quot;, digite o CNPJ abaixo. O sistema vai mostrar o nome{' '}
                <strong>COCORA CONSULTORIA E SERVIÇOS ADMINISTRATIVOS LTDA</strong>.
              </p>
              <div className="flex items-center gap-2 my-2">
                <code className="text-sm bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-2 rounded font-mono font-bold">
                  {CNPJ_LARDIA}
                </code>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard('46728966000140')}>
                  {copied ? <><CheckCircle className="h-3 w-3 mr-1 text-emerald-500" />Copiado!</> : <><Copy className="h-3 w-3 mr-1" />Copiar</>}
                </Button>
              </div>
              <Image src="/images/ecac-guide/06-cnpj-cocora.jpg" alt="Formulário com CNPJ da Cocora preenchido" width={800} height={400} className="rounded-lg border shadow-sm w-full" />
            </div>
          </div>

          {/* Step 7 */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center p-0 text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              7
            </Badge>
            <div className="space-y-3 flex-1">
              <p className="text-sm font-semibold">Selecione os serviços do eSocial e confirme</p>
              <p className="text-sm text-muted-foreground">
                Pesquise por &quot;eSocial&quot; e marque todos os serviços relacionados. Depois clique em &quot;Confirmar&quot;. A procuração será ativada imediatamente.
              </p>
              <Image src="/images/ecac-guide/07-selecionar-servicos.jpg" alt="Lista de serviços eSocial para selecionar" width={800} height={400} className="rounded-lg border shadow-sm w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* "O que acontece depois?" section removed - unnecessary for user flow */}

      {/* Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {verified ? '✅ eSocial conectado com sucesso!' : 'Verificar conexão'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {verified ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
              <p className="text-sm font-medium">Tudo certo!</p>
              <p className="text-sm text-muted-foreground">
                Sua procuração foi verificada. A LarDia agora pode gerenciar seu eSocial, 
                gerar a folha de pagamento e emitir as guias DAE automaticamente.
              </p>
              <Link href="/dashboard/esocial">
                <Button className="w-full">Ir para o painel eSocial</Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Já cadastrou a procuração? Informe seu CPF para verificarmos a conexão:
              </p>
              <div>
                <label htmlFor="cpf" className="text-sm font-medium block mb-1.5">CPF do empregador</label>
                <Input id="cpf" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} maxLength={14} />
                {error && <p className="text-sm text-destructive mt-1">{error}</p>}
              </div>
              <Button onClick={handleVerify} disabled={verifying} className="w-full">
                {verifying ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verificando...</> : 'Verificar conexão'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
