# Data Analyst — Research MD

## Mission

Solo founder week 0. They have a product, some users, and numbers
they don't fully understand yet. They want to "see what's happening
in the business" — signups, retention, revenue, churn. They don't
have a BI engineer; they don't have time to hand-write the same SQL
query every Monday. The Data Analyst agent is the "show me what's
happening" hire — business metrics and experiments, not engineering
metrics.

## Sources reviewed

- `/role-agents-workspace/agents/houston-data-analyst/` — older
  deprecated Data Analyst agent. 9 skills (answer-question,
  track-metric, detect-anomaly, analyze-experiment,
  build-dashboard-spec, audit-data-quality, triage-ask,
  document-query, daily-standup) + onboard-me. Each SKILL.md read
  and adapted.
- `verticals-store/founder-marketing-workspace/agents/growth-paid/` —
  paid-marketing agent in the adjacent vertical. Owns
  `analyze-funnel` (paid funnel), `design-ab-test` (ad creative
  tests), `plan-paid-campaign`. I scoped the Data Analyst around
  this overlap.
- `verticals-store/operations-workspace/agents/head-of-operations/` —
  coordinator owning `run-weekly-review`. Data Analyst
  `weekly-metrics-rollup` feeds it.
- `verticals-store/AGENT-DESIGN-PHILOSOPHY.md` — rules and granularity
  test.

## Scope decision — distinct from growth-paid and engineering

**Growth-paid agent** already owns:
- `analyze-funnel` — paid funnel analysis.
- `design-ab-test` — ad creative A/B test design.
- `plan-paid-campaign` — paid-channel strategy.

**Data Analyst owns:**
- Product / business experiments (checkout, onboarding, retention,
  pricing) — NOT ad creative tests.
- Cross-product business metrics (signups, revenue, retention,
  cohorts, churn) — NOT paid funnel KPIs (those are growth-paid's).
- SQL answers to ad-hoc business questions.
- Warehouse + data-quality checks.
- Dashboard specs for the operator / exec view.

**Explicitly out of scope:** engineering metrics (DORA, PR
velocity, deploy frequency). Those belong in an engineering-
workspace agent (not built here).

If the user asks the Data Analyst to analyze an ad creative test,
it points at growth-paid. If they ask for PR velocity or deploy
cadence, it declines and tells them that's engineering territory.

## Skills kept (with rationale)

1. **`onboard-me`** (3 questions: data sources, 3-5 metrics,
   business-context line) — required shape. Topics picked so SQL
   + metrics + dashboard specs work on day one.
2. **`run-sql-query`** — renamed from source `answer-question`.
   The new name is more action-verb-forward and matches the
   "verb + noun" convention in operations-workspace. Same
   read-only + cost-warning + caveats contract.
3. **`track-metric`** — kept verbatim in shape. Thresholds
   (sigma) live in `config/metrics.json` per-metric; default 2σ
   is documented in `detect-anomaly` (not baked into track-metric).
4. **`detect-anomaly`** — kept verbatim. Dedup by metricId + date.
   Every cause hypothesis is "likely" — never stated as certain.
5. **`analyze-experiment`** — kept with scope note: product /
   business experiments only, not paid-ad creative tests. Same
   SHIP / KILL / ITERATE / INCONCLUSIVE-EXTEND recommendation
   shape. Never recommends SHIP without significance.
6. **`spec-dashboard`** — renamed from source
   `build-dashboard-spec`. Shorter, better matches the other verb
   names. Same spec-only-no-HTML contract.
7. **`run-data-qa`** — renamed from source `audit-data-quality`.
   Shorter. Same null / dupe / freshness / referential-integrity
   / cardinality checks.
8. **`weekly-metrics-rollup`** — **NEW** (not in source). Solo-
   founder-coherence: the Head of Operations' Monday review wants
   a data input; this is the handoff. Cross-metric weekly pulse
   aligned to operating-context priorities.

## Skills dropped (with rationale)

- **`triage-ask`** (source) — the source's `triage-ask` queues
  inbound data questions from connected channels (Slack /
  tickets). At solo-founder week 0, the founder IS the
  requester — they don't need a ticketing loop. Drop. If they
  ever grow into it, the concept is easy to add later.
- **`document-query`** (source) — source has a separate skill to
  promote an ad-hoc query to a library entry. `run-sql-query`
  already saves queries with purpose / tags / caveats via
  `queries.json` — the promotion step is ceremony the founder
  doesn't need. Drop.
- **`daily-standup`** (source) — overlaps with Head of Operations'
  `brief-me` and with Executive Assistant's `daily-briefing`.
  Adding a third "morning brief" per agent would confuse the
  founder. Drop — the Data Analyst surfaces anomalies via the
  dashboard and the weekly rollup; no need for a daily rundown.

## Thresholds captured in config (no hardcodes)

- **Cost ceiling** (scanned GB + wall-clock seconds) — in
  `config/data-sources.json` per source. Default `10 GB` /
  `30 seconds` is the *documented overridable default*; skills
  read the ceiling from config before deciding whether to warn.
- **Sigma threshold for anomalies** — `config/metrics.json` per
  metric. Default 2σ (yellow) / 3σ (red) documented in
  `detect-anomaly` — not baked into decision logic.
- **Experiment framework** — `config/experiments-framework.md`.
  Default 95% significance / 5% MDE documented as the "sensible
  defaults" the user can accept on first experiment analysis.
- **Expected staleness per table** —
  `config/schemas.json` per-table override; default 24h for daily
  tables.

## Coordinator read

Every non-`onboard-me` skill opens with:

> Read `../head-of-operations/company-operating-context.md`. If
> missing or empty, stop and ask the user to run Head of
> Operations' `define-operating-context` first.

Priorities + tools + voice come from there. Metrics tied to
priorities lead the weekly rollup.

## Build status

- ✅ CLAUDE.md (under 100 lines)
- ✅ houston.json (first tab `overview`; 7 useCases, each with all
  4 prompt fields)
- ✅ 7 skills + `onboard-me`
- ✅ data-schema.md
- ✅ README.md
- ✅ .gitignore
- ✅ icon.png (copied from head-of-operations)
