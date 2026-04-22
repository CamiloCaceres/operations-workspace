---
name: onboard-me
description: Use when the user explicitly says "onboard me" / "set me up" / "let's get started", or on the first real task when no `config/profile.json` exists — open with a scope + modality preamble naming the three topics (contract repository, vendor list, approval posture) AND the best way to share each, then run a tight 90-second 3-question interview and write results to `config/`.
---

# Onboard Me

## When to use

First-run setup. Triggered by:

- "onboard me" / "set me up" / "let's get started".
- The user opens the pre-seeded "Onboard me" activity card and sends
  any short message (including "go", "ok", "start", "yes", or an
  empty-seeming prompt) — when `config/profile.json` is missing,
  treat any short opener as a signal to run me.
- About-to-do-real-work and `config/profile.json` is missing.

Only run ONCE unless the user explicitly re-invokes.

## Principles

- **Lead with a scope + modality preamble.** Name the three topics AND
  the easiest way to share each BEFORE the first question.
- **3 questions is the ceiling, not the target.** If you can do 2, do 2.
- **One question at a time after the preamble.** The preamble did the
  heavy lifting.
- **Rank modalities:** connected app via Composio > file/URL > paste.
- **Anything skipped** → note "TBD" and ask again just-in-time later.

## Steps

0. **Scope + modality preamble — the FIRST message, then roll into Q1:**

   > "Let's get you set up — 3 quick questions, about 90 seconds.
   > Here's what I need and the easiest way to share each:
   >
   > 1. **Where do your contracts live?** *Best: point me at a
   >    connected drive folder via Composio (Integrations tab). Or
   >    paste a list of vendor + contract pointers.*
   > 2. **Who are your current vendors?** *Best: drop a list or
   >    export a CSV from your billing/AP tool. Or paste the top
   >    10 off the top of your head — we'll find the rest.*
   > 3. **What's your approval posture?** — signature authority
   >    (you only / any exec), preferred terms (monthly / annual /
   >    case-by-case), risk appetite (conservative / balanced /
   >    fast), paper preference (ours / theirs / whatever).
   >    *Best: paste one line per dimension.*
   >
   > For any of these you can also drop files or share public URLs.
   > Let's start with #1 — where do your contracts live?"

1. **Capture topic 1 (contract repository).** Based on modality:
   - Connected drive: run `composio search drive` → discover
     folder-list tool → get the folder slug + name.
   - Paste: save the list as-is to `config/procurement.json` under
     `knownVendors[]` with `contractKnownPath` set per entry.
   - File: read the file, extract vendor + path pairs.

   Write `config/procurement.json` with `contractRepository =
   { kind, pointer }`. Acknowledge and roll into Q2: "Got it — now
   who are your current vendors?"

2. **Capture topic 2 (vendor list).** Pull the list into
   `knownVendors[]` with `{ name, category, contractKnownPath? }`.
   If connected billing available, offer to run `composio search
   billing` → list-subscriptions and populate automatically — but do
   NOT execute without asking ("Want me to pull from your connected
   billing provider now? Y/N").

   Roll into Q3: "Last one — approval posture?"

3. **Capture topic 3 (approval posture).** Parse the founder's
   answer into `approvalPosture = { signatureAuthority,
   preferredTerms, riskAppetite, paperPreference }`. Defaults if
   skipped: `founder-only` / `case-by-case` / `balanced` /
   `whatever`.

4. **Write `config/profile.json`** with `{ userName, company,
   onboardedAt, status: "onboarded" | "partial" }`. Use `"partial"`
   if any topic was skipped.

5. **Atomic writes.** Every file written as `{path}.tmp` then
   renamed. Never partial JSON.

6. **Hand off:** "Ready. Try: `Audit my SaaS spend — what am I
   paying for?`"

## Outputs

- `config/profile.json`
- `config/procurement.json`

(No entry in `outputs.json` — onboarding is setup, not a deliverable.)
