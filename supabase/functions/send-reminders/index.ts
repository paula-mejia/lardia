// Edge Function: Send eSocial deadline reminder emails and WhatsApp messages
// Call via HTTP POST. Designed to be triggered by a cron job.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// eSocial deadline definitions (mirrored from src/lib/deadlines.ts)
type DeadlineType =
  | "dae"
  | "fgts"
  | "esocial_closing"
  | "vacation_notice"
  | "thirteenth_1st"
  | "thirteenth_2nd"
  | "income_report"
  | "dirf";

interface DeadlineInfo {
  label: string;
  description: string;
}

const DEADLINES: Record<DeadlineType, DeadlineInfo> = {
  dae: {
    label: "Pagamento DAE",
    description: "Documento de Arrecadação do eSocial - recolhimento unificado de tributos e FGTS.",
  },
  fgts: {
    label: "FGTS Digital",
    description: "Recolhimento do FGTS pelo sistema FGTS Digital.",
  },
  esocial_closing: {
    label: "Fechamento eSocial",
    description: "Prazo para envio dos eventos periodicos (folha de pagamento).",
  },
  vacation_notice: {
    label: "Aviso de Férias",
    description: "Comunicar férias ao empregado com no mínimo 30 dias de antecedência.",
  },
  thirteenth_1st: {
    label: "13o Salário (1a parcela)",
    description: "Primeira parcela do décimo terceiro salário.",
  },
  thirteenth_2nd: {
    label: "13o Salário (2a parcela)",
    description: "Segunda parcela do décimo terceiro salário.",
  },
  income_report: {
    label: "Informe de Rendimentos",
    description: "Entrega do informe de rendimentos ao empregado.",
  },
  dirf: {
    label: "DIRF",
    description: "Declaracao do Imposto de Renda Retido na Fonte.",
  },
};

// Fixed Brazilian holidays
const FIXED_HOLIDAYS: Array<[number, number]> = [
  [1, 1], [4, 21], [5, 1], [9, 7], [10, 12], [11, 2], [11, 15], [12, 25],
];

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isFixedHoliday(date: Date): boolean {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return FIXED_HOLIDAYS.some(([hm, hd]) => hm === m && hd === d);
}

function nextBusinessDay(date: Date): Date {
  const d = new Date(date);
  while (isWeekend(d) || isFixedHoliday(d)) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

// Get deadline dates for a given month
function getDeadlinesForMonth(year: number, month: number): Array<{ type: DeadlineType; date: Date }> {
  const results: Array<{ type: DeadlineType; date: Date }> = [];

  // DAE: day 7 (next business day)
  const daeDate = nextBusinessDay(new Date(year, month - 1, 7));
  if (daeDate.getMonth() === month - 1) results.push({ type: "dae", date: daeDate });

  // FGTS: day 7 (next business day)
  const fgtsDate = nextBusinessDay(new Date(year, month - 1, 7));
  if (fgtsDate.getMonth() === month - 1) results.push({ type: "fgts", date: fgtsDate });

  // eSocial closing: day 15
  results.push({ type: "esocial_closing", date: new Date(year, month - 1, 15) });

  // 13th salary 1st: Nov 30
  if (month === 11) results.push({ type: "thirteenth_1st", date: new Date(year, 10, 30) });

  // 13th salary 2nd: Dec 20
  if (month === 12) results.push({ type: "thirteenth_2nd", date: new Date(year, 11, 20) });

  // Income report: Feb 28
  if (month === 2) results.push({ type: "income_report", date: new Date(year, 1, 28) });

  // DIRF: Feb 28
  if (month === 2) results.push({ type: "dirf", date: new Date(year, 1, 28) });

  return results;
}

// Build HTML email body
function buildEmailHtml(employerName: string, deadlines: Array<{ type: DeadlineType; date: Date; daysUntil: number }>): string {
  const items = deadlines.map((d) => {
    const info = DEADLINES[d.type];
    const urgency = d.daysUntil === 0 ? "HOJE" : `em ${d.daysUntil} dia${d.daysUntil > 1 ? "s" : ""}`;
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${info.label}</strong> - ${urgency} (${formatDate(d.date)})<br/>
          <span style="color: #666; font-size: 14px;">${info.description}</span>
        </td>
      </tr>`;
  }).join("");

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Lembrete de Prazos eSocial</h2>
      <p>Ola, ${employerName}!</p>
      <p>Você tem prazos do eSocial se aproximando:</p>
      <table style="width: 100%; border-collapse: collapse;">
        ${items}
      </table>
      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        Acesse o <a href="https://lardia.app/dashboard/calendar">calendario</a> para mais detalhes.
      </p>
      <p style="color: #999; font-size: 12px;">Lardia - eSocial sem erro, sem estresse</p>
    </div>`;
}

// Build WhatsApp message for a deadline
function buildWhatsAppMessage(deadline: { type: DeadlineType; date: Date; daysUntil: number }): string {
  if (deadline.type === "dae" || deadline.type === "fgts") {
    const dueDay = deadline.date.getDate();
    if (deadline.daysUntil === 0) {
      return `Hoje e o último dia para pagar o DAE! Valor: R$XXX. Não esqueca!`;
    }
    return `Lembrete: o DAE do mês vence em ${deadline.daysUntil} dias (dia ${dueDay}). Valor estimado: R$XXX. Acesse Lardia para gerar o comprovante.`;
  }

  if (deadline.type === "esocial_closing") {
    return `Hora de fechar a folha de pagamento do mês. Acesse Lardia.`;
  }

  // Generic message for other deadlines
  const info = DEADLINES[deadline.type];
  const urgency = deadline.daysUntil === 0 ? "HOJE" : `em ${deadline.daysUntil} dias`;
  return `Lembrete Lardia: ${info.label} vence ${urgency} (${formatDate(deadline.date)}). ${info.description}`;
}

// Send WhatsApp via Twilio API
async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

  if (!accountSid || !authToken) {
    console.log(`[WHATSAPP DRY RUN] To: ${to} | Message: ${body}`);
    return true;
  }

  const toFormatted = `whatsapp:${to}`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params = new URLSearchParams({
    From: fromNumber,
    To: toFormatted,
    Body: body,
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (res.ok) {
      return true;
    } else {
      console.error("Twilio WhatsApp error:", await res.text());
      return false;
    }
  } catch (err) {
    console.error("WhatsApp send error:", err);
    return false;
  }
}

// Check rate limit: max 3 WhatsApp messages per user per day
async function checkWhatsAppRateLimit(
  supabase: ReturnType<typeof createClient>,
  employerId: string,
  todayStr: string
): Promise<boolean> {
  const { count } = await supabase
    .from("notification_log")
    .select("id", { count: "exact", head: true })
    .eq("employer_id", employerId)
    .gte("sent_at", `${todayStr}T00:00:00Z`)
    .lte("sent_at", `${todayStr}T23:59:59Z`)
    .like("deadline_type", "%_whatsapp");

  return (count ?? 0) < 3;
}

Deno.serve(async (req) => {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    // Get all employers with active employees and their notification preferences
    const { data: employers, error: empError } = await supabase
      .from("employers")
      .select(`
        id,
        full_name,
        email,
        user_id,
        employees!inner (id, status),
        notification_preferences (email_reminders, days_before, whatsapp_reminders, whatsapp_number)
      `)
      .eq("employees.status", "active");

    if (empError) {
      console.error("Error fetching employers:", empError);
      return new Response(JSON.stringify({ error: empError.message }), { status: 500 });
    }

    let emailSentCount = 0;
    let whatsappSentCount = 0;
    let skippedCount = 0;

    for (const employer of employers || []) {
      // Get preferences (default: email enabled, WhatsApp disabled, 3 days before)
      const prefs = employer.notification_preferences?.[0];
      const emailEnabled = prefs?.email_reminders ?? true;
      const whatsappEnabled = prefs?.whatsapp_reminders ?? false;
      const whatsappNumber = prefs?.whatsapp_number;
      const daysBefore = prefs?.days_before ?? 3;

      if (!emailEnabled && !whatsappEnabled) {
        skippedCount++;
        continue;
      }

      // Get the employer's email (from profile or auth user)
      let email = employer.email;
      if (!email && emailEnabled) {
        const { data: userData } = await supabase.auth.admin.getUserById(employer.user_id);
        email = userData?.user?.email;
      }

      // Check deadlines for current and next month
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

      const allDeadlines = [
        ...getDeadlinesForMonth(currentYear, currentMonth),
        ...getDeadlinesForMonth(nextYear, nextMonth),
      ];

      // Filter deadlines that are within the reminder window
      const upcomingDeadlines: Array<{ type: DeadlineType; date: Date; daysUntil: number }> = [];

      for (const deadline of allDeadlines) {
        const deadlineTime = deadline.date.getTime();
        const todayTime = today.getTime();
        const diffDays = Math.round((deadlineTime - todayTime) / (1000 * 60 * 60 * 24));

        // Send on the exact day_before match OR on deadline day itself
        if (diffDays === daysBefore || diffDays === 0) {
          upcomingDeadlines.push({ ...deadline, daysUntil: diffDays });
        }
      }

      if (upcomingDeadlines.length === 0) continue;

      // === EMAIL NOTIFICATIONS ===
      if (emailEnabled && email) {
        const emailDeadlinesToSend: typeof upcomingDeadlines = [];
        for (const d of upcomingDeadlines) {
          const dateStr = d.date.toISOString().slice(0, 10);
          const { data: existing } = await supabase
            .from("notification_log")
            .select("id")
            .eq("employer_id", employer.id)
            .eq("deadline_type", d.type)
            .eq("deadline_date", dateStr)
            .maybeSingle();

          if (!existing) {
            emailDeadlinesToSend.push(d);
          }
        }

        if (emailDeadlinesToSend.length > 0) {
          const resendKey = Deno.env.get("RESEND_API_KEY");
          const emailHtml = buildEmailHtml(employer.full_name, emailDeadlinesToSend);
          const subject = emailDeadlinesToSend.some((d) => d.daysUntil === 0)
            ? "Prazo eSocial HOJE - Acao necessaria"
            : `Lembrete: Prazos eSocial em ${emailDeadlinesToSend[0].daysUntil} dias`;

          let emailSent = false;

          if (resendKey) {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Lardia <noreply@lardia.app>",
                to: [email],
                subject,
                html: emailHtml,
              }),
            });

            if (res.ok) {
              emailSent = true;
            } else {
              console.error("Resend error:", await res.text());
            }
          } else {
            console.log(`[EMAIL DRY RUN] Would send to ${email}: ${subject}`);
            emailSent = true;
          }

          if (emailSent) {
            for (const d of emailDeadlinesToSend) {
              await supabase.from("notification_log").insert({
                employer_id: employer.id,
                deadline_type: d.type,
                deadline_date: d.date.toISOString().slice(0, 10),
              });
            }
            emailSentCount++;
          }
        }
      }

      // === WHATSAPP NOTIFICATIONS ===
      if (whatsappEnabled && whatsappNumber) {
        // Check rate limit
        const withinLimit = await checkWhatsAppRateLimit(supabase, employer.id, todayStr);
        if (!withinLimit) {
          console.log(`[WHATSAPP] Rate limit reached for employer ${employer.id}`);
          continue;
        }

        for (const d of upcomingDeadlines) {
          // Re-check rate limit per message
          const stillWithinLimit = await checkWhatsAppRateLimit(supabase, employer.id, todayStr);
          if (!stillWithinLimit) break;

          const waLogType = `${d.type}_whatsapp`;
          const dateStr = d.date.toISOString().slice(0, 10);

          // Check if already sent
          const { data: existing } = await supabase
            .from("notification_log")
            .select("id")
            .eq("employer_id", employer.id)
            .eq("deadline_type", waLogType)
            .eq("deadline_date", dateStr)
            .maybeSingle();

          if (existing) continue;

          const message = buildWhatsAppMessage(d);
          const sent = await sendWhatsApp(whatsappNumber, message);

          if (sent) {
            await supabase.from("notification_log").insert({
              employer_id: employer.id,
              deadline_type: waLogType,
              deadline_date: dateStr,
            });
            whatsappSentCount++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: todayStr,
        emailSent: emailSentCount,
        whatsappSent: whatsappSentCount,
        skipped: skippedCount,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
