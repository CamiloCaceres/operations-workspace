---
name: track-metric
description: Use when the user says "start tracking {metric}" / "add {KPI} to the dashboard" / "watch {X}" — write a read-only SQL definition against the connected warehouse, snapshot the current value into `metrics-daily.json`, append the metric definition to `config/metrics.json`, and register it for the chosen cadence. Drives the core-metrics grid on the dashboard.
---

# Track Metric

## When to use

- "start tracking {X}" / "add {metric} to the dashboard" / "watch
  {KPI}".
- A user-named metric on `onboard-me` has an empty `sqlSnippet`
  placeholder and the user invokes this skill to build the real
  definition.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first.

2. **Clarify if needed.** If the user's phrasing is ambiguous ("MRR"
   could be billing-MRR, contract-MRR, or ARR/12), ask ONE tight
   question. Otherwise proceed.

3. **Identify the source.** Read `config/data-sources.json`. If the
   user didn't name a source, pick the one most likely from
   `config/business-context.md` (warehouse for core business
   metrics, product DB for engagement).

4. **Check existing metrics.** Read `config/metrics.json`. If a
   metric with the same slug or an overwhelmingly similar name
   exists, tell the user and offer to update rather than duplicate.

5. **Confirm schema.** Read `config/schemas.json` for the referenced
   tables. If entries are missing, lazy-introspect (same pattern as
   `run-sql-query` step 3).

6. **Draft the SQL.** Return a `SELECT` that resolves to a single
   numeric value for a given date. Use a `{{date}}` placeholder
   that the scheduler will substitute at run time. Example
   (BigQuery dialect):

   ```sql
   SELECT SUM(amount) AS value
   FROM `project.dataset.subscriptions`
   WHERE state = 'active'
     AND start_date <= DATE('{{date}}')
     AND (end_date IS NULL OR end_date > DATE('{{date}}'))
   ```

7. **Self-check read-only.** Scan for forbidden DML/DDL keywords.
   Refuse if any appear.

8. **Capture cadence, direction, unit.** Ask ONE question if not
   specified:
   - `cadence: "daily"` default.
   - `direction` — higher-is-better / lower-is-better /
     target-is-best.
   - `unit` — count / currency / percent / ratio / duration / other.
   Do NOT hardcode thresholds — leave `thresholds` empty; if the
   user wants a custom sigma for anomaly detection, they override
   later.

9. **Append the metric definition** to `config/metrics.json`. Also
   register a reusable query under `queries/{metric-slug}/` for
   audit (`run-sql-query` will reuse it). Update `queries.json`.

10. **Snapshot now.** Execute the SQL with `{{date}}` = today
    (warehouse's timezone, defaulting to UTC). Append to
    `metrics-daily.json` with `{ id, metricId, date, value,
    changeVsPrev, changeVs7dAvg, changeVs28dAvg, createdAt }`.
    First-snapshot change fields are null.

11. **Backfill if asked.** If the user said "backfill last N days,"
    loop the SQL across dates and append each snapshot. Warn on
    cost first (compare total estimated scanned bytes vs ceiling).

12. **Append to `outputs.json`** with `type: "metric-tracked"`,
    status "ready".

13. **Report.** Current value + cadence + where it shows on the
    dashboard + a note that `detect-anomaly` will flag deviations
    after ≥ 7 snapshots accumulate.

## Outputs

- Updated `config/metrics.json`
- Appended `metrics-daily.json` rows
- New `queries/{metric-slug}/query.sql`, `notes.md`
- Updated `queries.json`
- Possibly updated `config/schemas.json`
- Appends to `outputs.json` with `type: "metric-tracked"`.

## What I never do

- **Hardcode a sigma threshold.** Per-metric overrides live in
  `config/metrics.json` → `thresholds`. Default is 2σ and lives in
  `detect-anomaly`'s documented default — not baked into metric
  records.
- **Execute DML/DDL.** Same read-only rule.
- **Snapshot without a fresh value** — if the query returns NULL,
  I record the snapshot with a `possibleCauses` note in the next
  anomaly sweep and tell the user.
