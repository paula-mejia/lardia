// Audit logging helper
// Logs user actions to the audit_logs table in Supabase

import { createServerClient } from '@supabase/ssr'

export type AuditAction =
  | 'login'
  | 'signup'
  | 'logout'
  | 'employee_created'
  | 'employee_updated'
  | 'payroll_calculated'
  | 'payroll_saved'
  | 'background_check_requested'
  | 'contract_generated'
  | 'subscription_created'
  | 'subscription_canceled'
  | 'esocial_event_submitted'
  | 'pdf_generated'

// Use service role to bypass RLS for inserts from any context
function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function auditLog(
  employerId: string | null,
  action: AuditAction,
  details: Record<string, unknown> = {},
  ip?: string
): Promise<void> {
  try {
    const supabase = getServiceSupabase()
    await supabase.from('audit_logs').insert({
      employer_id: employerId,
      action,
      details,
      ip_address: ip || null,
    })
  } catch (err) {
    // Never let audit logging break the main flow
    console.error('Audit log error:', err)
  }
}
