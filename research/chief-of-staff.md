# Chief of Staff — Research MD

## Mission

Solo founder week 0. Most will tell you "a CoS is a Series-A+
hire." That's true for the person. But the work a CoS does — board
prep, investor updates, decision logs, OKRs, bottleneck hunts —
starts on day one. Founders without a CoS do it badly, late, or
not at all. This agent is intentionally LEAN (5 skills + onboard)
so founders grow into it rather than being overwhelmed.

## Sources reviewed

- `/role-agents-workspace/agents/houston-chief-of-staff/` — older
  deprecated CoS agent. 10 skills (status-rollup,
  prep-exec-meeting, track-okr, prep-board-pack,
  draft-investor-update, log-decision, identify-bottleneck,
  draft-comms, daily-standup) + onboard-me. Each SKILL.md read
  and adapted.
- `verticals-store/operations-workspace/agents/head-of-operations/` —
  coordinator with overlapping-ish skills (`run-weekly-review`,
  `brief-me`, `draft-reply`, `run-approval-flow`). I scoped CoS
  around this aggressively.
- `verticals-store/AGENT-DESIGN-PHILOSOPHY.md` — rules.
- `verticals-store/operations-workspace/TEAM-GUIDE.md` — notes the
  original workspace deliberately merged CoS + EA into Head of
  Operations. This agent carves CoS-specific work (board, investor,
  decisions, OKR) back out without re-absorbing rhythm / inbox /
  brief work.

## Scope decision — distinct from Head of Operations

**Head of Operations owns** (and CoS does NOT touch):
- `brief-me` — daily / brain-dump brief.
- `triage-inbox` / `draft-reply` — inbox ops.
- `prep-meeting` — meeting agenda helper.
- `collect-updates` — team-update collection loop.
- `run-weekly-review` — cross-agent Monday rollup (reads CoS
  `outputs.json`).
- `run-approval-flow` — generic rubric-runner for inbound
  applications.
- `synthesize-signal` — news / research briefing.

**Chief of Staff owns** (distinct, not touched by HoO):
- Board packs.
- Investor updates.
- Decision logs (ADRs).
- Bottleneck identification (cross-week pattern detection from
  HoO's reviews).
- OKR state tracking.

The scopes are clean: HoO = weekly rhythm + daily flow + inbox;
CoS = board/investor/strategic artifacts. A founder with both
installed can chat with HoO for "what's on today" and with CoS
for "prep the board pack" without either agent stepping on the
other.

## Skills kept (with rationale)

1. **`onboard-me`** (3 questions: investor cadence, OKR state,
   decision-rights shape) — required shape. Topics picked so
   board-pack, investor-update, log-decision, and track-okr can
   operate on day one.
2. **`prep-board-pack`** — kept verbatim in shape. 8 standard
   sections; flag every `{TBD}`. Pulls metrics via Data Analyst
   handoff when available (cite the query slug).
3. **`draft-investor-update`** — kept verbatim. Voice-matched CEO
   narrative. Never sends. Marks `{TBD}` for missing metrics.
4. **`log-decision`** — kept verbatim in shape. ADR with
   alternatives, rationale, consequences. Sensitive matters
   generalized in `decisions.json` index; full narrative only in
   the per-decision markdown.
5. **`identify-bottleneck`** — kept verbatim in shape. Cluster-
   based; proposed owner comes from operating-context key-contacts.
   Named-person sensitivities generalized in the index.
6. **`track-okr`** — kept verbatim. Preference order: connected
   OKR tool → Data Analyst handoff for metric-mapped KRs → ask
   owner. 20-pp at-risk threshold is the *documented overridable
   default*.

## Skills dropped (with rationale)

- **`status-rollup`** (source) — the source's status-rollup reads
  `initiatives.json` and synthesizes per-domain wins / risks /
  asks. HoO's `run-weekly-review` already does the cross-agent
  aggregation in the operations workspace. Having both would
  duplicate work and split founder attention. Drop.
- **`prep-exec-meeting`** (source) — the source assumes a
  leadership team exists. At solo-founder week 0, there IS no
  exec team. Skill is dormant for the target user and adds
  clutter to the Overview dashboard. Drop; if the user grows into
  needing it, a future iteration can re-add with `leadership-
  team.json` as the trigger.
- **`draft-comms`** (source) — overlaps with HoO's `draft-reply`
  for inbox comms. Source's draft-comms also covers all-hands /
  sensitive people comms / external correspondence — but at solo-
  founder stage, "all-hands" is the founder tweeting and
  "sensitive people comms" is the founder talking to their
  co-founder. Over-engineered for the target user. Drop.
- **`daily-standup`** (source) — overlaps with HoO's `brief-me`
  and EA's `daily-briefing`. A third daily brief would confuse
  the founder. Drop.

## Scope coherence — why NOT 10 skills

The source CoS is Series-A+ shaped. For week 0 we deliberately
ship 5 core skills so the founder isn't overwhelmed. The 5 cover
100% of the "decisions I'll need to explain later" and "the two
external artifacts that matter most (board pack + investor
update)." Everything else is growing-into-it territory.

Per AGENT-DESIGN-PHILOSOPHY section 14: "Fewer, sharper skills
beat a broad catalog. Target 5–10 skills per agent."

## Thresholds captured in config (no hardcodes)

- **OKR at-risk threshold** — 20 pp below expected is the
  *documented default*. Per-KR override lives in
  `config/okrs.json`. Never hardcoded in decision logic.
- **Pending-decision-latency bottleneck** — 14 days is the
  *documented default* for "a pending decision is a bottleneck."
  Can be overridden via `config/decision-framework.md` if a
  founder wants stricter/looser.
- **Board pack freshness** — `board-packs/{yyyy-qq}/board-pack.md`
  is considered stale after 14 days; skill re-runs if asked.
  Again documented, not hardcoded.
- **Investor-update lead time** — 5 days before
  `nextUpdateDueAt` is the *default* window to surface the draft.
  Read from `config/investor-cadence.json`.

## Coordinator read

Every non-`onboard-me` skill opens with:

> Read `../head-of-operations/company-operating-context.md`. If
> missing or empty, stop and ask the user to run Head of
> Operations' `define-operating-context` first.

Also reads defensively (but never writes):
- `../head-of-operations/reviews/` — evidence for
  `identify-bottleneck`.
- `../data-analyst/rollups/`,
  `../data-analyst/metrics-daily.json`,
  `../data-analyst/queries/{slug}/` — metrics for
  `prep-board-pack` and `draft-investor-update`. Prefer Data
  Analyst handoffs over re-computing SQL.

If a sibling agent isn't installed, skills handle missing
gracefully (fall back to asking the user to paste, mark
`{TBD}`, continue).

## Build status

- ✅ CLAUDE.md (under 100 lines)
- ✅ houston.json (first tab `overview`; 5 useCases with all 4
  prompt fields)
- ✅ 5 skills + `onboard-me`
- ✅ data-schema.md
- ✅ README.md
- ✅ .gitignore
- ✅ icon.png (copied from head-of-operations)
