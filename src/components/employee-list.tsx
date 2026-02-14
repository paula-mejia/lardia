'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calculator, Gift, Palmtree, UserMinus } from 'lucide-react'
import Link from 'next/link'

import { formatBRL, formatDateBR } from '@/components/calculator/format'
import type { EmployeeListItem } from '@/types'

function statusLabel(status: string): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  switch (status) {
    case 'active': return { label: 'Ativa', variant: 'default' }
    case 'on_vacation': return { label: 'Férias', variant: 'secondary' }
    case 'on_leave': return { label: 'Afastada', variant: 'secondary' }
    case 'terminated': return { label: 'Desligada', variant: 'destructive' }
    default: return { label: status, variant: 'outline' }
  }
}

export function EmployeeList({ employees }: { employees: EmployeeListItem[] }) {
  return (
    <div className="space-y-3">
      {employees.map((emp) => {
        const status = statusLabel(emp.status)
        return (
          <Card key={emp.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{emp.full_name}</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {emp.role}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatBRL(emp.salary)} · Admissão: {formatDateBR(emp.admission_date)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/employees/${emp.id}/payroll`}>
                  <Button variant="outline" size="sm">
                    <Calculator className="h-4 w-4 mr-1" />
                    Folha
                  </Button>
                </Link>
                <Link href={`/dashboard/employees/${emp.id}/thirteenth`}>
                  <Button variant="outline" size="sm">
                    <Gift className="h-4 w-4 mr-1" />
                    13º
                  </Button>
                </Link>
                <Link href={`/dashboard/employees/${emp.id}/vacation`}>
                  <Button variant="outline" size="sm">
                    <Palmtree className="h-4 w-4 mr-1" />
                    Férias
                  </Button>
                </Link>
                <Link href={`/dashboard/employees/${emp.id}/termination`}>
                  <Button variant="outline" size="sm">
                    <UserMinus className="h-4 w-4 mr-1" />
                    Rescisão
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
