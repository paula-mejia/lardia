'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Mail } from 'lucide-react'

interface NewsletterSignupProps {
  source?: 'landing' | 'blog' | 'simulator' | 'faq'
}

export default function NewsletterSignup({ source = 'landing' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!isValidEmail(email)) {
      setErrorMessage('Por favor, insira um email valido.')
      setStatus('error')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao cadastrar email.')
      }

      setStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao cadastrar email.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-xl mx-auto border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-8 pb-8 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                Email cadastrado com sucesso!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Voce recebera nossos alertas em breve.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-8 pb-8 text-center">
            <Mail className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              Fique por dentro das mudancas no eSocial
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Receba alertas de prazos, mudancas na legislacao e dicas para empregadores domesticos
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              />
              <Button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Enviando...' : 'Receber alertas'}
              </Button>
            </form>
            {status === 'error' && errorMessage && (
              <p className="text-sm text-red-500 mt-3">{errorMessage}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
