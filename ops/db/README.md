# `ops/db/` — database lifecycle

Thin operate-layer wrappers over `@geo/db` (Drizzle + Postgres, in `libs/db`). The schema and
the actual migrate/seed logic stay with the code in `libs/db`; this folder is just the one
obvious place to drive them when operating an environment.

| Command              | What it does                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `ops/db/migrate.sh`  | applies pending migrations — `bun --filter @geo/db migrate` (programmatic, no drizzle-kit needed at deploy) |
| `bun ops/db/seed.ts` | seeds demo data — wraps `bun --filter @geo/db seed`                                                         |

Both need a live `DATABASE_URL` (see `.env.example`; `ops/secrets/` provisions it). Migrations
are generated with `bun --filter @geo/db generate` during development — see
[`libs/db/README.md`](../../libs/db/README.md).
