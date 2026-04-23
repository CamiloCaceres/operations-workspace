# Chief of Staff — Data Schema

All records share these base fields:

```ts
interface BaseRecord {
  id: string;          // UUID v4
  createdAt: string;   // ISO-8601 UTC
  updatedAt: string;   // ISO-8601 UTC
}
```

All writes are atomic: write to a sibling `*.tmp` file, then rename.
Never edit in-place. Never write anywhere under `.houston/<agent>/`
at runtime — the watcher skips those paths. Exception: the seeded
`.houston/activity.json` onboarding card at install time.

---

## Config — what the agent learns about the user

Nothing in `config/` is shipped in the repo. Every file appears at
runtime, written by `onboard-me` or progressive capture.

### `config/profile.json`

```ts
interface Profile {
  userName: string;
  onboardedAt: string;
  status: "onboarded" | "partial";
}
```

### `config/investor-cadence.json`

```ts
interface InvestorCadence {
  updateCadence: "monthly" | "quarterly" | "ad-hoc";
  nextUpdateDueAt?: string;       // ISO-8601 date
  board: {
    frequency: "monthly" | "quarterly" | "ad-hoc" | "none";
    nextAt?: string;              // ISO-8601 date
  };
  capturedAt: string;
}
```

### `config/okrs.json`

```ts
interface OkrSet {
  period: string;                 // e.g. "2026-Q2"
  objectives: Objective[];
  lastRefreshedAt: string;
}
interface Objective {
  id: string;
  title: string;
  owner?: string;
  keyResults: KeyResult[];
  state: "on-track" | "at-risk" | "off-track";
  linkedInitiativeSlugs?: string[];
}
interface KeyResult {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  state: "on-track" | "at-risk" | "off-track";
  expectedProgressCurve?: "linear" | "front-loaded" | "back-loaded";
  reason?: string;                // set when at-risk / off-track
}
```

### `config/decision-framework.md`

Markdown — who decides what (RACI, decision-rights). Captured
progressively; used by `log-decision` to decide if a decision is
`pending` (needs CEO) or `decided` (owner declared).

### `config/leadership-team.json` (optional — solo-founder default empty)

```ts
interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  domain: "engineering" | "product" | "sales" | "marketing"
        | "success" | "finance" | "people" | "ops" | "other";
  email?: string;
}
```

Empty on install — the solo founder is the whole team. When hires
land, the user lists them here (or `identify-bottleneck` asks once).

### `config/voice.md`

Markdown — usually shared with other agents via `../head-of-
operations/config/voice.md` or the operating context's voice block.
This agent reads voice before drafting investor updates.

---

## Domain data — what the agent produces

### `outputs.json` — dashboard index

```ts
interface Output extends BaseRecord {
  type: "board-pack"
       | "investor-update"
       | "decision"
       | "bottleneck"
       | "okr-snapshot";
  title: string;
  summary: string;
  path: string;
  status: "draft" | "ready";
}
```

### `decisions.json` — live ADR index

```ts
interface DecisionRecord extends BaseRecord {
  slug: string;
  title: string;
  summary: string;              // 1-line — generalized if sensitive
  status: "pending" | "decided" | "superseded";
  decidedBy?: string;
  decidedAt?: string;
  linkedInitiativeSlugs?: string[];
  considered: string[];         // alternatives, short names
  rationale?: string;
}
```

Backed by `decisions/{slug}/decision.md` (the full ADR).

### `bottlenecks.json` — live bottleneck index

```ts
interface BottleneckRecord extends BaseRecord {
  slug: string;
  title: string;                // generalized — no named person
  hypothesis: string;           // 1-2 sentences
  proposedOwner?: string;
  impactOnOkrIds: string[];
  impactOnInitiativeSlugs: string[];
  status: "open" | "resolved" | "stale";
  evidence: string[];           // cite paths / slugs
}
```

### `okr-history.json` — live snapshot index

```ts
interface OkrSnapshot extends BaseRecord {
  objectiveId: string;
  date: string;                 // YYYY-MM-DD
  keyResults: { id: string; value: number; state: KeyResult["state"] }[];
  state: Objective["state"];
}
```

### Topic subfolders

| Subfolder | Written by | Filename pattern | Content |
|-----------|------------|------------------|---------|
| `board-packs/` | `prep-board-pack` | `{yyyy-qq}/board-pack.md` | Standard 8-section board pack. |
| `investor-updates/` | `draft-investor-update` | `{yyyy-qq}/update.md` | CEO-voice investor narrative. |
| `decisions/` | `log-decision` | `{slug}/decision.md` | Full ADR. |
| `bottlenecks/` | `identify-bottleneck` | `{slug}.md` (optional per-bottleneck detail) | Longer narrative; the JSON index is the primary surface. |
| `okr-tracker/` | (future) | `{period}/notes.md` | Free-form OKR notes per period. |

---

## Cross-agent reads

Before every substantive (non-onboard-me) skill, this agent reads
(never writes):

- `../head-of-operations/company-operating-context.md` — active
  priorities, key contacts (board, investors, leadership team),
  voice. If missing or empty, the skill stops and tells the user
  to run Head of Operations' `define-operating-context` first.

Additional cross-agent reads (defensive — only if available):

- `../head-of-operations/reviews/` — recent weekly reviews, used by
  `identify-bottleneck` as evidence source.
- `../data-analyst/metrics-daily.json` +
  `../data-analyst/rollups/` — metrics for board pack / investor
  update. Preferred handoff: invoke a Data Analyst skill and cite
  the query rather than recomputing here.

Each cross-agent read handles missing gracefully — if the sibling
agent isn't installed or has no outputs yet, note as "not
available" and continue (asking the user to paste if critical).

---

## Write discipline

- **Atomic writes.** `{file}.tmp` → rename.
- **IDs** UUID v4.
- **Timestamps** ISO-8601 UTC.
- **Never write under `.houston/<agent>/` at runtime.**
- **Live indices** (`decisions.json`, `bottlenecks.json`,
  `okr-history.json`) are indices — updated in place; substantive
  artifacts (board packs, investor updates, ADRs) also land in
  `outputs.json`.

---

## Hard rules — what this agent never writes

- **The operating context file** at `../head-of-operations/`. Only
  the Head of Operations writes it.
- **Sensitive specifics** into indexed JSON. Performance, comp, or
  exit specifics stay in a chat message to the founder — indexed
  rows get generalized language.
- **Invented metrics or quotes** into any draft. Mark `{TBD —
  provide before sending}` and list the gaps in chat.
