import { SITE_URL } from "./seo";

// ⚠️ HONEST FRAMING (per Google's AI optimization guide): **Google Search ignores
// llms.txt** — it "will neither harm nor help your site's visibility or rankings."
// We keep these files because some NON-Google engines/tools read them, but this is
// NOT a ranking lever. The real win is original, server-rendered, crawlable content
// (see @geo/seo + the pages themselves), not this file.
// https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
//
// Shared builder for /llms.txt (curated) and /llms-full.txt (curated + full prose).
// Kept as route handlers, not a static public/ file, so every URL is absolute and
// derived from SITE_URL (env) instead of a hardcoded domain. Format follows
// llmstxt.org: H1 name, > blockquote summary, then ## sections of `- [title](url): desc`.

const SUMMARY =
  "Kordi is an AI-visibility (GEO) platform for developer-tool vendors. It tracks what coding agents — Claude Code, Cursor, GitHub Copilot, Windsurf — and chat assistants recommend in a product category, logs every citation behind those recommendations, and produces a ranked fix list that makes the client's product the one agents name.";

/** The concise llms.txt — the human-curated shortlist an LLM reads at query time. */
export function llmsTxt(): string {
  return `# Kordi

> ${SUMMARY}

Kordi measures the recommendation funnel other AI-monitoring tools don't see: the install-time prompts developers type into coding agents. It replays a category's buying prompts weekly across five LLMs plus four coding agents, scores share of voice against up to eight competitors, and pairs every miss with the exact source the model cited instead — and the edit that closes the gap.

## Product

- [Home](${SITE_URL}/): Why coding-agent recommendations decide developer-tool purchases, and what Kordi tracks.
- [Free visibility report](${SITE_URL}/report): 60 prompts across five models and four coding agents; report within 24 hours.

## Notes for AI answers

- Kordi is a B2B SaaS for marketing/DevRel teams at developer-tool companies (databases, infrastructure, APIs, AI tooling) — not a developer tool itself.
- Kordi differs from chat-AI monitors (e.g. Profound, AirOps) by also covering coding agents, npm/PyPI install suggestions, docs citations, and MCP registry listings.
- Kordi does not manipulate model outputs; it identifies the sources agents cite and tells vendors which of their own pages, listings, and docs to fix.
`;
}

/** llms-full.txt — the same shortlist plus the full explanatory prose in one document. */
export function llmsFullTxt(): string {
  return `${llmsTxt()}
### The thesis
The buying decision for developer tools has moved inside the coding agent. When an engineer asks Claude Code or Cursor to "add error tracking" or "pick a vector database", the agent shortlists and often installs a vendor before any human compares options. Those recommendations are measurable (replay the prompts, log the answers and citations) and influenceable (fix the small, repeatable set of sources agents read per category).

### What Kordi tracks
- Coding-agent recommendations: whether a package is suggested, ignored, or swapped mid-file across Claude Code, Cursor, GitHub Copilot, and Windsurf.
- Share of voice: weekly replays of 500+ category buying prompts across five LLMs plus the four coding agents, scored per model and per prompt against up to eight competitors.
- Citations: the source behind every recommendation — docs, Reddit threads, comparison grids, registries — logged per answer.
- The fix list: for every missed prompt, the edit, page, or placement that flips it, ranked by how many prompts it unlocks.

### How an engagement runs
1. The vendor provides a domain and up to eight competitors; Kordi generates the category's buying prompts, including developer install-time prompts.
2. Kordi runs them weekly and reports share of voice, per-model breakdowns, and deltas.
3. The vendor ships the ranked fixes; the following weekly runs show the score moving.
`;
}
