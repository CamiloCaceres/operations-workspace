---
name: research-compliance
description: Use when the user says "compliance check on {company}" / "is {vendor} clean" / "run compliance due-diligence" — public-source compliance research on a company: frameworks held, named officers, recent incidents. Every claim cited.
---

# Research Compliance

Public-source only. This is due-diligence before the founder signs —
not a legal opinion, not a replacement for a SOC2 report request.

## When to use

- "run compliance due-diligence on {vendor}".
- "is {company}'s compliance posture real".
- "what frameworks does {vendor} actually hold".
- Called as a sub-step of `evaluate-supplier` for risk-sensitive
  suppliers (data processors, infra, financial services).

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.**
   Hard nos + vendor posture anchor the "what's a material red flag"
   judgement. If missing: stop, ask for `define-operating-context`.

2. **Gather public signals.**

   - **Frameworks claimed on their surface** — `composio search
     web-scrape` → pull their trust page, security page, privacy
     page. Catalog what they claim (SOC2 Type II, ISO 27001,
     HIPAA, GDPR, PCI-DSS, etc.).
   - **Independent verification** — for each claim, try to
     triangulate: does a trust-center provider (TrustArc, Vanta,
     Drata) confirm? Does a press release name a specific auditor?
     Does the Report ID or Trust portal exist? Use `composio
     search research` with specific queries.
   - **Named CCO / CISO / Head-of-Security** — identify the
     person, link their LinkedIn if findable (`composio search
     social` or `web-search`).
   - **Public incidents in the last 3 years** — breaches, SEC
     disclosures, class actions, regulatory actions (FTC, ICO,
     state AGs). Use `composio search news` + `web-search` with
     pointed queries.
   - **Legal / regulatory posture** — any open litigation naming
     the company as defendant? Any SEC filings if public?

3. **Check for gaps between claim and evidence.**
   - Claim a SOC2 but no independent confirmation anywhere →
     flag.
   - Named officer but no LinkedIn / no public presence → flag.
   - Silence on a framework their category usually requires
     (e.g. a healthcare SaaS with no HIPAA mention) → flag.

4. **Produce the output** (save to `compliance/{company-slug}.md`):

   - **Summary** — 1 paragraph: who they are + compliance posture
     in one line.
   - **Frameworks claimed** — table: framework | claim source |
     independent verification (Y/N with URL) | notes.
   - **Named security leadership** — name, title, LinkedIn,
     tenure if findable.
   - **Public incidents (last 3 years)** — chronological list,
     each with source URL + 1-line description.
   - **Gaps between claim and evidence** — bullet list, most
     material first.
   - **Recommendation-shaped summary** — NOT a legal opinion: "on
     public surface this reads as {strong / adequate / thin /
     concerning}" with the 2-3 specific things to verify before
     signing.
   - **Every claim cites a source URL.** No uncited assertions.

5. **Atomic writes** — `*.tmp` → rename.

6. **Append to `outputs.json`** with `type: "compliance"`, status
   "ready".

7. **Summarize to user** — the recommendation-shaped summary + the
   #1 gap the founder should close before signing.

## Outputs

- `compliance/{company-slug}.md`
- Appends to `outputs.json` with `type: "compliance"`.

## What I never do

- **Render a legal opinion.** "Looks adequate on public surface" is
  as strong as I go. Legal review is the founder's lawyer's job.
- **Contact the vendor.** Public signals only.
- **Treat a trust-page claim as proof.** Every framework claim
  needs at least one independent signal, or it's flagged.
- **Retrieve non-public data.** If behind a login, trust portal
  with NDA, or specific request, note it as "request from vendor"
  rather than trying to extract.
