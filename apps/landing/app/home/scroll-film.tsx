import { SCENES } from "./copy";

// MOUNT POINT for the scroll-world film (external.scroll-world.landing-page skill).
// Until the rendered video chain lands, this renders the film's five beats as a
// static storyboard — same copy objects the scrub-engine config will consume
// (eyebrow/title/body/tags, prompts.md shapes), so swapping in the film is a
// rendering change, not a content change.
export function ScrollFilm() {
  return (
    <section id="story" data-scroll-film-mount className="bg-[var(--kd-paper)] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SCENES.map((scene, i) => (
            <article
              key={scene.id}
              className="kd-sticker flex flex-col gap-2 bg-[var(--kd-bg)] p-5"
              style={
                {
                  "--kd-shadow":
                    i < 2 ? "var(--kd-muted)" : i === 2 ? "var(--kd-coral)" : "var(--kd-green)",
                } as React.CSSProperties
              }
            >
              <span
                className="text-xs font-semibold tracking-widest text-[var(--kd-muted)]"
                style={{ fontFamily: "var(--font-geist-mono), monospace" }}
              >
                {scene.eyebrow}
              </span>
              <h3
                className="text-xl leading-tight"
                style={{ fontFamily: "var(--font-hand), cursive" }}
              >
                {scene.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--kd-ink-soft)]">{scene.body}</p>
              {scene.tags.length > 0 ? (
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {scene.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--kd-ink)] px-2 py-0.5 text-[11px] text-[var(--kd-ink-soft)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-[var(--kd-muted)]">
          ↑ these five beats become one continuous scroll-driven camera flight — film in production
        </p>
      </div>
    </section>
  );
}
