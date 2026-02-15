import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit, type AuditAction } from '@/lib/audit'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const ALLOWED_ACTIONS: AuditAction[] = [
  'login',
  'signup',
  'logout',
  'employee_created',
  'employee_updated',
  'payroll_calculated',
  'payroll_saved',
]

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, 'audit', RATE_LIMITS.api)
  if (rateLimited) return rateLimited

  const body = await request.json()
  const { action, resource, metadata } = body

  if (!action || !ALLOWED_ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let employerId: string | null = null
  if (user) {
    const { data: employer } = await supabase
      .from('employers')
      .select('id')
      .eq('user_id', user.id)
      .single()
    employerId = employer?.id || null
  }

  await logAudit(
    action as AuditAction,
    resource || action,
    metadata || {},
    request,
    user?.id || null,
    employerId,
  )

  return NextResponse.json({ ok: true })
}
