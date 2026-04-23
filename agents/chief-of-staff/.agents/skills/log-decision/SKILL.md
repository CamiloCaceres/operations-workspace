---
name: log-decision
description: Use when the user says "we decided {X}" / "log the decision on {Y}" / "capture the call we just made" OR a clear decision pattern appears in pasted meeting notes ("we're going with X over Y because Z") — write an ADR-style record with context, alternatives, trade-offs, decision, rationale, consequences, and links to related initiatives. Creates `decisions/{slug}/decision.md` and appends to `decisions.json`.
---

# Log Decision

## When to use

- User says "we decided", "log the decision on", "capture that
  call", "ADR this".
- Pasted / connected meeting notes contain a clear decision pattern.
- User asks to review the open decision backlog — this skill also
  marks `pending` rows as `decided` when the user declares them.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. Active priorities
   anchor whether a decision is load-bearing.

2. **Resolve the subject.** From chat, extract the decision topic
   and propose a kebab-case slug (e.g.
   `switch-pricing-to-seat-based`). Confirm briefly if ambiguous.

3. **Read `config/decision-framework.md`.** If missing or sparse,
   ask ONE question: *"Who decides pricing / product strategy /
   hiring / structural bets? Best: drop a RACI doc or
   decision-rights page from a connected wiki. Otherwise paste a
   sentence — I'll expand as more decisions land."* Write and
   continue.

4. **Decide `status`.** Based on the framework:
   - If the CEO is the decider and hasn't decided yet → `pending`.
   - If the decision is owner-scoped and the owner declared it →
     `decided` with `decidedBy` and `decidedAt`.
   - If the user is the CEO and declared it → `decided`.

5. **Check for duplicates.** Scan `decisions.json` for an existing
   slug or near-duplicate title. If one exists, update in place
   (append alternatives to `considered`, refine `rationale`, move
   `pending` → `decided` with `decidedAt`) rather than creating a
   new row.

6. **Write the ADR** at `decisions/{slug}/decision.md` (atomic):

   ```markdown
   # Decision: {title}

   - **Status:** {pending | decided | superseded}
   - **Decided by:** {who, if decided}
   - **Decided at:** {ISO-8601, if decided}
   - **Linked initiatives:** {slugs}

   ## Context
   {1-2 paragraphs — what prompted this, what's at stake}

   ## Alternatives considered
   1. **{Option A}** — {short description}. Trade-offs: {...}.
   2. **{Option B}** — {short description}. Trade-offs: {...}.
   3. **{Option C / status quo if relevant}** — {...}.

   ## Decision
   {the chosen path, 1 paragraph}

   ## Rationale
   {why this one over the alternatives — short, honest}

   ## Consequences
   - **Good:** {what becomes easier}
   - **Hard:** {what becomes harder}
   - **Unknowns:** {what we'll learn over time}

   ## Open questions
   {anything still TBD}
   ```

7. **Upsert in `decisions.json`** with `{ slug, title, summary,
   status, decidedBy?, decidedAt?, linkedInitiativeSlugs,
   considered, rationale? }`. Keep `summary` to one line — it shows
   in the dashboard.

8. **Sensitive matters.** If the decision touches performance,
   compensation, exits, or legal, DO NOT land specifics in the
   indexed `summary`. Generalize ("Exec transition on {domain}"
   rather than named), keep the full narrative only in the
   per-decision markdown file, and flag privately to the founder
   in chat.

9. **Append to `outputs.json`** with `type: "decision"`, status
   "ready" (a decision is an artifact of record).

10. **Summarize in chat.** One sentence: what was logged, status,
    where it lives.

## Outputs

- `decisions/{slug}/decision.md` (new or overwritten)
- Upserted `decisions.json`
- Possibly updated `config/decision-framework.md` (progressive
  capture)
- Appends to `outputs.json` with `type: "decision"`.

## What I never do

- **Decide for you** — `log-decision` captures; the CEO decides.
- **Land sensitive specifics** in shared indexed rows.
- **Overwrite a superseded decision** silently — mark old
  `status: "superseded"` and link the new one.
- **Invent alternatives** — if the user only told me the chosen
  path, I ask one question for the 1-2 realistic alternatives
  that were on the table.
