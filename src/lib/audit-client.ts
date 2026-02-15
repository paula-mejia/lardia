// Client-side audit logging helper
// Sends audit events to /api/audit

export function trackAuditEvent(
  action: string,
  resource: string,
  metadata: Record<string, unknown> = {},
) {
  // Fire and forget - don't block UI
  fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, resource, metadata }),
  }).catch(() => {
    // Silent fail - audit should never break the app
  })
}
