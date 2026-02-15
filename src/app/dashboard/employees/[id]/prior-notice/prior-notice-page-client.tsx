'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { formatDateBR } from '@/components/calculator'
import { generatePriorNoticePDF, type PriorNoticeType, type ReductionOption } from '@/lib/pdf/prior-notice'

interface Props {
  employeeName: string
  employeeCpf: string
  employeeRole: string
  admissionDate: string
  employerName: string
  employerCpf: string
  city: string
}

/**
 * Calculate aviso prévio days: 30 base + 3 per year worked, max 90.
 */
function calculateNoticeDays(admissionDate: string, noticeDate: string): number {
  const adm = new Date(admissionDate + 'T12:00')
  const notice = new Date(noticeDate + 'T12:00')

  let years = notice.getFullYear() - adm.getFullYear()
  if (
    notice.getMonth() < adm.getMonth() ||
    (notice.getMonth() === adm.getMonth() && notice.getDate() < adm.getDate())
  ) {
    years--
  }
  years = Math.max(0, years)

  return Math.min(30 + years * 3, 90)
}

export default function PriorNoticePageClient({
  employeeName, employeeCpf, employeeRole, admissionDate,
  employerName, employerCpf, city,
}: Props) {
  const today = new Date().toISOString().split('T')[0]

  const [noticeType, setNoticeType] = useState<PriorNoticeType>('indenizado')
  const [noticeDate, setNoticeDate] = useState<string>(today)
  const [reductionOption, setReductionOption] = useState<ReductionOption>('2_hours_daily')
  const [cityInput, setCityInput] = useState<string>(city)

  const noticeDays = useMemo(() => {
    if (!noticeDate) return 30
    return calculateNoticeDays(admissionDate, noticeDate)
  }, [admissionDate, noticeDate])

  const lastWorkDay = useMemo(() => {
    if (!noticeDate) return ''
    if (noticeType === 'indenizado') return noticeDate
    const d = new Date(noticeDate + 'T12:00')
    d.setDate(d.getDate() + noticeDays - 1)
    return d.toISOString().split('T')[0]
  }, [noticeDate, noticeType, noticeDays])

  const handleGenerate = useCallback(() => {
    if (!noticeDate) return
    generatePriorNoticePDF({
      employerName,
      employerCpf,
      employeeName,
      employeeCpf,
      employeeRole,
      admissionDate,
      noticeType,
      noticeDate,
      lastWorkDay,
      durationDays: noticeDays,
      reductionOption: noticeType === 'trabalhado' ? reductionOption : undefined,
      city: cityInput,
    })
  }, [employerName, employerCpf, employeeName, employeeCpf, employeeRole, admissionDate, noticeType, noticeDate, lastWorkDay, noticeDays, reductionOption, cityInput])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Aviso Previo</CardTitle>
          <CardDescription>
            Gere o documento de aviso prévio para {employeeName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Employee info (read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Empregado(a)</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3">
                <span className="text-sm">{employeeName}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3">
                <span className="text-sm">{employeeRole || 'Não informada'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de admissão</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3">
                <span className="text-sm">{formatDateBR(admissionDate)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Cidade/UF"
              />
            </div>
          </div>

          {/* Notice type */}
          <div className="space-y-2">
            <Label>Tipo de aviso prévio</Label>
            <Select value={noticeType} onValueChange={(v) => setNoticeType(v as PriorNoticeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indenizado">Indenizado (dispensa imediata)</SelectItem>
                <SelectItem value="trabalhado">Trabalhado (cumpre o período)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notice date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noticeDate">Data do aviso</Label>
              <Input
                id="noticeDate"
                type="date"
                value={noticeDate}
                onChange={(e) => setNoticeDate(e.target.value)}
              />
            </div>
            {noticeType === 'trabalhado' && (
              <div className="space-y-2">
                <Label>Reducao da jornada</Label>
                <Select value={reductionOption} onValueChange={(v) => setReductionOption(v as ReductionOption)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2_hours_daily">2 horas diárias</SelectItem>
                    <SelectItem value="7_days">7 dias corridos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tipo</span>
              <Badge variant="outline">
                {noticeType === 'trabalhado' ? 'Trabalhado' : 'Indenizado'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Duração do aviso</span>
              <span className="text-sm font-medium">{noticeDays} dias</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Data do aviso</span>
              <span className="text-sm font-medium">{noticeDate ? formatDateBR(noticeDate) : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Último dia de trabalho</span>
              <span className="text-sm font-medium">{lastWorkDay ? formatDateBR(lastWorkDay) : '-'}</span>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleGenerate}
              disabled={!noticeDate}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" /> Gerar Aviso Previo (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
