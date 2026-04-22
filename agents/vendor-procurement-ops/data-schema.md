# Vendor & Procurement Ops — Data Schema

All records share these base fields:

```ts
interface BaseRecord {
  id: string;          // UUID v4
  createdAt: string;   // ISO-8601 UTC
  updatedAt: string;   // ISO-8601 UTC
}
```

All writes are atomic: write to a sibling `*.tmp` file, then rename.
Never edit in-place. Never write anywhere under `.houston/<agent>/` —
the Houston file watcher skips those paths. Exception: seeded
`.houston/activity.json` at install time is fine.

---

## Config — what the agent learns about the user

Nothing in `config/` is shipped in the repo. Every file appears at
runtime, written by `onboard-me` + progressive capture.

### `config/profile.json`

```ts
interface Profile {
  userName: string;
  company: string;
  onboardedAt: string;
  status: "onboarded" | "partial";
}
```

### `config/procurement.json`

```ts
interface Procurement {
  contractRepository: {
    kind: "drive-folder" | "pasted" | "connected-storage";
    pointer: string;          // path, URL, or Composio-discovered slug
  };
  knownVendors: Array<{
    name: string;
    category: string;         // e.g. "email", "CRM", "devtools"
    contractKnownPath?: string;
  }>;
  approvalPosture: {
    signatureAuthority: "founder-only" | "any-exec" | "exec-plus-board";
    preferredTerms: "monthly" | "annual" | "case-by-case";
    riskAppetite: "conservative" | "balanced" | "fast";
    paperPreference: "ours" | "theirs" | "whatever";
  };
  source: "paste" | "url" | "file" | "connected-drive";
  capturedAt: string;
}
```

### `config/supplier-rubric.md`

Markdown. The scoring rubric for `evaluate-supplier`. Default if the
founder doesn't specify one:

- **Fit** (weight 3): 1-5 — alignment with what we need, stage-match.
- **Quality signals** (weight 2): 1-5 — testimonials, case studies,
  notable customers.
- **Reference quality** (weight 2): 1-5 — can we triangulate with
  someone we know.
- **Risk signals** (weight 3): 1-5 — public incidents, complaints,
  financial health; lower = more risky.
- **Friction to start** (weight 1): 1-5 — setup cost, minimum term,
  cancellation cost.

Editable by the founder; `evaluate-supplier` rewrites atomically if
the founder says "update the rubric."

### `config/voice.md` (pointer, not owned)

This agent does not maintain its own voice file. It reads
`../head-of-operations/config/voice.md` for `draft-vendor-outreach`.
If that file is missing, `draft-vendor-outreach` asks the user to
run the Head of Operations' `onboard-me` first.

---

## Domain data — what the agent produces

### `outputs.json` — dashboard index

Single array at the agent root. Every substantive artifact appends an
entry. Read-merge-write atomically.

```ts
interface Output extends BaseRecord {
  type: "contract"          // extract-contract-clauses
       | "supplier"         // evaluate-supplier
       | "compliance"       // research-compliance
       | "renewal-digest"   // track-renewals (QUARTERLY digest ONLY — calendar.md is live)
       | "spend-audit"      // audit-saas-spend
       | "outreach-draft";  // draft-vendor-outreach
  title: string;
  summary: string;
  path: string;
  status: "draft" | "ready";
}
```

### Topic subfolders

| Subfolder | Written by | Filename pattern | Content |
|-----------|------------|------------------|---------|
| `contracts/` | `extract-contract-clauses` | `{vendor-slug}-{YYYY-MM-DD}.md` | Clause extraction per contract: verbatim quotes + summaries + flags. |
| `suppliers/` | `evaluate-supplier` | `{supplier-slug}.md` | Scored evaluation with risk tier + first-call questions. |
| `compliance/` | `research-compliance` | `{company-slug}.md` | Compliance background with citations. |
| `renewals/` | `track-renewals` | `calendar.md` (LIVE, NOT indexed) + `{YYYY-QN}-digest.md` (indexed) | Living calendar + quarterly digest. |
| `spend/` | `audit-saas-spend` | `{YYYY-MM-DD}-audit.md` | SaaS spend audit with duplicates + cancel candidates. |
| `outreach/` | `draft-vendor-outreach` | `{vendor}-{topic}-{YYYY-MM-DD}.md` | Human-readable record of a draft (actual draft lives in connected inbox). |

`{slug}` is short kebab-case from the vendor or company name
(e.g. `contracts/notion-2026-04-22.md`, `suppliers/acme-corp.md`).

### `renewals/calendar.md` — the one live file on this agent

This file is the living renewal calendar, ordered by next renewal.
It is NOT recorded in `outputs.json`. Every invocation of
`track-renewals` rewrites it atomically. The Head of Operations
reads it during `run-weekly-review` to surface upcoming renewals in
the Monday readout.

Structure:

```markdown
# Renewal Calendar

_Last scan: {ISO-8601} · Contracts scanned: {N}_

## Next 7 days
- {Vendor} · {YYYY-MM-DD} · auto-renew? · notice-window-passed? · path:contracts/{...}.md

## Next 30 days
...

## Next 90 days
...

## Beyond 90 days
...
```

---

## Cross-agent reads

Required before every non-onboard skill:

- `../head-of-operations/company-operating-context.md` — vendor
  posture, hard nos, key contacts, active priorities. If missing or
  empty: stop and tell the user to run Head of Operations' `define-operating-context`.

Also read:

- `../head-of-operations/config/voice.md` — for `draft-vendor-outreach`
  only. Handle missing gracefully by asking the user to run the
  Head of Operations' onboarding first.

This agent writes NOTHING outside its own root. Cross-agent writes
are prohibited; only Head of Operations writes the shared context
doc.

---

## Write discipline

- **Atomic writes.** Always write to `{file}.tmp` first, then
  rename. Partial JSON crashes the dashboard.
- **IDs** are UUID v4.
- **Timestamps** are ISO-8601 UTC.
- **Never write under `.houston/<agent>/` at runtime.** Seeded
  install-time `.houston/activity.json` is fine.
- **`renewals/calendar.md` is live.** It's not recorded in
  `outputs.json`. Every update refreshes it atomically.
