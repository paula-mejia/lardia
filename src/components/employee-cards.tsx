'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import type { EmployeeListItem } from '@/types'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function esocialStatus(status: string) {
  if (status === 'active') return { label: 'Regular', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' }
  return { label: 'Pendente', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' }
}

function nextPayDate() {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 5)
  return next.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function EmployeeCards({ employees }: { employees: EmployeeListItem[] }) {
  const [search, setSearch] = useState('')

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empregados</h1>
          <p className="text-muted-foreground">Gerencie seus empregados domésticos.</p>
        </div>
        <Link href="/dashboard/employees/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Empregado
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou cargo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => {
          const es = esocialStatus(emp.status)
          return (
            <Link key={emp.id} href={`/dashboard/employees/${emp.id}/payroll`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-semibold text-sm shrink-0">
                      {getInitials(emp.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-base truncate">{emp.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{emp.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={es.color}>{es.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Próx. pagto: {nextPayDate()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}

        {/* Add new card */}
        <Link href="/dashboard/employees/new">
          <Card className="border-2 border-dashed hover:border-emerald-400 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center gap-3 min-h-[140px] text-muted-foreground hover:text-emerald-600 transition-colors">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <p className="font-medium text-sm">Adicionar Novo Empregado</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
