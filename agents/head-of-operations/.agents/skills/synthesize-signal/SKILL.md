---
name: synthesize-signal
description: Use when the user says "weekly briefing on {topic}" / "what's moving in {space}" / "summarize my X feed" / "research {company} and give me a brief" — news + research + social synthesis into a cited, structured brief.
---

# Synthesize Signal

Three kinds of signal, one skill: market news, web research, social
feed monitoring. Keeps the founder current without forcing them to
scan feeds.

## When to use

- "weekly briefing on {topic}" / "what's moving in {our category}".
- "research {company} / {person} / {product} and give me a brief".
- "summarize my X feed" / "what did my follow-list post about".
- "what's the news on {regulation / event}".

## Steps

1. **Read `company-operating-context.md`.** Relevance anchors off
   the founder's active priorities. If missing:
   `define-operating-context` first, stop.

2. **Classify the request.**
   - **topic-brief** — "{topic}" (AI agents, vertical SaaS pricing,
     etc.). Use news + research sources.
   - **entity-brief** — a named company, person, or product.
     Research-heavy; check news as well.
   - **feed-digest** — the founder's watched social feed
     (followers on X / LinkedIn / etc.). Needs a connected social
     provider.

3. **Gather signal based on classification.**

   **For topic-brief + entity-brief:**
   - `composio search research` → execute by slug with the query.
     Prefer providers that return source URLs (Exa, Perplexity).
   - `composio search news` → execute with a time window (last 7
     days default for weekly; last 30 for deep).

   **For feed-digest:**
   - `composio search social` → list-home-timeline or
     list-posts-by-list tool for the connected provider.
   - Pull posts from the founder's follow-list for the requested
     window.

4. **Filter and rank.**
   - Drop duplicates and near-duplicates.
   - Flag posts/articles from Key Contacts (from operating context)
     as higher-signal.
   - Rank by: (a) relevance to active priorities, (b) recency, (c)
     source authority.

5. **Synthesize a structured brief.**

   Save to `signals/{slug}-{YYYY-MM-DD}.md`. Structure:

   - **TL;DR** — 3 bullets max, the founder-scannable version.
   - **What moved** — grouped subsections by theme. Each bullet:
     claim + source URL. Cite every claim — no uncited assertions.
   - **Who's taking which position** — when multiple sources
     contradict, list the positions and who holds each.
   - **So what for us** — 2-3 items: what this threatens, what
     opens a door, what should go in the next investor/board
     update.
   - **Sources** — flat list of URLs with one-line descriptions,
     alphabetized by domain.

6. **Atomic writes** — `signals/{slug}-{YYYY-MM-DD}.md.tmp` →
   rename.

7. **Append to `outputs.json`** with `type: "signal"`, status
   "ready".

8. **Summarize to user** — the TL;DR + the one "so what for us"
   item that most warrants action.

## Outputs

- `signals/{slug}-{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "signal"`.

## What I never do

- **Cite without a source URL.** Every claim must trace back to a
  specific article or post — no "industry consensus" hand-waving.
- **Repost a quote from a founder's follow-list** to their own
  social — signal skill is read-only.
- **Mark a brief as ready without uncertainty flags.** If a
  claim came from a single source, flag it; if sources
  contradict, say so.
