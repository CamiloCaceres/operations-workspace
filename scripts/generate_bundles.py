#!/usr/bin/env python3
"""Generate bundle.js per agent from the template + houston.json useCases."""
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BASE = REPO / "agents"
TEMPLATE = (Path(__file__).resolve().parent / "bundle_template.js").read_text()

# One accent shared across the whole workspace — the operations vertical
# reads as one product. Monochrome + slate-900 tile surface; the accent
# field is retained for template compatibility.
ACCENTS = {
    "head-of-operations": "slate",
    "vendor-procurement-ops": "slate",
    "executive-assistant": "slate",
    "data-analyst": "slate",
    "chief-of-staff": "slate",
}

TAGLINES = {
    "head-of-operations": "Chief of Staff for a solo-founder stack. Morning brief, meeting prep, inbox triage, the Monday ops review. I own the operating-context doc every other agent reads.",
    "vendor-procurement-ops": "Contracts, renewals, suppliers, compliance, SaaS spend, vendor outreach. I draft, I track, I recommend — I never sign, send, or move money.",
    "executive-assistant": "Calendar, meeting prep, follow-ups, travel, daily briefing. Logistics off your plate so you can build. I coordinate — you run the day.",
    "data-analyst": "Business metrics made legible. SQL, funnel analysis, anomaly detection, experiment readouts, dashboard specs, the weekly metrics rollup.",
    "chief-of-staff": "Board packs, investor updates, decision logs, OKR tracking, bottleneck hunts. The strategic narrative work you'd otherwise do at midnight.",
}


def build_for(agent_id: str) -> tuple[str, int]:
    agent_dir = BASE / agent_id
    houston_json = json.loads((agent_dir / "houston.json").read_text())

    agent_config = {
        "name": houston_json["name"],
        "tagline": TAGLINES[agent_id],
        "accent": ACCENTS[agent_id],
        "useCases": houston_json.get("useCases", []),
    }

    # Inject as a JS object literal. json.dumps produces valid JS for our values
    # (strings, numbers, arrays, plain objects with string keys — no functions or undefined).
    injected = json.dumps(agent_config, indent=2, ensure_ascii=False)
    injected_js = injected

    bundle_source = TEMPLATE.replace("{{AGENT_NAME}}", houston_json["name"])
    bundle_source = bundle_source.replace("{{AGENT_CONFIG}}", injected_js)

    target = agent_dir / "bundle.js"
    target.write_text(bundle_source)
    return str(target), len(bundle_source)


def verify(agent_id: str) -> bool:
    agent_dir = BASE / agent_id
    node_check = (
        "global.window={Houston:{React:{createElement:()=>null,"
        "useState:()=>[{idx:null,at:0},()=>{}],"
        "useEffect:()=>{},useCallback:f=>f}}};"
        "eval(require('fs').readFileSync('bundle.js','utf8'));"
        "console.log(Object.keys(window.__houston_bundle__));"
    )
    result = subprocess.run(
        ["node", "-e", node_check],
        cwd=agent_dir,
        capture_output=True,
        text=True,
    )
    ok = result.returncode == 0 and "Dashboard" in result.stdout
    status = "OK" if ok else "FAIL"
    print(f"  {status}  {result.stdout.strip() or result.stderr.strip()[:200]}")
    return ok


print("=== Generating bundle.js per agent ===")
all_ok = True
for agent_id in ACCENTS:
    path, size = build_for(agent_id)
    print(f"\n{agent_id}: wrote {size:,} bytes")
    if not verify(agent_id):
        all_ok = False

print("\n=== Summary ===")
print("All bundles verified." if all_ok else "SOME BUNDLES FAILED VERIFICATION.")
sys.exit(0 if all_ok else 1)
