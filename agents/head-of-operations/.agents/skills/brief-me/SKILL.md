---
name: brief-me
description: Use when the user says "morning brief" / "what needs me today" / "give me the daily brief" / "here's my brain dump" — aggregates inbox, calendar, team-chat, and recent drive activity into a prioritized today-plan. Two modes, selected from user phrasing — daily-brief (default) and brain-dump (when the user pastes unstructured thoughts).
---

# Brief Me

Daily-rhythm skill. Two modes, same primitive:

- **daily-brief** — default. Aggregates connected sources and produces today's plan.
- **brain-dump** — triggered when the user pastes a block of
  unstructured thoughts. Parses the dump + cross-references with
  connected sources + the operating context.

## When to use

- "morning brief" / "what needs me today" / "daily brief".
- "here's my brain dump" / "turn this into today's plan" / pasted
  unstructured task list.
- On the first message of the day after the user's configured
  `briefDeliveryTime` (if rhythm is set).

## Steps

1. **Read `company-operating-context.md`** at the agent root. If
   missing: ask the user to run `define-operating-context` first and
   stop. I do not invent the company.

2. **Read `config/rhythm.json`** to know deep-work vs meeting days
   and the founder's timezone.

3. **Detect mode.** If the user pasted >100 words of task-flavored
   content, it's `brain-dump`. Otherwise `daily-brief`.

4. **Gather context (both modes).**
   - **Inbox** — `composio search inbox` → list last 24h inbound;
     surface subject + sender + first line per thread.
   - **Calendar** — `composio search calendar` → today's events +
     tomorrow's if called post-5pm local. Pull attendees +
     description.
   - **Team chat** — `composio search chat` → unread-in-my-mentions
     + unread-in-flagged-channels from last 24h.
   - **Drive** — `composio search drive` → files modified in the
     last 24h in my primary workspaces (read from operating context
     `Tools & systems` section).

   If a Composio category is missing, say so and continue with what
   you have — don't block the brief on one missing integration.

5. **Produce the brief.**

   **daily-brief output structure (save to `briefs/{YYYY-MM-DD}.md`):**

   - **Fires (needs me today)** — up to 3, each with 1-line "why now"
     and the specific action (reply, call, decline).
   - **Today's meetings** — each with a 1-line prep note (who, what
     they likely want, the 1 thing not to forget).
   - **What changed overnight** — inbox highlights, chat mentions,
     drive edits — each as a 1-line summary with a pointer.
   - **Can wait** — 2 items that are legitimately deferrable, with
     the default deferral (batch Friday / wait for their follow-up).
   - **The one move** — a single recommended most-important move for
     today.

   **brain-dump output structure (save to `briefs/{YYYY-MM-DD}-dump.md`):**

   - **Parse the dump into buckets:** urgent-fires, strategic,
     operational, future-ideas, personal-logistics.
   - **Calendar reality check** — today's hours, what's already
     booked, free blocks.
   - **2-3 strategic picks** — grounded in the active priorities
     from `company-operating-context.md`.
   - **Fires** — what genuinely can't wait.
   - **Delegation candidates** — items I could hand off (if there's
     anyone to hand off to per operating-context).
   - **Parking lot** — items to defer.
   - **Pattern observations** — e.g. "third week of scope creep on
     {X}", "overcommitted Thursdays".

6. **Write atomically** — `briefs/{YYYY-MM-DD}.md.tmp` → rename.
   If a brief already exists for today, append `-v2`, `-v3` (founder
   re-briefs happen).

7. **Append to `outputs.json`** with `type: "brief"`, status
   "ready". If the user edits or adds context later in the session,
   update the same record (refresh `updatedAt`).

8. **Summarize to user** — the "one move" line + path to the full
   brief.

## Outputs

- `briefs/{YYYY-MM-DD}.md` or `briefs/{YYYY-MM-DD}-dump.md`
- Appends to `outputs.json` with `type: "brief"`.

## What I never do

- Send any outbound message during a brief — if the brief flags a
  reply-needed thread, surface it; drafting is a separate skill (`draft-reply`).
- Invent an event or message — if sources are empty, say so.
