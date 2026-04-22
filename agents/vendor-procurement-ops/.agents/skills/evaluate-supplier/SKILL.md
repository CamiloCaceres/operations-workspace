---
name: evaluate-supplier
description: Use when the user says "evaluate {supplier}" / "score these vendors against our criteria" / "is {supplier} a fit" — rubric-based supplier due-diligence. Score 1-10, risk tier green/yellow/red, strengths, concerns, first-call questions, recommendation.
---

# Evaluate Supplier

Supplier due-diligence. Distinct from `run-approval-flow` on the
Head of Operations — this skill is procurement-specific (uses the
supplier rubric, writes to `suppliers/`, runs public signals focused
on commercial fit).

## When to use

- "evaluate {supplier} for {product / service}".
- "score these suppliers against our criteria".
- "is {vendor} a fit for {our use case}".
- Called from Head of Operations' `run-approval-flow` when the
  inbound is specifically a supplier application.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.**
   Vendor posture, hard nos, active priorities. If missing: stop,
   ask for `define-operating-context`.

2. **Read `config/supplier-rubric.md`.** If missing, use the default
   defined in `data-schema.md` (fit / quality-signals /
   reference-quality / risk-signals / friction-to-start).

3. **Read `config/procurement.json`** — risk appetite + signature
   authority anchor severity thresholds.

4. **Gather evidence.**
   - **The supplier's own surface** — `composio search web-scrape`
     → pull their website, pricing page, docs, case studies.
   - **Public profile** — founders, size/stage, notable customers,
     recent news. Use `composio search research` or `web-search`.
   - **Prior correspondence** — `composio search inbox` → search
     for the supplier name or domain in the founder's inbox.
   - **References you can triangulate** — public case studies with
     identifiable names; flag if any are in the Key Contacts of
     operating context.
   - **Compliance quick-check** — run `research-compliance` as a
     sub-step for any risk-sensitive supplier (data processors,
     infrastructure, financial services vendors).
   - **Pricing signal** — what's discoverable. If behind a sales
     gate, note it.

5. **Score against the rubric.** Per criterion:
   - Rating 1-5 (or the scale the rubric specifies).
   - 1-2 lines of evidence with source URLs.
   - Explicit `INSUFFICIENT-EVIDENCE` marker if the data isn't
     there — never guess.

   Compute the overall score (weighted sum per rubric) out of 10.

6. **Assign risk tier.**
   - **Green** — overall ≥ 8 AND no red flags on risk-signals
     criterion.
   - **Yellow** — overall 6-7.9 OR one material concern.
   - **Red** — overall < 6 OR any hard-no violation (data
     handling, compliance incident, obvious misrepresentation).

7. **Produce the output** (save to `suppliers/{supplier-slug}.md`):

   - **Summary** — 2 sentences: who they are + what they do.
   - **Rubric + scoring table** — criterion | rating | evidence
     (with URLs).
   - **Strengths** — 3 bullets, most-compelling first.
   - **Concerns** — 3 bullets, most-material first.
   - **Risk tier** — with the 1-line reason.
   - **Questions for first call** — 5-8 tight questions that would
     close the evidence gaps and/or expose hidden risk.
   - **Recommendation** — `Proceed` / `Pass` / `Get more info` with
     a 3-line rationale.
   - **Founder decision** — blank; the founder fills in.

8. **Atomic writes** — `*.tmp` → rename.

9. **Append to `outputs.json`** with `type: "supplier"`, status
   "draft" (only the founder marks `ready` after deciding).

10. **Summarize to user** — tier + overall score + the #1 thing
    the founder should resolve before deciding.

## Outputs

- `suppliers/{supplier-slug}.md`
- Appends to `outputs.json` with `type: "supplier"`, status "draft".

## What I never do

- **Contact the supplier.** The first-call questions are for the
  founder. Drafting outreach is a separate skill
  (`draft-vendor-outreach`).
- **Commit to a decision.** I recommend; the founder decides.
- **Score without a rubric.** If no rubric exists and the founder
  doesn't provide one, I use the default and name it in the
  output.
