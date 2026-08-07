---
name: add-a-lib
description: >
 [Scope: builders-stack monorepo — scaffolding a shared libs/ package]
 Scaffold a new shared library under libs/ (package @geo/<name>): package.json, tsconfig extending the root base, the one-public-door src/index.ts barrel, and wiring it into a consumer without breaking the no-upward-import rule. A libs/* package is shared code that is never served — other packages consume it, it consumes nobody upward.
 Use for: extracting a util, type, component, or client needed by 2+ apps/services into a single source of truth consumed by package name; creating a new @geo/* lib; deciding whether code belongs in a lib.
 Not for: anything with its own URL, port, or deploy (use add-a-service), distributables shipped to third parties — npm SDKs, embed widgets, CLIs (packages/*, recipe in docs/packages.md), code used in exactly one place (leave it there — a lib for one consumer is premature, YAGNI).
 Activate: "add a lib", "new shared library", "extract this into libs", "share this between apps", "new @geo package", "where should this shared code live".
---

# Add a lib

A `libs/*` package is **shared code that is never served** — other packages consume it, it consumes nobody upward. Reach for this when the same helper/type/component is about to exist in two places.

## Critical Rules

- **No upward import:** the lib must not import from `apps/` or `services/`. If it needs to, the boundary is wrong — the caller should pass the dependency in.
- **One public door:** anything not exported from `src/index.ts` is private. Don't let consumers reach into internals — consume by package name only, never a deep path.
- **No Tiltfile change** — libs aren't served, so they get no Tilt resource.
- **Name it a role, not a feature** (`ui`, `db`, `auth`, `ai`, `analytics`).
- **2+ consumers or it isn't a lib** — used in exactly one place stays in that place.

## Core Instructions

1. **Pick the name.** `libs/<name>`, package `@geo/<name>`. Keep it a role, not a feature.

2. **Create the folder + files:**

   ```
   libs/<name>/
   ├── package.json
   ├── tsconfig.json
   └── src/
       └── index.ts        # the ONE public door
   ```

3. **`package.json`** — name it `@geo/<name>`, point exports at the barrel:

   ```json
   {
     "name": "@geo/<name>",
     "private": true,
     "type": "module",
     "exports": { ".": "./src/index.ts" },
     "scripts": { "typecheck": "tsc --noEmit" }
   }
   ```

4. **`tsconfig.json`** — extend the root base, never fork options:

   ```json
   { "extends": "../../tsconfig.base.json", "include": ["src"] }
   ```

5. **`src/index.ts`** — this is the **only** thing consumers may import. Re-export the public surface; keep everything else internal:

   ```ts
   export { thing } from "./thing";
   export type { ThingOptions } from "./thing";
   ```

6. **Install so the workspace links it:** `bun install` (root). The `@geo/<name>` name now resolves across the workspace.

7. **Consume it** from an app/service by **package name only**:

   ```ts
   import { thing } from "@geo/<name>"; // ✅
   import { thing } from "@geo/<name>/src/internal/thing"; // ❌ deep import — forbidden
   ```

8. **Verify:** `bun run typecheck` passes, and the consumer imports by package name only. Done.

## Examples

- User: "The date-formatting helper in apps/web is now needed by services/api too."
  Output: Extract into `libs/` (2+ consumers) — but check `@geo/ui`/existing libs first; if none fits, scaffold per the steps and switch both consumers to the package-name import.
- User: "Make a lib for the invoice-PDF feature only the api uses."
  Output: Decline — one consumer, leave it inside `services/api` organized by feature; revisit when a second consumer appears.

## Boundaries

- In scope: creating `libs/*` packages, the barrel/exports contract, wiring consumers.
- Out of scope: served roles (add-a-service), third-party distributables (`packages/*`, docs/packages.md), DB schema work inside `libs/db` (design-a-schema).
- When unclear: default to NOT creating the lib until the second consumer is real.
