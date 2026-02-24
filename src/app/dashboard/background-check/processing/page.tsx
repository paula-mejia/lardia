'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function BackgroundCheckProcessingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-6 max-w-4xl text-center"><Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" /></div>}>
      <ProcessingContent />
    </Suspense>
  )
}

function ProcessingContent() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || ''
  const cpf = searchParams.get('cpf') || ''
  const dob = searchParams.get('dob') || ''

  const [status, setStatus] = useState<'running' | 'done' | 'error'>('running')
  const [checkId, setCheckId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cpf || !name) {
      setStatus('error')
      setError('Dados do candidato não encontrados')
      return
    }

    async function runCheck() {
      try {
        const res = await fetch('/api/background-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateName: name,
            candidateCpf: cpf,
            candidateDob: dob,
            lgpdConsent: true,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Erro ao realizar consulta')
        }

        setCheckId(data.id)
        setStatus('done')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado')
        setStatus('error')
      }
    }

    runCheck()
  }, [cpf, name, dob])

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/background-check">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Verificação Pré-Contratação</h1>
      </div>

      <Card>
        <CardContent className="py-12 text-center space-y-4">
          {status === 'running' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-lg font-medium">Consultando bases de dados...</p>
              <p className="text-sm text-muted-foreground">
                Verificando TJSP (1ª e 2ª instância) para {name}
              </p>
              <p className="text-xs text-muted-foreground">Isso pode levar até 30 segundos</p>
            </>
          )}

          {status === 'done' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
              <p className="text-lg font-medium">Consulta finalizada!</p>
              <p className="text-sm text-muted-foreground">
                A verificação de {name} foi concluída com sucesso.
              </p>
              <div className="flex gap-2 justify-center pt-4">
                {checkId && (
                  <Link href={`/dashboard/background-check/results?id=${checkId}`}>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Resultado
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard/background-check/history">
                  <Button variant="outline">Ver Histórico</Button>
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-lg font-medium">Erro na consulta</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Link href="/dashboard/background-check">
                <Button variant="outline" className="mt-4">Tentar Novamente</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
