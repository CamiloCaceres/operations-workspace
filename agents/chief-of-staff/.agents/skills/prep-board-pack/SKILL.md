---
name: prep-board-pack
description: Use when a board meeting is 2+ weeks out (per `config/investor-cadence.json`) OR the user says "prep the Q{N} board pack" / "build the {yyyy-qq} board pack" — assemble the standard 8 sections (TL;DR, business update, metrics, OKRs, wins, challenges, asks, appendix) from available sources into `board-packs/{yyyy-qq}/board-pack.md`. Flag every TBD.
---

# Prep Board Pack

## When to use

- The user asks to prep, build, or draft the board pack for a named
  quarter.
- `config/investor-cadence.json` → `board.nextAt` is within 21 days
  and no current `board-packs/{yyyy-qq}/board-pack.md` exists (or
  the existing one is older than 14 days).

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. The board hears
   about priorities from this doc.

2. **Resolve the target quarter.** From chat ("Q2 2026") or from
   `config/investor-cadence.json` → `board.nextAt`. Use `yyyy-qq`
   slug (e.g. `2026-Q2`).

3. **Read OKR state.** Read `config/okrs.json` and the latest
   `okr-history.json` snapshots within the quarter. If the latest
   snapshot is older than 10 days, run `track-okr` first (or tell
   the user to).

4. **Gather wins and challenges.** Sources, in order of preference:
   - Head of Operations' recent weekly reviews at
     `../head-of-operations/reviews/` — read the last 6-12 files
     within the quarter. Extract wins, risks, asks.
   - `decisions.json` — decisions with status `decided` since the
     prior board meeting = wins (clarity shipped).
   - Data Analyst rollups at `../data-analyst/rollups/` — weekly
     metrics pulses within the quarter.
   - If nothing available: ask the user to paste the wins and
     challenges for the period, and mark the section
     `{SOURCE: pasted by {user}}`.

5. **Pull metrics.** Preferred path: hand off to the Data Analyst
   agent's `run-sql-query` or `weekly-metrics-rollup` — cite the
   saved query slug (e.g. `queries/mrr-quarterly/query.sql`) rather
   than re-building SQL here. If no Data Analyst is installed,
   ask the user to paste the numbers and mark the section
   `{SOURCE: pasted by {user}}`. Never invent a metric.

6. **Draft the pack** at `board-packs/{yyyy-qq}/board-pack.md`
   (atomic write). Standard sections:

   ```markdown
   # Board pack — {yyyy-qq}

   ## 1. TL;DR (1 page)
   - {biggest win}
   - {biggest challenge}
   - {biggest ask of the board}

   ## 2. Business update
   {2-3 paragraphs in CEO voice — reads `config/voice.md` or the
   voice block from operating context}

   ## 3. Metrics
   | Metric | Last Q | This Q | Change | Source |
   | ... | ... | ... | ... | {query slug or "pasted"} |

   ## 4. OKRs
   {on-track / at-risk / off-track tally + per-objective narrative}

   ## 5. Wins
   {bulleted, grouped by domain/priority}

   ## 6. Challenges
   {bulleted, honest, with mitigation ask where helpful}

   ## 7. Asks of the board
   {intros, hiring help, strategic input}

   ## 8. Appendix
   {links to raw data, OKR tracker, recent rollups}
   ```

7. **Flag every `{TBD}`.** After drafting, scan the file. For each
   TBD, list it in the chat summary with what's needed and the
   best modality to get it (e.g. "Section 3 metric 'retention
   cohorts' — best path: ask the Data Analyst to
   `run-sql-query: 30-day retention by cohort`").

8. **Sensitive matters.** If any section would reference
   individual performance, compensation, or exit specifics, keep
   the specifics OUT of the shared doc and flag them to the CEO in
   chat privately.

9. **Atomic write** — `*.tmp` → rename.

10. **Append to `outputs.json`** with `type: "board-pack"`,
    status "draft". Readiness grows as TBDs fill in; re-run this
    skill (or ask me to update section X) to refresh.

11. **Summarize in chat.** One paragraph: sections filled, open
    TBDs, suggested next action ("ask the Data Analyst for {query}
    next").

## Outputs

- `board-packs/{yyyy-qq}/board-pack.md` (new or overwritten)
- Appends to `outputs.json` with `type: "board-pack"`.

## What I never do

- **Invent** a metric, customer, or win.
- **Include sensitive people specifics** in the shared doc — those
  go to the CEO privately.
- **Send or share** the pack — it's a draft for the CEO to distribute
  themselves.
- **Re-compute SQL** when the Data Analyst can hand me a cited
  query instead.
