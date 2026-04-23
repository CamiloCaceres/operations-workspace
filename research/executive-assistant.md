# Executive Assistant — Research MD

## Mission

Solo founder week 0. They already have a calendar that's
overbooked, meetings without prep, and promises they made last week
that they've already forgotten. The EA is the "where and when" hire
— tactical logistics that the Head of Operations (strategic
coordinator) deliberately doesn't touch.

## Sources reviewed

- `/role-agents-workspace/agents/houston-ea/` — older deprecated EA
  agent. 10 skills (triage-inbox, draft-email-response,
  review-calendar, prep-meeting, schedule-meeting, track-followup,
  handle-followup, plan-travel, log-expense, daily-standup) +
  onboard-me. SKILL.md files read and adapted.
- `verticals-store/operations-workspace/agents/head-of-operations/` —
  existing workspace coordinator. 10 skills including
  `triage-inbox`, `draft-reply`, `prep-meeting`, `brief-me`. Scope
  already established; I designed around the overlap.
- `verticals-store/AGENT-DESIGN-PHILOSOPHY.md` — the rules.
- `verticals-store/operations-workspace/TEAM-GUIDE.md` — notes the
  question of carving out an EA agent was open; this research makes
  the split concrete.

## Scope decision — distinct from Head of Operations

Head of Operations (as currently shipped) already owns:

- `brief-me` — strategic morning brief. Fires, meetings, signal,
  strategic picks.
- `prep-meeting` — agenda sanity pre/post-meeting helper.
- `triage-inbox` — classifies inbox needs-me / can-wait / ignore.
- `draft-reply` — email drafts in the founder's voice for threads
  the founder flagged.

The Executive Assistant is strictly **tactical logistics**:

- Calendar scan (7-day), conflicts, buffers — NOT in HoO's scope.
- Deep pre-meeting intel briefing (bio + prior threads + news +
  agenda) — deeper than HoO's `prep-meeting` which is an agenda
  sanity check. The EA's version is the full attendee dossier.
- Meeting booking — NOT in HoO's scope.
- Commitment tracking (follow-ups) — NOT in HoO's scope.
- Travel assembly — NOT in HoO's scope.
- Daily logistics brief — distinct from HoO's strategic brief.

The EA deliberately does NOT do inbox triage or reply drafting —
those are HoO's turf. If the founder asks the EA to "draft my
reply to X," the EA points at HoO.

## Skills kept (with rationale)

1. **`onboard-me`** (3 questions: schedule preferences, VIPs,
   travel defaults) — required shape per the philosophy doc.
   Topics picked so the other 6 skills can operate without more
   ceremony.
2. **`triage-calendar`** — kept from source `review-calendar`.
   Renamed to match the "verb + noun" conventions used in
   operations-workspace (`triage-inbox` already exists in HoO;
   `triage-calendar` is the calendar parallel). Absent from HoO —
   pure EA territory.
3. **`prep-meeting-briefing`** — adapted from source `prep-meeting`.
   Deliberately narrower and DEEPER than HoO's `prep-meeting` —
   attendee dossier + agenda + talking points, not agenda sanity.
   Named `prep-meeting-briefing` (not `prep-meeting`) to avoid a
   slug clash with HoO's skill.
4. **`schedule-meeting`** — kept verbatim in shape from source.
   HoO doesn't book; this belongs to the EA.
5. **`draft-followup`** — merged the source's `track-followup` +
   `handle-followup` into one skill with two modes (track / handle).
   Founder-week-0 test: one skill that covers both halves of the
   commitment loop is friendlier than two.
6. **`coordinate-travel`** — kept from source `plan-travel`.
   Renamed to match verb conventions. HoO doesn't touch travel.
7. **`daily-briefing`** — kept from source `daily-standup`. Renamed
   to "daily-briefing" (not "daily-standup") because "standup"
   implies team / scrum; for a solo founder, it's a logistics
   brief. Scope-narrowed vs the source — it's the logistics cut
   ONLY; HoO's `brief-me` owns the strategic morning brief. Both
   can run in sequence if the founder wants the full picture.

## Skills dropped (with rationale)

- **`triage-inbox`** (source) — HoO already owns this. Keeping it
  on the EA would create the worst kind of overlap: both agents
  would classify the inbox differently, and the founder has to
  pick which agent to ask. Drop; point at HoO.
- **`draft-email-response`** (source) — same reasoning. HoO owns
  `draft-reply`. The EA uses the inbox read-only (for attendee
  history during `prep-meeting-briefing`, for commitment detection
  during `draft-followup`), but never drafts a generic reply.
- **`log-expense`** (source) — the Operations workspace TEAM-GUIDE
  explicitly scopes Finance / accounting to a future separate
  vertical. Expense logging is a finance-flavored artifact; it
  shouldn't slip in as an EA skill. Drop.

## Thresholds captured in config (no hardcodes)

- `maxMeetingsPerDay`, `minBufferMinutes`, `focusBlocks`,
  `blackoutPeriods` — in `config/schedule-preferences.json`. Skills
  read the value; they never hardcode numbers.
- Default `maxMeetingsPerDay: 5` and `minBufferMinutes: 15` are
  **documented overridable defaults** noted in onboarding, not
  baked into skill logic. User changes them any time.
- Follow-up default deferral ("3 business days from send date") is
  documented in `draft-followup` as a fallback for "soon" /
  "shortly" — the skill flags the fallback to the user so they can
  override.

## Coordinator read

Every non-`onboard-me` skill opens with:

> Read `../head-of-operations/company-operating-context.md`. If
> missing or empty, stop and ask the user to run Head of
> Operations' `define-operating-context` first. I do not invent
> your rhythm or VIPs.

Confirmed the shared-doc filename by reading HoO's CLAUDE.md and
`define-operating-context` SKILL.md.

## Build status

- ✅ CLAUDE.md (under 100 lines, pointer-style)
- ✅ houston.json (first tab `overview`; all 4 prompt fields per
  useCase; 7 useCases)
- ✅ 7 skills + `onboard-me` (each with "Use when…" description)
- ✅ data-schema.md
- ✅ README.md
- ✅ .gitignore
- ✅ icon.png (copied from head-of-operations)
