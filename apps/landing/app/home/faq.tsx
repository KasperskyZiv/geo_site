import { FAQ } from "./copy";
import { SectionHeading } from "./section-heading";

// Native <details> accordion — zero JS, crawlable, keyboard-accessible.
// The page emits matching faqJsonLd (see page.tsx) for rich results.
export function Faq() {
  return (
    <section id="faq" className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-20">
      <SectionHeading eyebrow="questions" title="Questions" />
      <div className="flex flex-col gap-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl bg-[var(--kd-card)] px-6 py-4 open:pb-6"
          >
            <summary className="cursor-pointer list-none text-lg font-semibold marker:content-none">
              <span className="mr-2 inline-block text-[var(--kd-coral)] transition-transform group-open:rotate-90">
                ›
              </span>
              {item.q}
            </summary>
            <p className="mt-3 leading-relaxed text-[var(--kd-ink-soft)]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
