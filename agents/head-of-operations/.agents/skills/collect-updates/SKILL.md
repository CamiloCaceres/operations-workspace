---
name: collect-updates
description: Use when the user says "collect this week's updates from the team" / "are we on track for OKRs" / "run the weekly update loop" — sends reminders out to contributors, collects responses, analyzes alignment against active priorities, surfaces what's drifting. Dormant with a friendly message if the operating context has no team section.
---

# Collect Updates

Team-facing weekly update loop. This skill is deliberately dormant
for the true solo founder — the moment the founder hires 1+ people
and lists them in operating context, it lights up.

## When to use

- "collect this week's updates from the team".
- "are we on track for OKRs this week".
- "send the Friday reminder and analyze what comes back".

## Steps

1. **Read `company-operating-context.md`.** If the "Key contacts /
   Team" section is absent, empty, or N≤1 (founder only), stop and
   say:

   > "This skill collects weekly updates from a team. Your operating
   > context doesn't list anyone yet — so there's no one to collect
   > from. Run `define-operating-context` and add a Team section
   > when you hire, then this skill turns on."

   Do NOT run against external contacts who aren't on the team list.

2. **Read `config/update-template.md` if present.** Otherwise use
   the default template below.

3. **Send reminders.** For each team member listed in the Team
   section:
   - `composio search chat` (preferred) or `composio search inbox`
     — execute the send-message tool for the founder's team-chat
     provider.
   - Deliver the prompt template as a DM or thread reply, addressed
     to that person. Use the founder's voice per `config/voice.md`.
   - Default template:

     > "Hi {name} — weekly update time. Three questions, 2 minutes:
     > (1) What shipped this week? (2) What's blocked, and what do
     > you need from me to unblock? (3) What's next week's biggest
     > bet? Reply here whenever you have 2 minutes — due by EOD
     > {reviewDay}."

   **Note the carve-out from workspace-level hard nos:** this
   skill sends internal team reminders. It is NOT sending external
   communications. External sends are still prohibited.

4. **Wait for responses.** User sets the window (default: until
   EOD of `rhythm.json.reviewDay`, or 48h from send if rhythm isn't
   configured). If the user invokes the skill a second time in the
   same week, consume the window-so-far.

5. **Collect responses.** Pull the replies from the same chat /
   inbox tool, matched by thread / conversation.

6. **Analyze alignment** with active priorities from
   `company-operating-context.md`:

   - **On track** — shipped items that ladder up to an active
     priority.
   - **Drifting** — work happening that doesn't ladder.
   - **Blocked** — stated blockers, with who's expected to unblock.
   - **Silent** — team members who didn't respond.

7. **Write** the roundup to `updates/{YYYY-MM-DD}-roundup.md`
   with the four sections + a "What founder should do" list at the
   bottom (1-3 items: unblock {person} on {thing}, re-scope
   {project}, recognize {win}).

8. **Atomic writes** — `*.tmp` → rename.

9. **Append to `outputs.json`** with `type: "updates"`, status
   "ready".

10. **Summarize to user** — counts (N on track / M drifting / P
    blocked / Q silent) + the top founder-action from the
    roundup.

## Outputs

- `updates/{YYYY-MM-DD}-roundup.md`
- Appends to `outputs.json` with `type: "updates"`.

## What I never do

- **Send reminders to external contacts.** The Team section in
  operating context is the allowlist; everyone else is external.
- **Modify HRIS / payroll records** on the back of collected
  updates — read-only on systems of record.
- **Run if the Team section is missing.** Stop with the "no team
  yet" message; do not try to DIY a team list from other sources.
