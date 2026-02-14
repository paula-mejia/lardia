'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getReferralLink, getWhatsAppShareUrl, ensureReferralCode } from '@/lib/referral'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Copy, Check, Gift, Users, Award, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Referral {
  id: string
  status: string
  created_at: string
  completed_at: string | null
}

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState({ invited: 0, joined: 0, monthsEarned: 0 })
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: employer } = await supabase
      .from('employers')
      .select('id, referral_code, referral_bonus_months')
      .eq('user_id', user.id)
      .single()

    if (!employer) return

    // Ensure code exists
    let code = employer.referral_code
    if (!code) {
      code = await ensureReferralCode(employer.id)
    }
    setReferralCode(code)

    // Load referrals
    const { data: refs } = await supabase
      .from('referrals')
      .select('id, status, created_at, completed_at')
      .eq('referrer_id', employer.id)
      .order('created_at', { ascending: false })

    const allRefs = refs || []
    setReferrals(allRefs)
    setStats({
      invited: allRefs.length,
      joined: allRefs.filter(r => r.status === 'completed' || r.status === 'rewarded').length,
      monthsEarned: employer.referral_bonus_months || 0,
    })
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  async function copyToClipboard(text: string, type: 'code' | 'link') {
    await navigator.clipboard.writeText(text)
    if (type === 'code') {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  function statusLabel(status: string) {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'completed': return 'Ativo'
      case 'rewarded': return 'Recompensado'
      default: return status
    }
  }

  function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'rewarded': return 'default'
      case 'completed': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </>
    )
  }

  const shareLink = referralCode ? getReferralLink(referralCode) : ''
  const whatsappUrl = referralCode ? getWhatsAppShareUrl(referralCode) : ''

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Indicar amigos</h1>
            <p className="text-sm text-muted-foreground">
              Convide amigos e ganhe 1 mes gratis para cada indicacao
            </p>
          </div>
        </div>

        {/* Referral code card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5 text-emerald-500" />
              Seu codigo de indicacao
            </CardTitle>
            <CardDescription>
              Compartilhe seu codigo ou link com amigos empregadores domesticos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-md px-4 py-3 font-mono text-lg text-center font-bold tracking-wider">
                {referralCode}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => referralCode && copyToClipboard(referralCode, 'code')}
              >
                {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Link */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-md px-4 py-2 text-sm text-muted-foreground truncate">
                {shareLink}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(shareLink, 'link')}
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* WhatsApp share */}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                Compartilhar no WhatsApp
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats.invited}</p>
              <p className="text-xs text-muted-foreground">Convidados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
              <p className="text-2xl font-bold">{stats.joined}</p>
              <p className="text-xs text-muted-foreground">Assinaram</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Award className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-2xl font-bold">{stats.monthsEarned}</p>
              <p className="text-xs text-muted-foreground">Meses ganhos</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suas indicacoes</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Voce ainda nao indicou ninguem. Compartilhe seu codigo!
              </p>
            ) : (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        Indicacao #{ref.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ref.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant={statusVariant(ref.status)}>
                      {statusLabel(ref.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
