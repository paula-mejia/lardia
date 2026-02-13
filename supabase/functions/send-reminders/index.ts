// Edge Function: Send eSocial deadline reminder emails
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
    description: "Documento de Arrecadacao do eSocial - recolhimento unificado de tributos e FGTS.",
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
    label: "Aviso de Ferias",
    description: "Comunicar ferias ao empregado com no minimo 30 dias de antecedencia.",
  },
  thirteenth_1st: {
    label: "13o Salario (1a parcela)",
    description: "Primeira parcela do decimo terceiro salario.",
  },
  thirteenth_2nd: {
    label: "13o Salario (2a parcela)",
    description: "Segunda parcela do decimo terceiro salario.",
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
      <p>Voce tem prazos do eSocial se aproximando:</p>
      <table style="width: 100%; border-collapse: collapse;">
        ${items}
      </table>
      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        Acesse o <a href="https://lardia.app/dashboard/calendar">calendario</a> para mais detalhes.
      </p>
      <p style="color: #999; font-size: 12px;">Lardia - eSocial sem erro, sem estresse</p>
    </div>`;
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
        notification_preferences (email_reminders, days_before)
      `)
      .eq("employees.status", "active");

    if (empError) {
      console.error("Error fetching employers:", empError);
      return new Response(JSON.stringify({ error: empError.message }), { status: 500 });
    }

    let sentCount = 0;
    let skippedCount = 0;

    for (const employer of employers || []) {
      // Get preferences (default: enabled, 3 days before)
      const prefs = employer.notification_preferences?.[0];
      const emailEnabled = prefs?.email_reminders ?? true;
      const daysBefore = prefs?.days_before ?? 3;

      if (!emailEnabled) {
        skippedCount++;
        continue;
      }

      // Get the employer's email (from profile or auth user)
      let email = employer.email;
      if (!email) {
        const { data: userData } = await supabase.auth.admin.getUserById(employer.user_id);
        email = userData?.user?.email;
      }
      if (!email) {
        skippedCount++;
        continue;
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

      // Check which ones were already sent
      const deadlinesToSend: typeof upcomingDeadlines = [];
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
          deadlinesToSend.push(d);
        }
      }

      if (deadlinesToSend.length === 0) continue;

      // Send email via Supabase Auth (admin API sends transactional email)
      // Since Supabase doesn't have a built-in transactional email API for custom emails,
      // we use the Resend integration or a simple fetch to an email provider.
      // For now, we'll use Supabase's edge function to call Resend if RESEND_API_KEY is set,
      // otherwise log the email for manual sending.

      const resendKey = Deno.env.get("RESEND_API_KEY");
      const emailHtml = buildEmailHtml(employer.full_name, deadlinesToSend);
      const subject = deadlinesToSend.some((d) => d.daysUntil === 0)
        ? "Prazo eSocial HOJE - Acao necessaria"
        : `Lembrete: Prazos eSocial em ${deadlinesToSend[0].daysUntil} dias`;

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
        // No email provider configured - log for debugging
        console.log(`[DRY RUN] Would send email to ${email}: ${subject}`);
        console.log(`Deadlines: ${deadlinesToSend.map((d) => d.type).join(", ")}`);
        emailSent = true; // Mark as sent to log it anyway (dry run mode)
      }

      if (emailSent) {
        // Log sent notifications
        for (const d of deadlinesToSend) {
          await supabase.from("notification_log").insert({
            employer_id: employer.id,
            deadline_type: d.type,
            deadline_date: d.date.toISOString().slice(0, 10),
          });
        }
        sentCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: todayStr,
        sent: sentCount,
        skipped: skippedCount,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
