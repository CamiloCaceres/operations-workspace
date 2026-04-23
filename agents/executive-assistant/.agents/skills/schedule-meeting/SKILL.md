---
name: schedule-meeting
description: Use when the user says "book a meeting with {X}" / "find 30 min with {team}" / "let's schedule {Y}" — propose 3 times that respect focus blocks, buffers, and max-meetings-per-day; draft the counterparty message in the user's voice; iterate on back-and-forth; create the event only after explicit approval. Never books without approval.
---

# Schedule Meeting

## When to use

- "book a meeting with {X}" / "find 30 min with {team}".
- "let's schedule {Y}" / "propose times for {Z}".
- Handoff from Head of Operations' `triage-inbox` when a thread is
  classified as `schedule-meeting` and the user says "book it."

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. Voice, priorities,
   and key-contacts shape the draft message.

2. **Clarify the ask.** Extract from the user's message:
   counterparty name(s), desired duration (default 30 min), purpose,
   desired timezone (default user's). If anything material is
   missing, ask ONE question.

3. **Read `config/schedule-preferences.json` and `config/vips.json`.**
   If preferences are missing, ask ONE question (best: connect the
   calendar so I can infer) and continue.

4. **Resolve the calendar.** `composio search calendar` → free/busy
   and create-event slugs. If no calendar is connected, tell the
   user which category to link and stop.

5. **Fetch free/busy.** Pull the user's busy blocks for the next 10
   business days. Compute candidate slots that:
   - fall inside `workingHours`,
   - do NOT intersect any `focusBlock`,
   - respect `minBufferMinutes` on both sides of existing busy,
   - keep the day's total meetings ≤ `maxMeetingsPerDay`,
   - avoid `blackoutPeriods`.

   Thresholds come from config — do NOT hardcode.

6. **Pick 3 options.** Spread across days (e.g. tomorrow AM,
   day-after PM, end-of-week AM). Prefer mid-morning (10–11:30) and
   early afternoon (2–4). Avoid Mondays before noon and Friday
   afternoons unless nothing else fits. For VIPs, prefer
   higher-energy morning slots and larger buffers.

7. **Draft the message.** Read `config/voice.md` (or the voice block
   in the operating context). If voice samples are missing, ask ONE
   targeted question (best: connect your inbox via Composio so I can
   pull 20–30 recent sent messages for calibration) and continue.
   Pattern: one-line ack → 3 proposed times (bulleted, both user and
   counterparty timezones labeled if different) → soft fallback ("or
   suggest a time that works better"). Cap at ~80 words.

8. **Write `scheduling/{slug}/proposal.md`** (slug =
   kebab-cased counterparty or thread id — prefixed `sched-` if
   standalone). Overwrite per iteration. Structure:

   ```markdown
   ## Counterparty
   {name} <{email}>

   ## Proposed times
   - {Day Mon DD, H:MMam PT / H:MMpm ET} — {duration}
   - ...

   ## Constraints honored
   - focus blocks respected: {list}
   - daily meeting cap: {X}/{max}
   - buffers: {min} min

   ## Draft message
   {the drafted body}

   ## Status
   draft
   ```

9. **Present to user.** "Here are 3 options + a draft message. Send
   this? Tweak? Add a 4th option?" Never send.

10. **Iterate on the reply.** When the counterparty replies picking
    a slot or counter-proposing, update the proposal's `## Status`
    (draft → sent → counter-proposed) and either confirm or loop
    back to step 5–6 with a narrowed window.

11. **Book on approval.** When the user says "book {time} with
    {counterparty}," call the Composio create-event slug. Add the
    counterparty as attendee, include a video link if the calendar
    provider supports it, title per user instruction or inferred
    purpose. Update proposal status to `confirmed`.

12. **Append to `outputs.json`** with `type: "scheduling"`, status
    "draft" until confirmed, then flip to "ready" on booking.

13. **Hand off prep.** After booking, if the attendee is a VIP or
    the meeting is high-stakes, offer: "Want me to run
    `prep-meeting-briefing` on this one now?"

## Outputs

- `scheduling/{slug}/proposal.md` (overwritten per iteration)
- Created calendar event on approval
- Appends to `outputs.json` with `type: "scheduling"`.

## What I never do

- **Book** a calendar event without the user's explicit "book it" on
  a specific time.
- **Send** the counterparty message — draft only; the user sends
  from their own inbox, or approves me to send via Composio after
  review.
- **Override a focus block or daily cap** without the user
  explicitly waiving it for this one meeting.
- **Propose slots without reading preferences** — if
  `schedule-preferences.json` is missing I ask once and continue.
