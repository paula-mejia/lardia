/**
 * PDF generator for Brazilian domestic employment contracts.
 *
 * Based on Lei Complementar 150/2015 (domestic worker law).
 * All labels in Portuguese; code and comments in English.
 */

import { jsPDF } from 'jspdf'

export interface ContractData {
  // Employer
  employerName: string
  employerCpf: string
  employerAddress: string

  // Employee
  employeeName: string
  employeeCpf: string
  employeeCtps: string
  employeeAddress: string

  // Contract details
  jobFunction: string
  workLocation: string
  hoursPerDay: number
  daysPerWeek: number
  startTime: string
  endTime: string
  breakTime: string
  salary: number
  paymentDay: number
  startDate: string
  contractType: 'indeterminado' | 'determinado'
  endDate?: string
  valeTransporte: boolean
  otherBenefits: string
  trialPeriod: boolean
  trialDays: number
  city: string
  contractDate: string
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
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
 * Generate employment contract PDF and trigger download.
 */
export function generateEmploymentContractPDF(data: ContractData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function checkPageBreak(needed: number) {
    if (y + needed > pageHeight - 30) {
      doc.addPage()
      y = margin
    }
  }

  function drawLine(yPos: number) {
    doc.setDrawColor(0)
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
  }

  function addClause(number: number, title: string, text: string) {
    checkPageBreak(30)
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`CLAUSULA ${number} - ${title}`, margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(text, contentWidth)
    for (const line of lines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 4.5
    }
  }

  function addSignatureLine(label: string) {
    checkPageBreak(20)
    y += 12
    drawLine(y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(label, margin, y)
  }

  // -- Header --
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('CONTRATO DE TRABALHO DOMESTICO', pageWidth / 2, y, { align: 'center' })
  y += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(Lei Complementar 150/2015)', pageWidth / 2, y, { align: 'center' })
  y += 4
  drawLine(y)
  y += 6

  // Clause 1: Identification
  addClause(
    1,
    'IDENTIFICACAO DAS PARTES',
    `EMPREGADOR(A): ${data.employerName}, inscrito(a) no CPF sob o n. ${formatCPF(data.employerCpf)}, residente e domiciliado(a) em ${data.employerAddress}.\n\n` +
    `EMPREGADO(A): ${data.employeeName}, inscrito(a) no CPF sob o n. ${formatCPF(data.employeeCpf)}, portador(a) da CTPS n. ${data.employeeCtps}, residente e domiciliado(a) em ${data.employeeAddress}.`
  )

  // Clause 2: Job function
  addClause(
    2,
    'FUNCAO',
    `O(A) EMPREGADO(A) exercera a função de ${data.jobFunction}, desempenhando as atividades inerentes ao cargo, no âmbito residencial do(a) EMPREGADOR(A).`
  )

  // Clause 3: Work location
  addClause(
    3,
    'LOCAL DE TRABALHO',
    `O trabalho será prestado na residencia do(a) EMPREGADOR(A), localizada em ${data.workLocation}.`
  )

  // Clause 4: Work schedule
  addClause(
    4,
    'JORNADA DE TRABALHO',
    `A jornada de trabalho será de ${data.hoursPerDay} horas diárias, ${data.daysPerWeek} dias por semana, com início as ${data.startTime} e término as ${data.endTime}, com intervalo de ${data.breakTime} para refeição e descanso, conforme artigo 2o da LC 150/2015. As horas que excederem a jornada normal serão remuneradas com adicional de no mínimo 50% (cinquenta por cento) sobre o valor da hora normal.`
  )

  // Clause 5: Compensation
  addClause(
    5,
    'REMUNERACAO',
    `O(A) EMPREGADO(A) receberá o salário mensal de R$ ${formatBRL(data.salary)} (${salaryInWords(data.salary)}), a ser pago até o dia ${data.paymentDay} de cada mês, mediante recibo. O pagamento do 13o salário e férias acrescidas de 1/3 seguira o disposto na legislação vigente.`
  )

  // Clause 6: Start date
  addClause(
    6,
    'INICIO DO CONTRATO',
    `O presente contrato terá início em ${formatDate(data.startDate)}.`
  )

  // Clause 7: Contract type
  const contractTypeText = data.contractType === 'indeterminado'
    ? 'O presente contrato e firmado por prazo indeterminado, podendo ser rescindido por qualquer das partes, mediante aviso prévio de 30 (trinta) dias, conforme legislação vigente.'
    : `O presente contrato e firmado por prazo determinado, com término previsto para ${formatDate(data.endDate || '')}, podendo ser prorrogado nos termos da lei.`

  addClause(7, 'PRAZO DO CONTRATO', contractTypeText)

  // Clause 8: Benefits
  const benefitsList: string[] = []
  if (data.valeTransporte) benefitsList.push('Vale-transporte, conforme Lei 7.418/1985')
  if (data.otherBenefits) benefitsList.push(data.otherBenefits)
  const benefitsText = benefitsList.length > 0
    ? `O(A) EMPREGADO(A) terá direito aos seguintes benefícios: ${benefitsList.join('; ')}.`
    : 'Não foram acordados benefícios adicionais além dos previstos em lei.'

  addClause(8, 'BENEFICIOS', benefitsText)

  // Clause 9: Trial period
  const trialText = data.trialPeriod
    ? `O presente contrato terá período de experiencia de ${data.trialDays} dias, podendo ser prorrogado por igual período, desde que a soma não ultrapasse 90 (noventa) dias, conforme artigo 443 da CLT.`
    : 'As partes dispensam o período de experiencia.'

  addClause(9, 'PERIODO DE EXPERIENCIA', trialText)

  // Clause 10: General dispositions
  addClause(
    10,
    'DISPOSICOES GERAIS',
    'Este contrato e regido pela Consolidação das Leis do Trabalho (CLT) e pela Lei Complementar 150/2015, que dispõe sobre o contrato de trabalho doméstico. O(A) EMPREGADOR(A) deverá realizar o registro do(a) EMPREGADO(A) no eSocial e recolher os encargos trabalhistas e previdenciários devidos, incluindo FGTS e contribuição ao INSS. Quaisquer alterações neste contrato deverao ser feitas por escrito e assinadas por ambas as partes.'
  )

  // Date and city
  checkPageBreak(15)
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(
    `${data.city}, ${formatDate(data.contractDate)}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  )

  // Signatures
  addSignatureLine(`${data.employerName} - EMPREGADOR(A)`)
  addSignatureLine(`${data.employeeName} - EMPREGADO(A)`)
  addSignatureLine('Testemunha 1: Nome: __________________ CPF: __________________')
  addSignatureLine('Testemunha 2: Nome: __________________ CPF: __________________')

  // Footer
  checkPageBreak(15)
  y += 15
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.text(
    'Documento gerado por Lardia (lardia.vercel.app)',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )

  // Download
  const fileName = `contrato-${data.employeeName.toLowerCase().replace(/\s+/g, '-')}-${data.startDate}.pdf`
  doc.save(fileName)
}

/**
 * Return contract PDF as base64 for storage.
 */
export function generateEmploymentContractBase64(data: ContractData): string {
  // Reuse the same logic but return base64 instead of downloading
  // For now we generate and return the data URI
  const doc = buildContractDoc(data)
  return doc.output('datauristring')
}

function buildContractDoc(data: ContractData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function checkPageBreak(needed: number) {
    if (y + needed > pageHeight - 30) {
      doc.addPage()
      y = margin
    }
  }

  function drawLine(yPos: number) {
    doc.setDrawColor(0)
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
  }

  function addClause(number: number, title: string, text: string) {
    checkPageBreak(30)
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`CLAUSULA ${number} - ${title}`, margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(text, contentWidth)
    for (const line of lines) {
      checkPageBreak(6)
      doc.text(line, margin, y)
      y += 4.5
    }
  }

  function addSignatureLine(label: string) {
    checkPageBreak(20)
    y += 12
    drawLine(y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(label, margin, y)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('CONTRATO DE TRABALHO DOMESTICO', pageWidth / 2, y, { align: 'center' })
  y += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(Lei Complementar 150/2015)', pageWidth / 2, y, { align: 'center' })
  y += 4
  drawLine(y)
  y += 6

  addClause(1, 'IDENTIFICACAO DAS PARTES',
    `EMPREGADOR(A): ${data.employerName}, inscrito(a) no CPF sob o n. ${formatCPF(data.employerCpf)}, residente e domiciliado(a) em ${data.employerAddress}.\n\nEMPREGADO(A): ${data.employeeName}, inscrito(a) no CPF sob o n. ${formatCPF(data.employeeCpf)}, portador(a) da CTPS n. ${data.employeeCtps}, residente e domiciliado(a) em ${data.employeeAddress}.`)

  addClause(2, 'FUNCAO',
    `O(A) EMPREGADO(A) exercera a função de ${data.jobFunction}, desempenhando as atividades inerentes ao cargo, no âmbito residencial do(a) EMPREGADOR(A).`)

  addClause(3, 'LOCAL DE TRABALHO',
    `O trabalho será prestado na residencia do(a) EMPREGADOR(A), localizada em ${data.workLocation}.`)

  addClause(4, 'JORNADA DE TRABALHO',
    `A jornada de trabalho será de ${data.hoursPerDay} horas diárias, ${data.daysPerWeek} dias por semana, com início as ${data.startTime} e término as ${data.endTime}, com intervalo de ${data.breakTime} para refeição e descanso, conforme artigo 2o da LC 150/2015. As horas que excederem a jornada normal serão remuneradas com adicional de no mínimo 50% (cinquenta por cento) sobre o valor da hora normal.`)

  addClause(5, 'REMUNERACAO',
    `O(A) EMPREGADO(A) receberá o salário mensal de R$ ${formatBRL(data.salary)} (${salaryInWords(data.salary)}), a ser pago até o dia ${data.paymentDay} de cada mês, mediante recibo. O pagamento do 13o salário e férias acrescidas de 1/3 seguira o disposto na legislação vigente.`)

  addClause(6, 'INICIO DO CONTRATO',
    `O presente contrato terá início em ${formatDate(data.startDate)}.`)

  const contractTypeText = data.contractType === 'indeterminado'
    ? 'O presente contrato e firmado por prazo indeterminado, podendo ser rescindido por qualquer das partes, mediante aviso prévio de 30 (trinta) dias, conforme legislação vigente.'
    : `O presente contrato e firmado por prazo determinado, com término previsto para ${formatDate(data.endDate || '')}, podendo ser prorrogado nos termos da lei.`
  addClause(7, 'PRAZO DO CONTRATO', contractTypeText)

  const benefitsList: string[] = []
  if (data.valeTransporte) benefitsList.push('Vale-transporte, conforme Lei 7.418/1985')
  if (data.otherBenefits) benefitsList.push(data.otherBenefits)
  const benefitsText = benefitsList.length > 0
    ? `O(A) EMPREGADO(A) terá direito aos seguintes benefícios: ${benefitsList.join('; ')}.`
    : 'Não foram acordados benefícios adicionais além dos previstos em lei.'
  addClause(8, 'BENEFICIOS', benefitsText)

  const trialText = data.trialPeriod
    ? `O presente contrato terá período de experiencia de ${data.trialDays} dias, podendo ser prorrogado por igual período, desde que a soma não ultrapasse 90 (noventa) dias, conforme artigo 443 da CLT.`
    : 'As partes dispensam o período de experiencia.'
  addClause(9, 'PERIODO DE EXPERIENCIA', trialText)

  addClause(10, 'DISPOSICOES GERAIS',
    'Este contrato e regido pela Consolidação das Leis do Trabalho (CLT) e pela Lei Complementar 150/2015, que dispõe sobre o contrato de trabalho doméstico. O(A) EMPREGADOR(A) deverá realizar o registro do(a) EMPREGADO(A) no eSocial e recolher os encargos trabalhistas e previdenciários devidos, incluindo FGTS e contribuição ao INSS. Quaisquer alterações neste contrato deverao ser feitas por escrito e assinadas por ambas as partes.')

  checkPageBreak(15)
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`${data.city}, ${formatDate(data.contractDate)}`, pageWidth / 2, y, { align: 'center' })

  addSignatureLine(`${data.employerName} - EMPREGADOR(A)`)
  addSignatureLine(`${data.employeeName} - EMPREGADO(A)`)
  addSignatureLine('Testemunha 1: Nome: __________________ CPF: __________________')
  addSignatureLine('Testemunha 2: Nome: __________________ CPF: __________________')

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.text('Documento gerado por Lardia (lardia.vercel.app)', pageWidth / 2, pageHeight - 10, { align: 'center' })

  return doc
}

/** Simple salary-to-words helper (approximation for common values). */
function salaryInWords(value: number): string {
  // Return a simple formatted string for the contract
  const intPart = Math.floor(value)
  const centPart = Math.round((value - intPart) * 100)
  const parts: string[] = []

  if (intPart > 0) {
    parts.push(`${intPart.toLocaleString('pt-BR')} reais`)
  }
  if (centPart > 0) {
    parts.push(`${centPart} centavos`)
  }

  return parts.join(' e ') || 'zero reais'
}
