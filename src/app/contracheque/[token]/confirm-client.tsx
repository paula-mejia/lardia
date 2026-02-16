'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

interface Props {
  token: string
  employeeName: string
  monthLabel: string
  netSalary: number | null
  initialConfirmedAt: string | null
}

export default function PayslipConfirmClient({
  token,
  employeeName,
  monthLabel,
  netSalary,
  initialConfirmedAt,
}: Props) {
  const [confirmedAt, setConfirmedAt] = useState<string | null>(initialConfirmedAt)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payslip/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao confirmar')
        return
      }
      setConfirmedAt(data.confirmed_at)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Contracheque</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-center">
          <p className="font-medium">{employeeName}</p>
          <p className="text-muted-foreground">{monthLabel}</p>
          {netSalary !== null && (
            <p className="text-2xl font-bold">{formatBRL(netSalary)}</p>
          )}
        </div>

        {confirmedAt ? (
          <div className="flex flex-col items-center gap-2 py-4 text-emerald-600">
            <CheckCircle className="h-8 w-8" />
            <p className="font-medium">✅ Recebimento confirmado</p>
            <p className="text-sm text-muted-foreground">
              em {formatDateTime(confirmedAt)}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar recebimento
            </Button>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
