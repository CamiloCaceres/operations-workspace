---
name: audit-saas-spend
description: Use when the user says "audit my SaaS spend" / "what am I paying for" / "find the subscriptions I forgot about" — aggregates subscriptions from contract library, connected billing, and inbox receipts; flags duplicates, unused tools, and top cancel candidates.
---

# Audit SaaS Spend

The surprise-reveal skill. Most solo founders don't know their
annualized SaaS spend. This surfaces it in one file.

## When to use

- "audit my SaaS spend".
- "what am I paying for".
- "find the subscriptions I forgot about".
- "how much are we spending on tools".

## Steps

1. **Read `../head-of-operations/company-operating-context.md`** —
   stage + vendor posture anchors severity thresholds. If missing:
   stop, ask for `define-operating-context`.

2. **Read `config/procurement.json`** — `knownVendors` is the known
   list; anything NOT on that list found during the audit is a
   potential forgotten-subscription.

3. **Aggregate sources.**

   - **Source A — contract library (`contracts/`).** Every parsed
     contract yields a subscription. Pull: vendor, amount if known,
     billing frequency, renewal date.
   - **Source B — connected billing.** `composio search billing` →
     list-subscriptions / list-charges. Pull recurring charges from
     the last 12 months. Normalize to annualized amount.
   - **Source C — inbox receipts.** `composio search inbox` →
     search for `receipt OR "subscription renewed" OR "payment
     confirmed" OR invoice` in the last 90 days. Extract sender
     domain + amount + date. This catches the subs not on a card.

4. **Deduplicate across sources.** Match on (normalized vendor
   name) + (amount ± 5%) + (billing frequency). If the same sub
   appears in two sources, merge and note all sources.

5. **Annualize every entry.** Monthly × 12, quarterly × 4, annual
   × 1.

6. **Detect patterns.**

   - **Duplicates / overlaps.** Two project-management tools? Three
     password managers? Two note apps? Flag with a 1-line "consider
     consolidating to {one}."
   - **Unused tools.** For each subscription, attempt a usage
     check: `composio search {category}` → does that provider have
     a last-login or usage API? If no, fallback to "last receipt
     date" vs. "last activity in connected inbox" as a proxy. Flag
     anything with no proxy-activity in 60+ days.
   - **Forgotten subs.** Any found in Source B or C that's NOT in
     `knownVendors` or `contracts/` → call out explicitly.
   - **Price drift.** If a prior audit exists at `spend/` and the
     vendor's annualized amount jumped >15%, flag.

7. **Produce the output** (save to
   `spend/{YYYY-MM-DD}-audit.md`):

   - **Headline** — total annualized spend, count of subscriptions.
   - **Spend table** — ordered by annualized amount descending.
     Columns: Vendor | Category | Annualized | Billing | Next
     renewal | Last activity | Flag.
   - **Duplicates / overlaps** — grouped by category.
   - **Unused (no activity 60+ days)** — list with evidence.
   - **Forgotten subscriptions** — stuff not in
     `config/procurement.json` or `contracts/`.
   - **Price drift** — deltas vs prior audit.
   - **Top 3 cancel candidates** — the 3 highest-leverage cancels
     (high annualized + low usage + no auto-renew trap). Each
     with a 3-line rationale.

8. **Atomic writes** — `*.tmp` → rename.

9. **Append to `outputs.json`** with `type: "spend-audit"`, status
   "ready".

10. **Suggest next moves.**
    - For each top cancel candidate: "ready to draft the cancel
      email? Use `draft-vendor-outreach` with `purpose: cancel`."
    - If forgotten subs exist and contracts are missing: "run
      `extract-contract-clauses` on {vendor} once you've located
      the contract."

## Outputs

- `spend/{YYYY-MM-DD}-audit.md`
- Appends to `outputs.json` with `type: "spend-audit"`.

## What I never do

- **Cancel a subscription.** I identify candidates; the founder
  decides; `draft-vendor-outreach` writes the draft; founder sends.
- **Move money, modify billing details, or change payment methods.**
  Read-only on billing.
- **Treat billing data as a system-of-record.** If sources
  disagree, surface the disagreement — don't pick a winner
  silently.
