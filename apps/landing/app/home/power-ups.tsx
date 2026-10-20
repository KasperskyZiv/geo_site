import { AGENT_WATCH_ROWS, FIX_QUEUE_ROWS, POWER_UPS, SOV_ROWS } from "./copy";
import { SectionHeading } from "./section-heading";

const mono = { fontFamily: "var(--font-geist-mono), monospace" } as const;

const STATUS_COLOR: Record<string, string> = {
  NAMED: "var(--kd-green)",
  WEAK: "var(--kd-yellow)",
  MISS: "var(--kd-coral)",
};

// Product-UI mockups are ILLUSTRATIVE — the numbers in them are invented demo
// data (like the draft), deliberately not real client results.
function AgentWatchMock() {
  return (
    <div className="flex flex-col gap-2 text-[13px]" style={mono}>
      <div className="flex items-center justify-between text-xs text-[var(--kd-muted)]">
        <span>AGENT WATCH</span>
        <span className="text-[var(--kd-green)]">● LIVE</span>
      </div>
      {AGENT_WATCH_ROWS.map((row) => (
        <div
          key={row.agent + row.prompt}
          className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2"
        >
          <span className="truncate text-[var(--kd-ink-soft)]">
            {row.agent} · {row.prompt}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-[var(--kd-muted)]">{row.rank}</span>
            <span className="font-semibold" style={{ color: STATUS_COLOR[row.status] }}>
              {row.status}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function ShareOfVoiceMock() {
  return (
    <div className="flex flex-col gap-2 text-[13px]" style={mono}>
      <div className="flex items-center justify-between text-xs text-[var(--kd-muted)]">
        <span>SHARE OF VOICE</span>
        <span>1,240 PROMPTS</span>
      </div>
      {SOV_ROWS.map((row) => (
        <div key={row.name} className="flex items-center gap-2">
          <span className="w-28 shrink-0 truncate text-[var(--kd-ink-soft)]">{row.name}</span>
          <span
            className="h-4 rounded-sm"
            style={{
              width: `${row.pct}%`,
              background: row.you ? "var(--kd-green)" : "var(--kd-card)",
              border: "1.5px solid var(--kd-ink)",
            }}
          />
          <span className="text-[var(--kd-muted)]">{row.pct}%</span>
        </div>
      ))}
      <span className="text-xs text-[var(--kd-green-deep)]">WEEK 32 ▲ +6 pts</span>
    </div>
  );
}

function FixQueueMock() {
  return (
    <div className="flex flex-col gap-2 text-[13px]" style={mono}>
      <div className="flex items-center justify-between text-xs text-[var(--kd-muted)]">
        <span>FIX QUEUE</span>
        <span>7 ITEMS</span>
      </div>
      {FIX_QUEUE_ROWS.map((row) => (
        <div
          key={row.fix}
          className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2"
        >
          <span className="truncate text-[var(--kd-ink-soft)]">{row.fix}</span>
          <span className="shrink-0 font-semibold text-[var(--kd-green-deep)]">{row.unlocks}</span>
        </div>
      ))}
    </div>
  );
}

const MOCKS = {
  "agent-watch": AgentWatchMock,
  "share-of-voice": ShareOfVoiceMock,
  "fix-queue": FixQueueMock,
} as const;

export function PowerUps() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20">
      <SectionHeading eyebrow={POWER_UPS.eyebrow} title={POWER_UPS.title} body={POWER_UPS.body} />
      <div className="flex flex-col gap-8">
        {POWER_UPS.items.map((item, i) => {
          const Mock = MOCKS[item.mock];
          return (
            <article
              key={item.kicker}
              className={`grid items-center gap-6 rounded-2xl bg-[var(--kd-card)] p-6 sm:p-8 lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="flex flex-col gap-3">
                <span
                  className="text-xs font-semibold tracking-widest text-[var(--kd-coral)]"
                  style={mono}
                >
                  {item.kicker}
                </span>
                <h3 className="text-2xl font-semibold leading-snug">{item.title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--kd-ink-soft)]">{item.body}</p>
                <p className="text-sm text-[var(--kd-muted)]">{item.footnote}</p>
              </div>
              <div
                className="kd-sticker bg-[var(--kd-bg)] p-4"
                style={{ "--kd-shadow": "var(--kd-blue)" } as React.CSSProperties}
              >
                <Mock />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
