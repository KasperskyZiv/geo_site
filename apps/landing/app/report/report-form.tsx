"use client";

import { useActionState } from "react";
import { submitReportLead, type ReportLeadState } from "./actions";

const inputCls =
  "w-full rounded-xl border-2 border-[var(--kd-ink)] bg-white px-4 py-3 text-[15px] outline-none focus:border-[var(--kd-green-deep)]";
const labelCls = "flex flex-col gap-1.5 text-sm font-semibold";

// Client half of the report flow — the page shell stays server-rendered.
export function ReportForm() {
  const [state, formAction, pending] = useActionState<ReportLeadState, FormData>(submitReportLead, {
    status: "idle",
  });

  if (state.status === "ok") {
    return (
      <div
        className="kd-sticker flex flex-col items-center gap-3 bg-white px-8 py-12 text-center"
        style={{ "--kd-shadow": "var(--kd-green)" } as React.CSSProperties}
      >
        <span
          className="text-4xl text-[var(--kd-green-deep)]"
          style={{ fontFamily: "var(--font-hand), cursive" }}
        >
          You're in.
        </span>
        <p className="max-w-md text-[15px] leading-relaxed text-[var(--kd-ink-soft)]">
          We're queuing your 60 prompts now. Your report lands in your inbox within 24 hours — a
          real person will follow up with it.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="kd-sticker flex flex-col gap-4 bg-white p-6 sm:p-8"
      style={{ "--kd-shadow": "var(--kd-yellow)" } as React.CSSProperties}
    >
      <label className={labelCls}>
        Your name
        <input
          name="name"
          required
          autoComplete="name"
          className={inputCls}
          placeholder="Dana Levi"
        />
      </label>
      <label className={labelCls}>
        Work email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputCls}
          placeholder="dana@yourcompany.com"
        />
      </label>
      <label className={labelCls}>
        Company website
        <input name="website" required className={inputCls} placeholder="yourcompany.com" />
      </label>
      <label className={labelCls}>
        Competitors you lose to (optional)
        <input name="competitors" className={inputCls} placeholder="up to eight, comma-separated" />
      </label>
      <label className={labelCls}>
        Anything else? (optional)
        <textarea
          name="notes"
          rows={3}
          className={inputCls}
          placeholder="e.g. the prompts your buyers type"
        />
      </label>

      {state.status === "error" ? (
        <p role="alert" className="text-sm font-medium text-[var(--kd-coral)]">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="kd-sticker mt-2 bg-[var(--kd-coral)] px-7 py-3.5 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        style={{ "--kd-shadow": "var(--kd-ink)" } as React.CSSProperties}
      >
        {pending ? "Sending…" : "Get my visibility report"}
      </button>
      <span className="text-center text-sm text-[var(--kd-muted)]">
        Free · 60 agent prompts scanned · no card
      </span>
    </form>
  );
}
