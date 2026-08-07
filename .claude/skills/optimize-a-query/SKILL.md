---
name: optimize-a-query
description: >
 [Scope: builders-stack monorepo — diagnosing and fixing slow Postgres queries]
 Measure-don't-guess query diagnosis: read the EXPLAIN (ANALYZE, BUFFERS) plan, find the missing index or the Drizzle ORM N+1, surface unknown hot queries via pg_stat_statements, set statement_timeout guardrails, and confirm the fix with a re-run plan.
 Use for: a slow page/endpoint traced to a specific query, a query that times out, pg_stat_statements showing a hot query, "same short query repeated with different ids" in the logs.
 Not for: designing the index or reshaping the table itself (use design-a-schema — this skill finds the need, that one builds it), connection storms / compute / free-tier strategy on Neon (use run-lean-on-neon).
 Activate: "slow query", "query times out", "page is slow", "EXPLAIN this", "seq scan", "N+1", "what's hitting the DB so hard".
---

# Optimize a query

Measure, don't guess. A slow query is almost always a sequential scan that should be an index scan, or an ORM that fired N queries where one would do. Both are visible — you just have to look.

## Critical Rules

- **Never fix a query you haven't planned.** `EXPLAIN (ANALYZE, BUFFERS)` first; re-run it after — the fix isn't done until the plan changed.
- **The fix for a Seq Scan on a filtered/joined big table is an index, not a query rewrite** — and the index work happens in [design-a-schema](../design-a-schema/SKILL.md) (don't over-index).
- **Never fetch relations in a loop** — Drizzle relational `with` or one `inArray(...)` batch, not a `for` loop of `db.query`.

## Core Instructions

### 1. Read the plan

Run the actual query with a plan (via `psql` against your `DATABASE_URL`, or Drizzle's logger):

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ... ;
```

What to look for:

- **`Seq Scan` on a big table** where you filter/join → **missing index**. The fix is an index (usually on the FK or the filtered column), not a query rewrite.
- **`Rows Removed by Filter` ≫ rows returned** → the index isn't selective, or a partial index would help.
- **Estimated rows wildly off actual** → stale stats: `ANALYZE <table>;` (autovacuum usually handles this).
- **Nested Loop over many rows** → often the ORM N+1 below, not a single bad query.

### 2. Catch the ORM N+1

The most common "slow page" in this stack isn't one slow query — it's **many fast ones**. Loading a list and then fetching each row's relation in a loop fires 1 + N queries.

- **Symptom:** the same short query in the logs, repeated with different ids.
- **Fix:** use Drizzle's relational query with `with` (one join-backed query), or a single `inArray(...)` batch — never a `for` loop of `db.query`.

```ts
// ❌ N+1
for (const p of posts) p.author = await db.query.user.findFirst({ where: eq(user.id, p.authorId) });
// ✅ one query
const rows = await db.query.posts.findMany({ with: { author: true } });
```

### 3. Find the hot queries you didn't know about

`pg_stat_statements` ranks queries by total time (Neon supports it — `CREATE EXTENSION IF NOT EXISTS pg_stat_statements;`):

```sql
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
```

The top rows are where an index or an N+1 fix pays off most.

### 4. Guardrail

Set a `statement_timeout` (per session or per role on Neon) so a pathological query fails fast instead of pinning compute:

```sql
ALTER ROLE app SET statement_timeout = '10s';
```

### Verify

Re-run `EXPLAIN (ANALYZE)` — the `Seq Scan` is now an `Index Scan`/`Index Only Scan`, actual time dropped, and the N+1 is a single query in the logs. If you added an index, confirm it's the minimal one that does the job (see design-a-schema — don't over-index).

## Examples

- User: "The posts list endpoint takes 4 seconds."
  Output: Trace to the query; if the logs show one author-lookup per post, it's the N+1 — switch to `findMany({ with: { author: true } })`; else EXPLAIN and look for the Seq Scan.
- User: "The DB feels slow overall but I don't know why."
  Output: `pg_stat_statements` top-10 by total time first, then plan the leaders — don't guess from vibes.

## Boundaries

- In scope: plan reading, N+1 elimination, hot-query discovery, timeout guardrails, verifying fixes.
- Out of scope: creating/reshaping indexes and tables (design-a-schema), Neon connection strings/pooling/compute (run-lean-on-neon).
- When unclear: get a plan or a pg_stat_statements ranking before changing anything.

## References

- `EXPLAIN` output, explained: <https://www.postgresql.org/docs/current/using-explain.html>
- `pg_stat_statements`: <https://www.postgresql.org/docs/current/pgstatstatements.html>
- Drizzle relational queries (avoid N+1): <https://orm.drizzle.team/docs/rqb>
