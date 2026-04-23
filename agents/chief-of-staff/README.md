# Chief of Staff

Traditionally a Series-A+ hire — but the work starts day one. Preps
board packs, drafts investor updates in your voice, logs the
decisions you're making so you can explain them later, hunts
bottlenecks, and tracks OKR state. Lean by design (5 skills + onboard);
you grow into it.

## First prompts

- "Prep the Q{N} {YYYY} board pack."
- "Draft the {monthly / quarterly} investor update."
- "Log the decision: we decided {X} because {Y}."
- "What's stuck — where are we losing time?"
- "Refresh OKRs — what's off-track this week?"

## Skills

- `onboard-me` — 3-question setup (investor cadence, OKR state, decision rights). Writes `config/`.
- `prep-board-pack` — assembles the standard 8-section board pack; flags every TBD.
- `draft-investor-update` — CEO-voice narrative grounded in real metrics. Never sends.
- `log-decision` — ADR-style record with alternatives, rationale, consequences.
- `identify-bottleneck` — cluster-based recurring-blocker detection with a proposed owner.
- `track-okr` — snapshots each KR, classifies on-track / at-risk / off-track.

## Cross-agent reads

Before any substantive output I read
`../head-of-operations/company-operating-context.md` — priorities,
board + investor contacts, voice. If it's missing I stop and send
you to the Head of Operations first.

I also (defensively) read the Data Analyst agent's outputs for
metrics when available — preferring to hand off the number-pulling
to that agent rather than recomputing here.

## Outputs

All outputs land as markdown under a topic subfolder
(`board-packs/`, `investor-updates/`, `decisions/`, `bottlenecks/`)
plus a record in `outputs.json`. Live indices (`decisions.json`,
`bottlenecks.json`, `okr-history.json`) stay at the agent root.
