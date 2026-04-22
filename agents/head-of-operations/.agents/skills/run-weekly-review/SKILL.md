---
name: run-weekly-review
description: Use when the user says "Monday ops review" / "weekly readout" / "what happened across my ops this week" — aggregates every agent's `outputs.json` in the workspace, cross-references with active priorities and the renewal calendar, flags gaps, surfaces next moves.
---

# Run Weekly Review

Founder's Monday rhythm. This is the one skill that looks across the
whole workspace — it reads the Vendor agent's outputs and combines
them with my own.

## When to use

- "Monday ops review" / "weekly readout" / "weekly review".
- "what happened across my ops this week".
- On the first message of the day if today matches
  `config/rhythm.json.reviewDay` and no review exists yet for this
  week.

## Steps

1. **Read `company-operating-context.md`.** The active priorities
   section is the lens for "what matters." If missing:
   `define-operating-context` first, stop.

2. **Read every agent's `outputs.json` in this workspace:**

   - `./outputs.json` (this agent's own outputs)
   - `../vendor-procurement-ops/outputs.json`

   Handle missing files gracefully — if an agent isn't installed
   yet or its file is empty, note "no activity" and move on.

3. **Also read `../vendor-procurement-ops/renewals/calendar.md`**
   if it exists — it's a live file and not in `outputs.json`.
   Extract the next-90-day renewals for the review.

4. **Bucket each artifact by week.** Look at `createdAt` /
   `updatedAt`. Anything created or materially updated in the last
   7 days is "this week."

5. **Produce the review structure** (save to
   `reviews/{YYYY-MM-DD}.md`):

   - **Shipped this week** — grouped by agent. Each entry: title +
     2-line summary from the `outputs.json` record.
   - **In draft** — work that's `status: "draft"` and older than
     3 days (suggests it's stuck).
   - **Quiet agents** — any agent with no new activity in 14+
     days. Flag with a proposed one-line prompt to kick them off.
   - **Renewals in the next 90 days** — pulled from the Vendor
     agent's renewal calendar; flagged with lead-time tier (90 /
     60 / 30 / 7 days out). If none, note it.
   - **Alignment with priorities** — for each active priority in
     the operating context, list what shipped this week that
     laddered to it. Flag priorities with no shipped work.
   - **3 recommended next moves** — each addressed to a specific
     agent with a one-line handoff prompt the founder can paste.

6. **Atomic writes** — `reviews/{YYYY-MM-DD}.md.tmp` → rename.

7. **Append to `outputs.json`** with `type: "review"`, status
   "ready".

8. **Summarize to user** — the 3 recommended next moves
   verbatim + the count (shipped / in-draft / renewals-due). Short
   enough the founder doesn't need to open the file unless they
   want details.

## Outputs

- `reviews/{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "review"`.

## What I never do

- **Write to another agent's folder.** I read, never write. The
  Vendor agent owns its own outputs.
- **Act on the "recommended next moves."** The review produces the
  handoff prompts; the founder decides whether to paste them.
- **Mark another agent's artifact as `ready`.** I can observe its
  status; I don't mutate it.
