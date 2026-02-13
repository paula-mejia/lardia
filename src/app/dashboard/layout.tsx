import { createClient } from '@/lib/supabase/server'
import { TrialBanner } from '@/components/trial-banner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let showBanner = false
  let daysLeft = 14

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
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
    <>
      {showBanner && <TrialBanner daysLeft={daysLeft} />}
      {children}
    </>
  )
}
