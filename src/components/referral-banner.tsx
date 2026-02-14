'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { Gift } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ReferralBanner() {
  return (
    <Suspense>
      <ReferralBannerInner />
    </Suspense>
  )
}

function ReferralBannerInner() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')

  useEffect(() => {
    if (ref) {
      localStorage.setItem('lardia_ref', ref)
    }
  }, [ref])

  if (!ref) return null

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 text-sm">
        <Gift className="h-4 w-4 text-emerald-600" />
        <span className="text-emerald-800 dark:text-emerald-200">
          Voce foi indicado por um amigo! Cadastre-se e aproveite.
        </span>
        <Link href={`/signup?ref=${ref}`}>
          <Button size="sm" variant="default" className="h-7 text-xs">
            Criar conta
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Section for the landing page
export function ReferralSection() {
  return (
    <section className="py-12 bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-950/20 dark:to-sky-950/20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Gift className="h-6 w-6 text-emerald-600" />
          <h3 className="text-xl font-bold">Indique e ganhe</h3>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto mb-4">
          Indique amigos empregadores e ganhe 1 mes gratis para cada amigo que assinar a Lardia.
        </p>
        <Link href="/signup">
          <Button variant="outline">
            Saiba mais
          </Button>
        </Link>
      </div>
    </section>
  )
}
