---
name: identify-bottleneck
description: Use when a rollup shows a recurring theme OR the user asks "what's stuck" / "what's blocking progress" / "where are we losing time" — cluster evidence from recent reviews, pending decisions, and off-track OKRs into named bottlenecks with a hypothesis and a proposed owner to unblock. Appends to `bottlenecks.json`.
---

# Identify Bottleneck

## When to use

- User asks "what's stuck," "what's blocking progress," "why aren't
  we moving on X."
- The most recent weekly review (from Head of Operations) repeats a
  risk or ask from the prior one.
- An OKR flipped to off-track and a linked initiative also slipped.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. Priorities and
   key-contacts anchor the "proposed owner to unblock" logic.

2. **Gather evidence from the last 4 weeks** (handle each source as
   "if present, use it; if missing, continue"):
   - `../head-of-operations/reviews/` — last 4 weekly review files.
     Look for repeating risks / asks.
   - `../head-of-operations/triage/` — the last 4 inbox-triage
     files. Recurring "can-wait" threads from the same person can
     hint at a delegation bottleneck.
   - `decisions.json` — any decision with `status: "pending"` older
     than 14 days → decision-latency bottleneck.
   - `okr-history.json` — any KR `off-track` across two or more
     consecutive snapshots → bottleneck candidate tied to the
     linked initiative.
   - Data Analyst `../data-analyst/anomalies.json` — repeating open
     anomalies can hint at a data-or-process bottleneck.

3. **Cluster recurring themes.** Group evidence by shared owner,
   shared cross-team dependency, or shared OKR. The bottleneck is
   the cluster — not an individual incident.

4. **For each cluster, form a hypothesis** (1-2 sentences, never
   stated as certain):
   - "Hiring in engineering is bottlenecked on the founder's
     interview calendar — 3 initiatives are waiting on the same
     reviewer."
   - "Pricing changes are blocked on a pending decision from the
     week of {date} — 2 launches are staged behind it."
   - "Cross-agent data pulls are duplicating work — both the
     board pack and the investor update are asking for the same
     retention query."

5. **Propose an owner to unblock.** Read the leadership / key
   contacts section of the operating context. For cross-team
   bottlenecks, the owner is whoever owns the blocking resource
   (e.g. CTO for engineering-calendar constraint), not the
   downstream exec. For a solo founder, the owner is the founder —
   and the proposed unblock is usually "carve time for {X}" or
   "delegate {Y}".

6. **Quantify impact.** List `impactOnOkrIds` (objectives blocked)
   and `impactOnInitiativeSlugs` (initiatives stalled). Keep
   citations tight — evidence strings reference real paths (review
   files, decision slugs, anomaly ids).

7. **Dedupe against open bottlenecks.** Read `bottlenecks.json`.
   If a cluster matches an existing open row (same proposed owner
   + overlapping impact set), update in place (add new evidence,
   refine hypothesis, refresh `updatedAt`). Do NOT create a
   duplicate.

8. **Sensitive-matter routing.** If a hypothesis names a specific
   person as the bottleneck (performance / capacity), do NOT land
   that language in `bottlenecks.json`. Generalize to
   role-and-process language ("engineering interview capacity")
   in the index row. Flag the specifics to the CEO in chat only.

9. **Write new / updated bottlenecks** to `bottlenecks.json`
   (atomic). Each row: `{ slug, title, hypothesis, proposedOwner,
   impactOnOkrIds, impactOnInitiativeSlugs, status: "open",
   evidence, createdAt, updatedAt }`.

10. **Append to `outputs.json`** with `type: "bottleneck"`,
    status "ready" per new row.

11. **Hand off in chat.**

    ```
    {N} bottleneck(s) identified.

    1. **{title}** — proposed owner: {owner}.
       Hypothesis: {hypothesis}
       Blocks: {N} OKR(s), {M} initiative(s).
       Evidence: {citations}

    2. ...

    Want me to draft a nudge to {proposed owner} for #1?
    (I'd hand that off to Head of Operations' `draft-reply`.)
    ```

## Outputs

- Appended / updated `bottlenecks.json`
- Appends to `outputs.json` with `type: "bottleneck"` per new row.

## What I never do

- **Name a person as the bottleneck** in indexed JSON — generalize
  to role/process, flag specifics privately.
- **State a hypothesis as certain** — "likely" / "pattern suggests"
  only.
- **Draft the nudge message here** — that hands off to Head of
  Operations' `draft-reply` (inbox voice-matched drafts).
