---
name: define-operating-context
description: Use when the user says "set up our operating context" / "draft the operating doc" / "document how we work" — drafts or updates the shared `company-operating-context.md` at the agent root, the single source of truth the Vendor & Procurement Ops agent reads before acting.
---

# Define Operating Context

The Head of Operations OWNS `company-operating-context.md`. No other
agent writes it. This skill creates or updates it. Its existence is
what unblocks the Vendor & Procurement Ops agent.

## When to use

- "set up our operating context" / "draft the operating doc" /
  "document how we work".
- "update the operating context" / "priorities changed, fix the doc".
- Called implicitly by any other skill that needs the context doc and
  finds it missing — but only after confirming with the user.

## Steps

1. **Read config.** Load `config/company.json`, `config/rhythm.json`,
   `config/voice.md`. If any is missing, run `onboard-me` first (or
   ask the ONE missing piece just-in-time with the best-modality
   hint: connected app > file > URL > paste).

2. **Read the existing doc if present.** If
   `company-operating-context.md` exists, read it so this run is an
   update, not a rewrite. Preserve anything the founder has already
   sharpened; change only what's stale or new.

3. **Ask for the pieces config can't cover.** Before drafting, ask
   the founder concisely for:
   - **Key contacts** — names + role + how-to-reach for: lead
     investor, closest advisor, 1-2 anchor customers, fractional
     legal/finance, ops contractor (if any).
   - **Vendor posture** — risk appetite (conservative / balanced /
     fast), signature authority (founder only / any exec), term
     preference (monthly / annual / case-by-case), paper preference
     (ours / theirs / whatever).
   - **Hard nos** — anything founder-specific on top of the
     workspace-level four (never move money, never modify
     HRIS/payroll, never decide procurement alone, never send
     external without approval).
   - **Connected tools** (by Composio category, not brand) — inbox,
     calendar, team-chat, drive, meeting-recording, CRM (if any),
     billing (if any), web-research, news, social.

   If a section is thin, mark `TBD — {what the founder should bring
   next}` and move on. Never invent.

4. **Draft the doc (~300-500 words, opinionated, direct).** Structure,
   in this order:

   1. **Company overview** — one paragraph: what we make, who for,
      stage, why now.
   2. **Active priorities** — 2-3 things moving the company this
      quarter. The approval-flow rubric + weekly review key off these.
   3. **Operating rhythm** — deep-work days, meeting days, review
      cadence, no-meeting days, timezone.
   4. **Key contacts** — names, roles, how to reach. Organized by
      category (investors, advisors, anchor customers, contractors,
      legal).
   5. **Tools & systems** — connected Composio categories + where
      data lives (primary drive, CRM, project tool, chat, billing).
   6. **Vendors & spend posture** — risk appetite, signature
      authority, term preferences, paper preferences.
   7. **Hard nos** — workspace-level four + founder-specific.
   8. **Communication voice** — 4-6 bullets on tone, forbidden
      phrases, sentence-length preference. Pulled from
      `config/voice.md`.

5. **Write atomically.** Write to
   `company-operating-context.md.tmp`, then rename to
   `company-operating-context.md`. Single file at agent root. NOT
   under a subfolder. NOT under `.agents/`. NOT under
   `.houston/<agent>/`.

6. **DO NOT append to `outputs.json`.** This doc is live; it is not
   a deliverable and is not indexed.

7. **Summarize to user.** One paragraph: what you captured, what's
   still `TBD`, and the exact next move (e.g. "send me your advisor
   list and I'll tighten Key Contacts"). Remind them the Vendor &
   Procurement Ops agent now has the context it needs to run.

## Outputs

- `company-operating-context.md` (at the agent root — live document)

(No entry in `outputs.json` — by design.)
