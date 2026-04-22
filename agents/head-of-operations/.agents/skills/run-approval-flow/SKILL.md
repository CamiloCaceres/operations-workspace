---
name: run-approval-flow
description: Use when the user says "review this inbound" / "score this {vendor / partnership / advisor / press} application against our criteria" — rubric-based triage for inbound submissions. Produces a scored recommendation (approve / decline / more-info) with evidence per criterion.
---

# Run Approval Flow

Generic approval-rubric runner for any inbound type that needs a
founder decision. For vendor-specific supplier triaging use the
Vendor agent's `evaluate-supplier` skill — it has procurement-specific
criteria and writes to a different folder.

## When to use

- "review this vendor application against our criteria" (but
  supplier-specific evaluations go to Vendor agent's
  `evaluate-supplier`).
- "score these advisor candidates".
- "is this partnership a fit".
- "should I accept this press request".
- "run the approval flow on this".

## Steps

1. **Read `company-operating-context.md`.** The active priorities,
   hard nos, and founder-specific positions anchor every rubric
   evaluation. If missing: `define-operating-context` first, stop.

2. **Read `config/approval-rubrics.md`.** Map the inbound-type to
   a rubric. If the file is missing or has no matching rubric, ask
   the founder: "What criteria should I use? Paste them, or I can
   save a default rubric for {inbound-type} you can edit later."

   **Default rubrics** (used if the founder says "default"):

   - **vendor-app** (generic inbound vendor / seller reaching out):
     fit-to-priorities, size/stage-match, red-flags-search (public
     incidents), reference-check (Y/N), friction-to-try.
   - **advisor**: domain-authority, access (who they'd open),
     time-commitment, compensation-alignment.
   - **partnership**: mutual-audience, mutual-capability,
     asymmetric-upside (do they need us more than we need them),
     off-ramp-cost.
   - **press**: audience-fit, question-quality, founder-time-cost,
     reputational-upside.

3. **Gather evidence.**
   - Read the submission the founder pastes or links to.
   - `composio search research` → public signals on the
     submitter (website, recent activity, mentions).
   - `composio search inbox` → any prior correspondence with
     this person or domain.
   - If the submission references claims that are verifiable,
     verify them (e.g. "we raised a Series B last month" → quick
     news check).

4. **Score against the rubric.**
   - Each criterion: rating (1-5 or green/yellow/red — whatever
     the rubric specifies) + 1-2 lines of evidence. Cite evidence
     links.
   - Overall score: weighted sum if the rubric specifies weights;
     otherwise a rolled-up qualitative call.

5. **Produce a recommendation.**
   - **Approve** — fit + no red flags + evidence strong.
   - **Decline** — clear mismatch or red flags; state the top
     2 reasons.
   - **More info** — genuinely on the fence; list the 2-3 specific
     questions the founder should ask to break the tie.

6. **Write** to `approvals/{slug}.md` with:
   - Submission summary (1 paragraph).
   - Rubric + scoring table (criterion | rating | evidence).
   - Public-signal findings.
   - Prior-correspondence summary (if any).
   - Recommendation + 3-line rationale.
   - If "more info", the exact follow-up questions.

7. **Atomic writes** — `*.tmp` → rename.

8. **Append to `outputs.json`** with `type: "approval"`, status
   "draft" (only the founder marks it `ready` after deciding).

9. **Summarize to user** — the recommendation + the one most
   load-bearing line of evidence. Never "approve" without naming
   the #1 thing that would make the founder regret it.

## Outputs

- `approvals/{slug}.md`
- Appends to `outputs.json` with `type: "approval"`, status "draft".

## What I never do

- **Commit the decision.** I recommend; the founder approves/declines.
- **Send an acknowledgement or rejection email to the submitter.**
  That's `draft-reply`'s job after the founder decides.
- **Use a rubric that isn't stored.** If I'm asked to score
  without a rubric, I ask for one before scoring. Ad-hoc scoring
  is not reproducible.
