# Founder Operations Workspace — Team Guide

Who this is for, who we're hiring (in agent form), and how the two
agents split the work.

**Audience:** solo founder, week 0 — doing all the ops themselves
before any ops hire. Pre-OS. No chief of staff, no ops lead, no
procurement manager, no IT admin. This workspace is their first
"ops hire."

**Out of scope for this workspace** (these are — or will be —
separate verticals):

- **HR / people ops** — hiring, onboarding, payroll, IT account
  provisioning for humans.
- **Finance / accounting** — AP/AR, close, runway, invoicing,
  budgeting.

Everything else that keeps the company running — the founder's
weekly rhythm, meeting prep, inbox ops, external signal, vendor
contracts, SaaS spend, compliance checks, renewal tracking — is in
scope.

**Tool stance:** the founder's stack is unknown and changeable.
Every external tool goes through Composio, discovered at runtime
with `composio search <category>`. No skill hardcodes a provider.

**Hard nos** (encoded into every skill):

1. **Never move money.** No executing payments, approving invoices,
   or modifying payroll. Read-only on financial transactions.
2. **Never modify HRIS/payroll records.** Can read and prepare but
   cannot commit changes to systems of record.
3. **Never make procurement decisions alone.** Can research,
   recommend, and draft — but every signature / renewal / cancel
   goes through the founder.
4. **Never send external messages.** Drafts only. Every outbound
   message lands in the founder's inbox as a draft.

---

## The two agents

| Agent | Role a human would hold | Owns |
|---|---|---|
| **Head of Operations** (coordinator) | Chief of Staff + Executive Assistant + internal process owner | `company-operating-context.md` — the shared ops doc every other agent reads. |
| **Vendor & Procurement Ops** (specialist) | Procurement manager + SaaS admin + vendor risk officer | Contract library + renewal calendar + supplier records + SaaS inventory. |

The split passes the "hire test": at a 15-person company you'd
hire one person for each. At week 0, the founder is both. This
workspace gives them both.

### Why two, not three

We considered splitting "Executive Assistant" (inbox + meeting
prep + daily brief) out from "Chief of Staff" (weekly rhythm +
operating context + approvals). For a solo founder, the rhythm is
seamless — the morning brief IS the meeting prep IS the inbox
triage. A single Head of Operations keeps the daily flow in one
chat. Once the company hires an actual EA (~15 heads), we can
split.

### Why not one

A single "Ops agent" doing CoS + procurement would carry 15+ skills
and two completely distinct mental models. Contract clause
extraction isn't chief-of-staff work — it's a specialist skillset
a lawyer-adjacent operator does. Collapsing them buries the
specialist behind the generalist's framing.

---

## The coordinator pattern

The **Head of Operations** owns **`company-operating-context.md`** at its
agent root. This is the single highest-leverage file in the
workspace. The Vendor agent reads it before every substantive
skill invocation:

> "Before I do anything real, I read
> `../head-of-operations/company-operating-context.md`. If that
> file is missing or empty, I stop and tell you to spend a few
> minutes with Head of Operations on `define-operating-context`
> first. I do not invent your company."

Non-negotiable rules for this file:

- **Only the Head of Operations writes it.** `define-operating-context`
  creates or updates it. No other skill on any agent edits it.
- **It lives at the Head of Operations root**, not under a subfolder,
  not under `.agents/`, not under `.houston/`.
- **It is a live document, not a deliverable.** It is NOT recorded
  in `outputs.json`.
- **Atomic writes.** `.tmp` → rename. Never partial markdown.

Structure of `company-operating-context.md` (~300–500 words,
opinionated, direct):

1. **Company overview** — what we do, stage, size, one-line identity.
2. **Active priorities** — the 2-3 things moving the company this
   quarter. The approval-flow rubric + weekly review key off this.
3. **Operating rhythm** — founder's default week shape (deep-work
   days, meeting days, review cadence, no-meeting days).
4. **Key contacts** — who the founder can ask for what (investors,
   advisors, customer anchors, ops contractors, legal). Names,
   roles, how to reach.
5. **Tools & systems** — what's connected (via Composio categories,
   not providers) + where data lives (primary drive, CRM, project
   tool, chat, billing). This is what the agents read from.
6. **Vendors & spend posture** — size of vendor book, risk appetite,
   signature authority, standard terms preference (monthly vs
   annual, paper preference, etc.). The Vendor agent reads this
   directly.
7. **Hard nos** — founder-specific things the agents must never do
   without explicit approval. Inherits the four workspace-level
   hard nos + anything founder-specific they add in onboarding.
8. **Communication voice** — how the founder writes. Pulled from
   `config/voice.md`. Every drafted message reads from here.

---

## Agent roster — detail

### 1. Head of Operations

**Lucide icon:** `Anchor`
**Category:** `business`
**Description (one-paragraph):** Your Chief of Staff. I run your
weekly rhythm — morning brief, meeting prep, inbox triage, the
Monday review — and I own `company-operating-context.md`, the
shared ops doc every other agent in this workspace reads before
acting. I never send, post, or commit to external systems; you
approve every outbound.

#### Skills

1. `onboard-me` — mandatory, fixed shape. Scope + modality preamble → 3 questions (company, operating rhythm, voice) → writes `config/`. *Template: follow `founder-marketing-workspace/agents/head-of-marketing/.agents/skills/onboard-me/SKILL.md` verbatim in shape, retarget topics.*
2. `define-operating-context` — creates/updates `company-operating-context.md` at the agent root.
3. `brief-me` — daily morning brief; aggregates inbox, calendar, chat, recent drive activity into a prioritized today-plan; accepts an optional brain-dump input.
4. `prep-meeting` — pre-meeting intel brief OR post-meeting summary (transcript + decisions + action items). Pre- vs post- is mode-selected from the user phrasing.
5. `triage-inbox` — classifies inbox into needs-me / can-wait / ignore; summarizes each bucket; never replies.
6. `draft-reply` — writes draft responses for inbound emails; saves as drafts in the inbox; never sends.
7. `synthesize-signal` — research + news-feed + social-feed → structured briefing. Covers news monitoring, weekly market pulse, ad-hoc "read up on X and give me a brief."
8. `collect-updates` — OKR / weekly-update collection loop for when there's a team to collect from. Dormant for true solo founder; no-ops with a friendly message.
9. `run-weekly-review` — Monday rollup across this agent's outputs + Vendor agent's `outputs.json`; flags gaps, surfaces next moves, writes to `reviews/{YYYY-MM-DD}.md`.
10. `run-approval-flow` — generic rubric-runner for inbound applications (vendor apps, advisor proposals, partnership inbounds). Ops-generic; the vendor-specific version is `evaluate-supplier`.

#### Use cases (houston.json `useCases`)

Already itemized in the research MD's "Proposed NEW use cases → Head of Operations" table — map 1:1 into `useCases[]` with `title` / `blurb` / `prompt` / `fullPrompt` / `category` / `outcome` / `skill` / optional `tool`.

**Categories for grouping on the Overview dashboard:** `Foundation`
(define-operating-context) · `Daily rhythm` (brief-me, prep-meeting,
triage-inbox, draft-reply) · `Weekly rhythm` (collect-updates,
run-weekly-review) · `Signal` (synthesize-signal) · `Approvals`
(run-approval-flow).

**`useCases[0]`** = "Set up our operating context" → `define-operating-context`. This is the "Start here" mission because nothing else unblocks without this doc.

#### Data schema (agent root)

```
agents/head-of-operations/
├── company-operating-context.md       # LIVE doc — owned here, not in outputs.json
├── outputs.json                       # dashboard index
├── config/                             # profile.json, company.json, rhythm.json, voice.md
├── briefs/                             # daily briefs by date: brief-{YYYY-MM-DD}.md
├── meetings/                           # meetings/{slug}-{YYYY-MM-DD}.md (pre- and post-)
├── triage/                             # triage/{YYYY-MM-DD}.md
├── drafts/                             # drafts/{slug}.md (human-readable record; actual draft lives in email)
├── signals/                            # signals/{topic}-{YYYY-MM-DD}.md
├── updates/                            # updates/{YYYY-MM-DD}-roundup.md
├── reviews/                            # reviews/{YYYY-MM-DD}.md
└── approvals/                          # approvals/{slug}.md
```

`outputs.json` entry types: `brief` · `meeting-pre` · `meeting-post` · `triage` · `draft` · `signal` · `updates` · `review` · `approval`. *(Note: `operating-context` is deliberately absent — the context doc is live, not indexed.)*

### 2. Vendor & Procurement Ops

**Lucide icon:** `Handshake`
**Category:** `business`
**Description (one-paragraph):** Your procurement manager. I maintain
the contract library, track renewals, evaluate suppliers, run
compliance due-diligence, audit SaaS spend, and draft vendor
outreach — but never sign, send, or renew without your explicit
approval.

#### Skills

1. `onboard-me` — topics: primary contract repository, current
   vendor list (any file or paste), approval posture (signature
   authority, preferred terms).
2. `extract-contract-clauses` — one or many contracts → structured
   clause extraction (liability, termination, auto-renew, payment,
   IP, SLA, data handling). Writes to `contracts/{vendor}-{slug}.md`.
3. `evaluate-supplier` — rubric-based supplier due-diligence: score
   1-10, risk tier green/yellow/red, strengths + concerns,
   recommendation.
4. `research-compliance` — compliance background on a company
   (frameworks held, CCO + LinkedIn, recent public incidents).
5. `track-renewals` — reads the contract library, extracts
   renewal dates, builds a renewal calendar with lead-time flags
   (90 / 60 / 30 / 7 days out).
6. `audit-saas-spend` — aggregates subscriptions from contracts +
   connected billing / inbox, flags duplicates, unused tools,
   annualized spend, top 3 cancel candidates.
7. `draft-vendor-outreach` — negotiation, cancel, trial-request
   drafts. Reads `config/voice.md` + `../head-of-operations/company-operating-context.md`. Never sends.

#### Use cases (houston.json `useCases`)

Mapped in the research MD's Vendor table — one use case per skill,
most as first-prompts.

**Categories:** `Contracts` (extract-contract-clauses, track-renewals) · `Suppliers` (evaluate-supplier, research-compliance) · `Spend` (audit-saas-spend) · `Outreach` (draft-vendor-outreach).

**`useCases[0]`** = "Audit my SaaS spend — what am I paying for?" — because most solo founders don't actually know, and the first-meeting "oh that's what I'm paying" moment is the best demo.

#### Data schema (agent root)

```
agents/vendor-procurement-ops/
├── outputs.json
├── config/                             # profile.json, procurement.json (signature authority, preferred terms), voice.md
├── contracts/                          # contracts/{vendor}-{slug}.md (clause extractions)
├── suppliers/                          # suppliers/{supplier-slug}.md (evaluations)
├── compliance/                         # compliance/{company-slug}.md
├── renewals/                           # renewals/calendar.md (living file) + renewals/{YYYY-QN}-digest.md
├── spend/                              # spend/{YYYY-MM-DD}-audit.md
└── outreach/                           # outreach/{vendor}-{topic}-{YYYY-MM-DD}.md
```

Cross-agent read: `../head-of-operations/company-operating-context.md` (required before every substantive skill). Every non-onboard skill on this agent opens with:

```
1. Read ../head-of-operations/company-operating-context.md. If missing or empty,
   stop and tell the user to run Head of Operations' define-operating-context
   skill first. Do not invent the company.
```

`outputs.json` entry types: `contract` · `supplier` · `compliance` · `renewal-digest` · `spend-audit` · `outreach-draft`. *(Note: `renewals/calendar.md` is live, NOT indexed — like the operating-context doc on HoO. Digest snapshots ARE indexed.)*

---

## Build order

1. **Head of Operations first** — it owns the shared doc. Until the
   doc exists, the Vendor agent stops. So we need HoO shipped and
   tested before the Vendor agent is usable.
2. **Vendor & Procurement Ops second** — reads the shared doc,
   specialist surface.
3. **Workspace-level ship** — `workspace.json`, root `README.md`,
   `scripts/bundle_template.js` + `scripts/generate_bundles.py`,
   run generator, smoke test, commit, push.

---

## Reference implementations to copy

Follow these exactly; don't invent new conventions:

- **Workspace-level build contract:** `../founder-marketing-workspace/BUILD-CONVENTIONS.md` (hard rules, file tree, `houston.json` template, `SKILL.md` template, `useCases` writing rules — the 4-field prompt model, Overview dashboard rules).
- **Role-agent full contract:** `../role-agents-workspace/role-agent-guide.md` (696-line spec).
- **Coordinator reference:** `../founder-marketing-workspace/agents/head-of-marketing/` — same pattern (owns a shared markdown doc; first tab is `overview`; `agentSeeds` includes the seeded onboarding card + `outputs.json: "[]"`).
- **Overview dashboard:** `../founder-marketing-workspace/scripts/bundle_template.js` — copy verbatim, including the injected `<style>` block (do NOT rely on Tailwind classes). `scripts/generate_bundles.py` — copy verbatim, rename the `ACCENTS` dict for two agents only (we still pass an accent because the template expects the key, but we use the SAME monochrome palette in practice).
- **Onboarding shape:** `head-of-marketing/.agents/skills/onboard-me/SKILL.md` — scope + modality preamble, 3 questions, hand-off line. Our two agents re-target the 3 topics; shape stays.
- **Canonical single-agent shape:** `../sdr-agent/` — for when a contributor is unsure what goes where.

---

## Open questions before build

None blocking. The user has locked:

- Audience: solo founder, week 0.
- Scope: chief of staff + vendor/procurement/IT (HR + finance are separate verticals).
- Tool stance: fully tool-agnostic via Composio.
- Hard nos: never move money, never modify HRIS/payroll, never make procurement decisions alone.

If the user wants to adjust the split (e.g. carve out an explicit EA agent later), that's a post-v1 refactor, not a v1 blocker.

---

## Done criteria (workspace-level)

Mirrors the checklist in `../BUILDING-A-VERTICAL.md` "Done criteria for a vertical":

- [ ] Research MD committed at `research/operations/2026-04-22-gumloop.md`.
- [ ] This team guide committed at workspace root.
- [ ] Head of Operations: `houston.json`, `CLAUDE.md`, `README.md`, `data-schema.md`, 10 `SKILL.md` files, `icon.png`, `.gitignore`, generated `bundle.js`.
- [ ] Vendor & Procurement Ops: `houston.json`, `CLAUDE.md`, `README.md`, `data-schema.md`, 8 `SKILL.md` files, `icon.png`, `.gitignore`, generated `bundle.js`.
- [ ] Every non-onboard Vendor skill opens with the "read the shared doc or stop" rule.
- [ ] `scripts/generate_bundles.py` runs green for both agents; Node shim verifies `__houston_bundle__.Dashboard`.
- [ ] `workspace.json` lists both agents.
- [ ] Root `README.md` has install one-liner + first-prompts block per agent.
- [ ] Local smoke test: install to `~/.houston/agents/`, restart Houston, open each agent's Overview, click every tile, confirm clipboard payload matches `fullPrompt`.
- [ ] Committed + pushed (specific files — never `git add -A`).
