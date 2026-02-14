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
  background_check_requested: 'Verificacao solicitada',
  contract_generated: 'Contrato gerado',
  subscription_created: 'Assinatura criada',
  subscription_canceled: 'Assinatura cancelada',
  esocial_event_submitted: 'eSocial enviado',
  pdf_generated: 'PDF gerado',
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>
}) {
  const { action: filterAction } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!employer) redirect('/dashboard')

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('employer_id', employer.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (filterAction) {
    query = query.eq('action', filterAction)
  }

  const { data: logs } = await query

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registro de Atividades</h1>

      {/* Filter */}
      <form className="flex items-center gap-3">
        <label htmlFor="action" className="text-sm font-medium">
          Filtrar por acao:
        </label>
        <select
          id="action"
          name="action"
          defaultValue={filterAction || ''}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
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
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          Filtrar
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Data</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Acao</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Detalhes</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {new Date(log.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-gray-500">
                  {log.details && Object.keys(log.details).length > 0
                    ? JSON.stringify(log.details)
                    : '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                  {log.ip_address || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
