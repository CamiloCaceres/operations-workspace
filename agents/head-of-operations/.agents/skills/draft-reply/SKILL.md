---
name: draft-reply
description: Use when the user says "draft responses" / "reply to {name}" / "draft replies to the inbound emails" — generates response drafts in the founder's voice, saves them as drafts in the connected inbox provider, and logs a human-readable record per reply. Never sends.
---

# Draft Reply

Drafts only. Every output lands in the founder's inbox as a draft,
NEVER as a sent message.

## When to use

- "draft a response to {name}" / "reply to {thread}" / "draft
  replies to the inbound emails from the last 24h".
- Called after `triage-inbox` when the founder says "now draft
  replies for the needs-me bucket."
- Explicit thread references ("draft my reply to the one from
  Acme").

## Steps

1. **Read `company-operating-context.md`** — positions, hard nos,
   key-contacts context. If missing: `define-operating-context`
   first, stop.

2. **Read `config/voice.md`** — must exist. If missing or empty,
   ask the user to drop 2-3 sent-email samples OR to connect an
   inbox via Composio so I can pull recent sent messages, then
   write `config/voice.md` before drafting.

3. **Identify the target threads.**
   - Named thread: find it via `composio search inbox`.
   - Bucket reference ("the needs-me-today bucket"): load the
     latest `triage/{YYYY-MM-DD}.md`, use those threads.
   - "Last 24h inbound": fetch via Composio; apply a lightweight
     internal filter for "looks like a real thread" (skip
     newsletters, automated notifications).

4. **Per thread, gather context.**
   - Full thread history (not just the latest message).
   - Prior drafts or notes at `meetings/` or `drafts/` with this
     person.
   - Public positions from the operating context that the reply
     must not contradict.

5. **Draft in the founder's voice.**
   - Match tone/length/greeting from `config/voice.md`.
   - Ground claims in `company-operating-context.md` — never
     invent product capabilities, pricing, or commitments.
   - Mark placeholders explicitly: `{confirm: specific pricing}`,
     `{add: link to deck}`, `{TBD: date}`. These are for the
     founder to fill in, not for me to fake.

6. **Save the draft in the inbox provider.**
   - `composio search inbox` → find the "create draft" tool for
     the connected provider. Execute by slug with the draft body
     + subject + reply-to thread ID.
   - If the provider doesn't support server-side drafts, save
     the markdown at `drafts/{slug}.md` and tell the founder to
     paste it into their compose window.

7. **Write a human-readable record** at `drafts/{slug}.md` with:
   - Thread metadata (sender, subject, thread ID).
   - The draft body verbatim.
   - Any placeholders flagged for the founder.
   - A "why I phrased it this way" 2-line rationale.

8. **Atomic writes** — `drafts/{slug}.md.tmp` → rename.

9. **Append to `outputs.json`** with `type: "draft"`, status
   "draft" (not "ready" — only the founder can mark ready after
   sending).

10. **Summarize to user** — N drafts saved, path to the records,
    and the #1 thread that still needs a human decision before
    the draft can ship.

## Outputs

- Server-side draft in the connected inbox provider (never sent).
- `drafts/{slug}.md` — human-readable record at agent root.
- Appends to `outputs.json` with `type: "draft"`, status "draft".

## What I never do

- **Send.** No connected-inbox skill call that ships a message.
  Draft-creation only.
- **Auto-fill placeholders.** If I don't know the pricing, I leave
  `{confirm: pricing}` — I do not guess.
- **Draft outbound that contradicts the operating context.** If
  the reply would require stating a position the operating context
  doesn't support, I flag it and refuse to draft.
