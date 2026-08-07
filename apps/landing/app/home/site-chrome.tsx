import Link from "next/link";
import { BRAND, CTA, NAV, TAGLINE } from "./copy";

export function SiteNav() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Link
        href="/"
        className="text-3xl text-[var(--kd-ink)]"
        style={{ fontFamily: "var(--font-hand), cursive" }}
      >
        {BRAND}
      </Link>
      <nav className="flex items-center gap-5">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="hidden text-[15px] font-medium text-[var(--kd-ink-soft)] hover:text-[var(--kd-coral)] sm:inline"
          >
            {item.label}
          </a>
        ))}
        <Link
          href={CTA.href}
          className="kd-sticker bg-[var(--kd-green)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          style={{ "--kd-shadow": "var(--kd-ink)" } as React.CSSProperties}
        >
          {CTA.label}
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-[var(--kd-ink)] bg-[var(--kd-paper)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
        <span className="text-2xl" style={{ fontFamily: "var(--font-hand), cursive" }}>
          {BRAND}
        </span>
        <nav className="flex items-center gap-4 text-sm text-[var(--kd-ink-soft)]">
          {NAV.map((item) => (
            <a key={item.href} href={`/${item.href}`} className="hover:text-[var(--kd-coral)]">
              {item.label}
            </a>
          ))}
          <Link href={CTA.href} className="hover:text-[var(--kd-coral)]">
            Get a report
          </Link>
        </nav>
        <span className="text-sm text-[var(--kd-muted)]">
          © 2026 {BRAND} — {TAGLINE}
        </span>
      </div>
    </footer>
  );
}
