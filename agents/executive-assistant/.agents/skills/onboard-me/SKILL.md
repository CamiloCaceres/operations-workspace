---
name: onboard-me
description: Use when the user says "onboard me" / "set me up" / "let's get started", or on the first real task when no `config/profile.json` exists — open with a scope + modality preamble naming the three topics (schedule preferences, VIPs, travel defaults) AND the best way to share each, then run a tight 90-second 3-question interview and write results to `config/`.
---

# Onboard Me

## When to use

First-run setup. Triggered by:

- "onboard me" / "set me up" / "let's get started".
- The user opens the pre-seeded "Onboard me" activity card and sends
  any short message (including "go", "ok", "start", "yes", or an
  empty-seeming prompt) — when `config/profile.json` is missing,
  treat any short opener as a signal to run me.
- About-to-do-real-work and `config/profile.json` is missing.

Only run ONCE unless the user explicitly re-invokes.

## Principles

- **Lead with a scope + modality preamble.** Name the three topics
  AND the easiest way to share each BEFORE the first question.
- **3 questions is the ceiling, not the target.** If you can do 2, do 2.
- **One question at a time after the preamble.**
- **Rank modalities:** connected app via Composio > file/URL > paste.
- **Anything skipped** → note "TBD" and ask again just-in-time later.

## Steps

0. **Scope + modality preamble — the FIRST message, then roll into Q1:**

   > "Let's get you set up — 3 quick questions, about 90 seconds.
   > Here's what I need and the easiest way to share each:
   >
   > 1. **Your schedule preferences** — timezone, working hours,
   >    deep-work focus blocks (days + times), max meetings per day,
   >    minimum buffer between meetings.
   >    *Best: point me at your connected calendar via Composio and
   >    I'll infer patterns from the last 4 weeks. Or paste a line.*
   > 2. **Your VIPs** — 5–10 people I should never make wait
   >    (investor / co-founder / board / anchor customer / advisor /
   >    family). Name + relationship; emails optional.
   >    *Best: paste the list. I'll learn the rest as mail lands.*
   > 3. **Your travel defaults** — preferred airline, seat
   >    (aisle/window), hotel chain, dietary, accessibility needs.
   >    *Best: paste a line. Or skip for now — I'll ask on your first
   >    trip plan.*
   >
   > For any of these you can also drop files or share public URLs.
   > Let's start with #1 — what's your schedule shape?"

1. **Capture topic 1 (schedule preferences).** Based on modality:
   - Connected calendar: run `composio search calendar` to discover
     the provider slug, pull the last 4 weeks of events, infer
     working hours (from event start/end distribution), deep-work
     days (days with <2 meetings), meeting days (>4 meetings),
     default max meetings per day (75th percentile of daily counts),
     timezone (from event TZ).
   - Paste: parse the line.
   Apply sensible defaults where the user was silent:
   `maxMeetingsPerDay: 5`, `minBufferMinutes: 15`, `blackoutPeriods:
   []`. Write `config/schedule-preferences.json` with the
   `SchedulePreferences` shape from `data-schema.md`. Also write
   `timezone` to `config/profile.json`. Roll into Q2: "Got it — now
   who are your VIPs?"

2. **Capture topic 2 (VIPs).** Parse each row. Default
   `priorityFloor: "P1"` for investor / co-founder / board / spouse;
   `"P2"` otherwise. Unknown email is fine — progressive capture in
   the other skills will learn it. Write `config/vips.json` as an
   array of `Vip` records (each with `id`, `capturedAt`). Roll into
   Q3: "Last one — travel defaults, or skip for now?"

3. **Capture topic 3 (travel defaults).** If the user pastes a line,
   parse into `TravelPrefs`. If they skip, write the file with an
   empty object and `capturedAt` now — progressive capture in
   `coordinate-travel` will fill it when they plan their first trip.

4. **Write `config/profile.json`** with `{ userName, timezone,
   onboardedAt, status: "onboarded" | "partial" }`. Use `"partial"`
   if any topic was skipped.

5. **Atomic writes.** Every file written as `{path}.tmp` then
   renamed. Never partial JSON.

6. **Hand off:** "Ready. Try: `Scan my next 7 days and flag every
   conflict` — or `Build me a deep brief for my meeting with {name}`."

## Outputs

- `config/profile.json`
- `config/schedule-preferences.json`
- `config/vips.json`
- `config/travel-prefs.json` (may be empty on first run)

(No entry appended to `outputs.json` — onboarding is setup, not a
deliverable.)
