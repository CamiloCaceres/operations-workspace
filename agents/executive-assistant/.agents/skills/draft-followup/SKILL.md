---
name: draft-followup
description: Use when the user says "track this follow-up" / "remind me to follow up with {X}" / "handle my due follow-ups" — two modes. Track mode extracts commitments from outbounds or explicit instructions and appends to `followups.json`. Handle mode drafts the fulfillment (or an honest bump) for follow-ups due today. Never sends.
---

# Draft Follow-up

One skill, two modes — track and handle. They're the two halves of
the same primitive: make sure no promise goes cold.

## When to use

**Track mode:**
- "track this follow-up: I told {X} I'd {do Y} by {date}".
- "remind me to follow up with {X} on {day}".
- The user pastes an outbound they sent that contains a commitment
  phrase ("I'll send Tuesday", "will confirm by Friday", "circling
  back next week").
- Chained after Head of Operations' `draft-reply` when the user
  approves sending a draft that contains a commitment.

**Handle mode:**
- "handle my due follow-ups for today".
- "draft the reply to {X} — that thing I owe them".
- Surfaced by `daily-briefing` when a row in `followups.json` has
  `dueAt` today or overdue and `status` is `open` or `snoozed`.

## Steps

1. **Read `../head-of-operations/company-operating-context.md`.** If
   missing or empty, stop and ask the user to run Head of
   Operations' `define-operating-context` first. Voice and positions
   anchor drafts.

2. **Read `config/profile.json`** for timezone (used to resolve
   "Tuesday" and "next week").

### Track mode

3a. **Extract the commitment.**
    - If the user pasted an outbound: parse the body for phrases
      that promise action — explicit ("I'll send {X} by {date}",
      "will confirm by {date}") or implicit ("let me check on that
      and get back to you").
    - If the user typed an instruction: parse the instruction
      directly.
    - If nothing clearly resolves, ask the user ONE question: "What
      did you promise, and by when?"

4a. **Resolve the due date.** Convert relative references ("Tuesday",
    "next week", "end of the month") to an ISO-8601 date in the
    user's timezone from `config/profile.json`. If ambiguous ("soon",
    "shortly"), default to 3 business days from the outbound date
    AND flag this to the user.

5a. **Build the `Followup` row** per `data-schema.md`. Generate `id`
    (UUID v4). Set `status: "open"`, `createdAt`, `updatedAt`.

6a. **Append to `followups.json`.** Check for existing open rows
    with the same `threadId` + `description` — if present, update
    `dueAt` rather than duplicating. Atomic write.

7a. **Summarize** — "Tracked: I'll remind you to {description} for
    {promiseTo} on {dueAt}. Surfaces in `daily-briefing` the morning
    it's due."

### Handle mode

3b. **Load the target follow-up(s).** If the user named a specific
    person or thread, match on `promiseTo` or `threadId`. If "due
    today," filter `status: "open"` OR `"snoozed"` with
    `dueAt` ≤ end-of-today in the user's timezone. If multiple
    match, list and ask the user to pick (or "all of them").

4b. **Check status.** If `status` is already `done` or `cancelled`,
    confirm with the user before proceeding.

5b. **Load thread context.** If `threadId` is set, `composio search
    inbox` and fetch the latest thread state so the draft reflects
    any counterparty replies since the commitment was made.

6b. **Decide the path per follow-up:**
    - **Commitment ready to fulfill** (user has the deliverable) →
      draft a message that delivers it. Read `config/voice.md` (or
      voice section of operating context). Pattern: 1-line
      reference to the prior promise → deliver the thing → short
      close.
    - **Commitment NOT ready yet** → draft an honest bump message
      that (a) acknowledges the delay plainly, (b) gives a new
      concrete date, (c) does not over-apologize. Ask the user ONE
      question: "What's the new date I should promise?" Write the
      answer into the draft.
    - **User wants to cancel the commitment** → draft a short
      specific retraction. Set `status: "cancelled"` on the row.

7b. **Write the draft** to `followups/{followup-id}/draft.md`
    (overwrite per iteration). Structure:

    ```markdown
    ## Thread
    {threadId} — {subject if available}

    ## Recipient
    {promiseTo} <{promiseToEmail}>

    ## Subject
    Re: ... (or new subject)

    ## Body
    {the drafted message}

    ## Mode
    {fulfill | bump | cancel}

    ## Linked followup
    id: {followup-id}
    due: {dueAt}
    ```

8b. **Update `followups.json`.** Set `lastRemindedAt: now`,
    `completionDraftPath: "followups/{id}/draft.md"`,
    `updatedAt: now`. Keep `status: "open"` until the user confirms
    they sent — then flip to `done`. On "snooze," set
    `status: "snoozed"` and push `dueAt` to the new date the user
    gave.

9b. **Append to `outputs.json`** with `type: "followup-draft"`,
    status "draft".

10b. **Present to the user.** Show the draft; ask "send, tweak, or
     snooze?" Never send.

## Outputs

**Track mode:**
- Appended / updated row in `followups.json`

**Handle mode:**
- `followups/{followup-id}/draft.md` (overwritten)
- Updated row in `followups.json`
- Appends to `outputs.json` with `type: "followup-draft"`

## What I never do

- **Send** the follow-up message — user reviews + sends from their
  own inbox (or approves me to send via Composio after review).
- **Invent a new commitment** I couldn't extract from the source.
- **Overwrite a completed row** without confirming.
- **Surface follow-ups that aren't due yet** — the daily briefing
  only pulls rows where `dueAt ≤ today`.
