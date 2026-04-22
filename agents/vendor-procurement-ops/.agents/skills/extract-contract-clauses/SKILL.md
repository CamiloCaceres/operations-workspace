---
name: extract-contract-clauses
description: Use when the user says "pull the {clauses} from this contract" / "what's the auto-renew language in every contract in this folder" — parses a contract (or many), extracts standard clauses with verbatim quotes + plain-language summaries + flags on unfavorable terms. Also updates the renewal calendar.
---

# Extract Contract Clauses

## When to use

- "pull the {clause} from this contract" (single doc).
- "what are the auto-renew terms in every contract in this folder"
  (batch).
- "extract the liability cap and termination language from {vendor}'s
  MSA".

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing: stop and ask the user to run Head of Operations'
   `define-operating-context` first. Vendor posture + hard nos
   anchor the "unfavorable terms" flags.

2. **Read `config/procurement.json`** — approval posture matters for
   which terms count as "flag worthy" (conservative founder flags
   more; fast-risk founder flags only the truly egregious).

3. **Identify the target contract(s).**
   - Single file: user pastes text, shares a URL, or points at a
     file in the connected drive.
   - Batch (folder): `composio search drive` → list files in the
     specified folder → filter to contract-flavored
     (PDF/DOCX/DOC).
   - Named vendor: look in `contracts/` first; if absent, search the
     drive via `composio search drive`.

4. **Parse each contract.** Use `composio search doc-processing` to
   discover the best doc-processing tool for the format (OCR for
   scanned PDFs, text extractor for native PDFs, DOCX reader).
   Execute by slug, pull the full text.

5. **Extract standard clauses.** For each contract, locate and
   extract:
   - **Liability cap** — quote + cap amount + carve-outs.
   - **Termination** — for-cause terms, for-convenience terms, notice
     windows.
   - **Auto-renewal** — presence, term length, notice-to-not-renew
     window.
   - **Payment terms** — amount, frequency, true-up / overage, late
     fees.
   - **IP ownership** — who owns work product, background IP rules.
   - **Data handling / DPA** — presence of a DPA, data residency,
     breach notification SLA.
   - **SLA** — uptime commitment, remedies.
   - **Exclusivity / non-compete** — presence and scope.

   For each: **verbatim quote** + **1-line plain-language summary**
   + **1-line flag** if unusual or unfavorable per vendor posture.
   If a clause is absent, mark it `ABSENT` explicitly — don't omit.

6. **Write** to `contracts/{vendor-slug}-{YYYY-MM-DD}.md` with the
   full extraction. For batch runs: one file per contract + a
   `contracts/batch-{YYYY-MM-DD}-summary.md` rolling up flags
   across the batch.

7. **Update the renewal calendar.** If the contract has a renewal
   date, call the `track-renewals` skill internally (or note that
   `track-renewals` should be re-run) and add/update the entry in
   `renewals/calendar.md`.

8. **Atomic writes** — `*.tmp` → rename.

9. **Append to `outputs.json`** with `type: "contract"`, status
   "ready" per contract. For batch: a single `contract` entry for
   the summary + one per contract processed.

10. **Summarize to user** — the #1 flag that most warrants
    founder attention (e.g. "auto-renew is in 11 days and notice
    window is 30 days — already too late to stop this one"). Path
    to file(s).

## Outputs

- `contracts/{vendor-slug}-{YYYY-MM-DD}.md` (one per contract)
- Optional `contracts/batch-{YYYY-MM-DD}-summary.md` (batch runs)
- Updates to `renewals/calendar.md`
- Appends to `outputs.json` with `type: "contract"`.

## What I never do

- **Sign** or accept any contract.
- **Invent** a clause. If the contract has no liability cap, I mark
  it `ABSENT`.
- **Interpret legally.** I flag for founder attention; the founder
  consults legal.
