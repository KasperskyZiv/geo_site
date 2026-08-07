import { HOW_IT_WORKS } from "./copy";
import { SectionHeading } from "./section-heading";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[var(--kd-paper)] py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        <SectionHeading eyebrow={HOW_IT_WORKS.eyebrow} title={HOW_IT_WORKS.title} />
        <ol className="grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.steps.map((step) => (
            <li
              key={step.num}
              className="kd-sticker flex flex-col gap-3 bg-[var(--kd-bg)] p-6"
              style={{ "--kd-shadow": "var(--kd-green)" } as React.CSSProperties}
            >
              <span
                className="text-4xl text-[var(--kd-green-deep)]"
                style={{ fontFamily: "var(--font-hand), cursive" }}
              >
                {step.num}
              </span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-[var(--kd-ink-soft)]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
