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
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TOTAL_STEPS = 4

export default function ConnectESocialPage() {
  const [step, setStep] = useState(1)
  const [cpf, setCpf] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')

  // Format CPF as user types (XXX.XXX.XXX-XX)
  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  async function handleVerify() {
    const digits = cpf.replace(/\D/g, '')
    if (digits.length !== 11) {
      setError('CPF deve ter 11 digitos.')
      return
    }

    setVerifying(true)
    setError('')

    try {
      // Mock verification - in production this would check with eSocial API
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
    <>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
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
              className={`h-1.5 flex-1 rounded-full ${
                i < step ? 'bg-emerald-600' : 'bg-muted'
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
                O que e a procuracao eletronica?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">
                Para que a Lardia gerencie seu eSocial, voce precisa nos
                autorizar via procuracao eletronica no eCAC (Centro Virtual de
                Atendimento da Receita Federal).
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A procuracao eletronica e um documento digital que autoriza a
                Lardia a enviar e consultar informacoes no eSocial em seu nome.
                Isso e necessario para que possamos automatizar o envio da folha
                de pagamento, gerar as guias DAE e manter suas obrigacoes em
                dia.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Voce pode revogar essa procuracao a qualquer momento diretamente
                no site da Receita Federal.
              </p>
              <Button onClick={() => setStep(2)} className="w-full">
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Requisitos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Antes de comecar, verifique se voce tem tudo pronto:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      Conta gov.br nivel prata ou ouro
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Necessario para acessar o eCAC. Se voce ainda nao tem,{' '}
                      <a
                        href="https://sso.acesso.gov.br/signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 underline"
                      >
                        crie sua conta gov.br aqui
                        <ExternalLink className="h-3 w-3 inline ml-0.5" />
                      </a>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">CPF do empregador</p>
                    <p className="text-xs text-muted-foreground">
                      O CPF que esta cadastrado como empregador domestico no
                      eSocial.
                    </p>
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
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Instructions */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Passo a passo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Siga as instrucoes abaixo para cadastrar a procuracao
                eletronica:
              </p>

              <ol className="space-y-4">
                <li className="flex gap-3">
                  <Badge
                    variant="secondary"
                    className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center p-0 text-xs"
                  >
                    1
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Acesse o eCAC</p>
                    <p className="text-xs text-muted-foreground">
                      Acesse{' '}
                      <a
                        href="https://cav.receita.fazenda.gov.br/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 underline"
                      >
                        cav.receita.fazenda.gov.br
                        <ExternalLink className="h-3 w-3 inline ml-0.5" />
                      </a>{' '}
                      e faca login com sua conta gov.br.
                    </p>
                    {/* Screenshot placeholder */}
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center text-xs text-muted-foreground">
                      [Imagem: Tela de login do eCAC]
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <Badge
                    variant="secondary"
                    className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center p-0 text-xs"
                  >
                    2
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Navegue ate Procuracao Eletronica
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No menu, clique em &quot;Procuracao Eletronica&quot; e
                      depois em &quot;Cadastrar Procuracao&quot;.
                    </p>
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center text-xs text-muted-foreground">
                      [Imagem: Menu do eCAC]
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <Badge
                    variant="secondary"
                    className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center p-0 text-xs"
                  >
                    3
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Insira o CNPJ da Lardia
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No campo de CNPJ do procurador, insira o CNPJ da{' '}
                      <strong>COCORA CONSULTORIA E SERVIÇOS ADMINISTRATIVOS LTDA</strong>:{' '}
                      <span className="font-mono font-medium">
                        46.728.966/0001-40
                      </span>
                    </p>
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center text-xs text-muted-foreground">
                      [Imagem: Formulario de procuracao]
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <Badge
                    variant="secondary"
                    className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center p-0 text-xs"
                  >
                    4
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Selecione o servico</p>
                    <p className="text-xs text-muted-foreground">
                      Marque a opcao{' '}
                      <span className="font-medium">
                        &quot;eSocial - Empregador Domestico&quot;
                      </span>{' '}
                      na lista de servicos disponiveis.
                    </p>
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center text-xs text-muted-foreground">
                      [Imagem: Selecao de servicos]
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <Badge
                    variant="secondary"
                    className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center p-0 text-xs"
                  >
                    5
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Confirme e salve</p>
                    <p className="text-xs text-muted-foreground">
                      Revise os dados e confirme a procuracao. Pronto!
                    </p>
                  </div>
                </li>
              </ol>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Ja cadastrei a procuracao
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
                {verified ? 'eSocial conectado com sucesso!' : 'Verificar conexao'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {verified ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Sua procuracao eletronica foi verificada. A Lardia agora pode
                    gerenciar seu eSocial.
                  </p>
                  <Link href="/dashboard/esocial">
                    <Button className="w-full">Ir para o painel eSocial</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Informe o CPF do empregador para verificarmos se a procuracao
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
                        'Verificar conexao'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
