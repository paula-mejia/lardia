'use client'

import { useState, useCallback } from 'react'
import PayrollCalculator from '@/components/payroll-calculator'
import PayrollHistory from '@/components/payroll-history'

interface PayrollPageClientProps {
  initialSalary: number
  employeeId: string
  employeeName: string
  employeeCpf: string
  employerName: string
}

export default function PayrollPageClient({ initialSalary, employeeId, employeeName, employeeCpf, employerName }: PayrollPageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="space-y-6">
      <PayrollCalculator
        initialSalary={initialSalary}
        employeeId={employeeId}
        employeeName={employeeName}
        employeeCpf={employeeCpf}
        employerName={employerName}
        onSaved={handleSaved}
      />
      <PayrollHistory
        employeeId={employeeId}
        employeeName={employeeName}
        employeeCpf={employeeCpf}
        employerName={employerName}
        refreshKey={refreshKey}
      />
    </div>
  )
}
