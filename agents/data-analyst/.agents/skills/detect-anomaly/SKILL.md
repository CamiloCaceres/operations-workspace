---
name: detect-anomaly
description: Use when `metrics-daily.json` has just been refreshed, on a daily sweep, OR when the user asks "anything weird in the data" / "anomaly check" — for each metric in `config/metrics.json` with ≥ 7 snapshots, compare the latest value to its 7-day and 28-day rolling baselines, flag deviations past the threshold (from `config/metrics.json` per-metric or the documented default 2σ), hypothesize 1–3 possible causes from recent context, append/update `anomalies.json`.
---

# Detect Anomaly

## When to use

- Metrics data just refreshed.
- User asks "anything off," "why did X drop," "anomaly check."
- Daily sweep when `metrics-daily.json` grew.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. Priorities inform
   P1 vs P2 severity. Tools section lists which Composio categories
   might reveal recent changes (deploys, campaigns).

2. **Load metrics.** Read `config/metrics.json` and
   `metrics-daily.json`. Filter metrics with at least 7 snapshots —
   fewer means no meaningful baseline.

3. **Read thresholds.** For each metric, prefer its per-metric
   override in `config/metrics.json` → `thresholds.sigma`. If absent,
   use the documented default of 2σ (yellow) / 3σ (red). These
   defaults are overridable — never hardcoded into decision logic.

4. **For each metric, compute baselines:**
   - `mean7`, `std7` — last 7 snapshots excluding today.
   - `mean28`, `std28` — last 28 snapshots excluding today.
   - `observed` — today's value.
   - `sigma7 = |observed - mean7| / std7` (if std7 = 0 and observed
     differs, flag as "baseline has no variance" at P2 and continue).
   - `sigma28` — same against 28-day.

5. **Classify severity.**
   - `P1` — `sigma7 > 3` AND `sigma28 > 3`, OR direction of movement
     is "bad" (higher on lower-is-better, or vice versa) AND
     `sigma7 > 2.5`.
   - `P2` — `sigma7 > 2` AND `sigma28 > 2`.
   - `P3` — `sigma7 > 2` but `sigma28 ≤ 2` (recent noise).
   - Below threshold → no anomaly opened.

6. **Dedupe.** Check `anomalies.json` for an existing OPEN anomaly
   on the same `metricId` for today's `date`. If present, update in
   place (sigma, severity, causes can shift). Do not duplicate.

7. **Hypothesize causes (1–3 ranked).** Pull context from:
   - `config/business-context.md` — what the metric measures and
     what typically drives it.
   - Recent changes via connected categories (no hardcoded
     providers) — `composio search` by category: `deploy-log`,
     `marketing`, `ad-platform`, `billing` etc. Surface any event
     in the last 24-72 hours that aligns in direction.
   - Historical pattern match — same day last week / last month for
     seasonality.

   Phrase hypotheses concretely but tentatively: "Likely cause:
   deploy at 15:00 UTC yesterday (commit X) — verify by comparing
   pre/post cohorts." Never state causes as certain.

8. **Write the anomaly record** to `anomalies.json` (atomic):

   ```ts
   { id, metricId, detectedAt, date, baseline: mean7, observed,
     deviationSigma: sigma7, direction: "up"|"down", severity,
     possibleCauses: [...], status: "open", createdAt, updatedAt }
   ```

9. **Report.** In chat, list P1 anomalies first — each with its top
   hypothesis and the one question that would confirm or rule it
   out. For P2/P3, one line each.

## Outputs

- Appended / updated `anomalies.json`

## What I never do

- **Hardcode a threshold** — they live in `config/metrics.json`
  per-metric or use the documented default. If the user wants a
  global override, capture it in config.
- **State a cause as certain.** "Likely" / "possible" only;
  confirmation lives in a follow-up query the user can run.
- **Trigger downstream side effects** — I flag; the user decides
  whether to dig in.
