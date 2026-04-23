---
name: prep-meeting-briefing
description: Use when the user says "prep me on {name}" / "deep brief for my meeting with {X}" / "build me a pre-read for {meeting}" — deep attendee intel with bio, role, prior email threads, recent public activity, shared history, and a suggested agenda. Deeper than Head of Operations' `prep-meeting`, which is agenda sanity; this is the full attendee pre-read.
---

# Prep Meeting Briefing

Scope note: the Head of Operations' `prep-meeting` skill is a shorter
pre/post agenda helper — fast context, 1-page. This skill does the
deep-dive: bio, prior threads, public activity, history, talking
points. Use this when the meeting is high-stakes (VIP, first-time
external, partnership, investor, customer).

## When to use

- "prep me on {name}" / "deep brief for {meeting}".
- "build me a pre-read for my {time} / {meeting}".
- "full dossier for my meeting with {X}".
- Implicitly from `daily-briefing` if a meeting is within 24h AND
  the attendee is a VIP AND no brief file exists.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of Operations'
   `define-operating-context` first. Priorities + voice anchor the
   "talking points" synthesis.

2. **Read `config/vips.json` and `config/profile.json`.** Know if the
   attendee is in the VIP list and what `priorityFloor` they sit at.

3. **Identify the meeting.** `composio search calendar` →
   get-event slug for the user's connected calendar.
   - If the user named time or title, match from today/tomorrow.
   - If "my meeting with {name}", search upcoming events by
     attendee email or title match.
   - If "next meeting", pull the next future event.

4. **Enrich each external attendee** (skip internal ones using
   domain match against the company URL in operating context). In
   parallel:

   - `composio search web-search` or `composio search research` →
     public profile (LinkedIn-style directory, company page),
     recent public activity (articles, press, posts) in the last 30
     days.
   - `composio search inbox` → last 5 email threads with the
     attendee's address in the last 90 days. Summarize each (subject,
     date, 1-line gist).
   - `composio search social` (if connected) → 3 most recent public
     posts.
   - Check `meetings/` for any prior briefs involving this person —
     read the most recent one to cite "what I said last time."

5. **Synthesize the brief** and write to
   `meetings/{slug}-{YYYY-MM-DD}-brief.md`. Slug is the
   kebab-cased attendee or company name. Structure:

   ```markdown
   # Brief — {title} with {attendees}
   {date} {time} ({duration}) · {channel: video/phone/in-person}

   ## Who they are
   - **{Name}** ({Company}) — {role}. {relationship tag if VIP}.
     {2-sentence bio anchored in public profile}.

   ## What they likely want
   {best guess, 2–3 sentences, from history + public activity +
   event description. Never invented — if thin, say "unclear — ask
   them at the top."}

   ## What I said last time
   > {verbatim or summarized from the most recent prior brief or
   > email thread}
   (If no prior interaction, say so explicitly: "First interaction.")

   ## 3 talking points to lead with
   1. {anchored in active priorities from the operating context}
   2. ...
   3. ...

   ## The one thing NOT to forget
   {the highest-signal item — an ask, a commitment pending, a
   sensitive topic to avoid}

   ## Recent company news ({if external company})
   - {title} — {source} — {date} — {1-line summary}
   - ... (up to 5)

   ## Prior threads ({if any})
   - {date} — {subject} — {1-line gist}
   - ... (up to 5)

   ## Open questions for me
   - {anything the user should clarify with the attendee}
   ```

6. **If a VIP has sensitive-party status** (investor / co-founder /
   spouse / lawyer / board — per the operating context or VIP
   relationship field), add a note at the top: "Sensitive party —
   review carefully before the meeting."

7. **Atomic writes** — `*.tmp` → rename.

8. **Append to `outputs.json`** with `type: "meeting-brief"`, status
   "ready".

9. **Summarize to user** — the 3 talking points + the
   one-thing-not-to-forget. Path to file. If other meetings in the
   next 24h also need briefs, offer to run the same on each.

## Outputs

- `meetings/{slug}-{YYYY-MM-DD}-brief.md`
- Appends to `outputs.json` with `type: "meeting-brief"`.

## What I never do

- **Invent attendee quotes, bios, or commitments** — if the source
  is thin, mark TBD.
- **Send a scheduling or calendar message** — this skill is
  read-only prep.
- **Draft a reply** to threads I read — drafting is the Head of
  Operations' `draft-reply` (strategic threads) or `draft-followup`
  (commitment follow-ups).
- **Leak internal-only content** (comp, people issues) into an
  external-attendee brief.
