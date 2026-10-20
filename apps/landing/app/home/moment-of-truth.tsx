import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { DEMO } from "./copy";

const mono = { fontFamily: "var(--font-geist-mono), monospace" } as const;

// The plan-mode terminal demo: Claude Code recommends a competitor, Kordi calls it.
// Pure markup — no client JS; the caret blink is CSS.
export function MomentOfTruth() {
  const t = DEMO.terminal;
  return (
    <section id="product" className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20">
      <SectionHeading eyebrow={DEMO.eyebrow} title={DEMO.title} body={DEMO.body} />

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Terminal */}
        <div
          className="kd-sticker overflow-hidden bg-[#0F130E] text-[13px] leading-relaxed text-[#B8C2B8] sm:text-sm"
          style={{ "--kd-shadow": "var(--kd-green)", ...mono } as React.CSSProperties}
        >
          <div className="flex items-center justify-between border-b border-[#33392F] px-4 py-2.5 text-xs text-[#9DA79A]">
            <span>{t.chrome}</span>
            <span className="text-[var(--kd-yellow)]">{t.mode}</span>
          </div>
          <div className="flex flex-col gap-3 px-4 py-4">
            <p className="text-[#EAF4EC]">
              {t.prompt}
              <span
                aria-hidden
                className="kd-anim ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-[#8FD6AE]"
                style={{ animation: "kd-blink 1.6s steps(1) infinite" }}
              />
            </p>
            <p>{t.planIntro}</p>
            <ol className="list-decimal space-y-1 pl-6">
              {t.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="rounded-md bg-[#1C201B] px-3 py-2 text-[#8FD6AE]">{t.recommendation}</p>
            <p className="text-[#EAF4EC]">{t.install}</p>
            <p className="text-xs text-[#6E786B]">{t.sources}</p>
            <p className="text-[#D6DAD2]">{t.confirm}</p>
          </div>
        </div>

        {/* Verdict card */}
        <div className="flex flex-col gap-4">
          <p
            className="text-xl leading-snug text-[var(--kd-green-deep)]"
            style={{ fontFamily: "var(--font-hand), cursive" }}
          >
            {t.calloutNote}
          </p>
          <div
            className="kd-sticker flex flex-col gap-3 bg-white p-6"
            style={{ "--kd-shadow": "var(--kd-coral)" } as React.CSSProperties}
          >
            <span
              className="text-xs font-semibold tracking-widest text-[var(--kd-muted)]"
              style={mono}
            >
              {DEMO.verdict.kicker}
            </span>
            <span
              className="text-5xl text-[var(--kd-coral)]"
              style={{ fontFamily: "var(--font-hand), cursive" }}
            >
              {DEMO.verdict.headline}
            </span>
            <p className="text-[15px] leading-relaxed text-[var(--kd-ink-soft)]">
              {DEMO.verdict.body}
            </p>
            <Link
              href={DEMO.verdict.cta.href}
              className="kd-sticker mt-1 inline-block self-start bg-[var(--kd-green)] px-5 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ "--kd-shadow": "var(--kd-ink)" } as React.CSSProperties}
            >
              {DEMO.verdict.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
