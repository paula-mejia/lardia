'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, FileText, Search } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  employee: string
  date: string
  status: 'enviado' | 'pendente' | 'assinado'
}

const mockDocuments: Document[] = [
  { id: '1', name: 'Contracheque - Jan/2026', type: 'Contracheque', employee: 'Maria Silva', date: '2026-01-31', status: 'enviado' },
  { id: '2', name: 'Guia DAE - Jan/2026', type: 'Guia DAE', employee: 'Maria Silva', date: '2026-01-20', status: 'assinado' },
  { id: '3', name: 'Recibo de Férias', type: 'Recibo de Férias', employee: 'João Santos', date: '2026-01-15', status: 'pendente' },
  { id: '4', name: 'Contracheque - Dez/2025', type: 'Contracheque', employee: 'João Santos', date: '2025-12-31', status: 'assinado' },
  { id: '5', name: 'Informe de Rendimentos 2025', type: 'Informe de Rendimentos', employee: 'Maria Silva', date: '2026-02-15', status: 'pendente' },
  { id: '6', name: 'Guia DAE - Dez/2025', type: 'Guia DAE', employee: 'Maria Silva', date: '2025-12-20', status: 'enviado' },
]

const docTypes = ['Contracheque', 'Guia DAE', 'Recibo de Férias', 'Informe de Rendimentos']

const statusConfig = {
  enviado: { label: 'Enviado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  pendente: { label: 'Pendente', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  assinado: { label: 'Assinado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
}

function formatDateBR(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [employeeFilter, setEmployeeFilter] = useState<string>('all')

  const employees = [...new Set(mockDocuments.map((d) => d.employee))]

  const filtered = mockDocuments.filter((doc) => {
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase()) && !doc.employee.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && doc.type !== typeFilter) return false
    if (employeeFilter !== 'all' && doc.employee !== employeeFilter) return false
    return true
  })

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">Histórico de contracheques, recibos e guias.</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Tudo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tipo de Documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {docTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Empregado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {employees.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-medium px-4 py-3">Documento</th>
                <th className="text-left font-medium px-4 py-3">Empregado</th>
                <th className="text-left font-medium px-4 py-3">Data</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const st = statusConfig[doc.status]
                return (
                  <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{doc.employee}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateBR(doc.date)}</td>
                    <td className="px-4 py-3">
                      <Badge className={st.color}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum documento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
