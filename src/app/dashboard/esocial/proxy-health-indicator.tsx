'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HealthStatus {
  status: 'loading' | 'connected' | 'disconnected'
  message?: string
  latencyMs?: number
  environment?: string
}

export function ProxyHealthIndicator() {
  const [health, setHealth] = useState<HealthStatus>({ status: 'loading' })

  const checkHealth = useCallback(async () => {
    setHealth({ status: 'loading' })
    try {
      const res = await fetch('/api/esocial/health', { cache: 'no-store' })
      const data = await res.json()
      setHealth({
        status: data.healthy ? 'connected' : 'disconnected',
        message: data.message,
        latencyMs: data.latencyMs,
        environment: data.environment,
      })
    } catch {
      setHealth({
        status: 'disconnected',
        message: 'Não foi possível verificar o status do servidor',
      })
    }
  }, [])

  useEffect(() => {
    setTimeout(checkHealth, 0)
    const interval = setInterval(checkHealth, 60000)
    return () => clearInterval(interval)
  }, [checkHealth])

  const envLabel = health.environment === 'production' ? 'Produção' : 'Produção Restrita'

  return (
    <Card className="mb-4">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {health.status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Verificando servidor eSocial...
                </span>
              </>
            ) : health.status === 'connected' ? (
              <>
                <div className="relative">
                  <Wifi className="h-4 w-4 text-emerald-500" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                </div>
                <div>
                  <span className="text-sm font-medium text-emerald-600">
                    Servidor eSocial online
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {envLabel}
                    {health.latencyMs !== undefined && ` · ${health.latencyMs}ms`}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
                </div>
                <div>
                  <span className="text-sm font-medium text-red-600">
                    Servidor eSocial offline
                  </span>
                  {health.message && (
                    <p className="text-xs text-red-500">{health.message}</p>
                  )}
                </div>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={checkHealth}
            disabled={health.status === 'loading'}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${health.status === 'loading' ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
