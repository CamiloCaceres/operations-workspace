---
name: weekly-metrics-rollup
description: Use when the user says "weekly metrics readout" / "how's the business doing this week" / "give me the data for the Monday review" — cross-metric weekly pulse. Reads all tracked metrics, computes week-over-week change, classifies vs direction, flags open anomalies, surfaces what shifted most. Feeds Head of Operations' `run-weekly-review`.
---

# Weekly Metrics Rollup

## When to use

- "weekly metrics readout" / "this week's metrics".
- "how's the business doing this week".
- Before Monday, for Head of Operations' `run-weekly-review`.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. Active priorities
   lead the rollup — metrics tied to priorities go first.

2. **Read `config/metrics.json` and `metrics-daily.json`.** For
   each metric with ≥ 7 snapshots, compute:
   - This-week value — most recent snapshot.
   - Last-week value — snapshot from 7 days ago.
   - Week-over-week percent change.
   - Absolute change in metric units.

3. **Classify state vs direction.** For each metric, compare the
   WoW movement against its `direction` field:
   - `higher-is-better` — positive change = good.
   - `lower-is-better` — negative change = good.
   - `target-is-best` — movement toward the configured target =
     good (fallback: ask user to name target if unset).

   Then tag each metric:
   - `on-track` — good direction, magnitude meaningful.
   - `at-risk` — bad direction, moderate magnitude.
   - `off-track` — bad direction, large magnitude (past the
     configured threshold if set, else WoW > 10%).

4. **Cross-reference anomalies.** Read `anomalies.json` for
   `status: "open"`. For each open anomaly, mark the corresponding
   metric in the rollup with "open anomaly (Pn) — {top cause}".

5. **Priority-align.** Read active priorities from the operating
   context. Metrics tied to priorities lead the rollup (put them
   first in each section).

6. **Top 3 movers.** Compute `|absolute change| / prior value` for
   every metric; pick the top 3. These go under "Biggest movers"
   regardless of priority alignment.

7. **Suggest 1-3 follow-ups.** Concrete handoffs:
   - "Run `run-sql-query` on {X}" — when a shift warrants a drilldown.
   - "Run `run-data-qa` on {table}" — when freshness/nulls look
     suspect.
   - "Analyze experiment {slug}" — if an experiment ended during
     the week and hasn't been analyzed.

8. **Write the rollup** to `rollups/{YYYY-MM-DD}.md` (atomic):

   ```markdown
   # Weekly metrics rollup — {YYYY-MM-DD}

   ## TL;DR
   {1 bullet: single most important shift this week}
   {1 bullet: biggest concern}
   {1 bullet: the question I'd ask you first}

   ## Tied to active priorities
   ### {Priority 1 — from operating context}
   - {metric} — this week {value} vs last week {value} ({Δ%}).
     State: {on-track | at-risk | off-track}. {anomaly note if any}.
   - ...

   ### {Priority 2}
   - ...

   ## Biggest movers
   - {metric} — moved {Δ%} ({direction}).
   - ...

   ## Open anomalies ({N})
   - **P1** {metric} — {sigma}σ {direction}. Top cause: {hypothesis}.
   - ...

   ## Suggested next moves
   1. {action — specific skill + target}
   2. ...
   ```

9. **Append to `outputs.json`** with `type: "metrics-rollup"`,
   status "ready". The Head of Operations' `run-weekly-review` reads
   this file when it runs the Monday rollup.

10. **Report.** One-line TL;DR in chat + path to the rollup file.

## Outputs

- `rollups/{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "metrics-rollup"`.

## What I never do

- **Invent numbers** — if a metric's snapshot is missing, say so
  and offer to run `track-metric` to get it caught up.
- **Claim causation** from WoW change alone — correlation + a
  hypothesis, never a conclusion.
- **Duplicate the HoO weekly review** — this is the metrics cut;
  HoO's review is the cross-agent ops rollup.
