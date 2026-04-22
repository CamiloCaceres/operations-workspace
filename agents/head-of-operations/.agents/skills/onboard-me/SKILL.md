---
name: onboard-me
description: Use when the user explicitly says "onboard me" / "set me up" / "let's get started", or on the first real task when no `config/profile.json` exists — open with a scope + modality preamble naming the three topics (company, rhythm, voice) AND the best way to share each, then run a tight 90-second 3-question interview and write results to `config/`.
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

- **Lead with a scope + modality preamble.** Name the three topics AND
  the easiest way to share each BEFORE the first question.
- **3 questions is the ceiling, not the target.** If you can do 2, do 2.
- **One question at a time after the preamble.** The preamble did the
  heavy lifting.
- **Rank modalities:** connected app via Composio > file/URL > paste.
- **Anything skipped** → note "TBD" and ask again just-in-time later.

## Steps

0. **Scope + modality preamble — the FIRST message, then roll into Q1:**

   > "Let's get you set up — 3 quick questions, about 90 seconds.
   > Here's what I need and the easiest way to share each:
   >
   > 1. **Your company + stage** — what you're building, one-line
   >    pitch, stage (pre-seed / seed / A / later / bootstrapped),
   >    and the 2-3 things moving the company this quarter.
   >    *Best: drop a one-pager or point me at your about/pricing
   >    URL. Or paste 2–3 lines.*
   > 2. **Your operating rhythm** — how your week is shaped (deep-work
   >    days vs. meeting days, when you review, timezone). *Best:
   >    paste a line. Or point me at a connected calendar via Composio
   >    and I'll infer from the last 4 weeks.*
   > 3. **Your voice** — how you write. *Best: if you've connected
   >    an inbox via Composio, just say so — I'll pull 20–30 of your
   >    recent sent messages. Otherwise paste 2–3 emails you've
   >    actually sent.*
   >
   > For any of these you can also drop files or share public URLs.
   > Let's start with #1 — what's your company + stage + the 2–3
   > priorities this quarter?"

1. **Capture topic 1 (company + priorities).** Based on modality:
   parse paste, fetch URL via `composio search web-scrape` (execute
   by slug), or read file. Extract name, one-line pitch, stage,
   `activePriorities` (2–3 items). Write `config/company.json` with
   `{ name, oneLine, stage?, url?, activePriorities, source,
   capturedAt }`. Acknowledge and roll into Q2: "Got it — now how's
   your week shaped?"

2. **Capture topic 2 (rhythm).** Same pattern. If connected-calendar
   route: run `composio search calendar` to discover the provider
   slug, pull the last 4 weeks of events, infer deep-work days (days
   with <2 meetings), meeting days (>4 meetings), review day (any
   recurring Mon/Fri review block). If paste, parse the line. Write
   `config/rhythm.json` with `{ workingHours?, deepWorkDays?,
   meetingDays?, reviewDay?, weeklyReviewTime?, briefDeliveryTime?,
   source, capturedAt }`. Roll into Q3: "Last one — how do you
   write? Connected inbox, or paste samples?"

3. **Capture topic 3 (voice).** If connected-inbox route: run
   `composio search` for the connected provider's list-sent-messages
   tool; fetch the 20–30 most recent outbound messages; extract tone
   cues (greeting, closing, sentence length, formality, quirks);
   write 3–5 verbatim excerpts plus a tone summary to
   `config/voice.md`. If paste: write the samples verbatim plus a
   short tone summary.

4. **Write `config/profile.json`** with `{ userName, company, role?,
   onboardedAt, status: "onboarded" | "partial" }`. Use `"partial"`
   if any topic was skipped.

5. **Atomic writes.** Every file written as `{path}.tmp` then
   renamed. Never partial JSON.

6. **Hand off:** "Ready. Try: `Help me set up our operating context`."

## Outputs

- `config/profile.json`
- `config/company.json`
- `config/rhythm.json`
- `config/voice.md`

(No entry appended to `outputs.json` — onboarding is setup, not a
deliverable.)
