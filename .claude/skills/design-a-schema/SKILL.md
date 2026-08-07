---
name: design-a-schema
description: >
 [Scope: builders-stack monorepo — data modeling in libs/db with Drizzle]
 Model a new table (or reshape an existing one) in libs/db: normalize by default (3NF), constrain at the database (NOT NULL, FKs with explicit onDelete, unique, check), and index deliberately — FKs you join/filter on, composite order right, no speculative indexes. Ships only as a reviewed Drizzle migration; enforces "Drizzle is the only DB layer".
 Use for: adding a table or column to libs/db/src/schema.ts, choosing keys/foreign keys/uniqueness, index strategy, a query that is slow because the schema or its indexes are wrong.
 Not for: diagnosing a slow query from its EXPLAIN plan or ORM N+1 (use optimize-a-query — pair with this skill when the fix is an index), Neon connection/compute/session strategy (use run-lean-on-neon), hand-written SQL migrations (forbidden — Drizzle only).
 Activate: "add a table", "add a column", "design the schema", "which indexes", "foreign key setup", "migration for", "normalize this data".
---

# Design a schema

Get the data model right before the app is built on top of it — a bad schema is the most expensive thing to change later, and on Neon's free tier it's also what quietly eats your 0.5 GB and your compute. Normalize first, constrain always, index on purpose.

## Critical Rules

- **Drizzle is the only DB layer.** Schema is only real once it's a reviewed Drizzle migration — never hand-write SQL.
- **Default to 3NF.** One fact in one place; denormalize only deliberately, with a comment saying why (a measured hot read path, a reporting rollup). Never "just in case."
- **Constrain at the database, not just the app** — app validation can be bypassed, a bad migration can't.
- **Postgres does NOT auto-index foreign keys** — index every FK you `JOIN` or filter on.
- **No speculative indexes.** Every index slows writes and costs storage against the 0.5 GB free cap (see [run-lean-on-neon](../run-lean-on-neon/SKILL.md)). Index what a real query needs; drop indexes nothing uses.

## Core Instructions

### Normalize first (then denormalize with a reason)

- A value that can be derived or looked up should not be copied into another row — copies drift (update anomalies).
- **One row = one entity.** Repeating groups (`tag1`, `tag2`, `tag3`) become a child table with a FK.

### Constrain at the database

The DB is the last line of integrity:

- `NOT NULL` on everything that is logically required.
- **Foreign keys** for every real relationship, with an explicit `onDelete` (`cascade` for owned children, `restrict`/`set null` otherwise). See `session`/`account` in `auth-schema.ts` — `onDelete: "cascade"` on `user.id`.
- `unique` on natural keys (email, slug). `check` constraints for enums/ranges Drizzle can express.

### Index deliberately — the part everyone gets wrong

- A missing FK index is the classic "fine in dev, dies under load" bug.
- **Composite index column order matters:** equality-filtered column first, range/sort column second. An index on `(user_id, created_at)` serves `WHERE user_id = ? ORDER BY created_at` — the reverse order does not.
- **Partial indexes** for queries that always filter (`WHERE deleted_at IS NULL`) — smaller, cheaper.

In Drizzle, declare indexes in the table definition so they land in a migration:

```ts
export const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("posts_author_created_idx").on(t.authorId, t.createdAt)], // FK + sort, one index
);
```

### Then ship it as a migration

Follow the `dba` subagent flow (agents/subagents.md): edit `schema.ts` → `bun --filter @geo/db generate` → **read the SQL diff** → export new tables/types from `src/index.ts`.

### Verify

- `bun --filter @geo/db generate` produces a migration whose SQL matches your intent (no surprise DROP).
- Every FK you query on has an index. No index exists that no query uses.
- `bun run typecheck` passes; consumers import the new type by package name (`@geo/db`).

## Examples

- User: "Posts need tags."
  Output: Child table (`post_tags`) with FK to posts, `onDelete: cascade`, index on the FK — never `tag1/tag2/tag3` columns; ship as a generated, reviewed migration.
- User: "This dashboard query is slow, should I add a column caching the count?"
  Output: First check with [optimize-a-query](../optimize-a-query/SKILL.md) whether an index fixes it; denormalize only if the hot path is measured — and comment why at the column.

## Boundaries

- In scope: `libs/db/src/schema.ts` modeling, keys/constraints/indexes, migration discipline.
- Out of scope: reading EXPLAIN plans and N+1 hunting (optimize-a-query), Neon operating strategy (run-lean-on-neon).
- When unclear: normalize, constrain, and wait for a real query before adding any index beyond the FKs it needs.

## References

- Use The Index, Luke — the practical guide to indexing: <https://use-the-index-luke.com>
- Postgres indexes: <https://www.postgresql.org/docs/current/indexes.html>
- Drizzle schema + indexes: <https://orm.drizzle.team/docs/indexes-constraints>
