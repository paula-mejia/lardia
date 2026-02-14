// Twilio WhatsApp Business API client for sending reminder messages
// Env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM

export interface WhatsAppConfig {
  accountSid: string
  authToken: string
  fromNumber: string // e.g. "whatsapp:+14155238886"
}

export interface SendMessageResult {
  success: boolean
  sid?: string
  error?: string
}

// Validate Brazilian phone number format
// Accepts: +5511999998888, 5511999998888, 11999998888, (11) 99999-8888, etc.
// Returns normalized format: +55XXXXXXXXXXX or null if invalid
export function validateBrazilianPhone(phone: string): string | null {
  // Strip everything except digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, '')

  const digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned

  // If starts with 55 and has 12-13 digits total, it's already with country code
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`
  }

  // If 10-11 digits, assume missing country code
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`
  }

  return null
}

// Format phone for Twilio WhatsApp API
export function formatWhatsAppNumber(phone: string): string {
  const normalized = validateBrazilianPhone(phone)
  if (!normalized) throw new Error(`Invalid Brazilian phone number: ${phone}`)
  return `whatsapp:${normalized}`
}

function getConfig(): WhatsAppConfig {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
  const authToken = process.env.TWILIO_AUTH_TOKEN || ''
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

  return { accountSid, authToken, fromNumber }
}

// Send a WhatsApp message via Twilio REST API
export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<SendMessageResult> {
  const config = getConfig()

  if (!config.accountSid || !config.authToken) {
    console.log(`[WHATSAPP DRY RUN] To: ${to} | Message: ${body}`)
    return { success: true, sid: 'dry-run' }
  }

  const toFormatted = formatWhatsAppNumber(to)
  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`

  const params = new URLSearchParams({
    From: config.fromNumber,
    To: toFormatted,
    Body: body,
  })

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (res.ok) {
      const data = await res.json()
      return { success: true, sid: data.sid }
    } else {
      const errText = await res.text()
      console.error('Twilio WhatsApp error:', errText)
      return { success: false, error: errText }
    }
  } catch (err) {
    console.error('WhatsApp send error:', err)
    return { success: false, error: String(err) }
  }
}

// Pre-built reminder message templates (Portuguese)
export function buildDaeReminderMessage(daysUntil: number, dueDay: number, estimatedValue?: string): string {
  const valor = estimatedValue || 'R$XXX'

  if (daysUntil === 0) {
    return `Hoje e o ultimo dia para pagar o DAE! Valor: ${valor}. Nao esqueca!`
  }

  return `Lembrete: o DAE do mes vence em ${daysUntil} dias (dia ${dueDay}). Valor estimado: ${valor}. Acesse Lardia para gerar o comprovante.`
}

export function buildPayrollReminderMessage(): string {
  return 'Hora de fechar a folha de pagamento do mes. Acesse Lardia.'
}
