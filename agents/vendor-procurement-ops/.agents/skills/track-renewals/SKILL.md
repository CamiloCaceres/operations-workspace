---
name: track-renewals
description: Use when the user says "build my renewal calendar" / "what's renewing this quarter" / "update the renewal calendar" — scans contracts/ and any connected drives, extracts renewal dates + notice windows + auto-renew language, maintains the living `renewals/calendar.md` and a quarterly digest.
---

# Track Renewals

Maintains the single most load-bearing file on this agent:
`renewals/calendar.md`. Head of Operations reads it during
`run-weekly-review`.

## When to use

- "build my renewal calendar" / "update the renewal calendar".
- "what's renewing in the next 90 days / this quarter".
- "run the renewal scan".
- Called as a sub-step of `extract-contract-clauses` after parsing
  a contract — the skill nudges `track-renewals` to refresh the
  calendar with the new entry.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`** —
   hard nos + vendor posture set the "negotiate before auto-renew"
   flag threshold. If missing: stop, ask for
   `define-operating-context`.

2. **Read `config/procurement.json`** — especially `approvalPosture`
   (risk appetite adjusts lead-time tiers: conservative = longer
   lead, fast = shorter).

3. **Source the contracts.**

   - **contracts/** — every file is a clause extraction. Parse for
     renewal date + notice window + auto-renew presence.
   - **Connected drive** — if `contractRepository.kind =
     "connected-storage"`, run `composio search drive` → list files
     → check for any that aren't in `contracts/` yet (call
     `extract-contract-clauses` as a sub-step for new ones — or
     surface them as "unparsed: run extract-contract-clauses first"
     to the user).
   - **Billing provider** — `composio search billing` → list
     subscriptions with renewal dates. Use only for tools without
     formal contracts.

4. **Extract per-entry data.**

   Per contract/subscription: `{ vendor, amount_if_known,
   nextRenewalDate, noticeWindowDays, autoRenew, contractPath,
   source }`.

5. **Compute lead-time tier per entry** (days until renewal):
   - **7 days** — urgent; if autoRenew and past notice-window,
     flag as "renewal imminent — cannot stop".
   - **30 days** — hot; founder should decide now.
   - **60 days** — warm; negotiate window open.
   - **90 days** — cool; scoping window.
   - **beyond** — parked.

   Risk-appetite adjustments from `procurement.json`:
   - conservative → bump everything up one tier.
   - fast → leave defaults.

6. **Write `renewals/calendar.md`** atomically. This is the LIVE
   file — overwrite every time.

   Structure:

   ```markdown
   # Renewal Calendar

   _Last scan: {ISO-8601} · Contracts scanned: {N}_

   ## Next 7 days ({M})
   - {Vendor} · {YYYY-MM-DD} · auto-renew:{Y/N} · notice-window-passed:{Y/N} · amount:{$if known} · path:{contracts/...md}

   ## Next 30 days ({M})
   ...

   ## Next 90 days ({M})
   ...

   ## Beyond 90 days ({M})
   ...
   ```

   Inside each tier, sort by date ascending.

   **This file is NOT indexed in `outputs.json`.** It's a live
   document.

7. **Produce a quarterly digest** if triggered ("quarterly" mode)
   or if we're within 14 days of a quarter-end. Save to
   `renewals/{YYYY-QN}-digest.md`:

   - **Upcoming this quarter** — ordered list.
   - **Already past notice-to-cancel window** — if any, called
     out separately.
   - **Top negotiation candidates** — 2-3 renewals where the
     contract terms + founder posture suggest room to negotiate
     (e.g. annual commitments with usage mismatch).
   - **Scope-adjustment candidates** — tools that are mostly
     unused but renewing.

   This file IS indexed in `outputs.json` with `type:
   "renewal-digest"`.

8. **Atomic writes** — `*.tmp` → rename.

9. **Append to `outputs.json`** with `type: "renewal-digest"` only
   for digest runs. Calendar refreshes don't append.

10. **Summarize to user** — "N contracts scanned. M renewing in
    next 30d. The one to act on first: {vendor} — {reason}. Open
    renewals/calendar.md to see the full list."

## Outputs

- `renewals/calendar.md` (live, NOT indexed)
- `renewals/{YYYY-QN}-digest.md` (indexed, digest runs only)
- Appends to `outputs.json` with `type: "renewal-digest"` (digest runs only).

## What I never do

- **Auto-renew or cancel on the founder's behalf.** I surface and
  flag; the founder acts.
- **Contact vendors.** Renewal outreach is
  `draft-vendor-outreach`'s job and still requires founder approval.
- **Skip an unparsed contract in the connected drive.** If I find
  one, I surface it ("3 contracts not yet parsed — run
  `extract-contract-clauses` on: {list}") rather than silently
  ignoring it.
