---
name: prep-meeting
description: Use when the user says "prep me for my 2pm" / "walk me through tomorrow's calendar" / "post-meeting note from my last recording" — pre-meeting intel brief OR post-meeting summary. Mode is selected from user phrasing.
---

# Prep Meeting

One skill, two modes. Pre- and post- are both "meeting ops" — same
primitive (gather context → synthesize → write markdown).

## When to use

**Pre-meeting (default when future-tense):**
- "prep me for my {time / meeting / next / 2pm}"
- "walk me through tomorrow's calendar"
- "who am I meeting with today"

**Post-meeting (triggered by past-tense or transcript input):**
- "post-meeting note from my last meeting"
- "summarize the call I just had"
- user pastes a transcript or recording URL

## Steps

### Shared setup

1. **Read `company-operating-context.md`** — founder's positions and
   voice anchor the synthesis. If missing: ask for
   `define-operating-context` and stop.

2. **Read `config/profile.json`** and the meetings/ folder (if any
   entry exists for this attendee, use as prior context).

### Pre-meeting mode

3a. **Identify the meeting.**
    - If user named it ("my 2pm with {name}"): match against calendar
      via `composio search calendar`.
    - If "next meeting": pull the next event on the calendar.
    - If "tomorrow's calendar": pull every event tomorrow, run the
      skill per-meeting (save separate files), summarize all at the
      end.

4a. **Enrich each external attendee.**
    - `composio search web-search` or `composio search research` →
      public profile, recent public activity (last 30d).
    - `composio search inbox` → last 5 email threads with the
      attendee's address, summarized.
    - `composio search social` (if connected) → 3 most recent public
      posts from them if available.
    - Check the agent's `meetings/` subfolder for prior notes
      involving this person.

5a. **Synthesize the pre-meeting brief** (save to
    `meetings/{slug}-{YYYY-MM-DD}-pre.md`):

    - **Who they are** — 2-sentence bio + role + relationship to us.
    - **What they likely want** — best guess from history + public
      activity.
    - **What I said last time** — quoted or summarized from prior
      notes / email threads, if any.
    - **3 talking points I should lead with** — grounded in active
      priorities from the operating context.
    - **The one thing NOT to forget** — the highest-signal item.
    - **Recent company news (if it's a company meeting)** — up to 5
      links with 1-line summaries.

### Post-meeting mode

3b. **Get the transcript.** Either:
    - User pasted it.
    - User linked to a recording — fetch via `composio search
      meeting-recording` → transcribe if needed.
    - User said "my last meeting" — pull the most recent event from
      calendar + the matching transcript from the recording provider.

4b. **Extract structured fields.**
    - **Decisions made** — verbatim where possible; note who agreed.
    - **Action items** — with owner (name from the call or "me" if
      it's the founder) and implied or stated due date.
    - **Open questions** — flagged for follow-up.
    - **Commitments I made** — things the founder said they'd do,
      extracted and highlighted at the top.

5b. **Write** the post-meeting note to
    `meetings/{slug}-{YYYY-MM-DD}-post.md` with the four sections
    above + a "Next steps" line listing which action items most need
    the founder this week.

### Both modes

6. **Atomic writes** — `*.tmp` → rename.

7. **Append to `outputs.json`** with `type: "meeting-pre"` or
   `"meeting-post"`, status "ready".

8. **Summarize to user** — one paragraph: for pre-, the 3 talking
   points and the one-thing-not-to-forget; for post-, the decisions
   + top 2 actions that most need them this week. Include path to
   the file.

## Outputs

- `meetings/{slug}-{YYYY-MM-DD}-pre.md` or `-post.md`
- Appends to `outputs.json` with `type: "meeting-pre"` or `"meeting-post"`.

## What I never do

- Send a calendar invite, reply to an attendee, or reschedule —
  always read-only during prep.
- Invent attendee quotes or commitments — if a transcript is
  unclear, mark TBD.
