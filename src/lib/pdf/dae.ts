/**
 * PDF generator for DAE (Documento de Arrecadação do eSocial).
 *
 * Generates an A4 portrait payment slip with employer info,
 * breakdown table, totals, and barcode area.
 * All labels in Portuguese (pt-BR); code in English.
 */

import { jsPDF } from 'jspdf'
import { formatBarcode } from '@/lib/esocial/dae-generator'

export interface DaePdfData {
  employerName: string
  employerCpfCnpj: string
  referenceMonth: number
  referenceYear: number
  dueDate: string // YYYY-MM-DD
  totalAmount: number
  barcode: string
  status: string
  breakdown: {
    inssEmpregado: number
    inssPatronal: number
    gilrat: number
    fgtsmensal: number
    fgtsAntecipacao: number
    irrf?: number
    seguroAcidente?: number
  }
  employees: Array<{
    employeeName: string
    grossSalary: number
    inssEmpregado: number
    daeContribution: number
  }>
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatCpfCnpj(doc: string): string {
  const digits = doc.replace(/\D/g, '')
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
  }
  return doc
}

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

/**
 * Generate DAE PDF as ArrayBuffer (for API routes) or trigger download (browser).
 */
export function generateDaePDF(data: DaePdfData, returnBuffer: true): ArrayBuffer
export function generateDaePDF(data: DaePdfData, returnBuffer?: false): void
export function generateDaePDF(data: DaePdfData, returnBuffer = false): ArrayBuffer | void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const margin = 15
  let y = margin

  // -- Helpers --
  function drawLine(yPos: number, thick = false) {
    doc.setDrawColor(0)
    doc.setLineWidth(thick ? 0.6 : 0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
  }

  function drawBox(x: number, yPos: number, w: number, h: number) {
    doc.setDrawColor(0)
    doc.setLineWidth(0.3)
    doc.rect(x, yPos, w, h)
  }

  // ===== HEADER =====
  drawLine(y, true)
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Documento de Arrecadação do eSocial - DAE', pageWidth / 2, y, { align: 'center' })
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Guia de Recolhimento - Empregador Doméstico', pageWidth / 2, y, { align: 'center' })
  y += 4
  drawLine(y, true)
  y += 7

  // ===== EMPLOYER INFO =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Empregador:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.employerName, margin + 28, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('CPF/CNPJ:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatCpfCnpj(data.employerCpfCnpj), margin + 28, y)

  // Competência on the right
  doc.setFont('helvetica', 'bold')
  doc.text('Competência:', pageWidth / 2 + 10, y)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${MONTH_NAMES[data.referenceMonth - 1]} / ${data.referenceYear}`,
    pageWidth / 2 + 40, y
  )
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Vencimento:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(formatDateBR(data.dueDate), margin + 28, y)
  doc.setFontSize(9)
  y += 3
  drawLine(y)
  y += 6

  // ===== BREAKDOWN TABLE =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Composição do Recolhimento', margin, y)
  y += 5

  // Table header
  const colLabel = margin + 2
  const colValue = pageWidth - margin - 2
  drawBox(margin, y - 4, pageWidth - margin * 2, 7)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Componente', colLabel, y)
  doc.text('Valor (R$)', colValue, y, { align: 'right' })
  y += 5

  // Table rows
  function addTableRow(label: string, value: number, bold = false) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(8)
    doc.text(label, colLabel, y)
    doc.text(formatBRL(value), colValue, y, { align: 'right' })
    y += 5
  }

  const b = data.breakdown
  addTableRow('INSS Empregado (contribuição progressiva)', b.inssEmpregado)
  addTableRow('INSS Patronal (CP Patronal 8%)', b.inssPatronal)
  addTableRow('GILRAT / Seguro Acidente de Trabalho (0,8%)', b.gilrat)
  addTableRow('FGTS Mensal (8%)', b.fgtsmensal)
  addTableRow('FGTS Antecipação Rescisória (3,2%)', b.fgtsAntecipacao)
  if (b.irrf && b.irrf > 0) {
    addTableRow('IRRF (Imposto de Renda Retido na Fonte)', b.irrf)
  }

  drawLine(y - 2)
  y += 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL', colLabel, y)
  doc.text(`R$ ${formatBRL(data.totalAmount)}`, colValue, y, { align: 'right' })
  y += 3
  drawLine(y, true)
  y += 8

  // ===== EMPLOYEES DETAIL =====
  if (data.employees && data.employees.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Detalhamento por Empregado', margin, y)
    y += 5

    // Mini table header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    drawBox(margin, y - 3.5, pageWidth - margin * 2, 6)
    doc.text('Empregado', colLabel, y)
    doc.text('Salário Bruto', margin + 80, y)
    doc.text('INSS Empregado', margin + 110, y)
    doc.text('Contrib. DAE', colValue, y, { align: 'right' })
    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    for (const emp of data.employees) {
      doc.text(emp.employeeName, colLabel, y)
      doc.text(formatBRL(emp.grossSalary), margin + 80, y)
      doc.text(formatBRL(emp.inssEmpregado), margin + 110, y)
      doc.text(formatBRL(emp.daeContribution), colValue, y, { align: 'right' })
      y += 4.5
    }

    y += 3
    drawLine(y)
    y += 8
  }

  // ===== BARCODE AREA =====
  // Draw barcode box
  const barcodeBoxY = y
  const barcodeBoxH = 30
  drawBox(margin, barcodeBoxY, pageWidth - margin * 2, barcodeBoxH)

  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Código de Barras - Linha Digitável', margin + 2, y)
  y += 6

  // Simulated barcode bars (ITF-style visual representation)
  const barcodeStr = data.barcode
  const barStartX = margin + 10
  const barWidth = pageWidth - margin * 2 - 20
  const barHeight = 10
  doc.setFillColor(0, 0, 0)
  for (let i = 0; i < barcodeStr.length; i++) {
    const digit = parseInt(barcodeStr[i])
    // Simple visual: draw bars based on digit value
    if (digit % 2 === 1) {
      const x = barStartX + (i / barcodeStr.length) * barWidth
      const w = (barWidth / barcodeStr.length) * 0.6
      doc.rect(x, y, w, barHeight, 'F')
    }
  }
  y += barHeight + 4

  // Formatted barcode number
  doc.setFont('courier', 'normal')
  doc.setFontSize(10)
  doc.text(formatBarcode(barcodeStr), pageWidth / 2, y, { align: 'center' })
  y += 10

  // ===== FOOTER =====
  drawLine(y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(
    'Documento gerado pelo sistema Lardia (simulação). Não possui validade fiscal.',
    pageWidth / 2, y, { align: 'center' }
  )
  y += 4
  doc.text(
    `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2, y, { align: 'center' }
  )

  if (returnBuffer) {
    return doc.output('arraybuffer')
  }

  const filename = `DAE-${data.referenceYear}-${String(data.referenceMonth).padStart(2, '0')}.pdf`
  doc.save(filename)
}
