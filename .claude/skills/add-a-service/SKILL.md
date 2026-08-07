---
name: add-a-service
description: >
 [Scope: builders-stack monorepo — scaffolding a served role under services/]
 Scaffold a new service (package @geo/<name>): the Hono entrypoint reading PORT from env, config from env, wiring into .devops/Tiltfile as a portless resource, Dockerfile under infra/, and .env.example entries. A services/* package is anything with a URL or its own deploy — HTTP server, webhook receiver, or background worker (no URL, still its own process).
 Use for: a new HTTP endpoint group that deserves its own process/deploy, a webhook receiver, a background consumer (queue worker, cron) — which skips Portless and /health but is still a Tilt resource.
 Not for: shared logic with no runtime of its own (use add-a-lib), user-facing surfaces (apps/*), third-party distributables (packages/*, docs/packages.md).
 Activate: "add a service", "new API service", "new webhook receiver", "new background worker", "needs its own URL/deploy", "wire it into Tilt".
---

# Add a service

A `services/*` package is **anything with a URL or its own deploy** — an HTTP server, a webhook receiver, or a background worker (which has no URL but still runs as its own process). Use this when a new surface needs to run independently.

## Critical Rules

- **No pinned port.** Served roles run behind Portless at `<name>.stack.localhost:1355`; Portless injects a random `PORT` — always read `process.env.PORT`. See `docs/portless.md`.
- **Persistence via `@geo/db` only; payments via `@geo/payment` only.** Never import another service's internals — talk over HTTP.
- **Organize by feature, not by layer** (`billing/`, not `controllers/`).
- **The Tiltfile wiring is required, not optional** — a service that isn't a Tilt resource doesn't exist in the dev runtime.
- **Every new env var lands in `.env.example`** with a safe local default.

## Core Instructions

1. **Name it.** `services/<name>`, package `@geo/<name>`.

2. **Files:**

   ```
   services/<name>/
   ├── package.json
   ├── tsconfig.json
   └── src/
       ├── index.ts        # entrypoint: start the server / worker
       └── <feature>/      # organize BY FEATURE, not by layer
   ```

3. **`package.json`** — a `dev` script Tilt will call:

   ```json
   {
     "name": "@geo/<name>",
     "private": true,
     "type": "module",
     "scripts": {
       "dev": "bun --hot src/index.ts",
       "start": "bun src/index.ts",
       "typecheck": "tsc --noEmit"
     }
   }
   ```

4. **`tsconfig.json`:** `{ "extends": "../../tsconfig.base.json", "include": ["src"] }`

5. **`src/index.ts`** — Hono for HTTP; read the port from `process.env.PORT` (Portless injects it — never hardcode). Always expose `/health`:

   ```ts
   import { Hono } from "hono";
   const app = new Hono();
   app.get("/health", (c) => c.json({ ok: true }));
   const port = Number(process.env.PORT ?? 3003); // fallback only for standalone runs
   export default { port, fetch: app.fetch };
   ```

   For a **background worker** there's no server — just start the consumer loop and log readiness. No `/health`, no port (no Portless wrapper either — see ai-worker in the Tiltfile).

6. **Persistence via `@geo/db` only.** Payments via `@geo/payment` only. Never import another service's internals — talk over HTTP.

7. **Wire it into `.devops/Tiltfile`** (the runtime manifest — this is required, not optional). Wrap served roles with the `portless_cmd` helper so they get a stable named URL; a background worker skips Portless:

   ```python
   # served role — gets <name>.stack.localhost:1355 via portless
   local_resource('<name>',
     serve_cmd='cd ' + REPO_ROOT + ' && ' + ENV_LOCAL + portless_cmd(
       '<name>.stack ' + BUN + ' --filter @geo/<name> dev',
       health_url=PORTLESS_PROXY.format('<name>') + '/health'),
     links=[PORTLESS_PROXY.format('<name>') + '/health'],
     labels=['services'])
   ```

8. **Add a Dockerfile** at `infra/<name>.Dockerfile` (copy the pattern from `infra/api.Dockerfile`). If it needs to run in compose/k8s, add it there too.

9. **Add its env vars** to `.env.example` with safe local defaults.

10. **Verify:** `./tilt_up.sh` shows the new resource green in the dashboard (`localhost:10380`); `curl http://<name>.stack.localhost:1355/health` returns `{ "ok": true }` (skip for a worker — check its log line instead). `bun run typecheck` passes.

## Examples

- User: "We need to receive Stripe webhooks."
  Output: New service (own URL, independent deploy) — scaffold per the steps, `/health` + feature folder `webhooks/`, portless-wrapped Tilt resource, secrets to `.env.example`; signature verification per wire-a-new-payment-provider.
- User: "Add a nightly job that summarizes usage."
  Output: Background worker — same scaffold minus Hono//health/Portless; a plain Tilt `local_resource` like ai-worker; persistence through `@geo/db`.

## Boundaries

- In scope: services/* scaffolding, Tiltfile + Dockerfile + env wiring, HTTP/worker entrypoints.
- Out of scope: shared logic (add-a-lib), DB schema (design-a-schema), payment adapter internals (wire-a-new-payment-provider).
- When unclear: if it has no URL and no independent deploy need, it's probably a lib, not a service.
