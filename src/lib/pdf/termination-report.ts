/**
 * PDF generator for TRCT (Termo de Rescisão do Contrato de Trabalho).
 *
 * A4, black and white, professional layout.
 * All labels in Portuguese; code and comments in English.
 */

import { jsPDF } from 'jspdf'
import type { TerminationBreakdown } from '@/lib/calc/termination'

export interface TerminationReportData {
  // Employer
  employerName: string
  employerCpf: string

  // Employee
  employeeName: string
  employeeCpf: string
  employeeRole: string
  admissionDate: string // YYYY-MM-DD
  terminationDate: string // YYYY-MM-DD
  salary: number

  // Calculation breakdown
  breakdown: TerminationBreakdown
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
 * Generate a TRCT PDF and trigger download.
 */
export function generateTerminationReportPDF(data: TerminationReportData): void {
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

  function checkPageBreak(needed: number) {
    if (y + needed > pageHeight - 25) {
      doc.addPage()
      y = margin
    }
  }

  function addSectionTitle(title: string) {
    checkPageBreak(15)
    y += 3
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(title, margin, y)
    y += 1
    drawLine(y)
    y += 5
  }

  function addRow(label: string, value: number, bold = false) {
    checkPageBreak(7)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(9)
    doc.text(label, margin + 2, y)
    doc.text(`R$ ${formatBRL(value)}`, pageWidth - margin - 2, y, { align: 'right' })
    y += 5
  }

  function addInfoRow(label: string, value: string) {
    checkPageBreak(7)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, margin + 50, y)
    y += 5
  }

  // -- Header --
  drawThickLine(y)
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TERMO DE RESCISAO DO CONTRATO DE TRABALHO', pageWidth / 2, y, { align: 'center' })
  y += 5
  drawThickLine(y)
  y += 6

  // -- Employer identification --
  addSectionTitle('IDENTIFICACAO DO EMPREGADOR')
  addInfoRow('Nome:', data.employerName)
  if (data.employerCpf) {
    addInfoRow('CPF:', formatCPF(data.employerCpf))
  }

  y += 2

  // -- Employee identification --
  addSectionTitle('IDENTIFICACAO DO EMPREGADO')
  addInfoRow('Nome:', data.employeeName)
  addInfoRow('CPF:', formatCPF(data.employeeCpf))
  addInfoRow('Função:', data.employeeRole)

  y += 2

  // -- Contract details --
  addSectionTitle('DADOS DO CONTRATO')
  addInfoRow('Data de admissão:', formatDate(data.admissionDate))
  addInfoRow('Data de desligamento:', formatDate(data.terminationDate))
  addInfoRow('Tipo de rescisão:', b.terminationTypeLabel)
  addInfoRow('Tempo de serviço:', `${b.yearsWorked} ano(s) e ${b.monthsWorked % 12} mês(es)`)
  addInfoRow('Último salário:', `R$ ${formatBRL(data.salary)}`)

  y += 2
  drawThickLine(y)
  y += 3

  // -- Earnings --
  addSectionTitle('VERBAS RESCISORIAS - PROVENTOS')

  addRow(`Saldo de salário (${b.saldoSalarioDays} dias)`, b.saldoSalario)

  if (b.avisoPrevio > 0) {
    const tipo = b.avisoPrevioIndemnizado ? 'indenizado' : 'trabalhado'
    addRow(`Aviso prévio ${tipo} (${b.avisoPrevioDays} dias)`, b.avisoPrevio)
  }

  if (b.thirteenthProportional > 0) {
    addRow(`13o salário proporcional (${b.thirteenthMonths}/12 avos)`, b.thirteenthProportional)
  }

  if (b.vacationProportional > 0) {
    addRow(`Férias proporcionais (${b.vacationProportionalMonths}/12 avos)`, b.vacationProportional)
    addRow('1/3 constitucional (férias proporcionais)', b.vacationProportionalOneThird)
  }

  if (b.accruedVacation > 0) {
    addRow(`Férias vencidas (${b.accruedVacationPeriods} período(s))`, b.accruedVacation)
    addRow('1/3 constitucional (férias vencidas)', b.accruedVacationOneThird)
  }

  y += 1
  drawLine(y)
  y += 5
  addRow('TOTAL DE PROVENTOS', b.totalEarnings, true)
  y += 1
  drawLine(y)
  y += 3

  // -- Deductions --
  addSectionTitle('DESCONTOS')

  addRow('INSS', b.inssEmployee)
  if (b.irrfEmployee > 0) {
    addRow('IRRF', b.irrfEmployee)
  }
  if (b.avisoPrevioDeduction > 0) {
    addRow('Aviso prévio (não cumprido)', b.avisoPrevioDeduction)
  }

  y += 1
  drawLine(y)
  y += 5
  addRow('TOTAL DE DESCONTOS', b.totalDeductions, true)
  y += 1
  drawThickLine(y)
  y += 6

  // -- Net amount --
  checkPageBreak(20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('VALOR LÍQUIDO', margin + 2, y)
  doc.text(`R$ ${formatBRL(b.netAmount)}`, pageWidth - margin - 2, y, { align: 'right' })
  y += 4
  drawThickLine(y)
  y += 6

  // -- FGTS --
  addSectionTitle('FGTS')
  addRow('FGTS sobre verbas rescisórias (8%)', b.fgtsOnTermination)
  if (b.fgtsPenalty > 0) {
    addRow('Multa rescisória FGTS (40%)', b.fgtsPenalty)
  }
  addRow('Total FGTS a depositar', b.totalFgts, true)

  y += 2

  // -- Total to receive --
  if (b.fgtsPenalty > 0) {
    checkPageBreak(15)
    drawThickLine(y)
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOTAL A RECEBER', margin + 2, y)
    doc.text(`R$ ${formatBRL(b.totalToReceive)}`, pageWidth - margin - 2, y, { align: 'right' })
    y += 4
    drawThickLine(y)
    y += 6
  }

  // -- Payment deadline --
  checkPageBreak(15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const deadlineText = b.avisoPrevioIndemnizado
    ? 'Prazo de pagamento: até 10 dias corridos a partir do desligamento.'
    : 'Prazo de pagamento: até o primeiro dia útil após o término do aviso prévio.'
  doc.text(deadlineText, margin, y)
  y += 8

  // -- Signature lines (employer, employee, 2 witnesses) --
  checkPageBreak(60)
  y += 10
  const sigLineWidth = contentWidth * 0.4
  const leftSigX = margin + (contentWidth / 2 - sigLineWidth) / 2
  const rightSigX = pageWidth / 2 + (contentWidth / 2 - sigLineWidth) / 2

  doc.setLineWidth(0.3)

  // Employer + Employee
  doc.line(leftSigX, y, leftSigX + sigLineWidth, y)
  doc.line(rightSigX, y, rightSigX + sigLineWidth, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Empregador', leftSigX + sigLineWidth / 2, y, { align: 'center' })
  doc.text('Empregado(a)', rightSigX + sigLineWidth / 2, y, { align: 'center' })

  // Witnesses
  y += 15
  doc.line(leftSigX, y, leftSigX + sigLineWidth, y)
  doc.line(rightSigX, y, rightSigX + sigLineWidth, y)
  y += 4
  doc.text('Testemunha 1', leftSigX + sigLineWidth / 2, y, { align: 'center' })
  doc.text('Testemunha 2', rightSigX + sigLineWidth / 2, y, { align: 'center' })

  // -- Footer --
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.text('Documento gerado por LarDia', pageWidth / 2, pageHeight - 10, { align: 'center' })

  // -- Save --
  const filename = `trct-${data.employeeName.toLowerCase().replace(/\s+/g, '-')}-${data.terminationDate}.pdf`
  doc.save(filename)
}
