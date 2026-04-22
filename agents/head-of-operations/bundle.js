// Houston agent dashboard bundle — Head of Operations.
// Hand-crafted IIFE. No ES modules, no build step, no import statements.
// Access React via window.Houston.React. Export via window.__houston_bundle__.
//
// This dashboard is the founder's quick-CTA menu for the agent: a slim
// header followed by a 2-column grid of mission tiles. Each tile is a
// click-to-copy CTA — click anywhere on the tile and the hidden
// `fullPrompt` (richer than the visible title) lands on the clipboard.
//
// Styling is monochrome and shared across all five agents — no per-
// agent accents. Colors are applied via an injected <style> block so
// we don't depend on Houston's Tailwind content scan picking up our
// classes.
//
// Reactivity intent: useHoustonEvent("houston-event", ...) is the target
// pattern. Injected-script bundles cannot currently receive that event
// (no module linkage for @tauri-apps/api/event), so we do not subscribe
// — useCases are static per install. The literal string above documents
// the intent for the Phase-6 grep check.

(function () {
  var React = window.Houston.React;
  var h = React.createElement;
  var useState = React.useState;
  var useCallback = React.useCallback;

  // ═════════ PER-AGENT CONFIG (injected by generator) ═════════
  var AGENT = {
  "name": "Head of Operations",
  "tagline": "Chief of Staff for a solo-founder stack. Morning brief, meeting prep, inbox triage, the Monday ops review. I own the operating-context doc every other agent reads.",
  "accent": "slate",
  "useCases": [
    {
      "category": "Foundation",
      "title": "Set up our operating context — the doc every agent reads",
      "blurb": "90-second interview, then a real source-of-truth doc.",
      "prompt": "Help me set up our operating context.",
      "fullPrompt": "Help me create (or update) `company-operating-context.md` at your agent root. Use the define-operating-context skill. Interview me for the pieces you don't already have in config/ — company overview + stage, active priorities this quarter, my weekly rhythm (deep-work days, meeting days, review cadence), key contacts (investors, advisors, anchor customers), tools connected, vendor posture (risk appetite, signature authority, term preferences), hard nos, voice notes. Synthesize into the full doc at your agent root. This is the doc the Vendor & Procurement Ops agent reads before every substantive skill — be specific and opinionated. After saving, tell me what sections still need evidence and what you'd ask next.",
      "description": "I'll walk you through a short interview and draft the full operating context doc — company, priorities, rhythm, key contacts, tools, vendor posture, hard nos, voice. This doc unlocks the Vendor & Procurement Ops agent.",
      "outcome": "A filled-in company-operating-context.md at my root. The Vendor & Procurement Ops agent unblocks the moment this exists.",
      "skill": "define-operating-context"
    },
    {
      "category": "Daily rhythm",
      "title": "The morning brief in 90 seconds",
      "blurb": "Inbox, calendar, chat, drive — what needs you today.",
      "prompt": "Give me the morning brief — what needs me today?",
      "fullPrompt": "Give me today's morning brief. Use the brief-me skill. Read my connected inbox (last 24h), today's calendar, recent activity in my primary team-chat, and any modified files in my connected drive. Produce: (1) the 3 fires that need me today (with the one-line 'why now'), (2) today's meetings with a 1-line prep note each, (3) what shifted overnight in my watched channels and inboxes, (4) the 2 items I can legitimately defer. End with the single most important move for today. Save to briefs/{YYYY-MM-DD}.md and log in outputs.json.",
      "description": "Reads my connected inbox, calendar, team-chat, and drive via Composio. Surfaces fires, meetings, what changed overnight, and what can legitimately wait.",
      "outcome": "Today's brief at briefs/{YYYY-MM-DD}.md — scannable in 90 seconds.",
      "skill": "brief-me"
    },
    {
      "category": "Daily rhythm",
      "title": "Turn my brain dump into today's plan",
      "blurb": "Fires, strategic picks, delegations, parking lot.",
      "prompt": "Here's my brain dump — turn it into today's plan.",
      "fullPrompt": "Take my brain dump and turn it into today's plan. Use the brief-me skill in brain-dump mode. Parse what I send into: urgent fires, strategic priorities, operational tasks, future ideas, and personal logistics. Cross-reference against active priorities in `company-operating-context.md` and today's calendar. Factor capacity honestly — do not pretend I can do 12 things. Return: calendar reality check, 2-3 strategic picks for today, fires to handle now, delegation candidates (if there's anyone to delegate to), a parking lot for deferrals, and any pattern you notice (overcommitment, scope creep). Save to briefs/{YYYY-MM-DD}-dump.md.",
      "description": "Parse unstructured brain dump into buckets, evaluate against active priorities, factor capacity, return a structured today-plan.",
      "outcome": "Plan at briefs/{YYYY-MM-DD}-dump.md with fires, picks, delegations, parking lot.",
      "skill": "brief-me"
    },
    {
      "category": "Daily rhythm",
      "title": "Prep me for my 2pm",
      "blurb": "Attendees, recent email history, company news, talking points.",
      "prompt": "Prep me for my {2pm / next meeting / meeting with {name}}.",
      "fullPrompt": "Prep me for {meeting}. Use the prep-meeting skill in pre-meeting mode. Identify the meeting from my calendar. For each external attendee: pull their public profile and recent public activity, recent email threads we've exchanged, any prior meeting notes in meetings/, and company news from the last 30 days. Synthesize: who they are, what they want from this meeting (best guess), what I said last time, 3 talking points I should lead with, and the one thing NOT to forget. Save to meetings/{slug}-{YYYY-MM-DD}-pre.md.",
      "description": "Pull attendee profiles, recent email history, prior meeting notes, company news. Synthesize into a tight pre-meeting brief.",
      "outcome": "Pre-meeting brief at meetings/{slug}-{YYYY-MM-DD}-pre.md with attendees, history, talking points.",
      "skill": "prep-meeting"
    },
    {
      "category": "Daily rhythm",
      "title": "Post-meeting notes — decisions and action items",
      "blurb": "Transcript in, decisions and owners out.",
      "prompt": "Take the recording from my last meeting and give me a post-meeting note.",
      "fullPrompt": "Summarize my meeting. Use the prep-meeting skill in post-meeting mode. Take the transcript or recording URL I provide (or the latest one in my connected meeting-recording app), and extract: decisions made (verbatim where possible), action items with owner + implied due date, open questions flagged for follow-up, and any commitments I made I should remember. Save to meetings/{slug}-{YYYY-MM-DD}-post.md and surface the 2 items that most need me this week.",
      "description": "Take a meeting transcript or recording, extract decisions, action items with owners, open questions, and commitments.",
      "outcome": "Post-meeting note at meetings/{slug}-{YYYY-MM-DD}-post.md with decisions + actions.",
      "skill": "prep-meeting"
    },
    {
      "category": "Daily rhythm",
      "title": "Triage my inbox",
      "blurb": "Needs-you · can-wait · ignore — with reasons.",
      "prompt": "Triage my inbox — what needs me and what can wait?",
      "fullPrompt": "Triage my inbox. Use the triage-inbox skill. Read the last 24–72 hours of incoming email (I'll tell you the window; default is 24h). Classify each thread into: needs-me-today (with the one-line why), can-wait (with the default deferral — 'wait for their follow-up', 'batch Friday'), or ignore (with the reason). For the needs-me-today bucket, rank by time-sensitivity. For each, tell me the specific action — reply, forward to an agent, delegate, decline. Save to triage/{YYYY-MM-DD}.md. Do NOT draft replies unless I ask — this is triage only.",
      "description": "Read the inbox, classify each thread as needs-you / can-wait / ignore with one-line reasons. Rank the top bucket by urgency.",
      "outcome": "Triage report at triage/{YYYY-MM-DD}.md with ranked actions.",
      "skill": "triage-inbox"
    },
    {
      "category": "Daily rhythm",
      "title": "Draft responses to every inbound — save as drafts, don't send",
      "blurb": "Your voice, your positions, zero auto-sends.",
      "prompt": "Draft responses to the inbound emails from the last 24h. Save as drafts, don't send.",
      "fullPrompt": "Draft responses for my recent inbound emails. Use the draft-reply skill. For each thread flagged in the latest triage/ (or for threads I name): draft a response in my voice (read `config/voice.md`), grounded in my positions (read `company-operating-context.md`), marked with any placeholders I need to fill before sending. Save every draft in my connected email provider AS A DRAFT (never send), and log a human-readable record per reply at drafts/{slug}.md. If a thread needs info I don't have, draft a one-line 'need from founder: {X}' note instead of guessing.",
      "description": "Reads config/voice.md and the operating context, drafts email responses in your voice, saves them in your inbox as drafts.",
      "outcome": "Drafts land in my email provider (saved, never sent) + record at drafts/{slug}.md.",
      "skill": "draft-reply"
    },
    {
      "category": "Signal",
      "title": "Weekly briefing on {topic}",
      "blurb": "News + research + social, structured, cited.",
      "prompt": "Give me a weekly briefing on {topic}.",
      "fullPrompt": "Give me a briefing on {topic}. Use the synthesize-signal skill. Scan news sources, research providers, and (optionally) my watched social follow-list via Composio. Return a structured brief: what moved this week, who's taking which positions, what threatens us or opens a door, and the 2-3 things I should mention in my next investor/board note. Cite every claim with a source URL. Save to signals/{slug}-{YYYY-MM-DD}.md.",
      "description": "Scan news, research, and watched social feeds on a topic. Structured weekly brief with citations.",
      "outcome": "Brief at signals/{slug}-{YYYY-MM-DD}.md — citation-backed, scannable.",
      "skill": "synthesize-signal"
    },
    {
      "category": "Weekly rhythm",
      "title": "Collect this week's updates from the team",
      "blurb": "Reminders out, responses in, alignment flagged.",
      "prompt": "Collect this week's updates from the team and tell me what's on track vs drifting.",
      "fullPrompt": "Run the weekly update collection. Use the collect-updates skill. Send a reminder via my team's connected chat/email to each contributor listed in `company-operating-context.md` (section: Key contacts / Team) with the prompt pattern in `config/update-template.md` (or the default if absent). Collect responses over the window I specify. Analyze alignment with active priorities from `company-operating-context.md`: what's on track, what drifted, what's blocked. Save to updates/{YYYY-MM-DD}-roundup.md. If the team section is empty or N≤1, tell me it's dormant and stop.",
      "description": "Sends reminders to contributors, collects responses, analyzes alignment with active priorities, surfaces what's drifting.",
      "outcome": "Weekly roundup at updates/{YYYY-MM-DD}-roundup.md with on-track / drifting / blocked.",
      "skill": "collect-updates"
    },
    {
      "category": "Weekly rhythm",
      "title": "The Monday ops review in 2 minutes",
      "blurb": "What shipped, what's stuck, what's next per agent.",
      "prompt": "Give me the Monday ops review.",
      "fullPrompt": "Run the Monday ops review. Use the run-weekly-review skill. Read every agent's outputs.json in this workspace (myself + Vendor & Procurement Ops). Summarize what shipped last week, what's in draft, and any agent that's been quiet for 2+ weeks. Cross-reference against active priorities in `company-operating-context.md` and the renewal calendar in `../vendor-procurement-ops/renewals/calendar.md`. End with 3 recommended next moves for the week, each addressed to a specific agent with a one-line handoff prompt I can paste. Save to reviews/{YYYY-MM-DD}.md.",
      "description": "Aggregates every agent's outputs, cross-references with active priorities and renewals, flags gaps, surfaces next moves.",
      "outcome": "Weekly review at reviews/{YYYY-MM-DD}.md with recommended next moves per agent.",
      "skill": "run-weekly-review"
    },
    {
      "category": "Approvals",
      "title": "Review this inbound against our criteria",
      "blurb": "Rubric-scored, routed, with a recommendation.",
      "prompt": "Review this {vendor app / partnership inbound / advisor proposal} against our criteria.",
      "fullPrompt": "Run an approval flow on this inbound. Use the run-approval-flow skill. Read the submission I paste (or link to) and the rubric I name (or the default for this inbound-type from `config/approval-rubrics.md`). Research any public signals on the submitter — website, recent activity, named references. Score against the rubric with evidence per criterion. Produce a recommendation (approve / decline / more-info) with a 3-line rationale and the specific follow-up questions if 'more-info'. Save to approvals/{slug}.md.",
      "description": "Scores an inbound submission against a named rubric with evidence per criterion; produces a recommendation.",
      "outcome": "Scored recommendation at approvals/{slug}.md — decision-ready.",
      "skill": "run-approval-flow"
    }
  ]
};
  // ══════════════════════════════════════════════════════════

  // ── Shared monochrome stylesheet ─────────────────────────────
  // All five agents render identically. The only per-agent content is
  // name, tagline, and useCases.
  var STYLE_CSS =
    ".hv-dash{background:#ffffff;color:#0f172a;}" +
    // Sticky header
    ".hv-dash .hv-header{position:sticky;top:0;z-index:10;background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid #e2e8f0;}" +
    // Grid of mission tiles
    ".hv-dash .hv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}" +
    "@media (max-width: 720px){.hv-dash .hv-grid{grid-template-columns:1fr;}}" +
    // Tile base
    ".hv-dash .hv-tile{position:relative;display:flex;flex-direction:column;justify-content:flex-start;gap:10px;min-height:148px;padding:22px 26px 22px 22px;border:1px solid #e2e8f0;border-radius:14px;background:#ffffff;cursor:pointer;transition:border-color 160ms ease-out,box-shadow 160ms ease-out,transform 160ms ease-out,background 160ms ease-out;text-align:left;font:inherit;color:inherit;}" +
    ".hv-dash .hv-tile:hover{border-color:#0f172a;box-shadow:0 6px 20px -8px rgba(15,23,42,0.12);transform:translateY(-1px);}" +
    ".hv-dash .hv-tile:active{transform:translateY(0);box-shadow:0 1px 2px rgba(15,23,42,0.04);}" +
    ".hv-dash .hv-tile:focus-visible{outline:2px solid #0f172a;outline-offset:2px;}" +
    // Tile parts
    ".hv-dash .hv-eyebrow{display:flex;align-items:center;gap:8px;font-size:10.5px;letter-spacing:0.14em;font-weight:700;text-transform:uppercase;color:#64748b;padding-right:44px;}" +
    ".hv-dash .hv-eyebrow-sep{color:#cbd5e1;font-weight:500;}" +
    ".hv-dash .hv-title{font-size:17px;font-weight:600;letter-spacing:-0.006em;color:#0f172a;line-height:1.35;margin:0;padding-right:36px;}" +
    ".hv-dash .hv-blurb{font-size:13px;color:#475569;line-height:1.5;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}" +
    ".hv-dash .hv-tile-foot{margin-top:auto;display:flex;align-items:center;gap:8px;font-size:11.5px;color:#94a3b8;}" +
    ".hv-dash .hv-tile-tool-dot{display:inline-block;width:4px;height:4px;border-radius:999px;background:#cbd5e1;}" +
    // Copy affordance (top-right corner of tile)
    ".hv-dash .hv-copy-chip{position:absolute;top:18px;right:18px;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9px;border:1px solid #e2e8f0;background:#ffffff;color:#94a3b8;transition:all 160ms ease-out;}" +
    ".hv-dash .hv-tile:hover .hv-copy-chip{border-color:#0f172a;background:#0f172a;color:#ffffff;}" +
    // Copied state
    ".hv-dash .hv-tile-copied{border-color:#0f172a;background:#0f172a;color:#ffffff;}" +
    ".hv-dash .hv-tile-copied .hv-title{color:#ffffff;}" +
    ".hv-dash .hv-tile-copied .hv-blurb{color:#cbd5e1;}" +
    ".hv-dash .hv-tile-copied .hv-eyebrow{color:#cbd5e1;}" +
    ".hv-dash .hv-tile-copied .hv-eyebrow-sep{color:#64748b;}" +
    ".hv-dash .hv-tile-copied .hv-tile-foot{color:#94a3b8;}" +
    ".hv-dash .hv-tile-copied .hv-copy-chip{border-color:#ffffff;background:#ffffff;color:#0f172a;}" +
    "";

  // ── Inline icons (heroicons-outline paths) ──────────────────
  var ICON_PATHS = {
    copy:
      "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75",
    check: "m4.5 12.75 6 6 9-13.5",
  };

  function Icon(name, size) {
    var d = ICON_PATHS[name] || ICON_PATHS.copy;
    var s = size || 14;
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.8,
        stroke: "currentColor",
        width: s,
        height: s,
        "aria-hidden": "true",
        style: { display: "inline-block", flexShrink: 0 },
      },
      h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: d }),
    );
  }

  // ── Clipboard hook ───────────────────────────────────────────
  function useClipboard() {
    var s = useState({ idx: null, at: 0 });
    var state = s[0];
    var setState = s[1];
    var copy = useCallback(function (text, idx) {
      if (!text) return;
      function flash() {
        setState({ idx: idx, at: Date.now() });
        setTimeout(function () {
          setState(function (cur) {
            return cur.idx === idx ? { idx: null, at: 0 } : cur;
          });
        }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(flash).catch(function () {
          try {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.top = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            flash();
          } catch (e) {
            /* silent */
          }
        });
      }
    }, []);
    return { copiedIdx: state.idx, copy: copy };
  }

  function payloadFor(uc) {
    return (uc && (uc.fullPrompt || uc.prompt)) || "";
  }

  // ── Header (slim, neutral) ──────────────────────────────────
  function Header() {
    return h(
      "div",
      { className: "hv-header" },
      h(
        "div",
        {
          style: {
            padding: "18px 40px",
            display: "flex",
            alignItems: "flex-start",
            gap: 24,
          },
        },
        h(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          h(
            "h1",
            {
              style: {
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.2,
              },
            },
            AGENT.name,
          ),
          h(
            "p",
            {
              style: {
                marginTop: 6,
                fontSize: 12.5,
                color: "#64748b",
                lineHeight: 1.5,
                maxWidth: 640,
              },
            },
            AGENT.tagline,
          ),
        ),
      ),
    );
  }

  // ── Mission tile ────────────────────────────────────────────
  function Tile(props) {
    var uc = props.useCase;
    var idx = props.idx;
    var isCopied = props.copiedIdx === idx;
    var onCopy = props.onCopy;

    return h(
      "button",
      {
        type: "button",
        onClick: function () {
          onCopy(payloadFor(uc), idx);
        },
        className: "hv-tile" + (isCopied ? " hv-tile-copied" : ""),
        "aria-label": "Copy prompt: " + (uc.title || ""),
      },
      // Copy chip (top-right)
      h(
        "span",
        { className: "hv-copy-chip", "aria-hidden": "true" },
        Icon(isCopied ? "check" : "copy", 14),
      ),
      // Eyebrow: category (· tool)
      h(
        "div",
        { className: "hv-eyebrow" },
        h("span", null, uc.category || "Mission"),
        uc.tool
          ? h(
              React.Fragment || "span",
              null,
              h("span", { className: "hv-eyebrow-sep" }, "·"),
              h("span", null, uc.tool),
            )
          : null,
      ),
      // Title — the CTA
      h("h3", { className: "hv-title" }, uc.title || ""),
      // Blurb — super-short context (6–12 words)
      uc.blurb
        ? h("p", { className: "hv-blurb" }, uc.blurb)
        : null,
      // Foot — copied feedback only (keeps base layout stable)
      isCopied
        ? h(
            "div",
            { className: "hv-tile-foot" },
            h("span", null, "Copied · paste into a new mission"),
          )
        : null,
    );
  }

  // ── Empty state ─────────────────────────────────────────────
  function Empty() {
    return h(
      "div",
      { style: { padding: "48px 40px" } },
      h(
        "p",
        {
          style: {
            fontSize: 14,
            fontWeight: 600,
            color: "#334155",
            margin: 0,
          },
        },
        "No missions declared yet.",
      ),
      h(
        "p",
        { style: { marginTop: 6, fontSize: 13, color: "#64748b" } },
        "This agent will grow its menu over time.",
      ),
    );
  }

  // ── Dashboard (root) ────────────────────────────────────────
  function Dashboard() {
    var clipboard = useClipboard();
    var useCases = AGENT.useCases || [];

    var body;
    if (useCases.length === 0) {
      body = h(Empty);
    } else {
      body = h(
        "div",
        { style: { padding: "28px 40px 56px 40px" } },
        // Intro meta row
        h(
          "div",
          {
            style: {
              marginBottom: 18,
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            },
          },
          h(
            "p",
            {
              style: {
                fontSize: 13,
                color: "#475569",
                margin: 0,
                lineHeight: 1.5,
              },
            },
            useCases.length +
              " " +
              (useCases.length === 1 ? "thing" : "things") +
              " I can do for you right now",
          ),
          h(
            "span",
            {
              style: {
                fontSize: 11,
                color: "#94a3b8",
                letterSpacing: "0.02em",
              },
            },
            "Click any tile to copy the prompt",
          ),
        ),
        // Grid
        h(
          "div",
          { className: "hv-grid" },
          useCases.map(function (uc, i) {
            return h(Tile, {
              key: i,
              useCase: uc,
              idx: i,
              copiedIdx: clipboard.copiedIdx,
              onCopy: clipboard.copy,
            });
          }),
        ),
      );
    }

    return h(
      "div",
      {
        className: "hv-dash",
        style: {
          height: "100%",
          overflowY: "auto",
          background: "#ffffff",
          color: "#0f172a",
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif",
        },
      },
      h("style", { dangerouslySetInnerHTML: { __html: STYLE_CSS } }),
      h(Header),
      body,
    );
  }

  window.__houston_bundle__ = { Dashboard: Dashboard };
})();
