---
name: run-sql-query
description: Use when the user asks a data question ("how many signups this week" / "top 10 customers by ARR" / "what's retention looking like") — translate to read-only SQL against the right source in `config/data-sources.json`, lazy-introspect tables into `config/schemas.json`, warn on cost BEFORE running, execute via any Composio-connected warehouse, save the query for reuse, return the result with caveats and a run timestamp. Never runs DML/DDL.
---

# Run SQL Query

## When to use

The user asked a data question. Anything phrased as "how many,"
"what's," "top N by," "trend of," "compare X to Y," "why did Z
change." I translate to SQL, run it safely, return a result with
citations.

## Hard rules

- **Read-only.** Any proposed query containing `INSERT`, `UPDATE`,
  `DELETE`, `MERGE`, `DROP`, `CREATE`, `ALTER`, `TRUNCATE`, `GRANT`,
  or `REVOKE` is refused immediately.
- **Warn before executing a potentially expensive query.** Use the
  warehouse's explain / dry-run tool (discover via `composio search
  warehouse explain` or the provider's equivalent) to estimate
  scanned bytes and runtime. Compare against
  `config/data-sources.json` → `costCeilingScannedGb` and
  `costCeilingSeconds` for the target source. If either is exceeded,
  state the estimate and wait for explicit approval.
- **Every result ships with**: the exact SQL, the run timestamp, the
  row count, any data-quality caveats.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of Operations'
   `define-operating-context` first. Priorities + tools anchor which
   source to use and what "this number looks weird" means.

2. **Identify the source.** Read `config/data-sources.json`. If
   empty or incomplete, ask ONE question: "Where does this live?
   *Best — connect your warehouse via Composio and tell me the name.
   Or describe the table and I'll flag this as unverified until
   connected.*" Write and continue.

3. **Lazy schema introspection.** Read `config/schemas.json`. For
   the tables likely needed, if an entry is missing or
   `lastIntrospectedAt` is older than 7 days, run the warehouse's
   schema introspection tool (discover via `composio search`) to
   pull columns, types, nullability, primary key hints. Append to
   `config/schemas.json`. If introspection is blocked because no
   warehouse is connected, ask the user to link one and stop — no
   guessing column names.

4. **Draft the SQL.** Use the dialect from
   `config/data-sources.json`. Prefer CTEs for readability. Apply
   partition / cluster / date filters when available. Generate a
   kebab-case slug from the question purpose (e.g.
   `weekly-signups-last-7d`).

5. **Self-check against the hard rules.** Scan the query text for
   forbidden keywords (case-insensitive). If found, refuse and
   stop.

6. **Estimate cost.** Run the warehouse's explain / dry-run tool.
   Compare to ceilings in `config/data-sources.json` for this
   source. If over ceiling:

   > "This will scan ~{bytes human} (~{rows}) — run it?"

   Wait for approval. Otherwise continue.

7. **Execute via Composio.** Run the query through the connected
   warehouse tool (slug discovered via `composio search
   warehouse`). On success, capture result rows (cap at 10,000 for
   local storage; record real row count separately).

8. **Capture data-quality caveats.** Check the result for null
   percentages on key columns, surprisingly round numbers, zero-row
   returns where the user expected data, ranges that look off
   (negative counts, future-dated events). List any in `notes.md`
   — never hide a concern.

9. **Save as reusable.** Write atomically:
   - `queries/{slug}/query.sql` — the query body.
   - `queries/{slug}/result-latest.csv` — the result.
   - `queries/{slug}/notes.md` — purpose, parameters, schema deps,
     caveats, last-run metadata (timestamp, row count, scanned
     bytes).

10. **Update `queries.json`.** Read-merge-write. Upsert by slug.
    Set `{ purpose, author: "agent", sourceId, schemaDeps, tags,
    costWarning, lastRunAt, lastRowCount }`.

11. **Append to `outputs.json`** with `type: "query-answer"`,
    status "ready".

12. **Return the answer in chat.** Format:

    ```
    {plain-English answer, 1–3 sentences}

    Query: `queries/{slug}/query.sql`
    Ran at: {ISO-8601}
    Rows: {N}
    Caveats: {bulleted or "none"}
    ```

## Outputs

- `queries/{slug}/query.sql` (new or overwritten)
- `queries/{slug}/result-latest.csv` (overwritten)
- `queries/{slug}/notes.md` (new or overwritten)
- Updated `queries.json`
- Possibly updated `config/schemas.json` (lazy introspection)
- Appends to `outputs.json` with `type: "query-answer"`.

## What I never do

- **Run DML/DDL** — refuse and stop.
- **Execute over the cost ceiling** without explicit approval.
- **Hide a caveat** — every notable concern lands in `notes.md`.
- **Invent column or table names** — if introspection is blocked,
  stop and ask for the connection.
