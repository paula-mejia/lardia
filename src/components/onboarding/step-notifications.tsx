import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { NotificationPrefs } from './types'

interface StepNotificationsProps {
  prefs: NotificationPrefs
  setPrefs: (p: NotificationPrefs) => void
}

/**
 * Step 3: Notification preferences for deadlines and product updates.
 */
export function StepNotifications({ prefs, setPrefs }: StepNotificationsProps) {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id="notify_deadlines"
          checked={prefs.notify_deadlines}
          onCheckedChange={v => setPrefs({ ...prefs, notify_deadlines: !!v })}
        />
        <div>
          <Label htmlFor="notify_deadlines" className="font-medium">Prazos e vencimentos</Label>
          <p className="text-sm text-muted-foreground">
            Receba lembretes sobre datas importantes do eSocial, FGTS e INSS.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox
          id="notify_updates"
          checked={prefs.notify_updates}
          onCheckedChange={v => setPrefs({ ...prefs, notify_updates: !!v })}
        />
        <div>
          <Label htmlFor="notify_updates" className="font-medium">Novidades da LarDia</Label>
          <p className="text-sm text-muted-foreground">
            Fique por dentro de novas funcionalidades e atualizações.
          </p>
        </div>
      </div>
    </div>
  )
}
