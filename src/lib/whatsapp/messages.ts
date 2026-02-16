import { sendWhatsAppMessage as sendRawMessage, type SendMessageResult } from './client'

// Re-export the raw send function
export { sendRawMessage as sendWhatsAppMessage }

/**
 * Send a template-based WhatsApp message via Twilio Content Templates.
 * Requires pre-approved templates in Twilio console.
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  variables: Record<string, string>
): Promise<SendMessageResult> {
  // Twilio content templates use ContentSid + ContentVariables
  // For now, we build the message body from variables as a fallback
  const body = Object.entries(variables).reduce(
    (msg, [key, value]) => msg.replace(`{{${key}}}`, value),
    templateName
  )
  return sendRawMessage(to, body)
}

/**
 * Notify employer that the DAE (guia de recolhimento) is ready.
 */
export async function sendDaeNotification(
  to: string,
  _employeeName: string,
  month: string,
  amount: string,
  dueDate: string
): Promise<SendMessageResult> {
  const body = `Sua DAE de ${month} está pronta. Valor: R$${amount}. Vencimento: ${dueDate}`
  return sendRawMessage(to, body)
}

/**
 * Monthly check-in with employer before payroll processing.
 */
export async function sendMonthlyCheck(
  to: string,
  employeeName: string,
  month: string
): Promise<SendMessageResult> {
  const body = `Olá! Vamos processar a folha de ${employeeName} para ${month}. Houve alguma novidade? (falta, hora extra, aumento, etc.)`
  return sendRawMessage(to, body)
}

/**
 * Send payslip notification to employee.
 */
export async function sendPayslipToEmployee(
  to: string,
  employeeName: string,
  month: string,
  netAmount: string,
  payslipUrl: string
): Promise<SendMessageResult> {
  const body = `Olá ${employeeName}, seu contracheque de ${month} está disponível. Valor líquido: R$${netAmount}. Acesse: ${payslipUrl}`
  return sendRawMessage(to, body)
}

/**
 * Send payment reminder to employer (day before due date).
 */
export async function sendPaymentReminder(
  to: string,
  month: string,
  amount: string
): Promise<SendMessageResult> {
  const body = `Lembrete: sua DAE de ${month} (R$${amount}) vence amanhã!`
  return sendRawMessage(to, body)
}

/**
 * Notify employer that employee confirmed salary receipt.
 */
export async function sendReceiptConfirmation(
  to: string,
  _employerName: string,
  employeeName: string,
  month: string
): Promise<SendMessageResult> {
  const body = `✅ ${employeeName} confirmou o recebimento do salário de ${month}`
  return sendRawMessage(to, body)
}
