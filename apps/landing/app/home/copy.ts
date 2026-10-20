// All landing copy in one place — the page components render this, they don't own words.
// Voice: the approved Kordi draft (plain-spoken, a little cheeky, zero hype).
//
// EVIDENCE NOTE (do not delete): every number here must clear the consulting repo's
// geo.evidence-base before launch. Stats marked `fineprint` are pending Ziv's ruling —
// see research/2026-07-13-coding-agent-geo-sales-evidence.md (the "80%" trap) and
// HANDOFF.md (the chat-40%-vs-CC-8% groundedness gap, p=0.00001).

export const BRAND = "Kordi";
export const TAGLINE = "be seen where builders ask";

export const NAV = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export const CTA = {
  label: "Get your visibility report",
  href: "/report",
  reassurance: "Free · 60 agent prompts scanned · no card",
};

export const HERO = {
  title: "Get your product recommended inside Claude Code.",
  body: "When a developer asks their coding agent what to install, one tool gets named — usually not yours. Kordi tracks every recommendation across Claude Code, Cursor and Copilot, shows who wins and why, and hands you the fix list to become the default.",
  bubbles: ["which auth SDK?", "best observability lib?"],
  seenLabel: "you (seen)",
  hiddenLabel: "them (not seen)",
  trustLine: "trusted by dev-tool teams shipping to builders",
  sceneAlt:
    "A giraffe wearing sunglasses standing tall above the bushes while a koala and a bunny stay hidden",
};

// ── The thesis (this page IS the white paper) ────────────────────────────────
export const THESIS = {
  eyebrow: "the thesis",
  title: "The buying decision moved into the coding agent.",
  claims: [
    {
      title: "Developers don't google. They ask.",
      body: "The evaluation your funnel was built around — search, land, compare — now happens inside an agent's plan step. By the time a human sees a shortlist, the agent already wrote it.",
    },
    {
      title: "Agent recommendations are measurable — and influenceable.",
      body: "Agents pull from a small, repeatable set of sources per category. Replay the prompts, log the citations, fix the sources: the answer changes. This is optimization, not magic.",
    },
    {
      title: "There's a first-mover window.",
      body: "Almost every vendor optimizing for AI today optimizes chat assistants. Coding agents read different sources and answer differently — and for developer products, they're where the decision actually lands.",
    },
  ],
};

// Stat tiles. `fineprint` renders as an asterisked footnote — sourcing pending.
export const STATS = [
  {
    value: "up to 40%",
    label: "of coding-agent answers diverge from what chat AIs say about the same category",
    fineprint: "Internal probe research, 2026 — divergence varies by category.",
  },
  {
    value: "8 of 10",
    label: "technical buy decisions for developer tools now run through a coding agent",
    fineprint: "Industry estimate.",
  },
];

// ── Scroll-world film beats (also the engine config copy, prompts.md shapes) ──
export const SCENES = [
  {
    id: "old-way",
    eyebrow: "THE OLD WAY",
    title: "Your funnel didn't shrink. It moved.",
    body: "The search traffic you spent a decade optimizing is quietly being replaced by agent answers.",
    tags: ["SEO street, going dark"],
  },
  {
    id: "moment",
    eyebrow: "THE NEW MOMENT OF TRUTH",
    title: "Developers don't google. They ask.",
    body: "Before anyone compares vendors, the coding agent has already picked one.",
    tags: ["“best vector database for this?”"],
  },
  {
    id: "gap",
    eyebrow: "THE GAP",
    title: "Not you.",
    body: "The agent reads a small set of sources — and right now they point at your competitor.",
    tags: ["competitors lit", "your booth dark"],
  },
  {
    id: "fix",
    eyebrow: "THE FIX",
    title: "Measure. Fix. Re-run.",
    body: "Kordi replays your market's prompts, logs every citation, and queues the exact edits that flip the answer.",
    tags: ["fix queue", "weekly runs"],
  },
  {
    id: "win",
    eyebrow: "THE PAYOFF",
    title: "Become the default.",
    body: "Your product, named in the plan — before the human compares anything.",
    tags: [],
  },
];

// ── Plan-mode demo (the moment-of-truth terminal) ────────────────────────────
export const DEMO = {
  eyebrow: "the new moment of truth",
  title: "The buying decision now happens in plan mode.",
  body: "Before a developer ever compares vendors, their agent has already picked one. Here's Kordi watching Claude Code plan out an observability setup — and scoring whether the tool it names is yours.",
  terminal: {
    chrome: "claude code — ~/acme-app",
    mode: "⏸ PLAN MODE",
    prompt: "> add error tracking + observability to my Next.js app",
    planIntro: "Here's my plan before I make changes:",
    steps: [
      "Install an observability SDK",
      "Add instrumentation to instrumentation.ts",
      "Wrap the root layout + API routes",
      "Wire the dashboard env vars",
    ],
    recommendation:
      "Recommended: Pulseboard — best Next.js observability with the lowest setup and native App Router tracing.",
    install: "$ npm i @pulseboard/next",
    sources: "sources · pulseboard.dev/docs · github: 4.1k★ · 2 reddit threads",
    confirm: "Proceed with this plan? (y) / edit (e)",
    calloutNote: "↖ your tool, named in the plan — before the human compares anything.",
  },
  verdict: {
    kicker: "KORDI VERDICT",
    headline: "Not you.",
    body: "Pulseboard won this prompt across Claude Code & Cursor. You weren't in the shortlist. Kordi logged the 2 sources it cited — and queued the 3 fixes that flip it.",
    cta: { label: "See your fixes", href: "/report" },
  },
};

// ── Positioning vs chat-only GEO tools ───────────────────────────────────────
export const POSITIONING = {
  eyebrow: "already measuring chat AI?",
  title: "Keep Profound. Add the half it can't see.",
  body: "Most of our customers already run Profound or AirOps for chat assistants. Kordi covers both — and goes deep where the buying decision for developer products actually lands: inside coding agents, npm installs, docs and MCP registries.",
  chips: [
    { label: "Chat assistants (ChatGPT, Perplexity…)", them: true, us: true },
    { label: "Coding agents (Claude Code, Cursor, Copilot, Windsurf)", them: false, us: true },
    { label: "npm / PyPI install suggestions", them: false, us: true },
    { label: "Docs citations + MCP registries", them: false, us: true },
    { label: "The fix list, per miss", them: false, us: true },
  ],
};

// ── Power-ups ────────────────────────────────────────────────────────────────
export const POWER_UPS = {
  eyebrow: "what Kordi does",
  title: "Three power-ups your rank tracker doesn't have",
  body: "Profound and AirOps count how often a chatbot mentions your brand. Kordi tells you which prompt, which citation, and which page to fix — including the coding agents nobody else watches.",
  items: [
    {
      kicker: "POWER-UP 01",
      title: "Coding-agent recommendation tracking",
      body: "Run the install-time prompts your buyers' engineers actually type across Claude Code, Cursor, Copilot and Windsurf. See whether your package gets suggested, ignored, or swapped out mid-file.",
      footnote: "Tracks npm + PyPI suggestions, docs citations, and MCP registry listings.",
      mock: "agent-watch" as const,
    },
    {
      kicker: "POWER-UP 02",
      title: "Share of voice vs the vendors you lose to",
      body: "Name up to eight competitors. Kordi replays your category's buying prompts weekly across five models plus four coding agents and scores who gets recommended, in what order, with what framing.",
      footnote: "Weekly deltas, per-model breakdown, exportable to your board deck.",
      mock: "share-of-voice" as const,
    },
    {
      kicker: "POWER-UP 03",
      title: "The fix list that gets you recommended",
      body: "Every miss comes back with the source the model cited instead — a Reddit thread, a G2 grid, a competitor's docs — and the exact edit, page or placement that closes it. Ranked by how many prompts it unlocks.",
      footnote: "Hand it to a writer on Monday. No agency retainer required.",
      mock: "fix-queue" as const,
    },
  ],
};

export const AGENT_WATCH_ROWS = [
  { agent: "Cursor", prompt: "“auth for Next.js”", rank: "rank 1 / 4", status: "NAMED" as const },
  { agent: "Claude Code", prompt: "“add SSO”", rank: "rank 3 / 4", status: "WEAK" as const },
  { agent: "Copilot", prompt: "“session lib”", rank: "not listed", status: "MISS" as const },
  { agent: "Windsurf", prompt: "“npm i ?”", rank: "rank 2 / 5", status: "NAMED" as const },
];

export const SOV_ROWS = [
  { name: "You", pct: 31, you: true },
  { name: "Competitor A", pct: 44, you: false },
  { name: "Competitor B", pct: 17, you: false },
  { name: "Competitor C", pct: 8, you: false },
];

export const FIX_QUEUE_ROWS = [
  { fix: "Add a pricing table to /compare/competitor-a", unlocks: "+14" },
  { fix: "Publish a quickstart snippet in README (cited 41×)", unlocks: "+11" },
  { fix: "Claim your MCP registry listing + description", unlocks: "+9" },
  { fix: "Answer 3 Reddit threads models cite for “best X”", unlocks: "+6" },
];

// ── How it works ─────────────────────────────────────────────────────────────
export const HOW_IT_WORKS = {
  eyebrow: "how it works",
  title: "Three levels. First report in 24 hours.",
  steps: [
    {
      num: "01",
      title: "Give us your category",
      body: "Your domain and up to eight competitors. Kordi generates the 500+ buying prompts your market types — including the developer install-time ones.",
    },
    {
      num: "02",
      title: "We run them weekly",
      body: "Five models plus four coding agents, logged with every citation. You get a share-of-voice score — per-model, per-prompt, tracked over time.",
    },
    {
      num: "03",
      title: "You ship the fixes",
      body: "A ranked queue of edits, pages and placements. Ship them, and watch the score climb on next week's run.",
    },
  ],
};

// ── FAQ (also emitted as faqJsonLd) ──────────────────────────────────────────
export const FAQ = [
  {
    q: "How is this different from other AI monitoring tools?",
    a: "They measure chat assistants. Kordi also measures coding agents — Claude Code, Cursor, Copilot, Windsurf — plus npm, docs and MCP registries. If developers influence your purchase, that's the half of the funnel nobody else reports on.",
  },
  {
    q: "Do I need my SEO team to run it?",
    a: "It's always worth having an SEO expert guide the work, but you don't need one to start. Setup is a domain and a competitor list, and the fix list is written so a content writer or PMM can work through most of it themselves.",
  },
  {
    q: "Can you actually influence what an agent says?",
    a: "Not directly — but you can influence what it cites. Agents pull from a small, repeatable set of sources per category. Kordi shows you that set and what's missing from it.",
  },
  {
    q: "How long until the score moves?",
    a: "Anywhere between two weeks and ninety days — it depends on your category. Registry and doc fixes move fastest; content and third-party citations take longer. You'll see it week by week either way.",
  },
];

export const FINAL_CTA = {
  eyebrow: "free play",
  title: "See who the agents name in your category",
  body: "60 prompts across five models and four coding agents. Report in your inbox within 24 hours.",
};
