'use client'

import Link from 'next/link'

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
      Seu período de teste termina em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}.{' '}
      <Link href="/dashboard/settings" className="font-medium underline">
        Assinar agora
      </Link>
    </div>
  )
}
