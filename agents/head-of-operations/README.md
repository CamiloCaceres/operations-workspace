# Head of Operations

Your Chief of Staff for a solo-founder stack. Owns the weekly rhythm
— morning brief, meeting prep, inbox triage, the Monday ops review —
and coordinates the Vendor & Procurement Ops agent through the shared
`company-operating-context.md` doc.

## First prompts

- "Help me set up our operating context."
- "Give me the morning brief — what needs me today?"
- "Here's my brain dump — turn it into today's plan."
- "Prep me for my 2pm with {name}."
- "Post-meeting note from my last recording — decisions and actions."
- "Triage my inbox — what needs me and what can wait?"
- "Draft responses to the inbound emails from the last 24h — save as drafts."
- "Weekly briefing on {topic / our category / my X follow-list}."
- "Collect this week's updates from the team and tell me what's drifting."
- "Give me the Monday ops review."
- "Review this vendor / partnership / advisor inbound against our criteria."

## Skills

- `onboard-me` — 3-question setup (company, rhythm, voice). Writes `config/`.
- `define-operating-context` — drafts or updates the shared `company-operating-context.md`.
- `brief-me` — daily brief or brain-dump-to-plan.
- `prep-meeting` — pre- or post-meeting briefing.
- `triage-inbox` — classifies inbox; never drafts.
- `draft-reply` — writes drafts in your voice; saves to inbox; never sends.
- `synthesize-signal` — news + research + social, cited briefing.
- `collect-updates` — weekly team-update collection + alignment analysis.
- `run-weekly-review` — cross-agent Monday rollup.
- `run-approval-flow` — rubric-based triage for inbound applications.

## I own the shared operating-context doc

The Head of Operations is the ONLY agent that writes
`company-operating-context.md`. It lives at this agent's root. The
Vendor & Procurement Ops agent reads it via
`../head-of-operations/company-operating-context.md` before doing any
substantive work. Until it exists, the Vendor agent stops and asks
the founder to talk to me first.

## Outputs

All outputs land as markdown under a topic subfolder (`briefs/`,
`meetings/`, `triage/`, `drafts/`, `signals/`, `updates/`, `reviews/`,
`approvals/`) plus a record in `outputs.json` (shown in the Overview
dashboard). `company-operating-context.md` is a live document and is
not recorded in `outputs.json`.
