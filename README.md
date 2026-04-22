# Founder Operations Workspace

Two AI ops hires for a solo founder at week 0 — a Chief of Staff who
runs the weekly rhythm and owns the shared operating-context doc,
and a Procurement specialist who maintains the contract library,
tracks renewals, audits SaaS spend, and drafts vendor outreach.

Chat-first. Markdown outputs. Tool-agnostic via Composio.

## Scope

**In scope:**

- Business ops / chief of staff — weekly brief, meeting prep, inbox
  triage, internal comms, signal monitoring, approval flows.
- Vendor / procurement / IT — contracts, renewals, suppliers,
  compliance research, SaaS spend, vendor outreach.

**Out of scope** (separate verticals):

- HR / people ops — hiring, onboarding, payroll, IT account
  provisioning for humans.
- Finance / accounting — AP/AR, close, runway, invoicing, budgeting.

## Hard nos (across the whole workspace)

Every skill encodes these:

1. **Never move money** — no payments, no payroll changes,
   read-only on financial transactions.
2. **Never modify HRIS / payroll records** — can read and prepare,
   never commit to systems of record.
3. **Never make procurement decisions alone** — recommend, don't
   sign.
4. **Never send external messages** — drafts only; every outbound
   lands as a draft for founder approval.

## Install

In Houston: **Add workspace from GitHub → paste this repo's URL**.
Both agents install together.

## Agents

### Head of Operations (coordinator)

**Owns** `company-operating-context.md` — the shared ops doc every
other agent reads.

First prompts:

- "Help me set up our operating context."
- "Give me the morning brief — what needs me today?"
- "Here's my brain dump — turn it into today's plan."
- "Prep me for my 2pm with {name}."
- "Post-meeting note from my last recording."
- "Triage my inbox — what needs me and what can wait?"
- "Draft responses to the inbound emails — save as drafts."
- "Weekly briefing on {topic}."
- "Collect this week's updates from the team."
- "Give me the Monday ops review."
- "Review this inbound against our criteria."

### Vendor & Procurement Ops (specialist)

Reads `../head-of-operations/company-operating-context.md` before
every substantive skill.

First prompts:

- "Audit my SaaS spend — what am I paying for?"
- "Pull the liability + termination + auto-renew clauses from this MSA."
- "Build my renewal calendar — what's renewing in the next 90 days?"
- "Evaluate {supplier} for {product} — is this a fit?"
- "Run compliance due-diligence on {vendor} before we sign."
- "Draft a renewal-negotiation email to {vendor}. Don't send."

## Start here

1. Open the **Head of Operations** agent.
2. Click the **Onboard me** card in Activity → send any message. 3
   questions, ~90 seconds.
3. Say **"Help me set up our operating context."**
4. The moment that doc exists, open **Vendor & Procurement Ops**,
   onboard it, and try **"Audit my SaaS spend."**

## Build

To regenerate the Overview dashboards after editing `useCases` in
either agent's `houston.json`:

```bash
python3 scripts/generate_bundles.py
```

The script writes `agents/{agent-id}/bundle.js` for both agents and
verifies each loads via a Node shim.

## Reference docs

- Research MD: `research/operations/2026-04-22-gumloop.md` — 46
  scraped Gumloop templates with Houston mapping verdicts.
- Team design: `TEAM-GUIDE.md` — why two agents, the coordinator
  pattern, per-agent skill lists, build order.
- Vertical-building meta: `../BUILDING-A-VERTICAL.md`.
- Build conventions: `../founder-marketing-workspace/BUILD-CONVENTIONS.md`
  (workspace-scoped override for the role-agent contract).
- Full role-agent contract: `../role-agents-workspace/role-agent-guide.md`.

## License

Same as the rest of houston-skills.
