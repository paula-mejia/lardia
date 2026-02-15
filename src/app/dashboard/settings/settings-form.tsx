'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bell, BellOff, Mail, Check, MessageCircle } from 'lucide-react'

interface SettingsFormProps {
  employerId: string
  email: string
  emailReminders: boolean
  daysBefore: number
  whatsappReminders: boolean
  whatsappNumber: string
}

// Format phone input as user types: +55 (XX) XXXXX-XXXX
function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return '+55 '
  if (digits.length <= 2) return `+${digits}`
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`
  if (digits.length <= 9)
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`
}

// Extract raw digits from formatted phone
function extractDigits(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

export function SettingsForm({
  employerId,
  email,
  emailReminders: initialEmailReminders,
  daysBefore: initialDaysBefore,
  whatsappReminders: initialWhatsappReminders,
  whatsappNumber: initialWhatsappNumber,
}: SettingsFormProps) {
  const [emailReminders, setEmailReminders] = useState(initialEmailReminders)
  const [daysBefore, setDaysBefore] = useState(initialDaysBefore)
  const [whatsappReminders, setWhatsappReminders] = useState(initialWhatsappReminders)
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialWhatsappNumber ? formatPhoneDisplay(initialWhatsappNumber) : '+55 '
  )
  const [lgpdConsent, setLgpdConsent] = useState(initialWhatsappReminders)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rawDigits = extractDigits(whatsappNumber)
  const isValidPhone = rawDigits.length === 12 || rawDigits.length === 13

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const digits = input.replace(/\D/g, '')
    // Ensure country code 55 prefix
    const withPrefix = digits.startsWith('55') ? digits : `55${digits}`
    setWhatsappNumber(formatPhoneDisplay(withPrefix))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    // Validate phone if WhatsApp is enabled
    if (whatsappReminders && !isValidPhone) {
      setError('Número de WhatsApp inválido. Use o formato brasileiro completo.')
      setSaving(false)
      return
    }

    if (whatsappReminders && !lgpdConsent) {
      setError('Você precisa aceitar o consentimento para receber mensagens no WhatsApp.')
      setSaving(false)
      return
    }

    const supabase = createClient()

    const { error: upsertError } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          employer_id: employerId,
          email_reminders: emailReminders,
          days_before: daysBefore,
          whatsapp_reminders: whatsappReminders,
          whatsapp_number: whatsappReminders ? `+${rawDigits}` : null,
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
    emailReminders !== initialEmailReminders ||
    daysBefore !== initialDaysBefore ||
    whatsappReminders !== initialWhatsappReminders ||
    (whatsappReminders && `+${rawDigits}` !== initialWhatsappNumber)

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

      {/* Email notification toggle */}
      <Card className="p-4">
        <h2 className="font-semibold mb-4">Notificações por email</h2>
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
              <Label htmlFor="days-before">Lembrar com antecedência de</Label>
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
                Você também receberá um lembrete no dia do vencimento.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* WhatsApp notification toggle */}
      <Card className="p-4">
        <h2 className="font-semibold mb-4">Notificações por WhatsApp</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {whatsappReminders ? (
                <MessageCircle className="h-5 w-5 text-green-500" />
              ) : (
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Lembretes via WhatsApp</p>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes de DAE e folha de pagamento
                </p>
              </div>
            </div>
            <Button
              variant={whatsappReminders ? 'default' : 'outline'}
              size="sm"
              className={whatsappReminders ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={() => setWhatsappReminders(!whatsappReminders)}
            >
              {whatsappReminders ? 'Ativado' : 'Desativado'}
            </Button>
          </div>

          {whatsappReminders && (
            <div className="pl-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
                <Input
                  id="whatsapp-number"
                  type="tel"
                  placeholder="+55 (11) 99999-9999"
                  value={whatsappNumber}
                  onChange={handlePhoneChange}
                  className="w-64"
                />
                {rawDigits.length > 2 && !isValidPhone && (
                  <p className="text-xs text-red-500">
                    Número incompleto. Use DDD + número (ex: 11 99999-9999)
                  </p>
                )}
              </div>

              {/* LGPD consent */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="lgpd-consent"
                  checked={lgpdConsent}
                  onCheckedChange={(checked) => setLgpdConsent(checked === true)}
                />
                <Label htmlFor="lgpd-consent" className="text-sm leading-snug cursor-pointer">
                  Autorizo o envio de mensagens de lembrete via WhatsApp.
                  Você pode desativar a qualquer momento. Seus dados serão
                  tratados conforme a LGPD (Lei 13.709/2018).
                </Label>
              </div>
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
          'Salvar alterações'
        )}
      </Button>
    </div>
  )
}
