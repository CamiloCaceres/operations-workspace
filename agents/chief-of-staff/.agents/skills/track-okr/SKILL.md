---
name: track-okr
description: Use when the user asks about OKR status ("how are we doing on OKRs" / "refresh the OKRs" / "which KRs are off-track") OR on a weekly / quarterly cadence — refresh each KR's current value (prefer any Composio-connected OKR tool; fallback to Data Analyst handoff; last-resort ask the user to paste), append snapshots to `okr-history.json`, classify on-track / at-risk / off-track, surface root causes from linked decisions and operating-context priorities.
---

# Track OKR

## When to use

- User asks about OKR status, wants a refresh, or asks "what's
  off-track."
- Weekly / quarterly cadence — if the last snapshot in
  `okr-history.json` is older than 10 days.
- Start of a new quarter — rebaseline.
- Pulled implicitly by `prep-board-pack` and `draft-investor-update`
  when the latest snapshot is stale.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. Active priorities
   drive the "likely root cause" attribution for off-track KRs.

2. **Read `config/okrs.json`.** If missing or empty, ask ONE
   targeted question: *"I don't have your OKRs yet — best: if your
   OKR tool is connected via Composio, point me at it and I'll
   pull the current state. Otherwise paste or drop the OKR doc.
   If you don't have OKRs yet, that's fine — say so and I'll help
   you draft a starter set."* Write and continue.

3. **For each objective, refresh each KR's current value.** In
   order of preference:
   - **Connected OKR tool via Composio** — `composio search okr`
     (or the category the user named during onboarding). Pull the
     latest `current` per KR.
   - **Data Analyst handoff** — if a KR maps to a tracked metric
     in the Data Analyst agent, cite the query slug and read the
     latest value from `../data-analyst/metrics-daily.json`. This
     keeps the numbers consistent across agents.
   - **Ask the owner** — if neither is available, tell the user
     which owners to ping and stop short of inventing numbers.

4. **Snapshot to `okr-history.json`.** Append one record per
   objective (or per-KR if owner updates were KR-scoped) with
   `{ objectiveId, date, keyResults: [{ id, value, state }], state,
   createdAt }`. Date is today (YYYY-MM-DD).

5. **Classify each KR against its target.** Pull the expected
   attainment curve from the KR record (`linear` default unless
   the user declared front-/back-loaded during onboarding or a
   prior refresh). For today's point in the period:
   - `on-track` — `current / target` ≥ `expected-for-this-point`.
   - `at-risk` — within 20 percentage points of expected but below.
   - `off-track` — more than 20 percentage points below expected.

   The 20-pp threshold is the documented default; user can override
   it per-KR in `config/okrs.json`.

6. **Roll KR states up to objective state.** If any KR is
   `off-track`, objective is `off-track`. If any is `at-risk` and
   none `off-track`, objective is `at-risk`. Otherwise `on-track`.
   Update `config/okrs.json` with the new state + fresh `current`
   values.

7. **Attach reason codes from linked decisions.** For each at-risk
   / off-track KR:
   - Scan `decisions.json` for decisions where
     `linkedInitiativeSlugs` includes the same slug the KR references
     (if any) — a recent pending decision on a linked initiative is
     a likely cause.
   - Check operating-context priorities — if the KR is tied to an
     inactive priority, surface that.
   - Record the reason in the KR's `reason` field in
     `config/okrs.json`.

8. **Report in chat.**

   ```
   OKR refresh — {YYYY-MM-DD}

   On-track: {N}  |  At-risk: {N}  |  Off-track: {N}

   Off-track:
   - {objective} — {KR}: {current}/{target} {unit} ({% attained}).
     Likely cause: {linked decision slug or priority note}.

   At-risk:
   - ...

   (Full history in `okr-history.json`.)
   ```

9. **Hand-off hint.** If anything flipped to off-track this cycle,
   offer: "Want me to run `identify-bottleneck` to see if this
   pattern is cross-OKR? Or hand the off-track KR to Head of
   Operations to nudge the owner?"

10. **Append to `outputs.json`** with `type: "okr-snapshot"`,
    status "ready".

## Outputs

- Appended `okr-history.json`
- Updated `config/okrs.json` (fresh current values + state per
  objective + per-KR reason for at-risk / off-track)
- Appends to `outputs.json` with `type: "okr-snapshot"`.

## What I never do

- **Invent a KR value** — if no source is available, I stop and
  tell the user which owners to ping.
- **Hardcode the at-risk threshold** — 20-pp is the documented
  default; per-KR overrides live in `config/okrs.json`.
- **Modify OKR definitions silently** — if the user adds a new
  objective via chat, I confirm the shape before writing.
