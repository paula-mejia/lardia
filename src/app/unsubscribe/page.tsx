'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, MailX } from 'lucide-react'
import Link from 'next/link'

export default function UnsubscribePage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!isValidEmail(email)) {
      setErrorMessage('Por favor, insira um email válido.')
      setStatus('error')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao cancelar inscrição.')
      }

      setStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao cancelar inscrição.')
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            LarDia
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        {status === 'success' ? (
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Inscrição cancelada</h1>
              <p className="text-sm text-muted-foreground mb-4">
                Você não receberá mais emails da LarDia.
              </p>
              <p className="text-xs text-muted-foreground">
                Caso mude de ideia, você pode se inscrever novamente a qualquer momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <MailX className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Cancelar inscrição</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Insira seu email para deixar de receber nossos alertas.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === 'error') setStatus('idle')
                  }}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
                <Button type="submit" variant="destructive" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Processando...' : 'Cancelar inscrição'}
                </Button>
              </form>
              {status === 'error' && errorMessage && (
                <p className="text-sm text-red-500 mt-3">{errorMessage}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
