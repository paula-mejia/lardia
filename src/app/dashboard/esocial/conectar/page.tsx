'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useApi } from '@/hooks/use-api'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Play,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

// Steps for the guided procuração flow
const STEPS = [
  {
    title: 'Acesse o eCAC com sua conta gov.br',
    description: (
      <>
        Acesse{' '}
        <a
          href="https://cav.receita.fazenda.gov.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-500 underline inline-flex items-center gap-0.5"
        >
          cav.receita.fazenda.gov.br
          <ExternalLink className="h-3 w-3" />
        </a>{' '}
        e faça login com sua conta gov.br (nível prata ou ouro).
      </>
    ),
  },
  {
    title: 'Navegue até Procuração Eletrônica',
    description:
      'No menu, clique em "Delegação e Procuração" → "Procuração Eletrônica".',
  },
  {
    title: 'Cadastrar Procuração',
    description: 'Clique em "Cadastrar Procuração".',
  },
  {
    title: 'Informe o CNPJ da COCORA CONSULTORIA',
    description: (
      <>
        No campo de CNPJ do procurador, insira:{' '}
        <span className="font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">
          46.728.966/0001-40
        </span>{' '}
        (COCORA CONSULTORIA)
      </>
    ),
  },
  {
    title: 'Selecione os serviços do eSocial',
    description:
      'Marque todos os serviços relacionados ao eSocial na lista de serviços disponíveis.',
  },
  {
    title: 'Confirme e assine a procuração',
    description:
      'Revise os dados, confirme e assine a procuração eletrônica.',
  },
]

type ProcuracaoStatus = 'not_started' | 'pending_verification' | 'active'

// Status badge configuration
const STATUS_CONFIG: Record<
  ProcuracaoStatus,
  { label: string; variant: 'secondary' | 'default' | 'outline'; icon: React.ReactNode }
> = {
  not_started: {
    label: 'Não iniciado',
    variant: 'secondary',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  pending_verification: {
    label: 'Aguardando verificação',
    variant: 'outline',
    icon: <Clock className="h-3 w-3" />,
  },
  active: {
    label: 'Ativo',
    variant: 'default',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
}

// API fetch helpers
async function fetchStatus(): Promise<{ status: ProcuracaoStatus }> {
  const res = await fetch('/api/esocial/procuracao')
  if (!res.ok) throw new Error('Erro ao buscar status')
  return res.json()
}

async function submitProcuracao(): Promise<{ status: ProcuracaoStatus }> {
  const res = await fetch('/api/esocial/procuracao', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'pending_verification' }),
  })
  if (!res.ok) throw new Error('Erro ao enviar procuração')
  return res.json()
}

export default function ConectarESocialPage() {
  // Checklist state: one boolean per step
  const [checked, setChecked] = useState<boolean[]>(
    () => STEPS.map(() => false)
  )
  const allChecked = checked.every(Boolean)

  // API state for fetching current status
  const statusApi = useApi(fetchStatus)
  // API state for submitting procuração
  const submitApi = useApi(submitProcuracao)

  const currentStatus: ProcuracaoStatus =
    submitApi.data?.status ?? statusApi.data?.status ?? 'not_started'
  const statusConfig = STATUS_CONFIG[currentStatus]

  // Fetch status on mount
  const loadStatus = useCallback(() => {
    statusApi.execute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  // Toggle a checklist item
  function toggleStep(index: number) {
    setChecked((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  // Handle submission
  async function handleSubmit() {
    const result = await submitApi.execute()
    if (result) {
      // Pre-check all boxes visually after successful submission
      setChecked(STEPS.map(() => true))
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/esocial">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Conectar eSocial
            </h1>
            <Badge variant={statusConfig.variant} className="gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Autorize a LarDia a gerenciar o eSocial do seu empregado doméstico
          </p>
        </div>
      </div>

      {/* Already active message */}
      {currentStatus === 'active' && (
        <Card className="mt-6 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800">
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
            <div>
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                Procuração ativa
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500">
                A LarDia já está autorizada a gerenciar seu eSocial.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending verification message */}
      {currentStatus === 'pending_verification' && (
        <Card className="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-8 w-8 text-amber-500 shrink-0" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Aguardando verificação
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-500">
                Recebemos sua confirmação. Estamos verificando a procuração.
                Isso pode levar até 24 horas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Play className="h-4 w-4" />
            Como fazer a procuração eletrônica (2 min)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            {/* TODO: Replace with real YouTube URL */}
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/VIDEO_ID_HERE"
              title="Como fazer a procuração eletrônica"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </CardContent>
      </Card>

      {/* Step-by-step instructions with checklist */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Passo a passo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Marque cada etapa conforme for completando:
          </p>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {STEPS.map((step, index) => (
              <li key={index} className="flex gap-3">
                {/* Step number */}
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  <div
                    className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      checked[index]
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {checked[index] ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 min-h-[16px] transition-colors ${
                        checked[index] ? 'bg-emerald-300' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <Checkbox
                      checked={checked[index]}
                      onCheckedChange={() => toggleStep(index)}
                      className="mt-0.5"
                      disabled={currentStatus === 'active'}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium transition-colors ${
                          checked[index]
                            ? 'text-muted-foreground line-through'
                            : ''
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </label>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Submit button */}
      {currentStatus === 'not_started' && (
        <div className="mt-6 space-y-3">
          {submitApi.error && (
            <p className="text-sm text-destructive text-center">
              {submitApi.error}
            </p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!allChecked || submitApi.loading}
            className="w-full"
            size="lg"
          >
            {submitApi.loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Já completei a procuração'
            )}
          </Button>
          {!allChecked && (
            <p className="text-xs text-muted-foreground text-center">
              Marque todas as etapas acima para habilitar o botão.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
