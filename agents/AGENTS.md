# agents/AGENTS.md → moved to the repo root

The primer now lives at the **repo root**: [`../AGENTS.md`](../AGENTS.md) — that's the file Codex, Cursor, and Copilot read by convention, so it's the single source of truth.

This `agents/` folder is the **deep dive** the root primer links to:

- [`subagents.md`](./subagents.md) — specialized subagents and when to spawn them.
- [`../.claude/skills/`](../.claude/skills/) — step-by-step skills for common structural tasks (moved to `.claude/skills/` so Claude Code auto-discovers them — including from a parent-repo session as `geo_site:<skill>`; Codex/Cursor reach them via these links).
- [`mcp.json`](./mcp.json) — MCP servers to wire up (copy to repo-root `.mcp.json`).
