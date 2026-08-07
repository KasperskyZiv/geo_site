# Cursor rules

> **Single source of truth:** these rules mirror the repo-root [`AGENTS.md`](../AGENTS.md). Codex, Cursor, and Copilot read a root `AGENTS.md` by convention; Claude Code reads `CLAUDE.md`; Cursor also reads this file. Keep the details in root `AGENTS.md` — this is the short version Cursor loads into every prompt.

You are working in **builders-stack**, a bun-workspace monorepo. Before writing code, know the map.

## The three folders (role = is it served, and to whom?)

- `apps/` — public UI humans see (`@geo/web`, `@geo/mobile`).
- `services/` — anything with a URL / its own deploy (`@geo/api`, `@geo/ai-worker`, `@geo/payment`).
- `libs/` — shared code, **never served**, consumed only (`@geo/ui`, `@geo/auth`, `@geo/db`, `@geo/ai`, `@geo/analytics`, `@geo/email`, `@geo/config`, `@geo/api-types`).

## Laws (do not break)

1. **No upward import** — `libs` never import from `apps`/`services`. Dependencies point down.
2. **One public door** — import a lib by package name (`@geo/db`), never a deep path.
3. **By feature, not by layer** inside each app/service (`billing/`, not `controllers/`).
4. **One ORM: Drizzle** — all DB access via `@geo/db`.
5. **Payments via the `@geo/payment` adapter** — never call Creem directly from an app.
6. Every workspace extends root `tsconfig.base.json`. No hardcoded URLs/ports/secrets — use env.

## Run

- `bun install`, then `./tilt_up.sh` (never `tilt up` directly — it pins Tilt UI port 10380). Dashboard: `localhost:10380`. Served roles get portless URLs `<svc>.stack.localhost:1355` — no pinned ports.
- The `.devops/Tiltfile` is the runtime manifest. New service → add its `local_resource` there.
- Nx runs the tasks (build/typecheck/lint/test) with enforced boundaries. Typecheck: `bun run typecheck`; both gates: `bun run check`.

## Finishing

Typecheck passes · no new upward/deep imports · new service in `Tiltfile` · new env var in `.env.example` · conventional-commit message.

For the full primer, skills, and subagents see [`agents/`](../agents/).
