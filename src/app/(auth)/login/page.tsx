'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trackAuditEvent } from '@/lib/audit-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const router = useRouter()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setMagicLinkLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://lardia.com.br/auth/callback',
      },
    })

    if (error) {
      setError('Erro ao enviar link. Tente novamente.')
      setMagicLinkLoading(false)
      return
    }

    trackAuditEvent('magic_link_requested', 'auth', { email })
    setMagicLinkSent(true)
    setMagicLinkLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    trackAuditEvent('login', 'auth', { email })
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Entrar no LarDia</CardTitle>
          <CardDescription>
            Gerencie o eSocial da sua empregada doméstica
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Magic Link - Primary Method */}
          {magicLinkSent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-800 dark:bg-emerald-950">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                ✉️ Link enviado! Verifique seu email.
              </p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Enviamos um link de acesso para <strong>{email}</strong>
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => { setMagicLinkSent(false); setEmail('') }}
              >
                Tentar outro email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">E-mail</Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && !showPasswordForm && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={magicLinkLoading}>
                {magicLinkLoading ? 'Enviando...' : 'Enviar link de acesso'}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <button
                type="button"
                className="bg-card px-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                ou entre com senha
              </button>
            </div>
          </div>

          {/* Password Form - Secondary/Collapsible */}
          {showPasswordForm && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && showPasswordForm && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" variant="outline" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar com senha'}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              Criar conta grátis
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
