'use client'

import { useState, useCallback } from 'react'
import PayrollCalculator from '@/components/payroll-calculator'
import PayrollHistory from '@/components/payroll-history'

interface PayrollPageClientProps {
  initialSalary: number
  employeeId: string
  employeeName: string
}

export default function PayrollPageClient({ initialSalary, employeeId, employeeName }: PayrollPageClientProps) {
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
        onSaved={handleSaved}
      />
      <PayrollHistory
        employeeId={employeeId}
        refreshKey={refreshKey}
      />
    </div>
  )
}
