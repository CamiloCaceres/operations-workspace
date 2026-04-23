---
name: triage-calendar
description: Use when the user says "scan my calendar" / "find conflicts" / "how's my week" / "rebalance my week" — scan the next 7 days via any Composio-connected calendar, flag overbooks, missing buffers, focus-block clashes, unprotected VIP slots, and meetings without prep; write the scan to `calendar-scans/{YYYY-MM-DD}.md` and upsert `calendar-conflicts.json`.
---

# Triage Calendar

## When to use

- "scan my calendar" / "how's my week" / "how's my next week".
- "find conflicts" / "rebalance my week".
- "what's wrong with my calendar".
- Called implicitly before `daily-briefing` if
  `calendar-conflicts.json` is older than 2 hours.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. I do not invent
   your rhythm or VIPs.

2. **Read `config/schedule-preferences.json`** for
   `workingHours`, `focusBlocks`, `meetingDays`, `maxMeetingsPerDay`,
   `minBufferMinutes`, `blackoutPeriods`, `timezone`. Read
   `config/vips.json`. If either is missing, ask ONE targeted
   question for the missing one with the best-modality hint
   (connected calendar for preferences, paste for VIPs) and continue.

3. **Resolve the calendar.** `composio search calendar` → list-events
   slug for the user's connected provider. If no calendar is
   connected, tell the user which category to link from the
   Integrations tab and stop.

4. **Fetch the next 7 days.** Pull every event including tentative,
   declined, OOO. Capture per event: `externalEventId`, `title`,
   `startAt`, `endAt`, `location`, `channel` (video / phone /
   in-person inferred from the location field), `attendees` with
   status.

5. **Detect conflicts** — for each event or pair of events, flag:
   - **overbook** — two events overlap in time.
   - **missing-buffer** — back-to-back with less than
     `minBufferMinutes` between them (pull from config — do NOT
     hardcode a number).
   - **focus-block-clash** — an event lands inside a declared
     `focusBlock`.
   - **vip-unprotected** — a VIP-attended meeting is sandwiched or
     ends with less than the configured buffer after.
   - **no-prep** — a meeting within 24 hours with no matching
     `meetings/{slug}-{YYYY-MM-DD}-brief.md`.

6. **Count daily meeting load.** If any day exceeds
   `maxMeetingsPerDay`, surface an "over-capacity" note in the
   chat summary (not a `calendar-conflicts.json` row — that's for
   event-pair conflicts).

7. **Upsert `calendar-conflicts.json`.** One row per conflict with
   `type`, `startAt`, `endAt`, `relatedEventIds`, `description`,
   `proposedFix`, `status: "open"`. Preserve `acknowledged` and
   `resolved` rows from prior runs — do not wipe history.

8. **Write the scan** to `calendar-scans/{YYYY-MM-DD}.md` (atomic:
   `*.tmp` → rename). Structure:

   ```markdown
   # Calendar scan — {YYYY-MM-DD}

   ## Summary
   {N} events across the next 7 days. {X} overbooks, {Y}
   missing buffers, {Z} focus-block clashes, {V} VIP unprotected,
   {P} meetings without prep.

   ## The 2 rebalances worth making
   1. {specific fix — e.g. "move Acme sync from Wed 10am to Thu 2pm:
      frees your Wed focus block and lands on a meeting day"}
   2. ...

   ## Overbooks ({N})
   - {date time} — {title A} overlaps {title B}

   ## Missing buffers ({N})
   - {date time} — {title A} → {title B}, {X} min gap

   ## Focus-block clashes ({N})
   - {date time} — {title} inside focus block {day} {range}

   ## VIP unprotected ({N})
   - {date time} — {title} with {VIP name}; no buffer after

   ## No-prep meetings ({N})
   - {date time} — {title} — run `prep-meeting-briefing` for this one
   ```

9. **Append to `outputs.json`** with `type: "calendar-scan"`, status
   "ready".

10. **Summarize to user** — the 2 proposed rebalances + counts. Do
    not dump the full table in chat; point at the path.

## Outputs

- `calendar-scans/{YYYY-MM-DD}.md`
- Upserted `calendar-conflicts.json` (live index — not in
  `outputs.json`)
- Appends to `outputs.json` with `type: "calendar-scan"`.

## What I never do

- **Reschedule** — I propose rebalances; the user confirms and then
  can invoke `schedule-meeting` or reschedule manually.
- **Send a reschedule note** — drafting is `schedule-meeting`'s job,
  only after the user approves a specific change.
- **Invent an event** — if the calendar is empty over the window,
  say so.
