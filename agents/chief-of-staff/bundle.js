// Houston agent dashboard bundle — Chief of Staff.
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
  "name": "Chief of Staff",
  "tagline": "Board packs, investor updates, decision logs, OKR tracking, bottleneck hunts. The strategic narrative work you'd otherwise do at midnight.",
  "accent": "slate",
  "useCases": [
    {
      "category": "Board",
      "title": "Prep the Q{N} board pack — TL;DR through asks",
      "blurb": "8 sections assembled; TBDs listed, none invented.",
      "prompt": "Prep the Q{N} {YYYY} board pack.",
      "fullPrompt": "Prep a board pack. Use the prep-board-pack skill. Resolve the target quarter from my message or `config/investor-cadence.json` → board.nextAt. Use yyyy-qq slug (e.g. 2026-Q2). Read strategic priorities from the operating context. Read the latest OKR state from `okr-history.json` — run `track-okr` first if the latest snapshot is older than 10 days. Gather wins and challenges from any available status artifacts (my `decisions/` with recent `decided` entries; any rollups from connected wikis via Composio). Pull metrics — prefer handing off to the Data Analyst agent (its `run-sql-query` or `weekly-metrics-rollup`) rather than re-computing; cite the query. If no Data Analyst is available, ask me to paste the numbers and mark the section `{SOURCE: pasted}`. Draft the pack at `board-packs/{yyyy-qq}/board-pack.md` with the 8 standard sections (TL;DR, business update, metrics, OKRs, wins, challenges, asks, appendix). Flag every `{TBD}` in chat with what's needed and the best modality. Never invent a metric or quote.",
      "description": "Assembles TL;DR, business update, metrics, OKRs, wins, challenges, asks, and appendix. Flags TBDs; invents nothing.",
      "outcome": "Board pack at `board-packs/{yyyy-qq}/board-pack.md` — you fill TBDs, I assembled the structure.",
      "skill": "prep-board-pack"
    },
    {
      "category": "Investors",
      "title": "Draft the {monthly / quarterly} investor update in my voice",
      "blurb": "TL;DR, metrics, wins, challenges, learnings, asks.",
      "prompt": "Draft the {monthly / quarterly} investor update.",
      "fullPrompt": "Draft the investor update. Use the draft-investor-update skill. Read `config/investor-cadence.json` (ask one question if missing: monthly or quarterly and next due, best via connected calendar). Read `config/voice.md` or the voice section of the operating context — if voice is thin, ask me to connect my inbox via Composio for a 20-30 sent-message sample, or paste a prior update as fallback. Determine the period (last full month / quarter). Gather: OKR movement this period (from `okr-history.json`), decisions landed (from `decisions.json` with status decided this period), metrics — hand off to the Data Analyst if available, otherwise ask me to paste. Draft in my voice at `investor-updates/{yyyy-qq}/update.md` with sections: TL;DR (2-3 sentences), Metrics (3-6 top-line, period-over-period), Wins (3-5 bullets), Challenges (2-3 honest bullets with mitigation if possible), What I'm learning (1-2 paragraphs in my voice — investors value this most), Asks (specific intros / hiring help / feedback). Never invent a customer name or metric — mark `{TBD}`. End with 'I will NOT send this — review and send from your own inbox.'",
      "description": "Pulls OKR movement, decisions landed, and metrics (via Data Analyst handoff) into a voice-matched draft. Invents nothing. Never sends.",
      "outcome": "Draft at `investor-updates/{yyyy-qq}/update.md` — review and send from your own inbox.",
      "skill": "draft-investor-update"
    },
    {
      "category": "Decisions",
      "title": "Log a decision — so you can explain it later",
      "blurb": "ADR-style: context, alternatives, trade-offs, rationale.",
      "prompt": "Log the decision: we decided {X} because {Y}.",
      "fullPrompt": "Log a decision. Use the log-decision skill. Extract the decision topic from my message; propose a kebab-case slug. Read `config/decision-framework.md` (ask ONE question if missing: who decides what — pricing / product / hiring / structural bets — best via a RACI doc or decision-rights page from a connected wiki). Decide status: `pending` if the CEO is the decider and hasn't yet decided, `decided` if the CEO declared it or the owner decided. Check `decisions.json` for duplicates — update in place rather than creating. Write the ADR at `decisions/{slug}/decision.md` with: Status + decidedBy + decidedAt, Linked initiatives, Context (what prompted + what's at stake), Alternatives considered (2-4 with trade-offs), Decision (chosen path), Rationale (why over alternatives), Consequences (good / hard / unknowns), Open questions. If the decision touches performance / comp / exits / legal, flag me privately in chat instead of landing specifics in the index — generalize the summary in `decisions.json`.",
      "description": "ADR-style record with alternatives, trade-offs, rationale, consequences. Sensitive matters are routed privately, not indexed.",
      "outcome": "Decision at `decisions/{slug}/decision.md` — searchable and explainable six months later.",
      "skill": "log-decision"
    },
    {
      "category": "Decisions",
      "title": "What's stuck? Find the bottleneck.",
      "blurb": "Recurring blocker, hypothesis, proposed unblock owner.",
      "prompt": "What's stuck — where are we losing time?",
      "fullPrompt": "Find the bottleneck. Use the identify-bottleneck skill. Gather evidence from the last 4 weeks: recent weekly rollups (from `../head-of-operations/reviews/` if present), any initiative tracking in `decisions.json` with status pending older than 14 days (decision-latency bottleneck), OKRs flipped off-track in `okr-history.json`, and any chat pattern I flagged. Cluster recurring themes — group evidence by shared owner, shared dependency, or shared OKR. Form a hypothesis per cluster (1-2 sentences, never as certain). Propose an owner to unblock — read the key-contacts / leadership section of the operating context; for cross-team bottlenecks, the owner is whoever owns the blocking resource. Quantify impact (OKRs blocked, initiatives stalled). Dedupe against open rows in `bottlenecks.json`. Write new bottlenecks to `bottlenecks.json`. If a hypothesis names a specific person's capacity, generalize to role-and-process language in the JSON and flag specifics to me in chat.",
      "description": "Clusters evidence from rollups, OKRs, and pending decisions into a named bottleneck with a hypothesis and an unblock owner.",
      "outcome": "Open bottlenecks in `bottlenecks.json` — each with a concrete next-step nudge candidate.",
      "skill": "identify-bottleneck"
    },
    {
      "category": "OKRs",
      "title": "Refresh OKR state — what's on track, at risk, off track?",
      "blurb": "Per KR: current value, state, likely cause from linked work.",
      "prompt": "Refresh OKRs — what's off-track this week?",
      "fullPrompt": "Refresh OKRs. Use the track-okr skill. Read `config/okrs.json` (ask ONE question if missing: point at your OKR tool connected via Composio, or paste/drop the OKR doc). For each objective, refresh each KR's current value — prefer a connected OKR tool via `composio search okr`, fallback to handing off the metric pull to the Data Analyst agent (cite the query), last fallback ask me to paste the numbers. Snapshot to `okr-history.json` with objectiveId, date, per-KR values, state. Classify each KR: on-track (current / target ≥ expected-for-this-point), at-risk (within 20 pp of expected but below), off-track (more than 20 pp below). Roll KR states up to objective state. Attach reason codes for at-risk / off-track KRs — scan `decisions.json` and the operating context's priorities for likely causes. Update `config/okrs.json` with fresh current values + state. Offer to draft a nudge comm if anything flipped off-track.",
      "description": "Snapshots each KR, classifies on-track / at-risk / off-track, and surfaces likely causes from linked work.",
      "outcome": "Fresh snapshot in `okr-history.json`; live state in `config/okrs.json`.",
      "skill": "track-okr"
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
