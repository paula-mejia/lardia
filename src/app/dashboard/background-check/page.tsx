'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, History } from 'lucide-react'
import Link from 'next/link'
import {
  IntroSection,
  CandidateInfoForm,
  ConsentStep,
  ProcessingStep,
} from '@/components/background-check'
import type { Step, CandidateData } from '@/components/background-check'

/**
 * Background-check wizard page.
 * Orchestrates intro → info → consent → processing steps.
 */
export default function BackgroundCheckPage() {
  const [step, setStep] = useState<Step>('intro')
  const [candidate, setCandidate] = useState<CandidateData>({ fullName: '', cpf: '', dob: '' })

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Verificação Pré-Contratação</h1>
        </div>
        <Link href="/dashboard/background-check/history" className="ml-auto">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-1" />
            Histórico
          </Button>
        </Link>
      </div>

      {step === 'intro' && <IntroSection onStart={() => setStep('info')} />}

      {step === 'info' && (
        <CandidateInfoForm
          initialData={candidate}
          onBack={() => setStep('intro')}
          onSubmit={(data) => { setCandidate(data); setStep('consent') }}
        />
      )}

      {step === 'consent' && (
        <ConsentStep candidate={candidate} onBack={() => setStep('info')} />
      )}

      {step === 'processing' && <ProcessingStep loading={false} />}
    </div>
  )
}
