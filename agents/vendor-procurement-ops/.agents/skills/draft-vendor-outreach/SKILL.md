---
name: draft-vendor-outreach
description: Use when the user says "draft a renewal-negotiation email" / "write the cancel email for {SaaS}" / "reach out to {supplier} for a trial" / "reference-check email for {vendor}" — writes the draft in the founder's voice, grounded in contract terms + vendor posture. Saves as a draft in the connected inbox; never sends.
---

# Draft Vendor Outreach

Drafts only. Every output lands in the founder's connected inbox as
a draft. Never a sent message.

## When to use

- "draft a renewal-negotiation email to {vendor}".
- "write the cancel email for {SaaS}".
- "reach out to {supplier} for a trial".
- "reference-check email to {customer of vendor}".
- "draft a clarifying question email before signing {contract}".

## Steps

1. **Read `../head-of-operations/company-operating-context.md`** —
   vendor posture, hard nos, stage positioning. If missing: stop,
   ask for `define-operating-context`.

2. **Read `../head-of-operations/config/voice.md`** — must exist
   (the voice file is owned by Head of Operations, not this agent).
   If missing or empty: stop and ask the user to run Head of
   Operations' `onboard-me` to populate it.

3. **Read the vendor's contract file** at `contracts/{vendor}.md`
   if present. Pull renewal date, amount, notice window,
   negotiable-looking clauses. For cancel emails, the notice
   window is critical.

4. **Detect purpose.** The user names it explicitly or we infer:
   - `negotiate-renewal` — objective: better terms at renewal
     (price, flexibility, term).
   - `cancel` — objective: end the relationship on or after the
     notice window.
   - `trial-request` — objective: discovery / start of relationship.
   - `reference-check` — objective: verify a claim before signing
     (usually sent to a named reference customer, not the vendor).
   - `clarifying-question` — objective: resolve an ambiguity in the
     contract before signing.

5. **Draft the email** in the founder's voice.

   **Shared rules:**
   - Match tone / length / greeting / sign-off from
     `config/voice.md`.
   - Ground in `company-operating-context.md` vendor posture — if
     the founder's stance is "conservative / balanced / fast",
     match it.
   - Specific > vague. Name amounts, dates, clauses.
   - Placeholders explicitly marked: `{confirm: seat count}`,
     `{add: our desired start date}`, `{TBD: mutual date}`. Do
     NOT guess.

   **Purpose-specific patterns:**

   - **negotiate-renewal:** open with the relationship + current
     spend. Name the 1-2 specific asks (price, shorter term, usage
     flexibility). Offer a counter if they decline. Ask for a call
     or a written proposal by a named date (default: renewal date
     minus notice-window minus 7 days buffer).
   - **cancel:** open with the specific reason (usage mismatch,
     tool overlap, pivot). Reference the notice clause and the
     effective end date. Request confirmation in writing. Ask for
     data export process if relevant. Keep it cordial — doors
     stay open.
   - **trial-request:** open with the specific use case + stage.
     Ask for the specific trial shape (length, scope, SSO-off
     fine). Offer a quick call vs async. Name a decision window.
   - **reference-check:** open with context (considering {vendor}
     for {use case}). Ask 3-4 tight questions (implementation
     smoothness, support responsiveness, one thing they'd warn
     about). Respect the reference's time — offer async or a
     15-min call.
   - **clarifying-question:** quote the clause verbatim. Name the
     specific ambiguity. Ask for written confirmation, not a
     verbal answer.

6. **Save the draft.**
   - `composio search inbox` → find the "create draft" tool for
     the connected provider. Execute by slug.
   - If the provider doesn't support server-side drafts, save the
     markdown at the record path below and tell the founder to
     paste it into their compose window.

7. **Write a human-readable record** at
   `outreach/{vendor}-{purpose}-{YYYY-MM-DD}.md` with:
   - Vendor + purpose + contract pointer.
   - Draft body verbatim.
   - Placeholders flagged for the founder.
   - A 2-line rationale ("I phrased it this way because…").

8. **Atomic writes** — `*.tmp` → rename.

9. **Append to `outputs.json`** with `type: "outreach-draft"`,
   status "draft" (never `ready` — only the founder marks ready
   after sending).

10. **Summarize to user** — purpose + recipient + path to record +
    any flagged placeholders the founder must fill before sending.

## Outputs

- Server-side draft in the connected inbox (never sent).
- `outreach/{vendor}-{purpose}-{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "outreach-draft"`, status "draft".

## What I never do

- **Send.** Never. No outbound-sending tool calls.
- **Commit to a price, term, or timeline** on the founder's behalf
  — placeholders for anything negotiable.
- **Draft outreach that violates the operating context's hard
  nos.** If the founder has flagged a vendor as "never contact
  again," I refuse and say why.
- **Fabricate a reference or relationship detail.** If I can't
  verify a claim ("we've been using you for 2 years"), I omit or
  placeholder it.
