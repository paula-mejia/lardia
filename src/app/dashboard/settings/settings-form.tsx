'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bell, BellOff, Mail, Check } from 'lucide-react'

interface SettingsFormProps {
  employerId: string
  email: string
  emailReminders: boolean
  daysBefore: number
}

export function SettingsForm({
  employerId,
  email,
  emailReminders: initialEmailReminders,
  daysBefore: initialDaysBefore,
}: SettingsFormProps) {
  const [emailReminders, setEmailReminders] = useState(initialEmailReminders)
  const [daysBefore, setDaysBefore] = useState(initialDaysBefore)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const supabase = createClient()

    const { error: upsertError } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          employer_id: employerId,
          email_reminders: emailReminders,
          days_before: daysBefore,
        },
        { onConflict: 'employer_id' }
      )

    setSaving(false)

    if (upsertError) {
      setError('Erro ao salvar. Tente novamente.')
      console.error(upsertError)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const hasChanges =
    emailReminders !== initialEmailReminders || daysBefore !== initialDaysBefore

  return (
    <div className="space-y-6">
      {/* Email display */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm text-muted-foreground">
              Email da conta
            </Label>
            <p className="font-medium">{email}</p>
          </div>
        </div>
      </Card>

      {/* Notification toggle */}
      <Card className="p-4">
        <h2 className="font-semibold mb-4">Notificacoes por email</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {emailReminders ? (
                <Bell className="h-5 w-5 text-blue-500" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Lembretes de prazos eSocial</p>
                <p className="text-sm text-muted-foreground">
                  Receba emails antes dos vencimentos
                </p>
              </div>
            </div>
            <Button
              variant={emailReminders ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEmailReminders(!emailReminders)}
            >
              {emailReminders ? 'Ativado' : 'Desativado'}
            </Button>
          </div>

          {emailReminders && (
            <div className="pl-8 space-y-2">
              <Label htmlFor="days-before">Lembrar com antecedencia de</Label>
              <Select
                value={String(daysBefore)}
                onValueChange={(v) => setDaysBefore(Number(v))}
              >
                <SelectTrigger id="days-before" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 dia antes</SelectItem>
                  <SelectItem value="2">2 dias antes</SelectItem>
                  <SelectItem value="3">3 dias antes</SelectItem>
                  <SelectItem value="5">5 dias antes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Voce tambem recebera um lembrete no dia do vencimento.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Save button */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className="w-full"
      >
        {saving ? (
          'Salvando...'
        ) : saved ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Salvo!
          </>
        ) : (
          'Salvar alteracoes'
        )}
      </Button>
    </div>
  )
}
