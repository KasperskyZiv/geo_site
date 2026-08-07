import { SectionHeading } from "./section-heading";
import { POSITIONING } from "./copy";

// "Keep Profound" — we're not asking buyers to rip out their chat-AI tracker;
// we're the half of the funnel it can't see. Coverage table, them vs Kordi.
export function Positioning() {
  return (
    <section className="bg-[var(--kd-paper)] py-20">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6">
        <SectionHeading
          eyebrow={POSITIONING.eyebrow}
          title={POSITIONING.title}
          body={POSITIONING.body}
        />
        <div
          className="kd-sticker overflow-hidden bg-white"
          style={{ "--kd-shadow": "var(--kd-blue)" } as React.CSSProperties}
        >
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b-2 border-[var(--kd-ink)] text-sm">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Surface
                </th>
                <th scope="col" className="px-4 py-3 text-center font-semibold">
                  Chat-AI trackers
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center font-semibold text-[var(--kd-green-deep)]"
                >
                  Kordi
                </th>
              </tr>
            </thead>
            <tbody>
              {POSITIONING.chips.map((row) => (
                <tr key={row.label} className="border-b border-[var(--kd-card)] last:border-0">
                  <td className="px-4 py-3 text-[var(--kd-ink-soft)]">{row.label}</td>
                  <td className="px-4 py-3 text-center text-xl">
                    {row.them ? (
                      <span className="text-[var(--kd-green)]">✓</span>
                    ) : (
                      <span className="text-[var(--kd-coral)]">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xl">
                    <span className="text-[var(--kd-green)]">✓</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
