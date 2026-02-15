'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { trackSignupStarted, trackSignupCompleted } from '@/lib/analytics'
import { trackAuditEvent } from '@/lib/audit-client'

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(true)
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')
  const [refCode, setRefCode] = useState<string | null>(ref)

  useEffect(() => {
    if (ref) {
      localStorage.setItem('lardia_ref', ref)
    } else {
      const stored = localStorage.getItem('lardia_ref')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setRefCode(stored)
    }
  }, [ref])

  async function handleMagicLinkSignup(e: React.FormEvent) {
    e.preventDefault()
    trackSignupStarted()
    setMagicLinkLoading(true)
    setError(null)

    const supabase = createClient()
    const metadata: Record<string, string> = {}
    if (name) metadata.name = name
    if (refCode) metadata.referral_code = refCode

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://lardia.com.br/auth/callback',
        data: metadata,
      },
    })

    if (error) {
      setError('Erro ao enviar link. Tente novamente.')
      setMagicLinkLoading(false)
      return
    }

    trackSignupCompleted()
    trackAuditEvent('magic_link_signup', 'auth', { email })
    setMagicLinkSent(true)
    setMagicLinkLoading(false)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    trackSignupStarted()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const signUpOptions: { email: string; password: string; options?: { data: Record<string, string> } } = {
      email,
      password,
    }
    const metadata: Record<string, string> = {}
    if (name) metadata.name = name
    if (refCode) metadata.referral_code = refCode
    if (Object.keys(metadata).length > 0) {
      signUpOptions.options = { data: metadata }
    }

    const { error } = await supabase.auth.signUp(signUpOptions)

    if (error) {
      setError('Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    trackSignupCompleted()
    trackAuditEvent('signup', 'auth', { email })
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verifique seu e-mail</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para <strong>{email}</strong>.
              Clique no link para ativar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button variant="outline">Voltar para login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            Comece a gerenciar o eSocial da sua empregada doméstica
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Magic Link - Primary Signup Method */}
          {magicLinkSent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-600 dark:bg-emerald-950">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-200">
                ✉️ Link enviado! Verifique seu email.
              </p>
              <p className="mt-1 text-xs text-emerald-500 dark:text-emerald-400">
                Enviamos um link de acesso para <strong>{email}</strong>
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => { setMagicLinkSent(false); setEmail(''); setName('') }}
              >
                Tentar outro email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleMagicLinkSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-name">Nome</Label>
                <Input
                  id="magic-name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
                {magicLinkLoading ? 'Enviando...' : 'Criar conta'}
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
                ou cadastre com senha
              </button>
            </div>
          </div>

          {/* Password Form - Secondary/Collapsible */}
          {showPasswordForm && (
            <form onSubmit={handleSignup} className="space-y-4">
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
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar senha</Label>
                <PasswordInput
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && showPasswordForm && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" variant="outline" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta com senha'}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
