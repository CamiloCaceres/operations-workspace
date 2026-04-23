---
name: onboard-me
description: Use when the user says "onboard me" / "set me up" / "let's get started", or on the first real task when no `config/profile.json` exists — open with a scope + modality preamble naming the three topics (data sources, core metrics, business context) AND the best way to share each, then run a tight 90-second 3-question interview and write results to `config/`.
---

# Onboard Me

## When to use

First-run setup. Triggered by:

- "onboard me" / "set me up" / "let's get started".
- The user opens the pre-seeded "Onboard me" activity card and sends
  any short message — when `config/profile.json` is missing, treat
  any short opener as a signal to run me.
- About-to-do-real-work and `config/profile.json` is missing.

Only run ONCE unless the user explicitly re-invokes.

## Principles

- **Lead with a scope + modality preamble.** Name the three topics
  AND the easiest way to share each BEFORE the first question.
- **3 questions is the ceiling, not the target.**
- **One question at a time after the preamble.**
- **Rank modalities:** connected app via Composio > file/URL > paste.
- **Anything skipped** → note "TBD" and ask again just-in-time later.

## Steps

0. **Scope + modality preamble — the FIRST message, then roll into Q1:**

   > "Let's get you set up — 3 quick questions, about 90 seconds.
   > Here's what I need and the easiest way to share each:
   >
   > 1. **Where your data lives** — warehouse (Snowflake / BigQuery
   >    / Redshift / Databricks / Postgres), product DB, billing.
   >    *Best: connect your warehouse via Composio (Integrations tab)
   >    and tell me the name. Or describe it briefly.*
   > 2. **3–5 metrics you already care about** — the ones you'd
   >    want on a dashboard tomorrow (e.g. MRR, WAU, signup
   >    conversion, churn).
   >    *Best: paste a short list. I'll translate to SQL as we go.*
   > 3. **One line of business context** — what the business does,
   >    stage, who uses it. Helps me interpret the numbers.
   >    *Best: paste a line, or point me at your about page.*
   >
   > For any of these you can also drop files or share public URLs.
   > Let's start with #1 — where does your data live?"

1. **Capture topic 1 (data sources).** Based on modality:
   - Connected warehouse: run `composio search warehouse` to
     discover the provider slug; record `kind: "warehouse"`,
     `dialect`, `connectionCategory`. Set default `costCeilingScannedGb:
     10` and `costCeilingSeconds: 30` (overridable).
   - Paste: parse the name into a `DataSource` record.
   - Multi-source: write one `DataSource` per source.
   Write `config/data-sources.json` (array of `DataSource`).

2. **Capture topic 2 (core metrics).** For each metric name the
   user lists, create a placeholder `Metric` record with `slug`,
   `name`, and empty `sqlSnippet` + `definition`. Mark
   `cadence: "daily"` default, `direction: "higher-is-better"`
   default (overridable via `track-metric` or progressive capture).
   Write `config/metrics.json`. Tell the user these are placeholders
   — `track-metric` will build the real SQL on first run per metric.

3. **Capture topic 3 (business context).** Write the user's line
   verbatim into `config/business-context.md` under a "What this
   business does" heading. Leave space for "How metrics map to the
   journey" and "Known caveats" — those fill in progressively.

4. **Write `config/profile.json`** with `{ userName, onboardedAt,
   status: "onboarded" | "partial" }`.

5. **Atomic writes.** Every file written as `{path}.tmp` then
   renamed. Never partial JSON.

6. **Hand off:** "Ready. Try: `Start tracking {metric-name}` to
   build the first SQL, or ask me a data question — `How many
   signups this week?`"

## Outputs

- `config/profile.json`
- `config/data-sources.json`
- `config/metrics.json` (placeholder entries)
- `config/business-context.md`

(No entry appended to `outputs.json` — onboarding is setup, not a
deliverable.)
