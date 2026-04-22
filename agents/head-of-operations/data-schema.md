# Head of Operations — Data Schema

All records share these base fields:

```ts
interface BaseRecord {
  id: string;          // UUID v4
  createdAt: string;   // ISO-8601 UTC
  updatedAt: string;   // ISO-8601 UTC
}
```

All writes are atomic: write to a sibling `*.tmp` file, then rename
onto the target path. Never edit in-place. Never write anywhere under
`.houston/<agent>/` — the Houston file watcher skips those paths and
reactivity breaks. Exception: the seeded `.houston/activity.json`
onboarding card at install time is fine; the agent never writes there
at runtime.

---

## Config — what the agent learns about the user

Nothing in `config/` is shipped in the repo. Every file appears at
runtime, written by `onboard-me` or progressive capture.

### `config/profile.json`

```ts
interface Profile {
  userName: string;
  company: string;
  role?: string;
  onboardedAt: string;
  status: "onboarded" | "partial";
}
```

### `config/company.json`

```ts
interface Company {
  name: string;
  oneLine: string;
  stage?: "pre-seed" | "seed" | "a" | "b" | "later" | "bootstrapped";
  url?: string;
  activePriorities: string[];   // 2-3 things moving the co this quarter
  source: "paste" | "url" | "file";
  capturedAt: string;
}
```

### `config/rhythm.json`

```ts
interface Rhythm {
  workingHours?: { start: string; end: string; timezone: string };
  deepWorkDays?: string[];       // e.g. ["Mon","Wed","Fri"]
  meetingDays?: string[];        // e.g. ["Tue","Thu"]
  reviewDay?: string;            // e.g. "Mon"
  weeklyReviewTime?: string;     // e.g. "09:00"
  briefDeliveryTime?: string;    // e.g. "08:30"
  source: "paste" | "inferred";
  capturedAt: string;
}
```

### `config/voice.md`

Markdown. 3–5 verbatim samples of the user's writing plus a short
"tone notes" block (greeting habits, sentence length, formality,
quirks). Refreshable.

### `config/approval-rubrics.md`

Markdown. Default rubrics per inbound-type (`vendor-app`,
`partnership`, `advisor`, `press`). Each rubric is a short list of
criteria + weight + pass/fail thresholds. Editable by the user,
rewritten atomically by `run-approval-flow` when the founder says
"update the rubric."

---

## The shared operating-context doc

### `company-operating-context.md` — written by `define-operating-context`

**Special file.** Lives at the agent root (NOT in a subfolder, NOT
under `.agents/`, NOT under `.houston/`). The single source of truth
for how the company runs.

- The Head of Operations is the ONLY agent that writes it.
- The Vendor & Procurement Ops agent reads it via
  `../head-of-operations/company-operating-context.md` before any
  substantive output. If missing, it stops and tells the user to run
  the Head of Operations first.
- It is a live document, NOT a deliverable — it is **not** recorded
  in `outputs.json`.

Structure (markdown, ~300-500 words):

1. Company overview (what + stage + one-line identity)
2. Active priorities (2-3 this quarter)
3. Operating rhythm (deep-work days, meeting days, review cadence)
4. Key contacts (investors, advisors, anchor customers, ops contractors, legal)
5. Tools & systems (connected Composio categories + where data lives)
6. Vendors & spend posture (risk appetite, signature authority, term preferences)
7. Hard nos (workspace-level + founder-specific)
8. Communication voice (pointer to `config/voice.md` + tone notes)

---

## Domain data — what the agent produces

### `outputs.json` — dashboard index

Single array at the agent root. Every substantive artifact appends an
entry. Read-merge-write atomically — never overwrite the whole array.

```ts
interface Output extends BaseRecord {
  type: "brief"            // brief-me
       | "meeting-pre"     // prep-meeting (pre-meeting mode)
       | "meeting-post"    // prep-meeting (post-meeting mode)
       | "triage"          // triage-inbox
       | "draft"           // draft-reply
       | "signal"          // synthesize-signal
       | "updates"         // collect-updates
       | "review"          // run-weekly-review
       | "approval";       // run-approval-flow
  title: string;
  summary: string;
  path: string;            // relative to agent root
  status: "draft" | "ready";
}
```

- Mark `draft` while iterating. Flip to `ready` on sign-off.
- On update: refresh `updatedAt`, never touch `createdAt`.

### Topic subfolders

All markdown artifacts. One file per deliverable.

| Subfolder | Written by | Filename pattern | Content |
|-----------|------------|------------------|---------|
| `briefs/` | `brief-me` | `{YYYY-MM-DD}.md` (daily) or `{YYYY-MM-DD}-dump.md` (brain-dump) | Fires, meetings, what changed, deferrals, single most important move. |
| `meetings/` | `prep-meeting` | `{slug}-{YYYY-MM-DD}-pre.md` or `-post.md` | Pre: attendees/history/talking-points. Post: decisions/actions/open-questions. |
| `triage/` | `triage-inbox` | `{YYYY-MM-DD}.md` | Inbox classified: needs-me / can-wait / ignore + ranked actions. |
| `drafts/` | `draft-reply` | `{slug}.md` | Human-readable record of a draft (actual draft lives in the email provider). |
| `signals/` | `synthesize-signal` | `{topic-slug}-{YYYY-MM-DD}.md` | News/research/social brief with citations. |
| `updates/` | `collect-updates` | `{YYYY-MM-DD}-roundup.md` | On-track / drifting / blocked, with contributor attribution. |
| `reviews/` | `run-weekly-review` | `{YYYY-MM-DD}.md` | Cross-agent rollup + gaps + next moves. |
| `approvals/` | `run-approval-flow` | `{slug}.md` | Scored recommendation with rubric evidence. |

`{slug}` is a short kebab-case identifier (e.g.
`meetings/acme-2026-04-22-pre.md`,
`signals/ai-agent-tooling-2026-04-22.md`).

---

## Cross-agent reads

The Head of Operations reads (never writes) these files to produce
the Monday review:

- `../vendor-procurement-ops/outputs.json`
- `../vendor-procurement-ops/renewals/calendar.md` (live file — not indexed; HoO reads it for upcoming renewals in the weekly review)

Each read handles missing gracefully — if the agent isn't installed
or has no outputs yet, note it as "no activity" and continue.

---

## Write discipline

- **Atomic writes.** Always write to `{file}.tmp` first, then rename.
  Partial JSON crashes the dashboard.
- **IDs** are UUID v4.
- **Timestamps** are ISO-8601 UTC.
- **Never write under `.houston/<agent>/` at runtime.** The watcher
  skips that path. Seeded install-time `.houston/activity.json` is fine.
- **`company-operating-context.md` is live.** It's not recorded in
  `outputs.json`. Every update refreshes in place (atomic rename).
