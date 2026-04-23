---
name: onboard-me
description: Use when the user says "onboard me" / "set me up" / "let's get started", or on the first real task when no `config/profile.json` exists — open with a scope + modality preamble naming the three topics (investor cadence, OKR state, decision-rights shape) AND the best way to share each, then run a tight 90-second 3-question interview and write results to `config/`.
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
   > 1. **Your investor cadence** — monthly or quarterly updates?
   >    Next due date? Board meetings (if any) on what frequency?
   >    *Best: point me at your connected calendar via Composio and
   >    I'll find the recurring slot. Or paste a line.*
   > 2. **Your current OKRs** — objectives + key results for this
   >    period, if any. Fine if none yet.
   >    *Best: connect your OKR tool via Composio and I'll pull
   >    them. Or drop a file / paste the list. "No OKRs yet" is a
   >    valid answer — `track-okr` will help you draft a starter
   >    set when you're ready.*
   > 3. **Decision-rights shape** — who decides what? Even solo
   >    founders have co-founders, advisors, or investors with
   >    voting rights. A sentence is enough.
   >    *Best: drop a RACI doc or decision-rights page. Or paste a
   >    line — I'll expand as more decisions land.*
   >
   > For any of these you can also drop files or share public URLs.
   > Let's start with #1 — investor cadence?"

1. **Capture topic 1 (investor cadence).** Parse modality. If
   connected-calendar route, `composio search calendar` → pull
   recurring "Board" / "Investor update" events, extract cadence +
   next date. Otherwise parse paste. Write
   `config/investor-cadence.json` per the `InvestorCadence` shape
   in `data-schema.md`. If the user says "no board yet" set
   `board.frequency: "none"`.

2. **Capture topic 2 (OKRs).** If connected OKR tool: `composio
   search okr` → pull current objectives + KRs + current values.
   If file / paste: parse into the `OkrSet` shape. If "none yet":
   write an empty OkrSet with `period: null` and note TBD. Write
   `config/okrs.json`.

3. **Capture topic 3 (decision rights).** Write the user's line
   (or the RACI content) into `config/decision-framework.md`
   verbatim under a "Who decides what" heading. Leave space for
   "Pending CEO decisions" and "Delegated decisions" — those grow
   via `log-decision` progressive capture.

4. **Write `config/profile.json`** with `{ userName, onboardedAt,
   status: "onboarded" | "partial" }`.

5. **Atomic writes.** Every file written as `{path}.tmp` then
   renamed. Never partial JSON.

6. **Hand off:** "Ready. Try: `Log the decision: we decided {X}` —
   or if you have a board meeting coming up, `Prep the Q{N} board
   pack`."

## Outputs

- `config/profile.json`
- `config/investor-cadence.json`
- `config/okrs.json`
- `config/decision-framework.md`

(No entry appended to `outputs.json` — onboarding is setup, not a
deliverable.)
