---
name: daily-briefing
description: Use when the user says "logistics brief" / "what's on my plate today" (logistics) / "today's rundown" — produce a ranked logistics plan for today: meetings with prep status, due follow-ups, open calendar conflicts, pending scheduling proposals. This is the logistics cut; the Head of Operations' `brief-me` owns the strategic morning brief.
---

# Daily Briefing

Scope note: the Head of Operations' `brief-me` is the strategic
morning brief — fires, meetings, signal. This skill is the logistics
cut — meetings + prep + followups + conflicts. Run both in sequence
if the user wants the full picture.

## When to use

- "give me today's logistics brief" / "logistics plan for today".
- "what's on my plate today" (when the user is asking about
  schedule/logistics rather than strategic priorities).
- Implicit refresh: if `meetings/` has a brief-less event today.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first.

2. **Refresh calendar scan if stale.** If
   `calendar-conflicts.json` is missing or older than 2 hours, run
   `triage-calendar` first. Do not force re-runs unconditionally.

3. **Aggregate today's data.** Read:
   - Today's events via `composio search calendar` (start-of-day to
     end-of-day in user's timezone from `config/profile.json`).
     For each, check if a `meetings/{slug}-{YYYY-MM-DD}-brief.md`
     exists.
   - `followups.json` — filter `status: "open" | "snoozed"` with
     `dueAt` ≤ end-of-today.
   - `calendar-conflicts.json` — filter `status: "open"` with
     `startAt` today or within 48h.
   - `scheduling/` — list proposal files with `Status: draft` or
     `sent` (awaiting counterparty).

4. **Rank today's priorities** (strict):
   1. Meetings starting in the next 2 hours without a prep brief.
   2. Overdue follow-ups (`dueAt` before today).
   3. Today's remaining meetings — ordered by start time, flagged
      for prep gaps.
   4. Follow-ups due today.
   5. Open calendar conflicts.
   6. Pending scheduling proposals awaiting counterparty.

5. **Write `briefings/{YYYY-MM-DD}.md`** (overwrite if exists; if
   re-briefing mid-day, append `-afternoon` or similar). Structure:

   ```markdown
   # Logistics brief — {YYYY-MM-DD}

   ## Your first move
   {one line — the single most time-sensitive logistics action}

   ## Today's meetings ({N})
   - {time} — {title} — {attendees} — prep: {ready|missing}
     - If missing and VIP: "Run `prep-meeting-briefing` now"
   - ...

   ## Follow-ups due today ({N})
   - {promiseTo} ({company}) — {description} — due
     {relative-time}
   - ...

   ## Overdue follow-ups ({N})
   - {promiseTo} — {description} — {N} days overdue
   - ...

   ## Open calendar conflicts ({N})
   - {type} — {description} — at {startAt}
   - ...

   ## Pending scheduling ({N})
   - {counterparty} — {status} — proposal {daysAgo}d old
   - ...
   ```

6. **Atomic write** — `*.tmp` → rename.

7. **Append to `outputs.json`** with `type: "logistics-brief"`,
   status "ready".

8. **Tell the user the one thing to do first.** Don't dump the full
   brief in chat — just the top line plus the path and an offer to
   walk through it.

## Outputs

- `briefings/{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "logistics-brief"`.

## What I never do

- **Duplicate the Head of Operations' strategic brief.** If the
  user wants fires + signal + strategic picks, that's `brief-me`
  (head-of-operations). I stick to logistics.
- **Send any message** during the brief — if I flag a follow-up as
  due, the handoff is to `draft-followup`.
- **Invent a meeting** — if the calendar is empty today, say so.
