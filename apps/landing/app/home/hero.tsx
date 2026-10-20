import Image from "next/image";
import Link from "next/link";
import animals from "../../public/hero/animals.png";
import bushFront from "../../public/hero/bush-front.png";
import { CTA, HERO } from "./copy";

// The hero scene the whole brand hangs on: the giraffe is seen above the bush,
// everyone else is hiding. Two stacked PNG layers from the approved draft —
// animals bob gently behind a static foreground bush. Bubbles + hand-written
// labels float on top. All motion is CSS-only and disabled under reduced motion.
export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-10 pb-8 lg:grid-cols-2 lg:gap-6">
      {/* Left: the pitch */}
      <div className="flex flex-col items-start gap-6">
        <h1
          className="text-5xl leading-[1.05] sm:text-6xl"
          style={{ fontFamily: "var(--font-hand), cursive" }}
        >
          {HERO.title}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[var(--kd-ink-soft)]">{HERO.body}</p>
        <div className="flex flex-col items-start gap-2">
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

      {/* Right: the scene */}
      <div className="relative pt-24 lg:pt-16">
        {/* Floating developer questions */}
        <div className="absolute top-0 right-[4%] left-[4%] z-10 flex items-start justify-between gap-4">
          <div
            className="kd-sticker kd-anim mt-8 bg-white px-4 py-2.5 text-[13px]"
            style={
              {
                "--kd-shadow": "var(--kd-blue)",
                fontFamily: "var(--font-geist-mono), monospace",
                animation: "kd-float-a 4.6s ease-in-out infinite",
              } as React.CSSProperties
            }
          >
            {HERO.bubbles[0]}
          </div>
          <div
            className="kd-sticker kd-anim mt-14 bg-white px-4 py-2.5 text-[13px]"
            style={
              {
                "--kd-shadow": "var(--kd-yellow)",
                fontFamily: "var(--font-geist-mono), monospace",
                animation: "kd-float-b 5.4s ease-in-out infinite 0.6s",
              } as React.CSSProperties
            }
          >
            {HERO.bubbles[1]}
          </div>
        </div>

        {/* Layered scene: animals bob behind the static bush */}
        <div className="relative">
          <Image
            src={animals}
            alt={HERO.sceneAlt}
            priority
            className="kd-anim relative z-[3] h-auto w-full"
            style={{ animation: "kd-bob 5.5s ease-in-out infinite" }}
          />
          <Image
            src={bushFront}
            alt=""
            aria-hidden
            priority
            className="absolute inset-x-0 bottom-0 z-[4] h-auto w-full"
          />

          {/* Hand-written verdict labels */}
          <div
            className="kd-anim absolute top-[1%] left-[58%] z-[6] flex items-start gap-1.5"
            style={{ animation: "kd-label 6.5s ease-in-out infinite" }}
          >
            <span
              aria-hidden
              className="text-3xl leading-none text-[var(--kd-coral)]"
              style={{ transform: "rotate(38deg) translateY(4px)" }}
            >
              ↙
            </span>
            <span
              className="text-3xl leading-none text-[var(--kd-coral)]"
              style={{ fontFamily: "var(--font-hand), cursive", transform: "rotate(-3deg)" }}
            >
              {HERO.seenLabel}
            </span>
          </div>
          <div className="absolute top-[38%] left-[2%] z-[6] flex items-start gap-1.5">
            <span
              className="text-2xl leading-none text-[var(--kd-muted)]"
              style={{ fontFamily: "var(--font-hand), cursive", transform: "rotate(-4deg)" }}
            >
              {HERO.hiddenLabel}
            </span>
            <span
              aria-hidden
              className="text-2xl leading-none text-[var(--kd-muted)]"
              style={{ transform: "rotate(-30deg)" }}
            >
              ⟶
            </span>
          </div>
        </div>

        <p className="mt-4 text-center text-sm font-medium tracking-wide text-[var(--kd-muted)]">
          {HERO.trustLine}
        </p>
      </div>
    </section>
  );
}
