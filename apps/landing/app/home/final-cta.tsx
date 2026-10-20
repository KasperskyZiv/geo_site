import Image from "next/image";
import Link from "next/link";
import giraffeSkate from "../../public/hero/giraffe-skate.png";
import { CTA, FINAL_CTA } from "./copy";

// Closing band: the giraffe rides off with the win. Both the eyebrow and the
// skateboard callback keep the hand-drawn voice through the exit.
export function FinalCta() {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-8 px-6 py-20 sm:grid-cols-[1fr_auto]">
      <div className="flex flex-col items-start gap-4">
        <span
          className="text-2xl text-[var(--kd-coral)]"
          style={{ fontFamily: "var(--font-hand), cursive" }}
        >
          {FINAL_CTA.eyebrow}
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{FINAL_CTA.title}</h2>
        <p className="max-w-xl text-lg leading-relaxed text-[var(--kd-ink-soft)]">
          {FINAL_CTA.body}
        </p>
        <div className="flex flex-col items-start gap-2 pt-2">
          <Link
            href={CTA.href}
            className="kd-sticker inline-block bg-[var(--kd-coral)] px-7 py-3.5 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ "--kd-shadow": "var(--kd-ink)" } as React.CSSProperties}
          >
            {CTA.label}
          </Link>
          <span className="text-[15px] font-medium text-[var(--kd-muted)]">{CTA.reassurance}</span>
        </div>
      </div>
      <Image
        src={giraffeSkate}
        alt="The giraffe rides off on a skateboard, sunglasses on"
        className="mx-auto h-auto w-48 sm:w-64"
      />
    </section>
  );
}
