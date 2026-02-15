'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'

interface NewsletterSignupProps {
  source?: 'landing' | 'blog' | 'simulator' | 'calculator' | 'faq'
  compact?: boolean
}

export default function NewsletterSignup({ source = 'landing', compact = false }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [lgpdConsent, setLgpdConsent] = useState(false)
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

    if (!lgpdConsent) {
      setErrorMessage('É necessário aceitar a política de privacidade.')
      setStatus('error')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, lgpdConsent }),
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
      <section className={compact ? 'py-6' : 'py-12 md:py-16'}>
        <div className="container mx-auto px-4">
          <Card className="max-w-xl mx-auto border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-8 pb-8 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-400">
                Email cadastrado com sucesso!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Você receberá nossos alertas em breve.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className={compact ? 'py-6' : 'py-12 md:py-16'}>
      <div className="container mx-auto px-4">
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-8 pb-8 text-center">
            <Mail className="h-10 w-10 text-emerald-700 dark:text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              Fique por dentro das mudanças no eSocial
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Receba alertas de prazos, mudanças na legislação e dicas para empregadores domésticos
            </p>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
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
                <Button type="submit" disabled={status === 'loading' || !lgpdConsent}>
                  {status === 'loading' ? 'Enviando...' : 'Receber alertas'}
                </Button>
              </div>
              <label className="flex items-start gap-2 mt-4 text-left cursor-pointer">
                <input
                  type="checkbox"
                  checked={lgpdConsent}
                  onChange={(e) => {
                    setLgpdConsent(e.target.checked)
                    if (status === 'error') setStatus('idle')
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-emerald-700"
                />
                <span className="text-xs text-muted-foreground">
                  Concordo em receber comunicações da LarDia e aceito a{' '}
                  <Link href="/privacidade" className="underline hover:text-foreground" target="_blank">
                    Política de Privacidade
                  </Link>
                  . Você pode cancelar a inscrição a qualquer momento.
                </span>
              </label>
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
