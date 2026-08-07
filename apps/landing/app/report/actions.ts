"use server";

import { sendEmail } from "@geo/email";

export interface ReportLeadState {
  status: "idle" | "ok" | "error";
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// v1 lead capture: validate, notify the team inbox (env-gated — logs when
// RESEND_API_KEY is unset), and always log server-side so no lead is silently
// lost while email isn't wired. Scheduling/CRM comes later.
export async function submitReportLead(
  _prev: ReportLeadState,
  formData: FormData,
): Promise<ReportLeadState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const competitors = String(formData.get("competitors") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || !EMAIL_RE.test(email) || !website) {
    return {
      status: "error",
      message: "Please fill in your name, a valid work email, and your company website.",
    };
  }

  // Leads must never vanish: this log line is the floor, email is the notify.
  console.log("[report-lead]", JSON.stringify({ name, email, website, competitors, notes }));

  const to = process.env.REPORT_LEAD_TO;
  if (to) {
    try {
      await sendEmail({
        to,
        template: "report-lead",
        props: {
          name,
          email,
          website,
          competitors: competitors || undefined,
          notes: notes || undefined,
        },
      });
    } catch (err) {
      // The lead is already logged above — tell the visitor we got it, and
      // surface the delivery failure loudly for ops instead of failing the form.
      console.error("[report-lead] notify email failed (lead IS captured in logs):", err);
    }
  } else {
    console.warn("[report-lead] REPORT_LEAD_TO unset — lead captured in logs only");
  }

  return { status: "ok" };
}
