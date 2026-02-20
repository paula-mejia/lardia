import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL_FALLBACK = 'LarDia <onboarding@resend.dev>'

function getFromEmail() {
  // Use custom domain if configured, otherwise Resend's default
  return process.env.RESEND_FROM_EMAIL || FROM_EMAIL_FALLBACK
}

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: getFromEmail(),
    to,
    subject: 'Bem-vindo ao LarDia!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Bem-vindo ao LarDia!</h1>
        <p>Olá${name ? ` ${name}` : ''},</p>
        <p>Obrigado por criar sua conta no LarDia. Estamos aqui para simplificar a gestão do eSocial doméstico para você.</p>
        <h2>Próximos passos:</h2>
        <ol>
          <li>Complete seu cadastro de empregador</li>
          <li>Cadastre seus empregados domésticos</li>
          <li>Comece a processar a folha de pagamento</li>
        </ol>
        <p><a href="https://lardia.com.br/dashboard" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Acessar meu painel</a></p>
        <p style="color: #666; font-size: 14px;">Se precisar de ajuda, responda este email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">LarDia - Seu lar em dia | lardia.com.br</p>
      </div>
    `,
  })
}

export async function sendDaeReminderEmail(to: string, name: string, month: string, dueDate: string, totalValue: string) {
  return resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `Lembrete: DAE de ${month} vence em ${dueDate}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Lembrete de pagamento DAE</h1>
        <p>Olá${name ? ` ${name}` : ''},</p>
        <p>O DAE (Documento de Arrecadação do eSocial) referente a <strong>${month}</strong> vence em <strong>${dueDate}</strong>.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">Valor total</p>
          <p style="margin: 4px 0 0; font-size: 24px; font-weight: bold; color: #10B981;">${totalValue}</p>
        </div>
        <p><a href="https://lardia.com.br/dashboard/esocial/dae" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver DAE e gerar boleto</a></p>
        <p style="color: #666; font-size: 14px;">Pague em dia para evitar multas e juros.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">LarDia - Seu lar em dia | lardia.com.br</p>
      </div>
    `,
  })
}

export async function sendPayrollProcessedEmail(to: string, name: string, month: string, employeeCount: number, totalValue: string) {
  return resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `Folha de ${month} processada com sucesso`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Folha processada ✓</h1>
        <p>Olá${name ? ` ${name}` : ''},</p>
        <p>A folha de pagamento de <strong>${month}</strong> foi processada com sucesso.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0;"><strong>${employeeCount}</strong> empregado${employeeCount > 1 ? 's' : ''} processado${employeeCount > 1 ? 's' : ''}</p>
          <p style="margin: 8px 0 0;"><strong>Valor total DAE:</strong> ${totalValue}</p>
        </div>
        <p><a href="https://lardia.com.br/dashboard/esocial" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver detalhes</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">LarDia - Seu lar em dia | lardia.com.br</p>
      </div>
    `,
  })
}

export async function sendGenericEmail(to: string, subject: string, html: string) {
  return resend.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html,
  })
}
