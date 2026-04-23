# Executive Assistant — Data Schema

All records share these base fields:

```ts
interface BaseRecord {
  id: string;          // UUID v4
  createdAt: string;   // ISO-8601 UTC
  updatedAt: string;   // ISO-8601 UTC
}
```

All writes are atomic: write to a sibling `*.tmp` file, then rename
onto the target path. Never edit in-place. Never write anywhere
under `.houston/<agent>/` — the Houston file watcher skips those
paths and reactivity breaks. Exception: the seeded
`.houston/activity.json` onboarding card at install time is fine;
the agent never writes there at runtime.

---

## Config — what the agent learns about the user

Nothing in `config/` is shipped in the repo. Every file appears at
runtime, written by `onboard-me` or progressive capture.

### `config/profile.json`

```ts
interface Profile {
  userName: string;
  timezone: string;       // IANA
  onboardedAt: string;
  status: "onboarded" | "partial";
}
```

### `config/schedule-preferences.json`

```ts
interface SchedulePreferences {
  timezone: string;                                    // IANA
  workingHours: { start: string; end: string };        // e.g. 09:00 / 18:00
  focusBlocks: { day: string; start: string; end: string }[];
  meetingDays?: string[];                              // e.g. ["Tue","Thu"]
  maxMeetingsPerDay: number;                           // default 5
  minBufferMinutes: number;                            // default 15
  blackoutPeriods?: { start: string; end: string; reason?: string }[];
  source: "paste" | "inferred";
  capturedAt: string;
}
```

All thresholds are overridable defaults — the user sets them at
onboarding or progressive capture. No hardcoded values baked into
skills.

### `config/vips.json`

```ts
interface Vip {
  id: string;
  name: string;
  email?: string;
  relationship: "investor" | "co-founder" | "board" | "customer"
              | "advisor" | "family" | "other";
  priorityFloor: "P1" | "P2";
  capturedAt: string;
}
```

### `config/travel-prefs.json`

```ts
interface TravelPrefs {
  preferredAirlines?: string[];
  seatPreference?: "aisle" | "window" | "either";
  preferredHotelChains?: string[];
  dietary?: string[];
  accessibility?: string[];
  groundTransportPreference?: "ride-share" | "rental" | "public";
  capturedAt: string;
}
```

### `config/voice.md`

Markdown. 3–5 verbatim samples of the user's writing + a short tone
notes block. Usually written by the Head of Operations during
onboarding; this agent reads it before drafting follow-ups. If
missing when a draft is needed, ask the user to run the Head of
Operations' onboarding first OR paste 2-3 recent sent messages (the
latter is a fallback).

---

## Domain data — what the agent produces

### `outputs.json` — dashboard index

Single array at the agent root. Every substantive artifact appends
an entry. Read-merge-write atomically — never overwrite the whole
array.

```ts
interface Output extends BaseRecord {
  type: "calendar-scan"      // triage-calendar
       | "meeting-brief"     // prep-meeting-briefing
       | "scheduling"        // schedule-meeting
       | "followup-draft"    // draft-followup (handle mode)
       | "travel-pack"       // coordinate-travel
       | "logistics-brief";  // daily-briefing
  title: string;
  summary: string;
  path: string;            // relative to agent root
  status: "draft" | "ready";
}
```

### `followups.json` — live tracked-commitment index

Live file. Rows updated in place. Not wrapped in `outputs.json` —
the index is the artifact. When a followup's draft is written
(handle mode), a separate `followup-draft` entry lands in
`outputs.json` pointing at the per-followup draft path.

```ts
interface Followup extends BaseRecord {
  threadId?: string;
  promiseTo: string;             // recipient name
  promiseToEmail?: string;
  company?: string;
  description: string;           // e.g. "Send deck draft"
  summary?: string;              // 1-line context
  promisedAt: string;            // ISO-8601 of outbound
  dueAt: string;                 // ISO-8601 in user's timezone
  status: "open" | "snoozed" | "done" | "cancelled";
  lastRemindedAt?: string;
  completionDraftPath?: string;  // e.g. "followups/{id}/draft.md"
}
```

### `calendar-conflicts.json` — live conflict index

Live file. Upserted per `triage-calendar` run. Prior-run
`acknowledged` or `resolved` rows are preserved.

```ts
interface CalendarConflict extends BaseRecord {
  type: "overbook" | "missing-buffer" | "focus-block-clash"
      | "vip-unprotected" | "no-prep";
  startAt: string;             // ISO-8601
  endAt: string;
  relatedEventIds: string[];
  description: string;
  proposedFix?: string;
  status: "open" | "acknowledged" | "resolved";
}
```

### Topic subfolders

All markdown artifacts. One file per deliverable unless noted.

| Subfolder | Written by | Filename pattern | Content |
|-----------|------------|------------------|---------|
| `calendar-scans/` | `triage-calendar` | `{YYYY-MM-DD}.md` | 7-day scan — flags, ranked fixes. |
| `meetings/` | `prep-meeting-briefing` | `{slug}-{YYYY-MM-DD}-brief.md` | Full attendee intel, suggested agenda, one-thing-not-to-forget. |
| `scheduling/` | `schedule-meeting` | `{slug}/proposal.md` | 3 proposed times + draft message + status. Overwritten per iteration. |
| `followups/` | `draft-followup` (handle mode) | `{followup-id}/draft.md` | Fulfillment or bump draft. Overwritten per iteration. |
| `travel/` | `coordinate-travel` | `{trip-id}/trip.md`, `itinerary.md`, `packing.md` | Trip pack. `trip-id` = `{YYYY-MM-DD}-{dest-slug}`. |
| `briefings/` | `daily-briefing` | `{YYYY-MM-DD}.md` | Today's logistics plan — ranked. |

`{slug}` is a short kebab-case identifier (e.g.
`meetings/acme-2026-04-22-brief.md`,
`scheduling/jane-intro/proposal.md`).

---

## Cross-agent reads

Before every substantive (non-onboard-me) skill, this agent reads
(never writes):

- `../head-of-operations/company-operating-context.md` — shared
  operating context: rhythm, key contacts, priorities, hard nos,
  voice. If missing or empty, the skill stops and tells the user to
  run the Head of Operations' `define-operating-context` first. I
  do not invent the founder's rhythm or VIPs.

---

## Write discipline

- **Atomic writes.** Always write to `{file}.tmp` first, then
  rename. Partial JSON crashes the dashboard.
- **IDs** are UUID v4.
- **Timestamps** are ISO-8601 UTC.
- **Never write under `.houston/<agent>/` at runtime.** The watcher
  skips that path. Seeded install-time `.houston/activity.json` is
  fine.
- **`followups.json` and `calendar-conflicts.json` are live.** They
  are indices, not deliverables — rows updated in place; they do
  NOT land in `outputs.json`.
