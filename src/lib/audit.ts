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
  | 'esocial_monthly_processed'
  | 'esocial_event_retry'
  | 'dae_pdf_generated'

// Use service role to bypass RLS for inserts from any context
function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

/**
 * Extract client IP from request headers
 */
function extractIp(request?: Request): string | null {
  if (!request) return null
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || null
}

/**
 * Extract user agent from request
 */
function extractUserAgent(request?: Request): string | null {
  if (!request) return null
  return request.headers.get('user-agent') || null
}

/**
 * Log an audit event.
 *
 * @param action - The action performed (e.g. 'login', 'employee_created')
 * @param resource - The resource affected (e.g. 'auth', 'employee', 'payroll')
 * @param metadata - Additional metadata about the action
 * @param request - The incoming request (used to extract IP and user agent)
 * @param userId - Optional user ID (Supabase auth user id)
 * @param employerId - Optional employer ID
 */
export async function logAudit(
  action: AuditAction,
  resource: string,
  metadata: Record<string, unknown> = {},
  request?: Request,
  userId?: string | null,
  employerId?: string | null,
): Promise<void> {
  try {
    const supabase = getServiceSupabase()
    await supabase.from('audit_logs').insert({
      employer_id: employerId || null,
      action,
      details: { resource, user_agent: extractUserAgent(request), ...metadata },
      ip_address: extractIp(request),
    })
  } catch (err) {
    // Never let audit logging break the main flow
    console.error('Audit log error:', err)
  }
}


