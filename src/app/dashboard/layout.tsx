import { createClient } from '@/lib/supabase/server'
import { TrialBanner } from '@/components/trial-banner'
import { DashboardNav } from '@/components/dashboard-nav'
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let showBanner = false
  let daysLeft = 14
  let userEmail = ''

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      userEmail = user.email || ''
      const { data: employer } = await supabase
        .from('employers')
        .select('subscription_status, created_at')
        .eq('user_id', user.id)
        .single()

      if (employer && employer.subscription_status !== 'active' && employer.subscription_status !== 'trialing') {
        showBanner = true
        if (employer.created_at) {
          const created = new Date(employer.created_at)
          const now = new Date()
          const elapsed = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
          daysLeft = Math.max(0, 14 - elapsed)
        }
      }
    }
  } catch {
    // Silently fail - don't block dashboard access
  }

  return (
    <div className="min-h-screen bg-background flex dashboard-page">
      <DashboardNav />
      <div className="flex-1 lg:ml-0">
        {showBanner && <TrialBanner daysLeft={daysLeft} />}
        {/* Top bar */}
        <header className="border-b px-4 py-3 flex justify-between items-center lg:px-6">
          <div className="lg:hidden w-10" /> {/* Spacer for mobile hamburger */}
          <p className="text-sm text-muted-foreground hidden lg:block">{userEmail}</p>
          <LogoutButton />
        </header>
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
