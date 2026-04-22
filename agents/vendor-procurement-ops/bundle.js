// Houston agent dashboard bundle — Vendor & Procurement Ops.
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
  "name": "Vendor & Procurement Ops",
  "tagline": "Contracts, renewals, suppliers, compliance, SaaS spend, vendor outreach. I draft, I track, I recommend — I never sign, send, or move money.",
  "accent": "slate",
  "useCases": [
    {
      "category": "Spend",
      "title": "Audit my SaaS spend — what am I paying for?",
      "blurb": "Subscriptions, duplicates, unused tools, annualized cost.",
      "prompt": "Audit my SaaS spend — what am I paying for and what's duplicative or unused?",
      "fullPrompt": "Audit my SaaS spend. Use the audit-saas-spend skill. Aggregate subscriptions from (1) my contract library in contracts/, (2) recurring charges in my connected billing provider via Composio, and (3) receipts in my connected inbox (search for 'receipt', 'subscription', 'payment confirmed' in the last 90 days). Produce: total annualized spend, list per subscription with amount + renewal date, duplicates or overlapping tools (two calendars? three password managers?), tools with no activity in 60+ days, and the top 3 cancel candidates with rationale. Save to spend/{YYYY-MM-DD}-audit.md.",
      "description": "Aggregates subscriptions from your contracts, billing provider, and inbox receipts. Flags duplicates, unused tools, and cancel candidates.",
      "outcome": "Spend audit at spend/{YYYY-MM-DD}-audit.md with annualized total and cancel candidates.",
      "skill": "audit-saas-spend"
    },
    {
      "category": "Contracts",
      "title": "Pull key clauses from this contract",
      "blurb": "Liability, termination, auto-renew, IP, SLA — extracted.",
      "prompt": "Pull the {clauses} from this contract.",
      "fullPrompt": "Extract clauses from this contract. Use the extract-contract-clauses skill. I'll provide the file or a link. Pull: liability cap, termination (for-cause + for-convenience), auto-renewal language + notice window, payment terms, IP ownership, data handling / DPA, SLA, exclusivity or non-compete. For each clause: quote the relevant text verbatim, then give a 1-line plain-language summary and a 1-line flag if anything is unusual or unfavorable. Save to contracts/{vendor-slug}-{YYYY-MM-DD}.md and add the vendor + renewal date to renewals/calendar.md.",
      "description": "Parses a contract file, extracts standard clauses with verbatim quotes + plain-language summaries + flags on unfavorable terms.",
      "outcome": "Clause extraction at contracts/{vendor-slug}-{YYYY-MM-DD}.md plus renewal calendar updated.",
      "skill": "extract-contract-clauses"
    },
    {
      "category": "Contracts",
      "title": "Build my renewal calendar",
      "blurb": "Every contract's renewal date, with lead-time flags.",
      "prompt": "Build my renewal calendar — what's renewing in the next 90 days?",
      "fullPrompt": "Build the renewal calendar. Use the track-renewals skill. Scan every file in contracts/ and any contract-flavored attachments I point you to (PDFs in a folder via connected drive). Extract renewal dates, notice windows, and auto-renew language. Produce a living renewals/calendar.md ordered by next renewal, with lead-time tier per entry (90 / 60 / 30 / 7 days). Also produce a 90-day digest at renewals/{YYYY-QN}-digest.md with: upcoming renewals, those where notice is already due to cancel, and the 2-3 I should negotiate before auto-renew triggers.",
      "description": "Scans contracts/ and connected drives for contract PDFs, extracts renewal dates and notice windows, maintains a living calendar with lead-time flags.",
      "outcome": "Living renewal calendar at renewals/calendar.md + quarterly digest.",
      "skill": "track-renewals"
    },
    {
      "category": "Suppliers",
      "title": "Evaluate this supplier against our rubric",
      "blurb": "Score 1–10, risk tier, strengths, concerns, recommendation.",
      "prompt": "Evaluate {supplier} for {product / service} — is this a fit?",
      "fullPrompt": "Evaluate this supplier. Use the evaluate-supplier skill. I'll provide the supplier name + product/service context. Gather: public profile, references if any in my inbox, compliance footprint (frameworks, incidents) via research, pricing posture if discoverable. Score against our rubric in `config/supplier-rubric.md` (or the default: fit, quality signals, reference quality, risk signals, friction-to-start). Produce: quality score 1-10, risk tier (green/yellow/red), strengths, concerns, specific questions for first call, recommendation. Save to suppliers/{supplier-slug}.md.",
      "description": "Supplier due-diligence with rubric-based scoring, risk tier assignment, and first-call questions.",
      "outcome": "Supplier evaluation at suppliers/{supplier-slug}.md with score, risk tier, and questions.",
      "skill": "evaluate-supplier"
    },
    {
      "category": "Suppliers",
      "title": "Compliance due-diligence on a vendor",
      "blurb": "Frameworks, CCO, public incidents, cited.",
      "prompt": "Run compliance due-diligence on {vendor} before we sign.",
      "fullPrompt": "Research this vendor's compliance footprint. Use the research-compliance skill. I'll provide the company name. Find: compliance frameworks held or claimed (SOC2, ISO 27001, HIPAA, GDPR, etc.), named Chief Compliance / Security Officer with LinkedIn link, public compliance incidents in the last 3 years (breaches, violations, regulatory actions), and any gaps between what they claim and what's independently verifiable. Cite every claim with a source URL. Save to compliance/{company-slug}.md.",
      "description": "Public-source compliance research: frameworks held, named officers, recent incidents. Every claim cited.",
      "outcome": "Compliance brief at compliance/{company-slug}.md — decision-ready.",
      "skill": "research-compliance"
    },
    {
      "category": "Outreach",
      "title": "Draft a vendor outreach — save as draft, don't send",
      "blurb": "Negotiation, cancel, or trial — written in your voice.",
      "prompt": "Draft {a renewal-negotiation email / cancel email / trial request} to {vendor}. Don't send.",
      "fullPrompt": "Draft this vendor outreach. Use the draft-vendor-outreach skill. I'll provide the vendor + purpose (negotiate renewal, cancel, request trial, reference request). Read the vendor's file in contracts/ if present (terms, renewal date, signers). Read `../head-of-operations/config/voice.md` for voice. Read `../head-of-operations/company-operating-context.md` for vendor posture. Draft the email with placeholders for anything I need to confirm (specific numbers, dates). Save the draft in my connected email provider as a draft (never send). Save a human-readable record at outreach/{vendor}-{topic}-{YYYY-MM-DD}.md.",
      "description": "Draft renewal negotiations, cancel emails, or trial requests in your voice. Grounded in contract terms and vendor posture. Saved as drafts.",
      "outcome": "Draft in your email provider (saved, never sent) + record at outreach/{vendor}-{topic}-{YYYY-MM-DD}.md.",
      "skill": "draft-vendor-outreach"
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
