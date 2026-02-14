'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Download, FileText } from 'lucide-react'
import Link from 'next/link'
import { generateEmploymentContractPDF } from '@/lib/pdf/employment-contract'
import { trackPdfDownloaded } from '@/lib/analytics'
import type { ContractData } from '@/lib/pdf/employment-contract'

interface Contract {
  id: string
  employee_id: string
  contract_data: ContractData
  status: string
  created_at: string
  signed_at: string | null
  employees: { full_name: string } | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-yellow-100 text-yellow-800' },
  signed: { label: 'Assinado', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
}

export default function ContractsPage() {
  const supabase = createClient()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadContracts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: employer } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!employer) return

      const { data } = await supabase
        .from('employment_contracts')
        .select('id, employee_id, contract_data, status, created_at, signed_at, employees(full_name)')
        .eq('employer_id', employer.id)
        .order('created_at', { ascending: false })

      if (data) setContracts(data as unknown as Contract[])
      setLoading(false)
    }
    loadContracts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(id: string, status: string) {
    const update: Record<string, unknown> = { status }
    if (status === 'signed') update.signed_at = new Date().toISOString()

    await supabase.from('employment_contracts').update(update).eq('id', id)
    setContracts(prev => prev.map(c =>
      c.id === id ? { ...c, status, signed_at: status === 'signed' ? new Date().toISOString() : c.signed_at } : c
    ))
  }

  function handleDownload(contract: Contract) {
    trackPdfDownloaded('employment_contract')
    generateEmploymentContractPDF(contract.contract_data)
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Contratos de Trabalho</h1>
            <p className="text-sm text-muted-foreground">Gerencie os contratos dos seus empregados</p>
          </div>
          <Link href="/dashboard/contracts/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Novo
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : contracts.length === 0 ? (
          <div className="border rounded-lg p-8 text-center">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Nenhum contrato gerado ainda.</p>
            <Link href="/dashboard/contracts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Gerar primeiro contrato
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map(contract => {
              const statusInfo = STATUS_LABELS[contract.status] || STATUS_LABELS.draft
              return (
                <Card key={contract.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex-1">
                      <p className="font-medium">
                        {contract.employees?.full_name || contract.contract_data.employeeName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contract.contract_data.jobFunction} - Criado em {formatDate(contract.created_at)}
                      </p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {contract.status === 'draft' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(contract.id, 'signed')}>
                          Marcar assinado
                        </Button>
                      )}
                      {contract.status === 'signed' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(contract.id, 'active')}>
                          Ativar
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDownload(contract)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
