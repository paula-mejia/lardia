// PDF generation for background check reports
// Uses jsPDF (already in project dependencies)

import { jsPDF } from 'jspdf'
import type { BackgroundCheckResult } from './service'

interface CheckRecord {
  candidate_name: string
  candidate_cpf: string
  created_at: string
  results: BackgroundCheckResult | null
}

function formatCpf(cpf: string) {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateBackgroundCheckPdf(check: CheckRecord) {
  const doc = new jsPDF()
  const r = check.results
  if (!r) return

  let y = 20

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Relatorio de Verificação Pre-Contratacao', 105, y, { align: 'center' })
  y += 12

  // Subtitle
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text('Lardia - Gestão de Empregados Domesticos', 105, y, { align: 'center' })
  y += 15

  // Candidate info
  doc.setTextColor(0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Dados do Candidato', 20, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Nome: ${check.candidate_name}`, 20, y)
  y += 6
  doc.text(`CPF: ${formatCpf(check.candidate_cpf)}`, 20, y)
  y += 6
  doc.text(`Data da consulta: ${formatDate(check.created_at)}`, 20, y)
  y += 15

  // Results
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Resultados', 20, y)
  y += 10

  const items = [
    {
      label: 'Situacao do CPF',
      value: r.cpf_status === 'regular' ? 'Regular' : 'Irregular',
      ok: r.cpf_status === 'regular',
    },
    {
      label: 'Conferencia de nome',
      value: r.name_match ? 'Confere' : 'Divergente',
      ok: r.name_match,
    },
    {
      label: 'Antecedentes criminais',
      value: r.criminal_records.has_records ? 'Registros encontrados' : 'Nenhum registro encontrado',
      ok: !r.criminal_records.has_records,
    },
    {
      label: 'Processos judiciais',
      value: r.lawsuits.has_lawsuits
        ? `${r.lawsuits.count} processo(s) encontrado(s)`
        : 'Nenhum processo',
      ok: !r.lawsuits.has_lawsuits,
    },
    {
      label: 'Situacao de credito',
      value: r.credit_score.status === 'limpo' ? 'Limpo' : 'Negativado',
      ok: r.credit_score.status === 'limpo',
    },
  ]

  doc.setFontSize(10)
  for (const item of items) {
    doc.setFont('helvetica', 'normal')
    const icon = item.ok ? '[OK]' : '[X]'
    doc.setTextColor(item.ok ? 0 : 180, item.ok ? 128 : 0, 0)
    doc.text(`${icon} ${item.label}: ${item.value}`, 20, y)
    y += 8
  }

  y += 10

  // Disclaimer
  doc.setTextColor(100)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  const disclaimer = [
    'Este relatorio e informativo. A decisao de contratação é de responsabilidade do empregador.',
    'A existencia de registros não pode ser o único motivo para recusar uma contratação.',
    'Dados consultados conforme LGPD (Lei 13.709/2018) com consentimento do candidato.',
  ]
  for (const line of disclaimer) {
    doc.text(line, 20, y)
    y += 5
  }

  doc.save(`verificação-${check.candidate_cpf.replace(/\D/g, '')}.pdf`)
}
