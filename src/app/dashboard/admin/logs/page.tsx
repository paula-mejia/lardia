import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const ACTION_LABELS: Record<string, string> = {
  login: 'Login',
  signup: 'Cadastro',
  logout: 'Logout',
  employee_created: 'Empregado criado',
  employee_updated: 'Empregado atualizado',
  payroll_calculated: 'Folha calculada',
  payroll_saved: 'Folha salva',
  background_check_requested: 'Verificação solicitada',
  contract_generated: 'Contrato gerado',
  subscription_created: 'Assinatura criada',
  subscription_canceled: 'Assinatura cancelada',
  esocial_event_submitted: 'eSocial enviado',
  pdf_generated: 'PDF gerado',
}

// Admin user IDs - add your admin user IDs here
const ADMIN_USER_IDS = [
  // Add admin user UUIDs here
  process.env.ADMIN_USER_ID,
].filter(Boolean)

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; page?: string }>
}) {
  const { action: filterAction, page: pageParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if user is admin (by checking if they're the first employer or in admin list)
  const isAdmin = ADMIN_USER_IDS.includes(user.id)

  // Fallback: check if user is the first employer (owner)
  if (!isAdmin) {
    const { data: firstEmployer } = await supabase
      .from('employers')
      .select('user_id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (!firstEmployer || firstEmployer.user_id !== user.id) {
      redirect('/dashboard')
    }
  }

  const currentPage = Math.max(1, parseInt(pageParam || '1'))
  const pageSize = 50
  const offset = (currentPage - 1) * pageSize

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (filterAction) {
    query = query.eq('action', filterAction)
  }

  const { data: logs, count } = await query
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Registro de todas as ações realizadas no sistema
        </p>
      </div>

      {/* Filter */}
      <form className="flex items-center gap-3">
        <label htmlFor="action" className="text-sm font-medium">
          Filtrar por ação:
        </label>
        <select
          id="action"
          name="action"
          defaultValue={filterAction || ''}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        >
          <option value="">Todas</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Filtrar
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ação</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Empregador</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Detalhes</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {new Date(log.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {log.employer_id ? log.employer_id.slice(0, 8) + '...' : '-'}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                  {log.details && Object.keys(log.details).length > 0
                    ? JSON.stringify(log.details)
                    : '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {log.ip_address || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {offset + 1}-{Math.min(offset + pageSize, count || 0)} de {count} registros
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a
                href={`?page=${currentPage - 1}${filterAction ? `&action=${filterAction}` : ''}`}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Anterior
              </a>
            )}
            {currentPage < totalPages && (
              <a
                href={`?page=${currentPage + 1}${filterAction ? `&action=${filterAction}` : ''}`}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Próxima
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
