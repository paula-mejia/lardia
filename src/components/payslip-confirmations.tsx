'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Clock, CheckCircle } from 'lucide-react'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-')
  const idx = parseInt(m, 10) - 1
  return `${MONTH_NAMES[idx] || m}/${year}`
}

interface Confirmation {
  id: string
  month: string
  confirmed_at: string | null
  created_at: string
}

export default function PayslipConfirmations({ employeeId }: { employeeId: string }) {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('payslip_confirmations')
        .select('id, month, confirmed_at, created_at')
        .eq('employee_id', employeeId)
        .order('month', { ascending: false })

      setConfirmations(data || [])
      setLoading(false)
    }
    load()
  }, [employeeId])

  if (loading || confirmations.length === 0) return null

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Confirmações de contracheque
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {confirmations.map((c) => (
          <div key={c.id} className="flex items-center justify-between border rounded-lg p-3">
            <span className="text-sm font-medium">{formatMonthLabel(c.month)}</span>
            {c.confirmed_at ? (
              <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirmado em {new Date(c.confirmed_at).toLocaleDateString('pt-BR')}
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Aguardando confirmação
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
