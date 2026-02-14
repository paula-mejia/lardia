/**
 * PDF generator for Aviso Previo (Prior Notice) document.
 *
 * A4, black and white, professional layout.
 * All labels in Portuguese; code and comments in English.
 */

import { jsPDF } from 'jspdf'

export type PriorNoticeType = 'trabalhado' | 'indenizado'
export type ReductionOption = '2_hours_daily' | '7_days'

export interface PriorNoticeData {
  // Employer
  employerName: string
  employerCpf: string

  // Employee
  employeeName: string
  employeeCpf: string
  employeeRole: string
  admissionDate: string // YYYY-MM-DD

  // Notice details
  noticeType: PriorNoticeType
  noticeDate: string // YYYY-MM-DD
  lastWorkDay: string // YYYY-MM-DD
  durationDays: number // 30 + 3 per year, max 90
  reductionOption?: ReductionOption // only for trabalhado

  // Location
  city: string
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
 * Generate a Prior Notice PDF and trigger download.
 */
export function generatePriorNoticePDF(data: PriorNoticeData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function drawThickLine(yPos: number) {
    doc.setDrawColor(0)
    doc.setLineWidth(0.6)
    doc.line(margin, yPos, pageWidth - margin, yPos)
  }

  // -- Header --
  drawThickLine(y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('AVISO PREVIO', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const typeLabel = data.noticeType === 'trabalhado' ? 'TRABALHADO' : 'INDENIZADO'
  doc.text(`(${typeLabel})`, pageWidth / 2, y, { align: 'center' })
  y += 4
  drawThickLine(y)
  y += 10

  // -- Body text --
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const noticeText = data.noticeType === 'trabalhado'
    ? buildWorkedNoticeText(data)
    : buildIndemnifiedNoticeText(data)

  const paragraphs = noticeText.split('\n\n')
  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph.trim(), contentWidth)
    for (const line of lines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 3
  }

  // -- Reduction option (only for trabalhado) --
  if (data.noticeType === 'trabalhado' && data.reductionOption) {
    y += 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('OPCAO DE REDUCAO DA JORNADA:', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    const reductionText = data.reductionOption === '2_hours_daily'
      ? 'O(a) empregado(a) optou pela redução de 2 (duas) horas diárias durante o período do aviso prévio, conforme artigo 488 da CLT.'
      : 'O(a) empregado(a) optou pela redução de 7 (sete) dias corridos ao final do período do aviso prévio, conforme parágrafo único do artigo 488 da CLT.'

    const redLines = doc.splitTextToSize(reductionText, contentWidth)
    for (const line of redLines) {
      doc.text(line, margin, y)
      y += 5
    }
    y += 3
  }

  // -- Date and city --
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(
    `${data.city}, ${formatDate(data.noticeDate)}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  )

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

  y += 3
  doc.setFontSize(7)
  doc.text(data.employerName, leftSigX + sigLineWidth / 2, y, { align: 'center' })
  doc.text(data.employeeName, rightSigX + sigLineWidth / 2, y, { align: 'center' })

  y += 4
  doc.text(`CPF: ${formatCPF(data.employerCpf)}`, leftSigX + sigLineWidth / 2, y, { align: 'center' })
  doc.text(`CPF: ${formatCPF(data.employeeCpf)}`, rightSigX + sigLineWidth / 2, y, { align: 'center' })

  // -- Footer --
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.text('Documento gerado por Lardia', pageWidth / 2, pageHeight - 10, { align: 'center' })

  // -- Save --
  const filename = `aviso-prévio-${data.employeeName.toLowerCase().replace(/\s+/g, '-')}-${data.noticeDate}.pdf`
  doc.save(filename)
}

/** Build text for worked prior notice. */
function buildWorkedNoticeText(data: PriorNoticeData): string {
  return `Pelo presente instrumento, fica o(a) empregado(a) ${data.employeeName}, inscrito(a) no CPF sob o n. ${formatCPF(data.employeeCpf)}, exercendo a função de ${data.employeeRole}, admitido(a) em ${formatDate(data.admissionDate)}, notificado(a) de que seu contrato de trabalho será rescindido.

O presente aviso prévio terá duracao de ${data.durationDays} (${numberToWords(data.durationDays)}) dias, com início em ${formatDate(data.noticeDate)} e término em ${formatDate(data.lastWorkDay)}, devendo o(a) empregado(a) comparecer normalmente ao trabalho durante este período.

Conforme disposto no artigo 7o, inciso XXI, da Constituição Federal e no artigo 1o da Lei 12.506/2011, o aviso prévio proporcional é de ${data.durationDays} dias (30 dias base + 3 dias por ano de serviço, limitado a 90 dias).`
}

/** Build text for indemnified prior notice. */
function buildIndemnifiedNoticeText(data: PriorNoticeData): string {
  return `Pelo presente instrumento, fica o(a) empregado(a) ${data.employeeName}, inscrito(a) no CPF sob o n. ${formatCPF(data.employeeCpf)}, exercendo a função de ${data.employeeRole}, admitido(a) em ${formatDate(data.admissionDate)}, notificado(a) de que seu contrato de trabalho será rescindido.

O presente aviso prévio e INDENIZADO, com duracao de ${data.durationDays} (${numberToWords(data.durationDays)}) dias. O(a) empregado(a) fica dispensado(a) do cumprimento do aviso, sendo o último dia de trabalho ${formatDate(data.lastWorkDay)}.

O valor correspondente ao aviso prévio indenizado será pago juntamente com as demais verbas rescisórias, conforme legislação vigente.`
}

/** Simple number to Portuguese words for common values (30-90). */
function numberToWords(n: number): string {
  const units = ['', 'um', 'dois', 'tres', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const tens = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']

  if (n < 10) return units[n]
  if (n >= 10 && n < 20) return teens[n - 10]

  const t = Math.floor(n / 10)
  const u = n % 10
  if (u === 0) return tens[t]
  return `${tens[t]} e ${units[u]}`
}
