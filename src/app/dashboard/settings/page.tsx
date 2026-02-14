import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'
import { SubscriptionCard } from './subscription-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get employer profile
  const { data: employer } = await supabase
    .from('employers')
    .select('id, email, subscription_status, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!employer) {
    redirect('/dashboard')
  }

  // Get notification preferences (or defaults)
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('email_reminders, days_before, whatsapp_reminders, whatsapp_number')
    .eq('employer_id', employer.id)
    .single()

  const email = employer.email || user.email || ''

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Configuracoes</h1>
        </div>

        <SubscriptionCard
          subscriptionStatus={employer.subscription_status || 'none'}
          hasCustomer={!!employer.stripe_customer_id}
        />

        <SettingsForm
          employerId={employer.id}
          email={email}
          emailReminders={prefs?.email_reminders ?? true}
          daysBefore={prefs?.days_before ?? 3}
          whatsappReminders={prefs?.whatsapp_reminders ?? false}
          whatsappNumber={prefs?.whatsapp_number ?? ''}
        />
      </div>
    </>
  )
}
