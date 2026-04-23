---
name: draft-investor-update
description: Use when a monthly or quarterly investor update is due (per `config/investor-cadence.json`) OR the user says "draft the investor update" / "write the monthly to investors" — assemble a CEO-voice narrative from OKR movement, decisions landed, and metric pulls (preferably via the Data Analyst agent); write to `investor-updates/{yyyy-qq}/update.md`. Never sends.
---

# Draft Investor Update

## When to use

- User says "draft the investor update" / "write the monthly to
  investors" / "our quarterly."
- `config/investor-cadence.json` → `nextUpdateDueAt` is within 5
  days.
- A significant milestone (funding round closed, major hire, launch,
  churn event) calls for an ad-hoc update.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. The operating
   context names the investors and the active priorities — those
   frame the narrative.

2. **Read `config/investor-cadence.json`.** If missing or
   incomplete, ask ONE question: *"Are investor updates monthly or
   quarterly — and when's the next due? Best: connect your calendar
   via Composio and I'll find the recurring slot. Or paste a
   date."* Write and continue.

3. **Read voice.** Read `config/voice.md` (or the voice block in
   the operating context — the Head of Operations' `onboard-me`
   typically populates that). If voice is missing or sparse, ask
   ONE targeted question: *"I need to match your voice. Best: if
   you've connected a work inbox via Composio, tell me and I'll
   pull 20–30 recent sent messages for calibration. Otherwise drop
   one past investor update and one team note you've written."*
   Write 3–5 verbatim samples to `config/voice.md` and continue.

4. **Determine the period.** Monthly → last full month. Quarterly
   → last full quarter. Use `yyyy-qq` slug form for the folder.

5. **Gather content sources:**
   - `okr-history.json` — latest snapshots vs period-start snapshots.
     Compute movement per objective.
   - `decisions.json` — decisions with `status: "decided"` within
     the period; these often anchor "what changed."
   - Data Analyst handoff for metrics: prefer
     `../data-analyst/rollups/` (latest within the period) or a
     specific `../data-analyst/queries/{slug}/result-latest.csv`
     for a named top-line metric. If no Data Analyst installed,
     ask the user to paste the numbers.
   - Head of Operations' recent `reviews/` for context on wins
     and challenges.

6. **Draft in CEO voice** at `investor-updates/{yyyy-qq}/update.md`
   (atomic write). Structure:

   ```markdown
   # {Company} — Investor update, {period}

   Hey all,

   **TL;DR:** {2-3 sentences — the shape of the month/quarter}

   ## Metrics
   {3-6 top-line metrics with period-over-period change. Cite the
   query slug or mark `{SOURCE: pasted}` per metric.}

   ## Wins
   {3-5 bullets — customer, product, hiring, fundraising}

   ## Challenges
   {2-3 bullets — honest, specific, with mitigation when possible}

   ## What I'm learning
   {1-2 paragraphs in your voice — this is the bit investors value
   most. Grounded in decisions.json entries and real observations,
   not platitudes.}

   ## Asks
   {specific intros / hiring help / feedback — concrete, not
   "anything you can do"}

   — {userName}
   ```

7. **Self-check against hard nos:**
   - Never invent a customer name or number — mark `{TBD — provide
     before sending}`.
   - Never commit to an external deadline ("we'll hit $X by Y")
     without explicit user approval on that specific line.
   - Never expose individual performance or named churn specifics
     — aggregate only.

8. **Flag for approval.** End the chat message with: *"Drafted at
   `investor-updates/{yyyy-qq}/update.md`. I will NOT send this —
   review and send from your own inbox."*

9. **Offer a tighter version.** "Want me to cut this to a one-
   pager?" — if yes, append a `## One-pager variant` section to
   the same file with a trimmed form.

10. **Append to `outputs.json`** with `type: "investor-update"`,
    status "draft" until the user confirms they sent.

## Outputs

- `investor-updates/{yyyy-qq}/update.md` (new or overwritten)
- Possibly updated `config/voice.md` (progressive capture)
- Possibly updated `config/investor-cadence.json` (progressive
  capture)
- Appends to `outputs.json` with `type: "investor-update"`.

## What I never do

- **Send** the update — drafts only, sent from the user's own
  inbox.
- **Invent** metrics, customer names, or quotes. Mark TBD.
- **Commit the company** to a public deadline or number without
  explicit approval on that line.
- **Expose sensitive matters** (named churn, performance, comp)
  in a shared draft — aggregate or generalize.
