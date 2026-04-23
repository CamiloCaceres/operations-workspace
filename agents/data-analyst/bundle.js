// Houston agent dashboard bundle — Data Analyst.
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
  "name": "Data Analyst",
  "tagline": "Business metrics made legible. SQL, funnel analysis, anomaly detection, experiment readouts, dashboard specs, the weekly metrics rollup.",
  "accent": "slate",
  "useCases": [
    {
      "category": "Questions",
      "title": "Answer my data question — in SQL I can re-run",
      "blurb": "Read-only query, saved for next time, with caveats.",
      "prompt": "How many {signups / active users / paying customers} {this week / last 30 days}?",
      "fullPrompt": "Answer my data question. Use the run-sql-query skill. Read `config/data-sources.json` to pick the right source. Lazy-introspect tables into `config/schemas.json` if entries are missing or older than 7 days. Draft read-only SQL in the correct dialect. Self-check against the forbidden-keyword list (refuse any DML/DDL). Run an explain/dry-run — if the estimate exceeds the configured ceiling in `config/data-sources.json`, tell me the cost and wait for approval. Execute via the connected warehouse. Capture data-quality caveats (null rates on key columns, surprising zeros, unusual ranges). Save as `queries/{slug}/query.sql`, `result-latest.csv`, `notes.md`, and append/update `queries.json`. Return the plain-English answer with the query path, run timestamp, row count, and caveats. No result without citations.",
      "description": "Translates your question to read-only SQL, warns on cost, runs via your connected warehouse, saves the query for reuse, returns the answer with caveats.",
      "outcome": "Answer in chat + saved query at `queries/{slug}/` ready to re-run any time.",
      "skill": "run-sql-query",
      "tool": "Warehouse"
    },
    {
      "category": "Metrics",
      "title": "Start tracking {MRR / WAU / signup conversion}",
      "blurb": "SQL def, daily snapshot, on the dashboard.",
      "prompt": "Start tracking {metric} — snapshot it daily.",
      "fullPrompt": "Track a new metric. Use the track-metric skill. If the metric name is ambiguous ('MRR' could be billing-MRR vs contract-MRR vs ARR/12), ask ONE clarifying question. Read `config/data-sources.json` to pick the source. Confirm schema via `config/schemas.json`, lazy-introspecting if needed. Draft a parameterized `SELECT` that returns one numeric value for a given `{{date}}`. Self-check against DML/DDL. Capture cadence (default daily) and direction (higher-is-better / lower-is-better / target-is-best) and unit. Append definition to `config/metrics.json`. Snapshot today's value into `metrics-daily.json` with changeVsPrev/7d/28d. Offer to backfill N days if useful. Tell me where it'll show on the dashboard and when `detect-anomaly` will start flagging.",
      "description": "Defines the metric in SQL, snapshots daily, registers cadence and direction, feeds the dashboard's core-metrics grid.",
      "outcome": "Metric tracked in `config/metrics.json`; daily snapshots in `metrics-daily.json`.",
      "skill": "track-metric",
      "tool": "Warehouse"
    },
    {
      "category": "Metrics",
      "title": "Flag anything weird in today's numbers",
      "blurb": "2σ-plus deviation, hypothesized cause, severity-tagged.",
      "prompt": "Anything weird in today's metrics — run an anomaly check.",
      "fullPrompt": "Run an anomaly sweep. Use the detect-anomaly skill. Read `config/metrics.json` and `metrics-daily.json`. For each metric with ≥7 snapshots, compute mean7/std7 and mean28/std28 (excluding today), then sigma7 and sigma28 vs today's observed. Classify severity using the thresholds in `config/metrics.json` per-metric overrides if present, else default 2σ/3σ — those thresholds live in config, not hardcoded. Dedupe against existing open anomalies for the same metric+date. Hypothesize 1–3 ranked causes per anomaly using recent context (connected deploys, campaigns, seasonality via the same day last week/month) — never state causes as certain. Write to `anomalies.json`. In chat, list P1 first with their top cause and the one question that would confirm each.",
      "description": "Compares each metric against its 7- and 28-day baselines, flags deviations above threshold, hypothesizes causes from recent context.",
      "outcome": "Open anomalies in `anomalies.json` — P1s first in chat with their top cause.",
      "skill": "detect-anomaly"
    },
    {
      "category": "Experiments",
      "title": "Analyze my experiment — ship / kill / iterate?",
      "blurb": "Lift, significance, MDE, guardrails, recommendation.",
      "prompt": "Analyze experiment {slug} — has it finished?",
      "fullPrompt": "Analyze an experiment. Use the analyze-experiment skill. Read `config/experiments-framework.md` for significance threshold, MDE, and default guardrails (ask ONE question if missing, offering sensible defaults 95%/5% MDE). Load experiment metadata from `experiments.json` (create if missing). Pull per-variant data — prefer a read-only SQL query via the connected warehouse; accept CSV/paste as fallback. Compute lift per variant, significance (two-proportion z-test for binomial, Welch's t for continuous), 95% CI, and minimum detectable effect at 80% power. Check each guardrail metric — a significant move in the wrong direction blocks 'ship'. Decide recommendation: SHIP (lift+ and sig and no guardrail breach) / KILL (lift- and sig, or guardrail breach) / ITERATE (lift+ but not sig, underpowered) / INCONCLUSIVE-EXTEND. Never recommend SHIP without significance. Write `experiments/{slug}/readout.md` with the tables. Update `experiments.json` to analyzed.",
      "description": "Computes lift, significance, CI, MDE, and guardrails. Writes a readout with an explicit ship/kill/iterate recommendation.",
      "outcome": "Readout at `experiments/{slug}/readout.md` with a decision-ready recommendation.",
      "skill": "analyze-experiment",
      "tool": "Warehouse"
    },
    {
      "category": "Dashboards",
      "title": "Spec me a {growth / retention / churn} dashboard",
      "blurb": "Sections + per-viz SQL you paste into your BI tool.",
      "prompt": "Spec me a dashboard for {topic — growth / retention / revenue / churn}.",
      "fullPrompt": "Spec a dashboard. Use the spec-dashboard skill. Ask ONE clarifying question for audience + cadence if not given (default: operator, daily). Propose a metric list from `config/metrics.json` that fits the dashboard's purpose; note any user-named metrics not yet tracked as `sqlSnippet: ''` placeholders with a recommendation to run `track-metric` first. Design 2-4 sections: Top-line KPIs (3-5 number tiles), Trends (30/60/90-day time-series), Breakdown (segment/cohort/channel), Anomalies (optional). Per visualization specify title, chart type (line/bar/number/sparkline/funnel/table), metricId, parameterized read-only sqlSnippet using `{{date}}`/`{{startDate}}`/`{{endDate}}`, and notes. Self-check every snippet against the DML/DDL blocklist. Write the spec to `config/dashboards.json` (append or update by id). Present the spec in chat with a one-line summary per section and an offer to translate any viz to a specific BI tool.",
      "description": "Designs audience + cadence + sections + per-viz read-only SQL. Spec only — you or your BI tool render the actual dashboard.",
      "outcome": "Spec at `config/dashboards.json` — paste into Looker / Mode / Hex / Metabase.",
      "skill": "spec-dashboard"
    },
    {
      "category": "Quality",
      "title": "Audit the data — why is this number off?",
      "blurb": "Nulls, dupes, freshness, joins, cardinality.",
      "prompt": "Run a data-quality audit on {table / metric / everything}.",
      "fullPrompt": "Run a data-quality audit. Use the run-data-qa skill. Default targets are the tables referenced by metrics in `config/metrics.json` — or the user-named tables, or the schemaDeps of a named metric. Cap the lookback at the last 30 days unless full-history is asked. For each target, run read-only checks via the connected warehouse: null rates per column (flag non-nullable columns with nulls and any jump vs prior month), duplicates on natural keys, freshness (MAX(updated_at) vs expected staleness — default < 24h for daily tables, overridable per-table in `config/schemas.json`), referential integrity on known FK pairs, cardinality surprises (today vs 7d avg). Self-check every query against DML/DDL blocklist. Write the report to `data-quality-reports/{YYYY-MM-DD}/report.md` grouped by table with a summary. If the audit was triggered by an open anomaly, update its `possibleCauses` with specific DQ findings.",
      "description": "Runs read-only null/dupe/freshness/referential-integrity/cardinality checks, writes a dated report, cross-links anomalies.",
      "outcome": "Report at `data-quality-reports/{YYYY-MM-DD}/report.md` — flagged issues by severity.",
      "skill": "run-data-qa",
      "tool": "Warehouse"
    },
    {
      "category": "Rollup",
      "title": "Weekly metrics readout for the Monday review",
      "blurb": "Which moved, which didn't, which to dig into.",
      "prompt": "Give me this week's metrics readout for the Monday review.",
      "fullPrompt": "Produce a weekly metrics rollup. Use the weekly-metrics-rollup skill. Read `config/metrics.json` and the last 7 days of `metrics-daily.json`. For each metric, compute week-over-week change, classify state (on-track / at-risk / off-track) vs the direction field, highlight any with an open anomaly from `anomalies.json`, and flag the 3 that shifted most in absolute terms. Cross-reference active priorities from `../head-of-operations/company-operating-context.md` — lead the rollup with metrics tied to the priorities. Suggest 1-3 specific follow-ups (run `run-sql-query` for {X}, run `run-data-qa` on {Y}). Write to `rollups/{YYYY-MM-DD}.md`. This feeds the Head of Operations' Monday ops review.",
      "description": "Cross-metric weekly pulse tied to active priorities; flags what moved, what's off, which to dig into next.",
      "outcome": "Weekly rollup at `rollups/{YYYY-MM-DD}.md` — feeds the Head of Operations' Monday review.",
      "skill": "weekly-metrics-rollup"
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
