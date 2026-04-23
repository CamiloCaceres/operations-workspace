---
name: run-data-qa
description: Use when a metric looks weird, the user asks "why is this number off," a new source is connected, or on a quarterly cadence — for each target table, run read-only checks for nulls per column, duplicates on natural keys, freshness (MAX(updated_at) vs expected staleness from `config/schemas.json`), referential integrity on key joins, and cardinality surprises; write a dated report to `data-quality-reports/{YYYY-MM-DD}/report.md`.
---

# Run Data QA

## When to use

- User said "why is this number off / weird / lower than usual".
- A new source was connected and needs a sanity pass.
- An open anomaly in `anomalies.json` has "data quality suspected"
  as a hypothesis.
- Quarterly sweep across the core tables.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first.

2. **Pick targets.** Read `config/schemas.json`. Default to tables
   referenced by metrics in `config/metrics.json` — those are the
   ones whose quality affects answers the user trusts. If the user
   named specific tables, use those. If the user asked about a
   specific metric, walk `config/metrics.json` → referenced tables
   via the saved `queries/{metric-slug}/query.sql`.

3. **For each target, run read-only checks** via the connected
   warehouse (discover slugs via `composio search warehouse`).
   Default to the last 30 days of data unless full-history is
   asked.

   - **Null rates** — For each column,
     `(COUNT(*) - COUNT(col)) / COUNT(*)`. Flag any non-nullable
     column with nulls. Flag any column where null rate jumped vs
     a prior month.
   - **Duplicates on natural keys** — `SELECT nk, COUNT(*) FROM t
     GROUP BY nk HAVING COUNT(*) > 1 LIMIT 100`. Flag any.
   - **Freshness** — `SELECT MAX(updated_at) FROM t`. Compare to
     the per-table `expectedStalenessHours` in
     `config/schemas.json` (default 24h for daily tables if no
     override set). Flag stale.
   - **Referential integrity** — For each known FK pair, check
     `COUNT(orphans) = 0` via `LEFT JOIN ... WHERE parent.id IS
     NULL`. Flag orphans.
   - **Cardinality surprises** — Row count today vs 7-day average;
     distinct counts on key columns. Flag large deltas.

4. **Self-check read-only.** Every generated query must be SELECT —
   refuse and stop if any DML/DDL appears.

5. **Cost check.** Estimate scanned bytes per check; if the sum
   exceeds the ceiling in `config/data-sources.json` for the
   source, warn the user and let them subset the checks before
   running.

6. **Write the report** to
   `data-quality-reports/{YYYY-MM-DD}/report.md` (atomic):

   ```markdown
   # Data quality report — {YYYY-MM-DD}

   ## Summary
   {N} tables audited. {N} issues flagged: {P1} blocking,
   {P2} concerning, {P3} informational.

   ## {table.name}
   - **Null rates** — {pass / flagged columns with rates}
   - **Duplicates on {nk}** — {N found / none}
   - **Freshness** — MAX(updated_at) = {ts} ({Xh ago})
   - **Referential integrity** — {check results}
   - **Cardinality** — today {N} vs 7d-avg {N} (Δ {X%})

   {repeat per table}

   ## Impact on tracked metrics
   - {metricId}: {what the DQ issue means for its reliability}
   ```

7. **Cross-link anomalies.** If this audit was triggered by an
   open anomaly, AND a check found a likely cause (stale, duplicate
   spike, null jump), update the anomaly's `possibleCauses` in
   `anomalies.json` with the specific DQ finding.

8. **Append to `outputs.json`** with `type: "data-quality"`,
   status "ready".

9. **Report.** In chat, list flagged issues by severity. Point at
   the report path.

## Outputs

- `data-quality-reports/{YYYY-MM-DD}/report.md` (new)
- Possibly updated `anomalies.json` (cross-link causes)
- Possibly updated `config/schemas.json` (if introspection during
  the audit discovered new columns or FKs)
- Appends to `outputs.json` with `type: "data-quality"`.

## What I never do

- **Execute DML/DDL** — same read-only rule.
- **Declare a metric "healthy" without evidence** — if a table is
  fresh and nulls are fine, I say so with the numbers.
- **Hide a finding** — every flagged issue lands in the report.
