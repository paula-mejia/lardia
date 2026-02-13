/**
 * PDF payslip (contracheque) generator for Brazilian domestic employers.
 *
 * Generates a professional A4 black-and-white document using jsPDF.
 * All labels are in Portuguese; code and comments in English.
 */

import { jsPDF } from 'jspdf'
import type { PayrollBreakdown } from '@/lib/calc/payroll'

export interface PayslipData {
  employerName: string
  employeeName: string
  employeeCpf: string
  referenceMonth: number
  referenceYear: number
  breakdown: PayrollBreakdown
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

/**
 * Generate a payslip PDF and trigger download in the browser.
 */
export function generatePayslipPDF(data: PayslipData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const b = data.breakdown

  // -- Helper functions --
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

  // -- Header --
  drawThickLine(y)
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('RECIBO DE PAGAMENTO', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('(Contracheque)', pageWidth / 2, y, { align: 'center' })
  y += 5
  drawThickLine(y)
  y += 6

  // -- Employer / Employee info --
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Empregador:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.employerName, margin + 28, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Empregado(a):', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.employeeName, margin + 28, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('CPF:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatCPF(data.employeeCpf), margin + 28, y)

  // Reference month on the right
  doc.setFont('helvetica', 'bold')
  doc.text('Competencia:', pageWidth - margin - 55, y)
  doc.setFont('helvetica', 'normal')
  const refLabel = `${MONTH_NAMES[data.referenceMonth - 1]} / ${data.referenceYear}`
  doc.text(refLabel, pageWidth - margin - 2, y, { align: 'right' })
  y += 4
  drawThickLine(y)
  y += 3

  // -- Earnings section --
  addSectionTitle('VENCIMENTOS')
  addRow('Salario bruto', b.grossSalary)
  if (b.overtimePay > 0) {
    addRow('Horas extras', b.overtimePay)
  }
  if (b.otherEarnings > 0) {
    addRow('Outros vencimentos', b.otherEarnings)
  }
  y += 1
  drawLine(y)
  y += 5
  addRow('Total de vencimentos', b.totalEarnings, true)
  y += 1
  drawLine(y)
  y += 3

  // -- Deductions section --
  addSectionTitle('DESCONTOS')
  addRow('INSS (contribuicao)', b.inssEmployee)
  if (b.irrfEmployee > 0) {
    addRow('IRRF', b.irrfEmployee)
  }
  if (b.absenceDeduction > 0) {
    addRow('Desconto de faltas', b.absenceDeduction)
  }
  if (b.dsrDeduction > 0) {
    addRow('DSR descontado', b.dsrDeduction)
  }
  if (b.otherDeductions > 0) {
    addRow('Outros descontos', b.otherDeductions)
  }
  y += 1
  drawLine(y)
  y += 5
  addRow('Total de descontos', b.totalDeductions, true)
  y += 1
  drawThickLine(y)
  y += 6

  // -- Net salary --
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('SALARIO LIQUIDO', margin + 2, y)
  doc.text(`R$ ${formatBRL(b.netSalary)}`, pageWidth - margin - 2, y, { align: 'right' })
  y += 4
  drawThickLine(y)
  y += 6

  // -- Employer costs section --
  addSectionTitle('ENCARGOS DO EMPREGADOR (NAO DESCONTADOS DO SALARIO)')
  addRow('INSS patronal (8%)', b.inssEmployer)
  addRow('GILRAT (0,8%)', b.gilrat)
  addRow('FGTS (8%)', b.fgtsMonthly)
  addRow('FGTS antecipacao (3,2%)', b.fgtsAnticipation)
  y += 1
  drawLine(y)
  y += 5
  addRow('Total DAE', b.daeTotal, true)
  y += 1
  drawLine(y)
  y += 3

  // -- Signature lines --
  y += 15
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
  const footerY = 285
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  const generationDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Documento gerado em ${generationDate}`, pageWidth / 2, footerY, { align: 'center' })
  doc.text('Gerado por Lardia', pageWidth / 2, footerY + 3, { align: 'center' })

  // -- Save --
  const filename = `contracheque_${data.referenceMonth.toString().padStart(2, '0')}_${data.referenceYear}_${data.employeeName.replace(/\s+/g, '_')}.pdf`
  doc.save(filename)
}
