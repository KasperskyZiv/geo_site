import { SectionHeading } from "./section-heading";
import { STATS, THESIS } from "./copy";

// The white-paper-in-a-page: the three-claim thesis plus the stat band.
// Stats carry asterisked fineprints until each number clears geo.evidence-base.
export function Thesis() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20">
      <SectionHeading eyebrow={THESIS.eyebrow} title={THESIS.title} />

      <div className="grid gap-4 md:grid-cols-3">
        {THESIS.claims.map((claim, i) => (
          <article
            key={claim.title}
            className="flex flex-col gap-3 rounded-2xl bg-[var(--kd-card)] p-6"
          >
            <span
              className="text-3xl text-[var(--kd-green-deep)]"
              style={{ fontFamily: "var(--font-hand), cursive" }}
            >
              {i + 1}.
            </span>
            <h3 className="text-xl font-semibold leading-snug">{claim.title}</h3>
            <p className="text-[15px] leading-relaxed text-[var(--kd-ink-soft)]">{claim.body}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {STATS.map((stat) => (
          <div
            key={stat.value}
            className="kd-sticker flex flex-col items-center gap-1 bg-white px-6 py-8 text-center"
            style={{ "--kd-shadow": "var(--kd-yellow)" } as React.CSSProperties}
          >
            <span
              className="text-5xl text-[var(--kd-coral)]"
              style={{ fontFamily: "var(--font-hand), cursive" }}
            >
              {stat.value}
            </span>
            <p className="max-w-sm text-[15px] leading-snug text-[var(--kd-ink)]">
              {stat.label}
              <span aria-hidden>*</span>
            </p>
            <p className="mt-2 text-xs text-[var(--kd-muted)]">* {stat.fineprint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
