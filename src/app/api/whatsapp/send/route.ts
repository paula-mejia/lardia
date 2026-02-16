import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Campos "to" e "message" são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await sendWhatsAppMessage(to, message)

    if (result.success) {
      return NextResponse.json({ success: true, sid: result.sid })
    } else {
      return NextResponse.json(
        { error: result.error || 'Falha ao enviar mensagem' },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('WhatsApp send API error:', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
