/**
 * PDF generator for Brazilian vacation payment receipt (Recibo de Ferias).
 *
 * A4, black and white, professional layout.
 * All labels in Portuguese; code and comments in English.
 */

import { jsPDF } from 'jspdf'
import type { VacationBreakdown } from '@/lib/calc/vacation'

export interface VacationReceiptData {
  // Employer
  employerName: string
  employerCpf: string

  // Employee
  employeeName: string
  employeeCpf: string
  employeeRole: string
  admissionDate: string // YYYY-MM-DD

  // Vacation details
  vacationStartDate: string // YYYY-MM-DD
  vacationEndDate: string // YYYY-MM-DD
  acquisitionPeriodStart: string // YYYY-MM-DD
  acquisitionPeriodEnd: string // YYYY-MM-DD
  salary: number

  // Calculation breakdown
  breakdown: VacationBreakdown
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

/**
 * Generate a vacation receipt PDF and trigger download.
 */
export function generateVacationReceiptPDF(data: VacationReceiptData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const pageHeight = 297
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const b = data.breakdown

  // -- Helpers --
  function drawLine(yPos: number) {
    doc.setDrawColor(0)
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
  }

  function drawThickLine(yPos: number) {
    doc.setDrawColor(0)
    doc.setLineWidth(0.6)
    doc.line(margin, yPos, pageWidth - margin, yPos)
  }

  function addSectionTitle(title: string) {
    y += 3
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(title, margin, y)
    y += 1
    drawLine(y)
    y += 5
  }

  function addRow(label: string, value: number, bold = false) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(9)
    doc.text(label, margin + 2, y)
    doc.text(`R$ ${formatBRL(value)}`, pageWidth - margin - 2, y, { align: 'right' })
    y += 5
  }

  function addInfoRow(label: string, value: string) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, margin + 45, y)
    y += 5
  }

  // -- Header --
  drawThickLine(y)
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('RECIBO DE PAGAMENTO DE FERIAS', pageWidth / 2, y, { align: 'center' })
  y += 5
  drawThickLine(y)
  y += 6

  // -- Employer / Employee info --
  addInfoRow('Empregador:', data.employerName)
  if (data.employerCpf) {
    addInfoRow('CPF Empregador:', formatCPF(data.employerCpf))
  }
  y += 2
  addInfoRow('Empregado(a):', data.employeeName)
  addInfoRow('CPF:', formatCPF(data.employeeCpf))
  addInfoRow('Funcao:', data.employeeRole)
  addInfoRow('Data de admissao:', formatDate(data.admissionDate))

  y += 2
  drawLine(y)
  y += 6

  // -- Vacation periods --
  addInfoRow('Periodo aquisitivo:', `${formatDate(data.acquisitionPeriodStart)} a ${formatDate(data.acquisitionPeriodEnd)}`)
  addInfoRow('Periodo de gozo:', `${formatDate(data.vacationStartDate)} a ${formatDate(data.vacationEndDate)}`)
  addInfoRow('Dias de ferias:', `${b.daysEnjoyed} dias`)
  if (b.daysSold > 0) {
    addInfoRow('Abono pecuniario:', `${b.daysSold} dias vendidos`)
  }

  y += 2
  drawThickLine(y)
  y += 3

  // -- Earnings --
  addSectionTitle('VENCIMENTOS')
  addRow(`Ferias gozadas (${b.daysEnjoyed} dias)`, b.vacationPay)
  addRow('Terco constitucional (1/3)', b.tercoConstitucional)

  if (b.daysSold > 0) {
    addRow(`Abono pecuniario (${b.daysSold} dias)`, b.abonoPay)
    addRow('Terco sobre abono (1/3)', b.abonoTerco)
  }

  y += 1
  drawLine(y)
  y += 5
  addRow('Total bruto', b.totalGross, true)
  y += 1
  drawLine(y)
  y += 3

  // -- Deductions --
  addSectionTitle('DESCONTOS')
  addRow('INSS', b.inssEmployee)
  if (b.irrfEmployee > 0) {
    addRow('IRRF', b.irrfEmployee)
  }
  y += 1
  drawLine(y)
  y += 5
  addRow('Total de descontos', b.totalDeductions, true)
  y += 1
  drawThickLine(y)
  y += 6

  // -- Net amount --
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('VALOR LIQUIDO', margin + 2, y)
  doc.text(`R$ ${formatBRL(b.netPayment)}`, pageWidth - margin - 2, y, { align: 'right' })
  y += 4
  drawThickLine(y)
  y += 6

  // -- Payment date --
  if (b.paymentDeadline) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Data limite de pagamento: ${formatDate(b.paymentDeadline)} (2 dias antes do inicio das ferias)`, margin, y)
    y += 8
  }

  // -- Declaration --
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const declaration = `Declaro ter recebido a importancia liquida de R$ ${formatBRL(b.netPayment)} referente ao pagamento de ferias acima discriminadas.`
  const lines = doc.splitTextToSize(declaration, contentWidth)
  for (const line of lines) {
    doc.text(line, margin, y)
    y += 4.5
  }

  // -- Signature lines --
  y += 20
  const sigLineWidth = contentWidth * 0.4
  const leftSigX = margin + (contentWidth / 2 - sigLineWidth) / 2
  const rightSigX = pageWidth / 2 + (contentWidth / 2 - sigLineWidth) / 2

  doc.setLineWidth(0.3)
  doc.line(leftSigX, y, leftSigX + sigLineWidth, y)
  doc.line(rightSigX, y, rightSigX + sigLineWidth, y)

  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Empregador', leftSigX + sigLineWidth / 2, y, { align: 'center' })
  doc.text('Empregado(a)', rightSigX + sigLineWidth / 2, y, { align: 'center' })

  // -- Footer --
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.text('Documento gerado por Lardia', pageWidth / 2, pageHeight - 10, { align: 'center' })

  // -- Save --
  const filename = `recibo-ferias-${data.employeeName.toLowerCase().replace(/\s+/g, '-')}.pdf`
  doc.save(filename)
}
