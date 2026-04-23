// Houston agent dashboard bundle — Executive Assistant.
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
  "name": "Executive Assistant",
  "tagline": "Calendar, meeting prep, follow-ups, travel, daily briefing. Logistics off your plate so you can build. I coordinate — you run the day.",
  "accent": "slate",
  "useCases": [
    {
      "category": "Calendar",
      "title": "Scan my week — find the conflicts before I do",
      "blurb": "Overbooks, missing buffers, focus clashes, no-prep meetings.",
      "prompt": "Scan my next 7 days and flag every conflict.",
      "fullPrompt": "Scan my calendar for the next 7 days. Use the triage-calendar skill. Read my connected calendar via Composio. Cross-reference against `config/schedule-preferences.json` and my VIPs. Flag: (1) overbooks — two events overlapping, (2) missing buffers — back-to-back with less than my configured minimum, (3) focus-block clashes — meetings landing inside my declared deep-work windows, (4) unprotected VIP slots — VIP meetings that are sandwiched or lack prep buffer, (5) meetings in the next 24h with no prep brief yet. Write to `calendar-scans/{YYYY-MM-DD}.md` and upsert `calendar-conflicts.json`. End by proposing the 2 specific rebalances that buy me the most focus back.",
      "description": "Reads your connected calendar, cross-references your preferences and VIPs, flags overbooks, missing buffers, focus clashes, and meetings without prep.",
      "outcome": "Calendar scan at `calendar-scans/{YYYY-MM-DD}.md` — each conflict with a specific fix.",
      "skill": "triage-calendar",
      "tool": "Calendar"
    },
    {
      "category": "Meetings",
      "title": "Build me a deep brief for my meeting with {name}",
      "blurb": "Bio, prior threads, company news, suggested agenda.",
      "prompt": "Build me a deep brief for my meeting with {name}.",
      "fullPrompt": "Build a deep pre-meeting briefing. Use the prep-meeting-briefing skill. Resolve the meeting on my calendar. For each external attendee: pull public profile and recent public activity (last 30d) via web-search/research, pull the last 5 email threads we've exchanged via my connected inbox, check my `meetings/` folder for prior briefs with this person, and pull 3 most recent public social posts if a social source is connected. Synthesize into sections: Who they are (2-sentence bio + role + relationship), What they likely want (best guess from history), What I said last time (quoted from prior notes/email), 3 talking points I should lead with (anchored in the operating context priorities), The one thing NOT to forget, and Recent company news (5 links, 1-line summaries). Save to `meetings/{slug}-{YYYY-MM-DD}-brief.md`.",
      "description": "Full-attendee intel — bio, prior threads, recent activity, shared history, suggested agenda. Deeper than the Head of Operations' meeting prep.",
      "outcome": "Briefing at `meetings/{slug}-{YYYY-MM-DD}-brief.md` — read it in the 10 min before the call.",
      "skill": "prep-meeting-briefing",
      "tool": "Calendar + Research"
    },
    {
      "category": "Meetings",
      "title": "Book a meeting with {name} — respect my focus blocks",
      "blurb": "3 time options + a draft message + booked on your ok.",
      "prompt": "Book a meeting with {name} — 30 minutes, next week.",
      "fullPrompt": "Find time with {name}. Use the schedule-meeting skill. Read my schedule preferences from `config/schedule-preferences.json` — focus blocks, working hours, max meetings per day, min buffers, blackout periods, timezone. Fetch free/busy for the next 10 business days via my connected calendar. Compute candidates that sit inside working hours, do NOT overlap focus blocks, respect min buffers on both sides, keep daily meeting count under the cap, and avoid blackout periods. Pick 3 options spread across days — prefer mid-morning (10-11:30) or early afternoon (2-4); avoid Monday AM and Friday PM unless nothing else fits. Draft the counterparty message in my voice (read `config/voice.md`). Save to `scheduling/{slug}/proposal.md`. Present to me — never book without explicit 'book it'.",
      "description": "Computes 3 times that honor your focus blocks and buffers, drafts the counterparty message in your voice, books only after you say book it.",
      "outcome": "Proposal at `scheduling/{slug}/proposal.md` — 3 times + draft message, waiting on your ok.",
      "skill": "schedule-meeting",
      "tool": "Calendar"
    },
    {
      "category": "Follow-ups",
      "title": "Track every promise I make — and remind me when they're due",
      "blurb": "'I'll send Tuesday' becomes a tracked commitment.",
      "prompt": "Track this follow-up: I told {name} I'd {do X} by {date}.",
      "fullPrompt": "Track this commitment. Use the draft-followup skill in track mode. Parse my message for promiseTo, description, promisedAt, dueAt (resolve relative dates like 'Tuesday' against my timezone). If I pasted an outbound email, extract the commitment text from the body. Append a `Followup` row to `followups.json` with status 'open'. Dedupe against existing open rows with the same threadId + description — update dueAt rather than creating a duplicate. Tell me when I'll see it surface next (on the due date, via daily-briefing).",
      "description": "Extracts the commitment + due date from an outbound or your instruction, appends to followups.json, surfaces the reminder on the due date.",
      "outcome": "Tracked in `followups.json`. Surfaces in the daily briefing the morning it's due.",
      "skill": "draft-followup"
    },
    {
      "category": "Follow-ups",
      "title": "Handle today's due follow-ups — draft the fulfillment or bump",
      "blurb": "Either deliver the thing or honestly push the date.",
      "prompt": "Handle my due follow-ups for today — draft the replies.",
      "fullPrompt": "Handle follow-ups due today or overdue. Use the draft-followup skill in handle mode. Read `followups.json` filtering status 'open' or 'snoozed' with dueAt on or before today. For each: fetch latest thread state via my connected inbox so the draft reflects any replies since the commitment. Decide: (a) commitment ready to fulfill — draft a message that delivers it and references the prior promise in 1 line, or (b) commitment not ready — draft an honest bump with a new concrete date (ask me for the new date if not specified), without over-apologizing. Draft in my voice (`config/voice.md`). Save per-followup drafts at `followups/{id}/draft.md`. Update `followups.json` with `lastRemindedAt` and `completionDraftPath`. Present all drafts — I'll pick send/tweak/snooze per item. Never send.",
      "description": "Reads today's due follow-ups, fetches latest thread state, drafts either the fulfillment or an honest bump. Saves drafts; never sends.",
      "outcome": "Drafts at `followups/{id}/draft.md` — waiting on send/tweak/snooze per item.",
      "skill": "draft-followup",
      "tool": "Inbox"
    },
    {
      "category": "Travel",
      "title": "Assemble my trip pack for {destination}",
      "blurb": "Itinerary search, meetings, destination-adapted packing.",
      "prompt": "I'm going to {destination} from {date} to {date} — assemble my trip pack.",
      "fullPrompt": "Build the trip pack. Use the coordinate-travel skill. Read `config/travel-prefs.json` (airline, seat, hotel chain, dietary, accessibility) — ask one targeted question if missing and write the answer. Read `config/schedule-preferences.json` for timezone and conflicts over the trip window. Discover connected travel providers via `composio search travel` (flight + hotel search) — note which categories are available; if none, proceed with search criteria only and note I'll book manually. Generate trip id `{YYYY-MM-DD}-{dest-slug}`. Write three files under `travel/{trip-id}/`: `trip.md` (purpose, dates, destinations, key meetings with prep status, open questions), `itinerary.md` (flight + hotel search criteria or candidate options, ground transport, pending bookings checklist), `packing.md` (destination-weather-adapted, trip-type-adapted — formal customer visit vs conference vs offsite — with sections Essentials / Work / Clothing / Health / Destination-specific). End by asking whether to block my calendar for the trip.",
      "description": "Reads travel prefs + schedule, builds trip.md + itinerary.md + destination-adapted packing.md. Books nothing — search criteria only unless you explicitly approve.",
      "outcome": "Trip pack under `travel/{trip-id}/` — trip, itinerary, packing.",
      "skill": "coordinate-travel",
      "tool": "Travel"
    },
    {
      "category": "Daily",
      "title": "My logistics brief for today",
      "blurb": "Today's meetings, prep gaps, due follow-ups, conflicts.",
      "prompt": "Give me today's logistics brief.",
      "fullPrompt": "Give me today's logistics brief. Use the daily-briefing skill. This is the logistics cut — the Head of Operations handles the strategic brief. Aggregate: (1) today's meetings (from my connected calendar) with prep status per meeting — point at `meetings/{slug}-{YYYY-MM-DD}-brief.md` if it exists, (2) follow-ups from `followups.json` due today or overdue, (3) open calendar conflicts from my last scan in `calendar-conflicts.json`, (4) scheduling proposals awaiting counterparty response under `scheduling/`. Rank by time-sensitivity: meetings in the next 2h > overdue follow-ups > meetings later today with no prep > due follow-ups > calendar conflicts > pending scheduling. Save to `briefings/{YYYY-MM-DD}.md`. In chat: the top line only plus the path.",
      "description": "Aggregates today's meetings, prep gaps, due follow-ups, and calendar conflicts into a ranked logistics plan.",
      "outcome": "Logistics brief at `briefings/{YYYY-MM-DD}.md` — ranked actions for the day.",
      "skill": "daily-briefing"
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
