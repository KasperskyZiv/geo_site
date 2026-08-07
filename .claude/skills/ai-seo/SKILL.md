---
name: ai-seo
description: >
 [Scope: geo_site content authoring — making site content citable by AI answers; vendored upstream, see NOTICE.md]
 AI search optimization authoring guidance: getting content cited by Google AI Overviews, ChatGPT, Perplexity, Claude, Gemini, and Copilot — extractable answer blocks, authority/provenance signals, third-party presence, machine-readable files (llms.txt, /pricing.md, OKF), agentic-experience readiness, and per-platform tactics. Complements the enforced check:seo gate: the gate owns metadata/JSON-LD/SSR plumbing via @geo/seo; this skill owns authoring judgment the gate can't enforce.
 Use for: writing or reviewing geo_site content for AI-answer citability, "how do we show up in AI answers", answer-block/FAQ/comparison structure, llms.txt / pricing.md / OKF decisions, AI-crawler robots.txt policy, monitoring AI visibility.
 Not for: page metadata, JSON-LD, robots/sitemap mechanics (use @geo/seo + the enforced check:seo gate — don't hand-roll), chunking content "for AI" or scaled AI-bait (explicitly forbidden by the repo's SEO/GEO laws in CLAUDE.md, grounded in Google's guide).
 Activate: "AI SEO", "AEO", "GEO", "LLMO", "get cited by AI", "AI Overviews", "optimize for ChatGPT/Perplexity", "llms.txt", "OKF", "AI visibility", "answer engine".
---

# AI SEO (vendored — lean activator)

Make content discoverable, extractable, and citable by AI systems. The full vendored playbook lives in [references/full-reference.md](references/full-reference.md) — read the section you need, not the whole file.

## Critical Rules

- **Provenance:** this skill is vendored from coreyhaines31/marketingskills (MIT, pinned — see [NOTICE.md](NOTICE.md)); re-vet on any upstream bump.
- **The repo's SEO/GEO laws in CLAUDE.md override anything here.** Never chunk content "for AI", never write separate AI variants (scaled-content abuse risk), never hand-roll metadata/JSON-LD — `@geo/seo` is the one door and `check:seo` enforces it. Gate = plumbing; this skill = content. They compose.
- **Treat the granular statistics in the full reference as upstream's claims, not verified facts.** Direction (provenance helps, structure helps, third-party presence matters) is solid; exact percentages ("+40%", "45% of searches", per-platform boost tables) are not independently verified — don't republish them as facts on the site or to clients.
- **Write for people, organize for clarity** — that satisfies Google (people-first, E-E-A-T) and the extractable-structure engines (ChatGPT, Claude, Perplexity) at once.

## Core Instructions

1. **Gather context first** — product-marketing context file if present, key queries, current AI visibility, competitors cited (full-reference §Before Starting).
2. **Structure — make it extractable:** lead sections with the direct answer; definition/step/comparison/FAQ/statistic blocks ([references/content-patterns.md](references/content-patterns.md)); headings that match query phrasing; tables for comparisons.
3. **Authority — make it citable:** cited sources, dated statistics, named expert attribution, freshness signals, E-E-A-T (full-reference §Pillar 2).
4. **Presence — be where AI looks:** third-party sources (Wikipedia, Reddit, review sites, YouTube) often out-cite your own domain; citation ≠ recommendation — see [references/citations-vs-recommendations.md](references/citations-vs-recommendations.md) for the ladder and the self-promo listicle risk.
5. **Machine-readable files:** llms.txt, `/pricing.md`, and the OKF bundle ([references/okf.md](references/okf.md) — no engine reads OKF today; forward bet only). For this repo, `@geo/seo`'s `aiCrawlerRules()` already handles robots.
6. **Per-platform tuning and monitoring:** [references/platform-ranking-factors.md](references/platform-ranking-factors.md), full-reference §Monitoring; check content types against [references/content-types.md](references/content-types.md).

## Examples

- User: "Write the landing FAQ so AI answers can quote it."
  Output: Self-contained Q&A blocks, direct answer first, one idea per block; FAQ JSON-LD comes from `@geo/seo`'s `faqJsonLd` — never inline scripts.
- User: "Should we ship llms.txt and an OKF bundle?"
  Output: llms.txt yes (kept for non-Google engines; Google ignores it — say so); OKF as a cheap forward bet per references/okf.md, framed honestly: no ranking signal today.

## Boundaries

- In scope: content authoring/review for AI citability, machine-readable file decisions, AI visibility monitoring guidance.
- Out of scope: metadata/JSON-LD/robots/sitemap implementation (`@geo/seo` + the enforced gate), classic-SEO tech audits.
- When unclear: default to "write for people, organize for clarity" — it satisfies both camps.
