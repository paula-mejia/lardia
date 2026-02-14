'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativo', variant: 'default' },
  trialing: { label: 'Periodo de teste', variant: 'secondary' },
  past_due: { label: 'Pagamento pendente', variant: 'destructive' },
  canceled: { label: 'Cancelado', variant: 'destructive' },
  none: { label: 'Sem assinatura', variant: 'outline' },
}

export function SubscriptionCard({
  subscriptionStatus,
  hasCustomer: _hasCustomer,
}: {
  subscriptionStatus: string
  hasCustomer: boolean
}) {
  const [loading, setLoading] = useState(false)
  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
  const status = statusLabels[subscriptionStatus] || statusLabels.none

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handlePortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Portal error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assinatura</CardTitle>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <CardDescription>Lardia Pro - R$29,90/mes</CardDescription>
      </CardHeader>
      <CardContent>
        {isActive ? (
          <Button onClick={handlePortal} disabled={loading} variant="outline">
            {loading ? 'Carregando...' : 'Gerenciar assinatura'}
          </Button>
        ) : (
          <Button onClick={handleCheckout} disabled={loading}>
            {loading ? 'Carregando...' : 'Assinar agora'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
