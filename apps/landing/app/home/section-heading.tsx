// Shared eyebrow + title + body block. Eyebrow is hand-written (Neucha) per the
// brand direction; titles stay in Geist so long lines hold up.
export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div
      className={`flex max-w-3xl flex-col gap-3 ${alignCls} ${align === "center" ? "mx-auto" : ""}`}
    >
      <span
        className="text-2xl text-[var(--kd-coral)]"
        style={{ fontFamily: "var(--font-hand), cursive" }}
      >
        {eyebrow}
      </span>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {body ? <p className="text-lg leading-relaxed text-[var(--kd-ink-soft)]">{body}</p> : null}
    </div>
  );
}
