import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PayrollCalculator from '@/components/payroll-calculator'
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lardia</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        {/* Calculator */}
        <PayrollCalculator />
      </div>
    </main>
  )
}
