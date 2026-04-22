---
name: triage-inbox
description: Use when the user says "triage my inbox" / "what's in my email" / "summarize my inbox" — classifies and ranks inbound email; never drafts replies (that's `draft-reply`).
---

# Triage Inbox

Triage is classification + ranking. Drafting is a separate skill
(`draft-reply`) — keep them apart. Do not leak.

## When to use

- "triage my inbox" / "what's in my email" / "go through my inbox".
- "summarize my inbox" / "inbox roundup".
- Called implicitly by `brief-me` — but `brief-me` surfaces inbox at
  a 1-line level; `triage-inbox` does the per-thread pass.

## Steps

1. **Read `company-operating-context.md`** — the founder's
   priorities, key contacts, and hard nos anchor what counts as
   "needs me." If missing: run `define-operating-context` first.

2. **Pull messages.** `composio search inbox` → list threads from
   the requested window (default: last 24h). Include sender, subject,
   first 200 chars of the latest message, and whether the thread is
   a reply to something I sent.

3. **Classify each thread into one of three buckets:**

   - **Needs me today** — someone is waiting on me, or a decision
     must be made before end-of-day, or the sender is in the
     Key-Contacts list of the operating context.
   - **Can wait** — legitimate but not urgent. Note the default
     deferral: "wait for their follow-up" / "batch Friday" / "assign
     to `draft-reply`."
   - **Ignore** — newsletters, cold outreach, receipts, automated
     notifications with no action required.

4. **Rank the "needs me today" bucket** by time-sensitivity:
   irreversible-if-I-miss > customer-in-distress > investor-pending
   > everything else.

5. **Per thread, state the specific action.** Not "review" — a
   verb + object: "reply with the pricing page", "forward to Vendor
   agent for renewal decision", "decline — not our ICP", "delegate
   to {contact}".

6. **Write atomically** to `triage/{YYYY-MM-DD}.md` (or
   `triage/{YYYY-MM-DD}-{HH}.md` if a second pass today). Structure:
   Needs-Me-Today (ranked) → Can-Wait → Ignore. Count the buckets in
   a header line for scannability.

7. **Append to `outputs.json`** with `type: "triage"`, status
   "ready".

8. **Summarize to user** — the count + the top action. Example:
   "3 need you today, 6 can wait, 14 ignore. Top: reply to
   {investor} by 5pm — they asked for the updated deck."

## Outputs

- `triage/{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "triage"`.

## What I never do

- **Draft a reply.** That's `draft-reply`'s job. If the founder says
  "triage AND draft," acknowledge, run me first, then hand off to
  `draft-reply` for the `needs-me-today` bucket.
- **Send, archive, label, or delete** any message. Read-only.
- **Star or mark-as-read.** Touching state in the inbox is not
  triage — it's a write.
